'use client';
import React, { useState, useEffect } from 'react';
import {
	ChatBubbleBottomCenterTextIcon,
	PaperAirplaneIcon,
	MagnifyingGlassIcon,
	XCircleIcon,
	ExclamationCircleIcon,
	ClockIcon,
	CalendarDaysIcon,
	TrashIcon,
	PencilSquareIcon,
	UsersIcon,
} from '@heroicons/react/24/outline'; // FIX: Removed ArrowLeftIcon
import axios from 'axios';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';
// FIX: Removed unused import Link

interface Employee {
	employeeId: string;
	employeeName: string;
	department: string;
	email: string;
}

interface MemoRequestDTO {
	title: string;
	meetingType: string;
	meetingDate?: string;
	priority: 'High' | 'Medium' | 'Low';
	content: string;
	sentBy: string;
	recipientEmployeeIds: string[];
	recipientDepartments: string[];
	sentToAll: boolean;
}

interface MemoResponseDTO {
	id: number;
	title: string;
	meetingType: string;
	meetingDate?: string;
	priority: 'High' | 'Medium' | 'Low';
	content: string;
	sentBy: string;
	sentByName: string;
	recipientEmployeeIds: string[];
	recipientDepartments: string[];
	sentAt: string;
	sentToAll: boolean;
	totalRecipients: number;
	recipients?: { employeeId: string; employeeName: string; department: string; email: string; }[];
}

const formatDateString = (dateString?: string) => {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return 'Invalid Date';
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
};

