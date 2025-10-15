'use client';
import React, { useState, useEffect } from 'react';
import {
	Search,
	X,
	Eye,
	User,
	Clock,
	Calendar,
	// Removed unused import: Filter
} from 'lucide-react';
import { Toaster } from 'react-hot-toast'; // FIX: Removed 'toast'

interface Activity {
	id: string;
	title: string;
	description: string;
	date: string;
	time: string;
	status: 'pending' | 'in-progress' | 'completed';
	assignedTo: string;
	priority: 'low' | 'medium' | 'high';
	category: string;
	notes?: string;
}

// Define the API response interface
interface ApiActivityResponse {
	id: string;
	title: string;
	description: string;
	activityDate: string;
	activityTime: string;
	status: string; // "Pending", "In Progress", "Completed"
	assignedTo: string;
	priority: string; // "Low Priority", "Medium Priority", "High Priority"
	category: string;
	notes?: string;
}

// Transformation from API response to client-side Activity format
const transformActivityFromApiResponse = (apiActivity: ApiActivityResponse): Activity => ({
	id: apiActivity.id,
	title: apiActivity.title,
	description: apiActivity.description,
	date: apiActivity.activityDate,
	time: apiActivity.activityTime,
	status: apiActivity.status.toLowerCase().replace(/\s/g, '-') as Activity['status'],
	assignedTo: apiActivity.assignedTo,
	priority: apiActivity.priority.replace(' Priority', '').toLowerCase() as Activity['priority'],
	category: apiActivity.category,
	notes: apiActivity.notes,
});

const API_BASE_URL = 'http://localhost:8080api/activities';

const activitiesAPI = {
	getAll: async (): Promise<Activity[]> => {
		const res = await fetch(API_BASE_URL);
		if (!res.ok) throw new Error('Failed to fetch activities');
		const data: ApiActivityResponse[] = await res.json();
		return data.map(transformActivityFromApiResponse);
	},
};

export default function ActivitiesPage() {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [searchQuery, setSearchQuery] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [selectedStatus, setSelectedStatus] = useState<string>('all');

	// Fetch activities on component mount
	useEffect(() => {
		const fetchActivities = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const data = await activitiesAPI.getAll();
				setActivities(data);
			} catch (error) {
				console.error('Error fetching activities:', error);
				setError(error instanceof Error ? error.message : 'Failed to fetch activities');
				setActivities([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchActivities();
	}, []);

	const openModal = (activity: Activity) => {
		setSelectedActivity(activity);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setSelectedActivity(null);
	};

	const filteredActivities = activities.filter(activity => {
		const matchesSearch =
			activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			activity.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
		const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const categories = ['all', ...new Set(activities.map(a => a.category))];
	const statuses = ['all', 'pending', 'in-progress', 'completed'];

	if (isLoading) {
		return (
			<div className="p-6 flex items-center justify-center min-h-screen">
				<div className="text-gray-600">Loading activities...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 flex items-center justify-center">
				<div className="text-red-600">Error: {error}</div>
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6 bg-transparent">
			<Toaster position="top-right" />
			<div className="max-w-7xl mx-auto bg-white/80 rounded-3xl shadow-2xl p-4 sm:p-8">
				<div className="flex justify-between items-center mb-6 flex-col sm:flex-row">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Activity Log</h1>
				</div>
				{/* Search and Filter Bar */}
				<div className="bg-white p-4 rounded-xl shadow-sm mb-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
							<input
								type="text"
								placeholder="Search activities..."
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
							<select
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
							>
								{categories.map(category => (
									<option key={category} value={category}>
										{category === 'all' ? 'All Categories' : category}
									</option>
								))}
							</select>
							<select
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
							>
								{statuses.map(status => (
									<option key={status} value={status}>
										{status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
				{/* Activities Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredActivities.length === 0 ? (
						<div className="col-span-full text-center py-12 text-gray-500">
							<Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
							No activities found matching your criteria.
						</div>
					) : (
						filteredActivities.map((activity) => (
							<div key={activity.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 rounded-lg bg-blue-50">
										<Calendar className="w-5 h-5 text-blue-600" />
									</div>
									<span className={`px-2 py-1 text-xs font-medium rounded-full ${
										activity.status === 'completed' ? 'bg-green-100 text-green-800' :
										activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										{activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
									</span>
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
								<p className="text-sm text-gray-600 mb-4">{activity.description}</p>

								<div className="space-y-2 mb-4">
									<div className="flex items-center text-sm text-gray-600">
										<Clock className="w-4 h-4 mr-2" />
										{activity.date} at {activity.time}
									</div>
									<div className="flex items-center text-sm text-gray-600">
										<User className="w-4 h-4 mr-2" />
										{activity.assignedTo}
									</div>
									<div className="flex items-center text-sm">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${
											activity.priority === 'high' ? 'bg-red-100 text-red-800' :
											activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
											'bg-green-100 text-green-800'
										}`}>
											{activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} Priority
										</span>
									</div>
								</div>

								<div className="flex space-x-2">
									<button
										onClick={() => openModal(activity)}
										className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
									>
										<Eye className="w-4 h-4" />
										<span>View</span>
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
			{/* Modal */}
			{showModal && selectedActivity && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-bold text-gray-900">
									Activity Details
								</h2>
								<button
									onClick={closeModal}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-600" />
								</button>
							</div>
						</div>

						<div className="p-6">
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600">Title</p>
										<p className="font-medium">{selectedActivity.title}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Category</p>
										<p className="font-medium">{selectedActivity.category}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Date & Time</p>
										<p className="font-medium">{selectedActivity.date} at {selectedActivity.time}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Assigned To</p>
										<p className="font-medium">{selectedActivity.assignedTo}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Status</p>
										<p className="font-medium">{selectedActivity.status}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Priority</p>
										<p className="font-medium">{selectedActivity.priority}</p>
									</div>
								</div>

								<div>
									<p className="text-sm text-gray-600 mb-2">Description</p>
									<p className="text-gray-900">{selectedActivity.description}</p>
								</div>

								{selectedActivity.notes && (
									<div>
										<p className="text-sm text-gray-600 mb-2">Notes</p>
										<p className="text-gray-900">{selectedActivity.notes}</p>
									</div>
								)}

								<div className="flex space-x-3 pt-4">
									<button
										type="button"
										onClick={closeModal}
										className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}