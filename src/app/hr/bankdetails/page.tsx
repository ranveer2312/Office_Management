"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Search, CreditCard, X, Edit } from "lucide-react";

// Change APIURL from localhost to a generic placeholder URL.
// When running in a sandboxed environment, localhost access is typically restricted.
// Please replace this with your live or externally accessible backend URL.
const APIURL = "http://localhost:8080"; 

interface BankDetail {
  id: number;
  employeeId: string;
  employeeName: string;
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
  bankBranch: string | null;
  ifscCode: string | null;
  pfNumber: string | null;
  uan: string | null;
  pan: string | null;
}

interface FormData {
  employeeId: string;
  employeeName: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  bankBranch: string;
  ifscCode: string;
  pfNumber: string;
  uan: string;
  pan: string;
}

const initialFormData: FormData = {
  employeeId: "",
  employeeName: "",
  bankName: "",
  accountNumber: "",
  accountHolderName: "",
  bankBranch: "",
  ifscCode: "",
  pfNumber: "",
  uan: "",
  pan: "",
};

const BANK_API_URL = `${APIURL}/api/bankdetails`;

// Reusable Input Field Component
const InputField = ({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      className={`mt-1 block w-full border ${
        required ? "border-indigo-300" : "border-gray-300"
      } rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500`}
    />
  </div>
);

// Table Header helper component
const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th
    scope="col"
    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  >
    {children}
  </th>
);

// Table Data helper component
const TableData = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-2 text-sm text-gray-900 truncate max-w-[120px] md:max-w-none">
    {children}
  </td>
);

