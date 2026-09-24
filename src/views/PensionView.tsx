import React, { useState, useEffect } from 'react';
import {
  Coins,
  Printer,
  Download,
  Calendar,
  Layers,
  HeartPulse,
  Info
} from 'lucide-react';
import { Language, PensionCalculationResult } from '../types.ts';
import { formatCurrency, toBanglaNum, triggerPrint, exportToExcel } from '../utils/formatters.ts';

interface PensionViewProps {
  lang: Language;
}

export const PensionView: React.FC<PensionViewProps> = ({ lang }) => {
  const [existingNetPension, setExistingNetPension] = useState<number>(12000);
  const [age, setAge] = useState<number>(65);
  const [isFamilyPension, setIsFamilyPension] = useState<boolean>(false);
  const [result, setResult] = useState<PensionCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatePension = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pension/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existingNetPension2015: existingNetPension,
          age,
          isFamilyPension
        })
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePension();
  }, [existingNetPension, age, isFamilyPension]);

  const handleExportExcel = () => {
    if (!result) return;
    const rows = [
      { Parameter: "Existing Net Pension (2015)", Amount: result.existingNetPension2015 },
      { Parameter: "Applicable Slab", Amount: result.appliedSlab },
      { Parameter: "Increase Percentage", Amount: `${result.increasePercentage}%` },
      { Parameter: "Calculated Increase", Amount: result.calculatedIncrease },
      { Parameter: "New Net Pension (2026)", Amount: result.newNetPension2026 },
      { Parameter: "Net Monthly Difference", Amount: result.netPensionDifference },
      { Parameter: "Phase 1 Monthly Diff", Amount: result.phase1MonthlyPayableDiff },
      { Parameter: "Phase 2 Monthly Diff", Amount: result.phase2MonthlyPayableDiff },
      { Parameter: "Medical Allowance (Age-based)", Amount: result.medicalAllowance },
      { Parameter: "Bengali New Year Allowance (15%)", Amount: result.bengaliNewYearAllowance },
      { Parameter: "Total Monthly Pension", Amount: result.totalMonthlyPension }
    ];
    exportToExcel(rows, `Pension_Calculation_${existingNetPension}`, 'Pension');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bangla font-semibold mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>গেজেট অনুচ্ছেদ ৮ পেনশন ও চিকিৎসা সংক্রান্ত বিধিমালা</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'পেনশন, আনুতোষিক ও চিকিৎসা ভাতা ক্যালকুলেটর' : 'Pension, Gratuity & Medical Calculator'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla">
            {lang === 'bn'
              ? 'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর অনুচ্ছেদ ৮ এ বর্ণিত সারণি ও বয়সানুসারে চিকিৎসা ভাতা'
              : 'Official pension increment slabs, age-tier medical allowances, and gratuity calculations'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition font-bangla"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'bn' ? 'এক্সেল এক্সপোর্ট' : 'Export Excel'}</span>
          </button>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition font-bangla"
          >
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Inputs Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 font-bangla mb-4 pb-2 border-b border-slate-100">
          {lang === 'bn' ? 'পেনশনারের তথ্যাদি ইনপুট' : 'Pensioner Parameters'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-bangla text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? '৩০ জুন ২০২৬ আহরিত নিট পেনশন (টাকা) *' : 'Drawn Net Pension (30-06-2026) *'}
            </label>
            <input
              type="number"
              value={existingNetPension}
              onChange={(e) => setExistingNetPension(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              উদাহরণ: ৫,০০০ বা ১০,০০০ বা ১২,০০০ বা ২৫,০০০ টাকা
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'পেনশনারের বর্তমান বয়স (বছর) *' : 'Pensioner Current Age *'}
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              ৫০-এর নিচে: ৳৩,০০০ | ৫০-৬০: ৳৪,০০০ | ৬০-৭০: ৳৫,০০০ | ৭০+: ৳৬,০০০
            </span>
          </div>

          <div className="flex items-center pt-5">
            <label className="inline-flex items-center space-x-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFamilyPension}
                onChange={(e) => setIsFamilyPension(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>{lang === 'bn' ? 'পারিবারিক পেনশন (Family Pension)' : 'Family Pension (Posthumous)'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Box */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-bangla">
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 uppercase font-semibold">
              {lang === 'bn' ? '১ জুলাই ২০২৬ নতুন নিট পেনশন' : 'New Net Pension 2026'}
            </span>
            <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-2">
              {formatCurrency(result.newNetPension2026, lang)}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {lang === 'bn' ? `বৃদ্ধি: +${result.increasePercentage}% (+${formatCurrency(result.netPensionDifference, lang)})` : `Increase: +${result.increasePercentage}%`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 uppercase font-semibold">
              {lang === 'bn' ? 'চিকিৎসা ভাতা (বয়সানুসারে)' : 'Medical Allowance'}
            </span>
            <h3 className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {formatCurrency(result.medicalAllowance, lang)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'bn' ? `বয়স: ${toBanglaNum(age)} বছর` : `Age: ${age} Years`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 uppercase font-semibold">
              {lang === 'bn' ? 'পহেলা বৈশাখ ভাতা (১৫%)' : 'Bengali New Year'}
            </span>
            <h3 className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {formatCurrency(result.bengaliNewYearAllowance, lang)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'bn' ? 'বৈশাখ মাসে প্রদেয়' : 'Annual Boishakh grant'}
            </p>
          </div>

          <div className="bg-emerald-950 text-white p-5 rounded-xl border border-emerald-800 shadow-xs">
            <span className="text-xs text-emerald-300 uppercase font-semibold">
              {lang === 'bn' ? 'সর্বমোট মাসিক পেনশন প্রাপ্য' : 'Total Monthly Pension'}
            </span>
            <h3 className="text-2xl font-bold font-mono text-emerald-300 mt-2">
              {formatCurrency(result.totalMonthlyPension, lang)}
            </h3>
            <p className="text-xs text-emerald-200 mt-1">
              {lang === 'bn' ? 'নিট পেনশন + মাসিক চিকিৎসা ভাতা' : 'Net pension + Medical allowance'}
            </p>
          </div>
        </div>
      )}

      {/* Official S.R.O. Pension Slabs Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 font-bangla flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>{lang === 'bn' ? 'গেজেটের অনুচ্ছেদ ৮ এ উল্লিখিত পেনশন বৃদ্ধি সারণি' : 'Gazette Clause 8 Official Pension Increments Table'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">S.R.O. 347-Law/2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bangla">
            <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">{lang === 'bn' ? 'বিদ্যমান নিট পেনশনের হার (টাকা)' : 'Existing Net Pension (Tk.)'}</th>
                <th className="py-2.5 px-4 text-center">{lang === 'bn' ? 'বৃদ্ধির হার (%)' : 'Increase %'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'সর্বনিম্ন নিট পেনশন' : 'Min Net Pension'}</th>
                <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'সর্বোচ্চ নিট পেনশন' : 'Max Net Pension'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className={existingNetPension <= 5000 ? 'bg-amber-50/80 font-bold' : ''}>
                <td className="py-2.5 px-4 font-bangla">৫,০০০ টাকা পর্যন্ত</td>
                <td className="py-2.5 px-4 text-center">৫০%</td>
                <td className="py-2.5 px-4 text-right">৭,৫০০ টাকা</td>
                <td className="py-2.5 px-4 text-right">৭,৫০০ টাকা</td>
              </tr>
              <tr className={existingNetPension > 5000 && existingNetPension <= 10000 ? 'bg-amber-50/80 font-bold' : ''}>
                <td className="py-2.5 px-4 font-bangla">৫,০০১ হইতে ১০,০০০ টাকা পর্যন্ত</td>
                <td className="py-2.5 px-4 text-center">৪৫%</td>
                <td className="py-2.5 px-4 text-right">৭,৫০০ টাকা</td>
                <td className="py-2.5 px-4 text-right">১৪,৫০০ টাকা</td>
              </tr>
              <tr className={existingNetPension > 10000 && existingNetPension <= 20000 ? 'bg-amber-50/80 font-bold' : ''}>
                <td className="py-2.5 px-4 font-bangla">১০,০০১ হইতে ২০,০০০ টাকা পর্যন্ত</td>
                <td className="py-2.5 px-4 text-center">৪০%</td>
                <td className="py-2.5 px-4 text-right">১৪,৫০০ টাকা</td>
                <td className="py-2.5 px-4 text-right">২৮,০০০ টাকা</td>
              </tr>
              <tr className={existingNetPension > 20000 && existingNetPension <= 30000 ? 'bg-amber-50/80 font-bold' : ''}>
                <td className="py-2.5 px-4 font-bangla">২০,০০১ হইতে ৩০,০০০ টাকা পর্যন্ত</td>
                <td className="py-2.5 px-4 text-center">৩৫%</td>
                <td className="py-2.5 px-4 text-right">২৮,০০০ টাকা</td>
                <td className="py-2.5 px-4 text-right">৪০,৫০০ টাকা</td>
              </tr>
              <tr className={existingNetPension > 30000 && existingNetPension <= 40000 ? 'bg-amber-50/80 font-bold' : ''}>
                <td className="py-2.5 px-4 font-bangla">৩০,০০১ হইতে ৪০,০০০ টাকা পর্যন্ত</td>
                <td className="py-2.5 px-4 text-center">৩০%</td>
                <td className="py-2.5 px-4 text-right">৪০,৫০০ টাকা</td>
                <td className="py-2.5 px-4 text-right">৫২,০০০ টাকা</td>
              </tr>
              <tr className={existingNetPension > 40000 ? 'bg-amber-50/80 font-bold' : ''}>
                <td className="py-2.5 px-4 font-bangla">৪০,০০০ টাকার ঊর্ধ্ব</td>
                <td className="py-2.5 px-4 text-center">২৫%</td>
                <td className="py-2.5 px-4 text-right">৫২,০০০ টাকা</td>
                <td className="py-2.5 px-4 text-right">সীমা প্রযোজ্য নহে</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
