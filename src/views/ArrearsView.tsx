import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  Download,
  Printer,
  Info,
  Home,
  BadgePercent,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  AlertCircle,
  Building,
  UserCheck,
  Percent,
  MinusCircle,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Language, ArrearCalculationResult, HouseRentLocation, Employee } from '../types.ts';
import { formatCurrency, toBanglaNum, exportToExcel, triggerPrint } from '../utils/formatters.ts';
import {
  OFFICIAL_PAY_SCALES,
  calculateStatutoryHouseRent2015,
  calculateClientArrearsNet
} from '../utils/payscaleData.ts';

interface ArrearsViewProps {
  lang: Language;
}

export const ArrearsView: React.FC<ArrearsViewProps> = ({ lang }) => {
  // Input parameters
  const [grade, setGrade] = useState<number>(11);
  const [stepNumber, setStepNumber] = useState<number>(3);
  const [drawnBasic, setDrawnBasic] = useState<number>(13790);
  const [fixedBasic, setFixedBasic] = useState<number>(26300);
  const [location, setLocation] = useState<HouseRentLocation>('dhaka');
  const [isGovtQuarter, setIsGovtQuarter] = useState<boolean>(false);
  const [incrementPct, setIncrementPct] = useState<number>(5);
  const [specialBenefitPct, setSpecialBenefitPct] = useState<number>(15);
  const [showStatutoryTable, setShowStatutoryTable] = useState<boolean>(false);

  // Available steps for currently selected grade
  const currentScale = useMemo(() => OFFICIAL_PAY_SCALES.find(s => s.grade === grade), [grade]);
  const steps2015 = useMemo(() => currentScale?.scale2015.stages || [], [currentScale]);
  const steps2026 = useMemo(() => currentScale?.scale2026.stages || [], [currentScale]);

  // Employees for quick selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // Results
  const [result, setResult] = useState<ArrearCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load employee list on mount
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

  // When grade changes manually, suggest default values from official pay scales
  const handleGradeChange = (newGrade: number) => {
    setGrade(newGrade);
    const scale = OFFICIAL_PAY_SCALES.find(s => s.grade === newGrade);
    if (scale && scale.scale2015.stages.length > 0) {
      const stageIdx = Math.min(2, scale.scale2015.stages.length - 1);
      setStepNumber(stageIdx + 1);
      setDrawnBasic(scale.scale2015.stages[stageIdx]);
      const target2026Idx = Math.min(stageIdx + 1, scale.scale2026.stages.length - 1);
      setFixedBasic(scale.scale2026.stages[target2026Idx]);
    }
  };

  // When a specific step is chosen
  const handleStepSelect = (step: number) => {
    setStepNumber(step);
    if (steps2015[step - 1] !== undefined) {
      setDrawnBasic(steps2015[step - 1]);
    }
    const target2026Idx = Math.min(step, steps2026.length - 1);
    if (steps2026[target2026Idx] !== undefined) {
      setFixedBasic(steps2026[target2026Idx]);
    }
  };

  // When drawn basic is changed manually
  const handleDrawnBasicChange = (val: number) => {
    setDrawnBasic(val);
    const foundIdx = steps2015.findIndex((s: number) => s === val);
    if (foundIdx !== -1) {
      setStepNumber(foundIdx + 1);
    }
  };

  // When an employee is chosen from dropdown
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => String(e.id) === String(empId));
    if (!emp) return;

    setGrade(emp.grade);
    const drawn = emp.previousBasicPay || emp.currentBasicPay;
    setDrawnBasic(drawn);
    setFixedBasic(emp.currentBasicPay || drawn * 2);

    const empScale = OFFICIAL_PAY_SCALES.find(s => s.grade === emp.grade);
    if (empScale) {
      const idx = empScale.scale2015.stages.findIndex((s: number) => s === drawn);
      if (idx !== -1) {
        setStepNumber(idx + 1);
      }
    }

    if (emp.cityType === 'dhaka') {
      setLocation('dhaka');
    } else if (emp.cityType === 'other_city_corporation') {
      setLocation('other_city_corporation');
    } else {
      setLocation('other');
    }
    setIsGovtQuarter(Boolean(emp.isGovtQuarterProvided));
  };

  // Calculate Arrears with House Rent & Special Benefit Deductions
  const calculateArrears = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/arrears/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          stepNumber,
          drawnBasic2015: drawnBasic,
          fixedBasic2026: fixedBasic,
          location,
          isGovtQuarter,
          customIncrementPct: incrementPct,
          customSpecialBenefitPct: specialBenefitPct
        })
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        // Fallback to client engine
        const clientRes = calculateClientArrearsNet(
          grade,
          drawnBasic,
          fixedBasic,
          location,
          isGovtQuarter,
          {
            stepNumber,
            customIncrementPct: incrementPct,
            customSpecialBenefitPct: specialBenefitPct
          }
        );
        setResult(clientRes);
      }
    } catch (err) {
      console.warn('API error, using client calculation engine:', err);
      const clientRes = calculateClientArrearsNet(
        grade,
        drawnBasic,
        fixedBasic,
        location,
        isGovtQuarter,
        {
          stepNumber,
          customIncrementPct: incrementPct,
          customSpecialBenefitPct: specialBenefitPct
        }
      );
      setResult(clientRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateArrears();
  }, [grade, stepNumber, drawnBasic, fixedBasic, location, isGovtQuarter, incrementPct, specialBenefitPct]);

  // Export to Excel with full House Rent & Special Benefit deduction columns
  const handleExportExcel = () => {
    if (!result) return;
    const rows = result.monthlyBreakdown.map(m => ({
      "Month": m.month,
      "Year": m.year,
      "Phase": m.phaseBangla,
      "2015 Drawn Basic": m.basic2015,
      "2026 Fixed Basic": m.fixedBasic2026,
      "Full Salary Diff": m.difference,
      "Payable %": `${m.percentage}%`,
      "Gross Payable Arrear": m.grossPayableDifference,
      "Increased House Rent (Deduction)": m.increasedHouseRent,
      "15% Special Benefit (Deduction)": m.specialBenefit,
      "Total Deductions": m.totalMonthlyDeduction,
      "Net Payable Arrear": m.netPayableDifference,
      "Gazette Clause": m.sourceClause
    }));
    exportToExcel(rows, `Arrear_Calculation_Grade_${grade}_Net`, 'Net_Arrears');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-bangla font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            <span>গেজেট অনুচ্ছেদ ১(৩) বকেয়া, বাড়ি ভাড়া বৃদ্ধি ও বিশেষ সুবিধা সমন্বয়</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-bangla">
            {lang === 'bn'
              ? 'বেতন পার্থক্য, বাড়ি ভাড়া বৃদ্ধি ও ১৫% বিশেষ সুবিধা কর্তনসহ নীট বকেয়া হিসাব'
              : 'Salary Arrears, House Rent Increase & 15% Special Benefit Net Engine'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla mt-0.5">
            {lang === 'bn'
              ? '২০১৫ স্কেলের বিধিবদ্ধ সারণি অনুসারে ৩০ জুন ও ১ জুলাই ২০২৬ এর বাড়ি ভাড়া নির্ণয়, ৫% ইনক্রিমেন্ট, ১৫% বিশেষ সুবিধা কর্তনপূর্বক ১২ মাসের নীট পরিশোধযোগ্য বকেয়া নির্ধারণ'
              : 'Calculate June 30 & July 1, 2026 House Rent (2015 Scale Table), 5% Increment, 15% Special Benefit, and 12-Month Net Payable Arrears'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStatutoryTable(!showStatutoryTable)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-lg border border-sky-200 transition font-bangla"
          >
            <Home className="w-3.5 h-3.5 text-sky-600" />
            <span>{showStatutoryTable ? (lang === 'bn' ? 'সারণি লুকান' : 'Hide Rates Table') : (lang === 'bn' ? 'বাড়ি ভাড়া সারণি' : 'House Rent Rates Table')}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition font-bangla"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'bn' ? 'এক্সপোর্ট এক্সেল' : 'Export Excel'}</span>
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

      {/* Statutory House Rent Allowance Reference Table (from Pay Scale 2015, effective 1 July 2016) */}
      {showStatutoryTable && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-xs font-bangla">
          <div className="flex items-center justify-between mb-3 border-b border-amber-200/60 pb-2">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-amber-800" />
              <h3 className="text-sm font-bold text-amber-950">
                {lang === 'bn'
                  ? 'জাতীয় বেতনস্কেল ২০১৫: ১ জুলাই ২০১৬ হইতে কার্যকর মাসিক বাড়ি ভাড়া ভাতার হার ও বিধিবদ্ধ ন্যূনতম সীমা'
                  : 'National Pay Scale 2015: Monthly House Rent Allowance Rates & Statutory Minimums (Effective 1 July 2016)'}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              বিধিবদ্ধ পরিপত্র হার
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-amber-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-amber-100 text-amber-900 font-bold">
                <tr>
                  <th className="py-2.5 px-3 border border-amber-200">{lang === 'bn' ? 'মূল বেতন (Basic Salary)' : 'Basic Salary'}</th>
                  <th className="py-2.5 px-3 border border-amber-200">{lang === 'bn' ? 'ঢাকা সিটি কর্পোরেশন এলাকা' : 'Dhaka City Corporation Area'}</th>
                  <th className="py-2.5 px-3 border border-amber-200">
                    {lang === 'bn'
                      ? 'চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট, বরিশাল, রংপুর, নারায়ণগঞ্জ ও গাজীপুর সিটি কর্পোরেশন এবং সাভার পৌর এলাকা'
                      : 'Chattogram, Khulna, Rajshahi, Sylhet, Barishal, Rangpur, Narayanganj & Gazipur CC and Savar'}
                  </th>
                  <th className="py-2.5 px-3 border border-amber-200">{lang === 'bn' ? 'অন্যান্য এলাকা (Other locations)' : 'Other Locations'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-slate-800">
                <tr className="hover:bg-amber-50/50">
                  <td className="py-2 px-3 font-semibold border border-amber-200 bg-amber-50/30">
                    {lang === 'bn' ? '৯,৭০০ টাকা পর্যন্ত' : 'Up to 9,700 Taka'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৬৫% হারে, ন্যূনতম ৫,৬০০ টাকা' : '65% of basic salary, min Tk. 5,600'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৫৫% হারে, ন্যূনতম ৫,০০০ টাকা' : '55% of basic salary, min Tk. 5,000'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৫০% হারে, ন্যূনতম ৪,৫০০ টাকা' : '50% of basic salary, min Tk. 4,500'}
                  </td>
                </tr>
                <tr className="hover:bg-amber-50/50">
                  <td className="py-2 px-3 font-semibold border border-amber-200 bg-amber-50/30">
                    {lang === 'bn' ? '৯,৭০১ টাকা হইতে ১৬,০০০ টাকা পর্যন্ত' : 'From Tk 9,701 to Tk 16,000'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৬০% হারে, ন্যূনতম ৬,৪০০ টাকা' : '60% of basic salary, min Tk. 6,400'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৫০% হারে, ন্যূনতম ৫,৪০০ টাকা' : '50% of basic salary, min Tk. 5,400'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৪৫% হারে, ন্যূনতম ৪,৮০০ টাকা' : '45% of basic salary, min Tk. 4,800'}
                  </td>
                </tr>
                <tr className="hover:bg-amber-50/50">
                  <td className="py-2 px-3 font-semibold border border-amber-200 bg-amber-50/30">
                    {lang === 'bn' ? '১৬,০০১ টাকা হইতে ৩৫,৫০০ টাকা পর্যন্ত' : 'From Tk 16,001 to Tk 35,500'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৫৫% হারে, ন্যূনতম ৯,৬০০ টাকা' : '55% of basic salary, min Tk. 9,600'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৪৫% হারে, ন্যূনতম ৮,০০০ টাকা' : '45% of basic salary, min Tk. 8,000'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৪০% হারে, ন্যূনতম ৭,০০০ টাকা' : '40% of basic salary, min Tk. 7,000'}
                  </td>
                </tr>
                <tr className="hover:bg-amber-50/50">
                  <td className="py-2 px-3 font-semibold border border-amber-200 bg-amber-50/30">
                    {lang === 'bn' ? '৩৫,৫০১ টাকা ও তদূর্ধ্ব' : 'Tk. 35,501 and above'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৫০% হারে, ন্যূনতম ১৯,৫০০ টাকা' : '50% of basic salary, min Tk. 19,500'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৪০% হারে, ন্যূনতম ১৬,০০০ টাকা' : '40% of basic salary, min Tk. 16,000'}
                  </td>
                  <td className="py-2 px-3 border border-amber-200">
                    {lang === 'bn' ? 'মূল বেতনের ৩৫% হারে, ন্যূনতম ১৩,৮০০ টাকা' : '35% of basic salary, min Tk. 13,800'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Input Parameters Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs font-bangla">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>{lang === 'bn' ? 'বকেয়া ও বাড়ি ভাড়া সমন্বয় পরামিতি (Input Parameters)' : 'Arrear & House Rent Parameters'}</span>
          </h3>

          {employees.length > 0 && (
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-slate-500" />
              <label className="text-xs text-slate-600 font-semibold">{lang === 'bn' ? 'কর্মকর্তা/কর্মচারী নির্বাচন:' : 'Quick Select Employee:'}</label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="text-xs p-1.5 rounded border border-slate-300 bg-slate-50 text-slate-800 font-bangla focus:ring-1 focus:ring-sky-500"
              >
                <option value="">{lang === 'bn' ? '-- সংরক্ষিত কর্মচারী হতে পূরণ করুন --' : '-- Load from saved employees --'}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameBangla} ({toBanglaNum(emp.grade)}ম গ্রেড - {emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Grade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'কর্মরত গ্রেড' : 'Grade'}
            </label>
            <select
              value={grade}
              onChange={(e) => handleGradeChange(Number(e.target.value))}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-sky-500"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(g => (
                <option key={g} value={g}>
                  {lang === 'bn' ? `${toBanglaNum(g)}ম গ্রেড (${g <= 9 ? '১ম-৯ম শ্রেণি' : '১০ম-২০তম শ্রেণি'})` : `Grade ${g} (${g <= 9 ? 'Gr 1-9' : 'Gr 10-20'})`}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {grade <= 9 ? '১ম-৯ম গ্রেড: ১ম পর্যায়ে ৪০%, ২য় পর্যায়ে ৭০%' : '১০ম-২০তম গ্রেড: ১ম পর্যায়ে ৫০%, ২য় পর্যায়ে ৭৫%'}
            </span>
          </div>

          {/* Drawn Step as of 30 June 2026 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? '৩০ জুন ২০২৬ আহরিত ধাপ (Step) *' : 'Drawn Step (30 June 2026) *'}
            </label>
            <select
              value={stepNumber}
              onChange={(e) => handleStepSelect(Number(e.target.value))}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white font-mono focus:ring-1 focus:ring-sky-500"
            >
              {steps2015.map((stg: number, sIdx: number) => (
                <option key={sIdx} value={sIdx + 1}>
                  {lang === 'bn'
                    ? `${toBanglaNum(sIdx + 1)}নং ধাপ (৳${stg.toLocaleString('en-IN')})`
                    : `Step ${sIdx + 1} (Tk. ${stg.toLocaleString('en-IN')})`}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {lang === 'bn' ? '২০১৫ বেতনস্কেলের ধাপ নির্বাচন করুন' : 'Select step in 2015 pay scale'}
            </span>
          </div>

          {/* Drawn Basic as of 30 June 2026 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? '৩০ জুন ২০২৬ আহরিত বেতন (২০১৫) *' : 'Drawn Basic (30-06-2026) *'}
            </label>
            <input
              type="number"
              value={drawnBasic}
              onChange={(e) => handleDrawnBasicChange(Number(e.target.value))}
              className="w-full text-xs p-2 rounded border border-slate-300 font-mono focus:ring-1 focus:ring-sky-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {lang === 'bn' ? 'নির্বাচিত ধাপ বা কাস্টম আহরিত মূল বেতন' : 'Selected step basic or custom'}
            </span>
          </div>

          {/* Fixed Basic Pay 2026 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? '১ জুলাই ২০২৬ নির্ধারিত বেতন (২০২৬) *' : 'Fixed Basic Pay 2026 *'}
            </label>
            <input
              type="number"
              value={fixedBasic}
              onChange={(e) => setFixedBasic(Number(e.target.value))}
              className="w-full text-xs p-2 rounded border border-slate-300 font-mono focus:ring-1 focus:ring-sky-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {lang === 'bn' ? 'গেজেট অনুচ্ছেদ ৫ অনুসারে ২০২৬ মূল বেতন' : 'Fixed pay under Clause 5'}
            </span>
          </div>
        </div>

        {/* Quick Step Buttons for Active Grade */}
        {steps2015.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600">
                {lang === 'bn' ? `${toBanglaNum(grade)}ম গ্রেডের ধাপসমূহ (ক্লিক করে দ্রুত নির্বাচন করুন):` : `Steps for Grade ${grade} (Click to select):`}
              </span>
              <span className="text-[10px] text-slate-400">
                {lang === 'bn' ? `মোট ধাপ: ${toBanglaNum(steps2015.length)}টি` : `Total Steps: ${steps2015.length}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {steps2015.map((stageAmount: number, sIdx: number) => {
                const sNum = sIdx + 1;
                const isSelected = stepNumber === sNum;
                return (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleStepSelect(sNum)}
                    className={`px-2 py-1 rounded text-[11px] font-mono border transition ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{lang === 'bn' ? `ধাপ ${toBanglaNum(sNum)}` : `St ${sNum}`}:</span>{' '}
                    <span>৳{stageAmount.toLocaleString('en-IN')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Location & Checkbox Options */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs items-center">
          {/* Duty Station */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'কর্মস্থল এলাকা (বাড়ি ভাড়া সারণি)' : 'Duty Station Area'}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as HouseRentLocation)}
              disabled={isGovtQuarter}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:ring-1 focus:ring-sky-500 disabled:bg-slate-100"
            >
              <option value="dhaka">
                {lang === 'bn' ? 'ঢাকা সিটি কর্পোরেশন এলাকা' : 'Dhaka City Corporation'}
              </option>
              <option value="other_city_corporation">
                {lang === 'bn' ? 'অন্যান্য ৭টি সিটি কর্পোরেশন ও সাভার পৌরসভা' : 'Other City Corps & Savar'}
              </option>
              <option value="other">
                {lang === 'bn' ? 'অন্যান্য এলাকা (জেলা ও উপজেলা)' : 'Other Locations (Districts/Upazilas)'}
              </option>
            </select>
          </div>

          <div className="flex items-center pt-4">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGovtQuarter}
                onChange={(e) => setIsGovtQuarter(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="text-slate-700 font-semibold text-xs">
                {lang === 'bn' ? 'সরকারি বাসস্থান বরাদ্দপ্রাপ্ত (বাড়ি ভাড়া শূন্য)' : 'Govt Quarter Provided (House Rent Zero)'}
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-3 pt-4 sm:justify-end">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-600 font-semibold">{lang === 'bn' ? 'পরবর্তী ধাপে ইনক্রিমেন্ট:' : 'Next Step:'}</span>
              <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded font-mono text-xs">
                {result?.subsequentStepBasic2015 ? `৳${result.subsequentStepBasic2015.toLocaleString('en-IN')}` : '৫%'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-600 font-semibold">{lang === 'bn' ? 'বিশেষ সুবিধা:' : 'Special Benefit:'}</span>
              <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded font-mono text-xs">
                ১৫% (15%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Step-by-Step Calculation Breakdown Cards */}
      {result && (
        <div className="space-y-4 font-bangla">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'বাড়ি ভাড়া বৃদ্ধি ও ১৫% বিশেষ সুবিধা সমন্বয় ও কর্তন বিশ্লেষণ' : 'Step-by-Step House Rent & Benefit Audit Trail'}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {lang === 'bn' ? 'গেজেট সারণি ও বিধিমালা অনুসারে ধাপভিত্তিক হিসাব' : 'Statutory Slab & Deduction Breakdown'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Step 1: House Rent June 30, 2026 */}
            <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">ধাপ ১: ৩০ জুন ২০২৬</span>
                <span className="font-mono text-[10px] text-slate-400">২০১৫ বেতনস্কেল</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">
                {lang === 'bn' ? '৩০ জুন ২০২৬ আহরিত ধাপ ও বাড়ি ভাড়া' : 'House Rent (30 June 2026)'}
              </h4>
              <div className="text-2xl font-bold font-mono text-sky-700 mt-2">
                {formatCurrency(result.houseRentJune2026?.finalAmount || 0, lang)}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <p>আহরিত ধাপ: <span className="font-mono font-semibold text-slate-900">{toBanglaNum(result.grade)}ম গ্রেড, {toBanglaNum(result.stepNumber2015 || stepNumber)}নং ধাপ (৳{result.drawnBasic2015.toLocaleString('en-IN')})</span></p>
                <p>হার: <span className="font-mono font-semibold">{result.houseRentJune2026?.ratePercentage}%</span> (ন্যূনতম: ৳{result.houseRentJune2026?.minimumAmount.toLocaleString('en-IN')})</p>
                {result.houseRentJune2026?.minApplied && (
                  <p className="text-amber-700 font-semibold text-[10px]">• বিধিবদ্ধ ন্যূনতম সীমা প্রযোজ্য হয়েছে</p>
                )}
              </div>
            </div>

            {/* Step 2: Subsequent Step of That Grade */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">ধাপ ২: ১ জুলাই ২০২৬</span>
                <span className="font-mono text-[10px] text-slate-400">পরবর্তী ধাপ</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">
                {lang === 'bn' ? 'উক্ত গ্রেডের পরবর্তী ধাপ ও মূল বেতন' : 'Subsequent Step & Basic Pay'}
              </h4>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-2">
                ৳{(result.subsequentStepBasic2015 || result.drawnBasic2015 + (result.increment5PctAmount || 0)).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <p>পরবর্তী ধাপ: <span className="font-mono font-semibold text-slate-900">{toBanglaNum(result.grade)}ম গ্রেড, {toBanglaNum(result.subsequentStepNumber2015 || (stepNumber + 1))}নং ধাপ</span></p>
                <p>ধাপবৃদ্ধি/ইনক্রিমেন্ট: <span className="font-mono font-semibold text-emerald-700">+৳{(result.increment5PctAmount || 0).toLocaleString('en-IN')}</span></p>
                {result.isAtCeiling2015 && (
                  <p className="text-amber-700 font-semibold text-[10px]">• সর্বোচ্চ ধাপে পৌঁছানোয় স্থবিরতা/ব্যক্তিগত বেতন প্রযোজ্য</p>
                )}
              </div>
            </div>

            {/* Step 3: 15% Special Benefit on Subsequent Step */}
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">ধাপ ৩: বিশেষ সুবিধা</span>
                <span className="font-mono text-[10px] text-purple-700 font-semibold">১৫% পৃথক সংরক্ষিত</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">
                {lang === 'bn' ? 'পরবর্তী ধাপের ভিত্তিতে ১৫% বিশেষ সুবিধা' : '15% Special Benefit (Isolated)'}
              </h4>
              <div className="text-2xl font-bold font-mono text-purple-700 mt-2">
                {formatCurrency(result.specialBenefit15PctAmount || 0, lang)}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <p>ভিত্তি: <span className="font-mono font-semibold">৳{(result.subsequentStepBasic2015 || 0).toLocaleString('en-IN')} এর ১৫%</span></p>
                <p className="text-purple-700 font-semibold text-[10px]">• এই অংকটি আলাদা রাখা হয়েছে এবং বকেয়া হতে কর্তন হইবে</p>
              </div>
            </div>

            {/* Step 4: House Rent July 1, 2026 based on Subsequent Step */}
            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">ধাপ ৪: ১ জুলাই ২০২৬</span>
                <span className="font-mono text-[10px] text-slate-400">পরবর্তী ধাপের ভাড়া</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">
                {lang === 'bn' ? '১ জুলাই ২০২৬ পরবর্তী ধাপের বাড়ি ভাড়া' : 'House Rent (1 July 2026)'}
              </h4>
              <div className="text-2xl font-bold font-mono text-indigo-700 mt-2">
                {formatCurrency(result.houseRentJuly2026?.finalAmount || 0, lang)}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <p>ভিত্তি বেতন: <span className="font-mono font-semibold">৳{(result.subsequentStepBasic2015 || 0).toLocaleString('en-IN')}</span></p>
                <p>হার: <span className="font-mono font-semibold">{result.houseRentJuly2026?.ratePercentage}%</span> (ন্যূনতম: ৳{result.houseRentJuly2026?.minimumAmount.toLocaleString('en-IN')})</p>
              </div>
            </div>

            {/* Step 5: Increased House Rent Isolated */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">ধাপ ৫: বাড়ি ভাড়া বৃদ্ধি</span>
                <span className="font-mono text-[10px] text-rose-700 font-semibold">পৃথক সংরক্ষিত</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1">
                {lang === 'bn' ? 'বৃদ্ধিপ্রাপ্ত বাড়ি ভাড়া ভাতা (Increased HRA)' : 'Increased House Rent (Isolated)'}
              </h4>
              <div className="text-2xl font-bold font-mono text-rose-700 mt-2">
                {formatCurrency(result.monthlyIncreasedHouseRent || 0, lang)}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <p>সূত্র: <span className="font-mono">৳{result.houseRentJuly2026?.finalAmount} - ৳{result.houseRentJune2026?.finalAmount}</span></p>
                <p className="text-rose-700 font-semibold text-[10px]">• এই অংকটি আলাদা রাখা হয়েছে এবং বকেয়া হতে কর্তন হইবে</p>
              </div>
            </div>

            {/* Step 6: Total Monthly Deductions */}
            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-300 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">ধাপ ৬: মাসিক কর্তন</span>
                <span className="font-mono text-[10px] text-amber-800 font-bold">বকেয়া হতে কর্তনযোগ্য</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                {lang === 'bn' ? 'মাসিক মোট কর্তন (বর্ধিত বাড়ি ভাড়া + বিশেষ সুবিধা)' : 'Monthly Total Deductions'}
              </h4>
              <div className="text-2xl font-bold font-mono text-amber-900 mt-2">
                {formatCurrency(result.monthlyTotalDeductions || 0, lang)}
              </div>
              <div className="text-[11px] text-slate-700 mt-1 space-y-0.5">
                <p>বর্ধিত বাড়ি ভাড়া: <span className="font-mono font-semibold text-rose-700">৳{(result.monthlyIncreasedHouseRent || 0).toLocaleString('en-IN')}</span></p>
                <p>১৫% বিশেষ সুবিধা: <span className="font-mono font-semibold text-purple-700">৳{(result.specialBenefit15PctAmount || 0).toLocaleString('en-IN')}</span></p>
                <p className="text-amber-800 font-semibold text-[10px]">• প্রতি মাসের প্রদেয় বকেয়া হতে এই সমন্বয় বিয়োগ করা হইবে</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main High-Level Summary Cards: Gross vs Net Arrears */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-bangla">
          {/* Monthly Gross Difference */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">
              {lang === 'bn' ? '১০০% মাসিক বেতন পার্থক্য' : 'Full Monthly Diff (100%)'}
            </span>
            <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-2">
              {formatCurrency(result.totalMonthlyDifference, lang)}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {lang === 'bn'
                ? `নতুন ৳${result.fixedBasic2026.toLocaleString('en-IN')} - পুরাতন ৳${result.drawnBasic2015.toLocaleString('en-IN')}`
                : `New Tk. ${result.fixedBasic2026} - Old Tk. ${result.drawnBasic2015}`}
            </p>
          </div>

          {/* Phase 1 Summary: Gross & Net */}
          <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white p-5 rounded-xl shadow-xs border border-sky-800/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-300 uppercase font-semibold">
                {lang === 'bn' ? '১ম পর্যায় নীট বকেয়া (৬ মাস)' : 'Phase 1 Net Arrears (6 Mos)'}
              </span>
              <span className="bg-sky-400/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {result.phase1Percentage}%
              </span>
            </div>
            <h3 className="text-2xl font-bold font-mono text-sky-200 mt-2">
              {formatCurrency(result.totalNetArrearJulyToDec2026 ?? result.totalArrearJulyToDec2026, lang)}
            </h3>
            <div className="text-xs text-sky-300 mt-1">
              <p>প্রতি মাসে নীট: <span className="font-mono font-semibold">{formatCurrency(result.phase1MonthlyNetPayable ?? result.phase1MonthlyPayable, lang)}</span></p>
              <p className="text-[10px] text-sky-400">মোট প্রদেয় ৳{result.phase1MonthlyPayable.toLocaleString('en-IN')} - কর্তন ৳{(result.monthlyTotalDeductions || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Phase 2 Summary: Gross & Net */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-xl shadow-xs border border-indigo-800/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-300 uppercase font-semibold">
                {lang === 'bn' ? '২য় পর্যায় নীট বকেয়া (৬ মাস)' : 'Phase 2 Net Arrears (6 Mos)'}
              </span>
              <span className="bg-indigo-400/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {result.phase2Percentage}%
              </span>
            </div>
            <h3 className="text-2xl font-bold font-mono text-indigo-200 mt-2">
              {formatCurrency(result.totalNetArrearJanToJun2027 ?? result.totalArrearJanToJun2027, lang)}
            </h3>
            <div className="text-xs text-indigo-300 mt-1">
              <p>প্রতি মাসে নীট: <span className="font-mono font-semibold">{formatCurrency(result.phase2MonthlyNetPayable ?? result.phase2MonthlyPayable, lang)}</span></p>
              <p className="text-[10px] text-indigo-400">মোট প্রদেয় ৳{result.phase2MonthlyPayable.toLocaleString('en-IN')} - কর্তন ৳{(result.monthlyTotalDeductions || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Total 12-Month Net Payable Arrear */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-5 rounded-xl shadow-xs border border-emerald-700/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 uppercase font-semibold">
                {lang === 'bn' ? 'সর্বমোট ১২ মাসের নীট বকেয়া' : 'Total 12-Mo Net Arrears'}
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                NET
              </span>
            </div>
            <h3 className="text-2xl font-bold font-mono text-emerald-200 mt-2">
              {formatCurrency(result.total12MonthsNetArrear ?? (result.totalArrearJulyToDec2026 + result.totalArrearJanToJun2027), lang)}
            </h3>
            <div className="text-xs text-emerald-300 mt-1">
              <p>মোট ১২ মাসের গ্রস: <span className="font-mono">৳{(result.total12MonthsGrossArrear || (result.totalArrearJulyToDec2026 + result.totalArrearJanToJun2027)).toLocaleString('en-IN')}</span></p>
              <p className="text-[10px] text-emerald-400">মোট ১২ মাসের কর্তন: -৳{(result.total12MonthsDeductions || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Month-by-month Schedule Table with Complete Deductions & Net Arrear */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-bangla flex items-center space-x-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>{lang === 'bn' ? '১২ মাসের পর্যায়ভিত্তিক বকেয়া, সমন্বয় কর্তন ও নীট পরিশোধ বিবরণী' : '12-Month Phased Arrears, Deductions & Net Schedule'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-bangla mt-0.5">
                {lang === 'bn'
                  ? 'গেজেট অনুচ্ছেদ ১(৩)(ক) ও ১(৩)(খ) অনুযায়ী ১ম পর্যায় (জুলাই-ডিসে ২০২৬) ও ২য় পর্যায় (জানু-জুন ২০২৭)'
                  : 'Phase 1 (July-Dec 2026) & Phase 2 (Jan-June 2027) per Gazette Clause 1(3)'}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bangla">
              {lang === 'bn' ? 'বাড়ি ভাড়া বৃদ্ধি ও ১৫% সুবিধা কর্তন সমন্বিত' : 'House Rent & Special Benefit Deducted'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bangla">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">{lang === 'bn' ? 'মাস ও বছর' : 'Month & Year'}</th>
                  <th className="py-3 px-3">{lang === 'bn' ? 'পর্যায়' : 'Phase'}</th>
                  <th className="py-3 px-3 text-right">{lang === 'bn' ? 'আহরিত বেতন' : 'Old Basic'}</th>
                  <th className="py-3 px-3 text-right">{lang === 'bn' ? 'নতুন মূল বেতন' : 'New Basic'}</th>
                  <th className="py-3 px-3 text-right">{lang === 'bn' ? 'মোট পার্থক্য' : 'Full Diff'}</th>
                  <th className="py-3 px-2 text-center">{lang === 'bn' ? 'প্রদেয় %' : 'Rate %'}</th>
                  <th className="py-3 px-3 text-right text-sky-900 bg-sky-50/50">{lang === 'bn' ? 'মোট প্রদেয় বকেয়া' : 'Gross Arrear'}</th>
                  <th className="py-3 px-3 text-right text-rose-800 bg-rose-50/40">{lang === 'bn' ? 'বাড়ি ভাড়া বৃদ্ধি (-)' : 'HR Inc (-)'}</th>
                  <th className="py-3 px-3 text-right text-purple-800 bg-purple-50/40">{lang === 'bn' ? '১৫% সুবিধা (-)' : '15% SB (-)'}</th>
                  <th className="py-3 px-3 text-right text-emerald-900 bg-emerald-50/70 font-black">{lang === 'bn' ? 'নীট প্রদেয় বকেয়া' : 'Net Payable Arrear'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {result.monthlyBreakdown.map((item, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50/80 transition ${idx < 6 ? 'bg-sky-50/15' : 'bg-indigo-50/15'}`}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 font-bangla">
                      {lang === 'bn' ? `${item.month}, ${toBanglaNum(item.year)}` : `${item.month} ${item.year}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-bangla ${
                        idx < 6 ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {lang === 'bn' ? item.phaseBangla : item.phase}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                      {formatCurrency(item.basic2015, lang)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-mono font-semibold">
                      {formatCurrency(item.fixedBasic2026, lang)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                      {formatCurrency(item.difference, lang)}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold font-mono text-slate-800">
                      {item.percentage}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-sky-900 bg-sky-50/40">
                      {formatCurrency(item.grossPayableDifference || item.payableDifference, lang)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700 bg-rose-50/30">
                      -৳{(item.increasedHouseRent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-700 bg-purple-50/30">
                      -৳{(item.specialBenefit || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-800 font-mono text-sm bg-emerald-50/50">
                      {formatCurrency(item.netPayableDifference ?? item.payableDifference, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                {/* 12 Months Summary Row */}
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-right font-bangla text-xs">
                    {lang === 'bn' ? '১ম ও ২য় পর্যায় সর্বমোট ১২ মাসের মোট ও নীট বকেয়া:' : 'Total 12 Months Arrears & Deductions:'}
                  </td>
                  <td className="py-3 px-3 text-right text-sky-900 font-mono text-xs bg-sky-100/50">
                    {formatCurrency(result.total12MonthsGrossArrear ?? (result.totalArrearJulyToDec2026 + result.totalArrearJanToJun2027), lang)}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-800 font-mono text-xs bg-rose-100/50">
                    -৳{(result.total12MonthsIncreasedHouseRent || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-purple-800 font-mono text-xs bg-purple-100/50">
                    -৳{(result.total12MonthsSpecialBenefit || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-900 font-mono text-sm font-black bg-emerald-100/70">
                    {formatCurrency(result.total12MonthsNetArrear ?? (result.totalArrearJulyToDec2026 + result.totalArrearJanToJun2027), lang)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Official Audit Trail Trace Steps */}
      {result && result.trace && result.trace.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs font-bangla">
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'bn' ? 'অডিট ও বিধিমালা সংক্রান্ত প্রমাণীকরণ ট্রেইল (Calculation Trace)' : 'Audit & Statutory Trace Trail'}
            </h3>
          </div>

          <div className="space-y-3">
            {result.trace.map((step, sIdx) => (
              <div key={sIdx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-bold mb-1">
                  <span>ধাপ {toBanglaNum(step.stepNumber)}: {step.stepNameBangla}</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    {step.sourceClause}
                  </span>
                </div>
                <p className="text-slate-600 font-mono text-[11px] mb-1">
                  <span className="font-semibold text-slate-700">সূত্র:</span> {step.formula}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500">
                  <span>{step.intermediateValues}</span>
                  <span className="font-bold text-slate-900 font-mono">ফলাফল: {typeof step.result === 'number' ? `৳${step.result.toLocaleString('en-IN')}` : step.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
