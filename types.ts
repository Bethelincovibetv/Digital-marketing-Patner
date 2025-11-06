
export interface WordPressCredentials {
  url: string;
  username: string;
  password: string; // This is the application password
}

export interface PostStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export interface RecentPost {
  id: number;
  title: {
    rendered: string;
  };
  link: string;
  date: string;
  excerpt: {
    rendered: string;
  };
}
