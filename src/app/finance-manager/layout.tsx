'use client';

import { Toaster } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function FinanceManagerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, userEmail, logout } = useAuth('FINANCE');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white tracking-wide">
                Finance Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">
                Welcome, {userEmail}
              </span>
              <button
                onClick={logout}
                className="px-6 py-2 border-2 border-white text-sm font-semibold rounded-full text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition ease-in-out duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}