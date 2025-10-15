"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    X,
    Edit,
    Trash2,
    Eye,
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    EyeOff,
    Settings
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

// FIX: Define placeholder URL and Loader since they can't be imported in this environment
const APIURL = "http://localhost:8080"; 
const Loader = () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>;

// --- Interfaces (Defined based on backend models) ---

interface Employee {
    id: string;
    employeeId: string;
    employeeName: string;
    email: string;
    password:string;
    phoneNumber: string;
    bloodGroup: string;
    profilePhotoUrl: string | null;
    currentAddress: string;
    permanentAddress: string;
    position: string;
    department: string;
    designation?: string; // Add designation here
    joiningDate: string; // YYYY-MM-DD
    dateOfBirth: string; // YYYY-MM-DD
    status: 'Active' | 'Joining' | 'Exit';
    grossMonthlySalary?: number; // New field for payroll base
}

interface ApiEmployeeResponse extends Omit<Employee, 'joiningDate' | 'status' | 'dateOfBirth'> {
    joiningDate: [number, number, number] | string;
    dateOfBirth?: [number, number, number] | string;
    status: string;
}

// --- Payroll Modal Interfaces ---
interface PayrollFormData {
    grossMonthlySalary: number | ''; // Allows empty string for cleaner input
    daysWorked: number;
    lopDays: number | ''; // FIX: Allows empty string
}
interface PayrollModalProps {
    employee: Employee;
    onClose: () => void;
    onUpdateSalary: (employeeId: string, employeeData: Partial<Employee>) => Promise<void>; // Updated signature
}


// --- Helper Functions ---

