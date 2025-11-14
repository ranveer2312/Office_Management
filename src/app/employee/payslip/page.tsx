'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import axios from 'axios';
import * as numberToWords from 'number-to-words';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Download, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

// 🚀 REQUIRED IMPORTS FOR CLIENT-SIDE PDF GENERATION
import html2canvas from 'html2canvas'; 
import { jsPDF } from 'jspdf'; 

// ====================================================================
// 1. INTERFACES (UNCHANGED)
// ====================================================================

interface CompanyData {
    name: string;
    address: string; 
    email?: string; 
    phone?: string; 
}

interface EmployeeData {
    name: string;
    id: string; 
    designation: string;
    department: string;
    location: string;
    joiningDate: string;
    
    pan: string;
    uan: string; 
    
    bank: string; 
    accountNo: string; 
    
    workDays: number; 
    lop: number;
}

interface EarningsDeduction {
    label: string;
    amount: number;
}

export interface PayslipData {
    company: CompanyData;
    month: string;
    employee: EmployeeData;
    earnings: EarningsDeduction[];
    deductions: EarningsDeduction[];
    printDate: string;

    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
}

interface PayslipMetadata {
    month: number;
    year: number;
    monthName: string;
    netPay: number;
    payslipUrl: string; 
}

// ====================================================================
// 2. CONFIGURATION & HELPERS (UNCHANGED)
// ====================================================================

const API_BASE_URL = 'http://localhost:8080'; 

const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

const formatAddress = (address: string): React.ReactNode => {
    if (!address) return null;
    return address.split(', ').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            {index < address.split(', ').length - 1 && <br />}
        </React.Fragment>
    ));
};

