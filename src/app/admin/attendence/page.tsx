'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Download,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
} from 'lucide-react';

import axios from 'axios';
import { APIURL } from '@/constants/api';

// --- Interface Definitions ---
interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  signIn: string | null;
  signOut: string | null;
  status: 'present' | 'absent' | 'half-day' | 'late' | 'not_marked';
  workHours: number;
  workLocation: string | null;
  // New field to capture late arrival status
  arrivalStatus?: 'Late' | 'On-Time' | 'N/A';
}

interface BackendAttendanceRecord {
  employeeId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'absent' | 'half-day' | 'late' | 'not_marked';
  workHours: number;
  employeeName?: string;
  department?: string;
  workLocation?: string | null;
  // New field from backend
  arrivalStatus?: string | null;
}

interface AttendanceStats {
  present?: number;
  late?: number;
  'half-day'?: number;
  absent?: number;
  total?: number;
  totalWorkHours: number;
  avgWorkHours: string;
}

type SortOrder = 'none' | 'asc' | 'desc';

export default function AdminAttendanceDashboard() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  const getDateRange = useCallback(() => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (viewMode) {
      case 'today':
        break;
      case 'week':
        const dayOfWeek = today.getDay();
        startDate.setDate(today.getDate() - dayOfWeek);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'month':
        startDate.setDate(1);
        endDate.setDate(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate());
        break;
      case 'year':
        startDate.setMonth(0, 1);
        endDate.setMonth(11, 31);
        break;
      default:
        break;
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  }, [viewMode]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const { startDate, endDate } = getDateRange();

        const attendanceResponse = await axios.get(`${APIURL}/api/attendance/by-date-range`, {
          params: { startDate, endDate }
        });

        const mappedData: AttendanceRecord[] = attendanceResponse.data.map((record: BackendAttendanceRecord) => {
          return {
            employeeId: record.employeeId,
            employeeName: record.employeeName || 'Unknown',
            department: record.department || 'Unknown',
            date: record.date,
            signIn: record.checkInTime,
            signOut: record.checkOutTime,
            status: record.status,
            workHours: record.workHours || 0,
            workLocation: record.workLocation || '-',
            arrivalStatus: (record.arrivalStatus as 'Late' | 'On-Time') || 'N/A',
          };
        });

        setAttendanceData(mappedData);
      } catch (err: Error | unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to fetch attendance data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
    setSortOrder('none');
  }, [viewMode, getDateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'half-day':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'late':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'half-day':
        return <AlertCircle className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatWorkHours = (hours: number): string => {
    if (hours === 0) return '0 mins';

    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs === 0) {
      return `${mins} mins`;
    } else if (mins === 0) {
      return `${hrs} hour${hrs > 1 ? 's' : ''}`;
    } else {
      return `${hrs} hour${hrs > 1 ? 's' : ''} ${mins} mins`;
    }
  };

  const sortedAndFilteredData = useMemo(() => {
    let data = attendanceData.filter(record => {
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesSearch = (record.employeeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesSearch;
    });

    if (sortOrder !== 'none') {
      data = data.sort((a, b) => {
        const timeA = a.signIn ? new Date(`${a.date}T${a.signIn}`) : null;
        const timeB = b.signIn ? new Date(`${b.date}T${b.signIn}`) : null;

        if (!timeA && !timeB) return 0;
        if (!timeA) return sortOrder === 'asc' ? 1 : -1;
        if (!timeB) return sortOrder === 'asc' ? -1 : 1;

        const comparison = timeA.getTime() - timeB.getTime();

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return data;
  }, [attendanceData, selectedDepartment, searchTerm, sortOrder]);

  const filteredData = sortedAndFilteredData;

  const calculateStats = () => {
    const stats = filteredData.reduce((acc, record) => {
      if (record.arrivalStatus === 'Late') {
        acc.late = (acc.late || 0) + 1;
        // Late arrivals are also considered present
        acc.present = (acc.present || 0) + 1;
      } else if (record.status !== 'not_marked') {
        acc[record.status] = (acc[record.status] || 0) + 1;
      }

      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalWorkHours = filteredData.reduce((sum, record) => sum + record.workHours, 0);
    const avgWorkHours = stats.total > 0 ? (totalWorkHours / stats.total).toFixed(1) : '0';

    return { ...stats, totalWorkHours, avgWorkHours };
  };

  const stats: AttendanceStats = calculateStats();
  const departments = [...new Set(attendanceData.map(record => record.department))].filter(Boolean);

  const handleMonthlyExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const start = formatDate(startDate);
      const end = formatDate(endDate);
      const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

      const response = await axios.get(`${APIURL}/api/attendance/by-date-range`, {
        params: { startDate: start, endDate: end }
      });

      const allMonthlyRecords: AttendanceRecord[] = response.data.map((record: BackendAttendanceRecord) => ({
        employeeId: record.employeeId,
        employeeName: record.employeeName || 'Unknown',
        department: record.department || 'Unknown',
        date: record.date,
        signIn: record.checkInTime || '-',
        signOut: record.checkOutTime || '-',
        status: record.status,
        workHours: record.workHours || 0,
        workLocation: record.workLocation || '-',
        arrivalStatus: record.arrivalStatus || 'N/A',
      }));

      const dataToExport = allMonthlyRecords.filter(record => {
        const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
        const matchesSearch = (record.employeeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (record.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesDepartment && matchesSearch;
      });

      if (dataToExport.length === 0) {
        alert(`No attendance data found for ${monthName} that matches your current filters.`);
        return;
      }

      let exportSuffix = "All_Employees";
      if (searchTerm) {
        const employeeName = dataToExport[0].employeeName.replace(/[^a-zA-Z0-9]/g, '_');
        exportSuffix = employeeName;
      } else if (selectedDepartment !== 'all') {
        exportSuffix = selectedDepartment.replace(/[^a-zA-Z0-9]/g, '_');
      }

      const headers = [
        "Employee ID",
        "Employee Name",
        "Department",
        "Date",
        "Sign In",
        "Sign Out",
        "Status",
        "Arrival Status",
        "Work Hours (Decimal)",
        "Work Hours (H:M)",
        "Work Location"
      ];

      const csvRows = dataToExport.map(record =>
        [
          `"${record.employeeId}"`,
          `"${record.employeeName.replace(/"/g, '""')}"`,
          `"${record.department.replace(/"/g, '""')}"`,
          record.date,
          record.signIn,
          record.signOut,
          record.status.toUpperCase(),
          record.arrivalStatus || 'N/A',
          record.workHours.toFixed(2),
          formatWorkHours(record.workHours).replace(/,/g, ''),
          `"${record.workLocation?.replace(/"/g, '""')}"`,
        ].join(',')
      );

      const csvContent = [
        headers.join(','),
        ...csvRows
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Attendance_Report_${monthName.replace(' ', '_')}_${exportSuffix}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to export attendance data: ${errorMessage}`);
    } finally {
      setExporting(false);
    }
  };

  const getExportButtonText = () => {
    if (exporting) return 'Exporting...';
    if (searchTerm) return 'Export Filtered Employee Monthly CSV';
    if (selectedDepartment !== 'all') return `Export ${selectedDepartment} Monthly CSV`;
    return 'Export All Monthly CSV';
  }

  const renderStatsCards = () => {
    const statCards = [
      {
        title: 'Total Present',
        value: stats.present || 0,
        icon: CheckCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      },
      {
        title: 'Late Arrivals',
        value: stats.late || 0,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        title: 'Half Days',
        value: stats['half-day'] || 0,
        icon: AlertCircle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      },
      {
        title: 'Absent',
        value: stats.absent || 0,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} ${card.borderColor} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAttendanceTable = () => {
    const dataToShow = filteredData;

    if (dataToShow.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-500">No attendance records found for this period.</p>
        </div>
      );
    }

    const renderMobileTable = () => (
      <div className="space-y-4 md:hidden">
        {dataToShow.map((record, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-gray-900">{record.employeeName}</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                {getStatusIcon(record.status)}
                <span className="ml-1 capitalize">{record.status}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="font-medium">Department:</div>
              <div>{record.department}</div>
              <div className="font-medium">Date:</div>
              <div>{new Date(record.date).toLocaleDateString()}</div>
              <div className="font-medium">Sign In:</div>
              <div>{record.signIn || '-'}</div>
              <div className="font-medium">Sign Out:</div>
              <div>{record.signOut || '-'}</div>
              <div className="font-medium">Work Hours:</div>
              <div>{formatWorkHours(record.workHours)}</div>
              <div className="font-medium">Location:</div>
              <div>{record.workLocation || '-'}</div>
            </div>
          </div>
        ))}
      </div>
    );

    const renderDesktopTable = () => (
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Attendance Records - {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Time Sorting Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'none' : 'asc')}
                  className={`p-2 rounded-lg transition-colors border border-gray-300 ${
                    sortOrder === 'asc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Sort Ascending by Sign In Time"
                  title="Sort Ascending by Sign In Time"
                >
                  <ArrowUpWideNarrow className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'none' : 'desc')}
                  className={`p-2 rounded-lg transition-colors border border-gray-300 ${
                    sortOrder === 'desc'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Sort Descending by Sign In Time"
                  title="Sort Descending by Sign In Time"
                >
                  <ArrowDownNarrowWide className="w-4 h-4" />
                </button>
              </div>
              {/* --- */}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                {/* Indicate sorting column */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    Sign In
                    {sortOrder === 'asc' && <ArrowUpWideNarrow className="w-3 h-3 ml-1" />}
                    {sortOrder === 'desc' && <ArrowDownNarrowWide className="w-3 h-3 ml-1" />}
                  </div>
                </th>
                {/* --- */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sign Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Location</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataToShow.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                    <div className="text-xs text-gray-400">ID: {record.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{record.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.signIn || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.signOut || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatWorkHours(record.workHours)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Check if the arrival status is 'Late' to apply the orange badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${record.arrivalStatus === 'Late' ? getStatusColor('late') : getStatusColor(record.status)}`}>
                        {record.arrivalStatus === 'Late' ? getStatusIcon('late') : getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.workLocation || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
      <>
        {renderMobileTable()}
        {renderDesktopTable()}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Dashboard</h1>
              <p className="text-gray-600">Monitor and manage employee attendance records</p>
            </div>
            <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">

              {/* Export Button with dynamic text */}
              <button
                onClick={handleMonthlyExport}
                disabled={exporting}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md ${
                  exporting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {getExportButtonText()}
                  </>
                )}
              </button>

              <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                {['today', 'week', 'month', 'year'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'today' | 'week' | 'month' | 'year')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {renderStatsCards()}
            {renderAttendanceTable()}
          </>
        )}
      </div>
    </div>
  );
}