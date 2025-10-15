'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import {
    Clock, User, Activity, TrendingUp,
    Shield, Mail, Phone, Briefcase, Calendar,
} from 'lucide-react';

// Interfaces for data type
interface Employee {
    id: number;
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
    password?: string;
}

interface TodayAttendance {
    id?: number;
    employeeId: string;
    date: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    status: string;
    workHours: number;
    overtimeHours?: number;
    breakTime?: number;
}

// API Configuration
const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Work Hours Progress Ring Component - Compact Version
const WorkHoursRing = ({ hours = 0, targetHours = 9 }: { hours?: number; targetHours?: number }) => {
    const percentage = Math.min((hours / targetHours) * 100, 100);
    const circumference = 2 * Math.PI * 50;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="30%" stopColor="#8B5CF6" />
                        <stop offset="60%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                </defs>
                <circle
                    cx="60" cy="60" r="50"
                    strokeWidth="8"
                    className="stroke-slate-100"
                    fill="none"
                />
                <circle
                    cx="60" cy="60" r="50"
                    strokeWidth="8"
                    stroke="url(#progressGradient)"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-2000 ease-out"
                />
            </svg>
            <div className="text-center z-10">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                    {hours.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ {targetHours}h</span>
            </div>
        </div>
    );
};

// Compact Profile Photo Component
const ProfilePhoto = ({ employee, className = 'rounded-full' }: { employee: Employee, className?: string }) => {
    const [photoUrl, setPhotoUrl] = useState<string>('');
    const [photoError, setPhotoError] = useState<boolean>(false);
    const [photoLoading, setPhotoLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadProfilePhoto = async () => {
            if (!employee?.profilePhotoUrl) {
                setPhotoLoading(false);
                return;
            }

            try {
                setPhotoLoading(true);
                setPhotoError(false);
                if (employee.profilePhotoUrl.startsWith('http')) {
                    setPhotoUrl(employee.profilePhotoUrl);
                } else {
                    setPhotoUrl(`${APIURL}${employee.profilePhotoUrl}`);
                }
            } catch (error) {
                console.error('Error loading profile photo:', error);
                setPhotoError(true);
            } finally {
                setPhotoLoading(false);
            }
        };

        loadProfilePhoto();
    }, [employee?.profilePhotoUrl]);

    const handleImageError = () => {
        setPhotoError(true);
        setPhotoLoading(false);
    };

    const handleImageLoad = () => {
        setPhotoLoading(false);
        setPhotoError(false);
    };

    if (photoLoading) {
        return (
            <div className={`w-36 h-36 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-md animate-pulse ${className}`}>
                <User size={40} className="text-slate-400" />
            </div>
        );
    }

    if (photoError || !photoUrl) {
        return (
            <div className={`w-36 h-36 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-md ${className}`}>
                <User size={40} className="text-white" />
            </div>
        );
    }

    return (
        <Image
            src={photoUrl}
            alt={employee?.employeeName || 'User'}
            width={144}
            height={144}
            className={`w-36 h-36 object-cover border-2 border-white shadow-lg ${className}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            unoptimized={!photoUrl.startsWith('http')}
        />
    );
};

// Main Dashboard Component
export default function MainDashboardPage() {
    const router = useRouter();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    // Timer for real-time work hours calculation
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 60000);
        return () => clearInterval(id);
    }, []);

    // Fetch all dashboard data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const employeeId = localStorage.getItem("employeeId");
        if (!employeeId) {
            router.replace('/login');
            return;
        }

        try {
            const employeeResponse = await axios.get<Employee>(
                `${APIURL}/api/employees/byEmployeeId/${employeeId}`,
                { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
            );
            const employeeData = employeeResponse.data;
            if (!employeeData) {
                throw new Error('Employee data not found.');
            }
            setEmployee(employeeData);

            let attendanceData: TodayAttendance | null = null;
            try {
                const attendanceResponse = await axios.get<TodayAttendance[]>(
                    `${APIURL}/api/attendance/employee/${employeeId}`,
                    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
                );
                const today = new Date().toISOString().split('T')[0];
                const records = attendanceResponse.data || [];
                const normalizeDate = (dateValue: number[] | string): string => {
                    if (Array.isArray(dateValue) && dateValue.length >= 3) {
                        return `${dateValue[0]}-${String(dateValue[1]).padStart(2, '0')}-${String(dateValue[2]).padStart(2, '0')}`;
                    }
                    if (typeof dateValue === 'string') {
                        return dateValue.split('T')[0];
                    }
                    return '';
                };

                const todayRecord = records.find((record) => normalizeDate(record.date) === today);
                attendanceData = todayRecord || {
                    employeeId: employeeId,
                    date: today,
                    checkInTime: null,
                    checkOutTime: null,
                    status: 'absent',
                    workHours: 0
                };
            } catch (attendanceError) {
                console.warn('Failed to fetch attendance data:', attendanceError);
                attendanceData = {
                    employeeId: employeeId,
                    date: new Date().toISOString().split('T')[0],
                    checkInTime: null,
                    checkOutTime: null,
                    status: 'absent',
                    workHours: 0
                };
            }
            setTodayAttendance(attendanceData);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 404) {
                    setError("Employee not found. Please check your credentials.");
                } else if (err.response?.status === 401) {
                    setError("Unauthorized access. Please login again.");
                    localStorage.removeItem("employeeId");
                    router.replace('/login');
                    return;
                } else if (err.code === 'ECONNABORTED') {
                    setError("Request timeout. Please check your internet connection.");
                } else {
                    setError("Failed to load dashboard data. Please check your network and try again.");
                }
            } else {
                setError("Failed to load dashboard data. An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Calculate effective work hours
    const effectiveWorkHours = useMemo(() => {
        if (!todayAttendance) return 0;
        if (todayAttendance.checkOutTime && todayAttendance.workHours) {
            return todayAttendance.workHours;
        }
        if (todayAttendance.checkInTime) {
            try {
                const [hours, minutes, seconds] = (todayAttendance.checkInTime || '00:00:00').split(':').map((v) => parseInt(v || '0', 10));
                const startTime = new Date();
                startTime.setHours(hours, minutes, seconds || 0, 0);
                const currentTime = new Date();
                const timeDifferenceMs = Math.max(0, currentTime.getTime() - startTime.getTime());
                const workMinutes = Math.round(timeDifferenceMs / 60000);
                return workMinutes / 60;
            } catch (error) {
                console.error('Error calculating work hours:', error);
                return 0;
            }
        }
        return 0;
    }, [todayAttendance, tick]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Loading Dashboard</h2>
                    <p className="text-slate-600 text-sm">Fetching your latest data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !employee) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-800 mb-3">Dashboard Error</h2>
                    <p className="text-red-600 text-sm mb-6">
                        {error || 'Employee data not found. Please check your credentials.'}
                    </p>
                    <button
                        onClick={fetchData}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto text-sm font-semibold"
                    >
                        <Activity size={16} /> Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-4 lg:p-6 max-w-7xl mx-auto">

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Employee Profile Card (Left) */}
                <div className="bg-white/90 p-4 lg:p-6 rounded-3xl border border-slate-200/50 shadow-lg flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <ProfilePhoto employee={employee} className="rounded-2xl" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Shield size={14} className="text-white" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{employee?.employeeName || 'User'}</h3>
                    <p className="text-base text-blue-600 font-semibold">{employee?.position || 'Position'}</p>
                    <p className="text-sm text-slate-500 mb-4">{employee?.department || 'Department'}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <div className="flex items-center text-sm bg-slate-50 p-3 rounded-xl gap-2">
                            <Mail size={16} className="text-blue-500 flex-shrink-0" />
                            <span className="text-slate-700 truncate">{employee?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm bg-slate-50 p-3 rounded-xl gap-2">
                            <Phone size={16} className="text-green-500 flex-shrink-0" />
                            <span className="text-slate-700">{employee?.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm bg-slate-50 p-3 rounded-xl gap-2">
                            <Calendar size={16} className="text-purple-500 flex-shrink-0" />
                            <span className="text-slate-700">
                                {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                        {employee?.bloodGroup && (
                            <div className="flex items-center text-sm bg-slate-50 p-3 rounded-xl gap-2">
                                <Activity size={16} className="text-red-500 flex-shrink-0" />
                                <span className="text-slate-700">{employee.bloodGroup}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Today's Progress Card (Right) */}
                <div className="bg-white/90 p-4 lg:p-6 rounded-3xl border border-slate-200/50 shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Today&apos;s Progress</h3>
                        <p className="text-sm text-slate-500">Your daily productivity tracker</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4">
                        <WorkHoursRing hours={effectiveWorkHours} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                                <Activity size={16} className="text-white" />
                            </div>
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Status</p>
                            <p className="text-sm font-bold text-blue-800 capitalize">
                                {todayAttendance?.status || 'Absent'}
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                                <Clock size={16} className="text-white" />
                            </div>
                            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Hours</p>
                            <p className="text-sm font-bold text-purple-800">
                                {effectiveWorkHours.toFixed(1)}h
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl text-center">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                                <TrendingUp size={16} className="text-white" />
                            </div>
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Efficiency</p>
                            <p className="text-sm font-bold text-emerald-800">
                                {Math.min(Math.round((effectiveWorkHours / 9) * 100), 100)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Check In/Out & Info Card */}
                <div className="bg-white/90 p-4 lg:p-6 rounded-3xl border border-slate-200/50 shadow-lg flex flex-col gap-6">
                    <div className="bg-white/90 p-4 rounded-3xl border border-slate-200/50 shadow-lg text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Attendance Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-xl">
                                <p className="text-xs text-green-600 font-semibold mb-1">Check In</p>
                                <p className="text-xl font-bold text-green-800">
                                    {todayAttendance?.checkInTime || '--:--'}
                                </p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl">
                                <p className="text-xs text-red-600 font-semibold mb-1">Check Out</p>
                                <p className="text-xl font-bold text-red-800">
                                    {todayAttendance?.checkOutTime || '--:--'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/90 p-4 rounded-3xl border border-slate-200/50 shadow-lg text-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors">
                                <Briefcase size={20} className="mb-1" />
                                Leaves
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors">
                                <TrendingUp size={20} className="mb-1" />
                                Performance
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            ---

            {/* Professional Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/90 p-4 lg:p-6 rounded-3xl border border-slate-200/50 shadow-lg flex items-center justify-between transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Clock size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-right ml-4">
                        <p className="text-base text-slate-600 font-bold uppercase tracking-wide mb-1">This Week</p>
                        <p className="text-3xl font-black text-slate-900">{(effectiveWorkHours * 5).toFixed(1)}h</p>
                        <p className="text-xs text-slate-500 font-semibold">Estimated weekly hours</p>
                    </div>
                </div>

                <div className="bg-white/90 p-4 lg:p-6 rounded-3xl border border-slate-200/50 shadow-lg flex items-center justify-between transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Activity size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-right ml-4">
                        <p className="text-base text-slate-600 font-bold uppercase tracking-wide mb-1">Days Active</p>
                        <p className="text-3xl font-black text-slate-900">
                            {employee?.joiningDate ?
                                Math.floor((new Date().getTime() - new Date(employee.joiningDate).getTime()) / (1000 * 3600 * 24))
                                : 0}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold">Since joining</p>
                    </div>
                </div>

                <div className="bg-white/90 p-4 lg:p-6 rounded-3xl border border-slate-200/50 shadow-lg flex items-center justify-between transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-right ml-4">
                        <p className="text-base text-slate-600 font-bold uppercase tracking-wide mb-1">Productivity</p>
                        <p className="text-3xl font-black text-slate-900">{Math.min(Math.round((effectiveWorkHours / 8) * 100), 100)}%</p>
                        <p className="text-xs text-slate-500 font-semibold">Today&apos;s efficiency</p>
                    </div>
                </div>
            </div>
        </div>
    );
}