'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, BeakerIcon, DocumentTextIcon } from '@heroicons/react/24/outline'; // Corrected FlaskIcon to BeakerIcon
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast' as it was unused

interface LabInventory {
	id: string;
	item: string;
	productNumber?: string;
	category: string;
	quantity: number;
	location: string;
	itemCondition: string;
	date: [number, number, number];
	type: 'in' | 'out';
	notes: string;
}

const API_BASE_URL = APIURL + '/store/lab/inventory';

export default function LabInventoryPage() {
	const [inventory, setInventory] = useState<LabInventory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch inventory from API on component mount
	useEffect(() => {
		const fetchInventory = async () => {
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
				
				const data = await response.json();
				
				if (!Array.isArray(data)) {
					throw new Error('Invalid data format received from API');
				}
				
				// Process and validate the data
				const processedData = data.map(item => ({
					...item,
					id: item.id || Math.random().toString(36).substr(2, 9),
					item: item.item || '',
					category: item.category || '',
					quantity: Number(item.quantity) || 0,
					location: item.location || '',
					itemCondition: item.itemCondition || 'New',
					type: item.type || 'in',
					notes: item.notes || '',
					// Ensure date is a valid [year, month, day] array; default to current date if invalid
					date: (Array.isArray(item.date) && item.date.length === 3 && !isNaN(new Date(item.date[0], item.date[1] - 1, item.date[2]).getTime())) 
						? item.date 
						: [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()],
				}));
				
				setInventory(processedData);
			} catch (error) {
				console.error('Error fetching inventory:', error);
				setError(error instanceof Error ? error.message : 'Failed to fetch inventory');
				setInventory([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchInventory();
	}, []);

	const totalItemsIn = inventory.filter(item => item.type === 'in').reduce((sum, item) => sum + item.quantity, 0);
	const totalItemsOut = inventory.filter(item => item.type === 'out').reduce((sum, item) => sum + item.quantity, 0);
	const totalEntries = inventory.length;

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
								<h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Lab Inventory </h1>
								<p className="text-base text-gray-600 dark:text-gray-300 mt-1">Manage lab equipment and component flow</p>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalEntries}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Total Entries</div>
							</div>
						</div>
					</div>
				</div>

				{/* Inventory Summary */}
				<div className="mt-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-indigo-700/50 backdrop-blur-sm p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center space-x-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 shadow-inner">
							<div className="p-2 rounded-full bg-green-200 dark:bg-green-800">
								<ArrowUpIcon className="h-6 w-6 text-green-700 dark:text-green-300" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Total Items In</h3>
								<p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalItemsIn}</p>
							</div>
						</div>
						<div className="flex items-center space-x-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 shadow-inner">
							<div className="p-2 rounded-full bg-red-200 dark:bg-red-800">
								<ArrowDownIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Total Items Out</h3>
								<p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalItemsOut}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Inventory List */}
				<div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-slate-800/50 dark:to-indigo-900/30 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
					<div className="px-8 py-6 border-b border-blue-200/50 dark:border-indigo-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-900/50 rounded-t-2xl">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
							<div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg">
								<DocumentTextIcon className="h-5 w-5 text-white" />
							</div>
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
								Inventory Entries
							</span>
							<span className="ml-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-sm font-semibold rounded-full">
								{inventory.length}
							</span>
						</h2>
					</div>
					
					{isLoading ? (
						<div className="flex justify-center items-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						</div>
					) : error ? (
						<div className="text-red-600 dark:text-red-400 text-center py-4">
							{error}
						</div>
					) : inventory.length === 0 ? (
						<div className="text-gray-500 dark:text-gray-400 text-center py-12">
							<BeakerIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<p className="text-lg font-medium">No inventory items found</p>
							<p className="text-sm">No records available to display.</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S/N</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Number</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{inventory.map((item, idx) => (
										<tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{idx + 1}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.item}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.productNumber || '-'}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.category}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.quantity}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.location}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													item.type === 'in' 
														? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
														: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
												}`}>
													{item.type === 'in' ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
													{item.type.toUpperCase()}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
												{new Date(item.date[0], item.date[1] - 1, item.date[2]).toLocaleDateString()}
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