'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CubeIcon, DocumentTextIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast' as it was unused

interface Material {
  id: number;
  name: string;
  partNumber: string;
  returnDate?: string;
  quantity: number;
  type: 'in' | 'out';
  collectDate?: string;
  personName: string;
  department: string;
  remarks: string;
}

const API_BASE_URL = APIURL + '/api/materials';

export default function AdminMaterialsInOutPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch materials');
        const data = await response.json();
        setMaterials(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch materials');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-slate-800 dark:to-indigo-900 shadow-xl border-b border-blue-200 dark:border-indigo-700 rounded-2xl p-6 mb-8">
          <Link href="/admin/store" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                <CubeIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Materials In/Out </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-1">View all material movements and records</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{materials.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Entries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-md">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
                Material Entries
              </span>
              <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-sm font-semibold rounded-full">
                {materials.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400 text-center py-4">{error}</div>
          ) : materials.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-12">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No material entries found</p>
              <p className="text-sm">No records available to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S/N</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Part Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collect Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Return Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Person Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {materials.map((mat, idx) => (
                    <tr key={mat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.partNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          mat.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {mat.type === 'in' ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                          {mat.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.collectDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.returnDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.personName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{mat.remarks}</td>
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