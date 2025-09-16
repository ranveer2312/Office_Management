'use client';
import React, { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  LucideIcon,
  Building,
  Briefcase,
  Search,
  Eye,
} from 'lucide-react';
import { APIURL } from '@/constants/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Updated type definition to match the backend's property names
interface Employee {
  id?: number;
  employeeName: string;
  employeeId: string;
  department?: string;
  status?: string;
  joinDate?: string;
  email?: string;
  phone?: string;
  // Add other properties as needed
}

// Reusable StatCard component
interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  trend?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

const StatCard = ({ icon: Icon, title, value, trend, color = 'blue' }: StatCardProps) => {
  const colorMap = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-600', trendText: 'text-blue-500' },
    purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-600', trendText: 'text-purple-500' },
    green: { iconBg: 'bg-green-50', iconText: 'text-green-600', trendText: 'text-green-500' },
    orange: { iconBg: 'bg-orange-50', iconText: 'text-orange-600', trendText: 'text-orange-500' },
  };

  const { iconBg, iconText, trendText } = colorMap[color];

  return (
    <motion.div
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-gray-500 mb-1">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm ${trendText} flex items-center mt-2`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${iconBg}`}>
          <Icon className={`w-7 h-7 ${iconText}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default function HRDashboard() {
  const [totalWorkforce, setTotalWorkforce] = useState<number | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [newHires, setNewHires] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    setLoadingStats(true);
    setLoadingEmployees(true);
    setErrorStats(null);

    fetch(APIURL + '/api/employees')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then((data: Employee[]) => {
        setEmployees(data);
        setTotalWorkforce(data.length);
        const uniqueDepartments = Array.from(new Set(data.map((e) => (e as { department?: string }).department ?? '')));
        setDepartments(uniqueDepartments);

        const now = new Date();
        const hires = data.filter((e) => {
          if (!e.joinDate) return false;
          const joinDate = new Date(e.joinDate);
          const diffInDays = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
          return diffInDays <= 30;
        });
        setNewHires(hires.length);
      })
      .catch(() => setErrorStats('Failed to fetch employee data'))
      .finally(() => {
        setLoadingStats(false);
        setLoadingEmployees(false);
      });
  }, []);

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toString().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' ||
      (employee as { department?: string }).department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
            HR Management Dashboard
          </h1>
          <p className="text-gray-500 text-lg">
            Streamline your workforce management and gain key insights.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <StatCard
            icon={Users}
            title="Total Employees"
            value={loadingStats ? '...' : errorStats ? '!' : totalWorkforce?.toString() || '0'}
            color="blue"
            trend="+12% from last month"
          />
          <StatCard
            icon={Building}
            title="Departments"
            value={loadingStats ? '...' : errorStats ? '!' : departments.length.toString()}
            color="purple"
          />
          <StatCard
            icon={Briefcase}
            title="New Hires"
            value={loadingStats ? '...' : errorStats ? '!' : newHires?.toString() || '0'}
            color="orange"
            trend="Last 30 days"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Employee List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
                <h2 className="text-2xl font-bold text-gray-900">Employee Directory</h2>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-white/70 border border-gray-200 rounded-2xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-colors"
                    />
                  </div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-6 py-3 bg-white/70 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto transition-colors"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
              </div>
              </div>

              {loadingEmployees ? (
                <div className="text-center py-12 text-gray-500 animate-pulse">
                  <div className="flex flex-col space-y-6">
                    <div className="h-20 bg-gray-200/70 rounded-xl"></div>
                    <div className="h-20 bg-gray-200/70 rounded-xl"></div>
                    <div className="h-20 bg-gray-200/70 rounded-xl"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredEmployees.slice(0, 10).map((employee) => (
                    <motion.div
                      key={employee.id}
                      className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-100/70 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-6 mb-6 sm:mb-0">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 truncate">{employee.employeeName}</h3>
                          <div className="flex flex-col mt-2 text-sm text-gray-500">
                            <span><span className="font-bold">Emp. ID:</span> {employee.employeeId}</span>
                            <span><span className="font-bold">Dept:</span> {(employee as { department?: string }).department || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          employee.status === 'Active' ? 'bg-green-100/70 text-green-800' : 'bg-gray-100/70 text-gray-800'
                        }`}>
                          {employee.status || 'Active'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/hr/employees/${employee.id}`}
                            className="p-3 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50/70 transition-colors"
                            title="View Employee Details"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredEmployees.length > 10 && (
                    <div className="text-center pt-6">
                      <button className="text-blue-600 hover:text-blue-800 font-bold">
                        View All {filteredEmployees.length} Employees
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Section */}
          <div className="space-y-10">
            {/* Recent Activities */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent HR Activities</h3>
              <div className="text-center py-8 text-gray-500">
                Activity data not available.
              </div>
            </div>

            {/* Department Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Department Overview</h3>
              <div className="space-y-6">
                {departments.slice(0, 5).map((dept, idx) => {
                  const deptEmployees = employees.filter(emp => (emp as { department?: string }).department === dept);
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-600" />
                        <span className="text-base font-semibold text-gray-900">{dept || 'Unassigned'}</span>
                      </div>
                      <span className="text-base text-gray-500 font-semibold">{deptEmployees.length} employees</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}