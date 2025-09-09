'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  BookOpen,
  Plus,
  Send,
  X,
} from 'lucide-react';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  date: string | number[];
  trainerName: string;
  capacity: number;
  startTime: string | number[];
  endTime: string | number[];
}

interface SkillRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  skillName: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  responseDate?: string;
  hrComments?: string;
}

export default function EmployeeTrainingPage() {
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendar' | 'skillrequest'>('calendar');
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    skillName: '',
    reason: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
  });

  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const storedId = localStorage.getItem('employeeId');
        if (storedId) {
          const res = await fetch(APIURL + `/api/employees/byEmployeeId/${storedId}`);
          if (res.ok) {
            const employee = await res.json();
            setEmployeeId(employee.employeeId);
            setEmployeeName(employee.employeeName);
          }
        }
      } catch {
        toast.error('Failed to fetch employee data');
      }
    };
    fetchEmployeeId();
  }, []);

  const fetchData = useCallback(async () => {
    if (!employeeId) return;

    try {
      const [trainingsRes, skillRequestsRes] = await Promise.all([
        fetch(APIURL + `/api/trainings/employee/${employeeId}`),
        fetch(APIURL + `/api/skill-requests/employee/${employeeId}`),
      ]);

      if (trainingsRes.ok) {
        const trainingsData = await trainingsRes.json();
        const mappedTrainings = trainingsData.map((training: TrainingProgram) => ({
          ...training,
          date: Array.isArray(training.date)
            ? `${training.date[0]}-${String(training.date[1]).padStart(2, '0')}-${String(training.date[2]).padStart(2, '0')}`
            : training.date,
          startTime: Array.isArray(training.startTime)
            ? `${String(training.startTime[0]).padStart(2, '0')}:${String(training.startTime[1]).padStart(2, '0')}`
            : training.startTime,
          endTime: Array.isArray(training.endTime)
            ? `${String(training.endTime[0]).padStart(2, '0')}:${String(training.endTime[1]).padStart(2, '0')}`
            : training.endTime,
        }));
        setTrainings(mappedTrainings);
      }

      if (skillRequestsRes.ok) {
        const skillRequestsData = await skillRequestsRes.json();
        setSkillRequests(skillRequestsData);
      }
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [employeeId]); // Added employeeId as a dependency for useCallback

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId, fetchData]);

  const handleSkillRequest = async () => {
    if (!employeeId || !employeeName) return;

    try {
      const requestData = {
        employeeId,
        employeeName,
        skillName: requestForm.skillName,
        reason: requestForm.reason,
        priority: requestForm.priority,
      };

      const res = await fetch(APIURL + '/api/skill-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        toast.success('Skill request submitted successfully');
        setShowRequestModal(false);
        setRequestForm({ skillName: '', reason: '', priority: 'MEDIUM' });
        fetchData();
      } else {
        toast.error('Failed to submit skill request');
      }
    } catch {
      toast.error('Failed to submit skill request');
    }
  };

  if (loading) return <div className="p-6 text-center bg-white/90 rounded-lg shadow-md">Loading...</div>;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />

        <div className="mb-8 bg-white/90 rounded-lg shadow-sm border p-6 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-gray-900">Training & Development</h1>
          <p className="text-gray-600">Explore training opportunities and track your skill development</p>
        </div>

        {/* Tab buttons for mobile and desktop */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full sm:w-auto ${
              activeTab === 'calendar' ? 'bg-blue-600/90 text-white' : 'bg-white/90 text-gray-700 border'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Trainings</span>
          </button>
          <button
            onClick={() => setActiveTab('skillrequest')}
            className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full sm:w-auto ${
              activeTab === 'skillrequest' ? 'bg-blue-600/90 text-white' : 'bg-white/90 text-gray-700 border'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Skill Requests</span>
          </button>
        </div>

        {activeTab === 'calendar' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">My Training Programs</h2>

            {trainings.length === 0 ? (
              <div className="bg-white/90 rounded-lg shadow-sm border p-8 text-center backdrop-blur-sm">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Programs</h3>
                <p className="text-gray-600">You haven&apos;t been assigned to any training programs yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainings.map((training, index) => (
                  <div key={`training-${training.id}-${index}`} className="bg-white/90 rounded-lg shadow-sm border p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100/90 text-green-800">
                        Assigned
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{training.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{training.description}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <p><span className="font-medium">Date:</span> {training.date}</p>
                      <p><span className="font-medium">Time:</span> {training.startTime} - {training.endTime}</p>
                      <p><span className="font-medium">Trainer:</span> {training.trainerName}</p>
                      <p><span className="font-medium">Capacity:</span> {training.capacity} seats</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'skillrequest' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold mb-4 sm:mb-0">My Skill Requests</h2>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-blue-600/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700/90 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Request Skill</span>
              </button>
            </div>

            {skillRequests.length === 0 ? (
              <div className="bg-white/90 rounded-lg shadow-sm border p-8 text-center backdrop-blur-sm">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Skill Requests</h3>
                <p className="text-gray-600">You haven&apos;t submitted any skill requests yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillRequests.map((request, index) => (
                  <div key={`skillrequest-${request.id}-${index}`} className="bg-white/90 rounded-lg shadow-sm border p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{request.skillName}</h3>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            request.priority === 'HIGH'
                              ? 'bg-red-100/90 text-red-800'
                              : request.priority === 'MEDIUM'
                              ? 'bg-yellow-100/90 text-yellow-800'
                              : 'bg-green-100/90 text-green-800'
                          }`}
                        >
                          {request.priority} Priority
                        </span>
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            request.status === 'APPROVED'
                              ? 'bg-green-100/90 text-green-800'
                              : request.status === 'REJECTED'
                              ? 'bg-red-100/90 text-red-800'
                              : 'bg-yellow-100/90 text-yellow-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
                      <p className="text-sm text-gray-700 bg-gray-50/90 p-3 rounded-lg">{request.reason}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <p>
                        <span className="font-medium">Request Date:</span> {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                      {request.responseDate && (
                        <p>
                          <span className="font-medium">Response Date:</span> {new Date(request.responseDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {request.hrComments && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">HR Comments</h4>
                        <p className="text-sm text-gray-700 bg-blue-50/90 p-3 rounded-lg">{request.hrComments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200/90">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Request New Skill</h2>
                <button onClick={() => setShowRequestModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                <input
                  type="text"
                  value={requestForm.skillName}
                  onChange={(e) => setRequestForm({ ...requestForm, skillName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/90 focus:border-blue-500/90 bg-white/90"
                  placeholder="e.g., React.js, Python, Data Analysis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={requestForm.priority}
                  onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/90 focus:border-blue-500/90 bg-white/90"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/90 focus:border-blue-500/90 bg-white/90"
                  rows={4}
                  placeholder="Explain why you need this skill and how it will help your work..."
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={handleSkillRequest}
                  disabled={!requestForm.skillName || !requestForm.reason}
                  className="flex-1 bg-blue-600/90 text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 disabled:bg-gray-300/90 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-200/90 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300/90"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}