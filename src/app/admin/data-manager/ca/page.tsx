// ./src/app/admin/data-manager/ca/page.tsx

'use client';

import { useState, useEffect } from 'react'; // FIX: Removed 'useCallback'
import { 
  ArrowLeftIcon, 
  CalculatorIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import DataView, { ViewField } from '../components/DataView';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface CADocument {
  id: number;
  documentNumber: string;
  client: string;
  amount: number;
  date: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
}

// Raw API response interface (useful if your API sends optional/nullable fields)
interface RawCADocument {
  id: number;
  documentNumber?: string | null;
  client?: string | null;
  amount?: string | number | null;
  date?: string | null;
  description?: string | null;
  status?: 'active' | 'inactive' | 'pending' | null;
}

// Type-safe wrapper for DataView (looks good, ensuring data conforms to ViewField expectations)
function CADataView({ isOpen, onClose, data, fields, title }: {
  isOpen: boolean;
  onClose: () => void;
  data: CADocument;
  fields: ViewField[];
  title: string;
}) {
  const viewData = {
    ...data,
    // Ensure numbers/statuses are stringified if DataView expects string for type 'text' or 'status'
    id: data.id.toString(),
    amount: data.amount.toFixed(2), // Format amount for consistent display in DataView
    status: data.status, // DataView should handle the 'status' type directly
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
  { name: 'documentNumber', label: 'Document Number', type: 'text' },
  { name: 'client', label: 'Client', type: 'text' },
  { name: 'amount', label: 'Amount', type: 'currency' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'description', label: 'Description', type: 'text' },
  { name: 'status', label: 'Status', type: 'status' }
];

const API_BASE_URL =APIURL + `/api/cadocuments`;

export default function CAPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CADocument | null>(null);
  const [data, setData] = useState<CADocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedRawData: RawCADocument[] = await response.json();

      // Process raw data to ensure types and provide default values
      const processedData: CADocument[] = fetchedRawData.map(rawItem => ({
        id: rawItem.id,
        documentNumber: rawItem.documentNumber ?? '', // Use nullish coalescing for cleaner defaults
        client: rawItem.client ?? '',
        amount: parseFloat(String(rawItem.amount ?? 0)) || 0, // Ensure amount is a number
        date: rawItem.date ?? '',
        description: rawItem.description ?? '',
        status: rawItem.status ?? 'pending' // Default status if not provided
      }));

      setData(processedData);
    } catch (err) {
      // Provide more specific error messages for debugging
      if (err instanceof Error) {
        setError(`Failed to fetch CA documents: ${err.message}. Please check the server.`);
      } else {
        setError('Failed to fetch CA documents: An unknown error occurred.');
      }
    } finally {
      setIsLoading(false); // Always stop loading, regardless of success or failure
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleView = (item: CADocument) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  // Filter data based on search term and selected status
  const filteredData = data.filter(item => {
    const matchesSearch =
      item.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (data.length === 0) {
      toast.error("No data to export.");
      return;
    }

    // Helper to properly quote CSV fields
    const escapeCsvField = (field: string | number) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`; // Escape internal quotes and wrap
      }
      return stringField;
    };

    const csvContent = "data:text/csv;charset=utf-8,"
      + "Document Number,Client,Amount,Date,Description,Status\n"
      + data.map(item => [
        escapeCsvField(item.documentNumber),
        escapeCsvField(item.client),
        item.amount.toFixed(2), // Format amount as currency string
        new Date(item.date).toLocaleDateString(), // Format date for readability
        escapeCsvField(item.description),
        escapeCsvField(item.status)
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ca_documents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data exported successfully!");
  };

  const getStatusColor = (status: CADocument['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'; // Fallback
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
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <CalculatorIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">CA Documents Management </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and manage all chartered accountant records</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Documents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Document Records</span>
                <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-semibold rounded-full">
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
                placeholder="Search by document number, client, or description..."
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
                    onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive' | 'pending')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading CA documents...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error}</div>
          ) : (
            <div className="mt-6 rounded-b-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Document Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
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
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.documentNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {`$${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(item.date).toLocaleDateString()}
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
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No CA documents found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isViewOpen && selectedItem && (
        <CADataView
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          data={selectedItem}
          fields={viewFields}
          title="CA Document Details"
        />
      )}
    </div>
  );
}