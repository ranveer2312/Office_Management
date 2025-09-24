'use client';

import Link from 'next/link';
import {
  ShoppingCartIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  DocumentArrowUpIcon,
  BeakerIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  CubeTransparentIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  TableCellsIcon,
  CpuChipIcon,
  PrinterIcon,
  PencilSquareIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';


export default function StoreDashboard() {
  const sections = [
    {
      title: "Office Supplies",
      description: "Manage office supplies and daily consumables",
      icon: PencilSquareIcon,
      color: "blue",
      gradient: "from-blue-400 to-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50/70 to-blue-100/70 dark:from-blue-950/40 dark:to-blue-900/40",
      items: [
        {
          title: "Consumables",
          description: "Daily office supplies and consumables",
          href: "/admin/store/stationary/regular",
          icon: BookOpenIcon
        },
        {
          title: "Fixed Assets",
          description: "Permanent stationary items",
          href: "/admin/store/stationary/fixed",
          icon: ArchiveBoxIcon
        },
        {
          title: "Inventory Transactions",
          description: "Track stationary movement",
          href: "/admin/store/stationary/inventory",
          icon: DocumentArrowUpIcon
        }
      ]
    },
    {
      title: "Laboratory Equipment",
      description: "Laboratory equipment and supplies management",
      icon: BeakerIcon,
      color: "emerald",
      gradient: "from-emerald-400 to-emerald-500",
      bgColor: "bg-gradient-to-br from-emerald-50/70 to-emerald-100/70 dark:from-emerald-950/40 dark:to-emerald-900/40",
      items: [
        {
          title: "Instruments",
          description: "Lab equipment and tools",
          href: "/admin/store/lab/instruments",
          icon: PaintBrushIcon
        },
        {
          title: "Components",
          description: "Lab parts and components",
          href: "/admin/store/lab/components",
          icon: WrenchScrewdriverIcon
        },
        {
          title: "Materials",
          description: "Lab consumables and materials",
          href: "/admin/store/lab/materials",
          icon: CubeTransparentIcon
        },
        {
          title: "Inventory Transactions",
          description: "Track lab items movement",
          href: "/admin/store/lab/inventory",
          icon: ChartBarIcon
        }
      ]
    },
    {
      title: "Capital Office Assets",
      description: "Manage permanent office equipment and furniture",
      icon: BuildingOfficeIcon,
      color: "purple",
      gradient: "from-purple-400 to-purple-500",
      bgColor: "bg-gradient-to-br from-purple-50/70 to-purple-100/70 dark:from-purple-950/40 dark:to-purple-900/40",
      items: [
        {
          title: "Furniture",
          description: "Office furniture and fixtures",
          href: "/admin/store/assets/furniture",
          icon: TableCellsIcon
        },
        {
          title: "Systems",
          description: "Computers and electronic systems",
          href: "/admin/store/assets/systems",
          icon: CpuChipIcon
        },
        {
          title: "Printers & Equipment",
          description: "Printers and other office equipment",
          href: "/admin/store/assets/printers",
          icon: PrinterIcon
        },
      ]
    },
    {
      title: "Materials In/Out",
      description: "View all material in/out records and transaction history",
      icon: CubeTransparentIcon,
      color: "teal",
      gradient: "from-teal-400 to-teal-500",
      bgColor: "bg-gradient-to-br from-teal-50/70 to-teal-100/70 dark:from-teal-950/40 dark:to-teal-900/40",
      items: [
        {
          title: "Materials In/Out",
          description: "View all material in/out records",
          href: "/admin/store/materials",
          icon: CubeTransparentIcon
        }
      ]
    },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <div className="min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <ShoppingCartIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-3 leading-tight">
              Inventory & Asset Management
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Comprehensive inventory management system for all your business needs.
            </p>
          </div>

          {/* Dashboard Grid - 2x2 Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-300px)]">
            {sections.map((section, sectionIndex) => {
              const IconComponent = section.icon;
              return (
                <div key={sectionIndex} className="group h-full">
                  <div className={`${section.bgColor} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent dark:border-slate-700/50 transform hover:-translate-y-1 h-full flex flex-col`}>
                    {/* Section Header */}
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                          {section.title}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    {/* Section Items */}
                    <div className="space-y-3 flex-1">
                      {section.items.map((item, itemIndex) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={itemIndex}
                            href={item.href}
                            className="group/item block"
                          >
                            <div className="bg-white/70 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-100 dark:border-slate-600/30 hover:shadow-md hover:scale-[1.02]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${section.gradient} flex items-center justify-center shadow-sm transform group-hover/item:scale-105 transition-transform duration-300`}>
                                    <ItemIcon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover/item:text-slate-900 dark:group-hover/item:text-slate-100 transition-colors">
                                      {item.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 font-normal">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300 group-hover/item:translate-x-1 transition-all duration-200 flex-shrink-0" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Footer Stats or Additional Info */}
                    <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">{section.items.length} Categories</span>
                        <Link 
                          href={`/admin/store/${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center space-x-1"
                        >
                          <span>View All</span>
                          <ChevronRightIcon className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Stats Bar */}
          <div className="mt-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">4</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">12</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Sub-Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">100%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">System Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">Active</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">System Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}