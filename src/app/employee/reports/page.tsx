
// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   FileText,
//   FilePlus,
//   Building,
//   Users,
//   Map,
//   Target,
//   Award,
//   Calendar,
//   Trash2,
//   Upload,
//   X,
//   Eye,
//   AlertCircle,
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { APIURL } from '@/constants/api';
// import toast, { Toaster } from 'react-hot-toast';

// interface Report {
//   id: number;
//   type: 'employee' | 'visit' | 'oem' | 'customer' | 'blueprint' | 'projection' | 'achievement';
//   subtype?: string;
//   title: string;
//   date: string | number[];
//   status?: 'draft' | 'submitted' | 'approved' | null;
//   content?: string | null;
//   attachments?: string[] | null;
//   submittedBy?: string;
//   approvedBy?: string;
//   approvedDate?: string;
//   department?: string;
//   employeeId?: string;
//   employeeName?: string;
//   customerName?: string;
//   designation?: string;
//   landlineOrMobile?: string;
//   emailId?: string;
//   remarks?: string;
//   productOrRequirements?: string;
//   division?: string;
//   company?: string;
//   poNumber?: string;
//   orderDate?: string;
//   item?: string;
//   quantity?: string;
//   partNumber?: string;
//   xmwPrice?: string;
//   unitTotalOrderValue?: string;
//   totalPoValue?: string;
//   xmwInvoiceRef?: string;
//   xmwInvoiceDate?: string;
//   nre?: string;
//   quoteDate?: string;
//   slNo?: number;
//   itemDescription?: string;
//   competitor?: string;
//   modelNumber?: string;
//   unitPrice?: string;
//   quotationNumber?: string;
//   productDescription?: string;
//   xmwValue?: string;
//   holdingProjectsList?: {
//     customerName?: string;
//     quotationNumber?: string;
//     productDescription?: string;
//     quantity?: string;
//     xmwValue?: string;
//   }[];
//   originalFileName?: string;
//   organization?: string;
// }

// const BASE_URL = APIURL + '/api/reports';

// const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// export default function ReportsPage() {
//   const router = useRouter();
//   const [reports, setReports] = useState<Report[]>([]);
//   const [selectedType, setSelectedType] = useState<string>('employee');
//   const [selectedSubtype, setSelectedSubtype] = useState<string>('all');
//   const [showNewReportForm, setShowNewReportForm] = useState(false);
//   const [newReport, setNewReport] = useState<Partial<Report>>({
//     type: 'employee',
//     subtype: 'daily',
//     title: '',
//     content: '',
//     status: 'draft',
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [employeeId, setEmployeeId] = useState<string | null>(null);
//   const [customerReport, setCustomerReport] = useState({
//     title: '',
//     content: '',
//     date: '',
//     status: 'submitted',
//     submittedBy: '',
//     customerName: '',
//     designation: '',
//     landlineOrMobile: '',
//     emailId: '',
//     remarks: '',
//     organization: '',
//     productOrRequirements: '',
//     division: '',
//     company: '',
//     attachments: [] as string[],
//   });
//   const [divisionOptions, setDivisionOptions] = useState<string[]>([]);
//   const [companyOptions, setCompanyOptions] = useState<string[]>([]);
//   const [searchOption, setSearchOption] = useState('');
//   const [showSearchDropdown, setShowSearchDropdown] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
//   const [uploading, setUploading] = useState(false);

//   const reportTypes = [
//     { id: 'employee', label: 'Employee Report', icon: <FileText className="w-5 h-5" /> },
//     { id: 'visit', label: 'Visit Report', icon: <Map className="w-5 h-5" /> },
//     { id: 'oem', label: 'OEM Report', icon: <Building className="w-5 h-5" /> },
//     { id: 'customer', label: 'Customer Report', icon: <Users className="w-5 h-5" /> },
//     { id: 'blueprint', label: 'Blueprint Report', icon: <FileText className="w-5 h-5" /> },
//     { id: 'projection', label: 'Projection Report', icon: <Target className="w-5 h-5" /> },
//     { id: 'achievement', label: 'Achievement Report', icon: <Award className="w-5 h-5" /> },
//   ];

//   const employeeSubtypes = [
//     { id: 'daily', label: 'Daily Report', icon: <Calendar className="w-5 h-5" /> },
//     { id: 'weekly', label: 'Weekly Report', icon: <Calendar className="w-5 h-5" /> },
//     { id: 'monthly', label: 'Monthly Report', icon: <Calendar className="w-5 h-5" /> },
//     { id: 'yearly', label: 'Yearly Report', icon: <Calendar className="w-5 h-5" /> },
//   ];

//   const oemSubtypes = [
//     { id: 'orders', label: 'Orders' },
//     { id: 'competitor_analysis', label: 'Competitor Analysis' },
//     { id: 'open_tenders', label: 'Open Tenders' },
//     { id: 'bugetary_submits', label: 'Bugetary Submits' },
//     { id: 'lost_tenders', label: 'Lost Tenders' },
//     { id: 'holding_projects', label: 'Holding Projects' },
//   ];

//   const validateFile = (file: File): string | null => {
//     const fileName = file.name.toLowerCase();
//     const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
//     if (!hasValidExtension) {
//       return `File "${file.name}" is not allowed. Only PDF, DOC, DOCX, XLS, XLSX files are allowed.`;
//     }

//     if (file.size > MAX_FILE_SIZE) {
//       return `File "${file.name}" is too large. Maximum file size is 10MB.`;
//     }

//     return null;
//   };

//   const handleFileSelection = (files: FileList | null) => {
//     if (!files) return;

//     const fileArray = Array.from(files);
//     const validationErrors: string[] = [];

//     fileArray.forEach(file => {
//       const error = validateFile(file);
//       if (error) {
//         validationErrors.push(error);
//       }
//     });

//     if (validationErrors.length > 0) {
//       setError(validationErrors.join('\n'));
//       toast.error('Some files were rejected. Please check the file types and sizes.');
//       return;
//     }

//     setUploadedFiles(fileArray);
//     setError(null);
//   };

//   const getReportIcon = (type: string) => {
//     const reportType = reportTypes.find((t) => t.id === type);
//     return reportType?.icon || <FileText className="w-5 h-5" />;
//   };

//   useEffect(() => {
//     const id = sessionStorage.getItem('employeeId') || localStorage.getItem('employeeId');
//     if (!id) {
//       setError('Employee ID not found. Please login again.');
//       setTimeout(() => {
//         router.replace('/login');
//       }, 2000);
//       return;
//     }
//     setEmployeeId(id);
//   }, [router]);

//   useEffect(() => {
//     fetch(`${APIURL}/api/reports/customer-divisions`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (Array.isArray(data)) setDivisionOptions(data);
//         else if (data && Array.isArray(data.divisions)) setDivisionOptions(data.divisions);
//       })
//       .catch(() => console.log('Failed to fetch divisions'));
    
//     fetch(`${APIURL}/api/reports/customer-companies`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (Array.isArray(data)) setCompanyOptions(data);
//         else if (data && Array.isArray(data.companies)) setCompanyOptions(data.companies);
//       })
//       .catch(() => console.log('Failed to fetch companies'));
//   }, []);

//   const fetchReports = useCallback(async () => {
//     if (!employeeId) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const url = `${BASE_URL}/employee/${employeeId}`;
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const allReports: Report[] = await response.json();
//       let filteredReports = allReports;

//       if (selectedType !== 'all') {
//         filteredReports = filteredReports.filter((report) => report.type === selectedType);
//       }

//       if (selectedType === 'employee' && selectedSubtype !== 'all') {
//         filteredReports = filteredReports.filter((report) => report.subtype === selectedSubtype);
//       }

//       setReports(filteredReports);
//     } catch (e) {
//       setError('Failed to fetch reports: ' + (e as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedType, selectedSubtype, employeeId]);

//   useEffect(() => {
//     if (employeeId) {
//       fetchReports();
//     }
//   }, [fetchReports, employeeId]);

//   const uploadFiles = async (files: File[]) => {
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       files.forEach((file) => formData.append('files', file));
      
//       const response = await fetch(`${APIURL}/api/reports/upload`, {
//         method: 'POST',
//         body: formData,
//       });
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`File upload failed: ${errorText}`);
//       }
      
//       const result = await response.json();
//       return result;
//     } catch (error) {
//       throw error;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSubmitReport = async () => {
//     if (!employeeId) {
//       setError('Employee ID not found. Please login again.');
//       return;
//     }

//     let uploadedFileUrls: string[] = [];
//     if (uploadedFiles.length > 0) {
//       try {
//         const uploadResult = await uploadFiles(uploadedFiles);
//         uploadedFileUrls = Array.isArray(uploadResult) ? uploadResult : [uploadResult];
//       } catch (err: unknown) {
//         setError(`Failed to upload files: ${err instanceof Error ? err.message : 'Unknown error'}`);
//         return;
//       }
//     }

//     let reportData: Partial<Report>;

//     if (newReport.type === 'oem') {
//       reportData = {
//         type: 'oem',
//         subtype: newReport.subtype,
//         submittedBy: employeeId,
//         attachments: uploadedFileUrls,
//         status: 'submitted',
//         originalFileName: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
//       };
      
//       if (newReport.subtype === 'orders') {
//         reportData = {
//           ...reportData,
//           title: 'Orders Report',
//           content: 'Order details and information',
//           poNumber: newReport.poNumber,
//           orderDate: newReport.orderDate,
//           item: newReport.item,
//           quantity: newReport.quantity,
//           partNumber: newReport.partNumber,
//           xmwPrice: newReport.xmwPrice,
//           unitTotalOrderValue: newReport.unitTotalOrderValue,
//           totalPoValue: newReport.totalPoValue,
//           customerName: newReport.customerName,
//           xmwInvoiceRef: newReport.xmwInvoiceRef,
//           xmwInvoiceDate: newReport.xmwInvoiceDate,
//           nre: newReport.nre,
//           quoteDate: newReport.quoteDate,
//         };
//       } else if (newReport.subtype === 'competitor_analysis') {
//         reportData = {
//           ...reportData,
//           title: 'Competitor Analysis Report',
//           content: 'Competitor analysis data',
//           slNo: newReport.slNo,
//           customerName: newReport.customerName,
//           itemDescription: newReport.itemDescription,
//           competitor: newReport.competitor,
//           modelNumber: newReport.modelNumber,
//           unitPrice: newReport.unitPrice,
//         };
//       } else {
//         reportData = {
//           ...reportData,
//           title: newReport.title || 'OEM Report',
//           content: newReport.content || 'OEM report data',
//           customerName: newReport.customerName,
//           quotationNumber: newReport.quotationNumber,
//           productDescription: newReport.productDescription,
//           quantity: newReport.quantity,
//           xmwValue: newReport.xmwValue,
//           remarks: newReport.remarks,
//         };
//       }
//     } else if (newReport.type === 'customer') {
//       if (
//         !customerReport.date ||
//         !customerReport.customerName ||
//         !customerReport.designation ||
//         !customerReport.landlineOrMobile ||
//         !customerReport.emailId ||
//         !customerReport.organization ||
//         !customerReport.division
//       ) {
//         setError('Please fill all required fields for Customer Report.');
//         return;
//       }
//       reportData = {
//         type: 'customer',
//         title: `Customer Report for ${customerReport.customerName} - ${customerReport.date}`,
//         content: customerReport.content || 'Customer report data',
//         date: customerReport.date,
//         status: customerReport.status as 'draft' | 'submitted' | 'approved' | null,
//         submittedBy: employeeId,
//         customerName: customerReport.customerName,
//         designation: customerReport.designation,
//         landlineOrMobile: customerReport.landlineOrMobile,
//         emailId: customerReport.emailId,
//         remarks: customerReport.remarks,
//         organization: customerReport.organization,
//         division: customerReport.division,
//         productOrRequirements: customerReport.productOrRequirements,
//         attachments: uploadedFileUrls,
//         originalFileName: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
//       };
//     } else {
//       if (!newReport.content) {
//         setError('Content is required.');
//         return;
//       }

