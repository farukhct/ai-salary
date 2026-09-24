import React, { useEffect, useState } from 'react';
import {
  Users,
  Wallet,
  TrendingUp,
  FileText,
  Calculator,
  PlusCircle,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Home
} from 'lucide-react';
import { Language } from '../types.ts';
import { formatCurrency, toBanglaNum } from '../utils/formatters.ts';
import { TabType } from '../components/Sidebar.tsx';

interface DashboardViewProps {
  lang: Language;
  setTab: (tab: TabType) => void;
  onPreloadExamples?: () => void;
}

interface StatsData {
  totalEmployees: number;
  activeEmployees: number;
  totalBasic: number;
  totalGpf: number;
  totalDisbursed: number;
  gradeDistribution: { grade: number; count: number; sumBasic: number }[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ lang, setTab, onPreloadExamples }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const hasData = stats && stats.totalEmployees > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Gazette Highlight */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono">
            <span>বাংলাদেশ গেজেট অতিরিক্ত সংখ্যা | ১৭ সেপ্টেম্বর ২০২৬</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-bangla tracking-tight">
            {lang === 'bn'
              ? 'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ বাস্তবায়ন সিস্টেম'
              : 'Civil Service (Pay & Allowances) Order 2026 Implementation'}
          </h2>
          <p className="text-sm text-slate-300 font-bangla max-w-2xl">
            {lang === 'bn'
              ? 'সরকারি চাকরি আইন, ২০১৮ (২০১৮ সনের ৫৭ নং আইন) এর ধারা ১৫ মোতাবেক ১ জুলাই ২০২৬ হইতে কার্যকর নতুন জাতীয় বেতনস্কেল ও পূর্ণাঙ্গ বেতন নির্ধারণী বিধিমালা।'
              : 'Comprehensive pay fixation, phase-wise arrears, allowances, pension, and GPF calculation engine based on S.R.O. 347-Law/2026.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab('fixation')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition font-bangla"
          >
            <Calculator className="w-4 h-4" />
            <span>{lang === 'bn' ? 'বেতন নির্ধারণী করুন' : 'Pay Fixation'}</span>
          </button>
          <button
            onClick={() => setTab('employees')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg border border-slate-600 transition font-bangla"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === 'bn' ? 'কর্মকর্তা যোগ করুন' : 'Add Employee'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-bangla">
              {lang === 'bn' ? 'মোট কর্মকর্তা/কর্মচারী' : 'Total Employees'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 font-mono">
              {hasData ? (lang === 'bn' ? toBanglaNum(stats?.totalEmployees) : stats?.totalEmployees) : '০'}
            </h3>
            <p className="text-xs text-slate-500 font-bangla mt-1">
              {hasData
                ? `${lang === 'bn' ? 'সক্রিয়:' : 'Active:'} ${lang === 'bn' ? toBanglaNum(stats?.activeEmployees) : stats?.activeEmployees}`
                : (lang === 'bn' ? 'ডাটাবেজে কোনো রেকর্ড নেই' : 'No records in database')}
            </p>
          </div>
        </div>

        {/* Total Monthly Basic */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-bangla">
              {lang === 'bn' ? 'মাসিক মূল বেতন' : 'Monthly Basic'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 font-bangla">
              {hasData ? formatCurrency(stats?.totalBasic, lang) : formatCurrency(0, lang)}
            </h3>
            <p className="text-xs text-slate-500 font-bangla mt-1">
              {lang === 'bn' ? 'জাতীয় পে-স্কেল ২০২৬ অনুসারে' : 'Under Pay Scale 2026'}
            </p>
          </div>
        </div>

        {/* Total GPF Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-bangla">
              {lang === 'bn' ? 'মোট জিপিএফ স্থিতি' : 'Total GPF Balance'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 font-bangla">
              {hasData ? formatCurrency(stats?.totalGpf, lang) : formatCurrency(0, lang)}
            </h3>
            <p className="text-xs text-slate-500 font-bangla mt-1">
              {lang === 'bn' ? 'বার্ষিক সুদ: ১১.৫%' : 'Annual Interest: 11.5%'}
            </p>
          </div>
        </div>

        {/* Total Payroll Disbursed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-bangla">
              {lang === 'bn' ? 'সর্বমোট পরিশোধিত পেরোল' : 'Disbursed Payroll'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 font-bangla">
              {hasData ? formatCurrency(stats?.totalDisbursed, lang) : formatCurrency(0, lang)}
            </h3>
            <p className="text-xs text-slate-500 font-bangla mt-1">
              {lang === 'bn' ? 'চূড়ান্ত পরিশোধের মোট' : 'Finalized payroll runs'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!hasData && !loading ? (
        /* Empty State Display (Strictly as mandated in Section 23 & 35) */
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-bangla">
            {lang === 'bn' ? 'কোনো কর্মকর্তা বা কর্মচারীর রেকর্ড নেই' : 'No Employee Records Available'}
          </h3>
          <p className="text-sm text-slate-500 font-bangla max-w-md mx-auto mt-2">
            {lang === 'bn'
              ? 'ডাটাবেজে কোনো কৃত্রিম বা ডামি ডাটা রাখা হয়নি। আপনি নতুন কর্মকর্তা যোগ করতে পারেন অথবা অফিসিয়াল গেজেটের উদাহরণ ১ ও ২ লোড করে টেস্ট করতে পারেন।'
              : 'Strict adherence to rules: No fake employee data has been generated. Add employees or load the official Gazette examples to test.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {onPreloadExamples && (
              <button
                onClick={onPreloadExamples}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition font-bangla"
              >
                <Layers className="w-4 h-4" />
                <span>{lang === 'bn' ? 'গেজেট উদাহরণ ১ ও ২ লোড করুন (টেস্টিং)' : 'Load Official Gazette Examples 1 & 2'}</span>
              </button>
            )}
            <button
              onClick={() => setTab('employees')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg border border-slate-300 transition font-bangla"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন কর্মকর্তা যোগ করুন' : 'Add New Employee'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grade Distribution & Activity if data exists */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 font-bangla">
                {lang === 'bn' ? 'গ্রেডভিত্তিক কর্মচারী বণ্টন' : 'Grade-wise Employee Distribution'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">SQL Aggregation</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-bangla">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{lang === 'bn' ? 'গ্রেড' : 'Grade'}</th>
                    <th className="py-2.5 px-3">{lang === 'bn' ? 'কর্মকর্তা সংখ্যা' : 'Employees'}</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'মোট মূল বেতন' : 'Total Basic'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.gradeDistribution.map((item) => (
                    <tr key={item.grade} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {lang === 'bn' ? `${toBanglaNum(item.grade)}ম গ্রেড` : `Grade ${item.grade}`}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {lang === 'bn' ? `${toBanglaNum(item.count)} জন` : `${item.count} employees`}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        {formatCurrency(item.sumBasic, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-bangla border-b border-slate-100 pb-2">
              {lang === 'bn' ? 'গেজেট দ্রুত রেফারেন্স' : 'Gazette Quick Reference'}
            </h3>

            <div className="space-y-3 text-xs font-bangla">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800">১ম পর্যায় বকেয়া (জুলাই-ডিসেম্বর ২০২৬):</p>
                <p className="text-slate-600 mt-0.5">
                  ১ম-৯ম গ্রেড: পার্থক্যের ৪০% | ১০ম-২০তম গ্রেড: পার্থক্যের ৫০%
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800">২য় পর্যায় বকেয়া (জানুয়ারি-জুন ২০২৭):</p>
                <p className="text-slate-600 mt-0.5">
                  ১ম-৯ম গ্রেড: পার্থক্যের ৭০% | ১০ম-২০তম গ্রেড: পার্থক্যের ৭৫%
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800">১ জুলাই ২০২৭ হইতে:</p>
                <p className="text-slate-600 mt-0.5">
                  বার্ষিক বেতনবৃদ্ধি (increment) সহ মূল বেতন শতভাগ প্রদান।
                </p>
              </div>
            </div>

            <button
              onClick={() => setTab('payscaleMaster')}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition font-bangla"
            >
              <span>{lang === 'bn' ? 'সম্পূর্ণ পে-স্কেল সারণি দেখুন' : 'View Full Pay Scale Table'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setTab('fixation')}
          className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-bangla group-hover:text-emerald-700">
                {lang === 'bn' ? 'বেতন নির্ধারণী ক্যালকুলেটর' : 'Pay Fixation Engine'}
              </h4>
              <p className="text-xs text-slate-500 font-bangla">
                {lang === 'bn' ? 'অনুচ্ছেদ ৫ অনুসারে স্বয়ংক্রিয় বেতন নির্ধারণ' : 'Clause 5 Fixation with full audit trail'}
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setTab('arrears')}
          className="p-4 bg-white hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-bangla group-hover:text-sky-700">
                {lang === 'bn' ? 'বকেয়া ও পর্যায়ভিত্তিক হিসাব' : 'Arrears & Phase Breakdown'}
              </h4>
              <p className="text-xs text-slate-500 font-bangla">
                {lang === 'bn' ? 'অনুচ্ছেদ ১(৩) অনুসারে ১২ মাসের হিসাব' : 'Phase-wise salary difference calculation'}
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setTab('houseRent')}
          className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-bangla group-hover:text-indigo-700">
                {lang === 'bn' ? 'বাড়ি ভাড়া ভাতা (২০১৫)' : 'House Rent 2015 Slabs'}
              </h4>
              <p className="text-xs text-slate-500 font-bangla">
                {lang === 'bn' ? '৩৫,৫০১/- সহ সারণির বিধিবদ্ধ ন্যূনতম সীমা' : 'Statutory minimum limits (eff. 1 July 2016)'}
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setTab('pension')}
          className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-bangla group-hover:text-amber-700">
                {lang === 'bn' ? 'পেনশন ও চিকিৎসা ভাতা' : 'Pension & Medical Calculator'}
              </h4>
              <p className="text-xs text-slate-500 font-bangla">
                {lang === 'bn' ? 'অনুচ্ছেদ ৮ এর সারণি ও চিকিৎসা ভাতা' : 'Clause 8 pension slabs & age medical'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
