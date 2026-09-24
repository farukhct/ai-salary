import React, { useState, useEffect } from 'react';
import {
  Home,
  Calculator,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Users,
  Info,
  Scale
} from 'lucide-react';
import { Language, Employee, HouseRentLocation, StatutoryHouseRentResult } from '../types.ts';
import { formatCurrency, toBanglaNum, exportToExcel, triggerPrint } from '../utils/formatters.ts';
import {
  STATUTORY_HOUSE_RENT_SLABS_2015,
  calculateStatutoryHouseRent2015Client,
  calculateAllLocationsHouseRent,
  AllLocationsHouseRentComparison,
  getStatutorySlabForBasic
} from '../utils/houseRentCalculator.ts';

interface HouseRentViewProps {
  lang: Language;
}

export const HouseRentView: React.FC<HouseRentViewProps> = ({ lang }) => {
  const [basicSalary, setBasicSalary] = useState<number>(35501);
  const [location, setLocation] = useState<HouseRentLocation>('dhaka');
  const [isGovtQuarter, setIsGovtQuarter] = useState<boolean>(false);

  // Employees for quick loading
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setEmployees(json.data);
        }
      })
      .catch(err => console.warn('Could not fetch employees:', err));
  }, []);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => String(e.id) === empId);
    if (emp) {
      const basic = emp.previousBasicPay || emp.currentBasicPay || 35501;
      setBasicSalary(basic);
      if (emp.cityType === 'dhaka') setLocation('dhaka');
      else if (emp.cityType === 'other_city_corporation') setLocation('other_city_corporation');
      else setLocation('other');

      setIsGovtQuarter(Boolean(emp.isGovtQuarterProvided));
    }
  };

  // Immediate synchronous calculation across all 3 regions
  const comparison: AllLocationsHouseRentComparison = calculateAllLocationsHouseRent(
    basicSalary,
    isGovtQuarter
  );

  const selectedResult: StatutoryHouseRentResult =
    location === 'dhaka'
      ? comparison.dhaka
      : location === 'other_city_corporation'
      ? comparison.otherCityCorporation
      : comparison.otherAreas;

  const currentSlab = getStatutorySlabForBasic(basicSalary);

  // Quick salary presets
  const presets = [
    { label: '৳৩৫,৫০১ (৪র্থ স্ল্যাব ন্যূনতম সীমা)', value: 35501 },
    { label: '৳৪০,০০০ (৪র্থ স্ল্যাব)', value: 40000 },
    { label: '৳৫০,০০০ (৪র্থ স্ল্যাব)', value: 50000 },
    { label: '৳৬৬,০০০ (৪র্থ স্ল্যাব)', value: 66000 },
    { label: '৳৭৮,০০০ (১ম গ্রেড সিলিং)', value: 78000 },
    { label: '৳২২,০০০ (৩য় স্ল্যাব)', value: 22000 },
    { label: '৳১৬,০০০ (২য় স্ল্যাব সিলিং)', value: 16000 },
    { label: '৳১১,৩০০ (২য় স্ল্যাব)', value: 11300 },
    { label: '৳৮,২৫০ (১ম স্ল্যাব)', value: 8250 }
  ];

  const handleExportExcel = () => {
    const rows = [
      {
        "Basic Salary": basicSalary,
        "Slab": currentSlab.basicRangeBangla,
        "Dhaka Rate %": currentSlab.dhaka.ratePercentage,
        "Dhaka Statutory Min": currentSlab.dhaka.minimumAmount,
        "Dhaka Payable": comparison.dhaka.finalAmount,
        "Dhaka Min Applied": comparison.dhaka.minApplied ? "Yes" : "No",
        "Other CC Rate %": currentSlab.otherCityCorporation.ratePercentage,
        "Other CC Statutory Min": currentSlab.otherCityCorporation.minimumAmount,
        "Other CC Payable": comparison.otherCityCorporation.finalAmount,
        "Other CC Min Applied": comparison.otherCityCorporation.minApplied ? "Yes" : "No",
        "Other Areas Rate %": currentSlab.otherAreas.ratePercentage,
        "Other Areas Statutory Min": currentSlab.otherAreas.minimumAmount,
        "Other Areas Payable": comparison.otherAreas.finalAmount,
        "Other Areas Min Applied": comparison.otherAreas.minApplied ? "Yes" : "No",
        "Govt Quarter": isGovtQuarter ? "Yes" : "No"
      }
    ];
    exportToExcel(rows, `House_Rent_2015_Basic_${basicSalary}`, 'House Rent 2015');
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-bangla font-semibold mb-1">
            <Home className="w-3.5 h-3.5 text-sky-600" />
            <span>জাতীয় বেতনস্কেল ২০১৫: বাড়ি ভাড়া ভাতা বিধিমালা (কার্যকর ০১/০৭/২০১৬)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-bangla flex items-center gap-2">
            <span>{lang === 'bn' ? 'বাড়ি ভাড়া ভাতা নির্ধারণ ও সারণি ক্যালকুলেটর' : 'House Rent Allowance Calculator'}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-semibold">
              ২০১৫ পে-স্কেল
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-bangla mt-0.5">
            অর্থ বিভাগ, অর্থ মন্ত্রণালয় প্রজ্ঞাপন তারিখ ১৫/১২/২০১৫ ও ১ জুলাই ২০১৬ হতে কার্যকর বিধিবদ্ধ ন্যূনতম সীমাসহ মাসিক বাড়ি ভাড়া ভাতা
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'bn' ? 'এক্সেল এক্সপোর্ট' : 'Excel'}</span>
          </button>
          <button
            onClick={triggerPrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রিন্ট বিবরণী' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Specific Focus Banner for User's Clause: Tk 35,501 and above */}
      <div className="bg-linear-to-r from-sky-900 to-indigo-900 text-white p-4 sm:p-5 rounded-xl shadow-md border border-sky-800 font-bangla">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-xs">
                {lang === 'bn' ? 'বিশেষ বিধিবদ্ধ বিধান' : 'Statutory Slab Focus'}
              </span>
              <span className="text-xs font-medium text-sky-200">
                {lang === 'bn' ? 'মূল বেতন ৩৫,৫০১/- টাকা ও তদূর্ধ্ব (Tk. 35,501 and above)' : 'Basic Tk. 35,501 and above'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {lang === 'bn'
                ? '৩৫,৫০১/- টাকা ও তদূর্ধ্ব মূল বেতনের জন্য বাড়ি ভাড়া ও ন্যূনতম সীমার নিয়ম:'
                : 'House Rent Rules for Basic Tk. 35,501 and above:'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-white/10 rounded-lg p-2.5 border border-white/15">
                <span className="font-semibold text-amber-300 block mb-0.5">ঢাকা সিটি কর্পোরেশন:</span>
                <span>মূল বেতনের <strong>৫০%</strong>, তবে ন্যূনতম <strong>১৯,৫০০/-</strong> টাকার কম নহে।</span>
                <span className="block text-[10px] text-sky-200 mt-1 font-mono">50% basic, min Tk. 19,500</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2.5 border border-white/15">
                <span className="font-semibold text-amber-300 block mb-0.5">অন্যান্য সিটি কর্পোরেশন ও সাভার:</span>
                <span>মূল বেতনের <strong>৪০%</strong>, তবে ন্যূনতম <strong>১৬,০০০/-</strong> টাকার কম নহে।</span>
                <span className="block text-[10px] text-sky-200 mt-1 font-mono">40% basic, min Tk. 16,000</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2.5 border border-white/15">
                <span className="font-semibold text-amber-300 block mb-0.5">অন্যান্য এলাকা (জেলা ও উপজেলা):</span>
                <span>মূল বেতনের <strong>৩৫%</strong>, তবে ন্যূনতম <strong>১৩,৮০০/-</strong> টাকার কম নহে।</span>
                <span className="block text-[10px] text-sky-200 mt-1 font-mono">35% basic, min Tk. 13,800</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setBasicSalary(35501);
              setIsGovtQuarter(false);
            }}
            className="hidden lg:inline-flex items-center shrink-0 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
          >
            {lang === 'bn' ? '৩৫,৫০১/- পরীক্ষা করুন' : 'Test Tk. 35,501'}
          </button>
        </div>
      </div>

      {/* Main Calculation Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 font-bangla">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-800 text-sm">
              {lang === 'bn' ? 'মূল বেতন ও কর্মস্থল তথ্য প্রদান' : 'Input Basic Salary & Duty Station'}
            </span>
          </div>
          {employees.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">{lang === 'bn' ? 'কর্মচারী হতে লোড:' : 'From Employee:'}</span>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="p-1 rounded border border-slate-300 text-xs bg-white text-slate-700 font-mono"
              >
                <option value="">{lang === 'bn' ? '-- নির্বাচন করুন --' : '-- Select --'}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeCode} - {emp.nameBangla} ({emp.grade}ম গ্রেড, ৳{emp.currentBasicPay?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Basic Salary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'মূল বেতন (Basic Salary) *' : 'Basic Salary *'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono text-sm">৳</span>
              <input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                min={0}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {lang === 'bn' ? `বর্তমান প্রযোজ্য স্ল্যাব: ${currentSlab.basicRangeBangla}` : `Active Slab: ${currentSlab.basicRangeEnglish}`}
            </span>
          </div>

          {/* Location Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'কর্মস্থল এলাকা (Duty Station Area) *' : 'Duty Station Area *'}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as HouseRentLocation)}
              className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="dhaka">
                {lang === 'bn' ? 'ঢাকা সিটি কর্পোরেশন এলাকা' : 'Dhaka City Corporation'}
              </option>
              <option value="other_city_corporation">
                {lang === 'bn'
                  ? 'অন্যান্য সিটি কর্পোরেশন (চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট, বরিশাল, রংপুর, নারায়ণগঞ্জ, গাজীপুর) ও সাভার'
                  : 'Other 7 City Corporations & Savar'}
              </option>
              <option value="other">
                {lang === 'bn' ? 'অন্যান্য এলাকা (জেলা ও উপজেলা)' : 'Other Locations (Districts/Upazilas)'}
              </option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {lang === 'bn' ? 'সারণি অনুসারে প্রযোজ্য শতাংশ হার ও বিধিবদ্ধ ন্যূনতম সীমা' : 'Determines statutory percentage & minimum'}
            </span>
          </div>

          {/* Govt Accommodation */}
          <div className="flex flex-col justify-center pt-2">
            <label className="inline-flex items-center space-x-2 cursor-pointer p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={isGovtQuarter}
                onChange={(e) => setIsGovtQuarter(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                {lang === 'bn' ? 'সরকারি বাসস্থান বরাদ্দপ্রাপ্ত (বাড়ি ভাড়া শূন্য)' : 'Govt Accommodation Provided (Rent 0)'}
              </span>
            </label>
            <span className="text-[10px] text-slate-400 mt-1 pl-1">
              সরকারি কোয়ার্টার/বাসস্থানে বসবাসরতদের বাড়ি ভাড়া ভাতা প্রদেয় নয়
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600">
              {lang === 'bn' ? 'দ্রুত বেতন নির্বাচন (ক্লিক করুন):' : 'Quick Salary Presets:'}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === 'bn' ? 'বিভিন্ন স্ল্যাবের ন্যূনতম সীমা যাচাই' : 'Test statutory limits'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setBasicSalary(p.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono border transition ${
                  basicSalary === p.value
                    ? 'bg-sky-700 text-white border-sky-700 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Region Comparison Cards (All calculated side-by-side) */}
      <div>
        <div className="flex items-center justify-between mb-3 font-bangla">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>{lang === 'bn' ? '৩টি অঞ্চলের বিধিবদ্ধ বাড়ি ভাড়া ভাতার তুলনামূলক হিসাব' : 'Statutory House Rent Comparison by Region'}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {lang === 'bn' ? `মূল বেতন ৳${basicSalary.toLocaleString('en-IN')} এর ভিত্তিতে` : `Based on Basic Tk. ${basicSalary.toLocaleString('en-IN')}`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bangla">
          {/* Card 1: Dhaka City Corporation */}
          <div
            className={`p-5 rounded-xl border transition shadow-xs relative overflow-hidden ${
              location === 'dhaka'
                ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            {location === 'dhaka' && (
              <span className="absolute top-2 right-2 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                নির্বাচিত এলাকা
              </span>
            )}
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>ঢাকা সিটি কর্পোরেশন</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {lang === 'bn' ? 'ঢাকা সিটি কর্পোরেশন এলাকা' : 'Dhaka City Corporation'}
            </h4>

            <div className="mt-3">
              <span className="text-xs text-slate-500">{lang === 'bn' ? 'মাসিক প্রদেয় বাড়ি ভাড়া ভাতা:' : 'Monthly House Rent:'}</span>
              <div className="text-2xl font-bold font-mono text-sky-700">
                {formatCurrency(comparison.dhaka.finalAmount, lang)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>নির্ধারিত হার:</span>
                <span className="font-mono font-bold text-slate-800">{comparison.dhaka.ratePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>শতকরা হিসাবে পরিমাণ:</span>
                <span className="font-mono">৳{comparison.dhaka.calculatedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>বিধিবদ্ধ ন্যূনতম সীমা:</span>
                <span className="font-mono font-semibold text-slate-800">৳{comparison.dhaka.minimumAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {comparison.dhaka.minApplied && (
              <div className="mt-3 bg-amber-100/90 text-amber-900 p-2 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>বিধিবদ্ধ ন্যূনতম সীমা (৳{comparison.dhaka.minimumAmount.toLocaleString('en-IN')}) কার্যকর হয়েছে</span>
              </div>
            )}
            {!comparison.dhaka.minApplied && !isGovtQuarter && (
              <div className="mt-3 bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>শতকরা হিসাব ন্যূনতম সীমার চেয়ে বেশি</span>
              </div>
            )}
          </div>

          {/* Card 2: Other 7 City Corporations & Savar */}
          <div
            className={`p-5 rounded-xl border transition shadow-xs relative overflow-hidden ${
              location === 'other_city_corporation'
                ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            {location === 'other_city_corporation' && (
              <span className="absolute top-2 right-2 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                নির্বাচিত এলাকা
              </span>
            )}
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>৭ সিটি কর্পোরেশন ও সাভার</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {lang === 'bn' ? 'অন্যান্য সিটি কর্পোরেশন ও সাভার' : 'Other City Corps & Savar'}
            </h4>

            <div className="mt-3">
              <span className="text-xs text-slate-500">{lang === 'bn' ? 'মাসিক প্রদেয় বাড়ি ভাড়া ভাতা:' : 'Monthly House Rent:'}</span>
              <div className="text-2xl font-bold font-mono text-blue-700">
                {formatCurrency(comparison.otherCityCorporation.finalAmount, lang)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>নির্ধারিত হার:</span>
                <span className="font-mono font-bold text-slate-800">{comparison.otherCityCorporation.ratePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>শতকরা হিসাবে পরিমাণ:</span>
                <span className="font-mono">৳{comparison.otherCityCorporation.calculatedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>বিধিবদ্ধ ন্যূনতম সীমা:</span>
                <span className="font-mono font-semibold text-slate-800">৳{comparison.otherCityCorporation.minimumAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {comparison.otherCityCorporation.minApplied && (
              <div className="mt-3 bg-amber-100/90 text-amber-900 p-2 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>বিধিবদ্ধ ন্যূনতম সীমা (৳{comparison.otherCityCorporation.minimumAmount.toLocaleString('en-IN')}) কার্যকর হয়েছে</span>
              </div>
            )}
            {!comparison.otherCityCorporation.minApplied && !isGovtQuarter && (
              <div className="mt-3 bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>শতকরা হিসাব ন্যূনতম সীমার চেয়ে বেশি</span>
              </div>
            )}
          </div>

          {/* Card 3: Other Areas (Districts & Upazilas) */}
          <div
            className={`p-5 rounded-xl border transition shadow-xs relative overflow-hidden ${
              location === 'other'
                ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            {location === 'other' && (
              <span className="absolute top-2 right-2 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                নির্বাচিত এলাকা
              </span>
            )}
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>জেলা ও উপজেলা এলাকা</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {lang === 'bn' ? 'অন্যান্য এলাকা (জেলা ও উপজেলা)' : 'Other Areas (Districts/Upazilas)'}
            </h4>

            <div className="mt-3">
              <span className="text-xs text-slate-500">{lang === 'bn' ? 'মাসিক প্রদেয় বাড়ি ভাড়া ভাতা:' : 'Monthly House Rent:'}</span>
              <div className="text-2xl font-bold font-mono text-teal-700">
                {formatCurrency(comparison.otherAreas.finalAmount, lang)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>নির্ধারিত হার:</span>
                <span className="font-mono font-bold text-slate-800">{comparison.otherAreas.ratePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span>শতকরা হিসাবে পরিমাণ:</span>
                <span className="font-mono">৳{comparison.otherAreas.calculatedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>বিধিবদ্ধ ন্যূনতম সীমা:</span>
                <span className="font-mono font-semibold text-slate-800">৳{comparison.otherAreas.minimumAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {comparison.otherAreas.minApplied && (
              <div className="mt-3 bg-amber-100/90 text-amber-900 p-2 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>বিধিবদ্ধ ন্যূনতম সীমা (৳{comparison.otherAreas.minimumAmount.toLocaleString('en-IN')}) কার্যকর হয়েছে</span>
              </div>
            )}
            {!comparison.otherAreas.minApplied && !isGovtQuarter && (
              <div className="mt-3 bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>শতকরা হিসাব ন্যূনতম সীমার চেয়ে বেশি</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Result Explanation Callout */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1 font-bangla">
        <div className="font-bold text-slate-900 flex items-center space-x-1.5 text-sm">
          <Info className="w-4 h-4 text-sky-600" />
          <span>হিসাব বিশ্লেষণ ও বিধিবদ্ধ সিদ্ধান্ত:</span>
        </div>
        <p className="leading-relaxed">
          {selectedResult.explanationBangla}
        </p>
      </div>

      {/* The Official House Rent Table (৪টি স্ল্যাব ও বিধিবদ্ধ ন্যূনতম সীমার পূর্ণাঙ্গ সারণি) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-bangla">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>জাতীয় বেতনস্কেল ২০১৫: বাড়ি ভাড়া ভাতা সারণি (১ জুলাই ২০১৬ হতে কার্যকর)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              মূল বেতন পরিসীমা অনুযায়ী এলাকাভিত্তিক শতকরা হার ও বিধিবদ্ধ ন্যূনতম সীমা
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {lang === 'bn' ? `বর্তমান সক্রিয় স্ল্যাব: #${toBanglaNum(currentSlab.tierNumber)}` : `Active Slab: #${currentSlab.tierNumber}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 w-12 text-center">ক্র.নং</th>
                <th className="py-2.5 px-4 min-w-44">মূল বেতন পরিসীমা (Basic Salary Range)</th>
                <th className="py-2.5 px-4 min-w-56 text-sky-950 bg-sky-50/60">
                  ঢাকা সিটি কর্পোরেশন এলাকা
                </th>
                <th className="py-2.5 px-4 min-w-64 text-blue-950 bg-blue-50/60">
                  চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট, বরিশাল, রংপুর, নারায়ণগঞ্জ ও গাজীপুর সিটি কর্পোরেশন এবং সাভার পৌর এলাকা
                </th>
                <th className="py-2.5 px-4 min-w-52 text-teal-950 bg-teal-50/60">
                  অন্যান্য এলাকা (জেলা ও উপজেলা)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bangla">
              {STATUTORY_HOUSE_RENT_SLABS_2015.map((slab) => {
                const isActive = slab.tierNumber === currentSlab.tierNumber;
                return (
                  <tr
                    key={slab.tierNumber}
                    className={`transition ${
                      isActive
                        ? 'bg-amber-50/80 font-semibold ring-1 ring-inset ring-amber-400'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      {toBanglaNum(slab.tierNumber)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900">{slab.basicRangeBangla}</span>
                        {isActive && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {slab.basicRangeEnglish}
                      </span>
                    </td>
                    <td className="py-3 px-4 bg-sky-50/30">
                      <span className="font-bold text-sky-900">{slab.dhaka.ruleBangla}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {slab.dhaka.ruleEnglish}
                      </span>
                    </td>
                    <td className="py-3 px-4 bg-blue-50/30">
                      <span className="font-bold text-blue-900">{slab.otherCityCorporation.ruleBangla}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {slab.otherCityCorporation.ruleEnglish}
                      </span>
                    </td>
                    <td className="py-3 px-4 bg-teal-50/30">
                      <span className="font-bold text-teal-900">{slab.otherAreas.ruleBangla}</span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {slab.otherAreas.ruleEnglish}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Legal Gazette Reference */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-600 space-y-1 font-bangla">
        <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>গেজেট ও বিধিবদ্ধ তথ্যসূত্র (Statutory Legal References):</span>
        </h4>
        <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-slate-600">
          <li>
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, অর্থ বিভাগ, বাস্তবায়ন অনুবিভাগ, প্রজ্ঞাপন নং- ০৭.০০.০০০০.১৭১.১৩.০০৩.১৫-৬৪, তারিখ: ১৫ ডিসেম্বর ২০১৫ খ্রি.।
          </li>
          <li>
            উক্ত প্রজ্ঞাপনের অনুচ্ছেদ অনুযায়ী ২০১৫ জাতীয় বেতনস্কেলের বাড়ি ভাড়া ভাতা ১ জুলাই ২০১৬ তারিখ হইতে কার্যকর করা হয়।
          </li>
          <li>
            কোনো কর্মচারী সরকারি বাসস্থানে বসবাস করিলে তিনি বাড়ি ভাড়া ভাতা প্রাপ্য হইবেন না (শতাংশ ও ন্যূনতম সীমা উভয়ই ০ টাকা প্রযোজ্য)।
          </li>
          <li>
            কর্মচারীর মূল বেতন ৩৫,৫০১/- টাকা বা তদূর্ধ্ব হইলে ঢাকা এলাকায় ৫০% (ন্যূনতম ১৯,৫০০/-), অন্যান্য সিটি কর্পোরেশনে ৪০% (ন্যূনতম ১৬,০০০/-) এবং অন্যান্য এলাকায় ৩৫% (ন্যূনতম ১৩,৮০০/-) বাড়ি ভাড়া ভাতা প্রাপ্য।
          </li>
        </ul>
      </div>
    </div>
  );
};
