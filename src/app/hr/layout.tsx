// ./src/app/hr/layout.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar, FileText, User, LogOut,
    ChevronRight, Sun, CloudSun, Moon, Menu, X, Home, TrendingUp, GraduationCap, UserPlus, Archive, Activity,
    Banknote,
} from 'lucide-react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { FaMoneyBill } from 'react-icons/fa'; // Keep the import
// REMOVED: import BankDocumentsPage from '../data-manager/bank/page'; // This component is loaded via the route, not imported here

// --------------------------------------------------------------------------------
// Interfaces for data type
interface Employee {
    employeeName: string;
    position: string;
    profilePhotoUrl?: string;
}

interface Attendance {
    status: string;
}
// --------------------------------------------------------------------------------

// Poppins font for consistent typography
const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-poppins',
});

// Reusable component for sidebar navigation items
type NavItemProps = {
    icon: React.ReactNode;
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
};

const NavItem = ({ icon, label, href = '#', active = false, onClick }: NavItemProps) => (
    <Link
        href={href}
        onClick={onClick}
        className={`group flex items-center justify-between px-4 py-3.5 text-sm font-medium rounded-2xl cursor-pointer transition-all duration-300 ${
            active
                ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white shadow-xl scale-105 border border-blue-400/50'
                : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:via-blue-50 hover:to-slate-100 hover:text-slate-800 hover:scale-102 hover:border hover:border-slate-200'
        }`}
    >
        <div className="flex items-center">
            <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} transition-colors`}>
                {icon}
            </div>
            <span className="ml-3 font-medium">{label}</span>
        </div>
        {!active && <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />}
    </Link>
);

// Sidebar component
type SidebarProps = {
    employee: Employee | null;
    profilePhoto: string;
    onLogout: () => void;
    isSidebarOpen: boolean;
    onClose: () => void;
};

const Sidebar = ({ employee, profilePhoto, onLogout, isSidebarOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();

    // HR-specific sidebar items
    const sidebarItems = [
        { icon: <Home size={20} />, label: 'Dashboard', href: '/hr' },
        { icon: <FileText size={20} />, label: 'Document Vault', href: '/hr/documents' },
        { icon: <Archive size={20} />, label: 'Asset Tracker', href: '/hr/assets' },
        { icon: <Calendar size={20} />, label: 'Leave Management', href: '/hr/leaves' },
        { icon: <Activity size={20} />, label: 'Performance Plus', href: '/hr/performance' },
        { icon: <UserPlus size={20} />, label: 'Smart Onboarding', href: '/hr/joining' },
        { icon: <Banknote size={20} />, label: 'Bank & Statutory', href: '/hr/bankdetails' },
        { icon: <TrendingUp size={20} />, label: 'Activity Stream', href: '/hr/activities' },
        { icon: <GraduationCap size={20} />, label: 'Training & Development', href: '/hr/training' },
        // Added size to FaMoneyBill for consistent rendering with Lucide icons
        { icon: <FaMoneyBill size={20} />, label: 'Payslip Generate', href: '/hr/payslip' },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 left-0 w-80 h-full bg-white flex flex-col shrink-0 shadow-2xl border-r border-slate-200/60 z-50 transition-transform duration-300 ${isSidebarOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} lg:translate-x-0`}>
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
                    {sidebarItems.map((link) => (
                        <NavItem
                            key={link.label}
                            icon={link.icon}
                            label={link.label}
                            href={link.href}
                            active={pathname === link.href}
                            onClick={onClose}
                        />
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-200/60">
                    <div className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 backdrop-blur-sm">
                        {profilePhoto ? (
                            <Image
                                src={profilePhoto}
                                alt={employee?.employeeName || 'User'}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/60 shadow-lg"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <User size={20} className="text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {employee?.employeeName.split(' ')[0] || 'HR'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{employee?.position || 'HR Manager'}</p>
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

// --------------------------------------------------------------------------------
// Header component
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <Sun size={32} className="text-amber-500" /> };
    if (hour < 17) return { text: 'Good Afternoon', icon: <CloudSun size={32} className="text-sky-500" /> };
    return { text: 'Good Evening', icon: <Moon size={32} className="text-indigo-500" /> };
};

const motivationalQuotes = [
    "The secret of getting ahead is getting started.",
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The future belongs to those who believe in the beauty of their dreams."
];

type HeaderProps = {
    employee: Employee | null;
    todayAttendance: Attendance | null;
    onMenuClick: () => void;
};

const Header = ({ employee, todayAttendance, onMenuClick }: HeaderProps) => {
    const greeting = getGreeting();
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
        }, 10000); // Change quote every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-24 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 shadow-sm">
            <div className="flex items-center space-x-3 sm:space-x-5">
                <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors">
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block p-2 bg-gradient-to-br from-amber-100 to-sky-100 rounded-2xl">
                    {greeting.icon}
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        {greeting.text}, {employee?.employeeName.split(' ')[0] || 'HR'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium transition-opacity duration-1000">{currentQuote}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="hidden md:block text-sm font-semibold text-slate-800">
                    {currentDate}
                </p>
                <div className="flex items-center justify-end mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${todayAttendance?.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-xs text-slate-500 font-medium capitalize">{todayAttendance?.status || 'Not checked in'}</p>
                </div>
            </div>
        </header>
    );
};
// --------------------------------------------------------------------------------

// Main HR Layout component
export default function HRLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [profilePhoto, setProfilePhoto] = useState('');
    const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Use a hardcoded data for UI demonstration to avoid API errors
    const fetchMockData = useCallback(() => {
        setLoading(true);
        // Mock API data to display the UI correctly
        const mockEmployee = {
            employeeName: 'Bharath',
            position: 'HR Manager',
            profilePhotoUrl: '', // You can add a URL here if you have one
        };
        const mockAttendance = {
            status: 'present',
        };
        setEmployee(mockEmployee);
        setProfilePhoto(''); // Use a hardcoded photo or leave empty for initials
        setTodayAttendance(mockAttendance);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMockData();
    }, [fetchMockData]);

    const handleLogout = () => {
        localStorage.removeItem('employeeId');
        localStorage.removeItem('employeeToken');
        router.replace('/login');
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-slate-500">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="ml-4">Loading...</p>
            </div>
        );
    }

    return (
        <div className={`${poppins.variable} font-sans h-screen flex`}>
            <Sidebar
                employee={employee}
                profilePhoto={profilePhoto}
                onLogout={handleLogout}
                isSidebarOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex flex-col flex-1 lg:ml-80 relative z-10">
                <Header
                    employee={employee}
                    todayAttendance={todayAttendance}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto relative bg-[url('/hrdash.png')] bg-cover bg-center bg-no-repeat">
                    <div className="absolute inset-0 bg-white/50 z-0" /> {/* Corrected transparency layer */}
                    <div className="relative z-10"> {/* Ensure content is above the background */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}