//       const selectedSubtypeLabel = employeeSubtypes.find((s) => s.id === newReport.subtype)?.label || newReport.subtype;
//       reportData = {
//         ...newReport,
//         title: `${selectedSubtypeLabel} - ${new Date().toLocaleDateString()}`,
//         date: new Date().toISOString().split('T')[0],
//         status: newReport.status || 'submitted',
//         submittedBy: employeeId,
//         attachments: uploadedFileUrls,
//         originalFileName: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
//       };
//     }

//     try {
//       const response = await fetch(BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(reportData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `Failed to create report: ${response.status}`);
//       }

//       const createdReport: Report = await response.json();
//       setReports([createdReport, ...reports]);
//       setShowNewReportForm(false);
      
//       // Corrected reset logic
//       setNewReport({
//         type: 'employee',
//         subtype: 'daily',
//         title: '',
//         content: '',
//         status: 'draft',
//       });
//       setCustomerReport({
//         title: '',
//         content: '',
//         date: '',
//         status: 'submitted',
//         submittedBy: '',
//         customerName: '',
//         designation: '',
//         landlineOrMobile: '',
//         emailId: '',
//         remarks: '',
//         organization: '',
//         productOrRequirements: '',
//         division: '',
//         company: '',
//         attachments: [],
//       });
//       setUploadedFiles([]);
//       setError(null);
//       toast.success('Report submitted successfully!');
//     } catch (err: unknown) {
//       setError(`Error submitting report: ${err instanceof Error ? err.message : 'Unknown error'}`);
//       toast.error('Failed to submit report. Please try again later.');
//     }
//   };

//   const handleDeleteReport = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this report?')) {
//       return;
//     }

//     try {
//       const response = await fetch(`${BASE_URL}/${id}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to delete report: ${response.status}`);
//       }

//       setReports(reports.filter((report) => report.id !== id));
//       setError(null);
//       toast.success('Report deleted successfully!');
//     } catch (err: unknown) {
//       setError(`Error deleting report: ${err instanceof Error ? err.message : 'Unknown error'}`);
//       toast.error('Failed to delete report. Please try again later.');
//     }
//   };

//   const renderNewReportForm = () => {
//     if (!showNewReportForm) return null;
    
//     if (newReport.type === 'oem') {
//       return (
//         <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
//           <div className="bg-white/90 rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn">
//             <div className="flex justify-between items-center mb-8">
//               <div className="flex items-center space-x-4">
//                 <div className="p-3 bg-blue-50/90 rounded-xl">
//                   <FilePlus className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-semibold text-gray-900">Create OEM Report</h2>
//                   <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your OEM report</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowNewReportForm(false);
//                   setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
//                   setUploadedFiles([]);
//                   setError(null);
//                 }}
//                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/90 rounded-lg transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
            
//             <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">OEM Report Subtype</label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <select
//                     value={oemSubtypes.some((s) => s.id === (newReport.subtype || '')) ? newReport.subtype || '' : ''}
//                     onChange={(e) => setNewReport({ ...newReport, subtype: e.target.value })}
//                     className="w-full sm:w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white/90 pr-10 py-2.5"
//                   >
//                     <option value="">-- Select Subtype --</option>
//                     {oemSubtypes.map((subtype) => (
//                       <option key={subtype.id} value={subtype.id}>
//                         {subtype.label}
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     type="text"
//                     value={oemSubtypes.some((s) => s.id === (newReport.subtype || '')) ? '' : newReport.subtype || ''}
//                     onChange={(e) => setNewReport({ ...newReport, subtype: e.target.value })}
//                     placeholder="Or enter new subtype"
//                     className="w-full sm:w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 bg-white/90"
//                   />
//                 </div>
//               </div>

//               {newReport.subtype === 'orders' && (
//                 <div className="max-h-[400px] overflow-y-auto pr-2">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {[
//                       { label: 'PO Number', key: 'poNumber', type: 'text' },
//                       { label: 'Order Date', key: 'orderDate', type: 'date' },
//                       { label: 'Item', key: 'item', type: 'text' },
//                       { label: 'Quantity', key: 'quantity', type: 'text' },
//                       { label: 'Part Number', key: 'partNumber', type: 'text' },
//                       { label: 'XMW Price', key: 'xmwPrice', type: 'text' },
//                       { label: 'Unit Total Order Value', key: 'unitTotalOrderValue', type: 'text' },
//                       { label: 'Total PO Value', key: 'totalPoValue', type: 'text' },
//                       { label: 'Customer Name', key: 'customerName', type: 'text' },
//                       { label: 'XMW Invoice Ref', key: 'xmwInvoiceRef', type: 'text' },
//                       { label: 'XMW Invoice Date', key: 'xmwInvoiceDate', type: 'date' },
//                       { label: 'NRE', key: 'nre', type: 'text' },
//                       { label: 'Quote Date', key: 'quoteDate', type: 'date' },
//                     ].map((field) => (
//                       <div key={field.key} className="flex flex-col">
//                         <label className="block text-sm font-medium text-gray-700">{field.label}</label>
//                         <input
//                           type={field.type}
//                           value={
//                             typeof newReport[field.key as keyof typeof newReport] === 'string'
//                               ? (newReport[field.key as keyof typeof newReport] as string)
//                               : typeof newReport[field.key as keyof typeof newReport] === 'number'
//                               ? String(newReport[field.key as keyof typeof newReport])
//                               : ''
//                           }
//                           onChange={(e) => setNewReport({ ...newReport, [field.key]: e.target.value })}
//                           className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {newReport.subtype === 'competitor_analysis' && (
//                 <div className="max-h-[400px] overflow-y-auto pr-2">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Sl. No.</label>
//                       <input
//                         type="number"
//                         value={newReport.slNo || ''}
//                         onChange={(e) => setNewReport({ ...newReport, slNo: Number(e.target.value) })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Customer Name</label>
//                       <input
//                         type="text"
//                         value={newReport.customerName || ''}
//                         onChange={(e) => setNewReport({ ...newReport, customerName: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Item Description</label>
//                       <input
//                         type="text"
//                         value={newReport.itemDescription || ''}
//                         onChange={(e) => setNewReport({ ...newReport, itemDescription: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Competitor</label>
//                       <input
//                         type="text"
//                         value={newReport.competitor || ''}
//                         onChange={(e) => setNewReport({ ...newReport, competitor: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Model Number</label>
//                       <input
//                         type="text"
//                         value={newReport.modelNumber || ''}
//                         onChange={(e) => setNewReport({ ...newReport, modelNumber: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Unit Price</label>
//                       <input
//                         type="text"
//                         value={newReport.unitPrice || ''}
//                         onChange={(e) => setNewReport({ ...newReport, unitPrice: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {newReport.type === 'oem' &&
//                 ['holding_projects', 'open_tenders', 'bugetary_submits', 'lost_tenders'].includes(
//                   newReport.subtype || ''
//                 ) && (
//                 <div className="max-h-[400px] overflow-y-auto pr-2">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Customer Name</label>
//                       <input
//                         type="text"
//                         value={newReport.customerName || ''}
//                         onChange={(e) => setNewReport({ ...newReport, customerName: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Quotation Number</label>
//                       <input
//                         type="text"
//                         value={newReport.quotationNumber || ''}
//                         onChange={(e) => setNewReport({ ...newReport, quotationNumber: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Product Description</label>
//                       <input
//                         type="text"
//                         value={newReport.productDescription || ''}
//                         onChange={(e) => setNewReport({ ...newReport, productDescription: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Quantity</label>
//                       <input
//                         type="text"
//                         value={newReport.quantity || ''}
//                         onChange={(e) => setNewReport({ ...newReport, quantity: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">XMW Value</label>
//                       <input
//                         type="text"
//                         value={newReport.xmwValue || ''}
//                         onChange={(e) => setNewReport({ ...newReport, xmwValue: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Remarks</label>
//                       <input
//                         type="text"
//                         value={newReport.remarks || ''}
//                         onChange={(e) => setNewReport({ ...newReport, remarks: e.target.value })}
//                         className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Attachments</label>
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
//                   <input
//                     type="file"
//                     multiple
//                     accept=".pdf,.doc,.docx,.xls,.xlsx"
//                     onChange={(e) => handleFileSelection(e.target.files)}
//                     className="hidden"
//                     id="file-upload-oem"
//                   />
//                   <label
//                     htmlFor="file-upload-oem"
//                     className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 transition-colors"
//                   >
//                     <Upload className="w-4 h-4 mr-2" />
//                     Upload Files
//                   </label>
//                   <span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX up to 10MB each</span>
//                 </div>
//                 {uploadedFiles.length > 0 && (
//                   <div className="mt-3 space-y-2">
//                     <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
//                     {uploadedFiles.map((file, index) => (
//                       <div key={index} className="flex items-center justify-between bg-gray-50/90 p-2 rounded-lg">
//                         <span className="text-sm text-gray-700">{file.name}</span>
//                         <button
//                           onClick={() => {
//                             const newFiles = uploadedFiles.filter((_, i) => i !== index);
//                             setUploadedFiles(newFiles);
//                           }}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
              
//               {uploading && (
//                 <div className="flex items-center justify-center py-4">
//                   <div className="text-blue-600">Uploading files...</div>
//                 </div>
//               )}
              