// Helper function to format date arrays/strings into YYYY-MM-DD
const formatDateForClient = (dateData: [number, number, number] | string | undefined): string => {
    if (!dateData) return '';
    
    try {
        if (Array.isArray(dateData) && dateData.length === 3) {
            const [year, month, day] = dateData;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        if (typeof dateData === 'string') {
            // Ensures date is in YYYY-MM-DD format (takes the date part only)
            return dateData.split('T')[0];
        }
    } catch (error) {
        console.error('Date parsing error:', error);
    }
    return '';
};


const transformEmployeeFromApiResponse = (apiEmployee: ApiEmployeeResponse): Employee => {
    
    // FIX: Using the new helper for all dates
    const joiningDate = formatDateForClient(apiEmployee.joiningDate);
    const dateOfBirth = formatDateForClient(apiEmployee.dateOfBirth);

    return {
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
        designation: apiEmployee.designation, // Map designation
        
        joiningDate: joiningDate,
        dateOfBirth: dateOfBirth, 
        
        status: apiEmployee.status as Employee['status'],
        profilePhotoUrl: apiEmployee.profilePhotoUrl,
        grossMonthlySalary: (apiEmployee as Employee).grossMonthlySalary || 0, // Ensure salary field is mapped
    };
};

const API_BASE_URL = `${APIURL}/api/employees`;

const employeesAPI = {
    getAll: async (): Promise<Employee[]> => {
        const res = await fetch(API_BASE_URL);
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data: ApiEmployeeResponse[] = await res.json();
        return data.map(transformEmployeeFromApiResponse);
    },
    
    // ... (rest of employeesAPI remains the same, assuming create/update functions are correct)
};

// Add axios-based multi-part form data functions
const submitEmployee = async (employeeObj: Omit<Employee, 'id'>, photoFile?: File | null) => {
    const formData = new FormData();
    formData.append('employee', JSON.stringify(employeeObj));
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    try {
        const response = await axios.post(APIURL + '/api/employees', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Submit employee error:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(typeof message === 'string' ? message : 'Failed to create employee');
        }
        throw new Error(error instanceof Error ? error.message : 'Failed to create employee');
    }
};


const updateEmployee = async (id: string, employeeObj: Partial<Employee>, profilePhotoFile?: File | null): Promise<Employee> => {
    const formData = new FormData();
    
    // Create a payload that includes all necessary fields for backend validation
    const payloadToSend = {
        ...employeeObj,
        id: undefined // Ensure ID is not sent in the employee object
    };
    
    formData.append('employee', JSON.stringify(payloadToSend));
    if (profilePhotoFile) {
        // NOTE: 'profileFile' was likely a typo for 'profilePhotoFile' in the original code, corrected here
        formData.append('photo', profilePhotoFile); 
    }
    try {
        const response = await axios.put(APIURL +`/api/employees/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        // FIX: Transform the response data from ApiEmployeeResponse to Employee
        return transformEmployeeFromApiResponse(response.data);
    } catch (error: unknown) {
        console.error('Update employee error:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(typeof message === 'string' ? message : 'Failed to update employee');
        }
        throw new Error(error instanceof Error ? error.message : 'Failed to update employee');
    }
};

// --- Payroll Input Modal Component ---
// (PayrollInputModal implementation remains the same as provided by the user)

const PayrollInputModal: React.FC<PayrollModalProps> = ({ employee, onClose, onUpdateSalary }) => {
    const [formData, setFormData] = useState<PayrollFormData>({
        // FIX: Start GMS as empty string if 0 for cleaner input
        grossMonthlySalary: employee.grossMonthlySalary === 0 ? '' : employee.grossMonthlySalary || '',
        daysWorked: 22, // Default mock for full month
        lopDays: '', // FIX: Initialize LOP to empty string
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse values to a number for calculations, defaulting to 0 if empty
    const gmsValue = typeof formData.grossMonthlySalary === 'number' 
        ? formData.grossMonthlySalary 
        : parseFloat(formData.grossMonthlySalary || '0');
    
    // FIX: Ensure lopDays is safely parsed by casting to string first
    const lopDays = parseFloat(String(formData.lopDays || '0')); 
    
    const daysWorked = formData.daysWorked;
    
    // Calculate pay components based on the 50%/40% rule
    const basicSalary = gmsValue * 0.50;
    const hra = basicSalary * 0.40;
    const specialAllowance = gmsValue - basicSalary - hra;

    const totalGrossEarnings = basicSalary + hra + specialAllowance;

    // Calculate payable amount considering LOP
    const dailyRate = totalGrossEarnings / (daysWorked || 30); // Use 30 days if daysWorked is zero
    const lossOfPayAmount = lopDays * dailyRate;
    
    // Simple mock deduction for Professional Tax (PT)
    const professionalTax = gmsValue >= 25000 ? 200 : 0;

    // Actual Payable Calculation
    // Total Deductions = PT + LOP
    const totalDeductions = professionalTax + lossOfPayAmount; 
    const actualPayable = totalGrossEarnings - totalDeductions;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Handle numerical fields (GMS, LOP, Days Worked)
        const numericValue = value.replace(/[^0-9.]/g, '');

        setFormData(prev => ({
            ...prev,
            [name]: numericValue === '' ? '' : parseFloat(numericValue) || 0,
        }));
    };

    const handleSalaryUpdate = async () => {
        if (gmsValue <= 0) {
            toast.error("Gross Monthly Salary must be greater than zero.");
            return;
        }
        setIsSubmitting(true);
        try {
            // CRITICAL FIX: Send the complete, original employee object merged with the new salary.
            // This ensures all required fields for the backend are present.
            const employeeData = { 
                ...employee, 
                // Ensure number is used when sending to API
                grossMonthlySalary: gmsValue, 
            };

            await onUpdateSalary(employee.id, employeeData);
            toast.success("Salary base updated successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to update salary.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        Payroll Configuration for {employee.employeeName}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-indigo-700">1. Permanent Salary Base (Gross)</h3>
                    <div className="space-y-4 rounded-lg bg-indigo-50 p-4 border border-indigo-200">
                        <label className="block text-sm font-medium text-gray-700">Gross Monthly Salary (GMS)*</label>
                        <input
                            type="number"
                            name="grossMonthlySalary"
                            // Use ternary to display empty string if 0 or ''
                            value={formData.grossMonthlySalary} 
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. 30000"
                            required
                        />
                        <button
                            onClick={handleSalaryUpdate}
                            disabled={isSubmitting || gmsValue <= 0} // Disable if GMS is 0 or less
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                        >
                            {isSubmitting ? 'Saving...' : 'Update Employee Salary Base'}
                        </button>
                        <p className="text-xs text-indigo-700 pt-2">
                            *This value is saved permanently on the employee record for future payslips.
                        </p>
                    </div>

                    <h3 className="text-lg font-semibold text-teal-700">2. Monthly Calculation Inputs</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Total Work Days (per month)</label>
                            <input
                                type="number"
                                name="daysWorked"
                                value={formData.daysWorked}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loss of Pay Days (LOP)</label>
                            <input
                                type="number"
                                name="lopDays"
                                value={formData.lopDays}
                                onChange={handleChange}
                                min="0"
                                max={formData.daysWorked}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 border-t pt-4 mt-4">3. Calculated Payroll Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                            <span>Base Gross Salary (GMS)</span>
                            <span className="font-semibold text-gray-800">₹{gmsValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>— Basic Salary (50% GMS)</span>
                            <span className="font-medium text-gray-700">₹{basicSalary.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>— HRA (40% of Basic)</span>
                            <span className="font-medium text-gray-700">₹{hra.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>— Special Allowance (Remaining)</span>
                            <span className="font-medium text-gray-700">₹{specialAllowance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-600 border-t pt-2">
                            <span>Loss of Pay (LOP) Deduction ({lopDays} days)</span>
                            <span className="font-semibold">− ₹{lossOfPayAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>Professional Tax Deduction</span>
                            <span className="font-semibold">− ₹{professionalTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-400 pt-3">
                            <span>ACTUAL NET PAYABLE</span>
                            <span className="text-green-700">₹{actualPayable.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Employee Page Component (JoiningPage) ---

type ModalType = 'add' | 'edit' | 'view' | 'payroll';

export default function JoiningPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('add');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    
    // Error boundary state
    const [hasError, setHasError] = useState(false);
    const departmentOptions = [
        'Sales and marketing', 'IT', 'Backend operations', 'design and development', 'HR', 'Manpower and internship', 'Other'
    ];
    const bloodGroupOptions = [
        '', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    ];
    const [formError, setFormError] = useState('');
    
    // Add country code options
    const countryCodeOptions = ['+91', '+1', '+44', '+61', '+81', '+971', '+49', '+86', '+33', '+7'];
    const [countryCode, setCountryCode] = useState<string>(countryCodeOptions[0]);
    const [phoneNumberOnly, setPhoneNumberOnly] = useState<string>('');
    
    // Add a state for employee ID error
    const [employeeIdError, setEmployeeIdError] = useState('');
    // Add a state for employee ID prefix
    const [employeeIdPrefix, setEmployeeIdPrefix] = useState('EMPTA');
    
    const isViewMode = modalType === 'view';
    const isPayrollMode = modalType === 'payroll';

    // --- Data Fetching and Initialization ---
    
    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            setError(null);
            setHasError(false);
            try {
                const data = await employeesAPI.getAll();
                setEmployees(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching employees:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch employees');
                setEmployees([]);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);
    
    // Update formData.phoneNumber when either changes
    useEffect(() => {
        setFormData({ ...formData, phoneNumber: countryCode + phoneNumberOnly });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryCode, phoneNumberOnly]);
    
    // Real-time check for duplicate Employee ID and enforce 'EMP' prefix
    useEffect(() => {
        if (!formData.employeeId) {
            setEmployeeIdError('');
            return;
        }
        let empId = formData.employeeId;
        const prefixMatch = empId.match(/^(EMP[A-Z]*)/);
        const currentPrefix = prefixMatch ? prefixMatch[1] : employeeIdPrefix;
        
        // Check for duplicate
        const exists = employees.some(emp => emp.employeeId === empId);
        if (exists && (modalType === 'add' || (modalType === 'edit' && empId !== selectedEmployee?.employeeId))) {
            setEmployeeIdError('Employee ID already exists.');
        } else {
            setEmployeeIdError('');
        }
    }, [formData.employeeId, employees, modalType, selectedEmployee, employeeIdPrefix]);
    
    const openModal = (type: ModalType, employee?: Employee) => {
        setModalType(type);
        setSelectedEmployee(employee || null);
        setProfilePhotoFile(null);
        setProfilePhotoPreview(null);
        setFormError(''); // Clear form errors on modal open
        setEmployeeIdError(''); // Clear ID errors on modal open
        
        if (type === 'add') {
            const prefix = 'EMPTA';
            setEmployeeIdPrefix(prefix);
            
            let nextIdNum = 1;
            if (employees.length > 0) {
                const ids = employees
                .map(e => e.employeeId)
                .filter(id => id.startsWith(prefix) && new RegExp(`^${prefix}\\d+$`).test(id)); 
                if (ids.length > 0) {
                    const result = ids.reduce((acc, id) => {
                        const match = id.match(new RegExp(`^${prefix}(\\d+)$`));
                        if (match) {
                            const num = parseInt(match[1], 10);
                            if (num > acc.maxNum) {
                                return {maxNum: num};
                            }
                        }
                        return acc;
                    }, {maxNum: 0});
                    nextIdNum = result.maxNum + 1;
                }
            }
            const nextId = prefix + String(nextIdNum).padStart(3, '0');

            setFormData({
                employeeId: nextId,
                employeeName: '',
                email: '',
                password: '',
                phoneNumber: '',
                bloodGroup: '',
                currentAddress: '',
                permanentAddress: '',
                position: '',
                department: '',
                designation: '', // Initialize designation for add mode
                joiningDate: formatDateForClient(new Date().toISOString()),
                dateOfBirth: '', 
                status: 'Joining',
                profilePhotoUrl: '',
                grossMonthlySalary: 0, // Initialize salary field
            });
            setCountryCode(countryCodeOptions[0]);
            setPhoneNumberOnly('');
        } else if (employee) {
            // FIX: Copy all employee properties and ensure dates are correctly formatted
            setFormData({ 
                ...employee,
                // Ensure date strings are correctly formatted for input type="date"
                joiningDate: employee.joiningDate ? formatDateForClient(employee.joiningDate) : '',
                dateOfBirth: employee.dateOfBirth ? formatDateForClient(employee.dateOfBirth) : '',
            });
            // Set prefix for edit/view
            const match = employee.employeeId.match(/^(EMP[A-Z]*)/);
            setEmployeeIdPrefix(match ? match[1] : 'EMP');
            // Set phone number and country code for edit/view
            const phone = employee.phoneNumber || '';
            const matchedCode = countryCodeOptions.find(code => phone.startsWith(code)) || countryCodeOptions[0];
            setCountryCode(matchedCode);
            setPhoneNumberOnly(phone.replace(matchedCode, ''));
            if (employee.profilePhotoUrl) {
                setProfilePhotoPreview(employee.profilePhotoUrl);
            }
        }
        setShowModal(true);
    };
    
    const openPayrollModal = (employee: Employee) => {
        openModal('payroll', employee);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
        setFormData({});
        setProfilePhotoFile(null);
        setProfilePhotoPreview(null);
        setFormError(''); // Clear error on close
    };
    
    const handleUpdateSalary = async (employeeId: string, employeeData: Partial<Employee>) => {
        // employeeData contains the entire employee object + the updated grossMonthlySalary value.
        
        // This call updates the employee record with the new salary base.
        const updatedEmployee = await updateEmployee(employeeId, employeeData);

        // CRITICAL FIX: Update local state using the successful API response
        setEmployees(employees.map(e => 
            e.id === employeeId ? updatedEmployee : e
        ));

        // CRITICAL FIX: Also update the selectedEmployee state used for re-rendering the modal
        setSelectedEmployee(updatedEmployee);
        
        toast.success("Salary base updated successfully!");
        // We close the modal here after confirmation
        closeModal();
    };


    const handleSubmit = async () => {
        setFormError('');
        
        // 1. Employee ID/Name/Position/Department/Joining Date/Blood Group Validation
        if (employeeIdError) { setFormError(employeeIdError); return; }
        if (!formData.employeeId) { setFormError('Employee ID is required.'); return; }
        if (!formData.employeeName) { setFormError('Employee Name is required.'); return; }
        if (!formData.position) { setFormError('Position is required.'); return; }
        if (!formData.department) { setFormError('Department is required.'); return; }
        if (!formData.joiningDate) { setFormError('Joining Date is required.'); return; }
        if (!formData.bloodGroup) { setFormError('Blood Group is required.'); return; }
        
        // 2. Email validation
        if (!formData.email) { setFormError('Email is required.'); return; }
        if (!formData.email.includes('@')) { setFormError('Please enter a valid email address containing "@".'); return; }

        // 3. Password validation (Relaxed for testing environment)
        const password = formData.password || '';
        if (!password || password.length < 8) { 
            setFormError('Password is required and must be at least 8 characters long.'); 
            return; 
        }

        // 4. Phone number validation
        if (!countryCode) { setFormError('Country code is required.'); return; }
        if (!phoneNumberOnly || !(/^\d{10}$/.test(phoneNumberOnly))) { 
            setFormError('Phone number must be exactly 10 digits.'); 
            return; 
        }
        
        // ** If validation passes, proceed to submission **
        setIsSubmitting(true);
        try {
            if (modalType === 'add') {
                const newEmployee = await submitEmployee(formData as Omit<Employee, 'id'>, profilePhotoFile);
                setEmployees([...employees, transformEmployeeFromApiResponse(newEmployee)]);
                toast.success('Employee added successfully');
            } else if (modalType === 'edit' && selectedEmployee) {
                await updateEmployee(selectedEmployee.id, formData, profilePhotoFile);
                // Refresh the employee list to get the latest data
                const refreshedData = await employeesAPI.getAll();
                setEmployees(refreshedData);
                toast.success('Employee updated successfully');
            }
            closeModal();
        } catch (error) {
            console.error('Error saving employee:', error);
            let errorMessage = 'Failed to save employee';
            
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object') {
                errorMessage = (error as { message?: string }).message || JSON.stringify(error);
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this employee record?')) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                setEmployees(employees.filter(employee => employee.id !== id));
                toast.success('Employee deleted successfully');
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to delete employee');
            }
        }
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch =
            employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
        const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
        return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    const departments = [ 'all','Sales and marketing', 'IT', 'Backend operations', 'design and development', 'HR', 'Manpower and internship', 'Other'];
    const statuses = ['all', 'Active', 'Joining', 'Exit'];
    
    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }
    
    if (error || hasError) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-red-600">
                    <p>Error: {error || 'Something went wrong'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Toaster position="top-right" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
                    <button
                        onClick={() => openModal('add')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Employee</span>
                    </button>
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
                        <div className="flex gap-4">
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
                    {filteredEmployees.map((employee) => {
                        return (
                            <div key={employee.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 flex flex-col">
                                <div className="flex items-center mb-4">
                                    {employee.profilePhotoUrl ? (
                                        <div className="w-16 h-16 mr-4 shrink-0 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                            <img
                                                src={employee.profilePhotoUrl}
                                                alt={employee.employeeName || 'Employee'}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 mr-4 shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900">{employee.employeeName}</h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {employee.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{employee.position}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        <span>{employee.employeeId}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        <span>{employee.department}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Joined: {employee.joiningDate}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span>{employee.email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <span>{employee.phoneNumber}</span>
                                    </div>
                                    <div className="flex items-center font-medium text-gray-800">
                                        <Settings className="w-4 h-4 mr-2" />
                                        <span>Salary Base: ₹{employee.grossMonthlySalary?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2 mt-auto pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => openModal('view', employee)}
                                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => openPayrollModal(employee)}
                                        className="bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Payroll</span>
                                    </button>

                                    <button
                                        onClick={() => openModal('edit', employee)}
                                        className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee.id)}
                                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Modals */}
                {showModal && (
                    <>
                        {isPayrollMode && selectedEmployee && (
                            <PayrollInputModal
                                employee={selectedEmployee}
                                onClose={closeModal}
                                onUpdateSalary={handleUpdateSalary}
                            />
                        )}
                        {/* The rest of the modal logic (view/edit/add) goes here, which is large */}
                        {((modalType === 'view' || modalType === 'edit' || modalType === 'add') && (selectedEmployee || modalType === 'add')) && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div
                                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                    key={modalType + String(showModal)} 
                                >
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {modalType === 'add' && 'Add New Employee'}
                                                {modalType === 'edit' && 'Edit Employee'}
                                                {modalType === 'view' && 'Employee Details'}
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
                                        {/* View/Edit/Add Form Content */}
                                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                            <div className="space-y-4">
                                                {isViewMode ? (
                                                    <div className="space-y-4">
                                                        <div className="flex justify-center mb-4">
                                                            {selectedEmployee?.profilePhotoUrl ? (
                                                                <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                    <img
                                                                        src={selectedEmployee.profilePhotoUrl}
                                                                        alt={selectedEmployee.employeeName || 'Employee'}
                                                                        width={120}
                                                                        height={120}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <User className="w-16 h-16 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* View Mode Fields (Display only) */}
                                                            <div><p className="text-sm text-gray-600">Employee ID</p><p className="font-medium">{selectedEmployee?.employeeId}</p></div>
                                                            <div><p className="text-sm text-gray-600">Name</p><p className="font-medium">{selectedEmployee?.employeeName}</p></div>
                                                            <div><p className="text-sm text-gray-600">Email</p><p className="font-medium">{selectedEmployee?.email}</p></div>
                                                            <div><p className="text-sm text-gray-600">Password</p><div className="flex items-center space-x-2"><p className="font-medium">{showPassword ? selectedEmployee?.password : '••••••••'}</p><button type="button" onClick={togglePasswordVisibility} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">{showPassword ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}</button></div></div>
                                                            <div><p className="text-sm text-gray-600">Phone Number</p><p className="font-medium">{selectedEmployee?.phoneNumber}</p></div>
                                                            <div><p className="text-sm text-gray-600">Position</p><p className="font-medium">{selectedEmployee?.position}</p></div>
                                                            <div><p className="text-sm text-gray-600">Department</p><p className="font-medium">{selectedEmployee?.department}</p></div>
                                                            <div><p className="text-sm text-gray-600">Designation</p><p className="font-medium">{selectedEmployee?.designation || 'N/A'}</p></div>
                                                            <div><p className="text-sm text-gray-600">Joining Date</p><p className="font-medium">{selectedEmployee?.joiningDate}</p></div>
                                                            <div><p className="text-sm text-gray-600">Status</p><p className="font-medium">{selectedEmployee?.status}</p></div>
                                                            <div><p className="text-sm text-gray-600">Blood Group</p><p className="font-medium">{selectedEmployee?.bloodGroup}</p></div>
                                                            <div><p className="text-sm text-gray-600">Date of Birth</p><p className="font-medium">{selectedEmployee?.dateOfBirth || 'Not provided'}</p></div>
                                                            
                                                            <div className="md:col-span-2"><p className="text-sm text-gray-600">Current Address</p><p className="font-medium">{selectedEmployee?.currentAddress}</p></div>
                                                            <div className="md:col-span-2"><p className="text-sm text-gray-600">Permanent Address</p><p className="font-medium">{selectedEmployee?.permanentAddress}</p></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Edit/Add Mode Fields (Input fields)
                                                    <>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Employee ID */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                                                                <div className="flex items-center">
                                                                    <select
                                                                        className="px-2 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        value={employeeIdPrefix}
                                                                        onChange={e => {
                                                                            const newPrefix = e.target.value;
                                                                            setEmployeeIdPrefix(newPrefix);
                                                                            setFormData({ ...formData, employeeId: newPrefix });
                                                                        }}
                                                                        disabled={modalType === 'edit'}
                                                                    >
                                                                        <option value="EMPTA">EMPTA</option>
                                                                    </select>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        autoComplete="off"
                                                                        className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        value={formData.employeeId ? formData.employeeId.replace(employeeIdPrefix, '') : ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value.replace(/[^0-9A-Za-z]/g, '');
                                                                            setFormData({ ...formData, employeeId: employeeIdPrefix + val });
                                                                        }}
                                                                        placeholder="Enter unique ID"
                                                                        disabled={modalType === 'edit'}
                                                                    />
                                                                </div>
                                                                {employeeIdError && <div className="text-red-600 text-xs mt-1">{employeeIdError}</div>}
                                                            </div>
                                                            {/* Employee Name */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                                                                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.employeeName || ''} onChange={(e) => setFormData({...formData, employeeName: e.target.value})} />
                                                            </div>
                                                            {/* Email */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                                <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                                            </div>
                                                            {/* Password */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                                                <div className="relative">
                                                                    <input type={showPassword ? "text" : "password"} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                                                    <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors">{showPassword ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}</button>
                                                                </div>
                                                            </div>
                                                            {/* Phone Number */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                                <div className="flex gap-2">
                                                                    <select className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={countryCode} onChange={e => setCountryCode(e.target.value)}>{countryCodeOptions.map(code => (<option key={code} value={code}>{code}</option>))}</select>
                                                                    <input type="text" required maxLength={10} pattern="\d{10}" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={phoneNumberOnly} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setPhoneNumberOnly(val); }} placeholder="10 digit number"/>
                                                                </div>
                                                            </div>
                                                            {/* Position */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                                                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.position || ''} onChange={(e) => setFormData({...formData, position: e.target.value})} />
                                                            </div>
                                                            {/* Designation - FIX ADDED */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.designation || ''} onChange={(e) => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Senior Developer" />
                                                            </div>
                                                            {/* Department */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                                                <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.department || ''} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                                                                    {departmentOptions.map(opt => (<option key={opt} value={opt}>{opt ? opt : 'Select department'}</option>))}</select>
                                                            </div>
                                                            {/* Joining Date */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                                                                <input type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.joiningDate || ''} onChange={(e) => setFormData({...formData, joiningDate: e.target.value})} />
                                                            </div>
                                                            {/* Status */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                                                <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.status || 'Active'} onChange={(e) => setFormData({...formData, status: e.target.value as Employee['status']})}>
                                                                    <option value="Active">Active</option><option value="Joining">Joining</option><option value="Exit">Exit</option>
                                                                </select>
                                                            </div>
                                                            {/* Blood Group */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                                                <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.bloodGroup || ''} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}>
                                                                    {bloodGroupOptions.map(opt => (<option key={opt} value={opt}>{opt ? opt : 'Select blood group'}</option>))}</select>
                                                            </div>
                                                            {/* Date of Birth */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                                                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.dateOfBirth || ''} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                                                            </div>
                                                            {/* Profile Photo */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                                                                <div className="flex items-center space-x-3">
                                                                    <input id="profile-photo-input" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setProfilePhotoFile(file); setProfilePhotoPreview(URL.createObjectURL(file)); } else { setProfilePhotoFile(null); setProfilePhotoPreview(selectedEmployee?.profilePhotoUrl || null); } }} className="hidden"/>
                                                                    <button type="button" onClick={() => document.getElementById('profile-photo-input')?.click()} className="flex items-center px-5 py-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-lg"><Plus className="w-6 h-6 mr-2" /><span>Select Photo</span></button>
                                                                </div>
                                                                {profilePhotoPreview && (<div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mt-4"><img src={profilePhotoPreview} alt="Profile Preview" width={120} height={120} className="w-full h-full object-cover"/></div>)}
                                                            </div>
                                                        </div>

                                                        {/* Current Address */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                                                            <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.currentAddress || ''} onChange={(e) => setFormData({...formData, currentAddress: e.target.value})} />
                                                        </div>
                                                        {/* Permanent Address */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                                                            <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.permanentAddress || ''} onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
                                            <div className="flex space-x-3 pt-4">
                                                {/* Submission button only visible in add/edit mode */}
                                                {(modalType === 'add' || modalType === 'edit') && (
                                                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors" disabled={isSubmitting}>
                                                        {isSubmitting ? 'Saving...' : (modalType === 'add' ? 'Add Employee' : 'Update Employee')}
                                                    </button>
                                                )}
                                                <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                                    {isViewMode ? 'Close' : 'Cancel'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}