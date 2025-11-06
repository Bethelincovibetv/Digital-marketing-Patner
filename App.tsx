import React from 'react';
import { ThumbnailGeneratorTab } from './components/ImageEditorTab.tsx';

const App: React.FC = () => {
  if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl shadow-red-500/10 border border-red-700 p-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="mt-4 text-3xl font-bold text-red-300">Configuration Error</h1>
            <p className="mt-2 text-lg text-gray-300">
              Gemini API key is not configured.
            </p>
          </div>
          <div className="mt-6 text-gray-400 space-y-4">
             <p>
              This application requires a Google Gemini API key to function. It is designed to be deployed in an environment where the API key is securely provided as an environment variable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(79,70,229,0.2)_0%,rgba(79,70,229,0)_50%),radial-gradient(circle_at_75%_75%,rgba(124,58,237,0.2)_0%,rgba(124,58,237,0)_50%)]"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            AI YouTube Thumbnail Generator
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Create click-worthy thumbnails from your images in seconds.
          </p>
        </header>

        <main>
          <ThumbnailGeneratorTab />
        </main>
      </div>
    </div>
  );
};

export default App;