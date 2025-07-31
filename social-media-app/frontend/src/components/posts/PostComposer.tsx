'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export default function PostComposer() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please write something to post');
      return;
    }

    if (content.length > 280) {
      toast.error('Post cannot exceed 280 characters');
      return;
    }

    setLoading(true);
    try {
      await api.createPost({ content: content.trim() });
      setContent('');
      toast.success('Post created successfully!');
      // Optionally refresh the feed here
      window.location.reload();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <img
            src={user.profilePicture || '/default-avatar.png'}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full text-xl placeholder-gray-500 border-none resize-none focus:outline-none bg-transparent text-gray-900 dark:text-white dark:placeholder-gray-400"
              rows={3}
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-blue-500">
                <button type="button" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full">
                  📷
                </button>
                <button type="button" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full">
                  📊
                </button>
                <button type="button" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full">
                  😊
                </button>
                <button type="button" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full">
                  📍
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${content.length > 260 ? 'text-red-500' : 'text-gray-500'}`}>
                  {280 - content.length}
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={loading}
                  disabled={!content.trim() || content.length > 280}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}