//               {error && (
//                 <div className="bg-red-50/90 border border-red-200/90 rounded-lg p-3">
//                   <div className="flex items-center">
//                     <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
//                     <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
//                   </div>
//                 </div>
//               )}
              
//               <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/90">
//                 <button
//                   onClick={() => {
//                     setShowNewReportForm(false);
//                     setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
//                     setUploadedFiles([]);
//                     setError(null);
//                   }}
//                   className="px-6 py-2.5 text-gray-700 bg-gray-100/90 rounded-xl hover:bg-gray-200/90 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitReport}
//                   disabled={uploading}
//                   className="px-6 py-2.5 text-white bg-blue-600/90 rounded-xl hover:bg-blue-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/90 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {uploading ? 'Uploading...' : 'Submit Report'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }
    
//     if (newReport.type === 'customer') {
//       const maxWords = 1000;
//       const wordCount = customerReport.content?.trim().split(/\s+/).filter((word) => word.length > 0).length || 0;
//       const remainingWords = maxWords - wordCount;
      
//       return (
//         <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
//           <div className="bg-white/90 rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn">
//             <div className="flex justify-between items-center mb-8">
//               <div className="flex items-center space-x-4">
//                 <div className="p-3 bg-blue-50/90 rounded-xl">
//                   <FilePlus className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-semibold text-gray-900">Create Customer Report</h2>
//                   <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your customer report</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowNewReportForm(false);
//                   setCustomerReport({
//                     title: '',
//                     content: '',
//                     date: '',
//                     status: 'submitted',
//                     submittedBy: '',
//                     customerName: '',
//                     designation: '',
//                     landlineOrMobile: '',
//                     emailId: '',
//                     remarks: '',
//                     organization: '',
//                     productOrRequirements: '',
//                     division: '',
//                     company: '',
//                     attachments: [],
//                   });
//                   setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
//                   setUploadedFiles([]);
//                   setError(null);
//                 }}
//                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/90 rounded-lg transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
            
//             <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Date *</label>
//                   <input
//                     type="date"
//                     value={customerReport.date}
//                     onChange={(e) => setCustomerReport({ ...customerReport, date: e.target.value })}
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
//                   <input
//                     type="text"
//                     value={customerReport.customerName}
//                     onChange={(e) => setCustomerReport({ ...customerReport, customerName: e.target.value })}
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Designation *</label>
//                   <input
//                     type="text"
//                     value={customerReport.designation}
//                     onChange={(e) => setCustomerReport({ ...customerReport, designation: e.target.value })}
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Contact *</label>
//                   <input
//                     type="text"
//                     value={customerReport.landlineOrMobile}
//                     onChange={(e) => setCustomerReport({ ...customerReport, landlineOrMobile: e.target.value })}
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Email ID *</label>
//                   <input
//                     type="email"
//                     value={customerReport.emailId}
//                     onChange={(e) => setCustomerReport({ ...customerReport, emailId: e.target.value })}
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Organization *</label>
//                   <input
//                     type="text"
//                     value={customerReport.organization}
//                     onChange={(e) => setCustomerReport({ ...customerReport, organization: e.target.value })}
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Department (Division) *</label>
//                   <input
//                     type="text"
//                     value={customerReport.division}
//                     onChange={(e) => setCustomerReport({ ...customerReport, division: e.target.value })}
//                     placeholder=""
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//                 {/* New field: Product or Requirements */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700">Product or Requirements</label>
//                   <input
//                     type="text"
//                     value={customerReport.productOrRequirements}
//                     onChange={(e) => setCustomerReport({ ...customerReport, productOrRequirements: e.target.value })}
//                     className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Remarks</label>
//                 <input
//                   type="text"
//                   value={customerReport.remarks}
//                   onChange={(e) => setCustomerReport({ ...customerReport, remarks: e.target.value })}
//                   className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">Attachments(Optional)</label>
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
//                   <input
//                     type="file"
//                     multiple
//                     accept=".pdf,.doc,.docx,.xls,.xlsx"
//                     onChange={(e) => handleFileSelection(e.target.files)}
//                     className="hidden"
//                     id="file-upload-customer"
//                   />
//                   <label
//                     htmlFor="file-upload-customer"
//                     className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 transition-colors"
//                   >
//                     <Upload className="w-4 h-4 mr-2" />
//                     Upload Files
//                   </label>
//                   <span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX up to 10MB each</span>
//                 </div>
//                 {uploadedFiles.length > 0 && (
//                   <div className="mt-3 space-y-2">
//                     <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
//                     {uploadedFiles.map((file, index) => (
//                       <div key={index} className="flex items-center justify-between bg-gray-50/90 p-2 rounded-lg">
//                         <span className="text-sm text-gray-700">{file.name}</span>
//                         <button
//                           onClick={() => {
//                             const newFiles = uploadedFiles.filter((_, i) => i !== index);
//                             setUploadedFiles(newFiles);
//                           }}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
              
//               {uploading && (
//                 <div className="flex items-center justify-center py-4">
//                   <div className="text-blue-600">Uploading files...</div>
//                 </div>
//               )}
              
//               {error && (
//                 <div className="bg-red-50/90 border border-red-200/90 rounded-lg p-3">
//                   <div className="flex items-center">
//                     <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
//                     <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
//                   </div>
//                 </div>
//               )}
              
//               <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/90">
//                 <button
//                   onClick={() => {
//                     setShowNewReportForm(false);
//                     setCustomerReport({
//                       title: '',
//                       content: '',
//                       date: '',
//                       status: 'submitted',
//                       submittedBy: '',
//                       customerName: '',
//                       designation: '',
//                       landlineOrMobile: '',
//                       emailId: '',
//                       remarks: '',
//                       organization: '',
//                       productOrRequirements: '',
//                       division: '',
//                       company: '',
//                       attachments: [],
//                     });
//                     setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
//                     setUploadedFiles([]);
//                     setError(null);
//                   }}
//                   className="px-6 py-2.5 text-gray-700 bg-gray-100/90 rounded-xl hover:bg-gray-200/90 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitReport}
//                   disabled={uploading}
//                   className="px-6 py-2.5 text-white bg-blue-600/90 rounded-xl hover:bg-blue-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/90 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {uploading ? 'Uploading...' : 'Submit Report'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     const maxWords = 1000;
//     const wordCount = newReport.content?.trim().split(/\s+/).filter((word) => word.length > 0).length || 0;
//     const remainingWords = maxWords - wordCount;

//     return (
//       <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
//         <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn border border-gray-100">
          
//           <div className="flex justify-between items-start pb-6 border-b border-gray-200 mb-6">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-blue-50 rounded-xl">
//                 <FilePlus className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-extrabold text-gray-900">Create New Report</h2>
//                 <p className="text-sm text-gray-500 mt-1">Submit your {reportTypes.find(t => t.id === newReport.type)?.label || 'General'} report details below.</p>
//               </div>
//             </div>
//             <button
//               onClick={() => {
//                 setShowNewReportForm(false);
//                 setNewReport({
//                   type: 'employee',
//                   subtype: 'daily',
//                   title: '',
//                   content: '',
//                   status: 'draft',
//                 });
//                 setUploadedFiles([]);
//                 setError(null);
//               }}
//               className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
//               aria-label="Close form"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700" htmlFor="report-type-select">Report Type</label>
//                 <div className="relative">
//                   <select
//                     id="report-type-select"
//                     value={newReport.type}
//                     onChange={(e) => {
//                       const type = e.target.value as Report['type'];
//                       setNewReport({
//                         ...newReport,
//                         type,
//                         subtype: type === 'employee' ? newReport.subtype : undefined,
//                       });
//                     }}
//                     className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white py-2.5 pr-10"
//                   >
//                     {reportTypes.map((type) => (
//                       <option key={type.id} value={type.id}>
//                         {type.label}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                     <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               {newReport.type === 'employee' && (
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700" htmlFor="report-subtype-select">Report Subtype</label>
//                   <div className="relative">
//                     <select
//                       id="report-subtype-select"
//                       value={newReport.subtype || 'daily'}
//                       onChange={(e) => setNewReport({ ...newReport, subtype: e.target.value as Report['subtype'] })}
//                       className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white py-2.5 pr-10"
//                     >
//                       {employeeSubtypes.map((subtype) => (
//                         <option key={subtype.id} value={subtype.id}>
//                           {subtype.label}
//                         </option>
//                       ))}
//                     </select>
//                     <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                       <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <label className="block text-sm font-medium text-gray-700" htmlFor="report-content">Content <span className="text-red-500">*</span></label>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-xs text-gray-500 font-mono">{wordCount} words</span>
//                   <span className={`text-xs font-mono ${remainingWords < 100 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
//                     ({remainingWords} remaining)
//                   </span>
//                 </div>
//               </div>
//               <textarea
//                 id="report-content"
//                 value={newReport.content ?? ''}
//                 onChange={(e) => {
//                   const text = e.target.value;
//                   const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
//                   if (words.length <= maxWords) {
//                     setNewReport({ ...newReport, content: text });
//                   }
//                 }}
//                 rows={8}
//                 placeholder={`Write your ${reportTypes.find(t => t.id === newReport.type)?.label.toLowerCase() || 'report'} content here (max 1000 words)`}
//                 className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none py-2.5 px-3 bg-white"
//               />
//             </div>

//             <div className="space-y-3">
//               <label className="block text-sm font-medium text-gray-700">Attachments</label>
//               <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
//                 <input
//                   type="file"
//                   multiple
//                   accept=".pdf,.doc,.docx,.xls,.xlsx"
//                   onChange={(e) => handleFileSelection(e.target.files)}
//                   className="hidden"
//                   id="file-upload-employee"
//                 />
//                 <label
//                   htmlFor="file-upload-employee"
//                   className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
//                 >
//                   <Upload className="w-4 h-4 mr-2" />
//                   Select Files
//                 </label>
//                 <span className="text-xs text-gray-500">Allowed: PDF, DOC(X), XLS(X). Max: 10MB each.</span>
//               </div>
              
