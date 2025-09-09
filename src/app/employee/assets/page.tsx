'use client';

import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, CreditCard, Car, Wifi, AlertCircle, CheckCircle, Wrench, Package, PackageCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { APIURL } from '@/constants/api';

// --- Interfaces remain the same ---
interface Asset {
  id: number;
  name: string;
  type: 'laptop' | 'phone' | 'sim' | 'idCard' | 'vehicle';
  assignedDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'maintenance';
  serialNumber: string;
  condition: 'good' | 'fair' | 'poor';
  notes?: string;
}

interface ApiAsset {
  id: number;
  assetName: string;
  category: string;
  serialNumber: string;
  status: string;
  assetcondition: string;
  assignedTo?: string;
}

const API_BASE_URL = APIURL + '/api/assets';

// --- Mapping function remains the same ---
function mapApiAssetToAsset(api: ApiAsset): Asset {
  let status: Asset['status'] = 'active';
  if (api.status === 'Under Maintenance') status = 'maintenance';
  else if (api.status === 'Returned') status = 'returned';
  else if (api.status === 'Available' || api.status === 'Assigned') status = 'active';

  let condition: Asset['condition'] = 'good';
  if (api.assetcondition === 'Fair') condition = 'fair';
  else if (api.assetcondition === 'Poor') condition = 'poor';
  else if (api.assetcondition === 'Good' || api.assetcondition === 'New') condition = 'good';

  let type: Asset['type'] = 'laptop';
  if (api.category.toLowerCase().includes('phone')) type = 'phone';
  else if (api.category.toLowerCase().includes('sim')) type = 'sim';
  else if (api.category.toLowerCase().includes('card')) type = 'idCard';
  else if (api.category.toLowerCase().includes('vehicle')) type = 'vehicle';

  return {
    id: api.id,
    name: api.assetName,
    type,
    assignedDate: '', // Not provided by API
    status,
    serialNumber: api.serialNumber,
    condition,
    notes: api.assignedTo ? `Assigned by: ${api.assignedTo}` : undefined,
  };
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // --- All logic hooks remain the same ---
  useEffect(() => {
    const id = sessionStorage.getItem('employeeId') || localStorage.getItem('employeeId');
    if (!id) {
      setError('Employee ID not found. Please login again.');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
      return;
    }
    setEmployeeId(id);
  }, [router]);

  useEffect(() => {
    if (!employeeId) return;

    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        const mapped = Array.isArray(data) ? data.map(mapApiAssetToAsset) : [];
        setAssets(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [employeeId]);

  // --- UI Helper Functions (Updated with new icon wrappers) ---
  const getAssetIcon = (type: Asset['type']) => {
    const iconProps = { className: "w-7 h-7" };
    switch (type) {
      case 'laptop':
        return <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100/90 text-blue-600">{<Laptop {...iconProps} />}</div>;
      case 'phone':
        return <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-100/90 text-green-600">{<Smartphone {...iconProps} />}</div>;
      case 'sim':
        return <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-purple-100/90 text-purple-600">{<Wifi {...iconProps} />}</div>;
      case 'idCard':
        return <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-orange-100/90 text-orange-600">{<CreditCard {...iconProps} />}</div>;
      case 'vehicle':
        return <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100/90 text-red-600">{<Car {...iconProps} />}</div>;
      default:
        // Added a default case for robustness
        return <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100/90 text-gray-600">{<Package {...iconProps} />}</div>;
    }
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100/90 text-green-800';
      case 'returned': return 'bg-gray-200/90 text-gray-800';
      case 'maintenance': return 'bg-yellow-100/90 text-yellow-800';
    }
  };

  const getConditionColor = (condition: Asset['condition']) => {
    switch (condition) {
      case 'good': return 'bg-blue-100/90 text-blue-800';
      case 'fair': return 'bg-orange-100/90 text-orange-800';
      case 'poor': return 'bg-red-100/90 text-red-800';
    }
  };

  // --- ✨ NEW, MODERNIZED JSX ✨ ---
  return (
    <div className="bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">

          {/* Back Link */}
          {/* <div className="mb-4">
            <Link href="/employee" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div> */}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Assets</h1>
              <p className="mt-2 text-md text-gray-500">View and manage your assigned company assets.</p>
            </div>
            {/* You could add a button here for "Request New Asset" if functionality existed */}
          </div>

          {/* Loading/Error State */}
          {loading ? (
            <div className="text-center text-gray-500 py-12 bg-white/90 rounded-xl shadow-md border border-white/20">Loading assets...</div>
          ) : error ? (
            <div className="bg-red-50/90 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">Error: {error}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* --- 📊 REVAMPED Asset Stats Cards --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Assets Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-400/90 to-teal-500/90 p-6 shadow-lg text-white backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-5xl font-bold">{assets.filter(a => a.status === 'active').length}</p>
                      <p className="text-sm font-medium opacity-90 mt-1">Active Assets</p>
                    </div>
                    <PackageCheck className="w-16 h-16 opacity-20 absolute -right-4 -top-2" />
                  </div>
                </div>

                {/* Under Maintenance Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400/90 to-orange-500/90 p-6 shadow-lg text-white backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-5xl font-bold">{assets.filter(a => a.status === 'maintenance').length}</p>
                      <p className="text-sm font-medium opacity-90 mt-1">Under Maintenance</p>
                    </div>
                    <Wrench className="w-16 h-16 opacity-20 absolute -right-4 -top-2" />
                  </div>
                </div>

                {/* Returned Assets Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-500/90 to-gray-700/90 p-6 shadow-lg text-white backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-5xl font-bold">{assets.filter(a => a.status === 'returned').length}</p>
                      <p className="text-sm font-medium opacity-90 mt-1">Returned Assets</p>
                    </div>
                    <CheckCircle className="w-16 h-16 opacity-20 absolute -right-4 -top-2" />
                  </div>
                </div>
              </div>

              {/* --- 📋 POLISHED Asset List --- */}
              <div className="bg-white/90 rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Asset Details</h2>
                <div className="space-y-4">
                  {assets.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                      <Package className="w-12 h-12 mx-auto text-gray-300" />
                      <p className="mt-4">You have no assets assigned to you.</p>
                    </div>
                  ) : (
                    assets.map((asset) => (
                      <div key={asset.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50/90 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                          {getAssetIcon(asset.type)}
                          <div>
                            <p className="font-semibold text-gray-800">{asset.name}</p>
                            <p className="text-sm text-gray-500">
                              Serial: {asset.serialNumber}
                            </p>
                            {asset.notes && (
                              <p className="text-xs text-gray-500 mt-1">{asset.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 self-end sm:self-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getConditionColor(asset.condition)}`}>
                            {asset.condition}
                          </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(asset.status)}`}>
                            {asset.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}