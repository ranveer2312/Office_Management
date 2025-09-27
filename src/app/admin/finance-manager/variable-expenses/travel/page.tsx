'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface TravelExpense {
    id: number;
    vendor: string;
    fromDate: number[] | string;
    toDate: number[] | string;
    noOfDays: number;
    advancePay: number;
    paymentMode: string;
    paymentDate: number[] | string;
    remarks: string;
    documentPath?: string;
}

export default function AdminTravelPage() {
    const [expenses, setExpenses] = useState<TravelExpense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch(APIURL + '/api/travel');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch travel expenses');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateValue: number[] | string) => {
        if (!dateValue) return 'N/A';
        if (Array.isArray(dateValue) && dateValue.length === 3) {
            const [year, month, day] = dateValue;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return String(dateValue);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading travel expenses...</div>
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
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                <span className="text-2xl">✈️</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Travel Expenses</h1>
                                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View business travel expenses and records</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 text-center md:text-right">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{expenses.length}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Records</div>
                        </div>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="mt-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-blue-200/50 dark:border-indigo-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-900/50 rounded-t-2xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                                <DocumentTextIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Travel Expenses</span>
                            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full hidden sm:inline-block">
                                {expenses.length}
                            </span>
                        </h2>
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-blue-200/50 dark:divide-indigo-700/50">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Advance Pay</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Mode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-blue-200/30 dark:divide-indigo-700/30">
                                {expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700/50 dark:hover:to-indigo-900/30 transition-all duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{expense.vendor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(expense.fromDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(expense.toDate)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.noOfDays}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">₹{new Intl.NumberFormat('en-IN').format(expense.advancePay)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.paymentMode.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{formatDate(expense.paymentDate)}</td>
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
                                                                
                                                                let url;
                                                                if (expense.documentPath.startsWith('http')) {
                                                                    url = expense.documentPath;
                                                                } else {
                                                                    const filename = expense.documentPath.includes('/') ? expense.documentPath.split('/').pop() : expense.documentPath;
                                                                    if (!filename) {
                                                                        toast.error('Invalid document path');
                                                                        return;
                                                                    }
                                                                    url = `${APIURL}/files/${encodeURIComponent(filename)}`;
                                                                }

                                                                window.open(url, '_blank');
                                                            } catch {
                                                                toast.error('Error opening document');
                                                            }
                                                        }}
                                                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 underline"
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
                                                <span className="text-6xl mb-4 block">✈️</span>
                                                <p className="text-lg font-medium">No travel expenses found</p>
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
                                        <h3 className="text-lg font-semibold text-gray-900">{expense.vendor}</h3>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {expense.paymentMode}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium">Dates:</span> {formatDate(expense.fromDate)} to {formatDate(expense.toDate)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Days:</span> {expense.noOfDays}
                                        </p>
                                        <p>
                                            <span className="font-medium">Advance Pay:</span> <span className="font-semibold text-green-600">₹{new Intl.NumberFormat('en-IN').format(expense.advancePay)}</span>
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
                                                        
                                                        let url;
                                                        if (expense.documentPath.startsWith('http')) {
                                                            url = expense.documentPath;
                                                        } else {
                                                            const filename = expense.documentPath.includes('/') ? expense.documentPath.split('/').pop() : expense.documentPath;
                                                            if (!filename) {
                                                                toast.error('Invalid document path');
                                                                return;
                                                            }
                                                            url = `${APIURL}/files/${encodeURIComponent(filename)}`;
                                                        }

                                                        window.open(url, '_blank');
                                                    } catch {
                                                        toast.error('Error opening document');
                                                    }
                                                }}
                                                className="inline-flex items-center text-purple-600 hover:text-purple-800 underline text-sm"
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
                                <span className="text-6xl mb-4 block">✈️</span>
                                <p className="text-lg font-medium text-gray-500">No travel expenses found</p>
                                <p className="text-sm text-gray-500">No records available to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
