import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calculator,
  TrendingUp,
  FileSpreadsheet,
  Coins,
  Receipt,
  FileCheck,
  TableProperties,
  ScrollText,
  Sliders,
  Home
} from 'lucide-react';
import { Language } from '../types.ts';

export type TabType =
  | 'dashboard'
  | 'employees'
  | 'fixation'
  | 'arrears'
  | 'houseRent'
  | 'salary'
  | 'pension'
  | 'gpf'
  | 'payroll'
  | 'officialSheet'
  | 'payscaleMaster'
  | 'adminSql';

interface SidebarProps {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, lang }) => {
  const menuItems = [
    {
      id: 'dashboard' as TabType,
      labelBn: 'ড্যাশবোর্ড',
      labelEn: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'employees' as TabType,
      labelBn: 'কর্মকর্তা ও কর্মচারী',
      labelEn: 'Employees Master',
      icon: Users
    },
    {
      id: 'fixation' as TabType,
      labelBn: 'বেতন নির্ধারণী ২০২৬',
      labelEn: 'Pay Fixation 2026',
      icon: Calculator
    },
    {
      id: 'arrears' as TabType,
      labelBn: 'পার্থক্য ও বকেয়া (Arrears)',
      labelEn: 'Salary Arrears & Phases',
      icon: TrendingUp
    },
    {
      id: 'houseRent' as TabType,
      labelBn: 'বাড়ি ভাড়া ভাতা (২০১৫)',
      labelEn: 'House Rent 2015',
      icon: Home
    },
    {
      id: 'salary' as TabType,
      labelBn: 'স্মার্ট বেতন ও পে-স্লিপ',
      labelEn: 'Salary Slip Calculator',
      icon: Receipt
    },
    {
      id: 'pension' as TabType,
      labelBn: 'পেনশন ও আনুতোষিক',
      labelEn: 'Pension & Gratuity',
      icon: Coins
    },
    {
      id: 'gpf' as TabType,
      labelBn: 'ভবিষ্য তহবিল (GPF)',
      labelEn: 'GPF Ledger & Interest',
      icon: FileSpreadsheet
    },
    {
      id: 'payroll' as TabType,
      labelBn: 'মাসিক পেরোল',
      labelEn: 'Monthly Payroll',
      icon: Sliders
    },
    {
      id: 'officialSheet' as TabType,
      labelBn: 'অফিসিয়াল বেতন বিবরণী',
      labelEn: 'Official Fixation Sheet',
      icon: FileCheck
    },
    {
      id: 'payscaleMaster' as TabType,
      labelBn: 'জাতীয় পে-স্কেল ২০২৬',
      labelEn: 'Pay Scale Master',
      icon: TableProperties
    },
    {
      id: 'adminSql' as TabType,
      labelBn: 'গেজেট বিধি ও এসকিউএল',
      labelEn: 'Gazette Rules & SQL',
      icon: ScrollText
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)] no-print">
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-sans">
          {lang === 'bn' ? 'প্রধান মেন্যু' : 'MAIN NAVIGATION'}
        </p>
      </div>

      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left font-bangla ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-emerald-700' : 'text-slate-400'
                }`}
              />
              <span className="truncate">
                {lang === 'bn' ? item.labelBn : item.labelEn}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Gazette Reference Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-bangla">
        <div className="flex items-center space-x-2 text-emerald-800 font-semibold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>গেজেট কার্যকর: ১ জুলাই ২০২৬</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          এস. আর. ও. নং ৩৪৭-আইন/২০২৬
        </p>
      </div>
    </aside>
  );
};
