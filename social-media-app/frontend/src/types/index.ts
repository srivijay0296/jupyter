export interface User {
  id: string;
  username: string;
  email?: string;
  fullName: string;
  bio?: string;
  location?: string;
  website?: string;
  profilePicture?: string;
  coverPhoto?: string;
  isVerified: boolean;
  isFollowing?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinDate: string;
  lastSeen?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      likes: boolean;
      comments: boolean;
      follows: boolean;
      retweets: boolean;
      mentions: boolean;
    };
  };
}

export interface Post {
  id: string;
  content: string;
  author: User;
  media?: MediaItem[];
  hashtags?: string[];
  mentions?: User[];
  likes: Like[];
  retweets: Retweet[];
  comments: Comment[];
  isRetweet: boolean;
  originalPost?: Post;
  retweetComment?: string;
  isReply: boolean;
  replyTo?: string;
  location?: {
    name: string;
    coordinates: [number, number];
  };
  visibility: 'public' | 'followers' | 'mentioned';
  isPinned: boolean;
  isDeleted: boolean;
  engagement: {
    views: number;
    clicks: number;
  };
  createdAt: string;
  updatedAt: string;
  // Virtuals
  likesCount: number;
  retweetsCount: number;
  commentsCount: number;
  totalEngagement: number;
  // User interaction
  isLiked?: boolean;
  isRetweeted?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  post: string;
  parentComment?: string;
  replies: Comment[];
  likes: Like[];
  mentions?: User[];
  media?: MediaItem[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  likesCount: number;
  repliesCount: number;
  // User interaction
  isLiked?: boolean;
}

export interface Like {
  user: User;
  createdAt: string;
}

export interface Retweet {
  user: User;
  comment?: string;
  createdAt: string;
}

export interface MediaItem {
  type: 'image' | 'video' | 'gif';
  url: string;
  altText?: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'retweet' | 'mention';
  message: string;
  from: User;
  post?: Post;
  read: boolean;
  createdAt: string;
}

export interface AuthUser extends User {
  notifications: Notification[];
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  login: string; // username or email
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface CreatePostRequest {
  content: string;
  media?: MediaItem[];
  location?: {
    name: string;
    coordinates: [number, number];
  };
  visibility?: 'public' | 'followers' | 'mentioned';
  replyTo?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  profilePicture?: string;
  coverPhoto?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      likes?: boolean;
      comments?: boolean;
      follows?: boolean;
      retweets?: boolean;
      mentions?: boolean;
    };
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  q: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface FollowersResponse {
  followers: User[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface SocketEvents {
  'post-created': (data: { post: Post; author: User }) => void;
  'post-liked': (data: { postId: string; postAuthorId: string; username: string }) => void;
  'user-followed': (data: { followedUserId: string; followerId: string; username: string }) => void;
  'notification': (data: Notification) => void;
  'join': (userId: string) => void;
}