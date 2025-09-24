'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeftIcon, 
  BuildingOffice2Icon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'; // Replaced lucide-react icons with Heroicons
import DataView, { ViewField } from '../components/DataView';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface CompanyRegistration {
  id: number;
  companyName: string;
  registrationNumber: string;
  type: string;
  date: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
}

const viewFields: ViewField[] = [
  { name: 'companyName', label: 'Company Name', type: 'text' },
  { name: 'registrationNumber', label: 'Registration Number', type: 'text' },
  { name: 'type', label: 'Company Type', type: 'text' },
  { name: 'date', label: 'Registration Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'status' }
];

export default function CompanyRegistrationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | CompanyRegistration['status']>('all');

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<CompanyRegistration | null>(null);
  const [data, setData] = useState<CompanyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = APIURL +`/api/companyregistrations`;

  // --- Data Fetching (GET) ---
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: CompanyRegistration[] = await response.json();
      const processedResult = result.map(item => ({
        id: item.id,
        companyName: item.companyName ?? '',
        registrationNumber: item.registrationNumber ?? '',
        type: item.type ?? '',
        date: item.date ?? '',
        status: item.status ?? 'Pending'
      }));
      setData(processedResult);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to fetch company registrations: ${e.message}. Please check the server connection.`);
      } else {
        setError('Failed to fetch company registrations: An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleExport = () => {
    if (data.length === 0) {
      toast.error("No data to export.");
      return;
    }
    const escapeCsvField = (field: string | number) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Company Name,Registration Number,Type,Date,Status\n"
      + data.map(item => [
        escapeCsvField(item.companyName),
        escapeCsvField(item.registrationNumber),
        escapeCsvField(item.type),
        new Date(item.date).toLocaleDateString(),
        escapeCsvField(item.status)
      ].join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "company_registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data exported successfully!");
  };

  const handleView = (item: CompanyRegistration) => {
    setSelectedRegistration(item);
    setIsViewOpen(true);
  };

  const filteredData = data.filter(item =>
    (item.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.registrationNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ).filter(item =>
    selectedStatusFilter === 'all' || item.status === selectedStatusFilter
  );

  const getStatusColor = (status: CompanyRegistration['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <BuildingOffice2Icon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Company Registrations </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and manage all company registration records</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Records</div>
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
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Registration Records</span>
                <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-sm font-semibold rounded-full">
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
                placeholder="Search by company name, registration number, or type..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </button>
              {showFilter && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedStatusFilter('all');
                        setShowFilter(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${selectedStatusFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    >
                      All Statuses
                    </button>
                    {(['Active', 'Inactive', 'Pending', 'Suspended'] as CompanyRegistration['status'][]).map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatusFilter(status);
                          setShowFilter(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${selectedStatusFilter === status ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading company registrations...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <div className="mt-6 rounded-b-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registration Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No company registrations found matching your criteria.</td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.registrationNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
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

      {isViewOpen && selectedRegistration && (
        <DataView
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedRegistration(null);
          }}
          data={selectedRegistration}
          fields={viewFields}
          title="Company Registration Details"
        />
      )}
    </div>
  );
}