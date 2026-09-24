import React from 'react';
import { ShieldCheck, Printer, Download, Globe, Database } from 'lucide-react';
import { Language } from '../types.ts';
import { triggerPrint } from '../utils/formatters.ts';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang }) => {
  const downloadDatabaseSql = () => {
    window.open('/api/sql/export', '_blank');
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner border border-emerald-400">
              <span className="text-base font-bangla">বিডি</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base md:text-lg font-bold tracking-tight font-bangla text-white">
                  {lang === 'bn' ? 'স্মার্ট বেতন ও বেতন নির্ধারণী ২০২৬' : 'Smart Pay Scale & Fixation 2026'}
                </h1>
                <span className="bg-emerald-800/80 text-emerald-200 text-xs px-2 py-0.5 rounded-full font-mono border border-emerald-600/50">
                  S.R.O. 347/2026
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bangla hidden sm:block">
                {lang === 'bn'
                  ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | অর্থ বিভাগ | চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬'
                  : "Government of the People's Republic of Bangladesh | Finance Division"}
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Database status pill */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-md text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>SQL Database: Active</span>
            </div>

            {/* SQL Export */}
            <button
              onClick={downloadDatabaseSql}
              title={lang === 'bn' ? 'ডাটাবেজ স্ক্রিপ্ট (.sql) ডাউনলোড' : 'Download Database.sql'}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline font-bangla">{lang === 'bn' ? 'Database.sql' : 'Database.sql'}</span>
            </button>

            {/* Print */}
            <button
              onClick={triggerPrint}
              title={lang === 'bn' ? 'প্রিন্ট করুন' : 'Print page'}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline font-bangla">{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded transition shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Role Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 pl-2 border-l border-slate-700">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left leading-none">
                <p className="text-xs font-semibold text-slate-200 font-bangla">{lang === 'bn' ? 'সুপার অ্যাডমিন' : 'Admin'}</p>
                <p className="text-[10px] text-slate-400">Payroll Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
