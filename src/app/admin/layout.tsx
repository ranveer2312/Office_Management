'use client';

import { useRouter } from 'next/navigation';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

 

  const handleLogout = () => {
  
    router.push('/login');
  };

  return (
   <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  {/* Fixed Navigation Bar */}
  <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex-shrink-0 flex items-center space-x-2">
          <button
            onClick={() => router.push('/admin')}
            className="text-2xl font-extrabold text-white tracking-wide hover:text-blue-200 transition-colors duration-200 cursor-pointer"
          >
            Admin Portal
          </button>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 border-2 border-white text-sm font-semibold rounded-full text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition ease-in-out duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>

  {/* Main Content with top padding */}
  <main className="pt-16"> {/* pt-16 matches the h-16 of the nav bar */}
    {children}
  </main>
</div>
  );
}