'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircleIcon, TrashIcon, PencilSquareIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface SalaryReimbursement {
  id: number;
  empName: string;
  empId: string;
  reimbursement: string;
  amount: number;
  date: string;
  remarks: string;
  documentPath?: string;
}

export default function SalariesPage() {
  const [expenses, setExpenses] = useState<SalaryReimbursement[]>([]);
  const [newExpense, setNewExpense] = useState({
    empName: '',
    empId: '',
    reimbursement: '',
    amount: '',
    date: '',
    remarks: '',
    documentPath: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fixed API_URL - removed dependency on APIURL in useCallback by declaring it outside.
  const API_URL = `${APIURL}/api/salaries`;

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}?page=${currentPage}&size=10`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setExpenses(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch reimbursements');
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, API_URL]); // Added API_URL to dependency array.

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'File upload failed');
      }

      const data = await res.json();
      setNewExpense(prev => ({ ...prev, documentPath: data.documentUrl }));
      return data.documentUrl;
    } catch (err) {
      console.error('File upload error:', err);
      toast.error('Failed to upload document.');
      setSelectedFile(null);
      throw err;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
      const isValidType = allowedTypes.includes(file.type);
      const isValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
     
      if (isValidType || isValidExtension) {
        setSelectedFile(file);
        toast.promise(uploadFile(file), {
          loading: 'Uploading document...',
          success: 'Document uploaded successfully!',
          error: 'Failed to upload document. Please try again.',
        });
      } else {
        toast.error('Please select a valid file type (PDF, DOC, DOCX, or TXT)');
        e.target.value = '';
        setSelectedFile(null);
      }
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.empName || !newExpense.empId || !newExpense.reimbursement || !newExpense.amount || !newExpense.date) {
      toast.error('Please fill in all required fields.');
      return;
    }
   
    if (selectedFile && !newExpense.documentPath) {
      toast.error('Please wait for the document to finish uploading.');
      return;
    }

    try {
      const requestBody = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        await fetchExpenses(); // Use await to ensure completion
        setNewExpense({ empName: '', empId: '', reimbursement: '', amount: '', date: '', remarks: '', documentPath: '' });
        setSelectedFile(null);
        toast.success('Reimbursement added successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to add reimbursement');
      }
    } catch (err) {
      console.error('Add error:', err);
      toast.error('Failed to add reimbursement');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchExpenses(); // Use await to ensure completion
      toast.success('Reimbursement deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete reimbursement');
    }
  };

  const handleEditClick = (expense: SalaryReimbursement) => {
    setEditingId(expense.id);
    const formatDateForInput = (dateStr: string) => {
      if (!dateStr) return '';
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return '';
      }
    };
   
    setNewExpense({
      empName: expense.empName,
      empId: expense.empId,
      reimbursement: expense.reimbursement,
      amount: expense.amount.toString(),
      date: formatDateForInput(expense.date),
      remarks: expense.remarks || '',
      documentPath: expense.documentPath || '',
    });
    setSelectedFile(null);
  };

  const handleUpdateExpense = async () => {
    if (!newExpense.empName || !newExpense.empId || !newExpense.reimbursement || !newExpense.amount || !newExpense.date || editingId === null) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (selectedFile && !newExpense.documentPath) {
      toast.error('Please wait for the document to finish uploading.');
      return;
    }

    try {
      const currentExpense = expenses.find(exp => exp.id === editingId);
      const requestBody = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        documentPath: selectedFile ? newExpense.documentPath : (currentExpense?.documentPath || '')
      };
     
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        await fetchExpenses(); // Use await to ensure completion
        setNewExpense({ empName: '', empId: '', reimbursement: '', amount: '', date: '', remarks: '', documentPath: '' });
        setSelectedFile(null);
        setEditingId(null);
        toast.success('Reimbursement updated successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to update reimbursement');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update reimbursement');
    }
  };

  const handleCancelEdit = () => {
    setNewExpense({ empName: '', empId: '', reimbursement: '', amount: '', date: '', remarks: '', documentPath: '' });
    setSelectedFile(null);
    setEditingId(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/^v\d+\//, '');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900">
      <Toaster position="top-right" />
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <BackButton href="/finance-manager/fixed-expenses" label="Back to Dashboard" />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-600 rounded-lg shadow-lg">
                <BriefcaseIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Salary Reimbursements</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Manage and track employee reimbursements</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{expenses.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Records</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {editingId ? (
                <>
                  <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                  <span>Edit Reimbursement</span>
                </>
              ) : (
                <>
                  <PlusCircleIcon className="h-5 w-5 text-indigo-600" />
                  <span>Add New Reimbursement</span>
                </>
              )}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee Name *</label>
                <input type="text" name="empName" value={newExpense.empName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID *</label>
                <input type="text" name="empId" value={newExpense.empId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reimbursement *</label>
                <input type="text" name="reimbursement" value={newExpense.reimbursement} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount *</label>
                <input type="number" name="amount" value={newExpense.amount} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                <input type="date" name="date" value={newExpense.date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
                <input type="text" name="remarks" value={newExpense.remarks} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Document</label>
                <div className="relative">
                  <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {selectedFile ? selectedFile.name : (editingId && newExpense.documentPath ? getFileNameFromUrl(newExpense.documentPath) : 'No file chosen')}
                    </span>
                    <label className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm font-medium cursor-pointer hover:bg-indigo-700">
                      Upload
                      <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {editingId ? (
                <>
                  <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">Cancel</button>
                  <button onClick={handleUpdateExpense} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"><PencilSquareIcon className="h-4 w-4 mr-1 inline" />Update</button>
                </>
              ) : (
                <button onClick={handleAddExpense} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"><PlusCircleIcon className="h-4 w-4 mr-1 inline" />Add</button>
              )}
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reimbursement List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reimbursement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-500 dark:text-gray-400">Loading reimbursements...</span>
                      </div>
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center animate-fadeInUp">
                      <div className="text-gray-500 dark:text-gray-400">
                        <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No reimbursements found</p>
                        <p className="text-sm">Add your first reimbursement to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{expense.empName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.empId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.reimbursement}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">₹{expense.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{expense.remarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {expense.documentPath ? (
                          <a
                            href={expense.documentPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 underline"
                          >
                            📄 View
                          </a>
                        ) : (
                          <span className="text-gray-400">No document</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditClick(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Edit"><PencilSquareIcon className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}