'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronsRight, Loader2, CheckCircle, AlertTriangle, FileText, Calendar, Banknote } from 'lucide-react';

// ------------------------------------------------------------------------
// DTO INTERFACE - Matches the backend EmployeePayrollDTO
// ------------------------------------------------------------------------
interface EmployeePayrollDTO {
    id: number;
    employeeName: string;
    employeeId: string;
    email: string;
    position: string;
    department: string;
    bankName: string;
    pfNumber: string;
    uan: string;
    lastPayslipMonth: string;
    lastPayslipStatus: 'Generated' | 'Pending' | 'Error';
    effectiveWorkDays: number;
}
// ------------------------------------------------------------------------

const API_BASE_URL = 'http://localhost:8080';

// Month-Year Picker Component
const MonthYearSelectorComponent: React.FC<{ month: number; year: number; onChange: (month: number, year: number) => void }> = ({ month, year, onChange }) => {
    return (
        <div className="flex space-x-3 items-center">
            <label className="text-sm font-medium text-gray-700">Payroll Period:</label>
            <select
                value={month}
                onChange={(e) => onChange(parseInt(e.target.value, 10), year)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                        {new Date(year, m - 1).toLocaleString('en-US', { month: 'long' })}
                    </option>
                ))}
            </select>
            <select
                value={year}
                onChange={(e) => onChange(month, parseInt(e.target.value, 10))}
                className="p-2 border border-gray-300 rounded-lg text-sm"
            >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
    );
};

