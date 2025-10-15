'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    User,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    Building,
    X,
    XCircle,
    AlertCircle,
    Loader2,
    Calendar,
    Edit,
    Upload,
    Save,
    Camera,
} from 'lucide-react';

// Interfaces for data type
interface Employee {
    id?: number;
    employeeId: string;
    employeeName: string;
    email: string;
    phoneNumber: string;
    bloodGroup: string;
    profilePhotoUrl?: string;
    profilePhotoPublicId?: string;
    currentAddress: string;
    permanentAddress: string;
    password?: string;
    position: string;
    department: string;
    joiningDate: string;
    relievingDate?: string; // Optional
    status: string; // Joining, Active, Relieving
    dateOfBirth: string; // <-- ADDED dateOfBirth to interface
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

// API Configuration
// FIX: Ensure API_BASE_URL ends with http://localhost:8080 OR the path starts with a slash.
// Since the environment variable likely doesn't have the slash, we fix the class below.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ----------------------------------------------------------------------
// API Service & Helper Components 
// ----------------------------------------------------------------------

class ApiService {
    private baseURL: string;

    constructor(baseURL: string) {
        // Ensure baseURL does NOT end with a slash, we'll add it in the methods.
        this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    }
    
    private getJsonHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
        };
    }
    
    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        if (!response.ok) {
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw new Error('Authentication failed. Please login again.');
            }
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                try {
                    errorMessage = await response.text() || errorMessage;
                } catch {
                    // Keep the default error message
                }
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        if (data.success !== undefined) {
            return data;
        } else {
            return {
                success: true,
                data: data,
                message: 'Success'
            };
        }
    }
    
    async getEmployeeProfile(employeeId: string): Promise<ApiResponse<Employee>> {
        // ⭐ FIX: Added '/' between this.baseURL and the rest of the path
        const response = await fetch(`${this.baseURL}/api/employees/byEmployeeId/${employeeId}`, {
            method: 'GET',
            headers: this.getJsonHeaders(),
        });
        return this.handleResponse<Employee>(response);
    }
    
    async updateEmployeeProfile(id: number, data: Partial<Employee>, photoFile?: File): Promise<ApiResponse<Employee>> {
        const formData = new FormData();
        formData.append('employee', JSON.stringify(data));
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        // ⭐ FIX: Added '/' between this.baseURL and the rest of the path
        const response = await fetch(`${this.baseURL}/api/employees/${id}`, {
            method: 'PUT',
            body: formData,
        });
        return this.handleResponse<Employee>(response);
    }
    
    async uploadProfilePhoto(employeeId: string, file: File): Promise<ApiResponse<{ profilePhotoUrl: string }>> {
        const formData = new FormData();
        formData.append('profilePhoto', file);
        // ⭐ FIX: Added '/' between this.baseURL and the rest of the path
        const response = await fetch(`${this.baseURL}/api/employees/${employeeId}/photo`, {
            method: 'POST',
            body: formData,
        });
        return this.handleResponse<{ profilePhotoUrl: string }>(response);
    }
}

const apiService = new ApiService(API_BASE_URL);


