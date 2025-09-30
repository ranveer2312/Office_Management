'use client';

import { useState,useEffect, useCallback } from 'react';
import AdminStore from '@/app/components/AdminStore';
import { ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast';

interface OfficeSuppliesItem {
	id: string;
	name: string;
	productNumber?: string;
	quantity: number;
	category: string;
	location: string;
	lastUpdated: Date;
	condition: 'new' | 'good' | 'fair' | 'poor';
}

interface ApiOfficeSuppliesItem {
	id: number;
	name: string;
	productNumber?: string;
	quantity: number;
	category: string;
	location: string;
	itemCondition: string | null;
	lastUpdated: [number, number, number]; // [year, month, day]
}

const API_BASE_URL = APIURL +'/store/stationary/regular';

export default function RegularStationaryPage() {
	const [items, setItems] = useState<OfficeSuppliesItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [, setError] = useState<string | null>(null);

	const categories = ['Paper', 'Writing', 'Desk Accessories', 'Binders', 'Seating', 'Other'];

	// Helper function to convert API response to local format
	const convertApiToLocal = (apiItem: ApiOfficeSuppliesItem): OfficeSuppliesItem => {
		const [year, month, day] = apiItem.lastUpdated;
		return {
			id: apiItem.id.toString(),
			name: apiItem.name,
			productNumber: apiItem.productNumber,
			quantity: apiItem.quantity,
			category: apiItem.category,
			location: apiItem.location,
			lastUpdated: new Date(year, month - 1, day), // month is 0-indexed in JS Date
			condition: (apiItem.itemCondition?.toLowerCase() as 'new' | 'good' | 'fair' | 'poor') || 'good',
		};
	};

	// Fetch all items
	const fetchItems = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch(API_BASE_URL);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data: ApiOfficeSuppliesItem[] = await response.json();
			const convertedItems = data.map(convertApiToLocal);
			setItems(convertedItems);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch items');
			console.error('Error fetching items:', err);
			setItems([]);
		} finally {
			setLoading(false);
		}
	}, []); // API_BASE_URL dependency is correctly excluded here

	// Load items on component mount
	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
				<div className="text-lg text-gray-600">Loading regular stationary items...</div>
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
							<div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
								<ShoppingBagIcon className="h-10 w-10 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Regular Office Supplies </h1>
								<p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and manage day-to-day office supplies</p>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{items.length}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Total Items</div>
							</div>
						</div>
					</div>
				</div>

				{/* AdminStore Component - now aligned with the header */}
				<AdminStore
					title="Regular Office Supplies Items"
					items={items}
					categories={categories}
				/>
			</div>
		</div>
	);
}