// ./src/app/admin/data-manager/billing/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon, 
  ReceiptPercentIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import DataView, { ViewField } from '../components/DataView';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast' as it was unused

interface BillingItem {
  id: number;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

// Raw API response interface
interface RawBillingItem {
  id: number;
  invoiceNumber?: string;
  client?: string;
  amount?: string | number;
  dueDate?: string | number[];
  status?: 'paid' | 'pending' | 'overdue';
  type?: string;
}

// Type-safe wrapper for DataView
function BillingDataView({ isOpen, onClose, data, fields, title }: {
  isOpen: boolean;
  onClose: () => void;
  data: BillingItem;
  fields: ViewField[];
  title: string;
}) {
  const viewData = {
    ...data,
    id: data.id.toString(),
    amount: data.amount.toString(),
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
  { name: 'invoiceNumber', label: 'Invoice Number', type: 'text' },
  { name: 'clientName', label: 'Client', type: 'text' },
  { name: 'amount', label: 'Amount', type: 'currency' },
  { name: 'date', label: 'Due Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'status' },
  { name: 'description', label: 'Type', type: 'text' }
];

const API_BASE_URL = APIURL +'/api/billings';

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BillingItem | null>(null);
  const [data, setData] = useState<BillingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- API Functions ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const fetchedRawData: RawBillingItem[] = await response.json();
      
      const processedData: BillingItem[] = fetchedRawData.map(rawItem => {
        // Handle date conversion (similar to your bank documents)
        let formattedDate = '';
        if (Array.isArray(rawItem.dueDate)) {
          formattedDate = `${rawItem.dueDate[0]}-${String(rawItem.dueDate[1]).padStart(2, '0')}-${String(rawItem.dueDate[2]).padStart(2, '0')}`;
        } else if (rawItem.dueDate) {
          formattedDate = String(rawItem.dueDate);
        }

        return {
          id: rawItem.id,
          invoiceNumber: rawItem.invoiceNumber || `INV-${rawItem.id}`,
          clientName: rawItem.client || 'Unknown Client',
          amount: typeof rawItem.amount === 'string' ? parseFloat(rawItem.amount) || 0 : rawItem.amount || 0,
          date: formattedDate,
          status: rawItem.status || 'pending',
          description: rawItem.type || 'No description'
        };
      });
      
      setData(processedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // --- useEffect to fetch data on component mount ---
  useEffect(() => {
    fetchData();
  }, []);

  const handleView = (item: BillingItem) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };
  
  const filteredData = data.filter(item => {
    const matchesSearch =
      (item.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Invoice Number,Client,Amount,Due Date,Type,Status\n"
      + data.map(item => [
        item.invoiceNumber,
        item.clientName,
        item.amount,
        item.date,
        item.description,
        item.status
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "billing_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: BillingItem['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
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
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <ReceiptPercentIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Billing Management </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">Manage and track all company invoices and payments</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Invoices</div>
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
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-md">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-600">Invoice Records</span>
                <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-sm font-semibold rounded-full">
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
                placeholder="Search by invoice number, client, or type..."
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
                <div className="col-span-1">
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'paid' | 'pending' | 'overdue')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading billing data...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error}</div>
          ) : (
            <div className="mt-6 rounded-b-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No billing items found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.date ? new Date(item.date).toLocaleDateString() : 'No date'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-4"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
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

      {isViewOpen && selectedItem && (
        <BillingDataView
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedItem(null);
          }}
          data={selectedItem}
          fields={viewFields}
          title="Billing Details"
        />
      )}
    </div>
  );
}