/** Input Field Helper */
const InputField: React.FC<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'date';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    isReadOnly?: boolean;
}> = ({ id, label, type, value, onChange, disabled, isReadOnly = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-2 px-3 sm:text-sm ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-blue-500 focus:border-blue-500'}`}
            required={!isReadOnly}
            disabled={disabled || isReadOnly}
        />
    </div>
);

/** Text Area Field Helper */
const TextAreaField: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled: boolean;
    isReadOnly?: boolean;
}> = ({ id, label, value, onChange, disabled, isReadOnly = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <textarea
            id={id}
            name={id}
            rows={3}
            value={value}
            onChange={onChange}
            className={`mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-2 px-3 sm:text-sm ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-blue-500 focus:border-blue-500'}`}
            required={!isReadOnly}
            disabled={disabled || isReadOnly}
        />
    </div>
);


/** The Edit Form Component - Professional fields are Read-Only */
const EditProfileForm: React.FC<{
    employee: Employee;
    onSave: (data: Partial<Employee>, photoFile: File | undefined) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}> = ({ employee, onSave, onCancel, isLoading }) => {
    
    // Initialize form data with all employee fields to ensure all required fields for the backend PUT are sent
    const [formData, setFormData] = useState<Partial<Employee>>(employee);
    const [photoFile, setPhotoFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(employee.profilePhotoUrl);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Fields the employee is ALLOWED to edit
    const editableFields: (keyof Employee)[] = [
        'employeeName', 'email', 'phoneNumber', 'bloodGroup', 
        'currentAddress', 'permanentAddress',
        'dateOfBirth', // <-- FIX: Added dateOfBirth to editable fields
    ];

    // Fields that are HR-controlled (read-only)
    const professionalFields: (keyof Employee)[] = [
        'position', 'department', 'joiningDate', 'status', 'relievingDate'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, photoFile);
    };

    const fieldLabels: { [key in keyof Employee]?: string } = {
        employeeName: 'Full Name',
        email: 'Email Address',
        phoneNumber: 'Phone Number',
        bloodGroup: 'Blood Group',
        currentAddress: 'Current Address',
        permanentAddress: 'Permanent Address',
        
        dateOfBirth: 'Date of Birth', // <-- ADDED LABEL
        
        position: 'Position',
        department: 'Department',
        joiningDate: 'Joining Date',
        status: 'Status',
        relievingDate: 'Relieving Date',
    };
    
    const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const getDateFormat = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    };


    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center border-b border-gray-100 pb-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg relative mb-4">
                    {previewUrl ? (
                        <Image
                            src={previewUrl.startsWith('blob:') ? previewUrl : (previewUrl.startsWith('http') ? previewUrl : `${API_BASE_URL}${previewUrl}`)}
                            alt="Profile Preview"
                            layout="fill"
                            objectFit="cover"
                            unoptimized={!previewUrl.startsWith('http')}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                            <Camera className="w-8 h-8" />
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    {photoFile ? 'Change Photo' : 'Upload New Photo'}
                </button>
                <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={isLoading}
                    key={previewUrl} 
                />
            </div>

            {/* Editable Personal Fields */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info Fields + Date of Birth */}
                    {editableFields.filter(key => 
                        key !== 'permanentAddress' && key !== 'currentAddress' && key !== 'bloodGroup'
                    ).map((key) => (
                        <InputField
                            key={key}
                            id={key}
                            label={fieldLabels[key]!}
                            // Check if field is dateOfBirth or joiningDate (if it were editable)
                            type={key.includes('Date') || key === 'dateOfBirth' ? 'date' : key === 'email' ? 'email' : key === 'phoneNumber' ? 'tel' : 'text'}
                            
                            // Use getDateFormat for date fields
                            value={key.includes('Date') || key === 'dateOfBirth' ? getDateFormat(formData[key] as string | undefined) : (formData[key] as string || '')}
                            
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    ))}
                    
                    {/* Blood Group Select */}
                    <div>
                        <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                            Blood Group
                        </label>
                        <select
                            id="bloodGroup"
                            name="bloodGroup"
                            value={formData.bloodGroup || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                            disabled={isLoading}
                        >
                            <option value="" disabled>Select Blood Group</option>
                            {bloodGroupOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Editable Address Fields */}
                <div className="space-y-6">
                    <TextAreaField
                        id="currentAddress"
                        label="Current Address"
                        value={formData.currentAddress || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    <TextAreaField
                        id="permanentAddress"
                        label="Permanent Address"
                        value={formData.permanentAddress || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Professional Fields - Read-Only/Disabled */}
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 pt-4">Professional Details (HR Controlled)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {professionalFields.map((key) => (
                       <InputField
                            key={key}
                            id={key}
                            label={fieldLabels[key]!}
                            type={key.includes('Date') ? 'date' : 'text'}
                            // Use getDateFormat helper for joiningDate/relievingDate
                            value={key.includes('Date') ? getDateFormat(formData[key] as string | undefined) : (formData[key] as string || '')}
                            onChange={() => {}} 
                            disabled={true} 
                            isReadOnly={true}
                       />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};


// ----------------------------------------------------------------------
// Profile View Helper Components (for clean rendering)
// ----------------------------------------------------------------------

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-gray-900 font-medium break-all">{value}</p>
        </div>
    </div>
);

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, gradient: string, children: React.ReactNode }> = ({ icon, title, gradient, children }) => (
    <div className="bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`px-8 py-6 border-b border-gray-100 bg-gradient-to-r ${gradient} bg-opacity-90`}>
            <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-xl mr-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

const DetailGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {children}
    </div>
);

const Detail: React.FC<{ keyName: string, value?: string, icon?: React.ReactNode, children?: React.ReactNode, strong?: boolean }> = ({ keyName, value, icon, children, strong = false }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{keyName}</label>
        {children ? children : (
            <div className="flex items-center">
                {icon}
                <p className={`text-gray-900 ${strong ? 'font-semibold text-lg' : 'font-medium'}`}>{value || 'Not specified'}</p>
            </div>
        )}
    </div>
);

// ----------------------------------------------------------------------
// Main Employee Profile Page Component
// ----------------------------------------------------------------------

export default function EmployeeProfilePage() {
    const router = useRouter();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    // FIX: The apiService instance is already defined globally above the component, 
    // but the useMemo hook was incorrectly creating a new one. Using the global instance.
    // const apiService = useMemo(() => new ApiService(API_BASE_URL), []); 
    const apiServiceInstance = useMemo(() => new ApiService(API_BASE_URL), []);

    const loadEmployeeData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setIsEditMode(false); 

            const employeeId = localStorage.getItem('employeeId');
            if (!employeeId) {
                router.replace('/login');
                return;
            }

            const profileResponse = await apiServiceInstance.getEmployeeProfile(employeeId);

            if (profileResponse.success) {
                setEmployee(profileResponse.data);
            } else {
                setError(profileResponse.error || 'Failed to load profile');
            }

        } catch (err) {
            if (err instanceof Error && err.message.includes('Authentication failed')) {
                router.replace('/login');
                return;
            }
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            console.error('Error loading employee data:', err);
        } finally {
            setLoading(false);
        }
    }, [apiServiceInstance, router]);

    useEffect(() => {
        loadEmployeeData();
    }, [loadEmployeeData]);

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setError(null);
    };

    /**
     * @description This save function ensures the old photo URL and HR-controlled fields are preserved.
     */
    const handleSaveProfile = async (data: Partial<Employee>, photoFile?: File) => {
        if (!employee || !employee.id) {
            setError('Employee data or ID is missing. Cannot save.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // CRITICAL FIX: Merge ALL existing employee data with the edited data.
            const fullPayload: Partial<Employee> = {
                ...employee, 
                ...data,     
            };
            
            const updateResponse = await apiServiceInstance.updateEmployeeProfile(employee.id, fullPayload, photoFile);

            if (updateResponse.success) {
                setEmployee(updateResponse.data);
                setIsEditMode(false);
            } else {
                setError(updateResponse.error || 'Failed to save profile changes.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during save.');
            console.error('Error saving employee data:', err);
        } finally {
            setSaving(false);
        }
    };


    // --- Utility Functions ---
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateExperience = (joiningDate: string) => {
        if (!joiningDate) return 'Not specified';
        const joinDate = new Date(joiningDate);
        const today = new Date();
        let years = today.getFullYear() - joinDate.getFullYear();
        let months = today.getMonth() - joinDate.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        const yearsString = years > 0 ? `${years} year${years !== 1 ? 's' : ''}` : '';
        const monthsString = months > 0 ? `${months} month${months !== 1 ? 's' : ''}` : '';

        if (yearsString && monthsString) {
            return `${yearsString}, ${monthsString}`;
        } else if (yearsString) {
            return yearsString;
        } else if (monthsString) {
            return monthsString;
        } else {
            return 'Less than a month';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'joining': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'relieving': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };
    // --- End Utility Functions ---

    // --- Loading and Error States ---
    if (error && !employee && !loading) {
        return (
            <div className="min-h-screen bg-gray-50/70 flex items-center justify-center p-6">
                <div className="text-center max-w-md mx-auto p-8 bg-white bg-opacity-90 rounded-2xl shadow-xl border border-gray-100">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Profile</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={loadEmployeeData}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Retry Loading Profile'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-white bg-opacity-90 rounded-2xl p-12 text-center shadow-xl border border-gray-100">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-6" />
                    <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!employee) return null;

    // --- Main Render Section ---

    return (
        <div className="min-h-screen bg-gray-50/70">
            {error && (
                <div className="bg-red-50 border border-red-200 p-4 mx-auto max-w-7xl mb-6 mt-6 rounded-xl bg-opacity-90">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm flex-grow">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0 p-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                   <div className={`bg-white/70 rounded-2xl shadow-xl border border-gray-200 ${isEditMode ? '' : 'p-8'}`}>
                       
                       {/* Header for View Mode */}
                       {!isEditMode && (
                           <div className="mb-8 flex justify-between items-center px-0">
                               <div>
                                   <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
                                   <p className="text-gray-600 mt-2">View and manage your personal information</p>
                                   <p className="text-sm text-gray-500 mt-1">Employee ID: {employee.employeeId}</p>
                               </div>
                               <button
                                   onClick={handleEditClick}
                                   className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md"
                               >
                                   <Edit className="w-5 h-5 mr-2" />
                                   Edit Profile
                               </button>
                           </div>
                       )}
                   
                       {isEditMode ? (
                           /* Edit Mode */
                           <div className="h-full">
                                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center">
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <Edit className="w-6 h-6 mr-3 text-blue-600" />
                                        Edit Personal Information
                                    </h1>
                                </div>
                                <EditProfileForm
                                    employee={employee}
                                    onSave={handleSaveProfile}
                                    onCancel={handleCancelEdit}
                                    isLoading={saving}
                                />
                           </div>
                       ) : (
                           /* View Mode */
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                               {/* Profile Summary Card - Left Column */}
                               <div className="lg:col-span-1">
                                   <div className="bg-white bg-opacity-90 rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-8">
                                       <div className="text-center mb-8">
                                           <div className="relative inline-block mb-6">
                                               <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                                   {employee.profilePhotoUrl ? (
                                                       <Image
                                                           src={employee.profilePhotoUrl.startsWith('http')
                                                               ? employee.profilePhotoUrl
                                                               : `${API_BASE_URL}/${employee.profilePhotoUrl}` // FIX: Added missing slash
                                                           }
                                                           alt="Profile"
                                                           width={128}
                                                           height={128}
                                                           className="w-full h-full object-cover"
                                                           unoptimized={!employee.profilePhotoUrl.startsWith('http')}
                                                       />
                                                   ) : (
                                                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold">
                                                           {employee.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                       </div>
                                                   )}
                                               </div>
                                               <div className={`absolute -bottom-2 -right-2 px-3 py-1 text-xs font-semibold rounded-full border-2 border-white shadow-sm ${getStatusColor(employee.status)}`}>
                                                   {employee.status}
                                               </div>
                                           </div>
                                           {/* Professional Summary in Sidebar */}
                                           <h2 className="text-2xl font-bold text-gray-900 mb-2">{employee.employeeName}</h2>
                                           <p className="text-blue-600 font-semibold text-lg mb-1">{employee.position}</p>
                                           <p className="text-gray-600 font-medium">{employee.department}</p>
                                       </div>

                                       <div className="border-t border-gray-100 pt-6 space-y-6">
                                           <DetailItem icon={<Mail className="w-4 h-4 text-blue-600" />} label="Email" value={employee.email} />
                                           <DetailItem icon={<Phone className="w-4 h-4 text-blue-600" />} label="Phone" value={employee.phoneNumber} />
                                           <DetailItem icon={<Building className="w-4 h-4 text-blue-600" />} label="Employee ID" value={employee.employeeId} />
                                       </div>
                                   </div>
                               </div>

                               {/* Detailed Information Cards - Right Column */}
                               <div className="lg:col-span-2 space-y-8">
                                   {/* Personal Information Card */}
                                   <InfoCard 
                                       icon={<User className="w-6 h-6 text-blue-600" />} 
                                       title="Personal Information" 
                                       gradient="from-blue-50 to-indigo-50"
                                   >
                                       <DetailGroup>
                                           <Detail keyName="Full Name" value={employee.employeeName} />
                                           <Detail keyName="Email Address" value={employee.email} />
                                           <Detail keyName="Phone Number" value={employee.phoneNumber} />
                                           <Detail keyName="Date of Birth" value={formatDate(employee.dateOfBirth)} icon={<Calendar className="w-4 h-4 text-gray-400 mr-2" />} /> {/* Display Date of Birth */}
                                           <Detail keyName="Blood Group">
                                               <span className="inline-flex px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
                                                   {employee.bloodGroup}
                                               </span>
                                           </Detail>
                                       </DetailGroup>
                                   </InfoCard>
                                   
                                   {/* Professional Information Card (HR-Controlled) */}
                                   <InfoCard 
                                       icon={<Briefcase className="w-6 h-6 text-emerald-600" />} 
                                       title="Professional Information" 
                                       gradient="from-emerald-50 to-teal-50"
                                   >
                                       <DetailGroup>
                                           <Detail keyName="Position" value={employee.position} strong={true} />
                                           <Detail keyName="Department" value={employee.department} />
                                           <Detail keyName="Date of Joining" value={formatDate(employee.joiningDate)} icon={<Calendar className="w-4 h-4 text-gray-400 mr-2" />} />
                                           <Detail keyName="Experience" value={calculateExperience(employee.joiningDate)} />
                                           <Detail keyName="Status">
                                               <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(employee.status)}`}>
                                                   {employee.status}
                                               </span>
                                           </Detail>
                                           {/* Display Relieving Date ONLY if the status is 'Relieving' */}
                                           {employee.status.toLowerCase() === 'relieving' && employee.relievingDate && (
                                               <Detail keyName="Relieving Date" value={formatDate(employee.relievingDate)} icon={<Calendar className="w-4 h-4 text-gray-400 mr-2" />} />
                                           )}
                                       </DetailGroup>
                                   </InfoCard>

                                   {/* Address Information Card */}
                                   <InfoCard 
                                       icon={<MapPin className="w-6 h-6 text-purple-600" />} 
                                       title="Address Information" 
                                       gradient="from-purple-50 to-pink-50"
                                   >
                                       <div className="space-y-8">
                                           <div>
                                               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Address</label>
                                               <p className="text-gray-900 font-medium text-base leading-relaxed">{employee.currentAddress || 'Not specified'}</p>
                                           </div>
                                           <div className="border-t border-gray-100 pt-8">
                                               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Permanent Address</label>
                                               <p className="text-gray-900 font-medium text-base leading-relaxed">{employee.permanentAddress || 'Not specified'}</p>
                                           </div>
                                       </div>
                                   </InfoCard>
                               </div>
                           </div>
                       )}
                   </div>
            </div>
        </div>
    );
}