//               {uploadedFiles.length > 0 && (
//                 <div className="mt-4 space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
//                   <p className="text-sm font-semibold text-gray-700">Selected Files:</p>
//                   {uploadedFiles.map((file, index) => (
//                     <div key={index} className="flex items-center justify-between p-2 rounded-md bg-white border border-gray-100 shadow-sm">
//                       <div className="flex items-center space-x-2">
//                         <FileText className="w-4 h-4 text-gray-500" />
//                         <span className="text-sm text-gray-800 truncate">{file.name}</span>
//                       </div>
//                       <button
//                         onClick={() => {
//                           const newFiles = uploadedFiles.filter((_, i) => i !== index);
//                           setUploadedFiles(newFiles);
//                         }}
//                         className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
//                         aria-label={`Remove file ${file.name}`}
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {uploading && (
//                 <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <div className="text-blue-600 font-medium">Uploading files...</div>
//                 </div>
//             )}
            
//             {error && (
//               <div className="bg-red-50 border border-red-300 rounded-lg p-3 mt-4">
//                 <div className="flex items-center">
//                   <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mr-3" />
//                   <div className="text-red-700 text-sm whitespace-pre-line font-medium">{error}</div>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
//             <button
//               onClick={() => {
//                 setShowNewReportForm(false);
//                 setNewReport({
//                   type: 'employee',
//                   subtype: 'daily',
//                   title: '',
//                   content: '',
//                   status: 'draft',
//                 });
//                 setUploadedFiles([]);
//                 setError(null);
//               }}
//               className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmitReport}
//               disabled={!newReport.content || wordCount === 0 || uploading}
//               className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               {uploading ? 'Submitting...' : 'Submit Report'}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const styles = `
//     @keyframes fadeIn {
//       from { opacity: 0; }
//       to { opacity: 1; }
//     }
//     @keyframes slideIn {
//       from { transform: translateY(-20px); opacity: 0; }
//       to { transform: translateY(0); opacity: 1; }
//     }
//     .animate-fadeIn {
//       animation: fadeIn 0.2s ease-out;
//     }
//     .animate-slideIn {
//       animation: slideIn 0.3s ease-out;
//     }
//   `;

//   return (
//     <>
//       <style dangerouslySetInnerHTML={{ __html: styles }} />
//       <div className="min-h-screen bg-transparent py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <Toaster position="top-right" />

//           <div className="space-y-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//               <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Reports</h1>
//               <button
//                 onClick={() => {
//                   setShowNewReportForm(true);
//                   // Correct reset for customer report state on new form open
//                   setCustomerReport({
//                     title: '',
//                     content: '',
//                     date: '',
//                     status: 'submitted',
//                     submittedBy: '',
//                     customerName: '',
//                     designation: '',
//                     landlineOrMobile: '',
//                     emailId: '',
//                     remarks: '',
//                     organization: '',
//                     productOrRequirements: '',
//                     division: '',
//                     company: '',
//                     attachments: [],
//                   });
//                 }}
//                 className="inline-flex items-center px-6 py-3 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/90 focus:ring-offset-2 w-full sm:w-auto justify-center group"
//               >
//                 <FilePlus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12 duration-200" />
//                 <span>New Report</span>
//               </button>
//             </div>

//             <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200/90 p-4">
//               <div className="flex flex-wrap gap-2">
//                 {reportTypes.map((type) => (
//                   <button
//                     key={type.id}
//                     onClick={() => {
//                       setSelectedType(type.id);
//                       setSelectedSubtype('all');
//                     }}
//                     className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-colors ${
//                       selectedType === type.id ? 'bg-blue-100/90 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100/90'
//                     }`}
//                   >
//                     {type.icon}
//                     <span>{type.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {selectedType === 'employee' && (
//               <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200/90 p-4">
//                 <div className="flex flex-wrap gap-2">
//                   <button
//                     onClick={() => {
//                       setSelectedSubtype('all');
//                     }}
//                     className={`px-3 py-1 rounded-lg transition-colors ${
//                       selectedSubtype === 'all' ? 'bg-blue-100/90 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100/90'
//                     }`}
//                   >
//                     All Employee Reports
//                   </button>
//                   {employeeSubtypes.map((subtype) => (
//                     <button
//                       key={subtype.id}
//                       onClick={() => {
//                         setSelectedSubtype(subtype.id);
//                       }}
//                       className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-colors ${
//                         selectedSubtype === subtype.id ? 'bg-blue-100/90 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100/90'
//                       }`}
//                     >
//                       {subtype.icon}
//                       <span>{subtype.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {selectedType === 'customer' && (
//               <div className="mb-6 max-w-xs">
//                 <div className="relative group">
//                   <input
//                     type="text"
//                     id="modern-search"
//                     value={searchOption}
//                     onChange={(e) => setSearchOption(e.target.value)}
//                     onFocus={() => setShowSearchDropdown(true)}
//                     onBlur={() => setTimeout(() => setShowSearchDropdown(false), 100)}
//                     placeholder=" "
//                     className="block w-full px-12 py-3 text-base bg-white/90 border border-gray-200/90 rounded-2xl shadow focus:border-blue-500/90 focus:ring-2 focus:ring-blue-200/90 transition-all duration-150 peer"
//                     autoComplete="off"
//                   />
//                   <label
//                     htmlFor="modern-search"
//                     className="absolute left-12 top-1/4 -translate-y-1/2 text-gray-400 text-base pointer-events-none transition-all duration-150 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600/90 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 bg-white/90 px-1"
//                   >
//                     Search Organization or Desigination
//                   </label>
//                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                       <circle cx="11" cy="11" r="8" />
//                       <path d="M21 21l-4.35-4.35" />
//                     </svg>
//                   </span>
//                   {searchOption && (
//                     <button
//                       type="button"
//                       onClick={() => setSearchOption('')}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600/90 focus:outline-none bg-white/90 rounded-full p-1 shadow-sm"
//                       tabIndex={-1}
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   )}
//                   {showSearchDropdown && (
//                     <ul className="absolute z-20 w-full bg-white/90 border border-gray-200/90 rounded-2xl mt-2 shadow-xl animate-fadeIn overflow-hidden">
//                       {divisionOptions
//                         .filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase()))
//                         .map((opt) => (
//                           <li
//                             key={'division-' + opt}
//                             onMouseDown={() => {
//                               setSearchOption(opt);
//                               setShowSearchDropdown(false);
//                             }}
//                             className="px-4 py-3 cursor-pointer hover:bg-blue-50/90 border-b last:border-b-0 flex items-center gap-2"
//                           >
//                             <span className="inline-block w-2 h-2 rounded-full bg-blue-400/90 mr-2"></span>
//                             <span className="text-xs text-blue-600/90 font-semibold">Department</span>
//                             <span className="ml-2 text-gray-800">{opt}</span>
//                           </li>
//                         ))}
//                       {companyOptions
//                         .filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase()))
//                         .map((opt) => (
//                           <li
//                             key={'company-' + opt}
//                             onMouseDown={() => {
//                               setSearchOption(opt);
//                               setShowSearchDropdown(false);
//                             }}
//                             className="px-4 py-3 cursor-pointer hover:bg-green-50/90 border-b last:border-b-0 flex items-center gap-2"
//                           >
//                             <span className="inline-block w-2 h-2 rounded-full bg-green-400/90 mr-2"></span>
//                             <span className="text-xs text-green-600/90 font-semibold">Company</span>
//                             <span className="ml-2 text-gray-800">{opt}</span>
//                           </li>
//                         ))}
//                       {divisionOptions.filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase())).length ===
//                         0 &&
//                         companyOptions.filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase())).length ===
//                         0 && <li className="px-4 py-3 text-gray-400">No results found</li>}
//                     </ul>
//                   )}
//                 </div>
//               </div>
//             )}
            
//             {loading && <div className="text-center py-4 text-gray-500">Loading reports...</div>}
//             {error && <div className="text-center py-4 text-red-600">{error}</div>}