const HRPayslipManagerPage: React.FC = () => {
    const [employees, setEmployees] = useState<EmployeePayrollDTO[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [payrollMonth, setPayrollMonth] = useState<number>(currentMonth);
    const [payrollYear, setPayrollYear] = useState<number>(currentYear);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get<EmployeePayrollDTO[]>(`${API_BASE_URL}/api/employees/payroll-list`);
            setEmployees(response.data);
            setStatus('Employee payroll data fetched successfully.');
        } catch (error: any) {
            console.error('Fetch Error:', error);
            const errorMessage = error.response?.data?.message 
                                 || error.response?.data?.error
                                 || `(Status ${error.response?.status}) ${error.message}`;
            setStatus(`Error loading employee list: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleMonthYearChange = (month: number, year: number) => {
        setPayrollMonth(month);
        setPayrollYear(year);
    };

    const handleGeneratePayslip = async (employeeId: string | null) => {
        const actionText = employeeId ? `Employee ID: ${employeeId}` : 'All Employees';
        setStatus(`Initiating payroll generation for ${actionText}...`);
        setIsGenerating(true);

        try {
            // This URL hits the Spring Boot backend
            const employeeQuery = employeeId ? `employeeId=${employeeId}&` : '';
            const url = `${API_BASE_URL}/api/payroll/generate-archive?${employeeQuery}month=${payrollMonth}&year=${payrollYear}`;

            // Send POST request to Spring Boot (which, in turn, POSTs to Next.js)
            const response = await axios.post<string>(url, null, {
                headers: { 'Content-Type': 'application/json' },
            });

            setStatus(response.data || `Payslip generation successful for ${actionText}.`);
            
            // Refresh the employee status list after a delay
            setTimeout(fetchEmployees, 2000); 
        } catch (error: any) {
            console.error('Payslip Generation Error:', error);
            
            // **IMPROVED ERROR HANDLING (REMAINS CORRECT)**
            let errorMessage = error.message;

            if (error.response) {
                const status = error.response.status;
                let details = error.response.data;

                if (status === 405) {
                    errorMessage = `Payslip generation and archiving failed: Failed to fetch PDF from frontend service. Error: 405 Method Not Allowed on POST request for "http://localhost:3000/api/generate-payslip-pdf" (No body).`;
                    
                } else if (typeof details === 'object' && details !== null) {
                    // Try to extract a meaningful message from the JSON body sent by the Java service
                    // The Java service sends back the RestClientException details when it fails to call Next.js
                    // We check for the error detail that matches the log provided by the user (the 405 error log)
                    const logDetails = details.error?.includes('405 Method Not Allowed') ? details.error : details.message;
                    
                    errorMessage = logDetails || `Failed to fetch PDF. Status: ${status}.`;

                } else {
                    errorMessage = details || `Request failed with status ${status}`;
                }
            } else if (error.request) {
                 errorMessage = `Could not reach Spring Boot service (http://localhost:8080) or Next.js service is unreachable.`;
            } 
            
            setStatus(`Generation failed for ${actionText}: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center p-12 text-xl text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Loading employee data...
            </div>
        );
    }

    const getStatusStyle = () => {
        // Updated to catch the status 405 error message better
        if (status?.includes('Error') || status?.includes('failed') || status?.includes('405')) return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' };
        if (status?.includes('Success') || status?.includes('fetched') || status?.includes('archived') || status?.includes('successfully')) return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' };
        if (isGenerating || status?.includes('Initiating')) return { icon: Loader2, color: 'text-blue-600 animate-spin', bg: 'bg-blue-50', border: 'border-blue-300' };
        return { icon: FileText, color: 'text-gray-600', bg: 'bg-yellow-50', border: 'border-yellow-300' };
    };

    const getLastStatusColor = (status: string) => {
        switch (status) {
            case 'Generated':
                return 'bg-emerald-100 text-emerald-800';
            case 'Error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const { icon: StatusIcon, color: statusColor, bg: statusBg, border: statusBorder } = getStatusStyle();

    return (
        <div className="p-8 max-w-7xl mx-auto bg-white min-h-screen shadow-xl rounded-xl">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900 border-b pb-4">Payroll Generation Console</h1>

            {/* Status Panel */}
            <div className={`mb-6 p-4 rounded-xl shadow-inner ${statusBg} ${statusBorder} border`}>
                <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-6 h-6 ${statusColor}`} />
                    <div>
                        <p className="font-bold text-gray-800">System Status:</p>
                        <p className={`text-sm ${statusColor}`}>{status || 'Ready for payslip generation.'}</p>
                    </div>
                </div>
            </div>

            {/* Bulk Payroll Generation Section */}
            <section className="mb-10 p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Monthly Payslip Generation</h2>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                    <MonthYearSelectorComponent month={payrollMonth} year={payrollYear} onChange={handleMonthYearChange} />

                    <button
                        onClick={() => handleGeneratePayslip(null)} 
                        disabled={isGenerating}
                        className={`px-8 py-3 rounded-xl font-bold text-lg transition duration-200 shadow-lg flex items-center space-x-2 
                          ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronsRight className="w-5 h-5" />}
                        <span>{isGenerating ? 'Processing...' : `Generate & Archive for ${payrollMonth}/${payrollYear}`}</span>
                    </button>
                </div>
            </section>

            {/* Employee Table */}
            <section>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    Employee Payroll Details ({employees.length} employees)
                </h2>

                <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Employee</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Position</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Work Days</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Bank / PF / UAN</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Last Payslip</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{emp.employeeName}</div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {emp.employeeId} / {emp.department}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-600">{emp.position}</td>
                                    <td className="px-3 py-4 text-sm font-semibold text-indigo-600 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" /> {emp.effectiveWorkDays || 'N/A'}
                                    </td>
                                    <td className="px-3 py-4 text-xs text-gray-500">
                                        <div>
                                            <Banknote className="w-4 h-4 inline-block mr-1 text-gray-400" /> {emp.bankName || 'Missing'}
                                        </div>
                                        <div className="mt-1">PF: {emp.pfNumber || 'N/A'}</div>
                                        <div>UAN: {emp.uan || 'N/A'}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getLastStatusColor(emp.lastPayslipStatus)}`}>
                                            {emp.lastPayslipStatus || 'Pending'}
                                        </span>
                                        <div className="text-xs text-gray-500">{emp.lastPayslipMonth || 'N/A'}</div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <button
                                            onClick={() => handleGeneratePayslip(emp.employeeId)}
                                            disabled={isGenerating}
                                            className={`text-xs px-3 py-1 rounded-md font-semibold transition duration-200 
                                            ${isGenerating ? 'bg-gray-200 text-gray-500' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                        >
                                            Generate Payslip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default HRPayslipManagerPage;