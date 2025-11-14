'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download, FileText, Presentation, Users, Building, Database, Store, UserCheck, DollarSign,
  ArrowRight, Menu, X, Phone, Mail, MapPin, Award, Target, TrendingUp, Shield, CheckCircle, Star,
  Globe, Zap, Play, Clock, Sparkles, Rocket, Heart, ChevronRight, Check, Cpu, BarChart, RefreshCw,
  Handshake, CalendarCheck, BookOpen, Clock4, Briefcase, Tablet, LayoutGrid, CheckSquare, ShieldCheck,
  BarChart3, Settings, FileSpreadsheet, PieChart, Activity, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  subItems?: NavItem[];
}

// --- NEW DATA: 9 Detailed Product Items for Mega Dropdown ---
interface ProductItemData {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
    colorClass: string;
}

const detailedProducts: ProductItemData[] = [
    {
        id: "data-management",
        icon: Database,
        title: "Data Management",
        description: "Centralize and organize all your business data in one secure platform",
        href: "/products/data-management",
        colorClass: "text-blue-500 bg-blue-500/10"
    },
    {
        id: "hr-management",
        icon: Users,
        title: "HR Management",
        description: "Complete human resource management from hiring to retirement",
        href: "/products/hr-management",
        colorClass: "text-green-500 bg-green-500/10"
    },
    {
        id: "finance-accounting",
        icon: DollarSign,
        title: "Finance & Accounting",
        description: "Streamlined financial management and accounting solutions",
        href: "/products/finance-accounting",
        colorClass: "text-emerald-500 bg-emerald-500/10"
    },
    {
        id: "inventory-management",
        icon: Store,
        title: "Inventory Management",
        description: "Track and manage your inventory with real-time insights",
        href: "/products/inventory-management",
        colorClass: "text-orange-500 bg-orange-500/10"
    },
    {
        id: "project-management",
        icon: Target,
        title: "Project Management",
        description: "Plan, execute, and track projects with advanced tools",
        href: "/products/project-management",
        colorClass: "text-purple-500 bg-purple-500/10"
    },
    {
        id: "analytics-reporting",
        icon: BarChart3,
        title: "Analytics & Reporting",
        description: "Powerful analytics and reporting for data-driven decisions",
        href: "/products/analytics-reporting",
        colorClass: "text-cyan-500 bg-cyan-500/10"
    },
    {
        id: "document-management",
        icon: FileText,
        title: "Document Management",
        description: "Secure document storage and management system",
        href: "/products/document-management",
        colorClass: "text-indigo-500 bg-indigo-500/10"
    },
    {
        id: "compliance-security",
        icon: Shield,
        title: "Compliance & Security",
        description: "Ensure data security and regulatory compliance",
        href: "/products/compliance-security",
        colorClass: "text-red-500 bg-red-500/10"
    },
    {
        id: "integration-tools",
        icon: Settings,
        title: "Integration Tools",
        description: "Seamlessly integrate with your existing business tools",
        href: "/products/integration-tools",
        colorClass: "text-teal-500 bg-teal-500/10"
    },
];
// -----------------------------------------------------------

// ===============================================
// 1. REFACTORED: Extracted Components & Hooks
// (Rest of the original component definitions remain the same)
// ===============================================

// Hook for scroll-triggered animations (Intersection Observer)
const useScrollAnimation = (threshold: number = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      // Only set to visible if it enters the viewport
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Optional: stop observing once visible
        observer.unobserve(element); 
      }
    }, { threshold });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
};

// Wrapper Component for Scroll Animations
const AnimatedOnScroll = ({ 
    children, 
    animationClass, 
    delayClass = 'delay-0',
    threshold = 0.1,
    className = ''
}: { 
    children: React.ReactNode, 
    animationClass: string, 
    delayClass?: string,
    threshold?: number,
    className?: string
}) => {
    const { ref, isVisible } = useScrollAnimation(threshold);
    
    return (
        <div 
            ref={ref} 
            className={`${className} ${animationClass} ${delayClass} ${isVisible ? 'is-visible' : ''}`}
        >
            {children}
        </div>
    );
};


