'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
    Calendar, FileText, Clock, Star, BookOpen,
    Laptop, User, LogOut, LayoutDashboard, BarChart2,
    ChevronRight, StickyNote, Sun, CloudSun, Moon, RefreshCw, Menu, X,
    // Removed unused import: Briefcase
} from 'lucide-react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { FaMoneyBillAlt } from 'react-icons/fa';

// Interfaces for data type
interface Employee {
    employeeName: string;
    employeeId: string;
    position: string;
    department: string;
    email: string;
    phoneNumber: string;
    bloodGroup: string;
    profilePhotoUrl: string;
    currentAddress: string;
    permanentAddress: string;
    joiningDate: string;
    relievingDate: string;
    status: string;
}

interface Attendance {
    date: string | number[];
    checkInTime: string | null;
    checkOutTime: string | null;
    status: string;
    workHours: number;
}

const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-poppins',
});

type NavItemProps = {
    icon: React.ReactNode;
    label: string;
    href?: string;
    active?: boolean;
    hasNotification?: boolean;
    onClick?: () => void;
};

const NavItem = ({ icon, label, href = '#', active = false, hasNotification = false, onClick }: NavItemProps) => (
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
        {hasNotification && (
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-lg animate-pulse"></div>
        )}
        {!active && <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />}
    </Link>
);

type SidebarProps = {
    employee: Employee | null;
    profilePhoto: string;
    onLogout: () => void;
    isSidebarOpen: boolean;
    onClose: () => void;
};

