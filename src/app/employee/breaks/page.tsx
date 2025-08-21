// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { useRouter, usePathname } from 'next/navigation';
// import Image from 'next/image';
// import {
//   ArrowLeft,
//   LayoutDashboard,
//   User,
//   Clock,
//   Briefcase,
//   Calendar,
//   Star,
//   FileText,
//   ClipboardList,
//   Cpu,
//   BarChart2,
//   BookOpen,
//   Settings,
//   HelpCircle,
//   LogOut,
//   RefreshCcw
// } from 'lucide-react';

// import { APIURL } from '@/constants/api';

// interface BreakSchedule {
//   name: string;
//   displayName: string;
//   maxDurationMinutes: number;
//   startWindow: string;
//   endWindow: string;
// }

// interface ActiveBreak {
//   id: number;
//   employeeId: string;
//   breakType: string;
//   startTime: string;
//   endTime?: string;
//   active: boolean;
//   durationMinutes?: number;
// }

// interface BreakHistory {
//   id: number;
//   employeeId: string;
//   breakType: string;
//   startTime: string;
//   endTime: string;
//   active: boolean;
//   durationMinutes: number;
// }

// const navItems = [
//   { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
//   { name: 'My Profile', href: '/employee/profile', icon: User },
//   { name: 'Attendance', href: '/employee/attendance', icon: Clock },
//   { name: 'Breaks', href: '/employee/breaks', icon: Briefcase },
//   { name: 'Leaves', href: '/employee/leaves', icon: Calendar },
//   { name: 'Performance', href: '/employee/performance', icon: Star },
//   { name: 'Documents', href: '/employee/documents', icon: FileText },
//   { name: 'Memos', href: '/employee/memos', icon: ClipboardList },
//   { name: 'Assets', href: '/employee/assets', icon: Cpu },
//   { name: 'Reports', href: '/employee/reports', icon: BarChart2 },
//   { name: 'Training & Development', href: '/employee/training', icon: BookOpen },
// ];

// const settingsItems = [
//   { name: 'Settings', href: '/employee/settings', icon: Settings },
//   { name: 'Support', href: '/employee/support', icon: HelpCircle },
// ];

// export default function BreaksPage() {
//   const [breakSchedules, setBreakSchedules] = useState<BreakSchedule[]>([]);
//   const [activeBreak, setActiveBreak] = useState<ActiveBreak | null>(null);
//   const [breakHistory, setBreakHistory] = useState<BreakHistory[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [employeeId, setEmployeeId] = useState<string>('');
//   const pathname = usePathname();

//   const fetchEmployeeId = () => {
//     const storedEmployeeId = localStorage.getItem('employeeId');
//     if (storedEmployeeId) {
//       setEmployeeId(storedEmployeeId);
//     } else {
//       setEmployeeId('EMPTAB853'); // Dummy ID
//     }
//   };

//   const fetchBreakSchedules = async () => {
//     try {
//       const response = await fetch(`${APIURL}/api/breaks/schedule`);
//       if (!response.ok) throw new Error('Failed to load break schedule');
//       const data = await response.json();
//       setBreakSchedules(data);
//     } catch (err) {
//       console.error('Error fetching break schedules:', err);
//       setBreakSchedules([]);
//     }
//   };

//   const fetchBreakHistory = useCallback(async () => {
//     if (!employeeId) return;
//     try {
//       const response = await fetch(`${APIURL}/api/breaks/history/${employeeId}`);
//       if (!response.ok) throw new Error('Failed to load break history');
//       const data = await response.json();
//       setBreakHistory(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching break history:', err);
//       setBreakHistory([]);
//     }
//   }, [employeeId]);

//   useEffect(() => {
//     fetchEmployeeId();
//     fetchBreakSchedules();
//     getCurrentLocation();
//   }, []);

//   useEffect(() => {
//     if (employeeId) {
//       fetchBreakHistory();
//     }
//   }, [employeeId, fetchBreakHistory]);

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           setLocation({ latitude: 13.0864052, longitude: 77.5484916 });
//         }
//       );
//     }
//   };

//   const startBreak = async (breakType: string) => {
//     if (!location || !employeeId) return;
//     setLoading(true);
//     try {
//       const response = await fetch(`${APIURL}/api/breaks/start`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           employeeId,
//           breakType,
//           latitude: location.latitude,
//           longitude: location.longitude,
//         }),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data?.message || 'Failed to start break');
//       setActiveBreak({
//         id: data.id,
//         employeeId: data.employeeId,
//         breakType: data.breakType,
//         startTime: data.startTime,
//         endTime: data.endTime,
//         active: data.active,
//         durationMinutes: data.durationMinutes,
//       });
//     } catch (err) {
//       console.error('Error starting break:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stopBreak = async () => {
//     if (!location || !employeeId) return;
//     setLoading(true);
//     try {
//       const response = await fetch(`${APIURL}/api/breaks/stop`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           employeeId,
//           latitude: location.latitude,
//           longitude: location.longitude,
//         }),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data?.message || 'Failed to stop break');
//       setActiveBreak(null);
//       // refresh history after stopping
//       fetchBreakHistory();
//     } catch (err) {
//       console.error('Error stopping break:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isWithinTimeWindow = (schedule: BreakSchedule) => {
//     const now = new Date();
//     const [scheduleStartHour, scheduleStartMinute] = schedule.startWindow.split(':').map(Number);
//     const [scheduleEndHour, scheduleEndMinute] = schedule.endWindow.split(':').map(Number);
//     const currentHour = now.getHours();
//     const currentMinute = now.getMinutes();

