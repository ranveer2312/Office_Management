'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { File, Upload, Search, Filter, Download, X, User, FileText, CreditCard, Briefcase, GraduationCap, LucideIcon, Eye, Edit } from 'lucide-react';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface Document {
	id: number;
	employeeId: string;
	documentType: string;
	fileName: string;
	fileDownloadUri: string;
	fileType: string;
	size: number;
	originalFileName?: string;
}

interface DocumentType {
	id: string;
	name: string;
	icon: LucideIcon;
	color: 'blue' | 'green' | 'purple' | 'orange';
}

interface ApiDocument {
	id: number;
	employeeId: string;
	documentType?: string;
	fileName?: string;
	fileDownloadUri?: string;
	fileType?: string;
	size?: number;
	originalFileName?: string;
}

// Helper: marks subcategory ids (moved to top-level scope)
const marksSubcategories: { id: string; name: string }[] = [
	{ id: 'marks_10th', name: '10th Marks Card' },
	{ id: 'marks_pu', name: 'PU Marks Card' },
	{ id: 'marks_degree', name: 'Degree Marks Card' },
	{ id: 'marks_pg', name: 'PG Marks Card' },
];

// FIX: Removed explicit type annotation and added 'as const' to resolve ESLint error
const documentTypes = [
	{ id: 'resume', name: 'Resume', icon: FileText, color: 'blue' },
	// Used 'as const' here to correctly type the color literal during mapping
	...marksSubcategories.map(sub => ({ ...sub, icon: GraduationCap, color: 'green' as const })),
	{ id: 'marks_card', name: 'Marks Card', icon: GraduationCap, color: 'green' }, // Parent category
	{ id: 'id_adhar', name: 'Aadhar Card', icon: CreditCard, color: 'purple' },
	{ id: 'id_pan', name: 'PAN Card', icon: CreditCard, color: 'purple' },
	{ id: 'offer', name: 'Offer Letter', icon: Briefcase, color: 'orange' },
	{ id: 'account', name: 'Account Details', icon: CreditCard, color: 'blue' },
	{ id: 'payslip', name: 'Payslip', icon: FileText, color: 'orange' },
	{ id: 'experience', name: 'Experience Letter', icon: Briefcase, color: 'green' },
	{ id: 'photo', name: 'Photo', icon: User, color: 'purple' },
	{ id: 'relieving', name: 'Relieving Letter', icon: Briefcase, color: 'blue' },
] as const;

// Helper function signature updated to cast the constant array back to the expected type for runtime usage
const getDocumentIcon = (type: string): LucideIcon => {
	if (!type) return File;
	// Cast for runtime usage of find()
	const docType = (documentTypes as unknown as DocumentType[]).find(dt => dt.id.toLowerCase() === type.toLowerCase());
	return docType ? docType.icon : File;
};