// --- PayslipContent Component (Rendering the Payslip HTML) ---
const PayslipContent: React.FC<{ data: PayslipData }> = ({ data }) => {
    const totalEarnings = data.totalEarnings; 
    const totalDeductions = data.totalDeductions;
    const netPay = data.netPay;
    
    const netPayWords = numberToWords.toWords(Math.round(netPay || 0)).toUpperCase();
    
    // --- STYLE DEFINITIONS ---
    const TOTAL_WIDTH = '790px'; 
    const COL_WIDTH = '197.5px'; 
    
    // Cell Padding and alignment styles
    const TD_STYLE = { padding: '8px 6px', fontSize: '12px', verticalAlign: 'middle' as 'middle', lineHeight: '1.2' }; 
    const FONT_NORMAL_STYLE = { fontWeight: 'normal' };
    const FONT_MEDIUM_STYLE = { fontWeight: '500' };
    const TABLE_BORDER_STYLE = { borderCollapse: 'collapse' as 'collapse', border: '1px solid black', width: '100%', tableLayout: 'fixed' as 'fixed' }; 
    const HEADER_TITLE_STYLE = { fontWeight: 'bold', fontSize: '14px', borderTop: '1px solid black', borderBottom: '1px solid black', padding: '5px 0', marginTop: '5px', backgroundColor: '#f3f4f6' };
    const TH_E_D_STYLE = { padding: '8px 6px', fontSize: '12px', verticalAlign: 'middle' as 'middle', lineHeight: '1.2' };
    
    // ⭐ NEW LOGO DIMENSIONS
    const LOGO_WIDTH = 140; 
    const LOGO_HEIGHT = 70;
    const LOGO_CONTAINER_WIDTH = `${LOGO_WIDTH}px`;
    const LOGO_CONTAINER_HEIGHT = `${LOGO_HEIGHT}px`;
    // -------------------------

    return (
        // Set the payslip container to a rigid pixel width
        <div style={{ width: TOTAL_WIDTH, margin: '20px auto', backgroundColor: 'white' }}>
            
            {/* 1. Header and Company Info */}
            <table style={{ ...TABLE_BORDER_STYLE, tableLayout: 'auto' as 'auto' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '10px 15px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                
                                {/* ⭐ UPDATED LOGO CONTAINER: Increased size */}
                                <div style={{ width: LOGO_CONTAINER_WIDTH, height: LOGO_CONTAINER_HEIGHT, display: 'flex', alignItems: 'center', minWidth: LOGO_CONTAINER_WIDTH }}>
                                    <Image 
                                        src="/originaltirangalogo.png" 
                                        alt="Tiranga Aerospace Logo" 
                                        width={LOGO_WIDTH} // Updated width
                                        height={LOGO_HEIGHT} // Updated height
                                        style={{ width: LOGO_CONTAINER_WIDTH, height: 'auto' }}
                                        priority
                                    />
                                </div>
                                
                                <div style={{ fontSize: '12px', flexGrow: 1, textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{data.company.name}</div>
                                    <div style={{ marginTop: '2px', lineHeight: '1.4' }}>
                                        {formatAddress(data.company.address)}
                                    </div>
                                </div>

                                <div style={{ width: LOGO_CONTAINER_WIDTH, minWidth: LOGO_CONTAINER_WIDTH }}></div>
                            </div>
                            
                            <div style={HEADER_TITLE_STYLE}>
                                Payslip – {data.month}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 2. Employee Details Table (Nested Structure) */}
            <table style={{ ...TABLE_BORDER_STYLE, borderTop: 'none', tableLayout: 'fixed' as 'fixed' }}>
                <tbody>
                    <tr>
                        {/* Left Side */}
                        <td style={{ width: '50%', borderRight: '1px solid black' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' as 'collapse' }}>
                                <tbody>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Name:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.name}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Joining Date:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.joiningDate}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Designation:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.designation}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Department:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.department}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Location:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.location}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Effective Work Days:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.workDays}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>LOP:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.lop}</td></tr>
                                </tbody>
                            </table>
                        </td>
                        
                        {/* Right Side */}
                        <td style={{ width: '50%' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' as 'collapse' }}>
                                <tbody>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Employee No:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.id}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Bank Name:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.bank}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>Bank Account No:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.accountNo}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>PAN Number:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.pan}</td></tr>
                                    <tr><td style={{ ...TD_STYLE, ...FONT_NORMAL_STYLE, width: '40%' }}>UAN:</td><td style={{ ...TD_STYLE, ...FONT_MEDIUM_STYLE, width: '60%' }}>{data.employee.uan}</td></tr>
                                    <tr><td style={TD_STYLE}></td><td style={TD_STYLE}></td></tr>
                                    <tr><td style={TD_STYLE}></td><td style={TD_STYLE}></td></tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* 3. Earnings and Deductions Main Table */}
            <table style={{ ...TABLE_BORDER_STYLE, borderTop: 'none', tableLayout: 'fixed' as 'fixed' }}>
                <thead>
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                        <th style={{ ...TH_E_D_STYLE, width: COL_WIDTH, textAlign: 'left', borderBottom: '1px solid black', borderRight: '1px solid black' }}>Earnings</th>
                        <th style={{ ...TH_E_D_STYLE, width: COL_WIDTH, textAlign: 'right', borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black' }}>Actual</th>
                        <th style={{ ...TH_E_D_STYLE, width: COL_WIDTH, textAlign: 'left', borderLeft: '1px solid black', borderBottom: '1px solid black', borderRight: '1px solid black' }}>Deductions</th>
                        <th style={{ ...TH_E_D_STYLE, width: COL_WIDTH, textAlign: 'right', borderBottom: '1px solid black' }}>Actual</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                            <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black', width: COL_WIDTH }}>{data.earnings[i]?.label || ''}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'right', borderRight: '1px solid black', width: COL_WIDTH }}>{data.earnings[i]?.amount ? formatCurrency(data.earnings[i].amount) : ''}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black', width: COL_WIDTH }}>{data.deductions[i]?.label || ''}</td>
                            <td style={{ ...TD_STYLE, textAlign: 'right', width: COL_WIDTH }}>{data.deductions[i]?.amount ? formatCurrency(data.deductions[i].amount) : (data.deductions[i] ? '0' : '')}</td>
                        </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', borderTop: '1px solid black', backgroundColor: '#f3f4f6' }}>
                        <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black', width: COL_WIDTH }}>Total Earnings:</td>
                        <td style={{ ...TD_STYLE, textAlign: 'right', borderRight: '1px solid black', width: COL_WIDTH }}>{formatCurrency(totalEarnings)}</td> 
                        <td style={{ ...TD_STYLE, textAlign: 'left', borderRight: '1px solid black', width: COL_WIDTH }}>Total Deductions:</td>
                        <td style={{ ...TD_STYLE, textAlign: 'right', width: COL_WIDTH }}>{formatCurrency(totalDeductions)}</td>
                    </tr>
                </tbody>
            </table>

            {/* 4. Net Pay Summary */}
            <div style={{ 
                ...TABLE_BORDER_STYLE, 
                borderTop: 'none', 
                padding: '10px 15px', 
                fontWeight: 'bold', 
                fontSize: '14px', 
                backgroundColor: 'white',
                lineHeight: '1.4' 
            }}>
                Net Pay for the month (Total Earnings - Total Deductions): {formatCurrency(netPay)}/-
                <div style={{ fontWeight: 'normal', fontSize: '12px', marginTop: '5px' }}>
                    ({netPayWords} Only)
                </div>
            </div>
            
            {/* 5. Footer (System-generated text) */}
            <div style={{ padding: '5px 15px', fontSize: '10px', color: '#666', borderLeft: '1px solid black', borderRight: '1px solid black', borderBottom: '1px solid black', display: 'flex', justifyContent: 'space-between' }}>
                <span>This is a system-generated payslip and does not require signature.</span>
                <span>Print Date: {data.printDate}</span>
            </div>
        </div>
    );
};


