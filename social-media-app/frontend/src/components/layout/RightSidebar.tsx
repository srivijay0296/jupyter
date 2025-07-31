'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { User } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await api.getSuggestedUsers(5);
      setSuggestedUsers(response.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.followUser(userId);
      // Remove the followed user from suggestions
      setSuggestedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  return (
    <div className="fixed h-full w-64 xl:w-80 p-4">
      <div className="space-y-4">
        {/* Search Box */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Trending Topics */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            What's happening
          </h2>
          <div className="space-y-3">
            {[
              { category: 'Technology', topic: 'React 19', posts: '125K' },
              { category: 'Sports', topic: 'World Cup', posts: '89K' },
              { category: 'Entertainment', topic: 'New Movie', posts: '45K' },
            ].map((trend, index) => (
              <div key={index} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2 -m-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Trending in {trend.category}
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {trend.topic}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {trend.posts} posts
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Who to follow */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Who to follow
          </h2>
          {loading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link href={`/${user.username}`} className="flex items-center space-x-3 flex-1">
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollow(user.id)}
                  >
                    Follow
                  </Button>
                </div>
              ))}
              {suggestedUsers.length === 0 && !loading && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No suggestions available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}