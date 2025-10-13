'use client';
import React, { useState, useEffect } from 'react';
import { Award,  Star, Search, Filter, Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';
import {  Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface Employee {
  id?: number;
  employeeId?: string;
  employeeName?: string;
  position?: string;
  department?: string;
  email?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  profilePhotoUrl?: string | null;
  currentAddress?: string;
  permanentAddress?: string;
  joiningDate?: string;
  relievingDate?: string | null;
  status?: string;
}

interface PerformanceReview {
  id?: number;
  employee: Employee;
  reviewStatus: 'PENDING' | 'COMPLETED' | 'pending' | 'completed';
  rating: number;
  lastReviewDate: string;
  nextReviewDate: string;
  goals?: string;
  feedback?: string;
  achievements?: string;
  reviewer: string;
}

// 1. Add PerformanceImprovementPlan interface
interface PerformanceImprovementPlan {
  id?: number;
  employee: Employee;
  employeeId?: string;
  planStatus: string;
  startDate: string;
  endDate: string;
  objectives: string;
  actions: string;
  support: string;
  reviewDate: string;
  reviewer: string;
  comments?: string;
  goalSetting?: string;
}

const API_BASE_URL =APIURL + '/api';

function formatDate(dateString?: string) {
  if (!dateString) return '';
  // If it's a number string like 2025614, pad and format
  if (/^\d{7,8}$/.test(dateString)) {
    const str = dateString.padStart(8, '0');
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  // Try to parse as date
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return dateString;
}

function getMonthlyRatings(reviews: PerformanceReview[], employeeId: string) {
  
  const employeeReviews = reviews.filter(r => r.employee.employeeId === employeeId);
  const monthlyData = new Array(12).fill(0);
  const monthlyCount = new Array(12).fill(0);

  employeeReviews.forEach(review => {
    const date = new Date(review.lastReviewDate);
    const month = date.getMonth();
    monthlyData[month] += review.rating;
    monthlyCount[month]++;
  });

  // Calculate average for each month
  return monthlyData.map((total, i) => monthlyCount[i] ? total / monthlyCount[i] : 0);
}

function getEmployeePerformanceStats(reviews: PerformanceReview[], employeeId: string) {
  const employeeReviews = reviews.filter(r => r.employee.employeeId === employeeId);
  const totalReviews = employeeReviews.length;
  if (totalReviews === 0) return null;

  const avgRating = employeeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const latestReview = employeeReviews.sort((a, b) => 
    new Date(b.lastReviewDate).getTime() - new Date(a.lastReviewDate).getTime()
  )[0];

  return {
    avgRating,
    totalReviews,
    latestRating: latestReview.rating,
    lastReviewDate: formatDate(latestReview.lastReviewDate),
    trend: avgRating > latestReview.rating ? 'Decreasing' : avgRating < latestReview.rating ? 'Increasing' : 'Stable'
  };
}

export default function PerformanceManagement() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [formData, setFormData] = useState<Partial<PerformanceReview>>({
    employee: {
      id: 0,
      employeeId: '',
      employeeName: '',
      position: '',
      department: '',
      email: '',
      phoneNumber: '',
      bloodGroup: '',
      profilePhotoUrl: null,
      currentAddress: '',
      permanentAddress: '',
      joiningDate: '',
      relievingDate: null,
      status: 'Active'
    } as Employee,
    reviewStatus: 'pending',
    rating: 0,
    lastReviewDate: '',
    nextReviewDate: '',
    goals: '',
    feedback: '',
    achievements: '',
    reviewer: ''
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeNotFound, setEmployeeNotFound] = useState(false);

  // Add word count helpers for goals, achievements, feedback
  const getWordCount = (text: string | undefined) => (text || '').trim().split(/\s+/).filter(Boolean).length;
  const maxWords = 250;
  
  const goalsWordCount = getWordCount(formData.goals);
  const achievementsWordCount = getWordCount(formData.achievements);
  const feedbackWordCount = getWordCount(formData.feedback);
  const anyOverLimit = goalsWordCount > maxWords || achievementsWordCount > maxWords || feedbackWordCount > maxWords;

  // 2. Add state for PIPs
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);
  const [pipLoading, setPipLoading] = useState(true);
  const [, setPipError] = useState<string | null>(null);
  const [showPipModal, setShowPipModal] = useState(false);
  const [pipModalType, setPipModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedPip, setSelectedPip] = useState<PerformanceImprovementPlan | null>(null);
  const [pipFormData, setPipFormData] = useState<Partial<PerformanceImprovementPlan>>({
    employee: {
      id: 0,
      employeeId: '',
      employeeName: '',
      position: '',
      department: '',
      email: '',
      phoneNumber: '',
      bloodGroup: '',
      profilePhotoUrl: null,
      currentAddress: '',
      permanentAddress: '',
      joiningDate: '',
      relievingDate: null,
      status: 'Active',
    } as Employee,
    planStatus: 'ACTIVE',
    startDate: '',
    endDate: '',
    objectives: '',
    actions: '',
    support: '',
    reviewDate: '',
    reviewer: '',
    comments: '',
    goalSetting: '',
  });

  // 3. Fetch PIPs from API
  useEffect(() => {
    const fetchPips = async () => {
      setPipLoading(true);
      try {
        const res = await fetch(APIURL +'/api/pips');
        if (!res.ok) throw new Error('Failed to fetch PIPs');
        const data = await res.json();
        // Map API data to PerformanceImprovementPlan[]
        const mapped = data.map((item: PerformanceImprovementPlan & { employeeId?: string }) => ({
          id: item.id,
          employee: employees.find(emp => emp.employeeId === item.employeeId) || { employeeId: item.employeeId, employeeName: '', department: '', position: '' },
          planStatus: item.planStatus,
          startDate: Array.isArray(item.startDate) ? `${item.startDate[0]}-${String(item.startDate[1]).padStart(2, '0')}-${String(item.startDate[2]).padStart(2, '0')}` : item.startDate,
          endDate: Array.isArray(item.endDate) ? `${item.endDate[0]}-${String(item.endDate[1]).padStart(2, '0')}-${String(item.endDate[2]).padStart(2, '0')}` : item.endDate,
          objectives: item.objectives,
          actions: item.actions,
          support: item.support,
          reviewDate: Array.isArray(item.reviewDate) ? `${item.reviewDate[0]}-${String(item.reviewDate[1]).padStart(2, '0')}-${String(item.reviewDate[2]).padStart(2, '0')}` : item.reviewDate,
          reviewer: item.reviewer,
          comments: item.comments,
          goalSetting: item.goalSetting,
        }));
        setPips(mapped);
        setPipError(null);
      } catch {
        setPipError('Failed to fetch PIPs');
        setPips([]);
      } finally {
        setPipLoading(false);
      }
    };
    if (employees.length > 0) fetchPips();
  }, [employees]);

  // Fetch all performance reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/performance-reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    fetch(APIURL + '/api/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(() => setEmployees([]));
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

 

  const openModal = (type: 'add' | 'edit' | 'view', review?: PerformanceReview) => {
    setModalType(type);
    setSelectedReview(review || null);
    if (type === 'add') {
      setFormData({
        employee: {
          id: 0,
          employeeId: '',
          employeeName: '',
          position: '',
          department: '',
          email: '',
          phoneNumber: '',
          bloodGroup: '',
          profilePhotoUrl: null,
          currentAddress: '',
          permanentAddress: '',
          joiningDate: '',
          relievingDate: null,
          status: 'Active'
        } as Employee,
        reviewStatus: 'pending',
        rating: 0,
        lastReviewDate: '',
        nextReviewDate: '',
        goals: '',
        feedback: '',
        achievements: '',
        reviewer: ''
      });
    } else if (review) {
      // Debug: log the incoming status
      console.log('Editing review status:', review.employee.status);
      let normalizedStatus = 'Active';
      if (review.employee.status &&
        (review.employee.status.toLowerCase() === 'active' || review.employee.status.toLowerCase() === 'inactive')) {
        normalizedStatus = review.employee.status.charAt(0).toUpperCase() + review.employee.status.slice(1).toLowerCase();
      }
      setFormData({
        ...review,
        lastReviewDate: Array.isArray(review.lastReviewDate)
          ? review.lastReviewDate.map((v, i) => String(v).padStart(i > 0 ? 2 : 4, '0')).join('-')
          : review.lastReviewDate || '',
        nextReviewDate: Array.isArray(review.nextReviewDate)
          ? review.nextReviewDate.map((v, i) => String(v).padStart(i > 0 ? 2 : 4, '0')).join('-')
          : review.nextReviewDate || '',
        employee: {
          ...review.employee,
          status: normalizedStatus
        }
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReview(null);
    setFormData({});
  };

  const updateEmployeeField = (field: keyof Employee, value: string) => {
    setFormData(prev => ({
      ...prev,
      employee: {
        ...prev.employee,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.employee?.employeeId || !formData.employee?.employeeName || 
          !formData.employee?.position || !formData.employee?.department || 
          !formData.rating || !formData.reviewStatus ||
          !formData.lastReviewDate || !formData.nextReviewDate ||
          !formData.goals || !formData.feedback || !formData.achievements ||
          !formData.reviewer || !formData.employee?.status) {
        alert('Please fill in all required fields');
        return;
      }
      // Check if employee exists
      const found = employees.some(emp => emp.employeeId === formData.employee?.employeeId);
      if (!found) {
        setEmployeeNotFound(true);
        return;
      } else {
        setEmployeeNotFound(false);
      }

      // Only send employeeId, not the whole employee object
      const reviewData = {
        employeeId: formData.employee?.employeeId,
        reviewStatus: formData.reviewStatus?.toUpperCase(),
        rating: formData.rating,
        lastReviewDate: formData.lastReviewDate,
        nextReviewDate: formData.nextReviewDate,
        goals: formData.goals,
        feedback: formData.feedback,
        achievements: formData.achievements,
        reviewer: formData.reviewer,
      };

      if (modalType === 'add') {
        const response = await fetch(`${API_BASE_URL}/performance-reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
          throw new Error('Failed to add review');
        }

        const newReview = await response.json();
        setReviews([...reviews, newReview]);
        toast.success('Review added successfully');
      } else if (modalType === 'edit' && selectedReview) {
        const response = await fetch(`${API_BASE_URL}/performance-reviews/${selectedReview.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
          throw new Error('Failed to update review');
        }

        const updatedReview = await response.json();
        setReviews(reviews.map(review => 
          review.id === selectedReview.id ? updatedReview : review
        ));
        toast.success('Review updated successfully');
      }
      
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to save review. Please try again.');
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this performance review?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/performance-reviews/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete review');
        }

        setReviews(reviews.filter(review => review.id !== id));
        toast.success('Review deleted successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error('Failed to delete review. Please try again.');
      }
    }
  };

  // 4. PIP Modal open/close logic
  const openPipModal = (type: 'add' | 'edit' | 'view', pip?: PerformanceImprovementPlan) => {
    setPipModalType(type);
    setSelectedPip(pip || null);
    if (type === 'add') {
      setPipFormData({
        employee: {
          id: 0,
          employeeId: '',
          employeeName: '',
          position: '',
          department: '',
          email: '',
          phoneNumber: '',
          bloodGroup: '',
          profilePhotoUrl: null,
          currentAddress: '',
          permanentAddress: '',
          joiningDate: '',
          relievingDate: null,
          status: 'Active',
        } as Employee,
        planStatus: 'ACTIVE',
        startDate: '',
        endDate: '',
        objectives: '',
        actions: '',
        support: '',
        reviewDate: '',
        reviewer: '',
        comments: '',
        goalSetting: '',
      });
    } else if (pip) {
      setPipFormData({ ...pip });
    }
    setShowPipModal(true);
  };
  const closePipModal = () => {
    setShowPipModal(false);
    setSelectedPip(null);
    setPipFormData({});
  };

  // 5. PIP Submit logic (POST to API)
  const handlePipSubmit = async () => {
    try {
      if (!pipFormData.employee?.employeeId || !pipFormData.employee?.employeeName || !pipFormData.startDate || !pipFormData.endDate || !pipFormData.objectives || !pipFormData.actions || !pipFormData.support || !pipFormData.reviewDate || !pipFormData.reviewer) {
        alert('Please fill in all required fields');
        return;
      }
      // PIP can be created for all employees
      // Removed employee ID restriction
      const pipBody = {
        employeeId: pipFormData.employee.employeeId,
        planStatus: pipFormData.planStatus,
        startDate: pipFormData.startDate,
        endDate: pipFormData.endDate,
        objectives: pipFormData.objectives,
        actions: pipFormData.actions,
        support: pipFormData.support,
        reviewDate: pipFormData.reviewDate,
        reviewer: pipFormData.reviewer,
        comments: pipFormData.comments,
        goalSetting: pipFormData.goalSetting,
      };
      if (pipModalType === 'add') {
        const res = await fetch(APIURL + '/api/pips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pipBody),
        });
        if (!res.ok) throw new Error('Failed to create PIP');
        const created = await res.json();
        // Map API response to PerformanceImprovementPlan
        const newPip = {
          id: created.id,
          employee: employees.find(emp => emp.employeeId === created.employeeId) || { employeeId: created.employeeId, employeeName: '', department: '', position: '' },
          planStatus: created.planStatus,
          startDate: Array.isArray(created.startDate) ? `${created.startDate[0]}-${String(created.startDate[1]).padStart(2, '0')}-${String(created.startDate[2]).padStart(2, '0')}` : created.startDate,
          endDate: Array.isArray(created.endDate) ? `${created.endDate[0]}-${String(created.endDate[1]).padStart(2, '0')}-${String(created.endDate[2]).padStart(2, '0')}` : created.endDate,
          objectives: created.objectives,
          actions: created.actions,
          support: created.support,
          reviewDate: Array.isArray(created.reviewDate) ? `${created.reviewDate[0]}-${String(created.reviewDate[1]).padStart(2, '0')}-${String(created.reviewDate[2]).padStart(2, '0')}` : created.reviewDate,
          reviewer: created.reviewer,
          comments: created.comments,
          goalSetting: created.goalSetting,
        };
        setPips([...pips, newPip]);
        toast.success('PIP created successfully');
      } else if (pipModalType === 'edit' && selectedPip) {
        const res = await fetch(APIURL + `/api/pips/${selectedPip.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pipBody),
        });
        if (!res.ok) throw new Error('Failed to update PIP');
        const updated = await res.json();
        const updatedPip = {
          id: updated.id,
          employee: employees.find(emp => emp.employeeId === updated.employeeId) || { employeeId: updated.employeeId, employeeName: '', department: '', position: '' },
          planStatus: updated.planStatus,
          startDate: Array.isArray(updated.startDate) ? `${updated.startDate[0]}-${String(updated.startDate[1]).padStart(2, '0')}-${String(updated.startDate[2]).padStart(2, '0')}` : updated.startDate,
          endDate: Array.isArray(updated.endDate) ? `${updated.endDate[0]}-${String(updated.endDate[1]).padStart(2, '0')}-${String(updated.endDate[2]).padStart(2, '0')}` : updated.endDate,
          objectives: updated.objectives,
          actions: updated.actions,
          support: updated.support,
          reviewDate: Array.isArray(updated.reviewDate) ? `${updated.reviewDate[0]}-${String(updated.reviewDate[1]).padStart(2, '0')}-${String(updated.reviewDate[2]).padStart(2, '0')}` : updated.reviewDate,
          reviewer: updated.reviewer,
          comments: updated.comments,
          goalSetting: updated.goalSetting,
        };
        setPips(pips.map(pip => pip.id === selectedPip.id ? updatedPip : pip));
        toast.success('PIP updated successfully');
      }
      closePipModal();
    } catch {
      setPipError('Failed to save PIP.');
      toast.error('Failed to save PIP. Please try again.');
    }
  };

  // Add handlePipDelete function
  const handlePipDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this Performance Improvement Plan?')) {
      try {
        const res = await fetch(APIURL + `/api/pips/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete PIP');
        setPips(pips.filter(pip => pip.id !== id));
        toast.success('PIP deleted successfully');
      } catch {
        setPipError('Failed to delete PIP.');
        toast.error('Failed to delete PIP. Please try again.');
      }
    }
  };

  const filteredReviews = reviews.filter(review =>
    (review.employee?.employeeName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (review.employee?.position?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (review.employee?.department?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

 




 

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading performance reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-100">Performance Management</h1>
          <button 
            onClick={() => openModal('add')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Review</span>
          </button>
        </div>

        {/* Employee Selection Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Select Employee to View Performance Metrics
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Employees</option>
            {Array.from(new Set(reviews.map(r => r.employee.employeeId))).map(empId => (
              <option key={empId} value={empId || ''}>
                {reviews.find(r => r.employee.employeeId === empId)?.employee.employeeName} ({empId})
              </option>
            ))}
          </select>
        </div>

        {/* Employee Performance Dashboard */}
        {selectedEmployeeId && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {reviews.find(r => r.employee.employeeId === selectedEmployeeId)?.employee.employeeName}&apos;s Performance Metrics
              </h2>
              
              {/* Performance Stats */}
              {(() => {
                const stats = getEmployeePerformanceStats(reviews, selectedEmployeeId);
                if (!stats) return <p>No performance data available</p>;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Average Rating</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.avgRating.toFixed(1)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Latest Rating</p>
                      <p className="text-2xl font-bold text-green-700">{stats.latestRating.toFixed(1)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">Total Reviews</p>
                      <p className="text-2xl font-bold text-purple-700">{stats.totalReviews}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-600">Performance Trend</p>
                      <p className="text-2xl font-bold text-orange-700">{stats.trend}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Performance Graph */}
              <div className="h-64">
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: 'Monthly Rating',
                        data: getMonthlyRatings(reviews, selectedEmployeeId),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        fill: true,
                      }
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' as const },
                      title: {
                        display: true,
                        text: 'Monthly Performance Ratings',
                      },
                    },
                    scales: {
                      y: {
                        min: 0,
                        max: 5,
                        ticks: { stepSize: 1 }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search performance reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Performance Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
               
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.employee.employeeName}</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Employee ID:</span> {review.employee.employeeId}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Position:</span> {review.employee.position}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span> {review.employee.department}
                </p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(review.rating)
                            ? getRatingColor(review.rating)
                            : 'text-gray-300'
                        }`}
                        fill={i < Math.floor(review.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                    <span className={`ml-2 text-sm font-medium ${getRatingColor(review.rating)}`}>
                      {review.rating}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Last Review:</span> {formatDate(review.lastReviewDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Next Review:</span> {formatDate(review.nextReviewDate)}
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => openModal('view', review)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => openModal('edit', review)}
                  className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Improvement Plans Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Performance Improvement Plans</h2>
            <button
              onClick={() => openPipModal('add')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New PIP</span>
            </button>
          </div>
          {pipLoading ? (
            <div className="text-gray-600">Loading PIPs...</div>
          ) : pips.length === 0 ? (
            <div className="text-gray-100 italic">No Performance Improvement Plans found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pips.map((pip) => (
                <div key={pip.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-orange-50">
                      <Star className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pip.employee.employeeName}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600"><span className="font-medium">Employee ID:</span> {pip.employee.employeeId}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Department:</span> {pip.employee.department}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Start:</span> {formatDate(pip.startDate)}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">End:</span> {formatDate(pip.endDate)}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => openPipModal('view', pip)}
                      className="flex-1 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => openPipModal('edit', pip)}
                      className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handlePipDelete(pip.id)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalType === 'add' && 'Add New Performance Review'}
                    {modalType === 'edit' && 'Edit Performance Review'}
                    {modalType === 'view' && 'Performance Review Details'}
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
                {modalType === 'view' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm text-gray-600">Employee ID</p>
                          <p className="font-medium">{selectedReview?.employee.employeeId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm text-gray-600">Employee Name</p>
                          <p className="font-medium">{selectedReview?.employee.employeeName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium">{selectedReview?.employee.department}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{selectedReview?.employee.position}</p>
                      </div>
                    
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(selectedReview?.rating || 0)
                                    ? getRatingColor(selectedReview?.rating || 0)
                                    : 'text-gray-300'
                                }`}
                                fill={i < Math.floor(selectedReview?.rating || 0) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{selectedReview?.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Last Review</p>
                        <p className="font-medium">{formatDate(selectedReview?.lastReviewDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Review</p>
                        <p className="font-medium">{formatDate(selectedReview?.nextReviewDate)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Goals</p>
                      <p className="bg-gray-50 p-3 rounded-lg">{selectedReview?.goals || 'No goals specified'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Feedback</p>
                      <p className="bg-gray-50 p-3 rounded-lg">{selectedReview?.feedback || 'No feedback provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Achievements</p>
                      <p className="bg-gray-50 p-3 rounded-lg">{selectedReview?.achievements || 'No achievements recorded'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                        <input
                          type="text"
                          required
                          pattern="EMP\\d+"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.employee?.employeeId || ''}
                          onChange={(e) => {
                            updateEmployeeField('employeeId', e.target.value);
                            setEmployeeNotFound(false);
                          }}
                          onBlur={() => {
                            const emp = employees.find(emp => emp.employeeId === formData.employee?.employeeId);
                            if (emp) {
                              setFormData(prev => ({
                                ...prev,
                                employee: {
                                  ...prev.employee,
                                  employeeName: emp.employeeName,
                                  department: emp.department,
                                  position: emp.position,
                                }
                              }));
                            }
                          }}
                        />
                        {employeeNotFound && (
                          <div className="text-red-600 text-sm mt-1">Employee not found</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.employee?.employeeName || ''}
                          onChange={(e) => updateEmployeeField('employeeName', e.target.value)}
                          readOnly={!!employees.find(emp => emp.employeeId === formData.employee?.employeeId)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.employee?.position || ''}
                          onChange={(e) => updateEmployeeField('position', e.target.value)}
                          readOnly={!!employees.find(emp => emp.employeeId === formData.employee?.employeeId)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.employee?.department || ''}
                          onChange={(e) => updateEmployeeField('department', e.target.value)}
                          readOnly={!!employees.find(emp => emp.employeeId === formData.employee?.employeeId)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.rating || ''}
                          onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                        >
                          <option value="">Select Rating</option>
                          <option value="1">1.0</option>
                          <option value="1.5">1.5</option>
                          <option value="2">2.0</option>
                          <option value="2.5">2.5</option>
                          <option value="3">3.0</option>
                          <option value="3.5">3.5</option>
                          <option value="4">4.0</option>
                          <option value="4.5">4.5</option>
                          <option value="5">5.0</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.employee?.status || ''}
                          onChange={(e) => setFormData({...formData, employee: {...formData.employee, status: e.target.value}})}
                        >
                          <option value="">Select Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Review Date</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.lastReviewDate || ''}
                          onChange={(e) => setFormData({...formData, lastReviewDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Next Review Date</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.nextReviewDate || ''}
                          onChange={(e) => setFormData({...formData, nextReviewDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.reviewer || ''}
                          onChange={(e) => setFormData({...formData, reviewer: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                      <textarea
                        required
                        maxLength={250}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={formData.goals || ''}
                        onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      />
                      <div className="text-xs text-gray-500 mt-1">{(formData.goals || '').length} / 250</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                      <textarea
                        required
                        maxLength={250}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={formData.feedback || ''}
                        onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                      />
                      <div className="text-xs text-gray-500 mt-1">{(formData.feedback || '').length} / 250</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
                      <textarea
                        required
                        maxLength={250}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={formData.achievements || ''}
                        onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                      />
                      <div className="text-xs text-gray-500 mt-1">{(formData.achievements || '').length} / 250</div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || anyOverLimit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {modalType === 'add' ? 'Add Review' : 'Update Review'}
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PIP Modal */}
      {showPipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {pipModalType === 'add' && 'Add Performance Improvement Plan'}
                  {pipModalType === 'edit' && 'Edit Performance Improvement Plan'}
                  {pipModalType === 'view' && 'Performance Improvement Plan Details'}
                </h2>
                <button
                  onClick={closePipModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {pipModalType === 'view' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Employee ID</p>
                      <p className="font-medium">{selectedPip?.employee.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Employee Name</p>
                      <p className="font-medium">{selectedPip?.employee.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">{selectedPip?.employee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedPip?.planStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : selectedPip?.planStatus === 'CLOSED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedPip?.planStatus}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(selectedPip?.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium">{formatDate(selectedPip?.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Review Date</p>
                      <p className="font-medium">{formatDate(selectedPip?.reviewDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reviewer</p>
                      <p className="font-medium">{selectedPip?.reviewer}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Objectives</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedPip?.objectives || 'No objectives specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Actions</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedPip?.actions || 'No actions specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Support</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedPip?.support || 'No support specified'}</p>
                  </div>
                  {selectedPip?.goalSetting && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Goal Setting</p>
                      <p className="bg-gray-50 p-3 rounded-lg">{selectedPip?.goalSetting}</p>
                    </div>
                  )}
                  {selectedPip?.comments && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Comments</p>
                      <p className="bg-gray-50 p-3 rounded-lg">{selectedPip?.comments}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.employee?.employeeId || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, employee: { ...prev.employee, employeeId: e.target.value } }))}
                        onBlur={() => {
                          const emp = employees.find(emp => emp.employeeId === pipFormData.employee?.employeeId);
                          if (emp) {
                            setPipFormData(prev => ({ ...prev, employee: { ...prev.employee, employeeName: emp.employeeName, department: emp.department, position: emp.position } }));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.employee?.employeeName || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, employee: { ...prev.employee, employeeName: e.target.value } }))}
                        readOnly={!!employees.find(emp => emp.employeeId === pipFormData.employee?.employeeId)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.employee?.department || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, employee: { ...prev.employee, department: e.target.value } }))}
                        readOnly={!!employees.find(emp => emp.employeeId === pipFormData.employee?.employeeId)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.planStatus || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, planStatus: e.target.value as 'ACTIVE' | 'COMPLETED' | 'CLOSED' }))}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.startDate || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.endDate || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.reviewDate || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pipFormData.reviewer || ''}
                        onChange={e => setPipFormData(prev => ({ ...prev, reviewer: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Objectives</label>
                    <textarea
                      required
                      maxLength={250}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      value={pipFormData.objectives || ''}
                      onChange={e => setPipFormData(prev => ({ ...prev, objectives: e.target.value }))}
                    />
                    <div className="text-xs text-gray-500 mt-1">{(pipFormData.objectives || '').length} / 250</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                    <textarea
                      required
                      maxLength={250}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      value={pipFormData.actions || ''}
                      onChange={e => setPipFormData(prev => ({ ...prev, actions: e.target.value }))}
                    />
                    <div className="text-xs text-gray-500 mt-1">{(pipFormData.actions || '').length} / 250</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support</label>
                    <textarea
                      required
                      maxLength={250}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      value={pipFormData.support || ''}
                      onChange={e => setPipFormData(prev => ({ ...prev, support: e.target.value }))}
                    />
                    <div className="text-xs text-gray-500 mt-1">{(pipFormData.support || '').length} / 250</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal Setting</label>
                    <textarea
                      maxLength={250}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      value={pipFormData.goalSetting || ''}
                      onChange={e => setPipFormData(prev => ({ ...prev, goalSetting: e.target.value }))}
                    />
                    <div className="text-xs text-gray-500 mt-1">{(pipFormData.goalSetting || '').length} / 250</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea
                      maxLength={250}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={2}
                      value={pipFormData.comments || ''}
                      onChange={e => setPipFormData(prev => ({ ...prev, comments: e.target.value }))}
                    />
                    <div className="text-xs text-gray-500 mt-1">{(pipFormData.comments || '').length} / 250</div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePipSubmit}
                      disabled={pipLoading}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      {pipModalType === 'add' ? 'Add PIP' : 'Update PIP'}
                    </button>
                    <button
                      type="button"
                      onClick={closePipModal}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}