
import type { WordPressCredentials, RecentPost } from '../types';

const getAuthHeader = (credentials: WordPressCredentials) => {
    return 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);
};

const getApiUrl = (url: string) => {
    // Ensure URL has a trailing slash and points to the REST API endpoint
    let correctedUrl = url.endsWith('/') ? url : `${url}/`;
    if (!correctedUrl.endsWith('wp-json/')) {
        correctedUrl += 'wp-json/';
    }
    return correctedUrl;
};

export const testConnection = async (credentials: WordPressCredentials): Promise<void> => {
    const apiUrl = getApiUrl(credentials.url);
    const response = await fetch(`${apiUrl}wp/v2/users/me`, {
        headers: {
            'Authorization': getAuthHeader(credentials),
        },
    });

    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }
};

export const publishPost = async (credentials: WordPressCredentials, title: string, content: string): Promise<string> => {
    const apiUrl = getApiUrl(credentials.url);
    const response = await fetch(`${apiUrl}wp/v2/posts`, {
        method: 'POST',
        headers: {
            'Authorization': getAuthHeader(credentials),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            content,
            status: 'publish',
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish post.');
    }

    const postData = await response.json();
    return postData.link;
};

export const fetchPosts = async (credentials: WordPressCredentials): Promise<RecentPost[]> => {
    const apiUrl = getApiUrl(credentials.url);
    const response = await fetch(`${apiUrl}wp/v2/posts?per_page=10&_embed`, {
        headers: {
            'Authorization': getAuthHeader(credentials),
        },
    });

    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }

    const posts: RecentPost[] = await response.json();
    return posts;
};
