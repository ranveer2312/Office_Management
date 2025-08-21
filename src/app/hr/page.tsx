'use client';


import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  TrendingDown,
  Briefcase,
  UserPlus,
  Calendar,
  TrendingUp,
  X,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';
import { APIURL } from '@/constants/api';
import Link from 'next/link';


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
          stroke="#F1F5F9"
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
          <div className="text-2xl font-bold text-slate-900">{segments.reduce((sum: number, seg: PieChartSegment) => sum + (seg.percentage || 0), 0)}</div>
          <div className="text-sm text-slate-600">Total</div>
        </div>
      </div>
    </div>
  );
};


// Attendance Graph
interface AttendanceData {
  day: string;
  present: number;
  absent: number;
  late: number;
}


interface AttendanceGraphProps {
  data: AttendanceData[];
}


const AttendanceGraph: React.FC<AttendanceGraphProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-500">No attendance data available</div>;
  }


  const maxValue = Math.max(1, ...data.map((d: AttendanceData) => Math.max(d.present || 0, d.absent || 0, d.late || 0)));
  const chartWidth = 320;
  const chartHeight = 160;
  const barWidth = chartWidth / data.length;
  const padding = 20;


  return (
    <div className="w-full">
      <svg width={chartWidth} height={chartHeight + padding} className="mx-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={0}
            y1={chartHeight - (chartHeight - padding) * ratio}
            x2={chartWidth}
            y2={chartHeight - (chartHeight - padding) * ratio}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
       
        {/* Bars */}
        {data.map((item, index) => {
          const x = index * barWidth;
          const presentHeight = Math.max(0, ((item.present || 0) / maxValue) * (chartHeight - padding));
          const absentHeight = Math.max(0, ((item.absent || 0) / maxValue) * (chartHeight - padding));
          const lateHeight = Math.max(0, ((item.late || 0) / maxValue) * (chartHeight - padding));
         
          return (
            <g key={`${item.day}-${index}`}>
              {/* Present bar */}
              <rect
                x={x + barWidth * 0.1}
                y={chartHeight - presentHeight}
                width={barWidth * 0.25}
                height={presentHeight}
                fill="#3B82F6"
                rx="2"
                className="transition-all duration-500"
              />
              {/* Absent bar */}
              <rect
                x={x + barWidth * 0.375}
                y={chartHeight - absentHeight}
                width={barWidth * 0.25}
                height={absentHeight}
                fill="#EF4444"
                rx="2"
                className="transition-all duration-500"
              />
              {/* Late bar */}
              <rect
                x={x + barWidth * 0.65}
                y={chartHeight - lateHeight}
                width={barWidth * 0.25}
                height={lateHeight}
                fill="#F59E0B"
                rx="2"
                className="transition-all duration-500"
              />
              {/* Day label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 15}
                textAnchor="middle"
                className="text-xs fill-slate-600"
              >
                {item.day}
              </text>
            </g>
          );
        })}
       
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <text
            key={i}
            x={-5}
            y={chartHeight - (chartHeight - padding) * ratio + 4}
            textAnchor="end"
            className="text-xs fill-slate-500"
          >
            {Math.round(maxValue * ratio)}
          </text>
        ))}
      </svg>
    </div>
  );
};


export default function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    departments: 0,
    departmentData: [],
    performanceData: [],
    attendanceData: []
  });
  const [quickStats, setQuickStats] = useState({ onLeaveToday: 0, newApplicants: 0, pendingReviews: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    email: '',
    password: '',
    phoneNumber: '',
    bloodGroup: '',
    currentAddress: '',
    permanentAddress: '',
    position: '',
    department: '',
    joiningDate: '',
    status: 'Active',
    profilePhotoUrl: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumberOnly, setPhoneNumberOnly] = useState('');
  const [formError, setFormError] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesResponse = await fetch(`${APIURL}/api/employees`);
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
       
        // Fetch attendance data
        const attendanceResponse = await fetch(`${APIURL}/api/attendance`);
        const attendanceData = await attendanceResponse.json();
       
        // Fetch performance data
        const performanceResponse = await fetch(`${APIURL}/api/performance`);
        const performanceData = await performanceResponse.json();
       
        // Fetch quick stats
        try {
          const quickStatsResponse = await fetch(`${APIURL}/api/hr/quick-stats`);
          const quickStatsData = await quickStatsResponse.json();
          setQuickStats(quickStatsData);
        } catch { setQuickStats({ onLeaveToday: 23, newApplicants: 12, pendingReviews: 8 }); }
       
        // Fetch recent activities
        try {
          const activitiesResponse = await fetch(`${APIURL}/api/hr/recent-activities`);
          const activitiesData = await activitiesResponse.json();
          setRecentActivities(activitiesData.slice(0, 5));
        } catch { setRecentActivities([]); }
       
        // Calculate employee metrics
        const totalEmployees = employeesData.length;
        const activeEmployees = employeesData.filter((emp: any) => emp.status === 'Active' || !emp.status).length;
       
        // New hires in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newHires = employeesData.filter((emp: any) => {
          if (!emp.joinDate) return false;
          const joinDate = new Date(emp.joinDate);
          return joinDate >= thirtyDaysAgo;
        }).length;
       
        // Department analysis
        const deptCounts: Record<string, number> = {};
        employeesData.forEach((emp: any) => {
          const dept = emp.department || 'Others';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
       
        const departmentData = Object.entries(deptCounts).map(([label, count]) => ({
          label,
          percentage: Math.round((count / totalEmployees) * 100)
        }));
       
        // Process attendance data
        const processedAttendanceData = attendanceData.length > 0 ?
          attendanceData.slice(0, 5).map((item: any, index: number) => ({
            day: item.day || item.date || `Day ${index + 1}`,
            present: item.present || 0,
            absent: item.absent || 0,
            late: item.late || 0
          })) : [
            { day: 'Mon', present: 1150, absent: 45, late: 85 },
            { day: 'Tue', present: 1200, absent: 30, late: 50 },
            { day: 'Wed', present: 1100, absent: 60, late: 120 },
            { day: 'Thu', present: 1180, absent: 40, late: 60 },
            { day: 'Fri', present: 1050, absent: 80, late: 150 }
          ];
       
        // Process performance data
        const processedPerformanceData = performanceData.length > 0 ?
          performanceData.map((item: any) => ({
            label: item.rating || item.label,
            percentage: item.percentage || item.count
          })) : [
            { label: 'Excellent', percentage: 40 },
            { label: 'Good', percentage: 35 },
            { label: 'Average', percentage: 20 },
            { label: 'Needs Improvement', percentage: 5 }
          ];
       
        setMetrics({
          totalEmployees,
          activeEmployees,
          newHires,
          departments: Object.keys(deptCounts).length,
          departmentData,
          performanceData: processedPerformanceData,
          attendanceData: processedAttendanceData
        });
       
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
   
    fetchData();
  }, []);


  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">HR Dashboard</h1>
            <p className="text-slate-600">Comprehensive workforce analytics and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <span className="text-sm font-medium text-slate-600">Last Updated:</span>
              <span className="text-sm font-semibold text-slate-900 ml-1">Just now</span>
            </div>
          </div>
        </div>
      </div>


      {/* Key Metrics */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Key Performance Indicators</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Total Workforce"
            value={loading ? "..." : metrics.totalEmployees.toLocaleString()}
            change="+5.2%"
            changeType="positive"
            icon={Users}
            subtitle="vs last month"
          />
          <MetricCard
            title="Active Employees"
            value={loading ? "..." : metrics.activeEmployees.toLocaleString()}
            change="+2.1%"
            changeType="positive"
            icon={UserCheck}
            subtitle="currently active"
          />
          <MetricCard
            title="New Hires (30d)"
            value={loading ? "..." : metrics.newHires.toString()}
            change="+12.5%"
            changeType="positive"
            icon={TrendingDown}
            subtitle="recruitment rate"
          />
          <MetricCard
            title="Departments"
            value={loading ? "..." : metrics.departments.toString()}
            change="Stable"
            changeType="neutral"
            icon={Briefcase}
            subtitle="organizational units"
          />
        </div>
      </div>


      {/* Analytics Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Workforce Analytics</h2>
          <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <ChartCard title="Department Distribution" className="xl:col-span-1">
            <PieChart segments={loading ? [
              { label: 'Loading...', percentage: 100 }
            ] : metrics.departmentData} />
          </ChartCard>


          <ChartCard title="Weekly Attendance Trends" className="xl:col-span-1">
            <div className="w-full space-y-4">
              <AttendanceGraph data={metrics.attendanceData} />
              <div className="flex justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600 font-medium">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-slate-600 font-medium">Absent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-slate-600 font-medium">Late</span>
                </div>
              </div>
            </div>
          </ChartCard>


          <ChartCard title="Performance Ratings" className="xl:col-span-1">
            <PieChart segments={metrics.performanceData} size={160} />
          </ChartCard>
        </div>
      </div>


      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setShowAddEmployeeModal(true)} className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Add Employee</span>
            </button>
            <Link href="/hr/leaves" className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Manage Leaves</span>
            </Link>
          </div>
        </div>


        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <Link href="/hr/activities" className="text-blue-600 text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.description} • {activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-4">
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
     


      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
                <button onClick={() => setShowAddEmployeeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      placeholder="EMPTA001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                      </select>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={phoneNumberOnly}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setPhoneNumberOnly(val);
                          setFormData({...formData, phoneNumber: countryCode + val});
                        }}
                        placeholder="10 digit number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    >
                      <option value="">Select Department</option>
                      <option value="Sales and marketing">Sales and marketing</option>
                      <option value="IT">IT</option>
                      <option value="Backend operations">Backend operations</option>
                      <option value="design and development">Design and development</option>
                      <option value="HR">HR</option>
                      <option value="Manpower and internship">Manpower and internship</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Joining">Joining</option>
                      <option value="Exit">Exit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.currentAddress}
                    onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})}
                  />
                </div>
                {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={async () => {
                      setFormError('');
                      if (!formData.email || !formData.email.includes('@')) {
                        setFormError('Please enter a valid email address.');
                        return;
                      }
                      if (!formData.password || formData.password.length < 8) {
                        setFormError('Password must be at least 8 characters.');
                        return;
                      }
                      if (!phoneNumberOnly || phoneNumberOnly.length !== 10) {
                        setFormError('Phone number must be exactly 10 digits.');
                        return;
                      }
                      try {
                        const response = await fetch(`${APIURL}/api/employees`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(formData)
                        });
                        if (response.ok) {
                          setShowAddEmployeeModal(false);
                          setFormData({
                            employeeId: '', employeeName: '', email: '', password: '',
                            phoneNumber: '', bloodGroup: '', currentAddress: '', permanentAddress: '',
                            position: '', department: '', joiningDate: '', status: 'Active', profilePhotoUrl: ''
                          });
                          setPhoneNumberOnly('');
                        } else {
                          setFormError('Failed to add employee. Please try again.');
                        }
                      } catch (error) {
                        setFormError('Network error. Please try again.');
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

