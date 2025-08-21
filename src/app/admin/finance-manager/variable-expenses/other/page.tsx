'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface PettyCashEntry {
  id: number;
  item_name: string;
  paid_to: string;
  bill_no: string;
  amount: number;
  paymentMode: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CARD' | 'CHEQUE';
  documentpath?: string;
  payment_date: string;
  remarks: string;
}

export default function AdminPettyCashPage() {
  const [entries, setEntries] = useState<PettyCashEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch(APIURL + '/api/petty-cash');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        toast.error('Failed to fetch entries');
      }
    } catch (error) {
      toast.error('Error fetching entries');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading petty cash entries...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Toaster position="top-right" />
      
      <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-slate-800 dark:to-indigo-900 shadow-xl border-b border-blue-200 dark:border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/finance-manager/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Finance Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                <span className="text-2xl">💵</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Petty Cash </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View petty cash expenses and records</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{entries.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Entries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Entries</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{entries.length}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Average Amount</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {entries.length > 0 ? formatCurrency(totalAmount / entries.length) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
          <div className="px-8 py-6 border-b border-blue-200/50 dark:border-indigo-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-900/50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-lg">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Petty Cash Entries</span>
              <span className="ml-2 px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 text-pink-700 dark:text-pink-300 text-sm font-semibold rounded-full">
                {entries.length}
              </span>
            </h2>
          </div>
          
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">💵</span>
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No petty cash entries found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">No records available to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200/50 dark:divide-indigo-700/50">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-indigo-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paid To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bill No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-blue-200/30 dark:divide-indigo-700/30">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700/50 dark:hover:to-indigo-900/30 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{entry.item_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{entry.paid_to}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{entry.bill_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(entry.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.paymentMode === 'CASH' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          entry.paymentMode === 'UPI' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          entry.paymentMode === 'CARD' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          entry.paymentMode === 'BANK_TRANSFER' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {entry.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{entry.payment_date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">{entry.remarks || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {entry.documentpath ? (
                          <button
                            onClick={() => {
                              try {
                                const url = entry.documentpath;
                                window.open(url, '_blank');
                              } catch {
                                toast.error('Error opening document');
                              }
                            }}
                            className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 underline"
                          >
                            📄 View
                          </button>
                        ) : (
                          <span className="text-gray-400">No document</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}