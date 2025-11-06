import React, { useState } from 'react';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { Alert } from './ui/Alert.tsx';
import { Card } from './ui/Card.tsx';
import { generateImage } from '../services/geminiService.ts';
import type { PostStatus } from '../types.ts';

export const ImageGeneratorTab: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [status, setStatus] = useState<PostStatus>({ type: 'idle', message: '' });

    const handleGenerateImage = async () => {
        if (!prompt) {
            setStatus({ type: 'error', message: 'Please provide a prompt.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Generating image with Imagen...' });
        setGeneratedImage(null);
        try {
            const result = await generateImage(prompt, aspectRatio);
            setGeneratedImage(result);
            setStatus({ type: 'success', message: 'Image generated successfully!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: `Image generation failed: ${error.message}` });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">AI Image Generator</h2>
                    <p className="text-gray-400">
                        Describe the image you want to create. Be as detailed as possible for the best results.
                    </p>
                    <Input
                        id="generate-prompt"
                        label="Image Prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A photorealistic image of an astronaut riding a horse on Mars"
                    />
                    <Select id="aspect-ratio" label="Aspect Ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}>
                        <option value="1:1">Square (1:1)</option>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="9:16">Portrait (9:16)</option>
                        <option value="4:3">Standard (4:3)</option>
                        <option value="3:4">Tall (3:4)</option>
                    </Select>

                    <Button onClick={handleGenerateImage} isLoading={status.type === 'loading'} disabled={!prompt}>
                        Generate Image
                    </Button>
                </div>
            </Card>

            <div className="space-y-6">
                 <Card>
                    <h2 className="text-xl font-semibold text-white mb-4">Generated Image</h2>
                    {status.type !== 'idle' && !generatedImage && <div className="mb-4"><Alert type={status.type === 'loading' ? 'info' : status.type} message={status.message} /></div>}

                    <div className="flex items-center justify-center bg-gray-900/50 rounded-lg min-h-[300px] p-4">
                        {status.type === 'loading' && (
                             <div className="flex items-center justify-center w-full h-full animate-pulse-fast">
                                <p className="text-gray-500">Generating...</p>
                            </div>
                        )}
                        {generatedImage && (
                             <div className="space-y-4 text-center">
                                <img src={generatedImage} alt="Generated" className="rounded-lg max-w-full h-auto max-h-96" />
                                <a href={generatedImage} download="generated-image.png">
                                   <Button variant='secondary'>Download Image</Button>
                                </a>
                            </div>
                        )}
                        {!generatedImage && status.type !== 'loading' && (
                             <p className="text-gray-500">Your generated image will appear here.</p>
                        )}
                    </div>
                 </Card>
            </div>
        </div>
    );
};