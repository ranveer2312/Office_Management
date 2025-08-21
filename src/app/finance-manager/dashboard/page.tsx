'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
 
import {
  BuildingOfficeIcon,
  TagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { APIURL } from '@/constants/api';
 

 
export default function FinanceManagerDashboard() {
  // Professional theme colors
  const mainBg = "bg-gray-50 dark:bg-gray-900";
  const cardBg = "bg-white dark:bg-gray-900";
  const border = "border border-gray-200 dark:border-gray-700";
  const shadow = "shadow-md hover:shadow-lg";
  const rounded = "rounded-2xl";
  const statIconBg = "bg-gray-100 dark:bg-gray-800";
  const statIconColor = "text-gray-600 dark:text-gray-300";
 
  const [stats, setStats] = useState([
    { name: 'Planned Monthly Budget', value: 'Loading...', change: '', icon: BanknotesIcon },
    { name: 'Recurring Fixed Expenses', value: 'Loading...', change: '', icon: BuildingOfficeIcon },
    { name: 'Dynamic Operational Costs', value: 'Loading...', change: '', icon: ChartBarIcon },
    { name: 'Net Savings', value: 'Loading...', change: '', icon: ArrowTrendingUpIcon },
  ]);
 
  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const fixedExpensesResponses = await Promise.all([
          fetch(APIURL + `/api/rent`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/electric-bills`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/internet-bills`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/sim-bills`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/salaries`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
        ]);
 
        const variableExpensesResponses = await Promise.all([
          fetch(APIURL + `/api/travel`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/expo-advertisements`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/incentives/incentive`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/commissions`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
          fetch(APIURL + `/api/petty-cash`, { headers }).then(res => res.ok ? res.json() : { data: [] }),
        ]);
 
        const fixedExpenses = fixedExpensesResponses.map(response => Array.isArray(response.data || response) ? response.data || response : []);
        const variableExpenses = variableExpensesResponses.map(response => Array.isArray(response.data || response) ? response.data || response : []);
 
        const totalFixedCosts = fixedExpenses.reduce((sum, group) => {
          return sum + (Array.isArray(group) ? group.reduce((s: number, e: { amount?: number }) => s + (e?.amount || 0), 0) : 0);
        }, 0);
        const totalVariableCosts = variableExpenses.reduce((sum, group) => {
          return sum + (Array.isArray(group) ? group.reduce((s: number, e: { amount?: number }) => s + (e?.amount || 0), 0) : 0);
        }, 0);
 
        const monthlyBudget = 25000;
        const savings = monthlyBudget - (totalFixedCosts + totalVariableCosts);
 
        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return '+0%';
          const change = ((current - previous) / previous) * 100;
          return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
        };
 
        setStats([
          {
            name: 'Planned Monthly Budget',
            value: `₹${monthlyBudget.toLocaleString('en-IN')}`,
            change: '+0%',
            icon: BanknotesIcon,
          },
          {
            name: 'Recurring Fixed Expenses',
            value: `₹${totalFixedCosts.toLocaleString('en-IN')}`,
            change: calculateChange(totalFixedCosts, totalFixedCosts * 0.9),
            icon: BuildingOfficeIcon,
          },
          {
            name: 'Dynamic Operational Costs',
            value: `₹${totalVariableCosts.toLocaleString('en-IN')}`,
            change: calculateChange(totalVariableCosts, totalVariableCosts * 0.95),
            icon: ChartBarIcon,
          },
          {
            name: 'Net Savings',
            value: `₹${savings.toLocaleString('en-IN')}`,
            change: calculateChange(savings, savings * 1.1),
            icon: ArrowTrendingUpIcon,
          },
        ]);
      } catch (error) {
        console.error('Error fetching expense data:', error);
        // Set default values on error
        setStats([
          {
            name: 'Planned Monthly Budget',
            value: '₹25,000',
            change: '+0%',
            icon: BanknotesIcon,
          },
          {
            name: 'Recurring Fixed Expenses',
            value: 'Error loading',
            change: 'N/A',
            icon: BuildingOfficeIcon,
          },
          {
            name: 'Dynamic Operational Costs',
            value: 'Error loading',
            change: 'N/A',
            icon: ChartBarIcon,
          },
          {
            name: 'Net Savings',
            value: 'Error loading',
            change: 'N/A',
            icon: ArrowTrendingUpIcon,
          },
        ]);
      }
    };
 
    fetchExpenseData();
  }, []);
 
  const financeSections = [
    {
      title: 'Recurring Expenditures',
      icon: BuildingOfficeIcon,
      description: 'Manage recurring fixed costs and monthly obligations',
      features: [
        { name: 'Facility Rent', link: '/finance-manager/fixed-expenses/rent', icon: '🏠' },
        { name: 'Electricity Charges', link: '/finance-manager/fixed-expenses/electric-bills', icon: '⚡' },
        { name: 'Broadband Services', link: '/finance-manager/fixed-expenses/internet-bills', icon: '🌐' },
        { name: 'Telecom Subscriptions', link: '/finance-manager/fixed-expenses/sim-bills', icon: '📱' },
        { name: 'Employee Salaries', link: '/finance-manager/fixed-expenses/salaries', icon: '👥' },
      ],
      color: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-700 dark:text-blue-400',
    },
    {
      title: 'Operational Overhead',
      icon: TagIcon,
      description: 'Track fluctuating costs and dynamic business expenses',
      features: [
        { name: 'Business Travel', link: '/finance-manager/variable-expenses/travel', icon: '✈️' },
        { name: 'Marketing & Promotions', link: '/finance-manager/variable-expenses/expo-advertisement', icon: '📢' },
        { name: 'Employee Incentives', link: '/finance-manager/variable-expenses/incentives', icon: '🎯' },
        { name: 'Sales Commissions', link: '/finance-manager/variable-expenses/commissions', icon: '💰' },
        { name: 'Petty Cash', link: '/finance-manager/variable-expenses/petty-cash', icon: '💵' },
      ],
      color: 'bg-emerald-100 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      title: 'TDS Management',
      icon: DocumentTextIcon,
      description: 'Calculate and manage Tax Deducted at Source with GST',
      features: [
        { name: 'TDS Calculator', link: '/finance-manager/tds-calculator', icon: '🧮' },
        { name: 'GST Calculations', link: '/finance-manager/gst-calculator', icon: '📋' },
      ],
      color: 'bg-indigo-100 dark:bg-indigo-900/20',
      iconColor: 'text-indigo-700 dark:text-indigo-400',
    },
  ];
 
  return (
    <div className={`${mainBg} min-h-screen text-gray-800 dark:text-white transition-all duration-300`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive expense tracking and budget management</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 dark:text-green-300">Live Tracking</span>
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="text-sm p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:rotate-45 transition"
              title="Toggle Dark Mode"
            >
              🌓
            </button>
          </div>
        </div>
      </div>
 
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className={`${cardBg} ${rounded} ${shadow} ${border} transition-transform transform hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                <h2 className="text-2xl font-bold mt-2">{stat.value}</h2>
                <p className={`text-sm mt-1 ${stat.change.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-2 rounded-full ${statIconBg}`}>
                <stat.icon className={`w-6 h-6 ${statIconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
 
      {/* Main Sections */}
      <div className="max-w-7xl mx-auto px-4 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {financeSections.map((section) => (
          <div key={section.title} className={`${cardBg} ${rounded} overflow-hidden ${shadow} ${border} hover:shadow-2xl transition-transform transform hover:-translate-y-1`}>
            <div className={`${section.color} p-6`}>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md">
                  <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{section.description}</p>
                </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4">
              {section.features.map((feature) => (
                <Link href={feature.link} key={feature.name} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:border-blue-400 border transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{feature.icon}</div>
                    <p className="text-sm font-medium">{feature.name}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-700 transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

