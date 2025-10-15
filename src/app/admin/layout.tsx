'use client';


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import {
  Bell,
  Search,
  Menu,
  RefreshCw,
  Sun,
  CloudSun,
  Moon,
  Users,
  DollarSign,
  Package,
  BarChart2,
  Database,
  StickyNote,
  LogOut,
  X,
  User,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  Clock,
  Home,
  FileText,
  Laptop,
  Calendar,
  Award,
  UserPlus,
} from 'lucide-react';
import { Poppins } from 'next/font/google';


// Type definitions
interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
}


// interface MenuItem {
//   icon?: React.ReactNode;
//   label: string;
//   href?: string;
//   subItems?: MenuItem[];
//   type?: 'divider';
// }


type MenuItem =
  | {
      type: "divider";
      icon?: never;
      label?: never;
      href?: never;
      subItems?: never;
    }
  | {
      icon: React.ReactNode;
      label: string;
      href: string;
      subItems?: {
        icon: React.ReactNode;
        label: string;
        href: string;
      }[];
      type?: undefined;
    };




const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});


// Helper function to get the current greeting based on the time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: <Sun size={32} className="text-amber-500" /> };
  if (hour < 17) return { text: 'Good Afternoon', icon: <CloudSun size={32} className="text-sky-500" /> };
  return { text: 'Good Evening', icon: <Moon size={32} className="text-indigo-500" /> };
};


// Motivational thoughts for the header
const motivationalThoughts = [
  'Excellence is not a skill, it is an attitude.',
  'The best way to predict the future is to create it.',
  'Success is a journey, not a destination.',
  'Innovation distinguishes between a leader and a follower.',
  'The strength of the team is each individual member.',
  "Believe you can and you're halfway there.",
  'Hard work beats talent when talent fails to work hard.',
  'The future depends on what you do today.',
  'Great things are done by a series of small things brought together.',
  'The only way to do great work is to love what you do.'
];


const getRandomThought = () => {
  const randomIndex = Math.floor(Math.random() * motivationalThoughts.length);
  return motivationalThoughts[randomIndex];
};


// NavItem component for a consistent look for all sidebar links
type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
  hasSubItems?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
};


// Refactored NavItem for hydration safety
const NavItem = ({
  icon,
  label,
  href = '#',
  active = false,
  onClick,
  isSubItem = false,
  hasSubItems = false,
  isExpanded = false,
  onToggle
}: NavItemProps) => {


  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasSubItems) {
      e.preventDefault();
      if (onToggle) {
        onToggle();
      }
    } else {
      if (onClick) {
        onClick();
      }
    }
  };


  const commonClasses = `group flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-2xl cursor-pointer transition-all duration-300 ${
    isSubItem
      ? active
        ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 text-white shadow-lg ml-6'
        : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:via-blue-25 hover:to-slate-50 hover:text-slate-800 ml-6'
      : active
        ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white shadow-xl scale-105 border border-blue-400/50'
        : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:via-blue-50 hover:to-slate-100 hover:text-slate-800 hover:scale-102 hover:border hover:border-slate-200'
  }`;


  return (
    <Link href={href} className={commonClasses} onClick={handleClick}>
      <div className="flex items-center">
        <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} transition-colors`}>
          {icon}
        </div>
        <span className="ml-3 font-medium">{label}</span>
      </div>
      {hasSubItems ? (
        <ChevronDown
          size={16}
          className={`text-slate-400 group-hover:text-blue-500 transition-all duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      ) : (
        !active && <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
      )}
    </Link>
  );
};


// AdminSidebar component
interface AdminSidebarProps {
  onLogout: () => void;
  isSidebarOpen: boolean;
  onClose: () => void;
}


