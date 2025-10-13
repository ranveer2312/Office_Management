"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Search, CreditCard, X, Edit } from "lucide-react";
import { APIURL } from "@/constants/api";

interface BankDetail {
  id: number;
  employeeId: string;
  employeeName: string;
  bankName: string | null;
  bankAccount: string | null;
  pfNumber: string | null;
  uan: string | null;
  panNumber: string | null;
}

interface FormData {
  employeeId: string;
  employeeName: string;
  bankName: string;
  bankAccount: string;
  pfNumber: string;
  uan: string;
  panNumber: string;
}

const initialFormData: FormData = {
  employeeId: "",
  employeeName: "",
  bankName: "",
  bankAccount: "",
  pfNumber: "",
  uan: "",
  panNumber: "",
};

const BANK_API_URL = `${APIURL}/api/bankdocuments`;

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
      } rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50`}
    />
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th
    scope="col"
    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  >
    {children}
  </th>
);

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

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(BANK_API_URL);
      const apiData = response.data;

      if (Array.isArray(apiData)) {
        setDocuments(apiData);
      } else {
        setDocuments([]);
        toast.error("Failed to parse bank details data structure.");
      }
    } catch (err: any) {
      const errMsg = "Failed to fetch bank details. Check backend API.";
      setError(errMsg);
      toast.error(errMsg);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: Partial<BankDetail> & { id?: number } = {
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      bankName: formData.bankName || null,
      bankAccount: formData.bankAccount || null,
      pfNumber: formData.pfNumber || null,
      uan: formData.uan || null,
      panNumber: formData.panNumber || null,
    };

    if (editingId) payload.id = editingId;

    try {
      if (editingId) {
        await axios.put(`${BANK_API_URL}/${editingId}`, payload);
        toast.success("Bank details updated successfully!");
      } else {
        await axios.post(BANK_API_URL, payload);
        toast.success("New bank details created successfully!");
      }

      setFormData(initialFormData);
      setEditingId(null);
      setShowEditModal(false);
      await fetchDocuments();
    } catch (err: any) {
      console.error("Submit failed:", err);
      toast.error("Failed to save details. Please check server logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (doc: BankDetail | null) => {
    if (doc) {
      setEditingId(doc.id);
      setFormData({
        employeeId: doc.employeeId,
        employeeName: doc.employeeName,
        bankName: doc.bankName || "",
        bankAccount: doc.bankAccount || "",
        pfNumber: doc.pfNumber || "",
        uan: doc.uan || "",
        panNumber: doc.panNumber || "",
      });
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setFormData(initialFormData);
    setError(null);
  };

  const handleDelete = (doc: BankDetail) => {
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await axios.delete(`${BANK_API_URL}/${documentToDelete.id}`);
      toast.success("Bank details deleted!");
      await fetchDocuments();
    } catch (err) {
      toast.error("Failed to delete bank details.");
      console.error("Delete error:", err);
    } finally {
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doc.employeeId.toLowerCase().includes(searchLower) ||
      (doc.employeeName || "").toLowerCase().includes(searchLower) ||
      (doc.bankName || "").toLowerCase().includes(searchLower) ||
      (doc.pfNumber || "").toLowerCase().includes(searchLower) ||
      (doc.uan || "").toLowerCase().includes(searchLower) ||
      (doc.panNumber || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
          🏦 Employee Bank & Statutory Details
        </h1>
        <button
          onClick={() => openEditModal(null)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow w-full sm:w-auto"
        >
          <CreditCard className="w-5 h-5" />
          <span>Add New Detail</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Employee ID, Name, or Bank Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {isLoading && !documents.length ? (
          <div className="text-center py-12 text-gray-500">
            <p>Loading bank details...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bank details found
            </h3>
            <p className="text-gray-500">Try creating a new record.</p>
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
                  <TableHeader>PF / UAN</TableHeader>
                  <TableHeader>PAN</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <TableData>{doc.id}</TableData>
                    <TableData>{doc.employeeId}</TableData>
                    <TableData>{doc.employeeName}</TableData>
                    <TableData>{doc.bankName || "-"}</TableData>
                    <TableData>{`${doc.pfNumber || "-"} / ${doc.uan || "-"}`}</TableData>
                    <TableData>{doc.panNumber || "-"}</TableData>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 font-semibold inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-red-600 hover:text-red-900 font-semibold inline-flex items-center"
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

      {/* --- EDIT/CREATE MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? "Edit Bank Details" : "Create Bank Details"}
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              />
              <InputField
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
              />
              <InputField
                label="Bank Account"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
              />
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
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete bank details for{" "}
              <strong>{documentToDelete.employeeName}</strong> (
              {documentToDelete.employeeId})?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
