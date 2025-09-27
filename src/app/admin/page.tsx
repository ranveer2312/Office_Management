'use client';

import Link from 'next/link';
import {
  Users,
  Package,
  Database,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  TrendingUp,
  Zap,
  Activity,
  Award,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { APIURL } from '@/constants/api';

interface RecentActivity {
  id: string;
  name: string;
  description: string;
  activityDate: string;
  activityTime: string;
  category: string;
  status: string;
}

interface Employee {
  id: string;
  name: string;
  department?: string;
  status?: string;
  joiningDate?: string;
  joinDate?: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ActivityData {
  id: string;
  name: string;
  status: string;
}

export default function AdminDashboard() {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    newEmployees: 0,
    activeProjects: 0,
    systemHealth: 0,
    presentToday: 0,
    onLeave: 0,
    tasksCompleted: 0,
    activeToday: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return [];
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        console.error(`Error fetching ${url}:`, response.status);
        return [];
      }

      const text = await response.text();
      if (!text.trim()) {
        return [];
      }

      try {
        return JSON.parse(text);
      } catch {
        console.error(`Invalid JSON from ${url}`);
        return [];
      }
    } catch (err) {
      console.error(`Network error for ${url}:`, err);
      return [];
    }
  };

  const quickActions = [
    {
      title: 'Employee Management',
      description: 'Manage employee records',
      icon: Users,
      href: '/admin/hr',
      color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    },
    {
      title: 'Attendance Tracking',
      description: 'Monitor attendance',
      icon: Clock,
      href: '/admin/attendence',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    },
    {
      title: 'Finance Management',
      description: 'Financial operations',
      icon: DollarSign,
      href: '/admin/finance-manager/dashboard',
      color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    },
    {
      title: 'Inventory Control',
      description: 'Manage Store',
      icon: Package,
      href: '/admin/store',
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate reports',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    },
    {
      title: 'Data Management',
      description: 'System data control',
      icon: Database,
      href: '/admin/data-manager',
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    },
  ];

  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      const data = await fetchWithAuth(`${APIURL}/api/activities`);
      setRecentActivities(Array.isArray(data) ? data.slice(0, 6) : []);
      setActivitiesLoading(false);
    };

    const fetchMetrics = async () => {
      setMetricsLoading(true);

      const employees = await fetchWithAuth(`${APIURL}/api/employees`);
      const attendanceData = await fetchWithAuth(`${APIURL}/api/attendance`);
      const leaveData = await fetchWithAuth(`${APIURL}/api/leave-requests`);
      const activitiesData = await fetchWithAuth(`${APIURL}/api/activities`);

      const totalEmployees = Array.isArray(employees) ? employees.length : 0;
      const activeEmployees = Array.isArray(employees)
        ? employees.filter((emp: Employee) => emp.status === 'active' || !emp.status).length
        : 0;

      const departments = new Set(
        Array.isArray(employees)
          ? employees.map((emp: Employee) => emp.department || '').filter(Boolean)
          : [],
      );
      const totalDepartments = departments.size;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newEmployees = Array.isArray(employees)
        ? employees.filter((emp: Employee) => {
            if (!emp.joiningDate && !emp.joinDate) return false;
            const dateString = emp.joiningDate || emp.joinDate;
            if (!dateString) return false;
            const joinDate = new Date(dateString);
            return !isNaN(joinDate.getTime()) && joinDate >= thirtyDaysAgo;
          }).length
        : 0;

      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = Array.isArray(attendanceData)
        ? attendanceData.filter(
            (record: AttendanceRecord) => record.date === today && record.status === 'present',
          )
        : [];

      const onLeaveToday = Array.isArray(leaveData)
        ? leaveData.filter((leave: LeaveRequest) => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const todayDate = new Date();
            return leave.status === 'Approved' && start <= todayDate && end >= todayDate;
          }).length
        : 0;

      const completedTasks = Array.isArray(activitiesData)
        ? activitiesData.filter((act: ActivityData) => act.status === 'completed').length
        : 0;

      const systemHealth = Math.min(
        98,
        Math.max(85, 95 - (onLeaveToday / (totalEmployees || 1)) * 10 + (todayAttendance.length / (totalEmployees || 1)) * 5),
      );

      setMetrics({
        totalEmployees,
        totalDepartments,
        newEmployees,
        activeProjects: 12,
        systemHealth: Math.round(systemHealth),
        presentToday: todayAttendance.length,
        onLeave: onLeaveToday,
        tasksCompleted: completedTasks,
        activeToday: activeEmployees,
      });

      setMetricsLoading(false);
    };

    fetchActivities();
    fetchMetrics();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Welcome back, Admin
                </h1>
                <p className="text-lg text-slate-600 font-medium">
                  Here&apos;s what&apos;s happening in your organization today.
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Total Employees
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {metricsLoading ? '...' : metrics.totalEmployees}
                  </p>
                  <p className="text-sm text-emerald-600 font-medium mt-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Present Today
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {metricsLoading ? '...' : metrics.presentToday}
                  </p>
                  <p className="text-sm text-slate-600 font-medium mt-2">Employees at work</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Total Departments
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {metricsLoading ? '...' : metrics.totalDepartments}
                  </p>
                  <p className="text-sm text-slate-600 font-medium mt-2">Active departments</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    New Hires
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{metricsLoading ? '...' : metrics.newEmployees}</p>
                  <p className="text-sm text-slate-600 font-medium mt-2">In the last 30 days</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8 mb-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Admin Panel</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div
                    className={`p-8 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 ${action.color}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                      <p className="text-sm opacity-75 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-8 items-stretch">
            {/* Recent Activities */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Recent Activities</h3>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-16"></div>
              </div>
              {activitiesLoading ? (
                <div className="text-center py-12 flex-grow">
                  <div className="inline-flex items-center px-4 py-2 text-slate-600 bg-slate-100 rounded-full">
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading activities...
                  </div>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-4 flex-grow">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-slate-900">
                          {activity.name}
                        </p>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mt-3 space-x-0 sm:space-x-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-2 sm:mb-0 ${
                              activity.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : activity.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {activity.status}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {activity.activityDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 flex-grow">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium">No recent activities</p>
                </div>
              )}
            </div>

            {/* System Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">System Overview</h3>
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-16"></div>
              </div>
              <div className="space-y-4 flex-grow">
                <div className="flex items-center justify-between p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base font-semibold text-slate-900">
                      Present Today
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {metricsLoading ? '...' : metrics.presentToday}
                  </span>
                </div>
                <div className="flex items-center justify-between p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base font-semibold text-slate-900">On Leave</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {metricsLoading ? '...' : metrics.onLeave}
                  </span>
                </div>
                <div className="flex items-center justify-between p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base font-semibold text-slate-900">
                      Tasks Completed
                    </span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    {metricsLoading ? '...' : metrics.tasksCompleted}
                  </span>
                </div>
                {/* Updated card with improved responsiveness */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-violet-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-violet-500 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base font-semibold text-slate-900">
                      System Status
                    </span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600 mt-2 sm:mt-0">Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}