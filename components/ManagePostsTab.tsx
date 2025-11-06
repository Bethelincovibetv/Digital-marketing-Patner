
import React, { useState, useCallback, useEffect } from 'react';
import type { WordPressCredentials, RecentPost, PostStatus } from '../types';
import { fetchPosts } from '../services/wordpressService';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Card } from './ui/Card';

interface ManagePostsTabProps {
  credentials: WordPressCredentials | null;
}

export const ManagePostsTab: React.FC<ManagePostsTabProps> = ({ credentials }) => {
  const [posts, setPosts] = useState<RecentPost[]>([]);
  const [status, setStatus] = useState<PostStatus>({ type: 'idle', message: '' });

  const handleFetchPosts = useCallback(async () => {
    if (!credentials) {
      setStatus({ type: 'error', message: 'WordPress credentials are not set.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Fetching posts...' });
    try {
      const recentPosts = await fetchPosts(credentials);
      setPosts(recentPosts);
      setStatus({ type: 'success', message: `Found ${recentPosts.length} posts.` });
    } catch (error: any) {
      setStatus({ type: 'error', message: `Failed to fetch posts: ${error.message}` });
    }
  }, [credentials]);

  useEffect(() => {
    if (credentials) {
        handleFetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials]);


  if (!credentials) {
    return <Alert type="info" message="Please configure your WordPress credentials in the Setup tab first." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Recent WordPress Posts</h2>
        <Button onClick={handleFetchPosts} isLoading={status.type === 'loading'} variant="secondary">
          Refresh Posts
        </Button>
      </div>

      {status.type === 'error' && <Alert type="error" message={status.message} />}

      {status.type === 'loading' && posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading posts...</div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="transition-transform hover:scale-[1.02] hover:border-indigo-500/50">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                  <h3 className="text-lg font-bold text-indigo-300">{post.title.rendered}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Published on: {new Date(post.date).toLocaleDateString()}
                  </p>
                  <div className="text-sm text-gray-300 mt-2" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        View Post
                    </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        status.type !== 'loading' && <Card><p className="text-center text-gray-400 py-8">No recent posts found.</p></Card>
      )}
    </div>
  );
};
