import React, { useState, useEffect, useCallback } from 'react';
import type { WordPressCredentials, PostStatus } from '../types.ts';
import { testConnection } from '../services/wordpressService.ts';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Alert } from './ui/Alert.tsx';
import { Card } from './ui/Card.tsx';

interface SetupTabProps {
  onCredentialsSet: (creds: WordPressCredentials | null) => void;
}

export const SetupTab: React.FC<SetupTabProps> = ({ onCredentialsSet }) => {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<PostStatus>({ type: 'idle', message: '' });
  const [showInstructions, setShowInstructions] = useState(false);

  const loadCredentials = useCallback(() => {
    const savedCreds = localStorage.getItem('wp_credentials');
    if (savedCreds) {
      const creds: WordPressCredentials = JSON.parse(savedCreds);
      setUrl(creds.url);
      setUsername(creds.username);
      setPassword(creds.password);
      onCredentialsSet(creds);
    }
  }, [onCredentialsSet]);

  useEffect(() => {
    loadCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTestConnection = async () => {
    setStatus({ type: 'loading', message: 'Testing connection...' });
    const creds = { url, username, password };
    try {
      await testConnection(creds);
      setStatus({ type: 'success', message: 'Connection successful! Credentials saved.' });
      localStorage.setItem('wp_credentials', JSON.stringify(creds));
      onCredentialsSet(creds);
    } catch (error: any) {
      setStatus({ type: 'error', message: `Connection failed: ${error.message}` });
      localStorage.removeItem('wp_credentials');
      onCredentialsSet(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">WordPress Site Configuration</h2>
          <p className="text-gray-400">
            Enter your WordPress site details to connect your account. These will be stored securely in your browser's local storage.
          </p>
          <Input id="wp-url" label="WordPress Site URL" type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Input id="wp-username" label="WordPress Username" type="text" placeholder="your_username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <div>
            <Input id="wp-password" label="Application Password" type="password" placeholder="xxxx xxxx xxxx xxxx" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={() => setShowInstructions(!showInstructions)} className="text-sm text-indigo-400 hover:text-indigo-300 mt-2">
              {showInstructions ? 'Hide' : 'Show'} instructions for Application Passwords
            </button>
          </div>
        </div>
      </Card>
      
      {showInstructions && (
        <Card>
          <div className="prose prose-invert prose-sm text-gray-300">
            <h3 className="text-white">How to get an Application Password:</h3>
            <ol>
              <li>Log in to your WordPress admin dashboard.</li>
              <li>Go to <strong>Users &rarr; Profile</strong>.</li>
              <li>Scroll down to the "Application Passwords" section.</li>
              <li>Enter a name for your new password (e.g., "AI Autoblogger") and click "Add New Application Password".</li>
              <li>A new password will be generated. <strong>Copy this password immediately.</strong> You will not be able to see it again.</li>
              <li>Paste the password into the field above.</li>
            </ol>
            <p>Application passwords are more secure than using your main password as they can be individually revoked.</p>
          </div>
        </Card>
      )}

      {status.type !== 'idle' && <Alert type={status.type === 'loading' ? 'info' : status.type} message={status.message} />}

      <div className="flex justify-end">
        <Button onClick={handleTestConnection} isLoading={status.type === 'loading'} disabled={!url || !username || !password}>
          Test & Save Connection
        </Button>
      </div>
    </div>
  );
};