import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Alert } from './ui/Alert.tsx';
import { Card } from './ui/Card.tsx';
import type { WordPressCredentials } from '../types.ts';

const CREDENTIALS_KEY = 'wp_credentials';

export const SetupTab: React.FC = () => {
    const [creds, setCreds] = useState<WordPressCredentials>({ url: '', username: '', password: '' });
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const storedCreds = localStorage.getItem(CREDENTIALS_KEY);
        if (storedCreds) {
            const parsedCreds = JSON.parse(storedCreds);
            // Ensure password is not displayed if it exists
            setCreds({ ...parsedCreds, password: '' });
        }
    }, []);

    const handleSave = () => {
        if (!creds.url || !creds.username || !creds.password) {
            setStatus({ type: 'error', message: 'All fields are required.' });
            return;
        }

        try {
            // Validate URL
            const formattedUrl = new URL(creds.url).origin;
            const credsToStore = { url: formattedUrl, username: creds.username, password: creds.password };
            
            localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credsToStore));
            setStatus({ type: 'success', message: 'Credentials saved successfully!' });
            setCreds(prev => ({ ...prev, password: '' })); // Clear password field after save
        } catch (error) {
            setStatus({ type: 'error', message: 'Invalid URL format. Please enter a valid website URL.' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCreds(prev => ({ ...prev, [id]: value }));
        if (status) setStatus(null);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">WordPress Connection Setup</h2>
                    <p className="text-gray-400">
                        Enter your WordPress site details below. Your credentials are saved securely in your browser's local storage and are never sent anywhere else except directly to your site.
                    </p>
                    
                    <Input
                        id="url"
                        label="WordPress Site URL"
                        type="url"
                        value={creds.url}
                        onChange={handleChange}
                        placeholder="https://your-blog.com"
                    />
                    <Input
                        id="username"
                        label="WordPress Username"
                        type="text"
                        value={creds.username}
                        onChange={handleChange}
                        placeholder="your_wp_admin_user"
                    />
                    <Input
                        id="password"
                        label="WordPress Application Password"
                        type="password"
                        value={creds.password}
                        onChange={handleChange}
                        placeholder="Enter your application password"
                    />
                    
                    <div className="pt-2">
                        <Button onClick={handleSave}>Save Credentials</Button>
                    </div>

                    {status && <div className="pt-4"><Alert type={status.type} message={status.message} /></div>}
                </div>
            </Card>

            <Card>
                 <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">How to get an Application Password</h3>
                    <ol className="list-decimal list-inside text-gray-400 space-y-2 text-sm">
                        <li>Log in to your WordPress admin dashboard.</li>
                        <li>Go to <span className="font-mono bg-gray-700/50 p-1 rounded">Users &rarr; Profile</span>.</li>
                        <li>Scroll down to the "Application Passwords" section.</li>
                        <li>Enter a name for the application (e.g., "AI Autoblogger") and click "Add New Application Password".</li>
                        <li>Copy the generated password immediately. It will not be shown again.</li>
                        <li>Paste the password in the field above.</li>
                    </ol>
                    <p className="text-xs text-gray-500 pt-2">
                        Note: You may need to install a plugin to enable the REST API if you're using a plain WordPress installation.
                    </p>
                 </div>
            </Card>
        </div>
    );
};