export default function AdminMemosPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [departments, setDepartments] = useState<string[]>([]);
	const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
	const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
	const [memoTitle, setMemoTitle] = useState('');
	const [memoContent, setMemoContent] = useState('');
	const [memoType, setMemoType] = useState<string>('Team Meeting');
	const [memoDate, setMemoDate] = useState<string>('');
	const [memoPriority, setMemoPriority] = useState<MemoRequestDTO['priority']>('Medium');
	const [sentMemos, setSentMemos] = useState<MemoResponseDTO[]>([]);
	const [activeTab, setActiveTab] = useState<'compose' | 'sent'>('compose');
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [editingMemoId, setEditingMemoId] = useState<number | null>(null);

	const adminId = 'ADMIN001'; // Hardcoded for this example

	const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
	const maxWords = 300;
	const warnWords = 250;
	const wordCount = getWordCount(memoContent);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const [employeesRes, departmentsRes, memosRes] = await Promise.all([
					axios.get(`${APIURL}/api/memos/employees`),
					axios.get(`${APIURL}/api/memos/departments`),
					axios.get(`${APIURL}/api/memos/admin/${adminId}`)
				]);

				setEmployees(employeesRes.data);
				setDepartments(departmentsRes.data);
				setSentMemos(memosRes.data);

			} catch (err) {
				toast.error('Failed to fetch data from API.');
				console.error("API Fetch Error:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [adminId]);

	// FIX: Removed the unused filteredEmployees variable.
	/*
	const filteredEmployees = employees.filter(emp => {
		const matchesSearch = (emp.employeeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
							  (emp.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
		const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
		return matchesSearch && matchesDepartment;
	});
	*/

	const handleEmployeeSelect = (employeeId: string) => {
		setSelectedEmployees(prev =>
			prev.includes(employeeId)
				? prev.filter(id => id !== employeeId)
				: [...prev, employeeId]
		);
	};

	const handleSendMemo = async () => {
		if (!memoTitle || !memoContent) {
			toast.error('Title and content are required.');
			return;
		}
		if (selectedEmployees.length === 0 && selectedDepartments.length === 0) {
			toast.error('Please select at least one recipient or department.');
			return;
		}

		try {
			setSending(true);

			const memoData: MemoRequestDTO = {
				title: memoTitle,
				meetingType: memoType,
				meetingDate: memoDate || undefined,
				priority: memoPriority,
				content: memoContent,
				sentBy: adminId,
				recipientEmployeeIds: selectedEmployees,
				recipientDepartments: selectedDepartments,
				sentToAll: selectedDepartments.includes('all')
			};

			if (editingMemoId) {
				await axios.put(`${APIURL}/api/memos/${editingMemoId}`, memoData);
				toast.success('Memo updated successfully!');
			} else {
				await axios.post(`${APIURL}/api/memos`, memoData);
				toast.success('Memo sent successfully!');
			}

			const updatedMemosRes = await axios.get(`${APIURL}/api/memos/admin/${adminId}`);
			setSentMemos(updatedMemosRes.data);

			setMemoTitle('');
			setMemoContent('');
			setMemoDate('');
			setSelectedEmployees([]);
			setSelectedDepartments([]);
			setMemoType('Team Meeting');
			setMemoPriority('Medium');
			setEditingMemoId(null);
			
			setActiveTab('sent');

		} catch (err) {
			toast.error('Failed to send memo. Please try again.');
			console.error(err);
		} finally {
			setSending(false);
		}
	};

	const handleEditSentMemo = (memo: MemoResponseDTO) => {
		setEditingMemoId(memo.id);
		setMemoTitle(memo.title);
		setMemoContent(memo.content);
		setMemoType(memo.meetingType);
		setMemoPriority(memo.priority);
		setMemoDate(memo.meetingDate ? memo.meetingDate.split('T')[0] : '');
		setSelectedEmployees(memo.recipientEmployeeIds);
		setSelectedDepartments(memo.recipientDepartments);
		setActiveTab('compose');
	};

	const handleDeleteMemo = async (memoId: number) => {
		if (!window.confirm('Are you sure you want to delete this memo? This action cannot be undone.')) {
			return;
		}
		try {
			await axios.delete(`${APIURL}/api/memos/${memoId}`);
			setSentMemos(prevMemos => prevMemos.filter(memo => memo.id !== memoId));
			toast.success('Memo deleted successfully!');
		} catch (err) {
			toast.error('Failed to delete memo. Please try again.');
			console.error(err);
		}
	};

	const getPriorityConfig = (priority: MemoRequestDTO['priority']) => {
		switch (priority) {
			case 'High':
				return {
					color: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700',
					dot: 'bg-red-500'
				};
			case 'Medium':
				return {
					color: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-700',
					dot: 'bg-amber-500'
				};
			case 'Low':
				return {
					color: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700',
					dot: 'bg-green-500'
				};
			default:
				return {
					color: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
					dot: 'bg-gray-500'
				};
		}
	};

	const getTypeConfig = (type: string) => {
		switch ((type || '').toLowerCase()) {
			case 'announcement':
				return { icon: <ExclamationCircleIcon className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200' };
			case 'warning':
				return { icon: <XCircleIcon className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-200' };
			case 'notice':
				return { icon: <ClockIcon className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200' };
			default:
				return { icon: <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />, color: 'text-gray-600 bg-gray-50 border-gray-200' };
		}
	};

	return (
		<div className="min-h-screen bg-transparent text-gray-900 dark:text-white">
			<Toaster position="top-right" />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
				{/* Header Section */}
				<div className="bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-50/90 dark:from-gray-800/90 dark:via-slate-800/90 dark:to-indigo-900/90 shadow-xl border-b border-blue-200 dark:border-indigo-700 rounded-2xl p-6 mb-8">
					{/* <Link href="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
						<ArrowLeftIcon className="w-5 h-5 mr-2" />
						Back to Dashboard
					</Link> */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
								<ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Memos & Notifications </h1>
								<p className="text-base text-gray-600 dark:text-gray-300 mt-1">Compose and manage internal memos</p>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sentMemos.length}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Sent Memos</div>
							</div>
						</div>
					</div>
				</div>

				{/* Navigation Tabs */}
				<div className="mb-8">
					<div className="border-b border-gray-200 dark:border-gray-700">
						<nav className="-mb-px flex space-x-8">
							{['compose', 'sent'].map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab as 'compose' | 'sent')}
									className={`${
										activeTab === tab
											? 'border-blue-500 text-blue-600 dark:text-blue-400'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
									} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200`}
								>
									{tab}
								</button>
							))}
						</nav>
					</div>
				</div>

				{activeTab === 'compose' && (
					<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
						{/* Recipients Panel */}
						<div className="xl:col-span-1">
							<div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
								<div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
										<UsersIcon className="w-5 h-5" />
										<span>{editingMemoId ? 'Edit Recipients' : 'Select Recipients'}</span>
									</h3>
								</div>
								
								<div className="p-6 space-y-4">
									<div className="relative">
										<MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
										<input
											type="text"
											placeholder="Search employees..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-11 pr-4 py-3 w-full border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white dark:focus:bg-gray-800"
										/>
									</div>
									<select
										value={selectedDepartment}
										onChange={(e) => setSelectedDepartment(e.target.value)}
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200 focus:bg-white dark:focus:bg-gray-800"
									>
										<option value="all">All Departments</option>
										{departments.map(dept => (
											<option key={dept} value={dept}>{dept}</option>
										))}
									</select>

									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Employees</h4>
											<span className="text-xs text-gray-500 dark:text-gray-400">{selectedEmployees.length} selected</span>
										</div>
										<div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
											{employees.filter(emp => {
												const matchesSearch = (emp.employeeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
																		(emp.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
												const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
												return matchesSearch && matchesDepartment;
											}).map(emp => (
												<div
													key={emp.employeeId}
													className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
														selectedEmployees.includes(emp.employeeId)
															? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700'
															: 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
													}`}
													onClick={() => handleEmployeeSelect(emp.employeeId)}
												>
													<div className="relative">
														<input
															type="checkbox"
															checked={selectedEmployees.includes(emp.employeeId)}
															onChange={() => {}}
															className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded"
														/>
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 dark:text-white truncate">{emp.employeeName}</p>
														<div className="flex items-center space-x-2 mt-1">
															<span className="text-xs text-gray-500 dark:text-gray-400">{emp.department}</span>
															<span className="text-xs text-gray-400">•</span>
															<span className="text-xs text-gray-500 dark:text-gray-400">{emp.employeeId}</span>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Compose Panel */}
						<div className="xl:col-span-2">
							<div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
								<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
											<ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
											<span>{editingMemoId ? 'Edit Memo' : 'Compose New Memo'}</span>
										</h3>
										{editingMemoId && (
											<button
												onClick={() => {
													setEditingMemoId(null);
													setMemoTitle('');
													setMemoContent('');
													setMemoDate('');
													setSelectedEmployees([]);
													setSelectedDepartments([]);
													setMemoType('Team Meeting');
													setMemoPriority('Medium');
												}}
												className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
											>
												Cancel Edit
											</button>
										)}
									</div>
								</div>
								
								<div className="p-6">
									<div className="space-y-6">
										{/* Title */}
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Memo Title</label>
											<input
												type="text"
												placeholder="Enter memo title..."
												value={memoTitle}
												onChange={(e) => setMemoTitle(e.target.value)}
												className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white dark:focus:bg-gray-800"
											/>
										</div>

										{/* Date */}
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meeting Date (Optional)</label>
											<div className="relative">
												<CalendarDaysIcon className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
												<input
													type="date"
													value={memoDate}
													onChange={(e) => setMemoDate(e.target.value)}
													className="pl-11 pr-4 py-3 w-full border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-200 focus:bg-white dark:focus:bg-gray-800"
												/>
											</div>
										</div>

										{/* Type and Priority */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Type</label>
												<select
													value={memoType}
													onChange={(e) => setMemoType(e.target.value)}
													className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-200 focus:bg-white dark:focus:bg-gray-800"
												>
													<option value="Team Meeting">Team Meeting</option>
													<option value="Announcement">Announcement</option>
													<option value="Warning">Warning</option>
													<option value="Notice">Notice</option>
												</select>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority Level</label>
												<select
													value={memoPriority}
													onChange={(e) => setMemoPriority(e.target.value as MemoRequestDTO['priority'])}
													className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-200 focus:bg-white dark:focus:bg-gray-800"
												>
													<option value="Low">Low Priority</option>
													<option value="Medium">Medium Priority</option>
													<option value="High">High Priority</option>
												</select>
											</div>
										</div>

										{/* Content */}
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Content</label>
											<textarea
												placeholder="Write your memo here..."
												value={memoContent}
												onChange={(e) => {
													const words = e.target.value.trim().split(/\s+/).filter(Boolean);
													if (words.length <= maxWords) {
														setMemoContent(e.target.value);
													} else {
														setMemoContent(words.slice(0, maxWords).join(' '));
													}
												}}
												rows={8}
												className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:bg-white dark:focus:bg-gray-800 resize-none"
											/>
											<div className="flex items-center justify-between mt-2">
												<span className={`text-xs ${
													wordCount > warnWords
														? wordCount > maxWords
															? 'text-red-600'
															: 'text-amber-600'
														: 'text-gray-500 dark:text-gray-400'
												}`}>
													{wordCount} / {maxWords} words
												</span>
												{wordCount > maxWords && (
													<span className="text-xs text-red-600 font-medium">Maximum words exceeded</span>
												)}
											</div>
										</div>

										{/* Action Buttons */}
										<div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
											<button
												onClick={handleSendMemo}
												disabled={sending || wordCount > maxWords}
												className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
											>
												<PaperAirplaneIcon className="w-4 h-4" />
												<span>{sending ? 'Sending...' : editingMemoId ? 'Update Memo' : 'Send Memo'}</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'sent' && (
					<div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-6 space-y-6">
						{loading ? (
							<div className="text-center py-16 text-gray-600 dark:text-gray-300">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								<p className="mt-4">Loading sent memos...</p>
							</div>
						) : sentMemos.length === 0 ? (
							<div className="text-center py-16">
								<div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
									<ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
									<h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No sent memos</h3>
									<p className="text-gray-500 dark:text-gray-400">Your sent memos will appear here once you start communicating with your team.</p>
								</div>
							</div>
						) : (
							sentMemos.map(memo => {
								const priorityConfig = getPriorityConfig(memo.priority);
								const typeConfig = getTypeConfig(memo.meetingType);
								
								return (
									<div key={memo.id} className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
										<div className="p-6 border-b border-gray-200 dark:border-gray-700">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center space-x-3 mb-2">
														<h3 className="text-xl font-semibold text-gray-900 dark:text-white">{memo.title}</h3>
														<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
															<div className={`w-2 h-2 rounded-full mr-2 ${priorityConfig.dot}`}></div>
															{memo.priority}
														</div>
													</div>
													<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
														<span className="flex items-center space-x-1">
															<UsersIcon className="w-4 h-4" />
															<span>{memo.totalRecipients} recipients</span>
														</span>
														<span>•</span>
														<span>{new Date(memo.sentAt).toLocaleString()}</span>
													</div>
												</div>
												<div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
													{typeConfig.icon}
													<span className="ml-1 capitalize">{memo.meetingType}</span>
												</div>
											</div>
										</div>

										{memo.meetingDate && (
											<div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-700">
												<div className="flex items-center space-x-3">
													<div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
														<CalendarDaysIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
													</div>
													<div>
														<p className="text-sm font-medium text-blue-800 dark:text-blue-300">Scheduled Meeting</p>
														<p className="text-sm text-blue-700 dark:text-blue-200">{formatDateString(memo.meetingDate)}</p>
													</div>
												</div>
											</div>
										)}

										<div className="p-6">
											<p className="text-gray-700 dark:text-gray-300 leading-relaxed">{memo.content}</p>
										</div>

										{memo.recipients && memo.recipients.length > 0 && (
											<div className="px-6 pb-4">
												<h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Recipients</h4>
												<div className="flex flex-wrap gap-2">
													{memo.recipients.map(r => (
														<div key={r.employeeId} className="bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-gray-900/50 dark:hover:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
															<span className="font-medium">{r.employeeName}</span>
															<span className="text-gray-500 dark:text-gray-400 ml-1">({r.department})</span>
														</div>
													))}
												</div>
											</div>
										)}

										<div className="px-6 pb-6 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700 pt-4">
											<button
												onClick={() => handleEditSentMemo(memo)}
												className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
												title="Edit and Resend"
											>
												<PencilSquareIcon className="w-4 h-4" />
												<span>Edit</span>
											</button>
											<button
												onClick={() => handleDeleteMemo(memo.id)}
												className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
												title="Delete Memo"
											>
												<TrashIcon className="w-4 h-4" />
												<span>Delete</span>
											</button>
										</div>
									</div>
								);
							})
						)}
					</div>
				)}
			</div>
		</div>
	);
}