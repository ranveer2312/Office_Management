'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, DevicePhoneMobileIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

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
      const res = await fetch(APIURL + '/api/sim-bills');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
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
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading SIM bills...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Toaster position="top-right" />
      
      <div className="bg-slate-50 dark:bg-slate-800 shadow-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/finance-manager/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Finance Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-500 rounded-2xl shadow-xl">
                <DevicePhoneMobileIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">SIM Bills </h1>
                <p className="text-base text-slate-600 dark:text-slate-300 mt-1">View SIM card expenses and records</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">{expenses.length}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Bills</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl">
            <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <span>SIM Bills</span>
              <span className="ml-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-full">
                {expenses.length}
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Document</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-300">{expense.accountNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">{formatDate(expense.paymentDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {expense.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">{expense.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-700 dark:text-indigo-300">₹{expense.payment.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-300">
                      {expense.documentPath ? (
                        <button
                          onClick={() => {
                            try {
                              const url = expense.documentPath?.startsWith('/') 
                                ? `${APIURL}${expense.documentPath}` 
                                : `${APIURL}/uploads/${expense.documentPath}`;
                              window.open(url, '_blank');
                            } catch {
                              toast.error('Error opening document');
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                          📄 View
                        </button>
                      ) : (
                        <span className="text-slate-400">No document</span>
                      )}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-slate-500 dark:text-slate-400">
                        <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-lg font-medium">No SIM bills found</p>
                        <p className="text-sm">No records available to display.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}