import React, { useState, useRef } from 'react';
import type { WordPressCredentials, PostStatus } from '../types.ts';
import { generateBlogPost, generateSpeech } from '../services/geminiService.ts';
import { publishPost } from '../services/wordpressService.ts';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { Alert } from './ui/Alert.tsx';
import { Card } from './ui/Card.tsx';

interface CreateBlogTabProps {
  credentials: WordPressCredentials | null;
}

interface BlogPost {
  title: string;
  content: string;
}

export const CreateBlogTab: React.FC<CreateBlogTabProps> = ({ credentials }) => {
  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [length, setLength] = useState('medium');
  const [tone, setTone] = useState('professional');
  const [customInstructions, setCustomInstructions] = useState('');

  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);
  const [generationStatus, setGenerationStatus] = useState<PostStatus>({ type: 'idle', message: '' });
  const [publishStatus, setPublishStatus] = useState<PostStatus>({ type: 'idle', message: '' });
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGenerate = async () => {
    setGenerationStatus({ type: 'loading', message: 'Generating blog post with Gemini...' });
    setGeneratedPost(null);
    setPublishStatus({ type: 'idle', message: '' });

    try {
      const post = await generateBlogPost(topic, keyword, length, tone, customInstructions);
      setGeneratedPost(post);
      setGenerationStatus({ type: 'success', message: 'Blog post generated successfully!' });
    } catch (error: any) {
      setGenerationStatus({ type: 'error', message: `Generation failed: ${error.message}` });
    }
  };

  const handlePublish = async () => {
    if (!credentials || !generatedPost) {
      setPublishStatus({ type: 'error', message: 'Missing credentials or generated content.' });
      return;
    }
    setPublishStatus({ type: 'loading', message: 'Publishing to WordPress...' });
    try {
      const postUrl = await publishPost(credentials, generatedPost.title, generatedPost.content);
      setPublishStatus({ type: 'success', message: `Successfully published! View post: ${postUrl}` });
    } catch (error: any) {
      setPublishStatus({ type: 'error', message: `Publishing failed: ${error.message}` });
    }
  };

  const handleTextToSpeech = async () => {
    if (!generatedPost) return;
    
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }
    if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
    }

    setTtsStatus('loading');
    try {
        const plainText = generatedPost.content.replace(/<[^>]*>?/gm, ' ');
        const audioBuffer = await generateSpeech(plainText);

        // FIX: Cast window to any to access webkitAudioContext for older browser compatibility.
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContext();
        audioContextRef.current = context;

        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.onended = () => {
            setTtsStatus('idle');
            audioSourceRef.current = null;
        };
        source.start(0);
        audioSourceRef.current = source;
        setTtsStatus('playing');
    } catch (error) {
        console.error("TTS Error:", error);
        setTtsStatus('error');
    }
  };

  if (!credentials) {
    return <Alert type="info" message="Please configure your WordPress credentials in the Setup tab first." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">1. Define Your Blog Post</h2>
          <Input id="topic" label="Blog Topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., The Future of Renewable Energy" />
          <Input id="keyword" label="Primary SEO Keyword" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g., solar power innovation" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select id="length" label="Blog Length" value={length} onChange={e => setLength(e.target.value)}>
              <option value="short">Short (~300 words)</option>
              <option value="medium">Medium (~800 words)</option>
              <option value="long">Long (~1500 words)</option>
            </Select>
            <Select id="tone" label="Writing Tone" value={tone} onChange={e => setTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="authoritative">Authoritative</option>
            </Select>
          </div>
          <Textarea id="instructions" label="Custom Instructions (Optional)" value={customInstructions} onChange={e => setCustomInstructions(e.target.value)} rows={4} placeholder="e.g., Include a section about battery storage. Mention Tesla." />
          <div className="pt-2">
            <Button onClick={handleGenerate} isLoading={generationStatus.type === 'loading'} disabled={!topic || !keyword}>
              Generate Blog Post
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="space-y-6">
        <Card>
            <h2 className="text-xl font-semibold text-white mb-4">2. Preview & Publish</h2>
            {generationStatus.type !== 'idle' && <div className="mb-4"><Alert type={generationStatus.type === 'loading' ? 'info' : generationStatus.type} message={generationStatus.message} /></div>}
            
            {generatedPost ? (
                <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-[60vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-indigo-300 mb-4">{generatedPost.title}</h3>
                        <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: generatedPost.content }} />
                    </div>
                     <div className="flex flex-wrap gap-4">
                        <Button onClick={handlePublish} isLoading={publishStatus.type === 'loading'}>
                            Publish to WordPress
                        </Button>
                        <Button onClick={handleTextToSpeech} isLoading={ttsStatus === 'loading'} variant="secondary">
                            {ttsStatus === 'playing' ? 'Playing...' : 'Read Aloud'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>Generated content will appear here.</p>
                </div>
            )}
            
        </Card>
        {publishStatus.type !== 'idle' && <Alert type={publishStatus.type} message={publishStatus.message} />}
        {ttsStatus === 'error' && <Alert type="error" message="Failed to generate audio."/>}
      </div>
    </div>
  );
};