// -------------------------------------------------------------------
// DYNAMIC HOOK: Retrieves the ID from Session/Local Storage (UNCHANGED)
// -------------------------------------------------------------------
function useAuthId(): { employeeId: string | null, isAuthLoading: boolean } {
    const [id, setId] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter(); 

    useEffect(() => {
        const urlId = searchParams.get('employeeId');
        if (urlId) {
             setId(urlId);
             setIsAuthLoading(false);
             return;
        }

        const sessionId = sessionStorage.getItem('employeeId'); 
        if (sessionId) {
            setId(sessionId);
            setIsAuthLoading(false);
            return;
        }
        
        const localId = localStorage.getItem('employeeId'); 
        if (localId) {
            setId(localId);
            setIsAuthLoading(false);
            return;
        }
        
        setIsAuthLoading(false);
        
    }, [searchParams, router]);

    return { employeeId: id, isAuthLoading };
}
// -------------------------------------------------------------------


// ====================================================================
// 3. MAIN PAGE COMPONENT (Using dynamic ID) (UNCHANGED LOGIC)
// ====================================================================

export default function PayslipPage() {
    const { employeeId, isAuthLoading } = useAuthId(); 
    
    const [payslipList, setPayslipList] = useState<PayslipMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPayslipData, setCurrentPayslipData] = useState<PayslipData | null>(null);
    const [viewLoading, setViewLoading] = useState(false);
    
    const payslipRef = useRef<HTMLDivElement>(null); 
    
    const router = useRouter();
    
    // Fetching metadata list (Unchanged)
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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPayslipData(null); 
    };

    // View Payslip: Fetches data and sets modal state
    const handleViewPayslip = async (payslip: PayslipMetadata) => {
        if (!employeeId) return;

        setViewLoading(true);
        setError(null);
        
        try {
            const url = `${API_BASE_URL}/api/payroll/payslip?month=${payslip.month}&year=${payslip.year}&employeeId=${employeeId}`;
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
    
    // Download Payslip: Triggers client-side PDF generation (UNCHANGED LOGIC)
    const handleDownloadPayslip = async (payslip: PayslipMetadata) => {
        if (!employeeId) return;

        setViewLoading(true);
        setError(null);

        try {
            const url = `${API_BASE_URL}/api/payroll/payslip?month=${payslip.month}&year=${payslip.year}&employeeId=${employeeId}`;
            const response = await axios.get<PayslipData>(url);

            if (response.status === 200) {
                const payslipData = response.data;

                setCurrentPayslipData(payslipData);
                setIsModalOpen(true); 

                await new Promise(resolve => setTimeout(resolve, 50));

                if (payslipRef.current) {
                    
                    const canvas = await html2canvas(payslipRef.current, { 
                        scale: 2, 
                        logging: false,
                        useCORS: true 
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 1.0); 
                    
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth(); 
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width; 

                    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight); 
                    
                    pdf.save(`${payslip.monthName}_${payslip.year}_Payslip_${employeeId}.pdf`);

                    setIsModalOpen(false); 
                    setCurrentPayslipData(null);
                } else {
                    throw new Error("Payslip rendering failed for PDF generation. Try again.");
                }
                
            } else {
                setError(`Failed to fetch payslip data for download. Status: ${response.status}`);
            }
            
        } catch (err: any) {
             const errorMessage = err.response?.data || err.message;
             setError(`Failed to process download: ${errorMessage}`);
        } finally {
            setViewLoading(false);
        }
    };
    

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
                                        disabled={viewLoading} 
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
                        
                        {/* Payslip Content Area - APPLIED REF FOR PDF CAPTURE */}
                        <div className="p-0" ref={payslipRef}> 
                            <PayslipContent data={currentPayslipData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}