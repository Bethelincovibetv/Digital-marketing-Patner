import React, { useState } from 'react';
import { SetupTab } from './components/SetupTab.tsx';
import { CreateBlogTab } from './components/CreateBlogTab.tsx';
import { ManagePostsTab } from './components/ManagePostsTab.tsx';
import { ImageEditorTab } from './components/ImageEditorTab.tsx';
import { ImageGeneratorTab } from './components/ImageGeneratorTab.tsx';
import type { WordPressCredentials } from './types.ts';
import { TABS } from './constants.ts';

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
            <p>
              If you are seeing this page after deploying to a platform like <strong>Netlify</strong> or <strong>Vercel</strong>, you need to ensure the <code>API_KEY</code> environment variable is set in your project's settings and made available to your client-side code.
            </p>
          </div>
          <div className="mt-6 text-left bg-gray-900/70 p-4 rounded-lg border border-gray-700">
            <p className="font-semibold text-gray-300 mb-2">For Static Hosts (like Netlify without a build step):</p>
            <p className="text-sm text-gray-400 mb-3">You may need to manually inject the variable into your HTML. Go to Site settings &gt; Build &amp; deploy &gt; Post processing &gt; Snippet injection, and add the following script to the <strong>end of the head tag</strong>:</p>
            <pre className="bg-black/50 p-3 rounded-md text-green-300 overflow-x-auto text-xs"><code>
              {`<script>
  window.process = { 
    env: { 
      API_KEY: 'YOUR_API_KEY_FROM_ENVIRONMENT_VARIABLE'
    } 
  };
</script>`}
            </code></pre>
             <p className="mt-3 text-xs text-gray-500">
               Note: You should use your hosting provider's feature to substitute the placeholder with the actual key from your environment variables rather than hardcoding it, if possible.
             </p>
          </div>
        </div>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
  const [credentials, setCredentials] = useState<WordPressCredentials | null>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'setup':
        return <SetupTab onCredentialsSet={setCredentials} />;
      case 'create':
        return <CreateBlogTab credentials={credentials} />;
      case 'manage':
        return <ManagePostsTab credentials={credentials} />;
      case 'editor':
        return <ImageEditorTab />;
      case 'generator':
          return <ImageGeneratorTab />;
      default:
        return null;
    }
  };
  
  const Icon = ({ name }: { name: string }) => {
    const iconClass = "w-5 h-5 mr-2";
    switch(name) {
        case 'Cog6ToothIcon': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.198-.059 1.605.345l.305.305c.507.508.887 1.162 1.037 1.875 2.15.394 4.143.957 6.027 1.749.528.22 1.02.634 1.258 1.18.232.533.124 1.132-.27 1.595l-.304.34c-1.118 1.263-2.43 2.37-3.87 3.292-.518.33-1.138.48-1.766.42a10.4 10.4 0 0 1-.84-6.303Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11.625 5.342c.125.043.25.09.375.142 4.108 1.93 7.025 6.012 7.025 10.666 0 1.226-.193 2.408-.55 3.527-.425 1.353-1.135 2.57-2.073 3.633-.924 1.048-2.05 1.88-3.32 2.456-1.294.58-2.71.87-4.166.87-4.653 0-8.735-2.92-10.666-7.025a17.886 17.886 0 0 1-1.044-3.573" /></svg>;
        case 'PencilSquareIcon': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
        case 'DocumentDuplicateIcon': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>;
        case 'PhotoIcon': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
        case 'SparklesIcon': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/50 to-indigo-900/60 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            AI WordPress Autoblogger
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Your all-in-one solution for AI-powered content creation and publishing.
          </p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl shadow-purple-500/10 border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex flex-wrap -mb-px px-4 sm:px-6" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-400 text-indigo-300'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  } group inline-flex items-center py-4 px-1 sm:px-3 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none`}
                >
                  <Icon name={tab.icon}/>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <main className="p-4 sm:p-6 lg:p-8">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
