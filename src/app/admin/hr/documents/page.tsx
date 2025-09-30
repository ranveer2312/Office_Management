'use client';
import React, { useState, useEffect } from 'react';
import { File, Search, Filter, User, FileText, CreditCard, Briefcase, GraduationCap, LucideIcon, Eye } from 'lucide-react';
// FIX: Removed unused imports: Download, X, and toast
import { Toaster } from 'react-hot-toast';

// Assuming APIURL is correctly defined and points to your backend
const APIURL = 'http://localhost:8080';

interface Document {
	id: number;
	employeeId: string;
	documentType: string;
	fileName: string;
	originalFileName: string;
	fileDownloadUri: string;
	fileType: string;
	size: number;
	status: 'approved' | 'pending' | 'rejected';
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
	originalFileName?: string;
	fileDownloadUri?: string;
	fileType?: string;
	size?: number;
}

const documentTypes: DocumentType[] = [
	{ id: 'resume', name: 'Resume', icon: FileText, color: 'blue' },
	{ id: 'marks', name: 'Marks Card', icon: GraduationCap, color: 'green' },
	{ id: 'id', name: 'ID Proof', icon: CreditCard, color: 'purple' },
	{ id: 'offer', name: 'Offer Letter', icon: Briefcase, color: 'orange' }
];

// Helper function to get the icon for a document type
const getDocumentIcon = (type: string): LucideIcon => {
	if (!type) return File;
	const docType = documentTypes.find(dt => dt.id === type.toLowerCase());
	return docType ? docType.icon : File;
};

// Helper function to get color classes for a document type
const getDocumentColorClasses = (type: string) => {
	if (!type) return { bg: 'bg-gray-100', text: 'text-gray-600' };
	const docType = documentTypes.find(dt => dt.id === type.toLowerCase());
	if (!docType) return { bg: 'bg-gray-100', text: 'text-gray-600' };

	const colorMap: Record<DocumentType['color'], { bg: string; text: string }> = {
		blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
		green: { bg: 'bg-green-100', text: 'text-green-600' },
		purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
		orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
	};

	return colorMap[docType.color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

// Helper function to get status color classes
const getStatusColor = (status: Document['status']) => {
	switch (status) {
		case 'approved': return 'text-green-600 bg-green-100';
		case 'pending': return 'text-yellow-600 bg-yellow-100';
		case 'rejected': return 'text-red-600 bg-red-100';
		default: return 'text-gray-600 bg-gray-100';
	}
};

export default function DocumentsPage() {
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [documents, setDocuments] = useState<Document[]>([]);

	useEffect(() => {
		fetchDocuments();
	}, []);

	const fetchDocuments = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await fetch(APIURL + '/api/hr/documents');

			if (!response.ok) {
				throw new Error('Failed to fetch documents');
			}

			const data = await response.json();
			const transformedDocuments: Document[] = (data as ApiDocument[]).map((doc) => ({
				id: doc.id,
				employeeId: doc.employeeId,
				documentType: doc.documentType ? doc.documentType.toLowerCase() : '',
				fileName: doc.fileName || '',
				originalFileName: doc.originalFileName || '',
				fileDownloadUri: doc.fileDownloadUri || '',
				fileType: doc.fileType || '',
				size: doc.size || 0,
				status: 'approved',
			}));

			setDocuments(transformedDocuments);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Failed to fetch documents');
		} finally {
			setIsLoading(false);
		}
	};

	const handleViewDocument = (document: Document) => {
		window.open(document.fileDownloadUri, '_blank');
	};

	const filteredDocuments = documents.filter(doc => {
		if (!doc) return false;
		const matchesCategory = selectedCategory === 'all' || (doc.documentType && doc.documentType.toLowerCase() === selectedCategory);
		const matchesSearch = (doc.fileName && doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())) || (doc.employeeId && doc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	return (
		<div className="min-h-screen bg-transparent">
			<Toaster position="top-right" />
			<div className="max-w-7xl mx-auto space-y-8">
				<div className="flex justify-center items-center">
					<h1 className="text-3xl font-bold text-gray-900">HR Document Management</h1>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
						<p className="font-medium">Error:</p>
						<p>{error}</p>
					</div>
				)}

				<div className="bg-white/70 bg-opacity-70 backdrop-blur-lg rounded-xl shadow-2xl p-6 space-y-6">

					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Document Categories</h2>
						<div className="flex flex-wrap gap-3">
							<button
								onClick={() => setSelectedCategory('all')}
								className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
									selectedCategory === 'all'
										? 'bg-gray-800 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								<File className="w-4 h-4" />
								<span>All Documents ({documents.length})</span>
							</button>
							{documentTypes.map((type) => {
								const Icon = type.icon;
								const count = documents.filter(doc => doc.documentType === type.id).length;
								const colorClasses = getDocumentColorClasses(type.id);
								return (
									<button
										key={type.id}
										onClick={() => setSelectedCategory(type.id)}
										className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
											selectedCategory === type.id
												? `${colorClasses.bg} ${colorClasses.text} border border-current`
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
									>
										<Icon className="w-4 h-4" />
										<span>{type.name} ({count})</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="border-b border-gray-200 mb-6"></div>

					{/* Updated Search and Filter section for better mobile responsiveness */}
					<div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
						<div className="flex-1 w-full relative">
							<Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
							<input
								type="text"
								placeholder="Search documents or employees..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white bg-opacity-50"
							/>
						</div>
						<button className="flex items-center justify-center sm:justify-start w-full sm:w-auto space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
							<Filter className="w-5 h-5" />
							<span>Filter</span>
						</button>
					</div>

					<div className="border-b border-gray-200 mb-6"></div>

					<div>
						{isLoading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
								{[...Array(6)].map((_, i) => (
									<div key={i} className="bg-gray-200 rounded-lg p-4 h-40"></div>
								))}
							</div>
						) : filteredDocuments.length === 0 ? (
							<div className="text-center py-12">
								<File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
								<p className="text-gray-500">Try adjusting your search or filter criteria</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredDocuments.map((doc) => {
									if (!doc) return null;
									const IconComponent = getDocumentIcon(doc.documentType || '');
									const colorClasses = getDocumentColorClasses(doc.documentType || '');
									return (
										<div key={doc.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
											<div className="flex items-start justify-between mb-4">
												<div className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center`}>
													<IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
												</div>
												<span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(doc.status)}`}>
													{doc.status}
												</span>
											</div>

											<div className="space-y-2 mb-4">
												<h3 className="font-semibold text-gray-900 text-lg truncate">{doc.originalFileName || 'Unnamed Document'}</h3>
												<div className="flex items-center space-x-2 text-sm text-gray-500">
													<User className="w-4 h-4" />
													<span>{doc.employeeId || 'Unknown Employee'}</span>
												</div>
												<div className="flex items-center space-x-2 text-sm text-gray-500">
													<File className="w-4 h-4" />
													<span>{doc.fileType || 'Unknown Type'} • {(doc.size / 1024).toFixed(1)} KB</span>
												</div>
											</div>

											<div className="flex items-center">
												<button
													onClick={() => handleViewDocument(doc)}
													className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
													title="View Document"
												>
													<Eye className="w-4 h-4" />
													<span>View</span>
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}