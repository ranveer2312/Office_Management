'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowDownTrayIcon, // Corrected from DownloadIcon
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import DataView, { ViewField } from '../components/DataView';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast' as it was unused

interface BankDocument {
  id: number;
  documentType: string;
  bankName: string;
  accountNumber: string;
  date: string;
  status: 'Valid' | 'Expired' | 'Pending';
}

function BankDataView({ isOpen, onClose, data, fields, title }: {
  isOpen: boolean;
  onClose: () => void;
  data: BankDocument;
  fields: ViewField[];
  title: string;
}) {
  const viewData = {
    ...data,
    id: data.id.toString(),
    status: data.status
  };

  return (
    <DataView
      isOpen={isOpen}
      onClose={onClose}
      data={viewData}
      fields={fields}
      title={title}
    />
  );
}

const viewFields: ViewField[] = [
  { name: 'documentType', label: 'Document Type', type: 'text' },
  { name: 'bankName', label: 'Bank Name', type: 'text' },
  { name: 'accountNumber', label: 'Account Number', type: 'text' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'status' }
];

export default function BankDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BankDocument | null>(null);
  const [data, setData] = useState<BankDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = APIURL +'/api/bankdocuments';

  const fetchBankDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const mapped = result.map((item: BankDocument) => ({
        ...item,
        date: Array.isArray(item.date)
          ? `${item.date[0]}-${String(item.date[1]).padStart(2, '0')}-${String(item.date[2]).padStart(2, '0')}`
          : item.date
      }));
      setData(mapped);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to fetch documents: ${e.message}`);
      } else {
        setError('Failed to fetch documents: Unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchBankDocuments();
  }, [fetchBankDocuments]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Document Type,Bank Name,Account Number,Date,Status\n"
      + data.map(item => [
        item.documentType,
        item.bankName,
        item.accountNumber,
        item.date,
        item.status
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bank_documents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (item: BankDocument) => {
    setSelectedDocument(item);
    setIsViewOpen(true);
  };

  const filteredData = data.filter(item =>
    (item.documentType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.bankName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (item.accountNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <CreditCardIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Bank Documents </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and manage all bank-related documents</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Documents</div>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg shadow-md">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">Document Records</span>
                <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 text-sm font-semibold rounded-full">
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
                placeholder="Search by document type, bank name, or account number..."
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
            </div>
          </div>

          {showFilter && (
            <div className="px-8 py-4 bg-white dark:bg-gray-800 rounded-b-2xl shadow-inner">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                  <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                    <option>All</option>
                    <option>Valid</option>
                    <option>Pending</option>
                    <option>Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Document Type</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                    <option>All</option>
                    <option>Bank Statement</option>
                    <option>Bank Guarantee</option>
                    <option>Bank Certificate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading bank documents...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <div className="mt-6 rounded-b-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bank Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No bank documents found.</td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.documentType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.bankName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.accountNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'Valid' ? 'bg-green-100 text-green-800' :
                            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
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

      {isViewOpen && selectedDocument && (
        <BankDataView
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedDocument(null);
          }}
          data={selectedDocument}
          fields={viewFields}
          title="Bank Document Details"
        />
      )}
    </div>
  );
}