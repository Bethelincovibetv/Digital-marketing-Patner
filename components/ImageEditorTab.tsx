import React, { useState, useRef } from 'react';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { Alert } from './ui/Alert.tsx';
import { Card } from './ui/Card.tsx';
import { generateThumbnail } from '../services/geminiService.ts';
// Fix: Use AppStatus from types.ts as PostStatus is not defined.
import type { AppStatus } from '../types.ts';

// Fix: Define props interface for ImagePreview to avoid potential TS inference issues.
interface ImagePreviewProps {
    src: string | null;
    // Fix: Made children optional to fix TS error.
    children?: React.ReactNode;
    isLoading?: boolean;
}

const ImagePreview = ({ src, children, isLoading = false }: ImagePreviewProps) => (
    <div className="bg-black/30 rounded-xl p-2 border border-gray-700 relative aspect-video flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {src ? (
            <img 
                src={src} 
                alt="preview" 
                className="rounded-lg w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
            />
        ) : (
            <div className="text-center text-gray-500 z-10 flex flex-col items-center">
                {children}
            </div>
        )}
        {isLoading && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 rounded-xl animate-pulse-fast z-20">
                 <svg className="w-10 h-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <p className="text-indigo-300">Generating...</p>
            </div>
        )}
    </div>
);

export const ThumbnailGeneratorTab: React.FC = () => {
    const [title, setTitle] = useState('');
    const [style, setStyle] = useState('Tech');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
    const [status, setStatus] = useState<AppStatus>({ type: 'idle', message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setGeneratedThumbnail(null);
                 setStatus({ type: 'idle', message: '' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateThumbnail = async () => {
        if (!originalImage || !title) {
            setStatus({ type: 'error', message: 'Please upload an image and provide a title.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Generating thumbnail with AI...' });
        setGeneratedThumbnail(null);
        try {
            const result = await generateThumbnail(originalImage, title, style);
            setGeneratedThumbnail(result);
            setStatus({ type: 'success', message: 'Thumbnail generated successfully!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: `Generation failed: ${error.message}` });
        }
    };

    return (
        <div className="space-y-8">
            <div className="p-px bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
                <Card className="border-none bg-gray-900/80 backdrop-blur-sm rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-xl font-semibold text-white">1. Upload Image & Add Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Your Photo</label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full">
                                    {originalImage ? 'Change Image' : 'Upload Image'}
                                </Button>
                            </div>
                            <Select id="style" label="Video Style" value={style} onChange={e => setStyle(e.target.value)}>
                                <option>Tech</option>
                                <option>Gaming</option>
                                <option>Vlog</option>
                                <option>Educational</option>
                                <option>Comedy</option>
                                <option>Lifestyle</option>
                            </Select>
                        </div>
                        <Input
                            id="thumbnail-title"
                            label="Thumbnail Title / Caption"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., My Insane New Setup"
                        />
                        
                        <div className="pt-2">
                            <Button onClick={handleGenerateThumbnail} isLoading={status.type === 'loading'} disabled={!originalImage || !title}>
                                Generate Thumbnail
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {status.type !== 'idle' && status.type !== 'loading' && <Alert type={status.type} message={status.message} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white text-center">Original Image</h3>
                     <ImagePreview src={originalImage}>
                        <svg className="w-12 h-12 text-gray-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <p>Upload an image to begin</p>
                    </ImagePreview>
                </div>
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-white text-center">Generated Thumbnail</h3>
                    <ImagePreview src={generatedThumbnail} isLoading={status.type === 'loading'}>
                        <svg className="w-12 h-12 text-gray-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                        </svg>
                        <p>Your new thumbnail will appear here</p>
                    </ImagePreview>
                     {generatedThumbnail && (
                        <a href={generatedThumbnail} download="ai-thumbnail.png" className="block">
                           <Button variant='secondary' className="w-full">Download Thumbnail</Button>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};