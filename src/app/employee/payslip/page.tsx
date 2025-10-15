'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as numberToWords from 'number-to-words';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Download, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

// ====================================================================
// 1. INTERFACES (FIXED for Backend JSON Mapping)
// ====================================================================

interface CompanyData {
    name: string;
    address: string; // <-- CRITICAL FIX: Reverting to single 'address' field
    email?: string; // Included based on the Java DTO model, though unused here
    phone?: string; // Included based on the Java DTO model, though unused here
}

interface EmployeeData {
    name: string;
    id: string; // Changed back to 'id' to reflect the Java DTO and the URL logic
    designation: string;
    department: string;
    location: string;
    joiningDate: string;
    
    pan: string;
    uan: string; 
    
    bank: string; // Changed to 'bank' to match the Java DTO
    accountNo: string; // Changed to 'accountNo' to match the Java DTO
    
    workDays: number; // Changed to 'workDays' to match the Java DTO
    lop: number;
}

interface EarningsDeduction {
    label: string;
    amount: number;
    // Removed fullAmount as it's not present in the Java DTO and causes confusion
}

export interface PayslipData {
    company: CompanyData;
    month: string;
    employee: EmployeeData;
    earnings: EarningsDeduction[];
    deductions: EarningsDeduction[];
    printDate: string;

    // Added the totals which are returned by the Spring DTO
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
}

interface PayslipMetadata {
    month: number;
    year: number;
    monthName: string;
    netPay: number;
    payslipUrl: string; // Added for download link
}

// ====================================================================
// 2. CONFIGURATION & HELPERS
// ====================================================================

const API_BASE_URL = 'http://localhost:8080'; // Ensure this matches your Spring Boot server port

const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

// Helper to replace commas with <br> for clean display
const formatAddress = (address: string): React.ReactNode => {
    if (!address) return null;
    // Replace comma + space with <br/> for the address lines
    return address.split(', ').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            {index < address.split(', ').length - 1 && <br />}
        </React.Fragment>
    ));
};

