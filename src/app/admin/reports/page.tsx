'use client';

import React, { useState, useEffect } from 'react';
import { 
    DocumentTextIcon,
    BuildingOffice2Icon,
    UsersIcon,
    MapPinIcon,
    BellIcon,
    CalendarDaysIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { EyeIcon, XIcon } from 'lucide-react';
import axios from 'axios';
import { APIURL } from '@/constants/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast';

interface Report {
    id: number;
    type: 'employee' | 'visit' | 'oem' | 'customer' | 'blueprint' | 'projection' | 'achievement' | 'Visit Inquiries' | 'BQ quotations';
    subtype?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'competitor_analysis' | 'orders' | 'open_tenders' | 'bugetary_submits' | 'lost_tenders' | 'holding_projects' | 'Quaterly' | 'half';
    title: string;
    date: string;
    status: 'draft' | 'submitted' | 'approved';
    content: string;
    attachments?: string[];
    submittedBy?: string;
    approvedBy?: string;
    approvedDate?: string;
    employeeId?: string;
    employeeName?: string;
    department?: string;
    customerName?: string;
    designation?: string;
    landlineOrMobile?: string;
    emailId?: string;
    remarks?: string;
    productOrRequirements?: string;
    division?: string;
    company?: string;
    slNo?: string;
    itemDescription?: string;
    competitor?: string;
    modelNumber?: string;
    unitPrice?: string;
    quotationNumber?: string;
    productDescription?: string;
    quantity?: string;
    xmwValue?: string;
    poNumber?: string;
    orderDate?: string;
    item?: string;
    partNumber?: string;
    xmwPrice?: string;
    unitTotalOrderValue?: string;
    totalPoValue?: string;
    xmwInvoiceRef?: string;
    xmwInvoiceDate?: string;
    organization?: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedSubtype, setSelectedSubtype] = useState<string>('all');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [divisionOptions, setDivisionOptions] = useState<string[]>([]);
    const [companyOptions, setCompanyOptions] = useState<string[]>([]);
    
    const [searchOption, setSearchOption] = useState("");
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    const reportTypes = [
        { id: 'employee', label: 'Employee Report', icon: <DocumentTextIcon className="w-5 h-5" /> },
        { id: 'visit', label: 'Visit Report', icon: <MapPinIcon className="w-5 h-5" /> },
        { id: 'oem', label: 'OEM Report', icon: <BuildingOffice2Icon className="w-5 h-5" /> },
        { id: 'customer', label: 'Customer Report', icon: <UsersIcon className="w-5 h-5" /> },
        { id: 'blueprint', label: 'Blueprint Report', icon: <DocumentTextIcon className="w-5 h-5" /> },
        { id: 'projection', label: 'Projection Report', icon: <BellIcon className="w-5 h-5" /> },
        { id: 'achievement', label: 'Achievement Report', icon: <CheckBadgeIcon className="w-5 h-5" /> },
        { id: 'Visit Inquiries', label: 'Visit Inquiries', icon: <CheckBadgeIcon className="w-5 h-5" /> },
        { id: 'BQ quotations', label: 'BQ quotations', icon: <CheckBadgeIcon className="w-5 h-5" /> }
    ];

    const employeeSubtypes = [
        { id: 'daily', label: 'Daily Report', icon: <CalendarDaysIcon className="w-5 h-5" /> },
        { id: 'weekly', label: 'Weekly Report', icon: <CalendarDaysIcon className="w-5 h-5" /> },
        { id: 'monthly', label: 'Monthly Report', icon: <CalendarDaysIcon className="w-5 h-5" /> },
        { id: 'Quaterly', label: 'Quarterly Report', icon: <CalendarDaysIcon className="w-5 h-5" /> },
        { id: 'half', label: 'Half-yearly Report', icon: <CalendarDaysIcon className="w-5 h-5" /> },
        { id: 'yearly', label: 'Yearly Report', icon: <CalendarDaysIcon className="w-5 h-5" /> }
    ];

    const getReportIcon = (type: string) => {
        const reportType = reportTypes.find(t => t.id === type);
        return reportType?.icon || <DocumentTextIcon className="w-5 h-5" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'submitted':
                return 'bg-yellow-100 text-yellow-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const departments = [
        'IT',
        'Sales',
        'Marketing',
        'HR',
        'Finance',
        'Operations'
    ];

    const statuses = [
        { id: 'all', label: 'All Status' },
        { id: 'draft', label: 'Draft' },
        { id: 'submitted', label: 'Submitted' },
        { id: 'approved', label: 'Approved' }
    ];

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(APIURL +'/api/reports');
                const mappedReports: Report[] = response.data.map((r: Report) => ({
                    id: r.id,
                    type: r.type,
                    subtype: r.subtype,
                    title: r.title,
                    date: r.date,
                    status: r.status,
                    content: r.content,
                    attachments: r.attachments ?? [],
                    submittedBy: r.submittedBy,
                    approvedBy: r.approvedBy,
                    approvedDate: r.approvedDate,
                    employeeId: r.employeeId,
                    employeeName: r.employeeName,
                    department: r.department,
                    customerName: r.customerName,
                    designation: r.designation,
                    landlineOrMobile: r.landlineOrMobile,
                    emailId: r.emailId,
                    remarks: r.remarks,
                    productOrRequirements: r.productOrRequirements,
                    division: r.division,
                    company: r.company,
                    slNo: r.slNo,
                    itemDescription: r.itemDescription,
                    competitor: r.competitor,
                    modelNumber: r.modelNumber,
                    unitPrice: r.unitPrice,
                    quotationNumber: r.quotationNumber,
                    productDescription: r.productDescription,
                    quantity: r.quantity,
                    xmwValue: r.xmwValue,
                    poNumber: r.poNumber,
                    orderDate: r.orderDate,
                    item: r.item,
                    partNumber: r.partNumber,
                    xmwPrice: r.xmwPrice,
                    unitTotalOrderValue: r.unitTotalOrderValue,
                    totalPoValue: r.totalPoValue,
                    xmwInvoiceRef: r.xmwInvoiceRef,
                    xmwInvoiceDate: r.xmwInvoiceDate
                }));
                setReports(mappedReports);
            } catch (err: Error | unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(`Failed to fetch reports: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    useEffect(() => {
        fetch(APIURL + '/api/reports/customer-divisions')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDivisionOptions(data);
                else if (data && Array.isArray(data.divisions)) setDivisionOptions(data.divisions);
            });
        fetch(APIURL + '/api/reports/customer-companies')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCompanyOptions(data);
                else if (data && Array.isArray(data.companies)) setCompanyOptions(data.companies);
            });
    }, []);

    const filteredReports = reports.filter(report => {
        const matchesType = selectedType === 'all' || report.type === selectedType;
        const matchesSubtype = selectedType !== 'employee' || selectedSubtype === 'all' || report.subtype === selectedSubtype;
        const matchesSearch = searchQuery === '' || 
            report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || report.department === selectedDepartment;
        const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
        const matchesDateRange = (!dateRange.start || new Date(report.date) >= new Date(dateRange.start)) &&
            (!dateRange.end || new Date(report.date) <= new Date(dateRange.end));

        return matchesType && matchesSubtype && matchesSearch && matchesDepartment && matchesStatus && matchesDateRange;
    });

    function exportOEMToCSV(oemReports: Report[], subtype: string) {
        if (!oemReports.length) return;
        const headers = oemHeaders[subtype as keyof typeof oemHeaders];
        const rows = oemReports.map(r => getOEMRow(r, subtype));
        const csvContent = [headers, ...rows].map(e => e.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `oem_${subtype}_reports.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportOEMToPDF(oemReports: Report[], subtype: string) {
        const doc = new jsPDF();
        const headers = oemHeaders[subtype as keyof typeof oemHeaders];
        const rows = oemReports.map(r => getOEMRow(r, subtype));
        autoTable(doc, { head: [headers], body: rows });
        doc.save(`oem_${subtype}_reports.pdf`);
    }

    function formatDate(date: string | string[] | undefined) {
        if (Array.isArray(date) && date.length === 3) {
            return `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
        }
        return date ?? '-';
    }

    const oemHeaders: Record<string, string[]> = {
        competitor_analysis: [
            'Sl. No.', 'Customer Name', 'Item Description', 'Competitor', 'Model Number', 'Unit Price', 'Date', 'Submitted By', 'Employee Name'
        ],
        orders: [
            'PO Number', 'Order Date', 'Item', 'Quantity', 'Part Number', 'XMW Price', 'Unit Total Order Value', 'Total PO Value', 'Customer Name', 'XMW Invoice Ref', 'XMW Invoice Date', 'Submitted By', 'Employee Name'
        ],
        open_tenders: [
            'Customer Name', 'Quotation Number', 'Product Description', 'Quantity', 'XMW Value', 'Remarks', 'Date', 'Submitted By', 'Employee Name'
        ],
        bugetary_submits: [
            'Customer Name', 'Quotation Number', 'Product Description', 'Quantity', 'XMW Value', 'Remarks', 'Date', 'Submitted By', 'Employee Name'
        ],
        lost_tenders: [
            'Customer Name', 'Quotation Number', 'Product Description', 'Quantity', 'XMW Value', 'Remarks', 'Date', 'Submitted By', 'Employee Name'
        ],
        holding_projects: [
            'Customer Name', 'Quotation Number', 'Product Description', 'Quantity', 'XMW Value', 'Remarks', 'Date', 'Submitted By', 'Employee Name'
        ]
    };

    function getOEMRow(report: Report, subtype: string) {
        switch (subtype) {
            case 'competitor_analysis':
                return [
                    report.slNo ?? '-',
                    report.customerName ?? '-',
                    report.itemDescription ?? '-',
                    report.competitor ?? '-',
                    report.modelNumber ?? '-',
                    report.unitPrice ?? '-',
                    formatDate(report.date),
                    report.submittedBy ?? '-',
                    report.employeeName ?? '-'
                ];
            case 'orders':
                return [
                    report.poNumber ?? '-',
                    formatDate(report.orderDate),
                    report.item ?? '-',
                    report.quantity ?? '-',
                    report.partNumber ?? '-',
                    report.xmwPrice ?? '-',
                    report.unitTotalOrderValue ?? '-',
                    report.totalPoValue ?? '-',
                    report.customerName ?? '-',
                    report.xmwInvoiceRef ?? '-',
                    formatDate(report.xmwInvoiceDate),
                    report.submittedBy ?? '-',
                    report.employeeName ?? '-'
                ];
            default:
                return [
                    report.customerName ?? '-',
                    report.quotationNumber ?? '-',
                    report.productDescription ?? '-',
                    report.quantity ?? '-',
                    report.xmwValue ?? '-',
                    report.remarks ?? '-',
                    formatDate(report.date),
                    report.submittedBy ?? '-',
                    report.employeeName ?? '-'
                ];
        }
    }

    const handleViewFile = async (reportId: number) => {
        toast.promise(
            axios.get(`${APIURL}/api/reports/${reportId}/view`, { responseType: 'blob' }),
            {
                loading: 'Preparing to open file...',
                success: (response) => {
                    const blob = new Blob([response.data], { type: response.data.type });
                    const fileURL = URL.createObjectURL(blob);
                    window.open(fileURL, '_blank');
                    return 'File is ready.';
                },
                error: 'Failed to open file. Please try again.',
            }
        );
    };

    return (
        <div className="min-h-screen bg-transparent">
            <Toaster />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/70 shadow-xl border-b border-blue-200 dark:border-indigo-700 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <DocumentTextIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Reports & Analytics </h1>
                                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and filter all company reports</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reports.length}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Total Reports</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="bg-white/70 rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search reports by title, content, employee name or ID..."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>

                            <select
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                {statuses.map(status => (
                                    <option key={status.id} value={status.id}>{status.label}</option>
                                ))}
                            </select>

                            <input
                                type="date"
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                placeholder="End Date"
                            />
                        </div>
                    </div>

                    <div className="bg-white/70 rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    setSelectedType('all');
                                    setSelectedSubtype('all');
                                }}
                                className={`px-3 py-1 rounded-lg ${
                                    selectedType === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                All Reports
                            </button>
                            {reportTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setSelectedType(type.id);
                                        setSelectedSubtype('all');
                                    }}
                                    className={`px-3 py-1 rounded-lg flex items-center space-x-2 ${
                                        selectedType === type.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {getReportIcon(type.id)}
                                    <span>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedType === 'employee' && (
                        <div className="bg-white/70 rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedSubtype('all')}
                                    className={`px-3 py-1 rounded-lg ${
                                        selectedSubtype === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    All Employee Reports
                                </button>
                                {employeeSubtypes.map(subtype => (
                                    <button
                                        key={subtype.id}
                                        onClick={() => setSelectedSubtype(subtype.id)}
                                        className={`px-3 py-1 rounded-lg flex items-center space-x-2 ${
                                            selectedSubtype === subtype.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {subtype.icon}
                                        <span>{subtype.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedType === 'oem' && (
                        <div className="bg-white/70 rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedSubtype('all')}
                                    className={`px-3 py-1 rounded-lg ${
                                        selectedSubtype === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    All OEM Reports
                                </button>
                                {['orders', 'competitor_analysis', 'open_tenders', 'bugetary_submits', 'lost_tenders', 'holding_projects'].map(subtype => (
                                    <button
                                        key={subtype}
                                        onClick={() => setSelectedSubtype(subtype)}
                                        className={`px-3 py-1 rounded-lg flex items-center space-x-2 ${
                                            selectedSubtype === subtype ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <DocumentTextIcon className="w-5 h-5" />
                                        <span>{subtype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredReports.some(r => r.type === 'customer') && (
                        <div className="bg-white/70 rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="mb-6 max-w-xs">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        id="modern-search"
                                        value={searchOption}
                                        onChange={e => setSearchOption(e.target.value)}
                                        onFocus={() => setShowSearchDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowSearchDropdown(false), 100)}
                                        placeholder=" "
                                        className="block w-full px-12 py-3 text-base bg-white border border-gray-200 rounded-2xl shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 peer"
                                        autoComplete="off"
                                    />
                                    <label htmlFor="modern-search" className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none transition-all duration-150 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 bg-white px-1">
                                        Search Department or Company
                                    </label>
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                                    </span>
                                    {searchOption && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchOption("")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none bg-white rounded-full p-1 shadow-sm"
                                            tabIndex={-1}
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    {showSearchDropdown && (
                                        <ul className="absolute z-20 w-full bg-white/70 border border-gray-200 rounded-2xl mt-2 shadow-xl animate-fadeIn overflow-hidden">
                                            {divisionOptions.filter(opt =>
                                                typeof opt === 'string' && opt.toLowerCase().includes(searchOption.toLowerCase())
                                            ).map(opt => (
                                                <li
                                                    key={"division-" + opt}
                                                    onMouseDown={() => {
                                                        setSearchOption(opt);
                                                        setShowSearchDropdown(false);
                                                    }}
                                                    className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 flex items-center gap-2"
                                                >
                                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                                                    <span className="text-xs text-blue-600 font-semibold">Division</span>
                                                    <span className="ml-2 text-gray-800">{opt}</span>
                                                </li>
                                            ))}
                                            {companyOptions.filter(opt =>
                                                typeof opt === 'string' && opt.toLowerCase().includes(searchOption.toLowerCase())
                                            ).map(opt => (
                                                <li
                                                    key={"company-" + opt}
                                                    onMouseDown={() => {
                                                        setSearchOption(opt);
                                                        setShowSearchDropdown(false);
                                                    }}
                                                    className="px-4 py-3 cursor-pointer hover:bg-green-50 border-b last:border-b-0 flex items-center gap-2"
                                                >
                                                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                                                    <span className="text-xs text-green-600 font-semibold">Company</span>
                                                    <span className="ml-2 text-gray-800">{opt}</span>
                                                </li>
                                            ))}
                                            {divisionOptions.filter(opt =>
                                                typeof opt === 'string' && opt.toLowerCase().includes(searchOption.toLowerCase())
                                            ).length === 0 && companyOptions.filter(opt =>
                                                typeof opt === 'string' && opt.toLowerCase().includes(searchOption.toLowerCase())
                                            ).length === 0 && (
                                                <li className="px-4 py-3 text-gray-400">No results found</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto mb-8">
                                <div className="flex justify-end mb-2 gap-2">
                                    <button
                                        onClick={() => {
                                            const customerReports = filteredReports.filter(r => r.type === 'customer' && (!searchOption || r.division === searchOption || r.company === searchOption));
                                            const headers = [
                                                'Visited Engineer', 'DATE', 'CUSTOMER NAME', 'DESIGNATION', 'LANDLINE / MOBILE', 'EMAIL ID', 'REMARKS', 'Organization', 'Division'
                                            ];
                                            const rows = customerReports.map(report => [
                                                report.employeeName || '-',
                                                new Date(report.date).toLocaleDateString(),
                                                report.customerName || '-',
                                                report.designation || '-',
                                                report.landlineOrMobile || '-',
                                                report.emailId || '-',
                                                report.remarks || '-',
                                                report.organization || '-',
                                                report.division || '-',
                                            ]);
                                            const csvContent = [headers, ...rows].map(e => e.map(x => `"${x}"`).join(",")).join("\n");
                                            const blob = new Blob([csvContent], { type: 'text/csv' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'customer_reports.csv';
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                                    >
                                        Export CSV
                                    </button>
                                    <button
                                        onClick={() => {
                                            const customerReports = filteredReports.filter(r => r.type === 'customer' && (!searchOption || r.division === searchOption || r.company === searchOption));
                                            const headers = [
                                                'Visited Engineer', 'DATE', 'CUSTOMER NAME', 'DESIGNATION', 'LANDLINE / MOBILE', 'EMAIL ID', 'REMARKS', 'Organization', 'Division'
                                            ];
                                            const rows = customerReports.map(report => [
                                                report.employeeName || '-',
                                                new Date(report.date).toLocaleDateString(),
                                                report.customerName || '-',
                                                report.designation || '-',
                                                report.landlineOrMobile || '-',
                                                report.emailId || '-',
                                                report.remarks || '-',
                                                report.organization || '-',
                                                report.division || '-',
                                            ]);
                                            const doc = new jsPDF();
                                            doc.text('Customer Reports', 14, 16);
                                            autoTable(doc, {
                                                head: [headers],
                                                body: rows,
                                                startY: 22,
                                                styles: { fontSize: 8 },
                                                headStyles: { fillColor: [41, 128, 185] },
                                                margin: { left: 10, right: 10 }
                                            });
                                            doc.save('customer_reports.pdf');
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                    >
                                        Download
                                    </button>
                                </div>
                                <table className="min-w-full border text-center">
                                    <thead className="bg-white/70">
                                        <tr>
                                            <th className="px-4 py-2 font-bold border">Visited Engineer</th>
                                            <th className="px-4 py-2 font-bold border">DATE</th>
                                            <th className="px-4 py-2 font-bold border">CUSTOMER NAME</th>
                                            <th className="px-4 py-2 font-bold border">DESIGNATION</th>
                                            <th className="px-4 py-2 font-bold border">LANDLINE / MOBILE</th>
                                            <th className="px-4 py-2 font-bold border">EMAIL ID</th>
                                            <th className="px-4 py-2 font-bold border">REMARKS</th>
                                            <th className="px-4 py-2 font-bold border">Organization</th>
                                            <th className="px-4 py-2 font-bold border">Division</th>
                                            <th className="px-4 py-2 font-bold border">View</th> 
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/70">
                                        {filteredReports.filter(r => r.type === 'customer' && (!searchOption || r.division === searchOption || r.company === searchOption)).map(report => (
                                            <tr key={report.id} className="border-b hover:bg-gray-50/70 transition-colors duration-200">
                                                <td className="px-4 py-2 border">{report.employeeName || '-'}</td>
                                                <td className="px-4 py-2 border">{new Date(report.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 border">{report.customerName || '-'}</td>
                                                <td className="px-4 py-2 border">{report.designation || '-'}</td>
                                                <td className="px-4 py-2 border">{report.landlineOrMobile || '-'}</td>
                                                <td className="px-4 py-2 border">{report.emailId || '-'}</td>
                                                <td className="px-4 py-2 border">{report.remarks || '-'}</td>
                                                <td className="px-4 py-2 border">{report.organization || '-'}</td>
                                                <td className="px-4 py-2 border">{report.division || '-'}</td>
                                                <td className="px-4 py-2 border">
                                                    {report.attachments && report.attachments.length > 0 && (
                                                        <button 
                                                            onClick={() => handleViewFile(report.id)} 
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                            title="View Report"
                                                        >
                                                            <EyeIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {selectedType === 'oem' && (
                        <div className="space-y-10">
                            {['orders', 'competitor_analysis', 'open_tenders', 'bugetary_submits', 'lost_tenders', 'holding_projects'].map(subtype => (
                                <div key={subtype}>
                                    <h2 className="text-lg font-bold mb-4">
                                        OEM - {oemHeaders[subtype as keyof typeof oemHeaders] ? subtype.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : subtype}
                                    </h2>
                                    <div className="flex justify-end gap-2 mb-2">
                                        <button
                                            onClick={() => exportOEMToCSV(filteredReports.filter(r => r.type === 'oem' && r.subtype === subtype), subtype)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            onClick={() => exportOEMToPDF(filteredReports.filter(r => r.type === 'oem' && r.subtype === subtype), subtype)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto rounded-2xl shadow border border-gray-200 bg-white/70">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-white/70">
                                                <tr>
                                                    {oemHeaders[subtype as keyof typeof oemHeaders].map((h, idx) => (
                                                        <th key={h} className={`px-4 py-2 min-w-[120px] text-xs font-bold text-gray-700 uppercase tracking-wider text-left align-middle border-r border-gray-200 ${idx === oemHeaders[subtype as keyof typeof oemHeaders].length - 1 ? 'last:border-r-0' : ''}`}>{h}</th>
                                                    ))}
                                                    <th className="px-4 py-2 min-w-[80px] text-xs font-bold text-gray-700 uppercase tracking-wider text-center align-middle">View</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white/70 divide-y divide-gray-100">
                                                {filteredReports.filter(r => r.type === 'oem' && r.subtype === subtype).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={oemHeaders[subtype as keyof typeof oemHeaders].length + 1} className="px-4 py-2 text-center text-gray-400 align-middle">No reports found</td>
                                                    </tr>
                                                ) : (
                                                    filteredReports.filter(r => r.type === 'oem' && r.subtype === subtype).map((report, rowIdx) => (
                                                        <tr key={report.id} className={`${rowIdx % 2 === 1 ? 'even:bg-gray-50/70' : ''} hover:bg-gray-100/70 transition-colors duration-200`}> 
                                                            {getOEMRow(report, subtype).map((cell, i) => (
                                                                <td key={i} className={`px-4 py-2 min-w-[120px] align-middle border-r border-gray-200 ${typeof cell === 'number' || (typeof cell === 'string' && /\d{4}-\d{2}-\d{2}/.test(cell)) ? 'text-center' : 'text-left'}`}>{cell}</td>
                                                            ))}
                                                            <td className="px-4 py-2 min-w-[80px] align-middle text-center">
                                                                {report.attachments && report.attachments.length > 0 && (
                                                                    <button 
                                                                        onClick={() => handleViewFile(report.id)} 
                                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                                        title="View Report"
                                                                    >
                                                                        <EyeIcon className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading...</p>
                            </div>
                        ) : (
                            filteredReports.filter(r => r.type !== 'customer' && r.type !== 'oem').length === 0 ? (
                                <div className="text-center py-4 text-gray-500">No reports found for the selected filters.</div>
                            ) : (
                                filteredReports.filter(r => r.type !== 'customer' && r.type !== 'oem').map(report => (
                                    <div key={report.id} className="border rounded-lg p-4 bg-white/70 hover:bg-gray-50/70 transition-colors duration-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    {getReportIcon(report.type)}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                                                    <div className="mt-1 text-sm text-gray-600">
                                                        <p>Type: {reportTypes.find(t => t.id === report.type)?.label}</p>
                                                        {report.type === 'employee' && report.subtype && (
                                                            <p>Subtype: {employeeSubtypes.find(s => s.id === report.subtype)?.label}</p>
                                                        )}
                                                        <p>Date: {new Date(report.date).toLocaleDateString()}</p>
                                                        <p>Employee: {report.employeeName} ({report.employeeId})</p>
                                                        <p>Department: {report.department}</p>
                                                        <p>Submitted by: {report.submittedBy}</p>
                                                        {report.approvedBy && (
                                                            <p>Approved by: {report.approvedBy} on {new Date(report.approvedDate!).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                                {report.attachments && report.attachments.length > 0 && (
                                                    <button 
                                                        onClick={() => handleViewFile(report.id)} 
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                                        title="View Report"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 text-sm text-gray-600">
                                            <p>{report.content}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}