'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, DevicePhoneMobileIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// NOTE: Removed 'const APIURL = 'http://localhost:8080';' 
// to fix the '@typescript-eslint/no-unused-vars' error.

interface SimBillExpense {
    id: number;
    accountNo: string;
    paymentDate: string;
    paymentMode: string;
    month: string;
    payment: number;
    remarks: string;
    documentPath?: string;
    date: string;
}

export default function AdminSimBillsPage() {
    const [expenses, setExpenses] = useState<SimBillExpense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            // Simulate a network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock data with a documentPath to demonstrate functionality
            const mockData = [
                {
                    "id": 2,
                    "accountNo": "7500002",
                    "paymentDate": "2025-09-17",
                    "paymentMode": "CASH",
                    "month": "2025-12",
                    "payment": 16233.00,
                    "remarks": "ac",
                    "documentPath": "https://res.cloudinary.com/dzdrgwidx/image/upload/v1758522035/salary-reimbursements/qqeyxjdxky0itnbzhpvc.pdf",
                    "date": "2025-09-17"
                }
            ];
            
            setExpenses(mockData);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch SIM bills');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: unknown) => {
        if (!dateString) return 'N/A';
        const dateStr = String(dateString).trim();
        if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return 'N/A';
        
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateStr.split('-');
            return `${month}/${day}/${year}`;
        }
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading SIM bills...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <Toaster position="top-right" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-slate-800 dark:to-indigo-900 shadow-xl border-b border-blue-200 dark:border-indigo-700 rounded-2xl p-6">
                    <Link href="/admin/finance-manager/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back to Finance Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <DevicePhoneMobileIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SIM Bills</h1>
                                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View SIM card expenses and records</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-center md:text-right">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{expenses.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Bills</div>
                        </div>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="mt-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-blue-200/50 dark:border-indigo-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-900/50 rounded-t-2xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                                <DocumentTextIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SIM Bills</span>
                            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full hidden sm:inline-block">
                                {expenses.length}
                            </span>
                        </h2>
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-blue-200/50 dark:divide-indigo-700/50">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-blue-200/30 dark:divide-indigo-700/30">
                                {expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700/50 dark:hover:to-indigo-900/30 transition-all duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{expense.accountNo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(expense.paymentDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(expense.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {expense.paymentMode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.month}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">₹{expense.payment.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {expense.documentPath ? (
                                                    <button
                                                        onClick={() => {
                                                            window.open(expense.documentPath, '_blank');
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                                    >
                                                        📄 View
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">No document</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-lg font-medium">No SIM bills found</p>
                                                <p className="text-sm">No records available to display.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden p-4 space-y-4">
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <div key={expense.id} className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Account: {expense.accountNo}</h3>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {expense.paymentMode}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium">Payment Date:</span> {formatDate(expense.paymentDate)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Month:</span> {expense.month}
                                        </p>
                                        <p>
                                            <span className="font-medium">Amount:</span> <span className="font-semibold text-green-600">₹{expense.payment.toFixed(2)}</span>
                                        </p>
                                    </div>
                                    <div className="mt-3">
                                        {expense.documentPath ? (
                                            <button
                                                onClick={() => {
                                                    window.open(expense.documentPath, '_blank');
                                                }}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 underline text-sm"
                                            >
                                                📄 View Document
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No document</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-500">No SIM bills found</p>
                                <p className="text-sm text-gray-500">No records available to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}