//             {!loading && !error && (
//               <>
//                 {selectedType === 'customer' ? (
//                   <div className="overflow-x-auto rounded-2xl shadow border border-gray-200/90 bg-white/90 mt-6">
//                     <table className="min-w-full divide-y divide-gray-200/90">
//                       <thead className="bg-gray-50/90">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Designation</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Organization</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Division</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email ID</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Remarks</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted By</th>
//                           <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white/90 divide-y divide-gray-100/90">
//                         {reports.length === 0 ? (
//                           <tr>
//                             <td colSpan={10} className="px-6 py-4 text-center text-gray-400">
//                               No customer reports found.
//                             </td>
//                           </tr>
//                         ) : (
//                           reports
//                             .filter((report) => {
//                               const searchLower = searchOption.toLowerCase();
//                               // Filter based on searchOption matching either organization or division
//                               return (
//                                 report.type === 'customer' &&
//                                 (!searchOption || 
//                                  report.organization?.toLowerCase().includes(searchLower) || 
//                                  report.division?.toLowerCase().includes(searchLower))
//                               );
//                             })
//                             .map((report) => (
//                             <tr key={report.id} className="hover:bg-blue-50/90 transition">
//                               <td className="px-6 py-4 text-sm text-gray-800">
//                                 {Array.isArray(report.date) ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(report.date[2]).padStart(2, '0')}` : report.date || '-'}
//                               </td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.customerName || '-'}</td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.designation || '-'}</td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.organization || '-'}</td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.division || '-'}</td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.landlineOrMobile || '-'}</td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.emailId || '-'}</td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.remarks || '-'}</td>
//                               <td className="px-6 py-4 text-sm text-gray-800">{report.employeeName || '-'}</td>
//                               <td className="px-6 py-4 text-right whitespace-nowrap">
//                                 <div className="flex items-center space-x-2">
//                                   {report.attachments && report.attachments.length > 0 && (
//                                     <button
//                                       onClick={() => window.open(`${BASE_URL}/${report.id}/view`, '_blank')}
//                                       className="p-2 text-blue-600 hover:bg-blue-100/90 rounded-lg"
//                                       title="View Report"
//                                     >
//                                       <Eye className="w-5 h-5" />
//                                     </button>
//                                   )}
//                                   <button
//                                     onClick={() => handleDeleteReport(report.id)}
//                                     className="p-2 text-red-600 hover:bg-red-100/90 rounded-lg"
//                                     title="Delete Report"
//                                   >
//                                     <Trash2 className="w-5 h-5" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200/90 p-6">
//                     <div className="space-y-4">
//                       {reports.length === 0 ? (
//                         <div className="text-center text-gray-500 py-8">No reports found for the selected filters.</div>
//                       ) : (
//                         reports
//                           .filter((report) => {
//                             if (selectedType === 'oem' && report.subtype === 'competitor_analysis') return false;
//                             return true;
//                           })
//                           .map((report) => (
//                             <div key={report.id} className="border rounded-lg p-4 bg-white/90 animate-fadeIn">
//                               <div className="flex flex-col sm:flex-row items-start justify-between">
//                                 <div className="flex items-start space-x-4 mb-4 sm:mb-0">
//                                   <div className="p-2 bg-blue-100/90 rounded-lg">{getReportIcon(report.type)}</div>
//                                   <div>
//                                     <h3 className="font-medium text-gray-900">{report.title}</h3>
//                                     <div className="mt-1 text-sm text-gray-600">
//                                       <p>Type: {reportTypes.find((t) => t.id === report.type)?.label}</p>
//                                       {report.type === 'employee' && report.subtype && (
//                                         <p>Subtype: {employeeSubtypes.find((s) => s.id === report.subtype)?.label}</p>
//                                       )}
//                                       {report.type === 'oem' && report.subtype && (
//                                         <p>Subtype: {oemSubtypes.find((s) => s.id === report.subtype)?.label || report.subtype}</p>
//                                       )}
//                                       <p>
//                                         Date:{' '}
//                                         {Array.isArray(report.date)
//                                           ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(
//                                               report.date[2]
//                                             ).padStart(2, '0')}`
//                                           : report.date}
//                                       </p>
//                                       <p>Submitted by: {report.employeeName || report.submittedBy}</p>
//                                       {report.approvedBy && (
//                                         <p>
//                                           Approved by: {report.approvedBy} on{' '}
//                                           {new Date(report.approvedDate!).toLocaleDateString()}
//                                         </p>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div className="flex items-center space-x-2 mt-4 sm:mt-0">
//                                   {report.attachments && report.attachments.length > 0 && (
//                                     <>
//                                       <button
//                                         onClick={() => {
//                                           console.log('Viewing report:', report.id, 'Attachments:', report.attachments);
//                                           window.open(`${BASE_URL}/${report.id}/view`, '_blank');
//                                         }}
//                                         className="p-2 text-blue-600 hover:bg-blue-100/90 rounded-lg"
//                                         title="View Report"
//                                       >
//                                         <Eye className="w-5 h-5" />
//                                       </button>
//                                     </>
//                                   )}
//                                   <button
//                                     onClick={() => handleDeleteReport(report.id)}
//                                     className="p-2 text-red-600 hover:bg-red-100/90 rounded-lg"
//                                     title="Delete Report"
//                                   >
//                                     <Trash2 className="w-5 h-5" />
//                                   </button>
//                                 </div>
//                               </div>
//                               {report.content && (
//                                 <div className="mt-4">
//                                   <div className="text-xs text-gray-500 mb-1">Content</div>
//                                   <div className="text-gray-700">
//                                     {typeof report.content === 'string' && report.content.trim() ? report.content : '-'}
//                                   </div>
//                                 </div>
//                               )}
//                               {report.type === 'oem' && report.subtype === 'orders' && (
//                                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//                                   {report.customerName && (
//                                     <div>
//                                       <span className="text-gray-500">Customer:</span> {report.customerName}
//                                     </div>
//                                   )}
//                                   {report.poNumber && (
//                                     <div>
//                                       <span className="text-gray-500">PO Number:</span> {report.poNumber}
//                                     </div>
//                                   )}
//                                   {report.item && (
//                                     <div>
//                                       <span className="text-gray-500">Item:</span> {report.item}
//                                     </div>
//                                   )}
//                                   {report.quantity && (
//                                     <div>
//                                       <span className="text-gray-500">Quantity:</span> {report.quantity}
//                                     </div>
//                                   )}
//                                   {report.totalPoValue && (
//                                     <div>
//                                       <span className="text-gray-500">Total PO Value:</span> {report.totalPoValue}
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           ))
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {selectedType === 'oem' && selectedSubtype === 'competitor_analysis' && (
//                   <div className="overflow-x-auto rounded-2xl shadow border border-gray-200/90 bg-white/90 mt-6">
//                     <table className="min-w-full divide-y divide-gray-200/90">
//                       <thead className="bg-gray-50/90">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sl. No.</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Item Description</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Competitor</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Model Number</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit Price</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted By</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee Name</th>
//                           <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Attachments</th>
//                           <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white/90 divide-y divide-gray-100/90">
//                         {reports.filter((r) => r.type === 'oem' && r.subtype === 'competitor_analysis').length === 0 ? (
//                           <tr>
//                             <td colSpan={11} className="px-6 py-4 text-center text-gray-400">
//                               No competitor analysis reports found.
//                             </td>
//                           </tr>
//                         ) : (
//                           reports
//                             .filter((r) => r.type === 'oem' && r.subtype === 'competitor_analysis')
//                             .map((report) => (
//                               <tr key={report.id} className="hover:bg-blue-50/90 transition">
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.slNo ?? '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.customerName || '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.itemDescription || '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.competitor || '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.modelNumber || '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.unitPrice || '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">
//                                   {Array.isArray(report.date)
//                                     ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(
//                                         report.date[2]
//                                       ).padStart(2, '0')}`
//                                     : report.date || '-'}
//                                 </td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.submittedBy || '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">{report.employeeName || '-'}</td>
//                                 <td className="px-6 py-4 text-sm text-gray-800">
//                                   {report.attachments && report.attachments.length > 0 ? (
//                                     <ul className="list-disc ml-4">
//                                       {report.attachments.map((att, idx) => (
//                                         <li key={idx}>
//                                           <a
//                                             href={`${BASE_URL}/${report.id}/view`}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="text-blue-600/90 underline hover:no-underline text-xs"
//                                           >
//                                             {report.originalFileName || att.split('/').pop()}
//                                           </a>
//                                         </li>
//                                       ))}
//                                     </ul>
//                                   ) : (
//                                     '-'
//                                   )}
//                                 </td>
//                                 <td className="px-6 py-4 text-right whitespace-nowrap">
//                                   <div className="flex items-center space-x-2">
//                                     {report.attachments && report.attachments.length > 0 && (
//                                       <>
//                                         <button
//                                           onClick={() => {
//                                             console.log('Viewing report:', report.id, 'Attachments:', report.attachments);
//                                             window.open(`${BASE_URL}/${report.id}/view`, '_blank');
//                                           }}
//                                           className="p-2 text-blue-600 hover:bg-blue-100/90 rounded-lg"
//                                           title="View Report"
//                                         >
//                                           <Eye className="w-5 h-5" />
//                                         </button>
//                                       </>
//                                     )}
//                                     <button
//                                       onClick={() => handleDeleteReport(report.id)}
//                                       className="p-2 text-red-600 hover:bg-red-100/90 rounded-lg"
//                                       title="Delete Report"
//                                     >
//                                       <Trash2 className="w-5 h-5" />
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//       {renderNewReportForm()}
//     </>
//   );
// }

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  FilePlus,
  Building,
  Users,
  Map,
  Target,
  Award,
  Calendar,
  Trash2,
  Upload,
  X,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface Report {
  id: number;
  type: 'employee' | 'visit' | 'oem' | 'customer' | 'blueprint' | 'projection' | 'achievement';
  subtype?: string;
  title: string;
  date: string | number[];
  status?: 'draft' | 'submitted' | 'approved' | null;
  content?: string | null;
  attachments?: string[] | null;
  submittedBy?: string;
  approvedBy?: string;
  approvedDate?: string;
  department?: string;
  employeeId?: string;
  employeeName?: string;
  customerName?: string;
  designation?: string;
  landlineOrMobile?: string;
  emailId?: string;
  remarks?: string;
  productOrRequirements?: string;
  division?: string;
  company?: string;
  poNumber?: string;
  orderDate?: string;
  item?: string;
  quantity?: string;
  partNumber?: string;
  xmwPrice?: string;
  unitTotalOrderValue?: string;
  totalPoValue?: string;
  xmwInvoiceRef?: string;
  xmwInvoiceDate?: string;
  nre?: string;
  quoteDate?: string;
  slNo?: number;
  itemDescription?: string;
  competitor?: string;
  modelNumber?: string;
  unitPrice?: string;
  quotationNumber?: string;
  productDescription?: string;
  xmwValue?: string;
  holdingProjectsList?: {
    customerName?: string;
    quotationNumber?: string;
    productDescription?: string;
    quantity?: string;
    xmwValue?: string;
  }[];
  originalFileName?: string;
  organization?: string;
}

const BASE_URL = APIURL + '/api/reports';

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedType, setSelectedType] = useState<string>('employee');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('all');
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [newReport, setNewReport] = useState<Partial<Report>>({
    type: 'employee',
    subtype: 'daily',
    title: '',
    content: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [customerReport, setCustomerReport] = useState({
    title: '',
    content: '',
    date: '',
    status: 'submitted',
    submittedBy: '',
    customerName: '',
    designation: '',
    landlineOrMobile: '',
    emailId: '',
    remarks: '',
    organization: '',
    productOrRequirements: '',
    division: '',
    company: '',
    attachments: [] as string[],
  });
  const [divisionOptions, setDivisionOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [searchOption, setSearchOption] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const reportTypes = [
    { id: 'employee', label: 'Employee Report', icon: <FileText className="w-5 h-5" /> },
    { id: 'visit', label: 'Visit Report', icon: <Map className="w-5 h-5" /> },
    { id: 'oem', label: 'OEM Report', icon: <Building className="w-5 h-5" /> },
    { id: 'customer', label: 'Customer Report', icon: <Users className="w-5 h-5" /> },
    { id: 'blueprint', label: 'Blueprint Report', icon: <FileText className="w-5 h-5" /> },
    { id: 'projection', label: 'Projection Report', icon: <Target className="w-5 h-5" /> },
    { id: 'achievement', label: 'Achievement Report', icon: <Award className="w-5 h-5" /> },
  ];

  const employeeSubtypes = [
    { id: 'daily', label: 'Daily Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'weekly', label: 'Weekly Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'monthly', label: 'Monthly Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'yearly', label: 'Yearly Report', icon: <Calendar className="w-5 h-5" /> },
  ];

  const oemSubtypes = [
    { id: 'orders', label: 'Orders' },
    { id: 'competitor_analysis', label: 'Competitor Analysis' },
    { id: 'open_tenders', label: 'Open Tenders' },
    { id: 'bugetary_submits', label: 'Bugetary Submits' },
    { id: 'lost_tenders', label: 'Lost Tenders' },
    { id: 'holding_projects', label: 'Holding Projects' },
  ];

  const validateFile = (file: File): string | null => {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return `File "${file.name}" is not allowed. Only PDF, DOC, DOCX, XLS, XLSX files are allowed.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum file size is 10MB.`;
    }

    return null;
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validationErrors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      toast.error('Some files were rejected. Please check the file types and sizes.');
      return;
    }

    setUploadedFiles(fileArray);
    setError(null);
  };

  const getReportIcon = (type: string) => {
    const reportType = reportTypes.find((t) => t.id === type);
    return reportType?.icon || <FileText className="w-5 h-5" />;
  };

  useEffect(() => {
    const id = sessionStorage.getItem('employeeId') || localStorage.getItem('employeeId');
    if (!id) {
      setError('Employee ID not found. Please login again.');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
      return;
    }
    setEmployeeId(id);
  }, [router]);

  useEffect(() => {
    fetch(`${APIURL}/api/reports/customer-divisions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDivisionOptions(data);
        else if (data && Array.isArray(data.divisions)) setDivisionOptions(data.divisions);
      })
      .catch(() => console.log('Failed to fetch divisions'));
    
    fetch(`${APIURL}/api/reports/customer-companies`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanyOptions(data);
        else if (data && Array.isArray(data.companies)) setCompanyOptions(data.companies);
      })
      .catch(() => console.log('Failed to fetch companies'));
  }, []);

  const fetchReports = useCallback(async () => {
    if (!employeeId) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${BASE_URL}/employee/${employeeId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allReports: Report[] = await response.json();
      let filteredReports = allReports;

      if (selectedType !== 'all') {
        filteredReports = filteredReports.filter((report) => report.type === selectedType);
      }

      if (selectedType === 'employee' && selectedSubtype !== 'all') {
        filteredReports = filteredReports.filter((report) => report.subtype === selectedSubtype);
      }

      setReports(filteredReports);
    } catch (e) {
      setError('Failed to fetch reports: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedSubtype, employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchReports();
    }
  }, [fetchReports, employeeId]);

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      
      const response = await fetch(`${APIURL}/api/reports/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed: ${errorText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!employeeId) {
      setError('Employee ID not found. Please login again.');
      return;
    }

    let uploadedFileUrls: string[] = [];
    if (uploadedFiles.length > 0) {
      try {
        const uploadResult = await uploadFiles(uploadedFiles);
        uploadedFileUrls = Array.isArray(uploadResult) ? uploadResult : [uploadResult];
      } catch (err: unknown) {
        setError(`Failed to upload files: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return;
      }
    }

    let reportData: Partial<Report>;

    if (newReport.type === 'oem') {
      reportData = {
        type: 'oem',
        subtype: newReport.subtype,
        submittedBy: employeeId,
        attachments: uploadedFileUrls,
        status: 'submitted',
        originalFileName: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
      };
      
      if (newReport.subtype === 'orders') {
        reportData = {
          ...reportData,
          title: 'Orders Report',
          content: 'Order details and information',
          poNumber: newReport.poNumber,
          orderDate: newReport.orderDate,
          item: newReport.item,
          quantity: newReport.quantity,
          partNumber: newReport.partNumber,
          xmwPrice: newReport.xmwPrice,
          unitTotalOrderValue: newReport.unitTotalOrderValue,
          totalPoValue: newReport.totalPoValue,
          customerName: newReport.customerName,
          xmwInvoiceRef: newReport.xmwInvoiceRef,
          xmwInvoiceDate: newReport.xmwInvoiceDate,
          nre: newReport.nre,
          quoteDate: newReport.quoteDate,
        };
      } else if (newReport.subtype === 'competitor_analysis') {
        reportData = {
          ...reportData,
          title: 'Competitor Analysis Report',
          content: 'Competitor analysis data',
          slNo: newReport.slNo,
          customerName: newReport.customerName,
          itemDescription: newReport.itemDescription,
          competitor: newReport.competitor,
          modelNumber: newReport.modelNumber,
          unitPrice: newReport.unitPrice,
        };
      } else {
        reportData = {
          ...reportData,
          title: newReport.title || 'OEM Report',
          content: newReport.content || 'OEM report data',
          customerName: newReport.customerName,
          quotationNumber: newReport.quotationNumber,
          productDescription: newReport.productDescription,
          quantity: newReport.quantity,
          xmwValue: newReport.xmwValue,
          remarks: newReport.remarks,
        };
      }
    } else if (newReport.type === 'customer') {
      if (
        !customerReport.date ||
        !customerReport.customerName ||
        !customerReport.designation ||
        !customerReport.landlineOrMobile ||
        !customerReport.emailId ||
        !customerReport.organization ||
        !customerReport.division
      ) {
        setError('Please fill all required fields for Customer Report.');
        return;
      }
      reportData = {
        type: 'customer',
        title: `Customer Report for ${customerReport.customerName} - ${customerReport.date}`,
        content: customerReport.content || 'Customer report data',
        date: customerReport.date,
        status: customerReport.status as 'draft' | 'submitted' | 'approved' | null,
        submittedBy: employeeId,
        customerName: customerReport.customerName,
        designation: customerReport.designation,
        landlineOrMobile: customerReport.landlineOrMobile,
        emailId: customerReport.emailId,
        remarks: customerReport.remarks,
        organization: customerReport.organization,
        division: customerReport.division,
        productOrRequirements: customerReport.productOrRequirements,
        attachments: uploadedFileUrls,
        originalFileName: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
      };
    } else {
      if (!newReport.content) {
        setError('Content is required.');
        return;
      }

      const selectedSubtypeLabel = employeeSubtypes.find((s) => s.id === newReport.subtype)?.label || newReport.subtype;
      reportData = {
        ...newReport,
        title: `${selectedSubtypeLabel} - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        status: newReport.status || 'submitted',
        submittedBy: employeeId,
        attachments: uploadedFileUrls,
        originalFileName: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
      };
    }

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create report: ${response.status}`);
      }

      const createdReport: Report = await response.json();
      setReports([createdReport, ...reports]);
      setShowNewReportForm(false);
      
      // Corrected reset logic
      setNewReport({
        type: 'employee',
        subtype: 'daily',
        title: '',
        content: '',
        status: 'draft',
      });
      setCustomerReport({
        title: '',
        content: '',
        date: '',
        status: 'submitted',
        submittedBy: '',
        customerName: '',
        designation: '',
        landlineOrMobile: '',
        emailId: '',
        remarks: '',
        organization: '',
        productOrRequirements: '',
        division: '',
        company: '',
        attachments: [],
      });
      setUploadedFiles([]);
      setError(null);
      toast.success('Report submitted successfully!');
    } catch (err: unknown) {
      setError(`Error submitting report: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error('Failed to submit report. Please try again later.');
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.status}`);
      }

      setReports(reports.filter((report) => report.id !== id));
      setError(null);
      toast.success('Report deleted successfully!');
    } catch (err: unknown) {
      setError(`Error deleting report: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error('Failed to delete report. Please try again later.');
    }
  };

  const renderNewReportForm = () => {
    if (!showNewReportForm) return null;
    
    if (newReport.type === 'oem') {
      return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/90 rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50/90 rounded-xl">
                  <FilePlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Create OEM Report</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your OEM report</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewReportForm(false);
                  setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                  setUploadedFiles([]);
                  setError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/90 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">OEM Report Subtype</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={oemSubtypes.some((s) => s.id === (newReport.subtype || '')) ? newReport.subtype || '' : ''}
                    onChange={(e) => setNewReport({ ...newReport, subtype: e.target.value })}
                    className="w-full sm:w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white/90 pr-10 py-2.5"
                  >
                    <option value="">-- Select Subtype --</option>
                    {oemSubtypes.map((subtype) => (
                      <option key={subtype.id} value={subtype.id}>
                        {subtype.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={oemSubtypes.some((s) => s.id === (newReport.subtype || '')) ? '' : newReport.subtype || ''}
                    onChange={(e) => setNewReport({ ...newReport, subtype: e.target.value })}
                    placeholder="Or enter new subtype"
                    className="w-full sm:w-1/2 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 bg-white/90"
                  />
                </div>
              </div>

              {newReport.subtype === 'orders' && (
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'PO Number', key: 'poNumber', type: 'text' },
                      { label: 'Order Date', key: 'orderDate', type: 'date' },
                      { label: 'Item', key: 'item', type: 'text' },
                      { label: 'Quantity', key: 'quantity', type: 'text' },
                      { label: 'Part Number', key: 'partNumber', type: 'text' },
                      { label: 'XMW Price', key: 'xmwPrice', type: 'text' },
                      { label: 'Unit Total Order Value', key: 'unitTotalOrderValue', type: 'text' },
                      { label: 'Total PO Value', key: 'totalPoValue', type: 'text' },
                      { label: 'Customer Name', key: 'customerName', type: 'text' },
                      { label: 'XMW Invoice Ref', key: 'xmwInvoiceRef', type: 'text' },
                      { label: 'XMW Invoice Date', key: 'xmwInvoiceDate', type: 'date' },
                      { label: 'NRE', key: 'nre', type: 'text' },
                      { label: 'Quote Date', key: 'quoteDate', type: 'date' },
                    ].map((field) => (
                      <div key={field.key} className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                        <input
                          type={field.type}
                          value={
                            typeof newReport[field.key as keyof typeof newReport] === 'string'
                              ? (newReport[field.key as keyof typeof newReport] as string)
                              : typeof newReport[field.key as keyof typeof newReport] === 'number'
                              ? String(newReport[field.key as keyof typeof newReport])
                              : ''
                          }
                          onChange={(e) => setNewReport({ ...newReport, [field.key]: e.target.value })}
                          className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newReport.subtype === 'competitor_analysis' && (
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sl. No.</label>
                      <input
                        type="number"
                        value={newReport.slNo || ''}
                        onChange={(e) => setNewReport({ ...newReport, slNo: Number(e.target.value) })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                      <input
                        type="text"
                        value={newReport.customerName || ''}
                        onChange={(e) => setNewReport({ ...newReport, customerName: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Item Description</label>
                      <input
                        type="text"
                        value={newReport.itemDescription || ''}
                        onChange={(e) => setNewReport({ ...newReport, itemDescription: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Competitor</label>
                      <input
                        type="text"
                        value={newReport.competitor || ''}
                        onChange={(e) => setNewReport({ ...newReport, competitor: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model Number</label>
                      <input
                        type="text"
                        value={newReport.modelNumber || ''}
                        onChange={(e) => setNewReport({ ...newReport, modelNumber: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                      <input
                        type="text"
                        value={newReport.unitPrice || ''}
                        onChange={(e) => setNewReport({ ...newReport, unitPrice: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newReport.type === 'oem' &&
                ['holding_projects', 'open_tenders', 'bugetary_submits', 'lost_tenders'].includes(
                  newReport.subtype || ''
                ) && (
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                      <input
                        type="text"
                        value={newReport.customerName || ''}
                        onChange={(e) => setNewReport({ ...newReport, customerName: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quotation Number</label>
                      <input
                        type="text"
                        value={newReport.quotationNumber || ''}
                        onChange={(e) => setNewReport({ ...newReport, quotationNumber: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Description</label>
                      <input
                        type="text"
                        value={newReport.productDescription || ''}
                        onChange={(e) => setNewReport({ ...newReport, productDescription: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="text"
                        value={newReport.quantity || ''}
                        onChange={(e) => setNewReport({ ...newReport, quantity: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">XMW Value</label>
                      <input
                        type="text"
                        value={newReport.xmwValue || ''}
                        onChange={(e) => setNewReport({ ...newReport, xmwValue: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Remarks</label>
                      <input
                        type="text"
                        value={newReport.remarks || ''}
                        onChange={(e) => setNewReport({ ...newReport, remarks: e.target.value })}
                        className="w-full rounded-lg border-gray-200/90 shadow-sm py-2.5 mt-1 bg-white/90"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Attachments</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFileSelection(e.target.files)}
                    className="hidden"
                    id="file-upload-oem"
                  />
                  <label
                    htmlFor="file-upload-oem"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </label>
                  <span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX up to 10MB each</span>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50/90 p-2 rounded-lg">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => {
                            const newFiles = uploadedFiles.filter((_, i) => i !== index);
                            setUploadedFiles(newFiles);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <div className="text-blue-600">Uploading files...</div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50/90 border border-red-200/90 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/90">
                <button
                  onClick={() => {
                    setShowNewReportForm(false);
                    setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                    setUploadedFiles([]);
                    setError(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100/90 rounded-xl hover:bg-gray-200/90 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={uploading}
                  className="px-6 py-2.5 text-white bg-blue-600/90 rounded-xl hover:bg-blue-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/90 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (newReport.type === 'customer') {
      const maxWords = 1000;
      const wordCount = customerReport.content?.trim().split(/\s+/).filter((word) => word.length > 0).length || 0;
      const remainingWords = maxWords - wordCount;
      
      return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/90 rounded-2xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50/90 rounded-xl">
                  <FilePlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Create Customer Report</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details below to create your customer report</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewReportForm(false);
                  setCustomerReport({
                    title: '',
                    content: '',
                    date: '',
                    status: 'submitted',
                    submittedBy: '',
                    customerName: '',
                    designation: '',
                    landlineOrMobile: '',
                    emailId: '',
                    remarks: '',
                    organization: '',
                    productOrRequirements: '',
                    division: '',
                    company: '',
                    attachments: [],
                  });
                  setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                  setUploadedFiles([]);
                  setError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/90 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    value={customerReport.date}
                    onChange={(e) => setCustomerReport({ ...customerReport, date: e.target.value })}
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                  <input
                    type="text"
                    value={customerReport.customerName}
                    onChange={(e) => setCustomerReport({ ...customerReport, customerName: e.target.value })}
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Designation *</label>
                  <input
                    type="text"
                    value={customerReport.designation}
                    onChange={(e) => setCustomerReport({ ...customerReport, designation: e.target.value })}
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact *</label>
                  <input
                    type="text"
                    value={customerReport.landlineOrMobile}
                    onChange={(e) => setCustomerReport({ ...customerReport, landlineOrMobile: e.target.value })}
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email ID *</label>
                  <input
                    type="email"
                    value={customerReport.emailId}
                    onChange={(e) => setCustomerReport({ ...customerReport, emailId: e.target.value })}
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Organization *</label>
                  <input
                    type="text"
                    value={customerReport.organization}
                    onChange={(e) => setCustomerReport({ ...customerReport, organization: e.target.value })}
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Department (Division) *</label>
                  <input
                    type="text"
                    value={customerReport.division}
                    onChange={(e) => setCustomerReport({ ...customerReport, division: e.target.value })}
                    placeholder=""
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
                {/* New field: Product or Requirements */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Product or Requirements</label>
                  <input
                    type="text"
                    value={customerReport.productOrRequirements}
                    onChange={(e) => setCustomerReport({ ...customerReport, productOrRequirements: e.target.value })}
                    className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <input
                  type="text"
                  value={customerReport.remarks}
                  onChange={(e) => setCustomerReport({ ...customerReport, remarks: e.target.value })}
                  className="w-full rounded-xl border-gray-200/90 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5 bg-white/90"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Attachments(Optional)</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFileSelection(e.target.files)}
                    className="hidden"
                    id="file-upload-customer"
                  />
                  <label
                    htmlFor="file-upload-customer"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </label>
                  <span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX up to 10MB each</span>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50/90 p-2 rounded-lg">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => {
                            const newFiles = uploadedFiles.filter((_, i) => i !== index);
                            setUploadedFiles(newFiles);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <div className="text-blue-600">Uploading files...</div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50/90 border border-red-200/90 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/90">
                <button
                  onClick={() => {
                    setShowNewReportForm(false);
                    setCustomerReport({
                      title: '',
                      content: '',
                      date: '',
                      status: 'submitted',
                      submittedBy: '',
                      customerName: '',
                      designation: '',
                      landlineOrMobile: '',
                      emailId: '',
                      remarks: '',
                      organization: '',
                      productOrRequirements: '',
                      division: '',
                      company: '',
                      attachments: [],
                    });
                    setNewReport({ type: 'employee', subtype: 'daily', title: '', content: '', status: 'draft' });
                    setUploadedFiles([]);
                    setError(null);
                  }}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100/90 rounded-xl hover:bg-gray-200/90 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={uploading}
                  className="px-6 py-2.5 text-white bg-blue-600/90 rounded-xl hover:bg-blue-700/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/90 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const maxWords = 1000;
    const wordCount = newReport.content?.trim().split(/\s+/).filter((word) => word.length > 0).length || 0;
    const remainingWords = maxWords - wordCount;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl transform transition-all animate-slideIn border border-gray-100">
          
          <div className="flex justify-between items-start pb-6 border-b border-gray-200 mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FilePlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Create New Report</h2>
                <p className="text-sm text-gray-500 mt-1">Submit your {reportTypes.find(t => t.id === newReport.type)?.label || 'General'} report details below.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowNewReportForm(false);
                setNewReport({
                  type: 'employee',
                  subtype: 'daily',
                  title: '',
                  content: '',
                  status: 'draft',
                });
                setUploadedFiles([]);
                setError(null);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close form"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="report-type-select">Report Type</label>
                <div className="relative">
                  <select
                    id="report-type-select"
                    value={newReport.type}
                    onChange={(e) => {
                      const type = e.target.value as Report['type'];
                      setNewReport({
                        ...newReport,
                        type,
                        subtype: type === 'employee' ? newReport.subtype : undefined,
                      });
                    }}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white py-2.5 pr-10"
                  >
                    {reportTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {newReport.type === 'employee' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="report-subtype-select">Report Subtype</label>
                  <div className="relative">
                    <select
                      id="report-subtype-select"
                      value={newReport.subtype || 'daily'}
                      onChange={(e) => setNewReport({ ...newReport, subtype: e.target.value as Report['subtype'] })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors appearance-none bg-white py-2.5 pr-10"
                    >
                      {employeeSubtypes.map((subtype) => (
                        <option key={subtype.id} value={subtype.id}>
                          {subtype.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700" htmlFor="report-content">Content <span className="text-red-500">*</span></label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 font-mono">{wordCount} words</span>
                  <span className={`text-xs font-mono ${remainingWords < 100 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    ({remainingWords} remaining)
                  </span>
                </div>
              </div>
              <textarea
                id="report-content"
                value={newReport.content ?? ''}
                onChange={(e) => {
                  const text = e.target.value;
                  const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
                  if (words.length <= maxWords) {
                    setNewReport({ ...newReport, content: text });
                  }
                }}
                rows={8}
                placeholder={`Write your ${reportTypes.find(t => t.id === newReport.type)?.label.toLowerCase() || 'report'} content here (max 1000 words)`}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors resize-none py-2.5 px-3 bg-white"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => handleFileSelection(e.target.files)}
                  className="hidden"
                  id="file-upload-employee"
                />
                <label
                  htmlFor="file-upload-employee"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Files
                </label>
                <span className="text-xs text-gray-500">Allowed: PDF, DOC(X), XLS(X). Max: 10MB each.</span>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">Selected Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-white border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-800 truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          const newFiles = uploadedFiles.filter((_, i) => i !== index);
                          setUploadedFiles(newFiles);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                        aria-label={`Remove file ${file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploading && (
                <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-blue-600 font-medium">Uploading files...</div>
                </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 mt-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mr-3" />
                  <div className="text-red-700 text-sm whitespace-pre-line font-medium">{error}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleSubmitReport}
              disabled={!newReport.content || wordCount === 0 || uploading}
              className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {uploading ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              onClick={() => {
                setShowNewReportForm(false);
                setNewReport({
                  type: 'employee',
                  subtype: 'daily',
                  title: '',
                  content: '',
                  status: 'draft',
                });
                setUploadedFiles([]);
                setError(null);
              }}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const styles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-transparent py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Toaster position="top-right" />

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Reports</h1>
              <button
                onClick={() => {
                  setShowNewReportForm(true);
                  // Correct reset for customer report state on new form open
                  setCustomerReport({
                    title: '',
                    content: '',
                    date: '',
                    status: 'submitted',
                    submittedBy: '',
                    customerName: '',
                    designation: '',
                    landlineOrMobile: '',
                    emailId: '',
                    remarks: '',
                    organization: '',
                    productOrRequirements: '',
                    division: '',
                    company: '',
                    attachments: [],
                  });
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700/90 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/90 focus:ring-offset-2 w-full sm:w-auto justify-center group"
              >
                <FilePlus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12 duration-200" />
                <span>New Report</span>
              </button>
            </div>

            <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200/90 p-4">
              <div className="flex flex-wrap gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setSelectedSubtype('all');
                    }}
                    className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-colors ${
                      selectedType === type.id ? 'bg-blue-100/90 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100/90'
                    }`}
                  >
                    {type.icon}
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedType === 'employee' && (
              <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200/90 p-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubtype('all');
                    }}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      selectedSubtype === 'all' ? 'bg-blue-100/90 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100/90'
                    }`}
                  >
                    All Employee Reports
                  </button>
                  {employeeSubtypes.map((subtype) => (
                    <button
                      key={subtype.id}
                      onClick={() => {
                        setSelectedSubtype(subtype.id);
                      }}
                      className={`px-3 py-1 rounded-lg flex items-center space-x-2 transition-colors ${
                        selectedSubtype === subtype.id ? 'bg-blue-100/90 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100/90'
                      }`}
                    >
                      {subtype.icon}
                      <span>{subtype.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === 'customer' && (
              <div className="mb-6 max-w-xs">
                <div className="relative group">
                  <input
                    type="text"
                    id="modern-search"
                    value={searchOption}
                    onChange={(e) => setSearchOption(e.target.value)}
                    onFocus={() => setShowSearchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 100)}
                    placeholder=" "
                    className="block w-full px-12 py-3 text-base bg-white/90 border border-gray-200/90 rounded-2xl shadow focus:border-blue-500/90 focus:ring-2 focus:ring-blue-200/90 transition-all duration-150 peer"
                    autoComplete="off"
                  />
                  <label
                    htmlFor="modern-search"
                    className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none transition-all duration-150 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600/90 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 bg-white/90 px-1"
                  >
                    Search Department or Company
                  </label>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </span>
                  {searchOption && (
                    <button
                      type="button"
                      onClick={() => setSearchOption('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600/90 focus:outline-none bg-white/90 rounded-full p-1 shadow-sm"
                      tabIndex={-1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {showSearchDropdown && (
                    <ul className="absolute z-20 w-full bg-white/90 border border-gray-200/90 rounded-2xl mt-2 shadow-xl animate-fadeIn overflow-hidden">
                      {divisionOptions
                        .filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase()))
                        .map((opt) => (
                          <li
                            key={'division-' + opt}
                            onMouseDown={() => {
                              setSearchOption(opt);
                              setShowSearchDropdown(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-blue-50/90 border-b last:border-b-0 flex items-center gap-2"
                          >
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-400/90 mr-2"></span>
                            <span className="text-xs text-blue-600/90 font-semibold">Department</span>
                            <span className="ml-2 text-gray-800">{opt}</span>
                          </li>
                        ))}
                      {companyOptions
                        .filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase()))
                        .map((opt) => (
                          <li
                            key={'company-' + opt}
                            onMouseDown={() => {
                              setSearchOption(opt);
                              setShowSearchDropdown(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-green-50/90 border-b last:border-b-0 flex items-center gap-2"
                          >
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400/90 mr-2"></span>
                            <span className="text-xs text-green-600/90 font-semibold">Company</span>
                            <span className="ml-2 text-gray-800">{opt}</span>
                          </li>
                        ))}
                      {divisionOptions.filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase())).length ===
                        0 &&
                        companyOptions.filter((opt) => opt.toLowerCase().includes(searchOption.toLowerCase())).length ===
                        0 && <li className="px-4 py-3 text-gray-400">No results found</li>}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            {loading && <div className="text-center py-4 text-gray-500">Loading reports...</div>}
            {error && <div className="text-center py-4 text-red-600">{error}</div>}

            {!loading && !error && (
              <>
                {selectedType === 'employee' ? (
                  <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200/90 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reports.length === 0 ? (
                        <div className="text-center text-gray-500 py-8 col-span-2">No employee reports found for the selected filters.</div>
                      ) : (
                        reports
                          .filter((report) => report.type === 'employee')
                          .map((report) => (
                            <div
                              key={report.id}
                              className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-blue-50/90 to-white/90 shadow-sm animate-fadeIn"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start space-x-3">
                                  <div className="p-2 bg-blue-100/90 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{report.title}</h3>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {report.subtype && <p>Subtype: {employeeSubtypes.find(s => s.id === report.subtype)?.label}</p>}
                                      {Array.isArray(report.date) ? (
                                        <p>Date: {`${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(report.date[2]).padStart(2, '0')}`}</p>
                                      ) : (
                                        <p>Date: {report.date}</p>
                                      )}
                                      <p>Submitted by: {report.employeeName || report.submittedBy}</p>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="p-2 text-red-600 hover:bg-red-100/90 rounded-lg transition-colors"
                                  title="Delete Report"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Content</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {report.content && typeof report.content === 'string' && report.content.trim() ? report.content : '-'}
                                </p>
                              </div>
                            </div>
                        ))
                    )}
                    </div>
                  </div>
                ) : selectedType === 'customer' ? (
                  <div className="overflow-x-auto rounded-2xl shadow border border-gray-200/90 bg-white/90 mt-6">
                    <table className="min-w-full divide-y divide-gray-200/90">
                      <thead className="bg-gray-50/90">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Designation</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Organization</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Division</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Remarks</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted By</th>
                          <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/90 divide-y divide-gray-100/90">
                        {reports.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-6 py-4 text-center text-gray-400">
                              No customer reports found.
                            </td>
                          </tr>
                        ) : (
                          reports
                            .filter((report) => {
                              const searchLower = searchOption.toLowerCase();
                              return (
                                report.type === 'customer' &&
                                (!searchOption || 
                                 report.organization?.toLowerCase().includes(searchLower) || 
                                 report.division?.toLowerCase().includes(searchLower))
                              );
                            })
                            .map((report) => (
                            <tr key={report.id} className="hover:bg-blue-50/90 transition">
                              <td className="px-6 py-4 text-sm text-gray-800">
                                {Array.isArray(report.date) ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(report.date[2]).padStart(2, '0')}` : report.date || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.customerName || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.designation || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.organization || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.division || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.landlineOrMobile || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.emailId || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.remarks || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-800">{report.employeeName || '-'}</td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {report.attachments && report.attachments.length > 0 && (
                                    <button
                                      onClick={() => window.open(`${BASE_URL}/${report.id}/view`, '_blank')}
                                      className="p-2 text-blue-600 hover:bg-blue-100/90 rounded-lg"
                                      title="View Report"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReport(report.id)}
                                    className="p-2 text-red-600 hover:bg-red-100/90 rounded-lg"
                                    title="Delete Report"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-lg shadow-sm border border-gray-200/90 p-6">
                    <div className="space-y-4">
                      {reports.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No reports found for the selected filters.</div>
                      ) : (
                        reports
                          .filter((report) => {
                            if (selectedType === 'oem' && report.subtype === 'competitor_analysis') return false;
                            return true;
                          })
                          .map((report) => (
                            <div key={report.id} className="border rounded-lg p-4 bg-white/90 animate-fadeIn">
                              <div className="flex flex-col sm:flex-row items-start justify-between">
                                <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                                  <div className="p-2 bg-blue-100/90 rounded-lg">{getReportIcon(report.type)}</div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                                    <div className="mt-1 text-sm text-gray-600">
                                      <p>Type: {reportTypes.find((t) => t.id === report.type)?.label}</p>
                                      {report.type === 'employee' && report.subtype && (
                                        <p>Subtype: {oemSubtypes.find((s) => s.id === report.subtype)?.label}</p>
                                      )}
                                      {report.type === 'oem' && report.subtype && (
                                        <p>Subtype: {oemSubtypes.find((s) => s.id === report.subtype)?.label || report.subtype}</p>
                                      )}
                                      <p>
                                        Date:{' '}
                                        {Array.isArray(report.date)
                                          ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(
                                              report.date[2]
                                            ).padStart(2, '0')}`
                                          : report.date}
                                      </p>
                                      <p>Submitted by: {report.employeeName || report.submittedBy}</p>
                                      {report.approvedBy && (
                                        <p>
                                          Approved by: {report.approvedBy} on{' '}
                                          {new Date(report.approvedDate!).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                  {report.attachments && report.attachments.length > 0 && (
                                    <>
                                      <button
                                        onClick={() => {
                                          console.log('Viewing report:', report.id, 'Attachments:', report.attachments);
                                          window.open(`${BASE_URL}/${report.id}/view`, '_blank');
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-100/90 rounded-lg"
                                        title="View Report"
                                      >
                                        <Eye className="w-5 h-5" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReport(report.id)}
                                    className="p-2 text-red-600 hover:bg-red-100/90 rounded-lg"
                                    title="Delete Report"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                              {report.content && (
                                <div className="mt-4">
                                  <div className="text-xs text-gray-500 mb-1">Content</div>
                                  <div className="text-gray-700">
                                    {typeof report.content === 'string' && report.content.trim() ? report.content : '-'}
                                  </div>
                                </div>
                              )}
                              {report.type === 'oem' && report.subtype === 'orders' && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  {report.customerName && (
                                    <div>
                                      <span className="text-gray-500">Customer:</span> {report.customerName}
                                    </div>
                                  )}
                                  {report.poNumber && (
                                    <div>
                                      <span className="text-gray-500">PO Number:</span> {report.poNumber}
                                    </div>
                                  )}
                                  {report.item && (
                                    <div>
                                      <span className="text-gray-500">Item:</span> {report.item}
                                    </div>
                                  )}
                                  {report.quantity && (
                                    <div>
                                      <span className="text-gray-500">Quantity:</span> {report.quantity}
                                    </div>
                                  )}
                                  {report.totalPoValue && (
                                    <div>
                                      <span className="text-gray-500">Total PO Value:</span> {report.totalPoValue}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}

                {selectedType === 'oem' && selectedSubtype === 'competitor_analysis' && (
                  <div className="overflow-x-auto rounded-2xl shadow border border-gray-200/90 bg-white/90 mt-6">
                    <table className="min-w-full divide-y divide-gray-200/90">
                      <thead className="bg-gray-50/90">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sl. No.</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Item Description</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Competitor</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Model Number</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit Price</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Submitted By</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Attachments</th>
                          <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/90 divide-y divide-gray-100/90">
                        {reports.filter((r) => r.type === 'oem' && r.subtype === 'competitor_analysis').length === 0 ? (
                          <tr>
                            <td colSpan={11} className="px-6 py-4 text-center text-gray-400">
                              No competitor analysis reports found.
                            </td>
                          </tr>
                        ) : (
                          reports
                            .filter((r) => r.type === 'oem' && r.subtype === 'competitor_analysis')
                            .map((report) => (
                              <tr key={report.id} className="hover:bg-blue-50/90 transition">
                                <td className="px-6 py-4 text-sm text-gray-800">{report.slNo ?? '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">{report.customerName || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">{report.itemDescription || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">{report.competitor || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">{report.modelNumber || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">{report.unitPrice || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">
                                  {Array.isArray(report.date)
                                    ? `${report.date[0]}-${String(report.date[1]).padStart(2, '0')}-${String(
                                        report.date[2]
                                      ).padStart(2, '0')}`
                                    : report.date || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-800">{report.submittedBy || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">{report.employeeName || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-800">
                                  {report.attachments && report.attachments.length > 0 ? (
                                    <ul className="list-disc ml-4">
                                      {report.attachments.map((att, idx) => (
                                        <li key={idx}>
                                          <a
                                            href={`${BASE_URL}/${report.id}/view`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600/90 underline hover:no-underline text-xs"
                                          >
                                            {report.originalFileName || att.split('/').pop()}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    {report.attachments && report.attachments.length > 0 && (
                                      <>
                                        <button
                                          onClick={() => {
                                            console.log('Viewing report:', report.id, 'Attachments:', report.attachments);
                                            window.open(`${BASE_URL}/${report.id}/view`, '_blank');
                                          }}
                                          className="p-2 text-blue-600 hover:bg-blue-100/90 rounded-lg"
                                          title="View Report"
                                        >
                                          <Eye className="w-5 h-5" />
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => handleDeleteReport(report.id)}
                                      className="p-2 text-red-600 hover:bg-red-100/90 rounded-lg"
                                      title="Delete Report"
                                    >
                                      <Trash2 className="w-5 h-5" />
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
              </>
            )}
          </div>
        </div>
      </div>
      {renderNewReportForm()}
    </>
  );
}