'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, UsersIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

// The API URL is defined for fetching data.
const APIURL = 'http://localhost:8080';

interface SalaryExpense {
    id: number;
    empName: string;
    empId: string;
    reimbursement: string;
    amount: number;
    date: string;
    remarks: string;
    documentPath?: string;
}

export default function AdminSalariesPage() {
    const [expenses, setExpenses] = useState<SalaryExpense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch(`${APIURL}/api/salaries`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setExpenses(Array.isArray(data.content) ? data.content : []);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch salary records');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    // FIX: Removed the unused formatDate function definition
    /*
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
    */

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading salary records...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <Toaster position="top-right" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-slate-800 dark:to-indigo-900 shadow-xl border-b border-blue-200 dark:border-indigo-700 rounded-2xl p-6">
                    <Link href="/admin/finance-manager/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 dark:text-gray-400 dark:hover:text-gray-200">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back to Finance Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                <UsersIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Employee Salaries</h1>
                                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View salary and reimbursement records</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-center md:text-right">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{expenses.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Records</div>
                        </div>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="mt-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-blue-200/50 dark:border-indigo-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-900/50 rounded-t-2xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                                <DocumentTextIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Salary Records</span>
                            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full hidden sm:inline-block">
                                {expenses.length}
                            </span>
                        </h2>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-blue-200/50 dark:divide-indigo-700/50">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reimbursement</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-blue-200/30 dark:divide-indigo-700/30">
                                {expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700/50 dark:hover:to-indigo-900/30 transition-all duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{expense.empName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.empId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.reimbursement}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">₹{new Intl.NumberFormat('en-IN').format(expense.amount || 0)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{new Date(expense.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.remarks}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {expense.documentPath ? (
                                                    <button
                                                        onClick={() => {
                                                            window.open(expense.documentPath, '_blank');
                                                        }}
                                                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 underline"
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
                                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-lg font-medium">No salary records found</p>
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
                                        <h3 className="text-lg font-semibold text-gray-900">{expense.empName}</h3>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {expense.reimbursement}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium">Employee ID:</span> {expense.empId}
                                        </p>
                                        <p>
                                            <span className="font-medium">Date:</span> {new Date(expense.date).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <span className="font-medium">Amount:</span> <span className="font-semibold text-green-600">₹{new Intl.NumberFormat('en-IN').format(expense.amount || 0)}</span>
                                        </p>
                                        <p>
                                            <span className="font-medium">Remarks:</span> {expense.remarks}
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
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-500">No salary records found</p>
                                <p className="text-sm text-gray-500">No records available to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}