// Component for counting animation
const Counter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  // Adjusted step calculation to ensure completion
  const step = target > 0 ? Math.ceil(target / 80) : 0; 

  useEffect(() => {
    if (count < target) {
      const timer = setTimeout(() => {
        setCount(Math.min(target, count + step));
      }, 15); // Slightly slower for better effect
      return () => clearTimeout(timer);
    }
  }, [count, target, step]);

  return <span>{count.toLocaleString()}</span>;
};

// Stat Card Component
const StatCard = ({ stat }: { stat: typeof initialStats[0] }) => {
  const Icon = stat.icon;
  const targetNumber = parseInt(stat.number);

  return (
    <div className={`p-6 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition-transform duration-300`}>
      <div className={`flex items-center justify-between text-white p-3 rounded-lg shadow-md mb-4 bg-gradient-to-r ${stat.color}`}>
        <Icon className="w-6 h-6" />
        <h3 className="text-xl font-semibold">{stat.label}</h3>
      </div>
      <div className="text-4xl font-bold text-gray-800">
        {targetNumber > 0 ? <Counter target={targetNumber} /> : '0'}
      </div>
    </div>
  );
};

// --- NEW COMPONENT: Detailed Product Item for Dropdown ---
interface DropdownProductItemProps extends ProductItemData {
    onClick: (id: string) => void;
}

