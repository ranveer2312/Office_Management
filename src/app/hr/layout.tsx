'use client';


import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  Archive,
  Calendar,
  Activity,
  UserPlus,
  TrendingUp,
  GraduationCap,
  LogOut,
  Search,
  Bell,
  MessageSquare,
  Users,
  UserCheck,
  TrendingDown,
  Briefcase,
  User
} from 'lucide-react';
import Link from 'next/link';
import { APIURL } from '@/constants/api';


// Sidebar items
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/hr', active: true },
  { id: 'documents', label: 'Document Vault', icon: FileText, path: '/hr/documents' },
  { id: 'assets', label: 'Asset Tracker', icon: Archive, path: '/hr/assets' },
  { id: 'leave', label: 'Leave Management', icon: Calendar, path: '/hr/leaves' },
  { id: 'performance', label: 'Performance Plus', icon: Activity, path: '/hr/performance' },
  { id: 'onboarding', label: 'Smart Onboarding', icon: UserPlus, path: '/hr/joining' },
  { id: 'activities', label: 'Activity Stream', icon: TrendingUp, path: '/hr/activities' },
  { id: 'training', label: 'Training and Development', icon: GraduationCap, path: '/hr/training' }
];










// Notification component
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    // Fetch leave requests for notifications
    fetch(`${APIURL}/api/leave-requests`)
      .then(res => res.json())
      .then(data => {
        const pendingRequests = data.filter(req => req.status === 'Pending');
        setNotifications(pendingRequests);
        setUnreadCount(pendingRequests.length);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  }, []);


  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
     
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Leave Requests</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">{notification.employeeName}</p>
                      <p className="text-sm text-slate-600">{notification.leaveType}</p>
                      <p className="text-xs text-slate-500">Start: {notification.startDate}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {notification.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500">
                No pending leave requests
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-4 border-t border-slate-200">
              <Link href="/hr/leaves" className="text-blue-600 text-sm hover:underline">
                View all leave requests →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Welcome section
const WelcomeSection = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');
  const [activeEmployees, setActiveEmployees] = useState('...');


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');


    const today = new Date();
    setCurrentDate(today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));


    // Fetch active employees count
    fetch(`${APIURL}/api/employees`)
      .then(res => res.json())
      .then(data => {
        const active = data.filter(emp => emp.status === 'Active' || !emp.status).length;
        setActiveEmployees(active.toString());
      })
      .catch(() => setActiveEmployees('N/A'));
  }, []);


  return (
    <div className="px-6 py-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Hello, {greeting}!
          </h2>
          <p className="text-slate-600 text-lg">
            Here's what's happening with your team today.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-600">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200">
            <span className="font-medium">Today:</span> {currentDate}
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200">
            <span className="font-medium">Active Employees:</span> {activeEmployees}
          </div>
        </div>
      </div>
    </div>
  );
};


// Metric Card component
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
}


const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon: Icon, subtitle }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-slate-300">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        changeType === 'positive'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : changeType === 'negative'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-slate-50 text-slate-700 border border-slate-200'
      }`}>
        {change}
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  </div>
);


// Chart card
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}


const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300 ${className}`}>
    <h3 className="text-lg font-semibold text-slate-900 mb-6">{title}</h3>
    <div className="h-64 flex items-center justify-center">
      {children}
    </div>
  </div>
);


// Pie chart
interface PieChartSegment {
  label: string;
  percentage: number;
}


interface PieChartProps {
  segments: PieChartSegment[];
  size?: number;
}


const PieChart: React.FC<PieChartProps> = ({ segments, size = 180 }) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  let cumulativePercentage = 0;


  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 20}
          fill="transparent"
          stroke="#052749ff"
          strokeWidth="20"
        />
        {segments.map((segment, index) => {
          const strokeDasharray = `${segment.percentage * 2.83} ${283 - segment.percentage * 2.83}`;
          const strokeDashoffset = -cumulativePercentage * 2.83;
          cumulativePercentage += segment.percentage;


          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 20}
              fill="transparent"
              stroke={colors[index % colors.length]}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">15</div>
          <div className="text-sm text-slate-600">Total</div>
        </div>
      </div>
    </div>
  );
};


// Bar chart
const BarChart = () => {
  const data = [
    { day: 'Mon', present: 1150, absent: 45, late: 85 },
    { day: 'Tue', present: 1200, absent: 30, late: 50 },
    { day: 'Wed', present: 1100, absent: 60, late: 120 },
    { day: 'Thu', present: 1180, absent: 40, late: 60 },
    { day: 'Fri', present: 1050, absent: 80, late: 150 }
  ];


  const maxValue = Math.max(...data.map(d => d.present + d.absent + d.late));


  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.day} className="flex items-center space-x-3">
          <div className="w-8 text-sm font-medium text-slate-600">{item.day}</div>
          <div className="flex-1 flex bg-slate-100 rounded-full h-6 overflow-hidden">
            <div className="bg-blue-500 transition-all duration-500" style={{ width: `${(item.present / maxValue) * 100}%` }} />
            <div className="bg-red-400 transition-all duration-500" style={{ width: `${(item.absent / maxValue) * 100}%` }} />
            <div className="bg-yellow-400 transition-all duration-500" style={{ width: `${(item.late / maxValue) * 100}%` }} />
          </div>
          <div className="text-sm font-medium text-slate-700 w-12">{item.present + item.absent + item.late}</div>
        </div>
      ))}
    </div>
  );
};


// HR Layout component
export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HR</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  HR Manager
                </h1>
                <p className="text-sm text-slate-500">Enterprise Workforce Management</p>
              </div>
            </div>


            {/* Right Controls */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees, documents, reports..."
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>


              <div className="flex items-center space-x-3">
                <NotificationBell />


                <div className="w-px h-6 bg-slate-200"></div>


                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">Bharath</div>
                    <div className="text-slate-500">HR Manager</div>
                  </div>
                </div>


                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Greeting section */}
        <WelcomeSection />
      </header>


      <div className="flex">
        {/* Sidebar */}
        <nav className="w-72 bg-white border-r border-slate-200 shadow-sm min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Icon className="w-5 h-5 transition-colors text-slate-400 group-hover:text-slate-600" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>


          <div className="p-6 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Quick Stats</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>On Leave Today</span>
                <span className="font-semibold text-slate-900">23</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>New Applicants</span>
                <span className="font-semibold text-slate-900">12</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pending Reviews</span>
                <span className="font-semibold text-slate-900">8</span>
              </div>
            </div>
          </div>
        </nav>


        {/* Main content area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

