'use client';

import { useState,useEffect } from 'react';
import { ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, ShoppingBagIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast' as it was unused

interface InventoryTransaction {
	id: string;
	item: string;
	productNumber?: string;
	type: 'in' | 'out';
	quantity: number;
	date: Date;
	location: string;
	notes: string;
}

const API_BASE_URL = APIURL + `/store/stationary/inventory`;

export default function StationaryInventoryPage() {
	const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	// Fetch transactions from API on component mount
	useEffect(() => {
		const fetchTransactions = async () => {
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
				
				const data: InventoryTransaction[] = await response.json();
				
				if (!Array.isArray(data)) {
					throw new Error('Invalid data format received from API');
				}
				
				// Convert date strings from API to Date objects
				const processedData = data.map(transaction => ({
					...transaction,
					date: new Date(transaction.date),
				}));
				setTransactions(processedData);
			} catch (error) {
				console.error('Error fetching transactions:', error);
				setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
				setTransactions([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTransactions();
	}, []);

	const totalEntries = transactions.length;

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
							<div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
								<ShoppingBagIcon className="h-10 w-10 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Stationary Inventory </h1>
								<p className="text-base text-gray-600 dark:text-gray-300 mt-1">View all office supply transactions</p>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalEntries}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Total Transactions</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Section */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
					<div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
							<div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
								<DocumentTextIcon className="h-5 w-5 text-white" />
							</div>
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
								Transaction History
							</span>
							<span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-sm font-semibold rounded-full">
								{totalEntries}
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
					) : transactions.length === 0 ? (
						<div className="text-gray-500 dark:text-gray-400 text-center py-12">
							<ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<p className="text-lg font-medium">No inventory transactions found</p>
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
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{transactions.map((transaction, idx) => (
										<tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{idx + 1}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.item}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.productNumber || '-'}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
													{transaction.type === 'in' ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
													{(transaction?.type ?? '').toUpperCase()}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.quantity}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.location}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(transaction.date).toLocaleDateString()}</td>
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