const Sidebar = ({ employee, profilePhoto, onLogout, isSidebarOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();
    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 left-0 w-80 h-full bg-white flex flex-col shrink-0 shadow-2xl border-r border-slate-200/60 z-50 transition-transform duration-300 ${isSidebarOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} lg:translate-x-0`}>
                <div className="h-24 flex items-center justify-between px-6 border-b border-slate-200/60 bg-gradient-to-r from-white to-slate-50">
                    
                    {/* START: Replaced the original logo block with the Image component */}
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
                    {/* END: Replaced logo block */}
                    
                    <button onClick={onClose} className="p-2 lg:hidden text-slate-500 hover:text-slate-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {(
                        [
                            { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/employee' },
                            { icon: <User size={20} />, label: 'My Profile', href: '/employee/profile' },
                            { icon: <Clock size={20} />, label: 'Attendance', href: '/employee/attendance' },
                            { icon: <Calendar size={20} />, label: 'Leaves', href: '/employee/leaves' },
                            { icon: <Star size={20} />, label: 'Performance', href: '/employee/performance' },
                            { type: 'divider' } as const,
                            { icon: <FileText size={20} />, label: 'Documents', href: '/employee/documents' },
                            { icon: <StickyNote size={20} />, label: 'Memos', href: '/employee/memos' },
                            { icon: <Laptop size={20} />, label: 'Assets', href: '/employee/assets' },
                            { icon: <BarChart2 size={20} />, label: 'Reports', href: '/employee/reports' },
                            { icon: <BookOpen size={20} />, label: 'Training & Development', href: '/employee/training' },
                            { type: 'divider' } as const,
                            { icon: <FaMoneyBillAlt size={20} />, label: 'Payslip', href: '/employee/payslip' },
                        ] as Array<{ icon?: React.ReactNode; label?: string; href?: string; type?: 'divider' }>
                    ).map((link, index) =>
                        link.type === 'divider' ? (
                            <div key={`divider-${index}`} className="py-3">
                                <hr className="border-slate-200" />
                            </div>
                        ) : (
                            <NavItem
                                key={link.label}
                                icon={link.icon!}
                                label={link.label!}
                                href={link.href}
                                active={pathname === link.href}
                                onClick={onClose}
                            />
                        )
                    )}
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
                                unoptimized // Use unoptimized if the image is coming from a non-Next.js domain like APIURL
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <User size={20} className="text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {employee?.employeeName.split(' ')[0] || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{employee?.position || 'Position'}</p>
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

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <Sun size={32} className="text-amber-500" />, message: 'Ready to conquer today!' };
    if (hour < 17) return { text: 'Good Afternoon', icon: <CloudSun size={32} className="text-sky-500" />, message: 'Keep the momentum going!' };
    return { text: 'Good Evening', icon: <Moon size={32} className="text-indigo-500" />, message: 'Wrapping up brilliantly!' };
};

type HeaderProps = {
    employee: Employee | null;
    todayAttendance: Attendance | null;
    onRefresh: () => void;
    loading: boolean;
    onMenuClick: () => void;
};

const Header = ({ employee, todayAttendance, onRefresh, loading, onMenuClick }: HeaderProps) => {
    const greeting = getGreeting();
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
                        {greeting.text}, {employee?.employeeName.split(' ')[0] || 'User'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{greeting.message}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <RefreshCw size={14} className={`sm:mr-2 ${loading ? 'animate-spin text-blue-500' : 'text-slate-500'}`} />
                    <span className="hidden sm:block">{loading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <div className="text-right">
                    <p className="hidden md:block text-sm font-semibold text-slate-800">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex items-center justify-end mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${todayAttendance?.status === 'present' ? 'bg-green-500' : todayAttendance?.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <p className="text-xs text-slate-500 font-medium capitalize">{todayAttendance?.status || 'Not checked in'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

const SkeletonLoader = () => (
    <div className="flex h-screen overflow-hidden bg-slate-100">
        <div className="fixed left-0 top-0 w-80 h-full bg-white p-6 space-y-3 shadow-2xl border-r border-slate-200/60 hidden lg:block">
            <div className="h-16 bg-slate-200 rounded-2xl animate-pulse"></div>
            {[...Array(12)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
        </div>
        <div className="flex-1 flex flex-col lg:ml-80 h-screen">
            <div className="h-24 bg-white border-b animate-pulse"></div>
            <main className="flex-1 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Skeleton content for dashboard */}
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

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [profilePhoto, setProfilePhoto] = useState('');
    const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const employeeId = localStorage.getItem("employeeId");
        if (!employeeId) {
            router.replace('/login');
            return;
        }

        try {
            const [employeeRes, attendanceRes] = await Promise.all([
                axios.get(`${APIURL}/api/employees/byEmployeeId/${employeeId}`),
                axios.get(`${APIURL}/api/attendance/employee/${employeeId}`),
            ]);
            const employeeData: Employee = employeeRes.data;
            if (!employeeData) throw new Error('Employee data not found.');
            setEmployee(employeeData);

            if (employeeData.profilePhotoUrl) {
                if (employeeData.profilePhotoUrl.startsWith('http')) {
                    setProfilePhoto(employeeData.profilePhotoUrl);
                } else {
                    setProfilePhoto(`${APIURL}${employeeData.profilePhotoUrl}`);
                }
            } else {
                setProfilePhoto('');
            }

            const today = new Date().toISOString().split('T')[0];
            const records: Attendance[] = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
            const normalizeDate = (d: string | number[]) => {
                if (Array.isArray(d) && d.length >= 3) {
                    return `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`;
                }
                if (typeof d === 'string') {
                    return d.split('T')[0];
                }
                return '';
            };
            const todayRecord = records.find((r: Attendance) => normalizeDate(r.date) === today);
            setTodayAttendance(todayRecord || { checkInTime: null, checkOutTime: null, status: 'absent', workHours: 0, date: today });
        } catch (err: unknown) {
            console.error('Failed to fetch dashboard data:', err);
            const errorMessage = (err as Error).message || 'An unknown error occurred.';
            setError(`Failed to load dashboard data. Please check your network and try again: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => {
        localStorage.removeItem('employeeId');
        localStorage.removeItem('employeeToken');
        router.replace('/login');
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    if (error || !employee) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 via-pink-50 to-red-100">
                <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <RefreshCw size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-800 mb-4">Connection Error</h2>
                    <p className="text-red-600 font-medium mb-6">{error || 'Employee data not found.'}</p>
                    <button
                        onClick={fetchData}
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
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/employee.jpg"
                    alt="Employee Dashboard Background"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
            </div>
            <div className="relative z-10 flex h-screen">
                <Sidebar
                    employee={employee}
                    profilePhoto={profilePhoto}
                    onLogout={handleLogout}
                    isSidebarOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <div className="flex flex-col flex-1 lg:ml-80">
                    <Header
                        employee={employee}
                        todayAttendance={todayAttendance}
                        onRefresh={fetchData}
                        loading={loading}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />
                    <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        <div className="max-w-7xl mx-auto space-y-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}