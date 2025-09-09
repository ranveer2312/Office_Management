'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    User,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    Building,
    X,
    XCircle,
    AlertCircle,
    Loader2,
    Calendar,
} from 'lucide-react';

// Interfaces for data type
interface Employee {
    id?: number;
    employeeId: string;
    employeeName: string;
    email: string;
    phoneNumber: string;
    bloodGroup: string;
    profilePhotoUrl?: string;
    profilePhotoPublicId?: string;
    currentAddress: string;
    permanentAddress: string;
    password?: string;
    position: string;
    department: string;
    joiningDate: string;
    relievingDate?: string;
    status: string; // Joining, Active, Relieving
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Enhanced API Service
class ApiService {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
        };
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Authentication failed. Please login again.');
            }

            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                try {
                    errorMessage = await response.text() || errorMessage;
                } catch {
                    // Keep the default error message
                }
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success !== undefined) {
            return data;
        } else {
            return {
                success: true,
                data: data,
                message: 'Success'
            };
        }
    }

    async getEmployeeProfile(employeeId: string): Promise<ApiResponse<Employee>> {
        const response = await fetch(`${this.baseURL}/employees/byEmployeeId/${employeeId}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        return this.handleResponse<Employee>(response);
    }

    async updateEmployeeProfile(employeeId: string, data: Partial<Employee>): Promise<ApiResponse<Employee>> {
        const response = await fetch(`${this.baseURL}/employees/byEmployeeId/${employeeId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse<Employee>(response);
    }

    async uploadProfilePhoto(employeeId: string, file: File): Promise<ApiResponse<{ profilePhotoUrl: string }>> {
        const formData = new FormData();
        formData.append('profilePhoto', file);

        const response = await fetch(`${this.baseURL}/employees/${employeeId}/photo`, {
            method: 'POST',
            body: formData,
        });

        return this.handleResponse<{ profilePhotoUrl: string }>(response);
    }
}

// Profile page component
export default function EmployeeProfilePage() {
    const router = useRouter();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const apiService = useMemo(() => new ApiService(API_BASE_URL), []);

    const loadEmployeeData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const employeeId = localStorage.getItem('employeeId');
            if (!employeeId) {
                router.replace('/login');
                return;
            }

            const profileResponse = await apiService.getEmployeeProfile(employeeId);

            if (profileResponse.success) {
                setEmployee(profileResponse.data);
            } else {
                setError(profileResponse.error || 'Failed to load profile');
            }

        } catch (err) {
            if (err instanceof Error && err.message.includes('Authentication failed')) {
                router.replace('/login');
                return;
            }
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            console.error('Error loading employee data:', err);
        } finally {
            setLoading(false);
        }
    }, [apiService, router]);

    useEffect(() => {
        loadEmployeeData();
    }, [loadEmployeeData]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateExperience = (joiningDate: string) => {
        if (!joiningDate) return 'Not specified';
        const joinDate = new Date(joiningDate);
        const today = new Date();
        let years = today.getFullYear() - joinDate.getFullYear();
        let months = today.getMonth() - joinDate.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        const yearsString = years > 0 ? `${years} year${years !== 1 ? 's' : ''}` : '';
        const monthsString = months > 0 ? `${months} month${months !== 1 ? 's' : ''}` : '';

        if (yearsString && monthsString) {
            return `${yearsString} ${monthsString}`;
        } else if (yearsString) {
            return yearsString;
        } else if (monthsString) {
            return monthsString;
        } else {
            return 'Less than a month';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'joining': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'relieving': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (error && !employee && !loading) {
        return (
            <div className="min-h-screen bg-gray-50/70 flex items-center justify-center p-6"> {/* Changed opacity here */}
                <div className="text-center max-w-md mx-auto p-8 bg-white bg-opacity-90 rounded-2xl shadow-xl border border-gray-100">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
                    <p className="text-gray-600 mb-6">{error}</p>

                    <div className="bg-red-50 rounded-xl p-4 mb-6 text-left border border-red-100">
                        <p className="text-sm text-red-600 mb-2 font-semibold">API Endpoint:</p>
                        <p className="text-xs text-red-500 break-all font-mono bg-red-100 p-2 rounded">
                            {API_BASE_URL}/employees/byEmployeeId/[employeeId]
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={loadEmployeeData}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Retry Loading Profile'}
                        </button>

                        <button
                            onClick={() => router.replace('/login')}
                            className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold"
                        >
                            Back to Login
                        </button>

                        <div className="text-xs text-gray-500 mt-6 bg-gray-50 rounded-xl p-4">
                            <p className="font-semibold mb-2">Troubleshooting:</p>
                            <ul className="list-disc list-inside space-y-1 text-left">
                                <li>Check if your backend server is running</li>
                                <li>Verify the API URL is correct</li>
                                <li>Ensure database connection is active</li>
                                <li>Check if you&apos;re properly logged in</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white bg-opacity-90 rounded-2xl p-12 text-center shadow-xl border border-gray-100">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-6" />
                    <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!employee) return null;

    return (
        <div className="min-h-screen bg-gray-50/70"> {/* Changed opacity here */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-4 mx-auto max-w-7xl mb-6 mt-6 rounded-xl bg-opacity-90">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm flex-grow">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0 p-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
                    <p className="text-gray-600 mt-2">View and manage your personal information</p>
                    <p className="text-sm text-gray-500 mt-1">Employee ID: {employee.employeeId}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Summary Card - Left Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-8">
                            <div className="text-center mb-8">
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                        {employee.profilePhotoUrl ? (
                                            <Image
                                                src={employee.profilePhotoUrl.startsWith('http')
                                                    ? employee.profilePhotoUrl
                                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${employee.profilePhotoUrl}`
                                                }
                                                alt="Profile"
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover"
                                                unoptimized={!employee.profilePhotoUrl.startsWith('http')}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold">
                                                {employee.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 px-3 py-1 text-xs font-semibold rounded-full border-2 border-white shadow-sm ${getStatusColor(employee.status)}`}>
                                        {employee.status}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{employee.employeeName}</h2>
                                <p className="text-blue-600 font-semibold text-lg mb-1">{employee.position}</p>
                                <p className="text-gray-600 font-medium">{employee.department}</p>
                            </div>

                            <div className="border-t border-gray-100 pt-6 space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-gray-900 font-medium break-all">{employee.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Phone className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                                        <p className="text-gray-900 font-medium">{employee.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Building className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Employee ID</p>
                                        <p className="text-gray-900 font-medium">{employee.employeeId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Detailed Information Cards - Right Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information Card */}
                        <div className="bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 bg-opacity-90">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-xl mr-4">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
                                        <p className="text-gray-900 font-semibold text-lg">{employee.employeeName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
                                        <p className="text-gray-900 font-medium">{employee.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Phone Number</label>
                                        <p className="text-gray-900 font-medium">{employee.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Blood Group</label>
                                        <span className="inline-flex px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
                                            {employee.bloodGroup}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Card */}
                        <div className="bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 bg-opacity-90">
                                <div className="flex items-center">
                                    <div className="p-2 bg-emerald-100 rounded-xl mr-4">
                                        <Briefcase className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Professional Information</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Position</label>
                                        <p className="text-gray-900 font-semibold text-lg">{employee.position}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Department</label>
                                        <p className="text-gray-900 font-medium">{employee.department}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date of Joining</label>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <p className="text-gray-900 font-medium">{formatDate(employee.joiningDate)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience</label>
                                        <p className="text-gray-900 font-medium">{calculateExperience(employee.joiningDate)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</label>
                                        <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(employee.status)}`}>
                                            {employee.status}
                                        </span>
                                    </div>
                                    {employee.relievingDate && (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Relieving Date</label>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <p className="text-gray-900 font-medium">{formatDate(employee.relievingDate)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information Card */}
                        <div className="bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 bg-opacity-90">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-xl mr-4">
                                        <MapPin className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Address Information</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Address</label>
                                        <p className="text-gray-900 font-medium text-base leading-relaxed">{employee.currentAddress || 'Not specified'}</p>
                                    </div>
                                    <div className="border-t border-gray-100 pt-8">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Permanent Address</label>
                                        <p className="text-gray-900 font-medium text-base leading-relaxed">{employee.permanentAddress || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}