'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon, BeakerIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast' as it was unused

interface LabMaterial {
	id: string;
	name: string;
	productNumber?: string;
	category: string;
	quantity: number;
	location: string;
	itemCondition: string;
	lastUpdated: Date;
}

const API_BASE_URL = APIURL + '/store/lab/materials';

export default function LabMaterialsPage() {
	const [materials, setMaterials] = useState<LabMaterial[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch materials from API on component mount
	useEffect(() => {
		const fetchMaterials = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(API_BASE_URL, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
				});
				
				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
				}
				
				const data: LabMaterial[] = await response.json();
				
				if (!Array.isArray(data)) {
					throw new Error('Invalid data format received from API');
				}
				
				// Convert date strings to Date objects
				const processedData = data.map(material => ({
					...material,
					lastUpdated: new Date(material.lastUpdated),
				}));
				
				setMaterials(processedData);
			} catch (error) {
				console.error('Error fetching materials:', error);
				setError(error instanceof Error ? error.message : 'Failed to fetch materials');
				setMaterials([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMaterials();
	}, []); // FIX: Removed API_BASE_URL from dependency array

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
				<div className="text-lg text-gray-600">Loading lab materials...</div>
			</div>
		);
	}

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
								<BeakerIcon className="h-10 w-10 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Lab Materials </h1>
								<p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and manage all lab materials</p>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">{materials.length}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Total Items</div>
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
								Materials Inventory
							</span>
							<span className="ml-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-sm font-semibold rounded-full">
								{materials.length}
							</span>
						</h2>
					</div>
					
					{error ? (
						<div className="text-red-600 dark:text-red-400 text-center py-4">
							{error}
						</div>
					) : materials.length === 0 ? (
						<div className="text-gray-500 dark:text-gray-400 text-center py-12">
							<BeakerIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<p className="text-lg font-medium">No lab materials found</p>
							<p className="text-sm">No records available to display.</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S/N</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Number</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condition</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{materials.map((material, idx) => (
										<tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{idx + 1}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.name}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.productNumber || '-'}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.category}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.quantity}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.location}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{material.itemCondition}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
												{material.lastUpdated.toLocaleDateString()}
											</td>
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