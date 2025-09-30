// ./src/app/admin/data-manager/finance/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftIcon,
  ChartPieIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  // Removed FunnelIcon 
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'; // Replaced lucide-react icons with Heroicons
import DataView, { ViewField } from '../components/DataView';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface FinanceReport {
  id: number;
  reportType: string;
  period: string;
  date: string;
  status: 'Draft' | 'Final' | 'Under Review' | 'Approved';
  amount: number;
  department: string;
  preparedBy: string;
}

const viewFields: ViewField[] = [
  { name: 'reportType', label: 'Report Type', type: 'text' },
  { name: 'period', label: 'Period', type: 'text' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'status' },
  { name: 'amount', label: 'Amount', type: 'currency' },
  { name: 'department', label: 'Department', type: 'text' },
  { name: 'preparedBy', label: 'Prepared By', type: 'text' }
];

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Removed unused state: const [showFilter, setShowFilter] = useState(false);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinanceReport | null>(null);
  const [data, setData] = useState<FinanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = APIURL +'/api/financereports';

  // --- Data Fetching (GET) ---
  const fetchReports = useCallback(async () => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to fetch finance reports: ${e.message}`); // More specific error message
      } else {
        setError('Failed to fetch finance reports: An unknown error occurred.');
      }
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  }, [API_URL]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExport = () => {
    if (data.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + "Report Type,Period,Date,Status,Amount,Department,Prepared By\n" // Ensure headers match viewFields
      + data.map(item => [
        `"${item.reportType}"`, // Enclose with quotes to handle commas in names
        `"${item.period}"`,    // Enclose with quotes
        new Date(item.date).toLocaleDateString(), // Format date for CSV
        item.status,
        item.amount.toFixed(2), // Format amount for CSV
        `"${item.department}"`, // Enclose with quotes
        `"${item.preparedBy}"`  // Enclose with quotes
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "finance_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data exported successfully!");
  };

  const handleView = (item: FinanceReport) => {
    setSelectedReport(item);
    setIsViewOpen(true);
  };

  const filteredData = data.filter(item =>
    (item.reportType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.period?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.status?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || // Added status to search
    (item.preparedBy?.toLowerCase() || '').includes(searchTerm.toLowerCase()) // Added preparedBy to search
  );

  return (
    <div className="min-h-screen bg-transparent">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-slate-800 dark:to-indigo-900 shadow-xl border-b border-blue-200 dark:border-indigo-700 rounded-2xl p-6 mb-8">
          <Link href="/admin/data-manager" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl shadow-lg">
                <ChartPieIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">Finance Reports </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and manage all financial reports</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{data.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Reports</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Main content card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg shadow-md">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-green-600">Report Records</span>
                <span className="ml-2 px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 text-sm font-semibold rounded-full">
                  {data.length}
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by report type, period, department, status, or prepared by..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {/* Filter button and dropdown intentionally removed here to fix linting errors */}
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading finance reports...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <div className="mt-6 rounded-b-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Report Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prepared By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No finance reports found.</td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.reportType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.period}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'Final' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            item.status === 'Draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                            item.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.preparedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(item)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isViewOpen && selectedReport && (
        <DataView
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedReport(null);
          }}
          data={selectedReport}
          fields={viewFields}
          title="Finance Report Details"
        />
      )}
    </div>
  );
}