// Helper function signature updated to cast the constant array back to the expected type for runtime usage
const getDocumentColorClasses = (type: string) => {
	if (!type) return { bg: 'bg-gray-100', text: 'text-gray-600' };
	// Cast for runtime usage of find()
	const docType = (documentTypes as unknown as DocumentType[]).find(dt => dt.id.toLowerCase() === type.toLowerCase());
	if (!docType) return { bg: 'bg-gray-100', text: 'text-gray-600' };

	const colorMap: Record<DocumentType['color'], { bg: string; text: string }> = {
		blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
		green: { bg: 'bg-green-100', text: 'text-green-600' },
		purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
		orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
	};

	return colorMap[docType.color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

export default function DocumentsPage() {
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [selectedDocType, setSelectedDocType] = useState('');
	const [employeeId, setEmployeeId] = useState('');
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingDocument, setEditingDocument] = useState<Document | null>(null);
	const [editFile, setEditFile] = useState<File | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editError, setEditError] = useState<string | null>(null);
	const [editForm, setEditForm] = useState({
		fileName: '',
		originalFileName: '',
		employeeId: '',
		documentType: '',
	});
	const [showAllCategories, setShowAllCategories] = useState(false);
	const [showMarksSubcategories, setShowMarksSubcategories] = useState(false);

	// Use useCallback to memoize the fetchDocuments function
	const fetchDocuments = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await fetch(APIURL + '/api/hr/documents');

			if (!response.ok) {
				throw new Error('Failed to fetch documents');
			}

			const data: ApiDocument[] = await response.json();

			const transformedDocuments: Document[] = data.map((doc) => ({
				id: doc.id,
				employeeId: doc.employeeId,
				documentType: doc.documentType?.toLowerCase() || '',
				fileName: doc.fileName || '',
				fileDownloadUri: doc.fileDownloadUri || '',
				fileType: doc.fileType || '',
				size: doc.size || 0,
				originalFileName: doc.originalFileName,
			}));

			setDocuments(transformedDocuments);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Failed to fetch documents');
		} finally {
			setIsLoading(false);
		}
	}, []); // Empty dependency array means this function is created once

	useEffect(() => {
		fetchDocuments();
	}, [fetchDocuments]); // Call the memoized function

	const filteredDocuments = documents.filter(doc => {
		if (!doc) return false;
		const matchesCategory = selectedCategory === 'all' ||
			(doc.documentType && doc.documentType.toLowerCase() === selectedCategory);
		const matchesSearch =
			(doc.originalFileName && doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(doc.employeeId && doc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		setSelectedFiles(files);
	};

	const handleUploadSubmit = async () => {
		setUploadError(null);
		if (!selectedFiles || selectedFiles.length === 0 || !selectedDocType || !employeeId) {
			setUploadError('All fields are required.');
			toast.error('All fields are required.');
			return;
		}

		setIsUploading(true);
		try {
			// Loop through each selected file and upload individually
			for (const file of Array.from(selectedFiles)) {
				const formData = new FormData();
				formData.append('file', file);
				const response = await fetch(APIURL + `/api/hr/upload/${selectedDocType.toUpperCase()}/${employeeId}`, {
					method: 'POST',
					body: formData,
				});

				if (!response.ok) {
					throw new Error(`Failed to upload document: ${file.name}`);
				}
			}

			await fetchDocuments();
			setShowUploadModal(false);
			setSelectedDocType('');
			setEmployeeId('');
			setSelectedFiles(null);
			toast.success('Documents uploaded successfully');
		} catch (error) {
			setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
			toast.error(error instanceof Error ? error.message : 'Failed to upload document');
		} finally {
			setIsUploading(false);
		}
	};

	const handleDownloadDocument = async (document: Document) => {
		try {
			const response = await fetch(document.fileDownloadUri);
			if (!response.ok) {
				throw new Error('Failed to download document');
			}
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = window.document.createElement('a');
			link.href = url;
			link.download = document.originalFileName || document.fileName;
			window.document.body.appendChild(link);
			link.click();
			window.document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading document:', error);
			toast.error('Failed to download document. Please try again.');
		}
	};

	const handleViewDocument = (document: Document) => {
		if (document.fileDownloadUri) {
			window.open(document.fileDownloadUri, '_blank');
		} else {
			toast.error('Document URL is not available.');
		}
	};

	const handleDeleteDocument = (document: Document) => {
		setDocumentToDelete(document);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (documentToDelete) {
			try {
				const response = await fetch(APIURL + `/api/hr/documents/${documentToDelete.id}`, {
					method: 'DELETE',
				});
				if (!response.ok) {
					throw new Error('Failed to delete document');
				}
				await fetchDocuments();
				setShowDeleteModal(false);
				setDocumentToDelete(null);
				toast.success('Document deleted successfully');
			} catch (error) {
				setError(error instanceof Error ? error.message : 'Failed to delete document');
				toast.error(error instanceof Error ? error.message : 'Failed to delete document');
			}
		}
	};

	const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] || null;
		setEditFile(file);
	};

	const openEditModal = (doc: Document) => {
		setEditingDocument(doc);
		setEditFile(null);
		setEditError(null);
		setEditForm({
			fileName: doc.fileName,
			originalFileName: doc.originalFileName || '',
			employeeId: doc.employeeId,
			documentType: doc.documentType,
		});
		setShowEditModal(true);
	};

	const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleEditSubmit = async () => {
		setEditError(null);
		// You can't update metadata without a file on the current backend.
		// The `editFile` must exist for the PUT request to be valid.
		if (!editingDocument || !editFile || !editForm.employeeId || !editForm.documentType) {
			setEditError('To edit, you must select a new file and provide an Employee ID and Document Type.');
			toast.error('To edit, you must select a new file and provide an Employee ID and Document Type.');
			return;
		}

		setIsEditing(true);
		try {
			const formData = new FormData();
			formData.append('file', editFile);
			const response = await fetch(
				APIURL + `/api/hr/upload/${editForm.documentType.toUpperCase()}/${editForm.employeeId}`,
				{
					method: 'PUT',
					body: formData,
				}
			);
			if (!response.ok) {
				throw new Error('Failed to update document file');
			}

			await fetchDocuments();
			setShowEditModal(false);
			setEditingDocument(null);
			setEditFile(null);
			toast.success('Document updated successfully');
		} catch (error) {
			setEditError(error instanceof Error ? error.message : 'Failed to update document');
			toast.error(error instanceof Error ? error.message : 'Failed to update document');
		} finally {
			setIsEditing(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-gray-50">
			<aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
				<div className="p-6 border-b border-gray-100">
					<h2 className="text-xl font-bold text-gray-900">Documents</h2>
				</div>
				<nav className="flex-1 overflow-y-auto p-4 space-y-2">
					<button
						onClick={() => {
							setSelectedCategory('all');
							setShowAllCategories((prev) => !prev);
							setShowMarksSubcategories(false);
						}}
						className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-left ${
							selectedCategory === 'all'
								? 'bg-blue-600 text-white shadow'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						<File className="w-5 h-5" />
						<span>All Documents</span>
						<span className="ml-auto">{showAllCategories ? '▲' : '▼'}</span>
					</button>
					{showAllCategories && (
						<>
							{documentTypes.filter(dt => !['marks_10th', 'marks_pu', 'marks_degree', 'marks_pg'].includes(dt.id)).map((type) => {
								// Type assertion needed here because TypeScript can't guarantee the exact type from the const array without runtime checks
								const Icon = type.icon;
								const count = documents.filter(doc => doc.documentType === type.id).length;
								const colorClasses = getDocumentColorClasses(type.id);

								if (type.id === 'marks_card') {
									return (
										<div key={type.id}>
											<button
												onClick={() => setShowMarksSubcategories((prev) => !prev)}
												className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-left ml-2 ${
													selectedCategory === 'marks_card' || marksSubcategories.some((m) => m.id === selectedCategory)
														? 'bg-green-100 text-green-700 shadow'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											>
												<GraduationCap className="w-5 h-5" />
												<span>Marks Card</span>
												<span className="ml-auto">{showMarksSubcategories ? '▲' : '▼'}</span>
											</button>
											{showMarksSubcategories && (
												<div className="pl-8 space-y-1">
													{marksSubcategories.map((sub: { id: string; name: string }) => {
														const subCount = documents.filter(doc => doc.documentType === sub.id).length;
														return (
															<button
																key={sub.id}
																onClick={() => setSelectedCategory(sub.id)}
																className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-left ${
																	selectedCategory === sub.id
																		? 'bg-green-200 text-green-900 shadow'
																		: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
																}`}
															>
																<GraduationCap className="w-4 h-4" />
																<span>{sub.name}</span>
																<span className="ml-auto text-xs font-semibold">{subCount}</span>
															</button>
														);
													})}
												</div>
											)}
										</div>
									);
								}

								return (
									<button
										key={type.id}
										onClick={() => setSelectedCategory(type.id)}
										className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-left ml-2 ${
											selectedCategory === type.id
												? `${colorClasses.bg} ${colorClasses.text} shadow`
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										<Icon className="w-5 h-5" />
										<span>{type.name}</span>
										<span className="ml-auto text-xs font-semibold">{count}</span>
									</button>
								);
							})}
						</>
					)}
				</nav>
			</aside>
			<main className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Toaster position="top-right" />
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
					<h1 className="text-2xl font-bold text-gray-900">HR Document Management</h1>
					<button
						onClick={() => setShowUploadModal(true)}
						className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
					>
						<Upload className="w-5 h-5" />
						<span>Upload Document</span>
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
							placeholder="Search documents or employees..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
						<Filter className="w-5 h-5" />
						<span>Filter</span>
					</button>
				</div>
				<div className="flex-1">
					<div className="bg-white rounded-lg shadow p-4">
						{isLoading ? (
							<div className="text-center py-12 text-gray-500">
								<p>Loading documents...</p>
							</div>
						) : filteredDocuments.length === 0 ? (
							<div className="text-center py-12">
								<File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
								<p className="text-gray-500">Try adjusting your search or filter criteria.</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{filteredDocuments.map((doc) => {
									if (!doc) return null;
									const IconComponent = getDocumentIcon(doc.documentType || '');
									const colorClasses = getDocumentColorClasses(doc.documentType || '');
									return (
										<div key={doc.id} className="border border-gray-200 rounded-xl p-5 bg-white shadow hover:shadow-lg transition-all flex flex-col justify-between h-full">
											<div className="flex items-center justify-between mb-3">
												<div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
													<IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
												</div>
											</div>
											<div className="space-y-2 flex-1">
												<h3 className="font-medium text-gray-900 truncate">{
													doc.originalFileName && doc.originalFileName.trim()
														? doc.originalFileName
														: (doc.fileName && doc.fileName.trim() ? doc.fileName : 'Unnamed Document')
												}</h3>
												<div className="flex items-center space-x-2 text-sm text-gray-500">
													<User className="w-4 h-4" />
													<span>{doc.employeeId || 'Unknown Employee'}</span>
												</div>
												<div className="flex items-center space-x-2 text-sm text-gray-500">
													<File className="w-4 h-4" />
													<span>{doc.fileType || 'Unknown Type'} • {(doc.size / 1024).toFixed(1)} KB</span>
												</div>
											</div>
											<div className="flex items-center space-x-2 mt-4">
												<button
													onClick={() => handleViewDocument(doc)}
													className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
													title="View Document"
												>
													<Eye className="w-4 h-4" />
													<span>View</span>
												</button>
												<button
													onClick={() => handleDownloadDocument(doc)}
													className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
												>
													<Download className="w-4 h-4" />
													<span>Download</span>
												</button>
												<button
													onClick={() => openEditModal(doc)}
													className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm"
												>
													<Edit className="w-4 h-4" />
													<span>Edit</span>
												</button>
												<button
													onClick={() => handleDeleteDocument(doc)}
													className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
												>
													<X className="w-4 h-4" />
													<span>Delete</span>
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
				{showUploadModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 w-full max-w-md">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
								<button
									onClick={() => setShowUploadModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Employee ID
									</label>
									<input
										type="text"
										value={employeeId}
										onChange={(e) => setEmployeeId(e.target.value)}
										placeholder="Enter employee ID"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										disabled={isUploading}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Document Type
									</label>
									<select
										value={selectedDocType}
										onChange={(e) => setSelectedDocType(e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										disabled={isUploading}
									>
										<option value="">Select document type</option>
										{documentTypes.map((type) => (
											<option key={type.id} value={type.id}>{type.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Choose File
									</label>
									<div className="flex items-center space-x-3">
										<input
											id="upload-file-input"
											type="file"
											accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
											multiple
											onChange={handleFileChange}
											disabled={!selectedDocType || !employeeId || isUploading}
											className="hidden"
										/>
										<button
											type="button"
											onClick={() => document.getElementById('upload-file-input')?.click()}
											disabled={!selectedDocType || !employeeId || isUploading}
											className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
										>
											<Upload className="w-5 h-5 mr-2" />
											<span>Select File(s)</span>
										</button>
									</div>
									{selectedFiles && selectedFiles.length > 0 && (
										<div className="text-xs text-gray-700 mt-1">
											Selected: {Array.from(selectedFiles).map(f => f.name).join(', ')}
										</div>
									)}
									<p className="text-xs text-gray-500 mt-1">
										Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
									</p>
								</div>
								{uploadError && (
									<div className="text-red-600 text-sm mt-2">
										{uploadError}
									</div>
								)}
							</div>
							<div className="flex space-x-3 mt-6">
								<button
									onClick={() => {
										setShowUploadModal(false);
										setSelectedDocType('');
										setEmployeeId('');
										setSelectedFiles(null);
									}}
									className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
									disabled={isUploading}
								>
									Cancel
								</button>
								<button
									onClick={handleUploadSubmit}
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
									disabled={isUploading || !selectedFiles || selectedFiles.length === 0 || !selectedDocType || !employeeId}
								>
									{isUploading ? 'Uploading...' : 'Submit'}
								</button>
							</div>
						</div>
					</div>
				)}
				{showEditModal && editingDocument && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 w-full max-w-md">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-semibold text-gray-900">Edit Document</h2>
								<button
									onClick={() => setShowEditModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Employee ID
									</label>
									<input
										type="text"
										name="employeeId"
										value={editForm.employeeId}
										onChange={handleEditFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg"
										disabled={isEditing}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Document Type
									</label>
									<select
										name="documentType"
										value={editForm.documentType}
										onChange={handleEditFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg"
										disabled={isEditing}
									>
										<option value="">Select document type</option>
										{documentTypes.map((type) => (
											<option key={type.id} value={type.id}>{type.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										New File
									</label>
									<p className="text-xs text-red-500 mb-2">
										Note: A new file is required to update a document.
									</p>
									<div className="flex items-center space-x-3">
										<input
											id="edit-file-input"
											type="file"
											onChange={handleEditFileChange}
											className="hidden"
											disabled={isEditing}
										/>
										<button
											type="button"
											onClick={() => document.getElementById('edit-file-input')?.click()}
											disabled={isEditing}
											className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
										>
											<Upload className="w-5 h-5 mr-2" />
											<span>Select File</span>
										</button>
									</div>
									{editFile && (
										<div className="text-xs text-gray-700 mt-1">
											Selected: {editFile.name}
										</div>
									)}
								</div>
								{editError && <div className="text-red-600 text-sm">{editError}</div>}
								<button
									onClick={handleEditSubmit}
									className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
									disabled={isEditing || !editFile || !editForm.employeeId || !editForm.documentType}
								>
									{isEditing ? 'Updating...' : 'Update Document'}
								</button>
							</div>
						</div>
					</div>
				)}
				{showDeleteModal && documentToDelete && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 max-w-md w-full">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Document</h3>
							<p className="text-gray-600 mb-6">
								Are you sure you want to delete &quot;{documentToDelete.originalFileName || documentToDelete.fileName}&quot;? This action cannot be undone.
							</p>
							<div className="flex justify-end space-x-3">
								<button
									onClick={() => {
										setShowDeleteModal(false);
										setDocumentToDelete(null);
									}}
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
			</main>
		</div>
	);
}