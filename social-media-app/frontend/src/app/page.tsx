'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Feed from '@/components/posts/Feed';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import PostComposer from '@/components/posts/PostComposer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 xl:w-80">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="border-x border-gray-200 dark:border-gray-800 min-h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Home
              </h1>
            </div>

            {/* Post Composer */}
            <PostComposer />

            {/* Feed */}
            <Feed />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-64 xl:w-80">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}