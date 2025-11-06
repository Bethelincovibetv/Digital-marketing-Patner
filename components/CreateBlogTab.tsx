import React, { useState } from 'react';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { Alert } from './ui/Alert.tsx';
import { Card } from './ui/Card.tsx';
import { generateBlogPost, generateFeaturedImage } from '../services/geminiService.ts';
import { postArticle } from '../services/wordpressService.ts';
import type { AppStatus, GeneratedPost, WordPressCredentials } from '../types.ts';

const CREDENTIALS_KEY = 'wp_credentials';

export const CreateBlogTab: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [status, setStatus] = useState<AppStatus>({ type: 'idle', message: '' });
    const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);

    const handleGenerate = async () => {
        if (!topic) {
            setStatus({ type: 'error', message: 'Please enter a blog post topic.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Generating post with AI... This can take a moment.' });
        setGeneratedPost(null);

        try {
            const [postContent, featuredImage] = await Promise.all([
                generateBlogPost(topic),
                generateFeaturedImage(topic)
            ]);

            setGeneratedPost({
                title: postContent.title,
                content: postContent.content,
                imageBase64: featuredImage
            });
            setStatus({ type: 'success', message: 'AI post generated! Review and post to WordPress.' });

        } catch (error: any) {
            setStatus({ type: 'error', message: `Generation failed: ${error.message}` });
        }
    };
    
    const handlePostToWordPress = async () => {
        const storedCreds = localStorage.getItem(CREDENTIALS_KEY);
        if (!storedCreds) {
            setStatus({ type: 'error', message: 'WordPress credentials not found. Please set them up in the Setup tab.' });
            return;
        }
        if (!generatedPost) {
            setStatus({ type: 'error', message: 'No generated post to publish.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Publishing post to WordPress...' });
        
        try {
            const creds: WordPressCredentials = JSON.parse(storedCreds);
            const result = await postArticle(creds, generatedPost.title, generatedPost.content, generatedPost.imageBase64);
            setStatus({ type: 'success', message: `Post published successfully! <a href="${result.link}" target="_blank" rel="noopener noreferrer" class="font-bold underline hover:text-white">View Post</a>` });
        } catch (error: any) {
             setStatus({ type: 'error', message: `Failed to post: ${error.message}` });
        }
    };
    
    return (
        <div className="space-y-8">
            <Card>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Enter Your Blog Topic</h2>
                    <p className="text-sm text-gray-400">Provide a topic, keyword, or title idea. The AI will generate a full blog post and a featured image based on your input.</p>
                    <Input
                        id="topic"
                        label="Blog Post Topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., The Future of Renewable Energy"
                        disabled={status.type === 'loading'}
                    />
                    <div className="pt-2">
                        <Button onClick={handleGenerate} isLoading={status.type === 'loading' && !generatedPost} disabled={status.type === 'loading'}>
                            Generate AI Post
                        </Button>
                    </div>
                </div>
            </Card>

            {status.type !== 'idle' && (
                <Alert 
                    type={status.type} 
                    message={status.message}
                />
            )}

            {status.type === 'loading' && !generatedPost && (
                 <Card className="text-center animate-pulse-fast">
                    <p className="text-lg text-indigo-300">Generating content and image...</p>
                    <p className="text-sm text-gray-400">This might take up to a minute.</p>
                </Card>
            )}

            {generatedPost && (
                 <div className="p-px bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl">
                    <Card className="border-none bg-gray-900/80 backdrop-blur-sm">
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white">2. Review & Publish</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                     <Input
                                        id="post-title"
                                        label="Generated Title"
                                        value={generatedPost.title}
                                        onChange={(e) => setGeneratedPost(p => p ? {...p, title: e.target.value} : null)}
                                    />
                                     <Textarea
                                        id="post-content"
                                        label="Generated Content (Markdown)"
                                        value={generatedPost.content}
                                        onChange={(e) => setGeneratedPost(p => p ? {...p, content: e.target.value} : null)}
                                        rows={20}
                                     />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="block text-sm font-medium text-gray-300 mb-1">Generated Image</h3>
                                    <div className="aspect-video bg-black/30 rounded-lg overflow-hidden border border-gray-700">
                                         <img src={generatedPost.imageBase64} alt="Generated featured image" className="w-full h-full object-cover" />
                                    </div>
                                    <Button onClick={handlePostToWordPress} isLoading={status.type === 'loading' && !!generatedPost}>
                                        Publish to WordPress
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};