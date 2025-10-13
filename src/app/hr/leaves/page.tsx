'use client';
 
import { APIURL } from '@/constants/api';
import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../../utils/authFetch';
import toast, { Toaster } from 'react-hot-toast';
import { Bell } from 'lucide-react';
 
interface Leave {
  id: string;
  employeeId?: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
  rejectionReason?: string;
}
 
interface Holiday {
  id?: number;
  name: string;
  date: string;
  day: string;
  type: string;
  coverage: string;
}
 
interface LeaveData {
  approved: Leave[];
  pending: Leave[];
  rejected: Leave[];
  holidays: Holiday[];
}
 
interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected' | 'holiday';
}
 
interface ActionButtonProps {
  variant: 'approve' | 'reject' | 'view';
  onClick: () => void;
  children: React.ReactNode;
}
 
interface LeaveTableProps {
  leaves: Leave[] | Holiday[];
  showActions?: boolean;
  isHoliday?: boolean;
}
 
function formatDate(dateString: string) {
  if (!dateString) return '';
  // Try to parse as YYYYMMDD or fallback to Date
  if (/^\d{7,8}$/.test(dateString)) {
    const str = dateString.padStart(8, '0');
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return dateString;
}
 
function getDayOfWeekFromDateString(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return !isNaN(dateObj.getTime()) ? days[dateObj.getDay()] : '';
}
 
function normalizeDate(date: unknown) {
  if (Array.isArray(date) && date.length === 3) {
    const [year, month, day] = date;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    // Already in YYYY-MM-DD or ISO format
    return date.slice(0, 10);
  }
  if (typeof date === 'string' && /^\d{8}$/.test(date)) {
    // e.g., 20241207
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
  return '';
}
 
interface NotificationDropdownProps {
  leaveData: {
    pending: Leave[];
    approved: Leave[];
    rejected: Leave[];
    holidays: Holiday[];
  };
  formatDate: (date: string) => string;
  normalizeDate: (date: unknown) => string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ leaveData, formatDate, normalizeDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 text-blue-600" />
        {leaveData.pending.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
            {leaveData.pending.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {leaveData.pending.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-3xl mb-2">📭</div>
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="p-2 divide-y divide-gray-100">
                {leaveData.pending.slice().reverse().map((leave) => {
                  const empId = leave.employeeId;
                  const leaveMonth = new Date(normalizeDate(leave.startDate)).getMonth();
                  const allLeaves = [...leaveData.approved, ...leaveData.pending]
                    .filter(l => l.employeeId === empId);
                  const leavesThisMonth = allLeaves.filter(l => {
                    const d = new Date(normalizeDate(l.startDate));
                    return d.getMonth() === leaveMonth && 
                           d.getFullYear() === new Date(normalizeDate(leave.startDate)).getFullYear();
                  });

                  // If this leave request is for 2 or more days, show red
                  let statusColor = 'bg-green-100 text-green-800';
                  let message = 'First leave this month';
                  if (leave.days >= 2) {
                    statusColor = 'bg-red-100 text-red-800';
                    message = 'Leave request exceeds monthly quota';
                  } else if (leavesThisMonth.length === 2) {
                    statusColor = 'bg-yellow-100 text-yellow-800';
                    message = 'Second leave this month';
                  } else if (leavesThisMonth.length > 2) {
                    statusColor = 'bg-red-100 text-red-800';
                    message = 'More than 2 leaves this month';
                  }

                  return (
                    <div key={leave.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          {leave.name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{leave.name}</p>
                          <p className="text-sm text-gray-500">
                            Applied for leave on {formatDate(normalizeDate(leave.startDate))}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${statusColor}`}>
                            {message}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
 
const LeaveManagementSystem = () => {
  const [leaveData, setLeaveData] = useState<LeaveData>({
    approved: [
    
    ],
    pending: [
    
    ],
    rejected: [
    
    ],
    holidays: [
     
    ]
  });
 
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState<Holiday>({
    name: '',
    date: '',
    day: '',
    type: 'National Holiday',
    coverage: 'All Employees'
  });
 
  const [, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


 
  // Fetch leave requests from API and update non-approved leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await authFetch(APIURL +'/api/leave-requests/hr/all');
        if (!res.ok) throw new Error('Failed to fetch leave requests');
        const apiLeaves = await res.json();
        // Map API data to Leave interface
        const mappedLeaves = apiLeaves.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          employeeId: item.employeeId as string,
          name: typeof item.employeeName === 'string' ? item.employeeName : '',
          type: typeof item.leaveType === 'string' ? item.leaveType : '',
          startDate: item.startDate, // accept both string and array
          endDate: item.endDate,     // accept both string and array
          days: typeof item.numberOfDays === 'number' ? item.numberOfDays : 0,
          status: typeof item.status === 'string' ? item.status.toLowerCase() : 'pending',
          reason: typeof item.reason === 'string' ? item.reason : '',
          rejectionReason: item.status === 'REJECTED' && typeof item.hrComments === 'string' ? item.hrComments : undefined,
        }));
        // Separate into approved, pending and rejected
        const approved = mappedLeaves.filter((l: Leave) => l.status === 'approved');
        const pending = mappedLeaves.filter((l: Leave) => l.status === 'pending');
        const rejected = mappedLeaves.filter((l: Leave) => l.status === 'rejected');
        setLeaveData(prev => ({
          ...prev,
          approved,
          pending,
          rejected,
        }));
      } catch (error) {
        // Optionally handle error
        console.error(error);
      }
    };
    fetchLeaves();
  }, []);
 
  const approveLeave = async (leaveId: string) => {
    if (window.confirm(`Are you sure you want to approve leave request ${leaveId}?`)) {
      try {
        // Call the approve API
        const res = await authFetch(APIURL +`/api/leave-requests/hr/${leaveId}/approve?hrComments=Approved`, {
          method: 'PUT',
        });
        if (!res.ok) throw new Error('Failed to approve leave');
        const updatedLeave = await res.json();
        // Map API response to Leave interface
        const approvedLeave = {
          id: updatedLeave.id,
          employeeId: updatedLeave.employeeId,
          name: updatedLeave.employeeName || '',
          type: updatedLeave.leaveType,
          startDate: updatedLeave.startDate,
          endDate: updatedLeave.endDate,
          days: updatedLeave.numberOfDays,
          status: updatedLeave.status.toLowerCase(),
          reason: updatedLeave.reason,
          rejectionReason: updatedLeave.status === 'REJECTED' ? updatedLeave.hrComments : undefined,
        };
        setLeaveData(prev => {
          // Remove from pending/rejected, add to approved
          return {
            ...prev,
            approved: [...prev.approved, approvedLeave],
            pending: prev.pending.filter(leave => leave.id !== leaveId),
            rejected: prev.rejected.filter(leave => leave.id !== leaveId),
          };
        });
        toast.success(`Leave approved for request ${leaveId}`);
      } catch (error) {
        toast.error('Failed to approve leave.');
        console.error(error);
      }
    }
  };
 
  const rejectLeave = async (leaveId: string) => {
    const reason = window.prompt(`Please provide a reason for rejecting leave request ${leaveId}:`);
    if (reason) {
      try {
        // Call the reject API
        const res = await authFetch(APIURL +`/api/leave-requests/hr/${leaveId}/reject?hrComments=${encodeURIComponent(reason)}`, {
          method: 'PUT',
        });
        if (!res.ok) throw new Error('Failed to reject leave');
        const updatedLeave = await res.json();
        // Map API response to Leave interface
        const rejectedLeave = {
          id: updatedLeave.id,
          employeeId: updatedLeave.employeeId,
          name: updatedLeave.employeeName || '',
          type: updatedLeave.leaveType,
          startDate: updatedLeave.startDate,
          endDate: updatedLeave.endDate,
          days: updatedLeave.numberOfDays,
          status: updatedLeave.status.toLowerCase(),
          reason: updatedLeave.reason,
          rejectionReason: updatedLeave.hrComments,
        };
        setLeaveData(prev => {
          // Remove from pending/approved, add to rejected
          return {
            ...prev,
            rejected: [...prev.rejected, rejectedLeave],
            pending: prev.pending.filter(leave => leave.id !== leaveId),
            approved: prev.approved.filter(leave => leave.id !== leaveId),
          };
        });
        toast.success(`Leave rejected for request ${leaveId}`);
      } catch (error) {
        toast.error('Failed to reject leave.');
        console.error(error);
      }
    }
  };
 
  const viewDetails = (empId: string) => {
    const leave = [...leaveData.approved, ...leaveData.pending, ...leaveData.rejected].find(
      (l) => l.id === empId
    );
    if (leave) {
      setSelectedLeave(leave);
      setShowDetailsModal(true);
    }
  };
 
  const addHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      alert('Please fill in all required fields');
      return;
    }

    // Get day of week from date string (YYYY-MM-DD)
    const dayOfWeek = getDayOfWeekFromDateString(newHoliday.date);

    const holidayToAdd = {
      employeeId: 'ALL',
      employeeName: 'ALL',
      leaveType: 'Holiday',
      holidayName: newHoliday.name,
      startDate: newHoliday.date, // use as-is
      endDate: newHoliday.date,   // use as-is
      day: dayOfWeek,
      type: newHoliday.type,
      status: 'HOLIDAY',
      coverage: newHoliday.coverage,
    };

    try {
      const res = await authFetch(APIURL +'/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holidayToAdd),
      });
      if (!res.ok) throw new Error('Failed to add holiday');
      const added = await res.json();
      setLeaveData(prev => ({
        ...prev,
        holidays: [
          ...prev.holidays,
          {
            name: added.holidayName,
            date: normalizeDate(added.startDate),
            day: added.day,
            type: added.type,
            coverage: added.coverage,
            id: added.id,
          },
        ],
      }));
      // Reset form
      setNewHoliday({
        name: '',
        date: '',
        day: '',
        type: 'National Holiday',
        coverage: 'All Employees',
      });
      setShowAddHolidayModal(false);
      toast.success('Holiday added successfully');
    } catch (error) {
      toast.error('Failed to add holiday.');
      console.error(error);
    }
  };
 
  // Fetch holidays from API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await authFetch(APIURL +'/api/holidays');
        if (!res.ok) throw new Error('Failed to fetch holidays');
        const apiHolidays = await res.json();
        // Map API data to Holiday interface
        const mappedHolidays = apiHolidays.map((item: Record<string, unknown>) => ({
          name: item.holidayName,
          date: normalizeDate(item.startDate),
          day: item.day,
          type: item.type,
          coverage: item.coverage,
          id: item.id, // for actions
        }));
        setLeaveData(prev => ({
          ...prev,
          holidays: mappedHolidays,
        }));
      } catch (error) {
        console.error(error);
      }
    };
    fetchHolidays();
  }, []);
 
  // Delete holiday
  const deleteHoliday = async (holidayId: number | undefined) => {
    if (typeof holidayId !== 'number') return;
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        const res = await authFetch(APIURL +`/api/holidays/${holidayId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete holiday');
        setLeaveData(prev => ({
          ...prev,
          holidays: prev.holidays.filter((h: Holiday) => h.id !== holidayId),
        }));
        toast.success('Holiday deleted successfully');
      } catch (error) {
        toast.error('Failed to delete holiday.');
        console.error(error);
      }
    }
  };
 
  // Edit holiday (open modal with holiday data)
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);
  const [showEditHolidayModal, setShowEditHolidayModal] = useState(false);
 
 
  const handleEditHoliday = (holiday: Holiday) => {
    setEditHoliday(holiday);
    setShowEditHolidayModal(true);
  };
 
  const updateHoliday = async () => {
    if (!editHoliday || !editHoliday.name || !editHoliday.date || editHoliday.id === undefined) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const res = await authFetch(APIURL +`/api/holidays/${editHoliday.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'ALL',
          employeeName: 'ALL',
          leaveType: 'Holiday',
          holidayName: editHoliday.name,
          startDate: editHoliday.date, // use as-is
          endDate: editHoliday.date,   // use as-is
          day: editHoliday.day,
          type: editHoliday.type,
          status: 'HOLIDAY',
          coverage: editHoliday.coverage,
        }),
      });
      if (!res.ok) throw new Error('Failed to update holiday');
      const updated = await res.json();
      setLeaveData(prev => ({
        ...prev,
        holidays: prev.holidays.map((h) => h.id === editHoliday.id ? {
          ...h,
          name: updated.holidayName,
          date: updated.startDate, // should be YYYY-MM-DD
          day: updated.day,
          type: updated.type,
          coverage: updated.coverage,
        } : h),
      }));
      setShowEditHolidayModal(false);
      setEditHoliday(null);
      toast.success('Holiday updated successfully');
    } catch (error) {
      toast.error('Failed to update holiday.');
      console.error(error);
    }
  };
 
 
 
 
  const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusClasses = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      holiday: 'bg-orange-100 text-orange-800 border-orange-200'
    };
 
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };
 
  const ActionButton = ({ variant, onClick, children }: ActionButtonProps) => {
    const variants = {
      approve: 'bg-green-500 hover:bg-green-600 text-white',
      reject: 'bg-red-500 hover:bg-red-600 text-white',
      view: 'bg-blue-500 hover:bg-blue-600 text-white'
    };
 
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 ${variants[variant]}`}
      >
        {children}
      </button>
    );
  };
 
  const LeaveTable = ({ leaves, showActions = false, isHoliday = false }: LeaveTableProps) => {
    if (!isHoliday) {
      (leaves as Leave[]).forEach((leave) => {
        console.log(
          `Leave ID: ${leave.id}, Start Date:`,
          leave.startDate,
          'End Date:',
          leave.endDate
        );
      });
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
            <tr>
              {isHoliday ? (
                <>
                  <th className="px-4 py-3 text-left font-semibold">Holiday Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Day</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Coverage</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left font-semibold">Employee ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Employee Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Leave Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Start Date</th>
                  <th className="px-4 py-3 text-left font-semibold">End Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Days</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isHoliday ? (
              (leaves as Holiday[]).map((holiday, index) => (
                <tr key={holiday.id || index} className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100">
                  <td className="px-4 py-3">{holiday.name}</td>
                  <td className="px-4 py-3">{formatDate(holiday.date)}</td>
                  <td className="px-4 py-3">{holiday.day}</td>
                  <td className="px-4 py-3">{holiday.type}</td>
                  <td className="px-4 py-3"><StatusBadge status="holiday" /></td>
                  <td className="px-4 py-3">{holiday.coverage}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <ActionButton variant="view" onClick={() => handleEditHoliday(holiday)}>
                        Edit
                      </ActionButton>
                      {typeof holiday.id === 'number' && (
                        <ActionButton variant="reject" onClick={() => deleteHoliday(holiday.id)}>
                          Delete
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              (leaves as Leave[]).map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">{leave.employeeId || leave.id}</td>
                  <td className="px-4 py-3">{leave.name}</td>
                  <td className="px-4 py-3">{leave.type}</td>
                  <td className="px-4 py-3">{formatDate(normalizeDate(leave.startDate))}</td>
                  <td className="px-4 py-3">{formatDate(normalizeDate(leave.endDate))}</td>
                  <td className="px-4 py-3">{leave.days}</td>
                  <td className="px-4 py-3"><StatusBadge status={leave.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {showActions && leave.status === 'pending' && (
                        <>
                          <ActionButton variant="approve" onClick={() => approveLeave(leave.id)}>
                            Approve
                          </ActionButton>
                          <ActionButton variant="reject" onClick={() => rejectLeave(leave.id)}>
                            Reject
                          </ActionButton>
                        </>
                      )}
                      <ActionButton variant="view" onClick={() => viewDetails(leave.id)}>
                        View
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };
 
  const totalLeaves = leaveData.approved.length + leaveData.pending.length + leaveData.rejected.length;
  const approvedCount = leaveData.approved.length;
  const pendingCount = leaveData.pending.length;
 
  return (
    <div className="min-h-screen p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white/45 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        {/* Header with Notification Icon */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b-4 border-blue-500">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 drop-shadow-lg">
              HR Leave Management System
            </h1>
            <p className="text-xl text-gray-600">
              Manage employee leave requests efficiently and transparently
            </p>
          </div>
          <div className="z-50">
            <NotificationDropdown 
              leaveData={leaveData}
              formatDate={formatDate}
              normalizeDate={normalizeDate}
            />
          </div>
        </div>
 
        {/* Layout Container */}
        <div className="flex flex-col md:flex-row gap-8">
         
 
          {/* Main Content */}
          <div >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-3xl font-bold mb-2">{totalLeaves}</h3>
                <p className="text-lg opacity-90">Total Leave Requests</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-3xl font-bold mb-2">{approvedCount}</h3>
                <p className="text-lg opacity-90">Approved Leaves</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-3xl font-bold mb-2">{pendingCount}</h3>
                <p className="text-lg opacity-90">Pending Requests</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-3xl font-bold mb-2">{leaveData.holidays.length}</h3>
                <p className="text-lg opacity-90">Total Holidays</p>
              </div>
            </div>
 
 
  {/* Unified Leave Requests Section */}
        <div className="mb-10 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-l-8 border-blue-400">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-300 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mr-5 shadow-lg">
              📝
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow">All Leave Requests</h2>
          </div>
          {leaveData.pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-12 bg-blue-50/60 rounded-xl border border-blue-100 shadow-inner">
              <div className="text-5xl mb-2">📭</div>
              <div className="text-lg font-semibold text-blue-700 mb-1">No pending leave requests</div>
              <div className="text-sm text-blue-400">All caught up! New requests will appear here.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {[...leaveData.pending].map((leave) => {
                // Calculate monthly leave summary for this employee
                const empLeaves = leaveData.approved.filter(l => l.employeeId === leave.employeeId);
                const monthlyDates: { [key: string]: string[] } = {};
                empLeaves.forEach(l => {
                  const start = new Date(normalizeDate(l.startDate));
                  const end = new Date(normalizeDate(l.endDate));
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const month = d.toLocaleString('default', { month: 'short' });
                    const dateStr = d.toISOString().slice(0, 10);
                    if (!monthlyDates[month]) monthlyDates[month] = [];
                    monthlyDates[month].push(dateStr);
                  }
                });
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                // Card color by status
                let borderColor = 'border-blue-300';
                let statusBg = 'bg-blue-100';
                if (leave.status === 'approved') { borderColor = 'border-green-300'; statusBg = 'bg-green-100'; }
                else if (leave.status === 'pending') { borderColor = 'border-yellow-300'; statusBg = 'bg-yellow-100'; }
                else if (leave.status === 'rejected') { borderColor = 'border-red-300'; statusBg = 'bg-red-100'; }
                return (
                  <div key={leave.id} className={`w-full flex flex-col md:flex-row md:items-stretch gap-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border-t-4 ${borderColor} hover:shadow-2xl transition-all duration-300`}> 
                    {/* Leave Card Info */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 p-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-extrabold shadow-md">
                        {leave.name ? leave.name[0] : '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-extrabold text-xl text-gray-900 tracking-tight">{leave.name}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBg} text-gray-800 border border-gray-200`}>{leave.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 mb-2">
                          <div className="text-sm text-gray-700"><span className="font-semibold">Employee ID:</span> {leave.employeeId}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Type:</span> {leave.type}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Days:</span> {leave.days}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Start:</span> {formatDate(normalizeDate(leave.startDate))}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">End:</span> {formatDate(normalizeDate(leave.endDate))}</div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1"><span className="font-semibold">Reason:</span> {leave.reason}</div>
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <div className="text-xs text-red-600 mt-1"><span className="font-semibold">Rejection Reason:</span> {leave.rejectionReason}</div>
                        )}
                        <div className="flex gap-2 mt-3">
                          {leave.status === 'pending' && (
                            <>
                              <ActionButton variant="approve" onClick={() => approveLeave(leave.id)}>
                                Approve
                              </ActionButton>
                              <ActionButton variant="reject" onClick={() => rejectLeave(leave.id)}>
                                Reject
                              </ActionButton>
                            </>
                          )}
                          <ActionButton variant="view" onClick={() => viewDetails(leave.id)}>
                            View
                          </ActionButton>
                        </div>
                      </div>
                    </div>
                    {/* Modern Leaves Taken Card */}
                    <div className="w-full md:w-80 flex flex-col justify-between p-5 bg-gradient-to-br from-blue-100/80 to-white/80 rounded-2xl shadow border border-blue-100">
                      <div className="font-bold text-gray-700 mb-2 text-lg flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span> Leaves Taken
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {months.map(month => (
                          <div key={month} className={`flex flex-col items-center px-2 py-1 rounded-lg ${monthlyDates[month]?.length ? 'bg-blue-200/80' : 'bg-gray-100/80'} shadow-sm min-w-[54px]`}>
                            <span className="font-semibold text-xs text-blue-900">{month}</span>
                            <span className="text-blue-700 font-bold text-base">{(monthlyDates[month] || []).length}</span>
                          </div>
                        ))}
                      </div>
                      <div className="overflow-y-auto max-h-20 mt-2">
                        {months.map(month => (
                          (monthlyDates[month] || []).length > 0 && (
                            <div key={month+leave.id} className="mb-1 text-xs text-gray-600 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                              <span className="font-semibold text-blue-800">{month}:</span>
                              <span>{monthlyDates[month].join(', ')}</span>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">(Approved leaves only, dates shown)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Approved Leaves Section */}
        <div className="mb-10 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-l-8 border-green-400">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-300 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mr-5 shadow-lg">
              ✓
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow">Approved Leaves</h2>
          </div>
          {leaveData.approved.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-12 bg-green-50/60 rounded-xl border border-green-100 shadow-inner">
              <div className="text-5xl mb-2">🎉</div>
              <div className="text-lg font-semibold text-green-700 mb-1">No approved leaves yet</div>
              <div className="text-sm text-green-400">Approved leaves will show up here.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {leaveData.approved.map((leave) => {
                // Calculate monthly leave summary for this employee
                const empLeaves = leaveData.approved.filter(l => l.employeeId === leave.employeeId);
                const monthlyDates: { [key: string]: string[] } = {};
                empLeaves.forEach(l => {
                  const start = new Date(normalizeDate(l.startDate));
                  const end = new Date(normalizeDate(l.endDate));
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const month = d.toLocaleString('default', { month: 'short' });
                    const dateStr = d.toISOString().slice(0, 10);
                    if (!monthlyDates[month]) monthlyDates[month] = [];
                    monthlyDates[month].push(dateStr);
                  }
                });
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                // Card color by status
                let borderColor = 'border-green-300';
                let statusBg = 'bg-green-100';
                if (leave.status === 'approved') { borderColor = 'border-green-300'; statusBg = 'bg-green-100'; }
                else if (leave.status === 'pending') { borderColor = 'border-yellow-300'; statusBg = 'bg-yellow-100'; }
                else if (leave.status === 'rejected') { borderColor = 'border-red-300'; statusBg = 'bg-red-100'; }
                return (
                  <div key={leave.id} className={`w-full flex flex-col md:flex-row md:items-stretch gap-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border-t-4 ${borderColor} hover:shadow-2xl transition-all duration-300`}> 
                    {/* Leave Card Info */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 p-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-extrabold shadow-md">
                        {leave.name ? leave.name[0] : '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-extrabold text-xl text-gray-900 tracking-tight">{leave.name}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBg} text-gray-800 border border-gray-200`}>{leave.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 mb-2">
                          <div className="text-sm text-gray-700"><span className="font-semibold">Employee ID:</span> {leave.employeeId}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Type:</span> {leave.type}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Days:</span> {leave.days}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Start:</span> {formatDate(normalizeDate(leave.startDate))}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">End:</span> {formatDate(normalizeDate(leave.endDate))}</div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1"><span className="font-semibold">Reason:</span> {leave.reason}</div>
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <div className="text-xs text-red-600 mt-1"><span className="font-semibold">Rejection Reason:</span> {leave.rejectionReason}</div>
                        )}
                        <div className="flex gap-2 mt-3">
                          {leave.status === 'pending' && (
                            <>
                              <ActionButton variant="approve" onClick={() => approveLeave(leave.id)}>
                                Approve
                              </ActionButton>
                              <ActionButton variant="reject" onClick={() => rejectLeave(leave.id)}>
                                Reject
                              </ActionButton>
                            </>
                          )}
                          <ActionButton variant="view" onClick={() => viewDetails(leave.id)}>
                            View
                          </ActionButton>
                        </div>
                      </div>
                    </div>
                    {/* Modern Leaves Taken Card */}
                    <div className="w-full md:w-80 flex flex-col justify-between p-5 bg-gradient-to-br from-blue-100/80 to-white/80 rounded-2xl shadow border border-blue-100">
                      <div className="font-bold text-gray-700 mb-2 text-lg flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span> Leaves Taken
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {months.map(month => (
                          <div key={month} className={`flex flex-col items-center px-2 py-1 rounded-lg ${monthlyDates[month]?.length ? 'bg-blue-200/80' : 'bg-gray-100/80'} shadow-sm min-w-[54px]`}>
                            <span className="font-semibold text-xs text-blue-900">{month}</span>
                            <span className="text-blue-700 font-bold text-base">{(monthlyDates[month] || []).length}</span>
                          </div>
                        ))}
                      </div>
                      <div className="overflow-y-auto max-h-20 mt-2">
                        {months.map(month => (
                          (monthlyDates[month] || []).length > 0 && (
                            <div key={month+leave.id} className="mb-1 text-xs text-gray-600 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                              <span className="font-semibold text-blue-800">{month}:</span>
                              <span>{monthlyDates[month].join(', ')}</span>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">(Approved leaves only, dates shown)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Rejected Leaves Section */}
        <div className="mb-10 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-l-8 border-red-400">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-300 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mr-5 shadow-lg">
              ✗
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow">Rejected Leaves</h2>
          </div>
          {leaveData.rejected.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-12 bg-red-50/60 rounded-xl border border-red-100 shadow-inner">
              <div className="text-5xl mb-2">🚫</div>
              <div className="text-lg font-semibold text-red-700 mb-1">No rejected leaves</div>
              <div className="text-sm text-red-400">Rejected leaves will show up here.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {leaveData.rejected.map((leave) => {
                // Calculate monthly leave summary for this employee
                const empLeaves = leaveData.approved.filter(l => l.employeeId === leave.employeeId);
                const monthlyDates: { [key: string]: string[] } = {};
                empLeaves.forEach(l => {
                  const start = new Date(normalizeDate(l.startDate));
                  const end = new Date(normalizeDate(l.endDate));
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const month = d.toLocaleString('default', { month: 'short' });
                    const dateStr = d.toISOString().slice(0, 10);
                    if (!monthlyDates[month]) monthlyDates[month] = [];
                    monthlyDates[month].push(dateStr);
                  }
                });
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                // Card color by status
                let borderColor = 'border-red-300';
                let statusBg = 'bg-red-100';
                if (leave.status === 'approved') { borderColor = 'border-green-300'; statusBg = 'bg-green-100'; }
                else if (leave.status === 'pending') { borderColor = 'border-yellow-300'; statusBg = 'bg-yellow-100'; }
                else if (leave.status === 'rejected') { borderColor = 'border-red-300'; statusBg = 'bg-red-100'; }
                return (
                  <div key={leave.id} className={`w-full flex flex-col md:flex-row md:items-stretch gap-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border-t-4 ${borderColor} hover:shadow-2xl transition-all duration-300`}> 
                    {/* Leave Card Info */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 p-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-extrabold shadow-md">
                        {leave.name ? leave.name[0] : '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-extrabold text-xl text-gray-900 tracking-tight">{leave.name}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBg} text-gray-800 border border-gray-200`}>{leave.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 mb-2">
                          <div className="text-sm text-gray-700"><span className="font-semibold">Employee ID:</span> {leave.employeeId}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Type:</span> {leave.type}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Days:</span> {leave.days}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">Start:</span> {formatDate(normalizeDate(leave.startDate))}</div>
                          <div className="text-sm text-gray-700"><span className="font-semibold">End:</span> {formatDate(normalizeDate(leave.endDate))}</div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1"><span className="font-semibold">Reason:</span> {leave.reason}</div>
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <div className="text-xs text-red-600 mt-1"><span className="font-semibold">Rejection Reason:</span> {leave.rejectionReason}</div>
                        )}
                        <div className="flex gap-2 mt-3">
                          {leave.status === 'pending' && (
                            <>
                              <ActionButton variant="approve" onClick={() => approveLeave(leave.id)}>
                                Approve
                              </ActionButton>
                              <ActionButton variant="reject" onClick={() => rejectLeave(leave.id)}>
                                Reject
                              </ActionButton>
                            </>
                          )}
                          <ActionButton variant="view" onClick={() => viewDetails(leave.id)}>
                            View
                          </ActionButton>
                        </div>
                      </div>
                    </div>
                    {/* Modern Leaves Taken Card */}
                    <div className="w-full md:w-80 flex flex-col justify-between p-5 bg-gradient-to-br from-blue-100/80 to-white/80 rounded-2xl shadow border border-blue-100">
                      <div className="font-bold text-gray-700 mb-2 text-lg flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span> Leaves Taken
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {months.map(month => (
                          <div key={month} className={`flex flex-col items-center px-2 py-1 rounded-lg ${monthlyDates[month]?.length ? 'bg-blue-200/80' : 'bg-gray-100/80'} shadow-sm min-w-[54px]`}>
                            <span className="font-semibold text-xs text-blue-900">{month}</span>
                            <span className="text-blue-700 font-bold text-base">{(monthlyDates[month] || []).length}</span>
                          </div>
                        ))}
                      </div>
                      <div className="overflow-y-auto max-h-20 mt-2">
                        {months.map(month => (
                          (monthlyDates[month] || []).length > 0 && (
                            <div key={month+leave.id} className="mb-1 text-xs text-gray-600 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                              <span className="font-semibold text-blue-800">{month}:</span>
                              <span>{monthlyDates[month].join(', ')}</span>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">(Approved leaves only, dates shown)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
 
            {/* Holiday Leaves Section */}
            <div className="mb-10 bg-white rounded-2xl shadow-lg p-6 border-l-8 border-orange-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    🎉
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Holiday List</h2>
                </div>
                <button
                  onClick={() => setShowAddHolidayModal(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <span>+</span> Add Holiday
                </button>
              </div>
              <LeaveTable leaves={leaveData.holidays} isHoliday={true} />
            </div>
          </div>
        </div>
 
        {/* Details Modal */}
        {showDetailsModal && selectedLeave && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Leave Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-medium">{selectedLeave.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employee Name</p>
                    <p className="font-medium">{selectedLeave.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Leave Type</p>
                    <p className="font-medium">{selectedLeave.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      <StatusBadge status={selectedLeave.status} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(normalizeDate(selectedLeave.startDate))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(normalizeDate(selectedLeave.endDate))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedLeave.days} days</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Reason for Leave</p>
                    <p className="font-medium">{selectedLeave.reason}</p>
                  </div>
                  {selectedLeave.status === 'rejected' && selectedLeave.rejectionReason && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Rejection Reason</p>
                      <p className="font-medium text-red-600">{selectedLeave.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
 
        {/* Add Holiday Modal */}
        {showAddHolidayModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Add New Holiday</h3>
                <button
                  onClick={() => setShowAddHolidayModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Republic Day"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newHoliday.type}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="National Holiday">National Holiday</option>
                    <option value="State Holiday">State Holiday</option>
                    <option value="Company Holiday">Company Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage
                  </label>
                  <select
                    value={newHoliday.coverage}
                    onChange={(e) => setNewHoliday(prev => ({ ...prev, coverage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Location">Specific Location</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddHolidayModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addHoliday}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Holiday
                </button>
              </div>
            </div>
          </div>
        )}
 
        {/* Edit Holiday Modal */}
        {showEditHolidayModal && editHoliday && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Edit Holiday</h3>
                <button
                  onClick={() => setShowEditHolidayModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    value={editHoliday ? editHoliday.name : ''}
                    onChange={e => setEditHoliday((prev) => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Republic Day"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editHoliday ? formatDate(editHoliday.date) : ''}
                    onChange={e => {
                      const newDate = e.target.value; // always in YYYY-MM-DD
                      const dayOfWeek = getDayOfWeekFromDateString(newDate);
                      setEditHoliday((prev) => prev ? { ...prev, date: newDate, day: dayOfWeek } : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day
                  </label>
                  <input
                    type="text"
                    value={editHoliday ? editHoliday.day : ''}
                    onChange={e => setEditHoliday((prev) => prev ? { ...prev, day: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Monday"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editHoliday ? editHoliday.type : ''}
                    onChange={e => setEditHoliday((prev) => prev ? { ...prev, type: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="National Holiday">National Holiday</option>
                    <option value="State Holiday">State Holiday</option>
                    <option value="Company Holiday">Company Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage
                  </label>
                  <select
                    value={editHoliday ? editHoliday.coverage : ''}
                    onChange={e => setEditHoliday((prev) => prev ? { ...prev, coverage: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="All Employees">All Employees</option>
                    <option value="Specific Department">Specific Department</option>
                    <option value="Specific Location">Specific Location</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditHolidayModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateHoliday}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Update Holiday
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default LeaveManagementSystem;
 