const AdminSidebar = ({ onLogout, isSidebarOpen, onClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const userName = 'Admin';
  const profilePhotoUrl = '';


  useEffect(() => {
    if (pathname.startsWith('/admin/hr')) {
      setExpandedMenus(prev => prev.includes('employee-management') ? prev : [...prev, 'employee-management']);
    }
  }, [pathname]);


  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };


  const adminSidebarItems = useMemo(() => ([
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/admin' },
    {
      icon: <Users size={20} />,
      label: 'Employee Management',
      href: '/admin/hr',
      subItems: [
        { icon: <Home size={18} />, label: 'Overview', href: '/admin/hr' },
        { icon: <FileText size={18} />, label: 'Employee Documents', href: '/admin/hr/documents' },
        { icon: <Laptop size={18} />, label: 'Asset Management', href: '/admin/hr/assets' },
        { icon: <Calendar size={18} />, label: 'Leave Management', href: '/admin/hr/leaves' },
        { icon: <Award size={18} />, label: 'Performance', href: '/admin/hr/performance' },
        { icon: <UserPlus size={18} />, label: 'Joining/Relieving', href: '/admin/hr/joining' },
        { icon: <Clock size={18} />, label: 'Weekly Activities', href: '/admin/hr/activities' }
      ]
    },
    { icon: <Clock size={20} />, label: 'Attendance', href: '/admin/attendence' },
    { icon: <DollarSign size={20} />, label: 'Finance', href: '/admin/finance-manager/dashboard' },
    { icon: <Package size={20} />, label: 'Inventory', href: '/admin/store' },
    { type: 'divider' } as const,
    { icon: <BarChart2 size={20} />, label: 'Reports', href: '/admin/reports' },
    { icon: <Database size={20} />, label: 'Data Management', href: '/admin/data-manager' },
    { icon: <StickyNote size={20} />, label: 'Memos', href: '/admin/memos' },
  ]), []);


  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.type === 'divider') {
      return (
        <div key={`divider-${index}`} className="py-3">
          <hr className="border-slate-200" />
        </div>
      );
    }


    const menuId = item.label.toLowerCase().replace(/\s+/g, '-');
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(menuId);
    const isActive = pathname === item.href;


    return (
      <div key={item.label}>
        <NavItem
          icon={item.icon!}
          label={item.label}
          href={item.href}
          active={isActive}
          onClick={onClose}
          hasSubItems={hasSubItems}
          isExpanded={isExpanded}
          onToggle={() => toggleMenu(menuId)}
        />
        {hasSubItems && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.subItems!.map((subItem) => (
              <NavItem
                key={subItem.label}
                icon={subItem.icon!}
                label={subItem.label}
                href={subItem.href}
                active={pathname === subItem.href}
                onClick={onClose}
                isSubItem={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />


      <aside
        className={`fixed top-0 left-0 w-80 h-full bg-white flex flex-col shrink-0 shadow-2xl border-r border-slate-200/60 z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'transform translate-x-0' : 'transform -translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-200/60 bg-gradient-to-r from-white to-slate-50">
          <div className="flex items-center space-x-3">
            <Image
              src="/hrlogo.png"
              alt="HR Logo"
              width={200}
              height={50}
              className="h-20 w-auto"
               priority
            />
          </div>
          <button onClick={onClose} className="p-2 lg:hidden text-slate-500 hover:text-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {adminSidebarItems.map(renderMenuItem)}
        </nav>
        <div className="p-6 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 backdrop-blur-sm">
            {profilePhotoUrl ? (
              <div className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/60 shadow-lg"></div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <User size={20} className="text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {userName}
              </p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
            <LogOut
              size={18}
              className="text-slate-500 hover:text-red-500 cursor-pointer transition-all duration-300 hover:scale-110"
              onClick={onLogout}
            />
          </div>
        </div>
      </aside>
    </>
  );
};


// Skeleton loader component to show a loading state
const SkeletonLoader = () => (
  <div className="flex h-screen overflow-hidden bg-slate-100">
    <div className="fixed left-0 top-0 w-80 h-full bg-white p-6 space-y-3 shadow-2xl border-r border-slate-200/60 hidden lg:block">
      <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
      {[...Array(9)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
      ))}
    </div>
    <div className="flex-1 flex flex-col lg:ml-80 h-screen">
      <div className="h-24 bg-white border-b animate-pulse"></div>
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  </div>
);


// Main AdminLayout component that wraps all child pages
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);


  const greeting = getGreeting();
  const motivationalThought = useMemo(() => getRandomThought(), []);


  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };


    try {
      const notifResponse = await axios.get(`${APIURL}/api/notifications`, { headers });
      setNotifications(Array.isArray(notifResponse.data) ? notifResponse.data : []);
    } catch (err: unknown) {
      console.error('Error fetching notifications:', err);
      setError(`Failed to load notifications. Please check your network: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [router]);


  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };


  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${APIURL}/api/notifications/${id}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  const handleRefresh = async () => {
    setRefreshLoading(true);
    await fetchNotifications();
    setTimeout(() => setRefreshLoading(false), 1000);
  };


  const unreadCount = notifications.filter((n) => !n.read).length;


  if (loading) {
    return <SkeletonLoader />;
  }


  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 via-pink-50 to-red-100">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Connection Error</h2>
          <p className="text-red-600 font-medium mb-6">{error || 'An unknown error occurred.'}</p>
          <button
            onClick={fetchNotifications}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto font-semibold"
          >
            <RefreshCw size={20} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className={`${poppins.variable} font-sans h-screen relative`}>
      <div className="relative z-10 flex h-screen">
        <AdminSidebar
          onLogout={handleLogout}
          isSidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-col flex-1 lg:ml-80">
          <header className="h-24 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 shadow-sm">
            <div className="flex items-center space-x-3 sm:space-x-5">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors">
                <Menu size={24} />
              </button>
              <div className="hidden sm:block p-2 bg-gradient-to-br from-amber-100 to-sky-100 rounded-2xl">
                {greeting.icon}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {greeting.text}, Admin
                </h2>
                <p className="hidden sm:block text-xs sm:text-sm text-slate-500 font-medium">{motivationalThought}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
              <button
                onClick={handleRefresh}
                disabled={refreshLoading}
                className="flex items-center px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <RefreshCw size={14} className={`sm:mr-2 ${refreshLoading ? 'animate-spin text-blue-500' : 'text-slate-500'}`} />
                <span className="hidden sm:block">{refreshLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-full hover:bg-gray-100"
                  aria-label="Show notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>


                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-full sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <span className="text-sm font-medium text-gray-500">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden md:block relative">
                <form onSubmit={handleSearch}>
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all duration-200"
                  />
                </form>
              </div>
            </div>
          </header>


          <main
            className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 bg-cover bg-center"
            style={{ backgroundImage: `url('/admindash.png')` }}
          >
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

   