export default function BankDetailsManager() {
  const [documents, setDocuments] = useState<BankDetail[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<BankDetail | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Function to fetch all bank details
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(BANK_API_URL);
      const apiData = response.data;

      if (Array.isArray(apiData)) {
        // Map API response fields to the required BankDetail interface
        const mappedData: BankDetail[] = apiData.map(doc => ({
          ...doc, 
          // Ensure all required fields are present, even if nullish from API
          employeeId: doc.employeeId || "", // Ensure it's a string for filtering safety
          employeeName: doc.employeeName || "", // Ensure it's a string for filtering safety
          accountNumber: doc.accountNumber || doc.bankAccount || null,
          accountHolderName: doc.accountHolderName || null,
          bankBranch: doc.bankBranch || null,
          ifscCode: doc.ifscCode || null,
          pfNumber: doc.pfNumber || null,
          uan: doc.uan || null,
          pan: doc.pan || doc.panNumber || null, 
        }));
        setDocuments(mappedData);
      } else {
        setDocuments([]);
        toast.error("Failed to parse bank details data structure.");
      }
    } catch (err: any) {
      // Improved error message to guide user on troubleshooting "Network Error"
      const errMsg = "Failed to connect to the API. Please ensure your Spring Boot server is running and accessible at the configured address.";
      setError(errMsg);
      toast.error(errMsg);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper function for detailed error reporting
  const getErrorMessage = (err: any, defaultMsg: string) => {
    const status = err.response?.status;
    let message = defaultMsg;

    if (err.response?.data) {
        // Try to get specific message from Spring Boot response structure
        message = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
    } else if (err.message) {
        message = err.message; // Axios error message
    }
    
    // Provide a more user-friendly message for common HTTP errors
    if (status === 404) {
        message = `Record not found (404). It may have been deleted. Server response: ${message}`;
    } else if (status === 400) {
        message = `Invalid data submitted (400). Please check required fields. Server response: ${message}`;
    } else if (status === 500) {
        message = `Server error (500). Please check server logs. Server response: ${message}`;
    }

    return message;
  }

  // Handle form submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Build payload, which matches the BankDetailRequestDTO
    const payload: Record<string, any> = {
      employeeId: formData.employeeId,
      employeeName: formData.employeeName, 
      bankName: formData.bankName || null,
      accountNumber: formData.accountNumber || null,
      accountHolderName: formData.accountHolderName || null,
      bankBranch: formData.bankBranch || null,
      ifscCode: formData.ifscCode || null,
      pfNumber: formData.pfNumber || null,
      uan: formData.uan || null,
      pan: formData.pan || null,
    };

    try {
      if (editingId) {
        // PUT request uses the DTO payload
        await axios.put(`${BANK_API_URL}/${editingId}`, payload);
        toast.success("Bank details updated successfully!");
      } else {
        await axios.post(BANK_API_URL, payload);
        toast.success("New bank details created successfully!");
      }

      // Reset state and refresh data
      setFormData(initialFormData);
      setEditingId(null);
      setShowEditModal(false);
      await fetchDocuments();
    } catch (err: any) {
      console.error("Submit failed:", err);
      // ⭐️ FIX: Use improved error reporting
      const errorMessage = getErrorMessage(err, "Failed to save details. Check server logs.");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open the modal and populate data for editing
  const openEditModal = (doc: BankDetail | null) => {
    if (doc) {
      setEditingId(doc.id);
      setFormData({
        employeeId: doc.employeeId,
        employeeName: doc.employeeName,
        bankName: doc.bankName || "",
        accountNumber: doc.accountNumber || "",
        accountHolderName: doc.accountHolderName || "",
        bankBranch: doc.bankBranch || "",
        ifscCode: doc.ifscCode || "",
        pfNumber: doc.pfNumber || "",
        uan: doc.uan || "",
        pan: doc.pan || "",
      });
    } else {
      // Reset for creation mode
      setEditingId(null);
      setFormData(initialFormData);
    }
    setShowEditModal(true);
  };

  // Close the modal and reset state
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setFormData(initialFormData);
    setError(null);
  };

  // Set document for deletion confirmation
  const handleDelete = (doc: BankDetail) => {
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  // Execute deletion
  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await axios.delete(`${BANK_API_URL}/${documentToDelete.id}`);
      toast.success("Bank details deleted!");
      await fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      // ⭐️ FIX: Use improved error reporting
      const errorMessage = getErrorMessage(err, "Failed to delete bank details.");
      toast.error(errorMessage);
    } finally {
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Use (field || "") to safely call .toLowerCase() on ALL fields
    return (
      (doc.employeeId || "").toLowerCase().includes(searchLower) ||
      (doc.employeeName || "").toLowerCase().includes(searchLower) ||
      (doc.bankName || "").toLowerCase().includes(searchLower) ||
      (doc.accountNumber || "").toLowerCase().includes(searchLower) ||
      (doc.ifscCode || "").toLowerCase().includes(searchLower) ||
      (doc.pfNumber || "").toLowerCase().includes(searchLower) ||
      (doc.uan || "").toLowerCase().includes(searchLower) ||
      (doc.pan || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 font-['Inter']">
      <Toaster position="top-right" />
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center sm:text-left">
          🏦 Employee Bank & Statutory Details
        </h1>
        <button
          onClick={() => openEditModal(null)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200/50 w-full sm:w-auto font-medium"
        >
          <CreditCard className="w-5 h-5" />
          <span>Add New Detail</span>
        </button>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 shadow-md">
          <p className="font-semibold">Connection Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center space-x-4 border border-gray-100">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee ID, Name, Bank, or Statutory Numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {isLoading && !documents.length ? (
          <div className="text-center py-12 text-gray-500">
            <p className="animate-pulse">Loading bank details...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bank details found
            </h3>
            <p className="text-gray-500">Try creating a new record or adjust your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Employee ID</TableHeader>
                  <TableHeader>Employee Name</TableHeader>
                  <TableHeader>Bank Name</TableHeader>
                  <TableHeader>Account No.</TableHeader>
                  <TableHeader>IFSC Code</TableHeader>
                  <TableHeader>PF / UAN</TableHeader>
                  <TableHeader>PAN</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <TableData>{doc.id}</TableData>
                    <TableData>{doc.employeeId}</TableData>
                    <TableData>{doc.employeeName}</TableData>
                    <TableData>{doc.bankName || "-"}</TableData>
                    <TableData>{doc.accountNumber || "-"}</TableData>
                    <TableData>{doc.ifscCode || "-"}</TableData>
                    <TableData>{`${doc.pfNumber || "-"} / ${doc.uan || "-"}`}</TableData>
                    <TableData>{doc.pan || "-"}</TableData>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium flex space-x-3">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold inline-flex items-center hover:scale-105 transition-transform"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-red-600 hover:text-red-900 font-semibold inline-flex items-center hover:scale-105 transition-transform"
                      >
                        <X className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT/CREATE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-8 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[95vh] transform transition-all duration-300 scale-100"
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Bank & Statutory Details" : "Create New Bank Details"}
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Employee Info - Non-editable in update mode */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
              <InputField
                label="Employee ID *"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                placeholder="e.g. EMPTA001"
                disabled={!!editingId}
              />
              <InputField
                label="Employee Name *"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                required
                disabled={!!editingId} // FIX: Disabled during edit
              />
            </div>
            
            {/* Bank Details */}
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">Bank Account Information</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
              />
              <InputField
                label="Account Holder Name"
                name="accountHolderName" 
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Name on Account"
              />
              <InputField
                label="Account Number"
                name="accountNumber" 
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="1234567890"
              />
              <InputField
                label="IFSC Code"
                name="ifscCode" 
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="ABCD0123456"
              />
              <InputField
                label="Bank Branch"
                name="bankBranch" 
                value={formData.bankBranch}
                onChange={handleChange}
              />
            </div>

            {/* Statutory Details */}
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 my-4">Statutory Information (PF, UAN, PAN)</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField
                label="PF Number"
                name="pfNumber"
                value={formData.pfNumber}
                onChange={handleChange}
              />
              <InputField
                label="UAN"
                name="uan"
                value={formData.uan}
                onChange={handleChange}
              />
              <InputField
                label="PAN"
                name="pan" 
                value={formData.pan}
                onChange={handleChange}
                placeholder="ABCDE1234F"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-8 mt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 font-semibold shadow-md hover:shadow-lg"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingId
                  ? "Update Details"
                  : "Create Details"}
              </button>
              <button
                type="button"
                onClick={closeEditModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you absolutely sure you want to delete bank details for{" "}
              <strong>{documentToDelete.employeeName}</strong> (
              {documentToDelete.employeeId})? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}