//     const currentTotalMinutes = currentHour * 60 + currentMinute;
//     const startTotalMinutes = scheduleStartHour * 60 + scheduleStartMinute;
//     const endTotalMinutes = scheduleEndHour * 60 + scheduleEndMinute;

//     return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
//   };

//   const formatTime = (timeString: string) => {
//     const date = new Date(timeString);
//     let hours = date.getHours();
//     const minutes = date.getMinutes();
//     const period = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12;
//     hours = hours ? hours : 12;
//     const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
//     return `${hours}:${formattedMinutes} ${period}`;
//   };

//   return (
//     <div className="flex bg-gray-100 min-h-screen text-gray-900">
//       {/* Sidebar (aligned to Attendance page) */}
//       <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
//         <div>
//           <div className="mb-10">
//             <Image src="https://www.tirangaaerospace.com/assets/images/logo/logo.png" alt="Company Logo" width={140} height={40} className="w-auto h-10" />
//           </div>
//           <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Main Navigation</p>
//           <nav className="space-y-2">
//             {navItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
//                     isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
//                   <span>{item.name}</span>
//                 </Link>
//               );
//             })}
//           </nav>
//           <hr className="my-6 border-gray-200" />
//           <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Settings & Support</p>
//           <nav className="space-y-2">
//             {settingsItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
//                     isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
//                   <span>{item.name}</span>
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>
//         <div>
//           <div className="flex items-center space-x-3 p-4 border-t border-gray-200">
//             <Image src="/user.jpg" alt="User Profile" width={40} height={40} className="rounded-full border-2 border-gray-200" />
//             <div>
//               <p className="text-sm font-semibold">Jane Smith</p>
//               <p className="text-xs text-gray-500">HR Manager</p>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 p-10 overflow-auto">
//         <header className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Breaks</h1>
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-500 font-medium">ID: {employeeId}</span>
//             <button onClick={() => {}} className="text-gray-600 hover:text-gray-900 font-medium">Logout</button>
//             <Image src="/user.jpg" alt="User Profile" width={40} height={40} className="rounded-full border-2 border-gray-200" />
//           </div>
//         </header>

//         <div className="space-y-8">
//           {activeBreak ? (
//             <div className="bg-white border border-yellow-200 rounded-xl p-6 shadow-md flex justify-between items-center">
//               <div>
//                 <h2 className="text-xl font-semibold text-yellow-800 mb-1">Active Break: {activeBreak.breakType.replace('_', ' ')}</h2>
//                 <p className="text-sm text-yellow-700">Started: {formatTime(activeBreak.startTime)}</p>
//               </div>
//               <button
//                 onClick={stopBreak}
//                 disabled={loading}
//                 className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
//               >
//                 {loading ? 'Stopping...' : 'Stop Break'}
//               </button>
//             </div>
//           ) : (
//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {breakSchedules.map((schedule) => (
//                 <div key={schedule.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="text-lg font-semibold text-gray-900">{schedule.displayName}</h3>
//                     <span className={`text-xs px-2 py-1 rounded-full border ${isWithinTimeWindow(schedule) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
//                       {isWithinTimeWindow(schedule) ? 'Available now' : 'Outside window'}
//                     </span>
//                   </div>
//                   <div className="space-y-1 text-sm text-gray-500 mb-4">
//                     <p>Duration: {schedule.maxDurationMinutes} minutes</p>
//                     <p>Time Window: {schedule.startWindow} - {schedule.endWindow}</p>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <button
//                       onClick={() => startBreak(schedule.name)}
//                       disabled={loading || !isWithinTimeWindow(schedule)}
//                       className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
//                         isWithinTimeWindow(schedule)
//                           ? 'bg-blue-600 text-white hover:bg-blue-700'
//                           : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                       }`}
//                     >
//                       {loading ? 'Starting...' : 'Start Break'}
//                     </button>
//                     <button
//                       onClick={fetchBreakHistory}
//                       className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
//                       title="Refresh history"
//                     >
//                       <RefreshCcw className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">Break History</h2>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {breakHistory.map((breakItem) => (
//                     <tr key={breakItem.id}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {breakItem.breakType.replace('_', ' ')}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {formatTime(breakItem.startTime)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {formatTime(breakItem.endTime)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {breakItem.durationMinutes} min
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }