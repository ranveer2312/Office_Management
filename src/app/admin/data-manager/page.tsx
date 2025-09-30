'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
	ChartBarIcon,
	ShoppingBagIcon,
	DocumentTextIcon,
	BuildingOffice2Icon,
	CreditCardIcon,
	ReceiptPercentIcon,
	CalculatorIcon,
	ArchiveBoxIcon,
	ChartPieIcon,
	ArrowRightIcon,
	ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'; // FIX: Removed ArrowLeftIcon
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { APIURL } from '@/constants/api';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast'

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
);

interface Module {
	id: string;
	name: string;
	icon: React.ElementType;
	color: string;
	path: string;
	count: number;
	apiUrl: string;
}

interface ChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		borderColor?: string;
		backgroundColor?: string | string[];
	}[];
}

// Type definitions for API data
interface SalesRecord {
	date: string;
	amount: number;
	paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
	[key: string]: unknown; // For additional properties
}

interface PurchaseRecord {
	date: string;
	amount: number;
	[key: string]: unknown; // For additional properties
}

interface DataRecord {
	date: string;
	amount: number;
	[key: string]: unknown;
}

type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';

const modules: Module[] = [
	{
		id: 'sales',
		name: 'Sales Management',
		icon: ArrowTrendingUpIcon,
		color: 'bg-green-500',
		path: '/admin/data-manager/sales',
		count: 0,
		apiUrl: APIURL +'/api/sales'
	},
	{
		id: 'purchase',
		name: 'Purchase Management',
		icon: ShoppingBagIcon,
		color: 'bg-orange-500',
		path: '/admin/data-manager/purchase',
		count: 0,
		apiUrl: APIURL +'/api/purchases'
	},
	{
		id: 'logistics',
		name: 'Logistics Documents',
		icon: DocumentTextIcon,
		color: 'bg-green-500',
		path: '/admin/data-manager/logistics',
		count: 0,
		apiUrl: APIURL +'/api/logisticsdocuments'
	},
	{
		id: 'registration',
		name: 'Company Registration',
		icon: BuildingOffice2Icon,
		color: 'bg-purple-500',
		path: '/admin/data-manager/registration',
		count: 0,
		apiUrl: APIURL +'/api/companyregistrations'
	},
	{
		id: 'bank',
		name: 'Bank Documents',
		icon: CreditCardIcon,
		color: 'bg-yellow-500',
		path: '/admin/data-manager/bank',
		count: 0,
		apiUrl: APIURL +'/api/bankdocuments'
	},
	{
		id: 'billing',
		name: 'Billing Management',
		icon: ReceiptPercentIcon,
		color: 'bg-red-500',
		path: '/admin/data-manager/billing',
		count: 0,
		apiUrl: APIURL +'/api/billings'
	},
	{
		id: 'ca',
		name: 'CA Documents',
		icon: CalculatorIcon,
		color: 'bg-indigo-500',
		path: '/admin/data-manager/ca',
		count: 0,
		apiUrl: APIURL +'/api/cadocuments'
	},
	{
		id: 'tender',
		name: 'Tender Management',
		icon: ArchiveBoxIcon,
		color: 'bg-orange-500',
		path: '/admin/data-manager/tender',
		count: 0,
		apiUrl: APIURL +'/api/tenders'
	},
	{
		id: 'finance',
		name: 'Finance Reports',
		icon: ChartPieIcon,
		color: 'bg-teal-500',
		path: '/admin/data-manager/finance',
		count: 0,
		apiUrl: APIURL + '/api/financereports'
	}
];

export default function DataManagerDashboard() {
	const [moduleCounts, setModuleCounts] = useState<{ [key: string]: number }>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [salesData, setSalesData] = useState<ChartData>({
		labels: [],
		datasets: [{
			label: 'Sales',
			data: [],
			borderColor: 'rgb(34, 197, 94)',
			backgroundColor: 'rgba(34, 197, 94, 0.5)',
		}]
	});
	const [purchaseData, setPurchaseData] = useState<ChartData>({
		labels: [],
		datasets: [{
			label: 'Purchases',
			data: [],
			borderColor: 'rgb(249, 115, 22)',
			backgroundColor: 'rgba(249, 115, 22, 0.5)',
		}]
	});
	const [paymentStatusData, setPaymentStatusData] = useState<ChartData>({
		labels: ['Paid', 'Pending', 'Overdue', 'Partially Paid'],
		datasets: [{
			label: 'Payment Status',
			data: [0, 0, 0, 0],
			backgroundColor: [
				'rgba(34, 197, 94, 0.8)',
				'rgba(234, 179, 8, 0.8)',
				'rgba(239, 68, 68, 0.8)',
				'rgba(249, 115, 22, 0.8)',
			],
		}]
	});

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			const counts: { [key: string]: number } = {};

			try {
				// Fetch module counts
				await Promise.all(
					modules.map(async (module) => {
						try {
							const response = await fetch(module.apiUrl);
							if (!response.ok) {
								throw new Error(`HTTP error! status: ${response.status}`);
							}
							const data: unknown[] = await response.json();
							counts[module.id] = Array.isArray(data) ? data.length : 0;
						} catch (e) {
							console.error(`Error fetching count for ${module.name}:`, e);
							counts[module.id] = 0;
						}
					})
				);

				// Fetch sales data for charts
				const salesResponse = await fetch(APIURL +`/api/sales`);
				if (salesResponse.ok) {
					const sales: SalesRecord[] = await salesResponse.json();
					const monthlySales = processMonthlyData(sales, 'date', 'amount');
					setSalesData({
						labels: monthlySales.labels,
						datasets: [{
							label: 'Sales',
							data: monthlySales.data,
							borderColor: 'rgb(34, 197, 94)',
							backgroundColor: 'rgba(34, 197, 94, 0.5)',
						}]
					});
				}

				// Fetch purchase data for charts
				const purchasesResponse = await fetch(APIURL +`/api/purchases`);
				if (purchasesResponse.ok) {
					const purchases: PurchaseRecord[] = await purchasesResponse.json();
					const monthlyPurchases = processMonthlyData(purchases, 'date', 'amount');
					setPurchaseData({
						labels: monthlyPurchases.labels,
						datasets: [{
							label: 'Purchases',
							data: monthlyPurchases.data,
							borderColor: 'rgb(249, 115, 22)',
							backgroundColor: 'rgba(249, 115, 22, 0.5)',
						}]
					});
				}

				// Fetch payment status data
				const salesForPaymentStatus: SalesRecord[] = await fetch(APIURL +'/api/sales')
					.then(res => res.ok ? res.json() : []);
				
				const paymentStatusCounts: Record<PaymentStatus, number> = {
					'Paid': 0,
					'Pending': 0,
					'Overdue': 0,
					'Partially Paid': 0
				};

				salesForPaymentStatus.forEach((sale: SalesRecord) => {
					if (sale.paymentStatus in paymentStatusCounts) {
						paymentStatusCounts[sale.paymentStatus]++;
					}
				});

				setPaymentStatusData({
					labels: Object.keys(paymentStatusCounts),
					datasets: [{
						label: 'Payment Status',
						data: Object.values(paymentStatusCounts),
						backgroundColor: [
							'rgba(34, 197, 94, 0.8)',
							'rgba(234, 179, 8, 0.8)',
							'rgba(239, 68, 68, 0.8)',
							'rgba(249, 115, 22, 0.8)',
						],
					}]
				});

				setModuleCounts(counts);
			} catch (e: unknown) {
				const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
				setError(`Failed to fetch data: ${errorMessage}`);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Helper function to process monthly data
	const processMonthlyData = (data: DataRecord[], dateField: string, amountField: string) => {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const monthlyTotals = new Array(12).fill(0);
		const currentYear = new Date().getFullYear();

		data.forEach((item: DataRecord) => {
			const date = new Date(item[dateField] as string);
			if (date.getFullYear() === currentYear) {
				const month = date.getMonth();
				monthlyTotals[month] += Number(item[amountField]) || 0;
			}
		});

		return {
			labels: months,
			data: monthlyTotals
		};
	};

	return (
		<div className="min-h-screen bg-transparent">
			<Toaster position="top-right" />
			
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header Section */}
				<div className="bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-50/90 dark:from-gray-800/90 dark:via-slate-800/90 dark:to-indigo-900/90 shadow-xl border-b border-blue-200/90 dark:border-indigo-700/90 rounded-2xl p-6 mb-8">
					{/* <Link href="/admin/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
						<ArrowLeftIcon className="w-5 h-5 mr-2" />
						Back to Dashboard
					</Link> */}
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
								<ChartBarIcon className="h-10 w-10 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Data Manager Dashboard </h1>
								<p className="text-base text-gray-600 dark:text-gray-300 mt-1">Overview of all company data records</p>
							</div>
						</div>
						<div className="hidden md:flex items-center space-x-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
									{Object.values(moduleCounts).reduce((sum, count) => sum + count, 0)}
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400">Total Records</div>
							</div>
						</div>
					</div>
				</div>

				{error && (
					<div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
						{error}
					</div>
				)}

				{/* Modules Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
					{loading ? (
						<div className="col-span-full text-center py-8 text-gray-600">Loading module counts...</div>
					) : error ? (
						<div className="col-span-full text-center py-8 text-red-600">{error}</div>
					) : (
						modules.map((module) => (
							<Link
								key={module.id}
								href={module.path}
								className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 backdrop-blur-sm border border-gray-200/90 dark:border-gray-700/90"
							>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.name}</h3>
										<p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{moduleCounts[module.id] || 0}</p>
									</div>
									<div className={`p-4 rounded-xl shadow-md ${module.color}`}>
										<module.icon className="w-8 h-8 text-white" />
									</div>
								</div>
								<div className="mt-4 flex items-center text-blue-600 font-medium">
									<span className="text-sm">View Details</span>
									<ArrowRightIcon className="w-4 h-4 ml-2" />
								</div>
							</Link>
						))
					)}
				</div>
				
				{/* Charts Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
					{/* Sales Trend Chart */}
					<div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-lg border border-gray-200/90 dark:border-gray-700/90 backdrop-blur-sm">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend</h3>
						<div className="h-80">
							<Line
								data={salesData}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: 'top' as const,
										},
										title: {
											display: false,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: {
												callback: (value) => `$${value.toLocaleString()}`,
											},
										},
									},
								}}
							/>
						</div>
					</div>

					{/* Purchase Trend Chart */}
					<div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-lg border border-gray-200/90 dark:border-gray-700/90 backdrop-blur-sm">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Purchase Trend</h3>
						<div className="h-80">
							<Line
								data={purchaseData}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: 'top' as const,
										},
										title: {
											display: false,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: {
												callback: (value) => `$${value.toLocaleString()}`,
											},
										},
									},
								}}
							/>
						</div>
					</div>

					{/* Payment Status Distribution */}
					<div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-lg border border-gray-200/90 dark:border-gray-700/90 backdrop-blur-sm">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Status Distribution</h3>
						<div className="h-80 flex items-center justify-center">
							<Doughnut
								data={paymentStatusData}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: 'right' as const,
										},
									},
								}}
							/>
						</div>
					</div>

					{/* Monthly Comparison */}
					<div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-lg border border-gray-200/90 dark:border-gray-700/90 backdrop-blur-sm">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Sales vs Purchases</h3>
						<div className="h-80">
							<Bar
								data={{
									labels: salesData.labels,
									datasets: [
										{
											label: 'Sales',
											data: salesData.datasets[0].data,
											backgroundColor: 'rgba(34, 197, 94, 0.8)',
										},
										{
											label: 'Purchases',
											data: purchaseData.datasets[0].data,
											backgroundColor: 'rgba(249, 115, 22, 0.8)',
										},
									],
								}}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: 'top' as const,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: {
												callback: (value) => `$${value.toLocaleString()}`,
											},
										},
									},
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}