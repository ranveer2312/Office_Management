'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, UserPlus, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { APIURL } from '@/constants/api';

interface RegisterFormData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  roles: string[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    roles: [] // Remove default role
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormData & { password: string; username: string; fullName: string; email: string }>>({});

  const availableRoles = [
    'ADMIN',
    'STORE',
    'FINANCE',
    'HR',
    'DATA_MANAGER',
  ];

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role]
    }));
  };

  // Username validation
  function validateUsername(username: string): string | undefined {
    if (username.length < 3) return 'Username must be at least 3 characters.';
    if (username.length > 30) return 'Username must be at most 30 characters.';
    if (!/^[a-zA-Z]+$/.test(username)) return 'Username can only contain letters (no numbers or special characters).';
    return undefined;
  }

  // Full Name validation
  function validateFullName(fullName: string): string | undefined {
    if (fullName.length < 3) return 'Full Name must be at least 3 characters.';
    if (fullName.length > 30) return 'Full Name must be at most 30 characters.';
    if (!/^[a-zA-Z ]+$/.test(fullName)) return 'Full Name can only contain letters and spaces.';
    return undefined;
  }

  // Email validation
  function validateEmail(email: string): string | undefined {
    if (email.length < 6) return 'Email must be at least 6 characters.';
    if (email.length > 100) return 'Email must be at most 100 characters.';
    // Optionally, add a regex for email format
    return undefined;
  }

  // Password validation (at least 8 chars, with upper, lower, number, special)
  function validatePassword(password: string): string | undefined {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
    return undefined;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    // Validate all fields
    const usernameError = validateUsername(formData.username);
    const fullNameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const pwdError = validatePassword(formData.password);

    const errors: Partial<RegisterFormData & { password: string; username: string; fullName: string; email: string }> = {};
    if (usernameError) errors.username = usernameError;
    if (fullNameError) errors.fullName = fullNameError;
    if (emailError) errors.email = emailError;
    if (pwdError) errors.password = pwdError;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      toast.error(Object.values(errors)[0] as string);
      return;
    }

    // Validate that at least one role is selected
    if (formData.roles.length === 0) {
      toast.error('Please select at least one role');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(APIURL +'/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (response.status === 400) {
          toast.error('Invalid registration data. Please check your information.');
        } else if (response.status === 409) {
          toast.error('Username or email already exists. Please use a different username or email.');
          setFormErrors((prev) => ({ ...prev, username: 'Username or email already exists.' }));
        } else if (response.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error('Registration failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please log in.');
        router.push('/login');
      } else {
        const errorMessage = data.message || 'Registration failed. Please try again.';
        toast.error(errorMessage);
        if (errorMessage.toLowerCase().includes('username')) {
          setFormErrors((prev) => ({ ...prev, username: errorMessage }));
        }
        if (errorMessage.toLowerCase().includes('email')) {
          setFormErrors((prev) => ({ ...prev, email: errorMessage }));
        }
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error('Network error. Please check your internet connection and try again.');
      } else if (err instanceof SyntaxError) {
        toast.error('Invalid response from server. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-8 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#f9fafb',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f9fafb',
            },
          },
        }}
      />
      
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative max-h-[95vh] overflow-y-auto scrollbar-hide">
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 blur-sm -z-10"></div>
        
        {/* Back to Login Link */}
        <Link 
          href="/login" 
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6 font-medium transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            Create Account
          </h1>
          <p className="text-gray-600 font-medium">Join us and start your journey</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Enter username"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z]+"
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  const error = validateUsername(e.target.value);
                  setFormErrors((prev) => ({ ...prev, username: error }));
                }}
                className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border ${
                  formErrors.username 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                } rounded-xl focus:ring-4 transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium`}
              />
            </div>
            {formErrors.username && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.username}
              </p>
            )}
          </div>

          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Enter full name"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z ]+"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  const error = validateFullName(e.target.value);
                  setFormErrors((prev) => ({ ...prev, fullName: error }));
                }}
                className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border ${
                  formErrors.fullName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                } rounded-xl focus:ring-4 transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium`}
              />
            </div>
            {formErrors.fullName && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.fullName}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
              <input
                type="email"
                placeholder="Enter email address"
                required
                minLength={6}
                maxLength={100}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  const error = validateEmail(e.target.value);
                  setFormErrors((prev) => ({ ...prev, email: error }));
                }}
                className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border ${
                  formErrors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                } rounded-xl focus:ring-4 transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium`}
              />
            </div>
            {formErrors.email && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
              <input
                type="password"
                placeholder="Create a strong password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  const pwdErr = validatePassword(e.target.value);
                  setPasswordError(pwdErr === undefined ? null : pwdErr);
                  const error = validatePassword(e.target.value);
                  setFormErrors((prev) => ({ ...prev, password: error }));
                }}
                className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border ${
                  (formErrors.password || passwordError) 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                } rounded-xl focus:ring-4 transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium`}
              />
            </div>
            {(formErrors.password || passwordError) && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.password || passwordError}
              </p>
            )}
          </div>

          {/* Roles Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <label className="text-sm font-semibold text-gray-700">Select Roles</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableRoles.map((role) => (
                <label 
                  key={role} 
                  className="flex items-center p-4 bg-gray-50/50 border border-gray-200 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-200 cursor-pointer transition-all duration-200 group"
                >
                  <input
                    type="checkbox"
                    value={role}
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                    className="h-5 w-5 text-indigo-600 border-2 border-gray-300 rounded-md focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors duration-200">
                    {role.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 font-medium">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors duration-200"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}