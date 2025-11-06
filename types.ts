export interface AppStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export interface WordPressCredentials {
    url: string;
    username: string;
    password?: string;
}

export interface GeneratedPost {
    title: string;
    content: string;
    imageBase64: string;
}