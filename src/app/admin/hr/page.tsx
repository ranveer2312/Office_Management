'use client';
import React, { useEffect, useState } from 'react';
import {
    Users,
    TrendingUp,
    Building,
    Briefcase,
    Search,
    Mail,
    Award,
    CheckCircle,
    UserPlus,
    // Removed unused icons: GraduationCap
} from 'lucide-react';
import Image from 'next/image'; // Import the Next.js Image component

interface Employee {
    id: string | number;
    employeeName?: string;
    email?: string;
    phoneNumber?: string;
    position?: string;
    department?: string;
    status?: string;
    joinDate?: string;
    profilePhotoUrl?: string;
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string;
    trend?: string;
    color?: string;
    bgColor?: string;
}

interface Activity {
    icon: string;
    title: string;
    time: string;
    status: 'completed' | 'pending' | 'rejected';
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    Users,
    CheckCircle,
    TrendingUp,
    Award,
    UserPlus,
    Building,
    // Note: GraduationCap was removed from imports
    Briefcase,
};

export default function HRDashboard() {
    const [totalWorkforce, setTotalWorkforce] = useState<number | null>(null);
    const [departments, setDepartments] = useState<string[]>([]);
    const [newHires, setNewHires] = useState<number | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [errorStats, setErrorStats] = useState<string | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [errorEmployees, setErrorEmployees] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [errorActivities, setErrorActivities] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoadingStats(true);
            setLoadingEmployees(true);
            try {
                const employeesResponse = await fetch('http://localhost:8080api/employees');
                if (!employeesResponse.ok) {
                    throw new Error('Failed to fetch employees');
                }
                const employeesData: Employee[] = await employeesResponse.json();
                
                if (Array.isArray(employeesData)) {
                    setEmployees(employeesData);
                    setTotalWorkforce(employeesData.length);
                    
                    // FIX: Explicitly use Employee type for map callback
                    const uniqueDepartments = Array.from(new Set(employeesData.map((e: Employee) => e.department || 'Unassigned')));
                    setDepartments(uniqueDepartments);
                    
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    
                    // FIX: Explicitly use Employee type for filter callback
                    setNewHires(employeesData.filter((e: Employee) => e.joinDate && new Date(e.joinDate) > oneMonthAgo).length);
                } else {
                    throw new Error("Invalid data format from API.");
                }
            } catch (error: unknown) { // Use unknown for safety
                console.error("Failed to fetch dashboard data:", error);
                setErrorStats("Failed to load dashboard statistics.");
                setErrorEmployees("Failed to load employee directory.");
            } finally {
                setLoadingStats(false);
                setLoadingEmployees(false);
            }
        };

        const fetchActivities = async () => {
            setLoadingActivities(true);
            try {
                const activitiesResponse = await fetch('http://localhost:8080api/activities');
                if (!activitiesResponse.ok) {
                    throw new Error('Failed to fetch activities');
                }
                const activitiesData = await activitiesResponse.json();
                setActivities(activitiesData);
            } catch (error: unknown) { // Use unknown for safety
                console.error("Failed to fetch activities:", error);
                setErrorActivities("Failed to load recent activities.");
            } finally {
                setLoadingActivities(false);
            }
        };

        fetchDashboardData();
        fetchActivities();
    }, []);

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.id?.toString().includes(searchTerm.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' ||
            employee.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const StatCard = ({ icon: Icon, title, value, trend, color = 'slate', bgColor = 'bg-slate-50' }: StatCardProps) => (
        <div className="bg-white/90 rounded-xl p-6 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className="text-sm text-green-600 flex items-center mt-2">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`p-4 rounded-xl ${bgColor} border border-gray-50`}>
                    <Icon className={`w-7 h-7 text-${color}-600`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="border-b border-gray-200 pb-6 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Human Resources Dashboard</h1>
                        <p className="text-lg text-gray-600">Comprehensive workforce management and analytics overview</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {loadingStats ? (
                        <div className="md:col-span-3 text-center py-8">Loading stats...</div>
                    ) : errorStats ? (
                        <div className="md:col-span-3 text-center py-8 text-red-500">{errorStats}</div>
                    ) : (
                        <>
                            <StatCard
                                icon={Users}
                                title="Total Employees"
                                value={totalWorkforce?.toString() || '0'}
                                trend="+17% from last month"
                                color="blue"
                                bgColor="bg-blue-50"
                            />
                            <StatCard
                                icon={Building}
                                title="Departments"
                                value={departments.length.toString()}
                                color="purple"
                                bgColor="bg-purple-50"
                            />
                            <StatCard
                                icon={UserPlus}
                                title="New Hires"
                                value={newHires?.toString() || '0'}
                                trend="Last 30 days"
                                color="emerald"
                                bgColor="bg-emerald-50"
                            />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white/90 rounded-xl border border-gray-100 shadow-sm">
                            <div className="border-b border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                                    <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                                        <div className="relative w-full">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search employees..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all"
                                            />
                                        </div>
                                        <select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full sm:w-auto"
                                        >
                                            <option value="all">All Departments</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-12">
                                {loadingEmployees ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-pulse" />
                                        Loading employees...
                                    </div>
                                ) : errorEmployees ? (
                                    <div className="text-center py-12 text-red-500">{errorEmployees}</div>
                                ) : (
                                    <div className="max-h-96 overflow-x-auto">
                                        <table className="min-w-full table-auto">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Employee</th>
                                                    <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</th>
                                                    <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Department</th>
                                                    <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredEmployees.map((employee) => (
                                                    <tr key={employee.id} className="hover:bg-gray-25 transition-colors group">
                                                        <td className="py-4 px-2">
                                                            <div className="flex items-center space-x-4">
                                                                {employee.profilePhotoUrl ? (
                                                                    <Image // FIX: Replaced <img> with <Image />
                                                                        src={employee.profilePhotoUrl}
                                                                        alt={employee.employeeName || 'Profile'}
                                                                        className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                                                                        width={48}
                                                                        height={48}
                                                                        unoptimized
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                                                                        <Users className="w-6 h-6 text-blue-600" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <h3 className="font-semibold text-gray-900 text-base truncate">{employee.employeeName}</h3>
                                                                    <p className="text-sm text-gray-600 truncate">{employee.position || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-gray-700 truncate">{employee.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Building className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-700">{employee.department || 'Unassigned'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-2">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                                employee.status === 'Active'
                                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                                                                }`}>
                                                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                                                    employee.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'
                                                                }`} />
                                                                {employee.status || 'Active'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white/90 rounded-xl border border-gray-100 shadow-sm">
                            <div className="border-b border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
                                <h3 className="font-bold text-gray-900">Recent Activities</h3>
                            </div>
                            <div className="p-1">
                                {loadingActivities ? (
                                    <div className="text-center text-gray-500">Loading...</div>
                                ) : errorActivities ? (
                                    <div className="text-center text-red-500">{errorActivities}</div>
                                ) : (
                                    <div className="space-y-3">
                                        {activities.map((activity, idx) => {
                                            const Icon = iconMap[activity.icon] || Users;
                                            return (
                                                <div key={idx} className="flex items-start space-x-3 p-3 border border-gray-50 rounded-lg hover:bg-gray-25 transition-colors">
                                                    <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                                                        <Icon className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                                        activity.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                        activity.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                        'bg-red-50 text-red-700 border border-red-200'
                                                        }`}>
                                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                                            activity.status === 'completed' ? 'bg-green-400' : 'bg-gray-400'
                                                        }`} />
                                                        {activity.status}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/90 rounded-xl border border-gray-100 shadow-sm">
                            <div className="border-b border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
                                <h3 className="font-bold text-gray-900">Department Overview</h3>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    {departments.map((dept, idx) => {
                                        const deptEmployees = employees.filter(emp => emp.department === dept);
                                        return (
                                            <div key={idx} className="flex items-center justify-between p-3 border border-gray-50 rounded-lg hover:bg-gray-25 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <Building className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                    <span className="text-sm font-medium text-gray-900">{dept || 'Unassigned'}</span>
                                                </div>
                                                <span className="text-sm text-gray-600 font-semibold bg-gray-50 px-2 py-1 rounded">{deptEmployees.length}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}