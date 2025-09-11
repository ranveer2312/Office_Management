'use client';
import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Award, Calendar, Briefcase, ArrowLeft, Target, Plus, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface Employee {
  id: number;
  employeeId: string;
  employeeName: string;
  email: string;
  phoneNumber: string;
  bloodGroup: string;
  profilePhotoUrl: string | null;
  currentAddress: string;
  permanentAddress: string;
  password: string;
  position: string;
  department: string;
  joiningDate: number[];
  relievingDate: number[] | null;
  status: string;
}

interface PerformanceReview {
  id: number;
  employee: Employee;
  reviewStatus: string;
  rating: number;
  lastReviewDate: number[];
  nextReviewDate: number[];
  goals: string;
  feedback: string;
  achievements: string;
  reviewer: string;
  goalSetting: string;
}

interface PIP {
  id: number;
  employeeId: string;
  planStatus: string;
  startDate: number[];
  endDate: number[];
  objectives: string;
  actions: string;
  support: string;
  reviewDate: number[];
  reviewer: string;
  comments: string;
  goalSetting: string;
}

export default function PerformancePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [pips, setPips] = useState<PIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [normalId, setNormalId] = useState<number | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [showOkrModal, setShowOkrModal] = useState(false);
  const [okrFormData, setOkrFormData] = useState({
    targetEmployeeId: '',
    objectives: '',
    keyResults: '',
    feedback: ''
  });
  
  // Check if current employee can give OKR feedback
  const canGiveOkrFeedback = employeeId && ['EMPTA001', 'EMPTA002', 'EMPTA003', 'EMPTA004'].includes(employeeId);

  // Get normal id from employeeProfile in sessionStorage/localStorage on component mount
  useEffect(() => {
    const profile = sessionStorage.getItem('employeeProfile') || localStorage.getItem('employeeProfile');
    let id: string | null = null;
    let normalId: number | null = null;
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        if (parsed && parsed.id) {
          normalId = parsed.id;
        }
        if (parsed && parsed.employeeId) {
          id = parsed.employeeId;
        }
      } catch {}
    } else {
      id = sessionStorage.getItem('employeeId') || localStorage.getItem('employeeId');
    }
    if (!normalId && !id) {
      setError('Employee ID not found. Please login again.');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
      return;
    }
    setNormalId(normalId);
    setEmployeeId(id);
  }, [router]);

  // Fetch performance data when normalId is available
  useEffect(() => {
    const idToUse = normalId ?? employeeId;
    if (!idToUse) return;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const [reviewsRes, pipsRes, employeesRes] = await Promise.all([
          fetch(APIURL + `/api/performance-reviews/employee/byId/${idToUse}`),
          fetch(APIURL + '/api/pips'),
          fetch(APIURL + '/api/employees')
        ]);
        
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
        
        if (pipsRes.ok) {
          const pipsData = await pipsRes.json();
          const employeePips = pipsData.filter((pip: PIP) => pip.employeeId === employeeId);
          setPips(employeePips);
        }
        
        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          setAllEmployees(employeesData);
        }
      } catch {
        setReviews([]);
        setPips([]);
        setAllEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [normalId, employeeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 py-8">Loading performance data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500 py-8">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/employee"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="text-center text-gray-500 py-8">No performance data found.</div>
        </div>
      </div>
    );
  }

  // Use the first review for employee info with null check
  const employee = reviews[0]?.employee;
  
  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/employee"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="text-center text-gray-500 py-8">Employee data not found.</div>
        </div>
      </div>
    );
  }
  
  // Handle OKR feedback submission
  const handleOkrSubmit = async () => {
    if (!okrFormData.targetEmployeeId || !okrFormData.objectives || !okrFormData.keyResults) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch(APIURL + '/api/okr-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmployeeId: employeeId,
          toEmployeeId: okrFormData.targetEmployeeId,
          objectives: okrFormData.objectives,
          keyResults: okrFormData.keyResults,
          feedback: okrFormData.feedback,
          createdDate: new Date().toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        toast.success('OKR feedback submitted successfully');
        setShowOkrModal(false);
        setOkrFormData({ targetEmployeeId: '', objectives: '', keyResults: '', feedback: '' });
      } else {
        toast.error('Failed to submit OKR feedback');
      }
    } catch {
      toast.error('Error submitting OKR feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/employee"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Performance Overview</h1>
            <p className="mt-2 text-gray-600">Track your career growth and achievements</p>
          </div>

          {/* Employee Info and Current Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/50 rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Current Position</h2>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{employee.position}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Department: {employee.department}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Joined on {Array.isArray(employee.joiningDate) ? new Date(employee.joiningDate.join('-')).toLocaleDateString() : new Date(employee.joiningDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: {employee.status}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Current Rating</h2>
                  <div className="flex items-center mt-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <p className="text-2xl font-bold text-gray-900 ml-2">{reviews[0].rating}/5</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Review Status: {reviews[0].reviewStatus}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/50 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {reviews.map((review, idx) => (
                review.achievements && (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">{review.achievements}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white/50 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals</h2>
            <div className="flex flex-wrap gap-2">
              {reviews.map((review, idx) => (
                review.goals && (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{review.goals}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Goal Setting */}
          <div className="bg-white/50 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goal Setting</h2>
            <div className="flex flex-wrap gap-2">
              {reviews.map((review, idx) => (
                review.goalSetting && (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{review.goalSetting}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Performance Improvement Plans */}
          {pips.length > 0 && (
            <div className="bg-white/50 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Improvement Plans</h2>
              <div className="space-y-4">
                {pips.map((pip) => (
                  <div key={pip.id} className="p-4 border rounded-lg bg-orange-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">PIP #{pip.id}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        pip.planStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pip.planStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Start Date:</span>
                        <span className="ml-2">{Array.isArray(pip.startDate) ? new Date(pip.startDate.join('-')).toLocaleDateString() : new Date(pip.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">End Date:</span>
                        <span className="ml-2">{Array.isArray(pip.endDate) ? new Date(pip.endDate.join('-')).toLocaleDateString() : new Date(pip.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Objectives:</span>
                        <p className="mt-1 text-gray-700">{pip.objectives}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Goal Setting:</span>
                        <p className="mt-1 text-gray-700">{pip.goalSetting}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OKR Feedback Section - Only for specific employees */}
          {canGiveOkrFeedback && (
            <div className="bg-white/50 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">OKR Feedback</h2>
                <button
                  onClick={() => setShowOkrModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Give OKR Feedback</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>You can provide OKR feedback to help colleagues achieve their objectives</span>
              </div>
            </div>
          )}

          {/* Performance Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Last Review: {Array.isArray(review.lastReviewDate) ? new Date(review.lastReviewDate.join('-')).toLocaleDateString() : new Date(review.lastReviewDate).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600 ml-4">
                        Next Review: {Array.isArray(review.nextReviewDate) ? new Date(review.nextReviewDate.join('-')).toLocaleDateString() : new Date(review.nextReviewDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.feedback}</p>
                  <p className="text-sm text-gray-600">Reviewer: {review.reviewer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* OKR Feedback Modal */}
        {showOkrModal && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Give OKR Feedback</h2>
                  <button
                    onClick={() => setShowOkrModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                  <select
                    value={okrFormData.targetEmployeeId}
                    onChange={(e) => setOkrFormData(prev => ({ ...prev, targetEmployeeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose an employee...</option>
                    {allEmployees.filter(emp => emp.employeeId !== employeeId).map(emp => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.employeeName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objectives *</label>
                  <textarea
                    required
                    maxLength={250}
                    rows={3}
                    value={okrFormData.objectives}
                    onChange={(e) => setOkrFormData(prev => ({ ...prev, objectives: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Define clear objectives for the employee..."
                  />
                  <div className="text-xs text-gray-500 mt-1">{okrFormData.objectives.length} / 250</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Results *</label>
                  <textarea
                    required
                    maxLength={250}
                    rows={3}
                    value={okrFormData.keyResults}
                    onChange={(e) => setOkrFormData(prev => ({ ...prev, keyResults: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="List measurable key results..."
                  />
                  <div className="text-xs text-gray-500 mt-1">{okrFormData.keyResults.length} / 250</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Feedback</label>
                  <textarea
                    maxLength={250}
                    rows={2}
                    value={okrFormData.feedback}
                    onChange={(e) => setOkrFormData(prev => ({ ...prev, feedback: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any additional feedback or suggestions..."
                  />
                  <div className="text-xs text-gray-500 mt-1">{okrFormData.feedback.length} / 250</div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleOkrSubmit}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </button>
                  <button
                    onClick={() => setShowOkrModal(false)}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Toaster position="top-right" />
      </div>
    </div>
  );
}