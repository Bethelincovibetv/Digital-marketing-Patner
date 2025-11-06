
import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { Card } from './ui/Card';
import { editImage } from '../services/geminiService';
import type { PostStatus } from '../types';

export const ImageEditorTab: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [status, setStatus] = useState<PostStatus>({ type: 'idle', message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setEditedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateEdit = async () => {
        if (!originalImage || !prompt) {
            setStatus({ type: 'error', message: 'Please upload an image and provide an editing prompt.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Applying edits with AI...' });
        setEditedImage(null);
        try {
            const result = await editImage(originalImage, prompt);
            setEditedImage(result);
            setStatus({ type: 'success', message: 'Image edited successfully!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: `Editing failed: ${error.message}` });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">AI Image Editor</h2>
                    <p className="text-gray-400">
                        Upload an image and use a text prompt to describe the changes you want to make.
                    </p>
                    <Input
                        id="edit-prompt"
                        label="Editing Prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Add a retro filter, make the sky look like a sunset"
                    />
                    <div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                        <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                            {originalImage ? 'Change Image' : 'Upload Image'}
                        </Button>
                    </div>
                    <Button onClick={handleGenerateEdit} isLoading={status.type === 'loading'} disabled={!originalImage || !prompt}>
                        Generate Edit
                    </Button>
                </div>
            </Card>

            {status.type !== 'idle' && <Alert type={status.type === 'loading' ? 'info' : status.type} message={status.message} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 text-center">Original Image</h3>
                    {originalImage ? (
                        <img src={originalImage} alt="Original" className="rounded-lg w-full h-auto object-contain max-h-96" />
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-700/50 rounded-lg">
                            <p className="text-gray-500">Upload an image to begin</p>
                        </div>
                    )}
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 text-center">Edited Image</h3>
                    {status.type === 'loading' && (
                         <div className="flex items-center justify-center h-64 bg-gray-700/50 rounded-lg animate-pulse-fast">
                            <p className="text-gray-500">Generating...</p>
                        </div>
                    )}
                    {editedImage && (
                        <div className="space-y-4">
                            <img src={editedImage} alt="Edited" className="rounded-lg w-full h-auto object-contain max-h-96" />
                            <a href={editedImage} download="edited-image.png">
                               <Button variant='secondary'>Download Image</Button>
                            </a>
                        </div>
                    )}
                     {!editedImage && status.type !== 'loading' && (
                         <div className="flex items-center justify-center h-64 bg-gray-700/50 rounded-lg">
                            <p className="text-gray-500">Edited image will appear here</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