const DropdownProductItem = ({ icon: Icon, title, description, href, colorClass, onClick, id }: DropdownProductItemProps) => {
    // Split the color class into icon color and background color
    const [iconColor, bgColor] = colorClass.split(' ');

    return (
        <Link 
            href={href}
            onClick={() => onClick(id)}
            className="flex p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
        >
            <div className={`mr-4 p-2 rounded-full flex-shrink-0 ${bgColor}`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
                <h5 className="font-semibold text-base text-gray-900 group-hover:text-teal-600 transition-colors">{title}</h5>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </Link>
    );
};

// --- NEW COMPONENT: Mega Dropdown Container ---
interface MegaDropdownProps {
    items: ProductItemData[];
    onLinkClick: (id: string) => void;
    onClose: () => void;
}

const MegaDropdown = ({ items, onLinkClick, onClose }: MegaDropdownProps) => {
    // Split items into two columns
    const numItems = items.length;
    // Column 1 gets slightly more if odd number of items (5 vs 4 for 9 items)
    const col1Count = Math.ceil(numItems / 2); 
    const col1 = items.slice(0, col1Count);
    const col2 = items.slice(col1Count);

    return (
        <div 
            className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-[650px] rounded-2xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-300 overflow-hidden"
            // Use pointer events auto to allow interaction when visible
            style={{ pointerEvents: 'auto', opacity: 1 }}
        >
            <div className="grid grid-cols-2 p-5 gap-y-6 gap-x-8">
                {/* Column 1 */}
                <div className="space-y-6 border-r pr-4">
                    {col1.map(item => (
                        <DropdownProductItem key={item.id} {...item} onClick={(id) => { onLinkClick(id); onClose(); }} />
                    ))}
                </div>
                
                {/* Column 2 */}
                <div className="space-y-6 pl-4">
                    {col2.map(item => (
                        <DropdownProductItem key={item.id} {...item} onClick={(id) => { onLinkClick(id); onClose(); }} />
                    ))}
                </div>
            </div>
        </div>
    );
};
// ---------------------------------------------


// ===============================================
// Main HomePage Component
// ===============================================

// Define stats outside for clean reference
const initialStats = [
    { number: '0', label: 'Data Records', icon: Database, color: 'from-blue-500 to-cyan-600' }, 
    { number: '0', label: 'Active Users', icon: Users, color: 'from-emerald-500 to-teal-600' }, 
    { number: '0', label: 'Integrations', icon: Settings, color: 'from-purple-500 to-pink-600' },
    { number: '0', label: 'Reports Generated', icon: BarChart3, color: 'from-orange-500 to-amber-600' },
];

const navItems: NavItem[] = [
    { id: 'home', label: 'Home', href: '/', icon: Building },
    {
      id: 'products',
      label: 'Products',
      href: '/products', 
      icon: Database,
      subItems: [] 
    },
    { id: 'solutions', label: 'Solutions', href: '#solutions', icon: Sparkles },
    { id: 'pricing', label: 'Pricing', href: '/pricing', icon: DollarSign },
    { id: 'about', label: 'About', href: '/about', icon: Globe },
    { id: 'contact', label: 'Contact', href: '#contact', icon: Phone },
];


export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);
  // Renamed to better reflect its function across desktop/mobile
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false); 
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [stats, setStats] = useState(initialStats);

  // 2. REFACTORED: Used useCallback for scroll handler
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  // Helper function to update stats for demo
  const updateDemoStats = useCallback(() => {
    setStats(prevStats => prevStats.map((stat, index) => {
      let newNumber = 0;
      switch (index) {
        case 0: newNumber = 2500000; break; // Data Records
        case 1: newNumber = 15000; break; // Active Users
        case 2: newNumber = 500; break; // Integrations
        case 3: newNumber = 10000; break; // Reports Generated
        default: newNumber = 0;
      }
      return { ...stat, number: newNumber.toString() };
    }));
  }, []);

  // Effect for scroll tracking
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);


  // Effect for initial stat load animation
  useEffect(() => {
    const timeout = setTimeout(updateDemoStats, 500);
    return () => clearTimeout(timeout);
  }, [updateDemoStats]);


  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* --- Header (Desktop & Mobile) --- */}
      <header
        className={`fixed top-0 z-50 w-full transition-shadow duration-300 ${
          // Changed background to a light blue/white blend to match the image background
          scrollY > 50 ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-sm shadow-md' 
        }`}
      >
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center cursor-pointer group">
            {/* INCREASED SIZE HERE: w-44 h-16 */}
            <div className="relative w-44 h-16"> 
              <Image
                src="/hrlogo.png" 
                alt="IDMS Intelligent Data Management System Logo"
                fill
                style={{ objectFit: 'contain' }}
                className="w-full h-full"
              />
            </div>
          </Link>

          {/* Desktop Navigation - UPDATED FOR STYLE AND SIZE */}
          {/* Increased space-x for a wider layout */}
          <nav className="hidden space-x-10 md:flex"> 
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                {item.id === 'products' ? (
                  // --- MEGA DROPDOWN MENU FOR DESKTOP (Products) ---
                  <div
                    className="group relative inline-block cursor-pointer"
                    onMouseEnter={() => setIsProductsDropdownOpen(true)}
                    onMouseLeave={() => setIsProductsDropdownOpen(false)}
                  >
                    <a
                      onClick={(e) => { e.preventDefault(); setActiveSection(item.id); }}
                      // UPDATED STYLES: Larger text, darker initial color, blue hover/active, remove blue-600 hover
                      className={`flex items-center text-lg text-gray-800 font-medium transition-colors 
                                  ${activeSection === item.id ? 'text-blue-600' : 'hover:text-blue-600'}`}
                    >
                      {item.label} 
                      {/* Changed ChevronRight to a simple ">" appearance for subtlety */}
                      <span className={`ml-1 transform transition-transform text-xl ${isProductsDropdownOpen ? 'rotate-90' : 'rotate-0'}`}>
                          {isProductsDropdownOpen ? '▾' : '›'} 
                      </span>
                    </a>
                    
                    {/* Render the MegaDropdown conditionally */}
                    {isProductsDropdownOpen && (
                        <MegaDropdown 
                            items={detailedProducts} 
                            onLinkClick={setActiveSection}
                            onClose={() => setIsProductsDropdownOpen(false)}
                        />
                    )}
                  </div>
                ) : item.id === 'about' ? (
                  <div
                    className="group relative inline-block cursor-pointer"
                    onMouseEnter={() => setIsAboutDropdownOpen(true)}
                    onMouseLeave={() => setIsAboutDropdownOpen(false)}
                  >
                    <Link
                      href={item.href}
                      // UPDATED STYLES: Larger text, darker initial color, blue hover/active, remove blue-600 hover
                      className={`flex items-center text-lg text-gray-800 font-medium transition-colors 
                                  ${activeSection === item.id ? 'text-blue-600' : 'hover:text-blue-600'}`}
                    >
                      {item.label} 
                      {/* Changed ChevronRight to a simple ">" appearance for subtlety */}
                      <span className={`ml-1 transform transition-transform text-xl ${isAboutDropdownOpen ? 'rotate-90' : 'rotate-0'}`}>
                          {isAboutDropdownOpen ? '▾' : '›'} 
                      </span>
                    </Link>
                    {isAboutDropdownOpen && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-56 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 p-2">
                        <Link href="/about" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg">About</Link>
                        <Link href="/about/team" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg">Team</Link>
                        <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg">Contact Us</Link>
                      </div>
                    )}
                  </div>
                ) : (
                  // --- REGULAR DESKTOP LINK - UPDATED FOR STYLE ---
                  <Link
                      href={item.href}
                      onClick={() => setActiveSection(item.id)}
                      // STYLES TO MATCH REFERENCE IMAGE
                      className={`relative text-lg font-medium transition-colors pb-2
                                  ${activeSection === item.id ? 'text-blue-600' : 'text-gray-800 hover:text-blue-600'}`}
                    >
                      {item.label}
                      {/* Blue underline to match the reference image */}
                      {activeSection === item.id && (
                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-full"></span>
                      )}
                    </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Login/Signup Buttons (Desktop) - Adjusted colors to match Hero/General theme */}
          <div className="hidden md:flex space-x-4">
            <a
              href="/login"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium"
            >
              Log In
            </a>
            <a
              href="#"
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              Start Free Trial
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu Overlay - Adjusted hover/active colors to blue-based */}
        <div
          className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } bg-white shadow-xl`}
        >
          <div className="flex justify-end p-4">
            <button className="p-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <div key={item.id} className="w-full">
                {item.id === 'products' ? (
                  // --- MOBILE MENU for Products (Simple Accordion) ---
                  <div className="w-full">
                    <button
                      className="flex justify-between items-center w-full p-3 text-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                      onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                    >
                      <span className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isProductsDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isProductsDropdownOpen && (
                      // Display a simplified list or link to the full section
                      <div className="ml-4 border-l pl-4 my-2 space-y-1">
                        {detailedProducts.slice(0, 3).map((subItem) => ( // Show top 3 products
                          <a
                            key={subItem.id}
                            href={subItem.href}
                            onClick={() => {
                              setActiveSection(subItem.id);
                              setIsMenuOpen(false);
                              setIsProductsDropdownOpen(false);
                            }}
                            className="flex items-center p-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                          >
                            <subItem.icon className="w-4 h-4 mr-2" />
                            {subItem.title}
                          </a>
                        ))}
                        <a 
                            href="#product-details" // Link to a dedicated full page section 
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsProductsDropdownOpen(false);
                            }}
                            className="flex items-center p-2 text-base font-semibold text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            View All Solutions (9)
                        </a>
                      </div>
                    )}
                  </div>
                ) : item.id === 'about' ? (
                  <div className="w-full">
                    <button
                      className="flex justify-between items-center w-full p-3 text-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                      onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                    >
                      <span className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isAboutDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isAboutDropdownOpen && (
                      <div className="ml-4 border-l pl-4 my-2 space-y-1">
                        <Link href="/about/team" onClick={() => { setActiveSection('about'); setIsMenuOpen(false); setIsAboutDropdownOpen(false); }} className="block p-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg">Team</Link>
                        <Link href="/contact" onClick={() => { setActiveSection('contact'); setIsMenuOpen(false); setIsAboutDropdownOpen(false); }} className="block p-2 text-base text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg">Contact Us</Link>
                      </div>
                    )}
                  </div>
                ) : (
                   // --- REGULAR MOBILE LINK ---
                     <a
                       href={item.href}
                       onClick={() => {
                         setActiveSection(item.id);
                         setIsMenuOpen(false);
                       }}
                       className={`flex items-center p-3 text-lg hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg ${
                         activeSection === item.id ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700'
                       }`}
                     >
                       <item.icon className="w-5 h-5 mr-3" />
                       {item.label}
                     </a>
                 )}
              </div>
            ))}

            {/* Login/Signup in mobile menu - Adjusted colors to blue-based */}
            <div className="pt-4 space-y-2">
              <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Log In
              </button>
              <button className="w-full p-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                Start Free Trial
              </button>
            </div>
          </nav>
        </div>
      </header>
      {/* --- End Header --- */}

      <main>
        {/* Hero Section */}
<section id="home" className="pt-32 pb-20 bg-gradient-to-br from-blue-50 to-cyan-100">
          <div className="container mx-auto px-4">
            {/* Added a flex container to align text and image */}
            <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left max-w-6xl mx-auto">
              
              {/* Text Content */}
              <div className="max-w-xl md:w-1/2">
                <AnimatedOnScroll animationClass="animate-fade-in-down">
                  <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                    Intelligent Data Management. <span className="text-blue-600">Simplified</span>
                  </h1>
                </AnimatedOnScroll>
                <AnimatedOnScroll animationClass="animate-fade-in-up" delayClass="delay-200">
                  <p className="text-xl md:text-2xl text-gray-600 mb-8">
                    Unlock insights, automate workflows, and ensure data integrity our comprehensive IDMS platform
                  </p>
                </AnimatedOnScroll>
                
                {/* Call-to-Action Buttons */}
                <AnimatedOnScroll animationClass="animate-fade-in-up" delayClass="delay-400">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                    {/* Get Started Button (Dark Blue Style from Screenshot) */}
                    <Link
                      href="/pricing"
                      className="px-8 py-3 bg-blue-900 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-800 transition-all transform hover:scale-[1.02] flex items-center"
                    >
                      Get Started
                    </Link>
                    {/* Request Demo Button (Outline Style from Screenshot) */}
                    <a
                      href="#" // Assuming '#' or a demo form link
                      className="px-8 py-3 border-2 border-blue-900 text-blue-900 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-[1.02] flex items-center"
                    >
                      Request Demo
                    </a>
                  </div>
                </AnimatedOnScroll>
                
                {/* The "IDMS the Data Management Software..." text is removed as per the request */}
              </div>

              {/* Image Illustration */}
              <AnimatedOnScroll animationClass="animate-fade-in-right" delayClass="delay-600" className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
                {/* NOTE: You'll need to save the screenshot image and correctly reference it here. 
                         For this example, I'll use a placeholder structure. */}
                <Image
                  src="/background.png" // Replace with your actual image path
                  alt="Intelligent Data Management System Illustration"
                  width={500} // Adjust size as needed
                  height={500} // Adjust size as needed
                  className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto"
                />
              </AnimatedOnScroll>

            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedOnScroll animationClass="animate-slide-up">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                Built for Growing Teams and Modern Businesses
              </h2>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-slide-up" delayClass="delay-200">
              <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                Whether you're a startup or an enterprise, IDMS helps you manage data smarter and scale effortlessly.
              </p>
            </AnimatedOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { name: 'Finance', icon: DollarSign, color: 'text-green-600 bg-green-100' },
                { name: 'Healthcare', icon: Shield, color: 'text-blue-600 bg-blue-100' },
                { name: 'Education', icon: BookOpen, color: 'text-purple-600 bg-purple-100' },
                { name: 'Enterprise IT', icon: Settings, color: 'text-orange-600 bg-orange-100' }
              ].map((industry, index) => (
                <AnimatedOnScroll 
                  key={index} 
                  animationClass="animate-slide-up" 
                  delayClass={`delay-${(index + 1) * 200}`}
                >
                  <div className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${industry.color}`}>
                      <industry.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{industry.name}</h3>
                  </div>
                </AnimatedOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedOnScroll animationClass="animate-slide-up">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                    Smart Data Management to <span className="text-blue-600">outsmart the changing world</span>
                </h2>
            </AnimatedOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* 3. UPDATED: Apply AnimatedOnScroll with Staggered Delays */}
              {stats.map((stat, index) => (
                <AnimatedOnScroll 
                    key={index} 
                    animationClass="animate-slide-up" 
                    delayClass={`delay-${index * 200}`} // Staggered delay
                >
                  <StatCard stat={stat} />
                </AnimatedOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="solutions" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimatedOnScroll animationClass="animate-slide-up">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    Everything you need to create a <span className="text-blue-600">high performance culture</span>
                </h2>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-slide-up" delayClass="delay-200">
                <p className="text-xl text-center text-gray-600 mb-16">
                    One platform to manage your data, people, and business processes.
                </p>
            </AnimatedOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Database,
                  title: "Data Management",
                  description: "Centralize and organize all your business data in one secure platform. Real-time insights and analytics.",
                  color: "border-blue-500",
                  iconColor: "text-blue-600"
                },
                {
                  icon: Users,
                  title: "HR Management",
                  description: "Complete human resource management from hiring to retirement. Employee lifecycle management.",
                  color: "border-green-500",
                  iconColor: "text-green-600"
                },
                {
                  icon: DollarSign,
                  title: "Finance & Accounting",
                  description: "Streamlined financial management and accounting solutions. Automated reporting and compliance.",
                  color: "border-emerald-500",
                  iconColor: "text-emerald-600"
                },
                {
                  icon: Store,
                  title: "Inventory Management",
                  description: "Track and manage your inventory with real-time insights. Automated stock management.",
                  color: "border-orange-500",
                  iconColor: "text-orange-600"
                },
                {
                  icon: Target,
                  title: "Project Management",
                  description: "Plan, execute, and track projects with advanced tools. Resource allocation and timeline management.",
                  color: "border-purple-500",
                  iconColor: "text-purple-600"
                },
                {
                  icon: BarChart3,
                  title: "Analytics & Reporting",
                  description: "Powerful analytics and reporting for data-driven decisions. Custom dashboards and insights.",
                  color: "border-cyan-500",
                  iconColor: "text-cyan-600"
                },
              ].map((feature, index) => (
                <AnimatedOnScroll 
                    key={index} 
                    animationClass="animate-slide-up" 
                    delayClass={`delay-${(index + 3) * 200}`}
                >
                  <div className={`p-8 bg-white rounded-xl shadow-lg border-t-4 ${feature.color} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                    <feature.icon className={`w-12 h-12 ${feature.iconColor} mb-6`} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 mb-6">{feature.description}</p>
                    <a href="#" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </AnimatedOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gray-50" id="cta">
          <div className="container mx-auto px-4 text-center">
            <AnimatedOnScroll animationClass="animate-slide-up" threshold={0.3}>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Ready to Transform Your Data Management?
                </h2>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-slide-up" delayClass="delay-200" threshold={0.3}>
                <p className="text-xl text-gray-600 mb-8">
                    Get started with IDMS and experience the future of intelligent data management.
                </p>
            </AnimatedOnScroll>
             <AnimatedOnScroll animationClass="animate-slide-up" delayClass="delay-400" threshold={0.3}>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <Link
                         href="/pricing"
                         className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105"
                     >
                         Get Started
                     </Link>
                     <a
                         href="#"
                         className="px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105"
                     >
                         Schedule a Demo
                     </a>
                 </div>
             </AnimatedOnScroll>
          </div>
        </section>

        {/* Our Vision Section */}
        <section id="vision" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedOnScroll animationClass="animate-slide-up">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    Our Vision
                </h2>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-slide-up" delayClass="delay-200">
                <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                    We're on a mission to make data management simple, secure, and accessible to every business.
                </p>
            </AnimatedOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Rocket,
                  title: "Simplicity",
                  description: "Intuitive tools that work out of the box.",
                  color: "text-blue-600 bg-blue-100"
                },
                {
                  icon: Shield,
                  title: "Security",
                  description: "Enterprise-grade protection for all your data.",
                  color: "text-green-600 bg-green-100"
                },
                {
                  icon: Settings,
                  title: "Automation",
                  description: "Save hours with smart workflows.",
                  color: "text-purple-600 bg-purple-100"
                }
              ].map((pillar, index) => (
                <AnimatedOnScroll 
                  key={index} 
                  animationClass="animate-slide-up" 
                  delayClass={`delay-${(index + 1) * 200}`}
                >
                  <div className="text-center p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${pillar.color}`}>
                      <pillar.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{pillar.title}</h3>
                    <p className="text-gray-600">{pillar.description}</p>
                  </div>
                </AnimatedOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Early Access Program Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 text-center">
            <AnimatedOnScroll animationClass="animate-slide-up" threshold={0.3}>
                <h2 className="text-3xl font-bold text-white mb-4">
                    Join Our Early Access Program
                </h2>
            </AnimatedOnScroll>
            <AnimatedOnScroll animationClass="animate-slide-up" delayClass="delay-200" threshold={0.3}>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Be among the first to experience smarter data management with IDMS.
                </p>
            </AnimatedOnScroll>
             <AnimatedOnScroll animationClass="animate-slide-up" delayClass="delay-400" threshold={0.3}>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <button className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg shadow-xl hover:bg-gray-100 transition-all transform hover:scale-105">
                         Join Beta
                     </button>
                     <button className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
                         Get Early Access
                     </button>
                 </div>
             </AnimatedOnScroll>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12" id="contact">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand and Social */}
          <div>
            <Link href="/">
              <div className="relative w-48 h-16 mb-4 cursor-pointer">
                <Image
                  src="/hrlogo.png" 
                  alt="IDMS Logo and Brand Statement"
                  fill 
                  style={{ objectFit: 'contain' }}
                  className="w-full h-full"
                />
              </div>
            </Link>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#blog" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400">
              {/* Using a selection of the detailed products for the footer list */}
              {detailedProducts.slice(0, 4).map(item => (
                <li key={item.id}><a href={item.href} className="hover:text-blue-400 transition-colors">{item.title}</a></li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#help" className="hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#status" className="hover:text-blue-400 transition-colors">Status</a></li>
              <li><a href="#privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Get in Touch</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                <a href="mailto:info@idms.com" className="hover:text-blue-400 transition-colors">info@idms.com</a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-400" />
                <span>080-48905416</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mt-1 mr-2 text-blue-400 flex-shrink-0" />
                <span>2nd floor Hillside Meadows Layout, Adityanagar, Vidyaranyapura,
Bengaluru - 560097</span>
              </div>
            </div>
          </div>

        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 container mx-auto px-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()}  Tiranga Aerospace, All Rights Reserved.
        </div>
      </footer>

      {/* 4. UPDATED: Custom CSS to use .is-visible class for animation trigger */}
      <style jsx global>{`
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Keyframes for animations */
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ---------------------------------------------------- */
        /* Animation Classes: Start with opacity 0 initially    */
        /* The '.is-visible' class is added via JS/Hook to run  */
        /* ---------------------------------------------------- */
        .animate-fade-in-down,
        .animate-fade-in-left,
        .animate-fade-in-up,
        .animate-fade-in-right,
        .animate-slide-up {
            opacity: 0;
        }

        /* Applying animations only when in view */
        .animate-fade-in-down.is-visible {
          animation: fade-in-down 0.8s ease-out forwards;
        }

        .animate-fade-in-left.is-visible {
          animation: fade-in-left 0.8s ease-out 0.2s forwards;
        }

        .animate-fade-in-up.is-visible {
          animation: fade-in-up 0.8s ease-out 0.4s forwards;
        }

        .animate-fade-in-right.is-visible {
          animation: fade-in-right 1s ease-out 0.3s forwards;
        }

        .animate-slide-up.is-visible {
          animation: slide-up 0.8s ease-out forwards;
        }

        /* Staggered delays now applied to the animation trigger */
        .animate-slide-up.is-visible.delay-200 {
          animation: slide-up 0.8s ease-out 0.2s forwards;
        }
        .animate-slide-up.is-visible.delay-400 {
          animation: slide-up 0.8s ease-out 0.4s forwards;
        }
        .animate-slide-up.is-visible.delay-600 {
          animation: slide-up 0.8s ease-out 0.6s forwards;
        }
        .animate-slide-up.is-visible.delay-800 {
          animation: slide-up 0.8s ease-out 0.8s forwards;
        }
        .animate-slide-up.is-visible.delay-1000 {
          animation: slide-up 0.8s ease-out 1s forwards;
        }
      `}</style>
    </div>
  );
}