'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  roles: string[];
}

export const useAuth = (requiredRole?: string) => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userEmail: null,
    roles: []
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      const rolesStr = localStorage.getItem('roles');
      
      if (!token) {
        toast.error('Please login to access this page');
        router.replace('/login');
        return;
      }
      
      let roles: string[] = [];
      if (rolesStr) {
        try {
          roles = JSON.parse(rolesStr);
        } catch (e) {
          console.error('Error parsing roles:', e);
        }
      }
      
      if (requiredRole && !roles.includes(requiredRole)) {
        toast.error(`Access denied. ${requiredRole} role required.`);
        router.replace('/login');
        return;
      }
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        userEmail,
        roles
      });
    };

    checkAuth();
  }, [router, requiredRole]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('roles');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('employeeProfile');
    
    delete (window as typeof window & { authenticatedFetch?: unknown }).authenticatedFetch;
    
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return {
    ...authState,
    logout
  };
};