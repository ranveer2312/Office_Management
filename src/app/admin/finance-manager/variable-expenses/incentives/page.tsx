'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface IncentiveExpense {
    id: number;
    fixedTarget: number;
    achieved: number;
    recipient: string;
    date: number[];
    pending: number;
    payment: number;
    remarks: string;
    documentPath?: string;
    payment_mode: string;
}

export default function AdminIncentivesPage() {
    const [expenses, setExpenses] = useState<IncentiveExpense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch(APIURL + '/api/incentives/incentive');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setExpenses(Array.isArray(data.items) ? data.items : []);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch incentive expenses');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateValue: number[] | string) => {
        if (Array.isArray(dateValue) && dateValue.length === 3) {
            const [year, month, day] = dateValue;
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString();
        }
        return 'N/A';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading incentive expenses...</div>
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
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Employee Incentives</h1>
                                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View employee incentive and bonus records</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-center md:text-right">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{expenses.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Records</div>
                        </div>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="mt-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-blue-200/50 dark:border-indigo-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-900/50 rounded-t-2xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                                <DocumentTextIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Employee Incentives</span>
                            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full hidden sm:inline-block">
                                {expenses.length}
                            </span>
                        </h2>
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-blue-200/50 dark:divide-indigo-700/50">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Recipient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fixed Target</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Achieved</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pending</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Mode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-blue-200/30 dark:divide-indigo-700/30">
                                {expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700/50 dark:hover:to-indigo-900/30 transition-all duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{expense.recipient}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">₹{new Intl.NumberFormat('en-IN').format(expense.fixedTarget)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">₹{new Intl.NumberFormat('en-IN').format(expense.achieved)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">₹{new Intl.NumberFormat('en-IN').format(expense.payment)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">₹{new Intl.NumberFormat('en-IN').format(expense.pending)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.payment_mode.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {formatDate(expense.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.remarks}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {expense.documentPath ? (
                                                    <button
                                                        onClick={() => {
                                                            try {
                                                                if (!expense.documentPath) {
                                                                    toast.error('No document path found');
                                                                    return;
                                                                }
                                                                if (expense.documentPath.startsWith('http')) {
                                                                    window.open(expense.documentPath, '_blank');
                                                                } else {
                                                                    const filename = expense.documentPath.includes('/') ? expense.documentPath.split('/').pop() : expense.documentPath;
                                                                    if (!filename) {
                                                                        toast.error('Invalid document path');
                                                                        return;
                                                                    }
                                                                    const url = `${APIURL}/files/${encodeURIComponent(filename)}`;
                                                                    window.open(url, '_blank');
                                                                }
                                                            } catch {
                                                                toast.error('Error opening document');
                                                            }
                                                        }}
                                                        className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 underline"
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
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                <span className="text-6xl mb-4 block">🎯</span>
                                                <p className="text-lg font-medium">No incentive expenses found</p>
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
                                        <h3 className="text-lg font-semibold text-gray-900">{expense.recipient}</h3>
                                        <span className="font-semibold text-green-600">₹{new Intl.NumberFormat('en-IN').format(expense.payment)}</span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium">Target:</span> ₹{new Intl.NumberFormat('en-IN').format(expense.fixedTarget)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Achieved:</span> ₹{new Intl.NumberFormat('en-IN').format(expense.achieved)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Pending:</span> ₹{new Intl.NumberFormat('en-IN').format(expense.pending)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Date:</span> {formatDate(expense.date)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Remarks:</span> {expense.remarks}
                                        </p>
                                    </div>
                                    <div className="mt-3">
                                        {expense.documentPath ? (
                                            <button
                                                onClick={() => {
                                                    try {
                                                        if (!expense.documentPath) {
                                                            toast.error('No document path found');
                                                            return;
                                                        }
                                                        if (expense.documentPath.startsWith('http')) {
                                                            window.open(expense.documentPath, '_blank');
                                                        } else {
                                                            const filename = expense.documentPath.includes('/') ? expense.documentPath.split('/').pop() : expense.documentPath;
                                                            if (!filename) {
                                                                toast.error('Invalid document path');
                                                                return;
                                                            }
                                                            const url = `${APIURL}/files/${encodeURIComponent(filename)}`;
                                                            window.open(url, '_blank');
                                                        }
                                                    } catch {
                                                        toast.error('Error opening document');
                                                    }
                                                }}
                                                className="inline-flex items-center text-emerald-600 hover:text-emerald-800 underline text-sm"
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
                                <span className="text-6xl mb-4 block">🎯</span>
                                <p className="text-lg font-medium text-gray-500">No incentive expenses found</p>
                                <p className="text-sm text-gray-500">No records available to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
