'use client';
import React, { useState, useEffect } from 'react';
import {
	Search,
	X,
	Eye,
	User,
	Mail,
	Phone,
	Calendar,
	Briefcase,
	EyeOff,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast'; // FIX: Removed unused 'toast'
import Image from 'next/image'; // FIX: Added Next.js Image component

const APIURL = 'http://localhost:8080';
const API_BASE_URL = APIURL + '/api/employees';

// Step 1: Update the Employee interface to include a profile photo URL
interface Employee {
	id: string;
	employeeId: string;
	employeeName: string;
	email: string;
	password?: string;
	phoneNumber: string;
	bloodGroup: string;
	currentAddress: string;
	permanentAddress: string;
	position: string;
	department: string;
	joiningDate: string; // YYYY-MM-DD
	status: 'Active' | 'Inactive' | 'On Leave';
	notes?: string;
	profilePhotoUrl?: string; // New field for profile photo
}

// Step 2: Update API-related interfaces to match the new Employee structure
interface ApiEmployeeResponse extends Omit<Employee, 'joiningDate' | 'status'> {
	joiningDate: string;
	status: string;
}

const transformEmployeeFromApiResponse = (apiEmployee: ApiEmployeeResponse): Employee => ({
	id: apiEmployee.id,
	employeeId: apiEmployee.employeeId,
	employeeName: apiEmployee.employeeName,
	email: apiEmployee.email,
	password: apiEmployee.password,
	phoneNumber: apiEmployee.phoneNumber,
	bloodGroup: apiEmployee.bloodGroup,
	currentAddress: apiEmployee.currentAddress,
	permanentAddress: apiEmployee.permanentAddress,
	position: apiEmployee.position,
	department: apiEmployee.department,
	joiningDate: apiEmployee.joiningDate,
	status: apiEmployee.status as Employee['status'],
	notes: apiEmployee.notes,
	profilePhotoUrl: apiEmployee.profilePhotoUrl, // Include new field
});

const employeesAPI = {
	getAll: async (): Promise<Employee[]> => {
		const res = await fetch(API_BASE_URL);
		if (!res.ok) throw new Error('Failed to fetch employees');
		const data: ApiEmployeeResponse[] = await res.json();
		return data.map(transformEmployeeFromApiResponse);
	},
};

const PLACEHOLDER_IMAGE = 'https://placehold.co/150x150/E2E8F0/A0AEC0?text=No+Image';

export default function JoiningPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
	const [selectedStatus, setSelectedStatus] = useState<string>('all');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		const fetchEmployees = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const data = await employeesAPI.getAll();
				setEmployees(data);
			} catch (error) {
				console.error('Error fetching employees:', error);
				setError(error instanceof Error ? error.message : 'Failed to fetch employees');
				setEmployees([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchEmployees();
	}, []);

	const openModal = (employee: Employee) => {
		setSelectedEmployee(employee);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setSelectedEmployee(null);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const filteredEmployees = employees.filter(employee => {
		const matchesSearch = employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
			employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
			employee.department.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
		const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
		return matchesSearch && matchesDepartment && matchesStatus;
	});

	const departments = ['all', ...new Set(employees.map(e => e.department))];
	const statuses = ['all', 'Active', 'Inactive', 'On Leave'];

	if (isLoading) {
		return (
			<div className="p-6 flex items-center justify-center min-h-screen">
				<div className="text-gray-600">Loading employees...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 flex items-center justify-center">
				<div className="bg-red-50 text-red-600 p-4 rounded-lg">Error: {error}</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6 bg-transparent">
			<Toaster position="top-right" />
			<div className="max-w-7xl mx-auto bg-white/80 rounded-3xl shadow-2xl p-4 sm:p-8">
				<div className="flex justify-between items-center mb-6 flex-col sm:flex-row">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Employee Directory</h1>
				</div>

				{/* Search and Filter Bar */}
				<div className="bg-white p-4 rounded-xl shadow-sm mb-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
							<input
								type="text"
								placeholder="Search employees..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
							<select
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
								value={selectedDepartment}
								onChange={(e) => setSelectedDepartment(e.target.value)}
							>
								{departments.map(department => (
									<option key={department} value={department}>
										{department === 'all' ? 'All Departments' : department}
									</option>
								))}
							</select>
							<select
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
							>
								{statuses.map(status => (
									<option key={status} value={status}>
										{status === 'all' ? 'All Status' : status}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Employees Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredEmployees.length === 0 ? (
						<div className="col-span-full text-center py-12 text-gray-500">
							<User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
							No employees found matching your criteria.
						</div>
					) : (
						filteredEmployees.map((employee) => (
							<div key={employee.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 flex flex-col">
								<div className="flex justify-center mb-4">
									<Image // FIX: Replaced <img> with <Image />
										src={employee.profilePhotoUrl || PLACEHOLDER_IMAGE}
										alt={`${employee.employeeName}'s profile`}
										className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
										width={96} // Specified width for Image component
										height={96} // Specified height for Image component
										unoptimized // Recommended for placeholder/external URLs like the placeholder
									/>
								</div>
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-900 truncate">{employee.employeeName}</h3>
									<span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
										{employee.status}
									</span>
								</div>

								<div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
									<div className="flex items-center">
										<User className="w-4 h-4 mr-2" />
										<span>{employee.employeeId}</span>
									</div>
									<div className="flex items-center">
										<Briefcase className="w-4 h-4 mr-2" />
										<span>{employee.position} ({employee.department})</span>
									</div>
									<div className="flex items-center">
										<Calendar className="w-4 h-4 mr-2" />
										<span>Joined: {employee.joiningDate}</span>
									</div>
									<div className="flex items-center truncate">
										<Mail className="w-4 h-4 mr-2" />
										<span>{employee.email}</span>
									</div>
									<div className="flex items-center">
										<Phone className="w-4 h-4 mr-2" />
										<span>{employee.phoneNumber}</span>
									</div>
								</div>

								<div className="flex space-x-2 mt-auto pt-4 border-t border-gray-100">
									<button
										onClick={() => openModal(employee)}
										className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
									>
										<Eye className="w-4 h-4" />
										<span>View</span>
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Modal */}
			{showModal && selectedEmployee && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-bold text-gray-900">
									Employee Details
								</h2>
								<button
									onClick={closeModal}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-600" />
								</button>
							</div>
						</div>

						<div className="p-6">
							<div className="space-y-4">
								<div className="flex flex-col items-center mb-6">
									<Image // FIX: Replaced <img> with <Image />
										src={selectedEmployee.profilePhotoUrl || PLACEHOLDER_IMAGE}
										alt={`${selectedEmployee.employeeName}'s profile`}
										className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
										width={128} // Specified width for Image component
										height={128} // Specified height for Image component
										unoptimized // Recommended for placeholder/external URLs
									/>
									<h3 className="mt-4 text-xl font-bold">{selectedEmployee.employeeName}</h3>
									<p className="text-gray-500">{selectedEmployee.position}</p>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600">Employee ID</p>
										<p className="font-medium">{selectedEmployee.employeeId}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Name</p>
										<p className="font-medium">{selectedEmployee.employeeName}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Email</p>
										<p className="font-medium">{selectedEmployee.email}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Password</p>
										<div className="flex items-center space-x-2">
											<p className="font-medium">{showPassword ? selectedEmployee.password : '••••••••'}</p>
											<button
												onClick={togglePasswordVisibility}
												className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
											>
												{showPassword ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
											</button>
										</div>
									</div>
									<div>
										<p className="text-sm text-gray-600">Phone Number</p>
										<p className="font-medium">{selectedEmployee.phoneNumber}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Position</p>
										<p className="font-medium">{selectedEmployee.position}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Department</p>
										<p className="font-medium">{selectedEmployee.department}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Joining Date</p>
										<p className="font-medium">{selectedEmployee.joiningDate}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Status</p>
										<p className="font-medium">{selectedEmployee.status}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Blood Group</p>
										<p className="font-medium">{selectedEmployee.bloodGroup}</p>
									</div>
								</div>

								<div>
									<p className="text-sm text-gray-600">Current Address</p>
									<p className="font-medium">{selectedEmployee.currentAddress}</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">Permanent Address</p>
									<p className="font-medium">{selectedEmployee.permanentAddress}</p>
								</div>

								{selectedEmployee.notes && (
									<div>
										<p className="text-sm text-gray-600 mb-2">Notes</p>
										<p className="text-gray-900">{selectedEmployee.notes}</p>
									</div>
								)}

								<div className="flex space-x-3 pt-4">
									<button
										type="button"
										onClick={closeModal}
										className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
									>
										Close
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