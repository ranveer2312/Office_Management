'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Plus, X, Send, Users, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface TrainingProgram {
  id?: number;
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

export default function HRTrainingPage() {
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendar' | 'skillrequest'>('calendar');
  const [selectedRequest, setSelectedRequest] = useState<SkillRequest | null>(null);
  const [responseForm, setResponseForm] = useState({ status: 'APPROVED' as 'APPROVED' | 'REJECTED', hrComments: '' });
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'training' | 'assign' | 'edit'>('training');
  const [editingTraining, setEditingTraining] = useState<TrainingProgram | null>(null);
  const [employees, setEmployees] = useState<{id: number; employeeId: string; employeeName: string; department: string}[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<TrainingProgram | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [notifiedEmployees, setNotifiedEmployees] = useState<{[trainingId: number]: string[]}>({});
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', trainerName: '', capacity: '', startTime: '', endTime: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trainingsRes, employeesRes, skillRequestsRes] = await Promise.all([
        fetch(APIURL +'/api/trainings'),
        fetch(APIURL + '/api/employees'),
        fetch(APIURL + '/api/skill-requests')
      ]);
      
      if (trainingsRes.ok) {
        const trainingsData = await trainingsRes.json();
        const mappedTrainings = trainingsData.map((training: TrainingProgram) => ({
          ...training,
          date: Array.isArray(training.date) ? `${training.date[0]}-${String(training.date[1]).padStart(2, '0')}-${String(training.date[2]).padStart(2, '0')}` : training.date,
          startTime: Array.isArray(training.startTime) ? `${String(training.startTime[0]).padStart(2, '0')}:${String(training.startTime[1]).padStart(2, '0')}` : training.startTime,
          endTime: Array.isArray(training.endTime) ? `${String(training.endTime[0]).padStart(2, '0')}:${String(training.endTime[1]).padStart(2, '0')}` : training.endTime
        }));
        setTrainings(mappedTrainings);
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);
      } else {
        toast.error('Failed to load employees list');
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
  };

  const handleSubmit = async () => {
    try {
      if (modalType === 'training' || modalType === 'edit') {
        const trainingData = {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          trainerName: formData.trainerName,
          capacity: parseInt(formData.capacity),
          startTime: formData.startTime,
          endTime: formData.endTime
        };
        
        const url = modalType === 'edit' ? APIURL +`/api/trainings/${editingTraining?.id}` : APIURL + '/api/trainings';
        const method = modalType === 'edit' ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trainingData)
        });
        
        if (res.ok) {
          toast.success(`Training program ${modalType === 'edit' ? 'updated' : 'created'} successfully`);
          fetchData();
        }
      } else if (modalType === 'assign') {
        const notificationData = {
          employeeIds: selectedEmployees
        };
        
        const res = await fetch(`${APIURL}/api/trainings/${selectedTraining?.id}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData)
        });
        
        if (res.ok) {
          toast.success(`Training notification sent to ${selectedEmployees.length} employee(s) successfully`);
          const trainingId = selectedTraining!.id!;
          setNotifiedEmployees(prev => ({
            ...prev,
            [trainingId]: [...(prev[trainingId] || []), ...selectedEmployees]
          }));
          setSelectedEmployees([]);
          setSelectedTraining(null);
        } else {
          toast.error('Failed to send training notifications');
        }
      }
      
      setShowModal(false);
      setEditingTraining(null);
      setFormData({
        title: '', description: '', date: '', trainerName: '', capacity: '', startTime: '', endTime: ''
      });
    } catch {
      toast.error('Failed to save data');
    }
  };

  const handleEdit = (training: TrainingProgram) => {
    setEditingTraining(training);
    setFormData({
      title: training.title,
      description: training.description,
      date: training.date as string,
      trainerName: training.trainerName,
      capacity: training.capacity.toString(),
      startTime: training.startTime as string,
      endTime: training.endTime as string
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async (trainingId: number) => {
    if (confirm('Are you sure you want to delete this training program?')) {
      try {
        const res = await fetch(APIURL + `/api/trainings/${trainingId}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          toast.success('Training program deleted successfully');
          fetchData();
        } else {
          toast.error('Failed to delete training program');
        }
      } catch {
        toast.error('Failed to delete training program');
      }
    }
  };

  const handleRequestResponse = async () => {
    if (!selectedRequest) return;
    
    try {
      const res = await fetch(`${APIURL}/api/skill-requests/${selectedRequest.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: responseForm.status,
          hrComments: responseForm.hrComments
        })
      });
      
      if (res.ok) {
        toast.success(`Skill request ${responseForm.status.toLowerCase()} successfully`);
        setShowResponseModal(false);
        setSelectedRequest(null);
        setResponseForm({ status: 'APPROVED', hrComments: '' });
        fetchData();
      } else {
        toast.error('Failed to update skill request');
      }
    } catch {
      toast.error('Failed to update skill request');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-100">Training & Development</h1>
        <p className="text-gray-100">Manage training programs and skill requests</p>
      </div>

      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Training Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('skillrequest')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            activeTab === 'skillrequest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Skill Requests</span>
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-100">Training Programs</h2>
            <button
              onClick={() => { setModalType('training'); setShowModal(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Training</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((training) => (
              <div key={training.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Training
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{training.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{training.description}</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="font-medium">Date:</span> {training.date}</p>
                  <p><span className="font-medium">Time:</span> {training.startTime} - {training.endTime}</p>
                  <p><span className="font-medium">Trainer:</span> {training.trainerName}</p>
                  <p><span className="font-medium">Capacity:</span> {training.capacity}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(training)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(training.id!)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTraining(training);
                      setModalType('assign');
                      setShowModal(true);
                    }}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Notify Employees</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'skillrequest' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Employee Skill Requests</h2>
          </div>
          
          {skillRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Skill Requests</h3>
              <p className="text-gray-600">No employees have submitted skill requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {skillRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.skillName}</h3>
                      <p className="text-sm text-gray-600">{request.employeeName} ({request.employeeId})</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        request.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        request.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.priority} Priority
                      </span>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <p><span className="font-medium">Request Date:</span> {new Date(request.requestDate).toLocaleDateString()}</p>
                    {request.responseDate && (
                      <p><span className="font-medium">Response Date:</span> {new Date(request.responseDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {request.hrComments && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">HR Comments</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{request.hrComments}</p>
                    </div>
                  )}
                  
                  {request.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setResponseForm({ status: 'APPROVED', hrComments: '' });
                          setShowResponseModal(true);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setResponseForm({ status: 'REJECTED', hrComments: '' });
                          setShowResponseModal(true);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {modalType === 'training' ? 'Add Training Program' : 
                   modalType === 'edit' ? 'Edit Training Program' : 'Notify Employees About Training'}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {modalType === 'assign' ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Training: {selectedTraining?.title}</h3>
                    <p className="text-sm text-gray-600">{selectedTraining?.description}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Select Employees</label>
                      <button
                        type="button"
                        onClick={() => {
                          const allEmployeeIds = employees.map(emp => emp.employeeId);
                          setSelectedEmployees(selectedEmployees.length === employees.length ? [] : allEmployeeIds);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                      {employees.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No employees found</p>
                        </div>
                      ) : (
                        employees.map((employee) => (
                          <label key={employee.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.employeeId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployees([...selectedEmployees, employee.employeeId]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter(id => id !== employee.employeeId));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{employee.employeeName}</div>
                              <div className="text-sm text-gray-500">{employee.employeeId} - {employee.department}</div>
                            </div>
                            {selectedTraining && notifiedEmployees[selectedTraining.id!]?.includes(employee.employeeId) && (
                              <div className="flex items-center text-green-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs ml-1">Notified</span>
                              </div>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {selectedEmployees.length} employee(s) selected
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Training Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                  <input type="date" placeholder="Training Date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="time" placeholder="Start Time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <input type="time" placeholder="End Time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="px-3 py-2 border rounded-lg" />
                  </div>
                  <input type="text" placeholder="Trainer Name" value={formData.trainerName} onChange={(e) => setFormData({...formData, trainerName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                  <input type="number" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Save</button>
                <button onClick={() => setShowModal(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {responseForm.status === 'APPROVED' ? 'Approve' : 'Reject'} Skill Request
                </h2>
                <button onClick={() => setShowResponseModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Employee:</span> {selectedRequest?.employeeName}</p>
                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Skill:</span> {selectedRequest?.skillName}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Priority:</span> {selectedRequest?.priority}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HR Comments</label>
                <textarea
                  value={responseForm.hrComments}
                  onChange={(e) => setResponseForm({...responseForm, hrComments: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder={responseForm.status === 'APPROVED' ? 
                    'Provide details about training arrangements...' : 
                    'Explain the reason for rejection...'}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleRequestResponse}
                  className={`flex-1 text-white px-4 py-2 rounded-lg ${
                    responseForm.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {responseForm.status === 'APPROVED' ? 'Approve Request' : 'Reject Request'}
                </button>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
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