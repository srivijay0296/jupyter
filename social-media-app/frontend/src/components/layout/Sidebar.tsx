'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: '🏠', label: 'Home', href: '/' },
    { icon: '🔍', label: 'Explore', href: '/explore' },
    { icon: '🔔', label: 'Notifications', href: '/notifications' },
    { icon: '✉️', label: 'Messages', href: '/messages' },
    { icon: '📋', label: 'Lists', href: '/lists' },
    { icon: '🔖', label: 'Bookmarks', href: '/bookmarks' },
    { icon: '👤', label: 'Profile', href: `/${user?.username}` },
    { icon: '⚙️', label: 'Settings', href: '/settings' },
  ];

  if (!user) return null;

  return (
    <div className="fixed h-full w-64 xl:w-80 p-4">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SocialApp
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="hidden xl:block font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Post Button */}
        <div className="my-4">
          <Button variant="primary" size="lg" fullWidth className="rounded-full">
            <span className="xl:hidden">✏️</span>
            <span className="hidden xl:block">Post</span>
          </Button>
        </div>

        {/* User Menu */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center space-x-3">
              <img
                src={user.profilePicture || '/default-avatar.png'}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="hidden xl:block">
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.fullName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{user.username}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="hidden xl:block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ⋯
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}