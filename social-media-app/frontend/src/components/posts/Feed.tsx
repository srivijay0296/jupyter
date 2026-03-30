'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Post } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No posts yet. Be the first to share something!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {posts.map((post) => (
        <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex space-x-3">
            <img
              src={post.author.profilePicture || '/default-avatar.png'}
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {post.author.fullName}
                </h3>
                <span className="text-gray-500 dark:text-gray-400">
                  @{post.author.username}
                </span>
                <span className="text-gray-500 dark:text-gray-400">·</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-900 dark:text-white">
                {post.content}
              </p>
              <div className="flex items-center mt-3 space-x-6 text-gray-500 dark:text-gray-400">
                <button className="flex items-center space-x-2 hover:text-blue-500">
                  <span>💬</span>
                  <span>{post.commentsCount}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-green-500">
                  <span>🔄</span>
                  <span>{post.retweetsCount}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-red-500">
                  <span>❤️</span>
                  <span>{post.likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}