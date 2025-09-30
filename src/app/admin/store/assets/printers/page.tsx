'use client';

import { useState,useEffect } from 'react';
import AdminStore from '@/app/components/AdminStore';
import { 
	ArrowLeftIcon,
	PrinterIcon
} from '@heroicons/react/24/outline'; // Changed from lucide-react to heroicons
import Link from 'next/link';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast' as it was unused

interface Printer {
	id: string;
	name: string;
	quantity: number;
	category: string;
	location: string;
	lastUpdated: Date;
	condition: 'new' | 'good' | 'fair' | 'poor';
	purchaseDate?: Date;
	manufacturer?: string;
	model?: string;
	serialNumber?: string;
	lastMaintenance?: Date;
	itemCondition?: string; // For API compatibility
}

interface ApiPrinterItem {
	id: string;
	name: string;
	quantity: number;
	category: string;
	location: string;
	itemCondition?: string;
	condition?: string;
	lastUpdated?: string;
	purchaseDate?: string;
	manufacturer?: string;
	model?: string;
	serialNumber?: string;
	lastMaintenance?: string;
}

// API service functions
const API_BASE_URL = APIURL +'/store/assets/printers';

const printersAPI = {
	// GET - Fetch all printer items
	getAll: async (): Promise<Printer[]> => {
		try {
			const response = await fetch(API_BASE_URL);
			if (!response.ok) throw new Error('Failed to fetch printers');
			const data = await response.json();
			
			// Transform API response to match our interface
			return data.map((item: ApiPrinterItem) => ({
				...item,
				condition: (item.itemCondition || item.condition)?.toLowerCase() as Printer['condition'] || 'new',
				lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
				purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
				lastMaintenance: item.lastMaintenance ? new Date(item.lastMaintenance) : undefined,
			}));
		} catch (error) {
			console.error('Error fetching printers:', error);
			return [];
		}
	},

	// POST - Create new printer item
	create: async (item: Omit<Printer, 'id' | 'lastUpdated'>): Promise<Printer | null> => {
		try {
			const payload = {
				name: item.name,
				category: item.category,
				quantity: item.quantity,
				location: item.location,
				itemCondition: item.condition,
				lastUpdated: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
				...(item.manufacturer && { manufacturer: item.manufacturer }),
				...(item.model && { model: item.model }),
				...(item.serialNumber && { serialNumber: item.serialNumber }),
				...(item.purchaseDate && { purchaseDate: item.purchaseDate.toISOString().split('T')[0] }),
				...(item.lastMaintenance && { lastMaintenance: item.lastMaintenance.toISOString().split('T')[0] }),
			};

			const response = await fetch(API_BASE_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error('Failed to create printer');
			const data = await response.json();
			
			return {
				...data,
				condition: data.itemCondition || data.condition,
				lastUpdated: new Date(),
				purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : item.purchaseDate,
				lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : item.lastMaintenance,
			};
		} catch (error) {
			console.error('Error creating printer:', error);
			return null;
		}
	},

	// PUT - Update printer item
	update: async (id: string, updates: Partial<Printer>): Promise<Printer | null> => {
		try {
			const payload = {
				...(updates.name && { name: updates.name }),
				...(updates.category && { category: updates.category }),
				...(updates.quantity !== undefined && { quantity: updates.quantity }),
				...(updates.location && { location: updates.location }),
				...(updates.condition && { itemCondition: updates.condition }),
				lastUpdated: new Date().toISOString().split('T')[0],
				...(updates.manufacturer && { manufacturer: updates.manufacturer }),
				...(updates.model && { model: updates.model }),
				...(updates.serialNumber && { serialNumber: updates.serialNumber }),
				...(updates.purchaseDate && { purchaseDate: updates.purchaseDate.toISOString().split('T')[0] }),
				...(updates.lastMaintenance && { lastMaintenance: updates.lastMaintenance.toISOString().split('T')[0] }),
			};

			const response = await fetch(`${API_BASE_URL}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error('Failed to update printer');
			const data = await response.json();
			
			return {
				...data,
				condition: data.itemCondition || data.condition,
				lastUpdated: new Date(),
				purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
				lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
			};
		} catch (error) {
			console.error('Error updating printer:', error);
			return null;
		}
	},

	// DELETE - Remove printer item
	delete: async (id: string): Promise<boolean> => {
		try {
			const response = await fetch(`${API_BASE_URL}/${id}`, {
				method: 'DELETE',
			});

			return response.ok;
		} catch (error) {
			console.error('Error deleting printer:', error);
			return false;
		}
	},
};

export default function PrintersPage() {
	const [items, setItems] = useState<Printer[]>([]);
	const [loading, setLoading] = useState(true);
	const [, setError] = useState<string | null>(null);

	const categories = ['Laser', 'Inkjet', 'All-in-One', '3D Printer', 'Other'];

	// Load printer items on component mount
	useEffect(() => {
		loadPrinters();
	}, []);

	const loadPrinters = async () => {
		setLoading(true);
		setError(null);
		try {
			const printerItems = await printersAPI.getAll();
			setItems(printerItems);
		} catch (err) {
			setError('Failed to load printer items');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
				<div className="text-lg text-gray-600">Loading printer items...</div>
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
							<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
								<PrinterIcon className="h-10 w-10 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Printers & Equipment </h1>
								<p className="text-base text-gray-600 dark:text-gray-300 mt-1">View and manage all printing assets</p>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{items.length}</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Total Items</div>
							</div>
						</div>
					</div>
				</div>

				{/* AdminStore Component - now aligned with the header */}
				<AdminStore
					title="Printer Items"
					items={items}
					categories={categories}
				/>
			</div>
		</div>
	);
}