// --- PayslipContent Component (UPDATED MAPPING) ---
const PayslipContent: React.FC<{ data: PayslipData }> = ({ data }) => {
    // Note: Using the netPay, totalEarnings, totalDeductions from the DTO directly
    const totalEarnings = data.totalEarnings; 
    const totalDeductions = data.totalDeductions;
    const netPay = data.netPay;
    
    const netPayWords = numberToWords.toWords(Math.round(netPay || 0)).toUpperCase();
    const maxRows = Math.max(data.earnings.length, data.deductions.length);

    // --- STYLE DEFINITIONS ---
    const TD_STYLE = { padding: '4px 6px', fontSize: '12px', verticalAlign: 'top', lineHeight: '1.2' };
    const FONT_NORMAL_STYLE = { fontWeight: 'normal' };
    const FONT_MEDIUM_STYLE = { fontWeight: '500' };
    const TABLE_BORDER_STYLE = { borderCollapse: 'collapse', border: '1px solid black', width: '100%' };
    const HEADER_TITLE_STYLE = { fontWeight: 'bold', fontSize: '14px', borderTop: '1px solid black', borderBottom: '1px solid black', padding: '5px 0', marginTop: '5px', backgroundColor: '#f3f4f6' };
    // -------------------------

    return (
        <div style={{ width: '8.5in', margin: '20px auto', backgroundColor: 'white' }}>
            
            {/* 1. Header and Company Info */}
            <table style={{ ...TABLE_BORDER_STYLE }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ width: '100px', height: '50px', display: 'flex', alignItems: 'center' }}>
                                    <Image 
                                        src="/originaltirangalogo.png" 
                                        alt="Company Logo" 
                                        width={150}
                                        height={50}
                                        priority
                                        style={{ width: '100px', height: 'auto' }}
                                    />
                                </div>
                                
                                <div style={{ fontSize: '12px', flexGrow: 1, textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{data.company.name}</div>
                                    
                                    {/* CRITICAL FIX: Use the single 'address' field and format it */}
                                    <div style={{ marginTop: '2px', lineHeight: '1.4' }}>
                                        {formatAddress(data.company.address)}
                                    </div>

                                </div>

                                <div style={{ width: '100px' }}></div>
                            </div>
                            
                            <div style={HEADER_TITLE_STYLE}>
                                Payslip – {data.month}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 2. Employee Details Table (Nested Structure) */}
            <table style={{ ...TABLE_BORDER_STYLE, borderTop: 'none' }}>
                <tbody>
                    <tr>
                        {/* Left Side */}
                        <td style={{ width: '50%', borderRight: '1px solid black' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {/* FIX: Use employee.name */}
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Name:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.name}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>Joining Date:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.joiningDate}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>Designation:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.designation}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>Department:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.department}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>Location:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.location}</td></tr>
                                    {/* FIX: Use employee.workDays */}
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>Effective Work Days:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.workDays}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>LOP:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.lop}</td></tr>
                                </tbody>
                            </table>
                        </td>
                        
                        {/* Right Side */}
                        <td style={{ width: '50%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {/* FIX: Use employee.id */}
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Employee No:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.id}</td></tr>
                                    {/* FIX: Use employee.bank */}
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>Bank Name:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.bank}</td></tr>
                                    {/* FIX: Use employee.accountNo */}
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>Bank Account No:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.accountNo}</td></tr>
                                    {/* FIX: Use employee.pan */}
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>PAN Number:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.pan}</td></tr>
                                    {/* Use employee.uan */}
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE }}>UAN:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE }}>{data.employee.uan}</td></tr>
                                    <tr><td style={TD_STYLE}></td><td style={TD_STYLE}></td></tr>
                                    <tr><td style={TD_STYLE}></td><td style={TD_STYLE}></td></tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 3. Earnings and Deductions Main Table */}
            <table style={{ ...TABLE_BORDER_STYLE, borderTop: 'none' }}>
                <thead>
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                        <th style={{ ...TD_STYLE, width: '25%', textAlign: 'left', borderBottom: '1px solid black', borderRight: '1px solid black' }}>Earnings</th>
                        {/* Removed 'Full' column as it is not used/set by the backend DTO in the service logic */}
                        <th style={{ ...TD_STYLE, width: '25%', textAlign: 'right', borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black' }}>Actual</th>
                        <th style={{ ...TD_STYLE, width: '25%', textAlign: 'left', borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black' }}>Deductions</th>
                        <th style={{ ...TD_STYLE, width: '25%', textAlign: 'right', borderBottom: '1px solid black' }}>Actual</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Max Rows changed to 3 to simplify the layout and match the standard 3 earnings/2 deductions */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                            <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black' }}>{data.earnings[i]?.label || ''}</td>
                            {/* Removed 'Full' column cell */}
                            <td style={{ ...TD_STYLE, textAlign: 'right', borderRight: '1px solid black' }}>{data.earnings[i]?.amount ? formatCurrency(data.earnings[i].amount) : ''}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black' }}>{data.deductions[i]?.label || ''}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'right' }}>{data.deductions[i]?.amount ? formatCurrency(data.deductions[i].amount) : (data.deductions[i] ? '0' : '')}</td>
                        </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', borderTop: '1px solid black', backgroundColor: '#f3f4f6' }}>
                        <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black' }}>Total Earnings:</td>
                        {/* Merging the Full/Actual columns for Total Earnings */}
                        <td style={{ ...TD_STYLE, textAlign: 'right', borderRight: '1px solid black' }} colSpan={1}>{formatCurrency(totalEarnings)}</td> 
                        <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black' }}>Total Deductions:</td>
                        <td style={{ ...TD_STYLE, textAlign: 'right' }}>{formatCurrency(totalDeductions)}</td>
                    </tr>
                </tbody>
            </table>

            {/* 4. Net Pay Summary */}
            <div style={{ ...TABLE_BORDER_STYLE, borderTop: 'none', padding: '10px 15px', fontWeight: 'bold', fontSize: '14px', backgroundColor: 'white' }}>
                Net Pay for the month (Total Earnings - Total Deductions): {formatCurrency(netPay)}/-
                <div style={{ fontWeight: 'normal', fontSize: '12px', marginTop: '5px' }}>
                    ({netPayWords} Only)
                </div>
            </div>
            
            {/* 5. Footer (System-generated text) */}
            <div style={{ padding: '5px 15px', fontSize: '10px', color: '#666', borderLeft: '1px solid black', borderRight: '1px solid black', borderBottom: '1px solid black' }}>
                This is a system-generated payslip and does not require signature.
                <span style={{ float: 'right' }}>Print Date: {data.printDate}</span>
            </div>
        </div>
    );
};


// -------------------------------------------------------------------
// DYNAMIC HOOK: Retrieves the ID from Session/Local Storage (Unchanged)
// -------------------------------------------------------------------
function useAuthId(): { employeeId: string | null, isAuthLoading: boolean } {
    const [id, setId] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter(); 

    useEffect(() => {
        // 1. Check URL query first (highest priority)
        const urlId = searchParams.get('employeeId');
        if (urlId) {
             setId(urlId);
             setIsAuthLoading(false);
             return;
        }

        // 2. Check Session Storage (synchronize with Attendance page)
        const sessionId = sessionStorage.getItem('employeeId'); 
        if (sessionId) {
            setId(sessionId);
            setIsAuthLoading(false);
            return;
        }
        
        // 3. Check Local Storage (fallback)
        const localId = localStorage.getItem('employeeId'); 
        if (localId) {
            setId(localId);
            setIsAuthLoading(false);
            return;
        }
        
        // Final failure: No ID found
        setIsAuthLoading(false);
        
    }, [searchParams, router]);

    return { employeeId: id, isAuthLoading };
}
// -------------------------------------------------------------------


// ====================================================================
// 3. MAIN PAGE COMPONENT (Using dynamic ID)
// ====================================================================

export default function PayslipPage() {
    const { employeeId, isAuthLoading } = useAuthId(); 
    
    const [payslipList, setPayslipList] = useState<PayslipMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPayslipData, setCurrentPayslipData] = useState<PayslipData | null>(null);
    const [viewLoading, setViewLoading] = useState(false);
    const router = useRouter();
    
    // Implementation of API fetch for the metadata list
    const fetchPayslipList = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const url = `${API_BASE_URL}/api/payroll/payslips/metadata?employeeId=${id}`;
            const response = await axios.get<PayslipMetadata[]>(url);
            
            if (response.status === 200 && response.data && response.data.length > 0) {
                setPayslipList(response.data);
                setError(null);
            } else {
                 setPayslipList([]);
                 setError(`No payslip records found for Employee ID: ${id}.`);
            }

        } catch (err: any) {
            console.error('Payslip Metadata Fetch Error:', err.response || err.message); 
            const status = err.response?.status;
            
            if (status === 404) {
                 setError("404 API Not Found. Check if Spring Boot is running and the route /api/payroll/payslips/metadata exists.");
            } else {
                 setError(`Failed to load payslips. Please check server connection.`);
            }
            setPayslipList([]);

        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch data using the resolved ID
    useEffect(() => {
        if (!isAuthLoading) {
            if (employeeId) {
                fetchPayslipList(employeeId);
            } else {
                setLoading(false);
                setError("Please log in. Employee ID is required to fetch payslips.");
            }
        }
    }, [employeeId, isAuthLoading, fetchPayslipList]); 

    // handleCloseModal, handleDownloadPayslip, handleViewPayslip functions (rest of the logic)
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleViewPayslip = async (payslip: PayslipMetadata) => {
        if (!employeeId) return;

        setViewLoading(true);
        setError(null);
        
        try {
            const url = `${API_BASE_URL}/api/payroll/payslip?month=${payslip.month}&year=${payslip.year}&employeeId=${employeeId}`;
            // Use PayslipData interface here
            const response = await axios.get<PayslipData>(url);

            if (response.status === 200) {
                setCurrentPayslipData(response.data);
                setIsModalOpen(true);
            } else {
                setError(`Failed to fetch payslip data. Status: ${response.status}`);
            }
            
        } catch (err: any) {
             const errorMessage = err.response?.data || err.message;
             setError(`Failed to load payslip details: ${errorMessage}`);
        } finally {
            setViewLoading(false);
        }
    };
    
    const handleDownloadPayslip = async (payslip: PayslipMetadata) => {
        if (payslip.payslipUrl) {
            window.open(payslip.payslipUrl, '_blank');
        } else {
            alert("Payslip PDF not found on the server. Please ask HR to generate it.");
        }
    };
    

    // UPDATED LOADING STATE: Check for both auth and data loading
    if (isAuthLoading || loading) {
        return <div className="text-center p-8 text-xl font-semibold text-blue-600">
            <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> {isAuthLoading ? 'Resolving Employee ID...' : 'Loading payslips...'}
        </div>;
    }

    if (error) {
        return <div className="text-center p-8 text-xl font-semibold text-red-600">
            <AlertTriangle className="w-6 h-6 inline-block mr-2" /> Error: {error}
        </div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Payslips</h1>
            
            {/* Payslip List Table */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month & Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay (₹)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payslipList.length > 0 ? payslipList.map((payslip) => (
                            <tr key={`${payslip.year}-${payslip.month}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payslip.monthName} {payslip.year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(payslip.netPay)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                                    <button
                                        onClick={() => handleViewPayslip(payslip)}
                                        disabled={viewLoading}
                                        className="inline-flex items-center px-3 py-1 border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md shadow-sm text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                        {viewLoading ? 'Loading...' : <> <Eye className="w-4 h-4 mr-1" /> View </>}
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPayslip(payslip)}
                                        disabled={!payslip.payslipUrl} 
                                        className="inline-flex items-center px-3 py-1 border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 rounded-md shadow-sm text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4 mr-1" /> Download PDF
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                    No payslips available. 
                                    <br/>
                                    {employeeId ? `The payslip for this period has not yet been generated or archived by HR.` : "Please ensure you are logged in."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* View Payslip Modal */}
            {isModalOpen && currentPayslipData && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-5xl w-full my-8 shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Payslip View: {currentPayslipData.month}</h2>
                            <div className="flex space-x-3">
                                <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                        
                        {/* Payslip Content Area */}
                        <div className="p-0"> 
                            <PayslipContent data={currentPayslipData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}