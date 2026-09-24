import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Printer,
  Download,
  FileSpreadsheet,
  FileText,
  Building,
  User,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  Coins,
  ShieldCheck,
  CreditCard,
  Home,
  Scale
} from 'lucide-react';
import { Language, Employee, AllowanceResult, DeductionResult } from '../types.ts';
import { calculateStatutoryHouseRent2015Client } from '../utils/houseRentCalculator.ts';
import {
  formatCurrency,
  toBanglaNum,
  triggerPrint,
  numberToBanglaWords,
  numberToEnglishWords,
  exportPaySlipPDF,
  exportToExcel,
  exportToDocx
} from '../utils/formatters.ts';

interface SalaryCalculatorViewProps {
  lang: Language;
}

const SCALE_PRESETS = [
  { labelBn: 'মন্ত্রিপরিষদ সচিব / মুখ্য সচিব', labelEn: 'Cabinet / Principal Secretary', grade: 1, basic: 172000, descBn: 'নির্ধারিত পদ (৳১,৭২,০০০)' },
  { labelBn: 'সিনিয়র সচিব', labelEn: 'Senior Secretary', grade: 1, basic: 164000, descBn: 'নির্ধারিত পদ (৳১,৬৪,০০০)' },
  { labelBn: 'সচিব (১ম গ্রেড)', labelEn: 'Secretary (Grade 1)', grade: 1, basic: 156000, descBn: '১ম গ্রেড প্রারম্ভিক (৳১,৫৬,০০০)' },
  { labelBn: 'উপসচিব (৫ম গ্রেড)', labelEn: 'Deputy Secretary (Grade 5)', grade: 5, basic: 80000, descBn: '৫ম গ্রেড প্রারম্ভিক (৳৮০,০০০)' },
  { labelBn: 'সহকারী সচিব (৯ম গ্রেড)', labelEn: 'Assistant Secretary (Grade 9)', grade: 9, basic: 44000, descBn: '৯ম গ্রেড প্রারম্ভিক (৳৪৪,০০০)' },
  { labelBn: '১০ম গ্রেড কর্মকর্তা', labelEn: 'Grade 10 Officer', grade: 10, basic: 32000, descBn: '১০ম গ্রেড (৳৩২,০০০)' },
  { labelBn: 'গেজেট উদা-২: ১১তম গ্রেড', labelEn: 'Gazette Ex-2: Grade 11', grade: 11, basic: 26300, descBn: 'গেজেট পৃষ্ঠা ৮ উদাহরণ (৳২৬,৩০০)' },
  { labelBn: 'গেজেট উদা-১: ১৬তম গ্রেড', labelEn: 'Gazette Ex-1: Grade 16', grade: 16, basic: 21900, descBn: 'গেজেট পৃষ্ঠা ৭ উদাহরণ (৳২১,৯০০)' },
  { labelBn: 'অফিস সহায়ক (২০তম গ্রেড)', labelEn: 'Support Staff (Grade 20)', grade: 20, basic: 17800, descBn: '২০তম গ্রেড প্রারম্ভিক (৳১৭,৮০০)' }
];

const SALARY_MONTHS = [
  { value: 'July 2026', labelBn: 'জুলাই ২০২৬', labelEn: 'July 2026' },
  { value: 'August 2026', labelBn: 'আগস্ট ২০২৬', labelEn: 'August 2026' },
  { value: 'September 2026', labelBn: 'সেপ্টেম্বর ২০২৬', labelEn: 'September 2026' },
  { value: 'October 2026', labelBn: 'অক্টোবর ২০২৬', labelEn: 'October 2026' },
  { value: 'November 2026', labelBn: 'নভেম্বর ২০২৬', labelEn: 'November 2026' },
  { value: 'December 2026', labelBn: 'ডিসেম্বর ২০২৬', labelEn: 'December 2026' },
  { value: 'January 2027', labelBn: 'জানুয়ারি ২০২৭', labelEn: 'January 2027' },
  { value: 'February 2027', labelBn: 'ফেব্রুয়ারি ২০২৭', labelEn: 'February 2027' },
  { value: 'March 2027', labelBn: 'মার্চ ২০২৭', labelEn: 'March 2027' },
  { value: 'April 2027', labelBn: 'এপ্রিল ২০২৭ (বৈশাখী ভাতা)', labelEn: 'April 2027 (Boishakh)' },
  { value: 'May 2027', labelBn: 'মে ২০২৭', labelEn: 'May 2027' },
  { value: 'June 2027', labelBn: 'জুন ২০২৭', labelEn: 'June 2027' }
];

export const SalaryCalculatorView: React.FC<SalaryCalculatorViewProps> = ({ lang }) => {
  // Database Employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('custom');

  // Employee Profile Metadata
  const [employeeName, setEmployeeName] = useState<string>('মো: রফিকুল ইসলাম');
  const [employeeCode, setEmployeeCode] = useState<string>('EMP-GZ-16');
  const [designation, setDesignation] = useState<string>('অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক');
  const [department, setDepartment] = useState<string>('অর্থ বিভাগ, অর্থ মন্ত্রণালয়');
  const [nid, setNid] = useState<string>('1985269250000001');
  const [bankAccount, setBankAccount] = useState<string>('0201002345678');
  const [bankName, setBankName] = useState<string>('সোনালী ব্যাংক পিএলসি, সচিবালয় শাখা');
  const [gpfAccountNumber, setGpfAccountNumber] = useState<string>('GPF-GZ-1601');
  const [salaryMonth, setSalaryMonth] = useState<string>('July 2026');

  // Salary Parameters
  const [basicPay, setBasicPay] = useState<number>(26300);
  const [grade, setGrade] = useState<number>(11);
  const [cityType, setCityType] = useState<'dhaka' | 'other_city_corporation' | 'other_areas'>('dhaka');
  const [age, setAge] = useState<number>(45);
  const [isGovtQuarterProvided, setIsGovtQuarterProvided] = useState<boolean>(false);
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [isEligibleTiffin, setIsEligibleTiffin] = useState<boolean>(true);
  const [isEligibleConveyance, setIsEligibleConveyance] = useState<boolean>(true);
  const [includeFestival, setIncludeFestival] = useState<boolean>(false);
  const [includeBoishakh, setIncludeBoishakh] = useState<boolean>(false);
  const [hasWashAllowance, setHasWashAllowance] = useState<boolean>(false);
  const [hasCurrentCharge, setHasCurrentCharge] = useState<boolean>(false);
  const [houseRentRule, setHouseRentRule] = useState<'2015_statutory' | '2026_grade_based'>('2015_statutory');

  // Deductions Parameters
  const [gpfPercentage, setGpfPercentage] = useState<number>(10);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [groupInsurance, setGroupInsurance] = useState<number>(150);
  const [benevolentFund, setBenevolentFund] = useState<number>(100);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  // Calculation Results
  const [allowanceResult, setAllowanceResult] = useState<AllowanceResult | null>(null);
  const [deductionResult, setDeductionResult] = useState<DeductionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Fetch employees list from database
  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setEmployees(json.data);
        }
      })
      .catch(err => console.error('Failed to load employees:', err));
  }, []);

  // Handle Employee Selection
  const handleEmployeeChange = (empIdStr: string) => {
    setSelectedEmployeeId(empIdStr);
    if (empIdStr === 'custom') return;

    const emp = employees.find(e => String(e.id) === empIdStr);
    if (emp) {
      setEmployeeName(emp.nameBangla || emp.nameEnglish);
      setEmployeeCode(emp.employeeCode);
      setDesignation(emp.currentDesignation || '');
      setDepartment(emp.department || 'অর্থ বিভাগ');
      setGrade(Number(emp.grade) || 11);
      setBasicPay(Number(emp.currentBasicPay) || 26300);
      setCityType((emp.cityType as any) || 'dhaka');
      setIsGovtQuarterProvided(Boolean(emp.isGovtQuarterProvided));
      setChildrenCount(emp.childrenCount || 0);
      setNid(emp.nid || '1985269250000001');
      setBankAccount(emp.bankAccount || '0201002345678');
      setBankName(`${emp.bankName || 'সোনালী ব্যাংক পিএলসি'}, ${emp.branchName || 'সচিবালয় কর্পোরেট শাখা'}`);
      setGpfAccountNumber(emp.gpfAccountNumber || `GPF-${emp.employeeCode}`);
    }
  };

  // Client-side fallback calculation to guarantee instantaneous preview
  const computeLocalFallback = () => {
    let houseRate = 0;
    let houseRent = 0;
    let statutoryHouseRentInfo = undefined;

    if (isGovtQuarterProvided) {
      houseRate = 0;
      houseRent = 0;
    } else if (houseRentRule === '2015_statutory') {
      const loc = cityType === 'dhaka' ? 'dhaka' : cityType === 'other_city_corporation' ? 'other_city_corporation' : 'other';
      statutoryHouseRentInfo = calculateStatutoryHouseRent2015Client(basicPay, loc, false);
      houseRent = statutoryHouseRentInfo.finalAmount;
      houseRate = statutoryHouseRentInfo.ratePercentage;
    } else {
      if (grade >= 16) {
        houseRate = cityType === 'dhaka' ? 60 : cityType === 'other_city_corporation' ? 50 : 45;
      } else if (grade >= 10) {
        houseRate = cityType === 'dhaka' ? 50 : cityType === 'other_city_corporation' ? 40 : 35;
      } else if (grade >= 5) {
        houseRate = cityType === 'dhaka' ? 45 : cityType === 'other_city_corporation' ? 35 : 30;
      } else {
        houseRate = cityType === 'dhaka' ? 40 : cityType === 'other_city_corporation' ? 30 : 25;
      }
      houseRent = Math.round((basicPay * houseRate) / 100);
    }
    const medical = age > 50 ? 4000 : 3000;
    const education = Math.min(2, Math.max(0, childrenCount)) * 500;
    const tiffin = (grade >= 11 && grade <= 20 && isEligibleTiffin) ? 500 : 0;
    const conveyance = (grade >= 11 && grade <= 20 && isEligibleConveyance && cityType !== 'other_areas') ? 600 : 0;
    const mobile = grade <= 5 ? 500 : 150;
    const festival = includeFestival ? basicPay : 0;
    const boishakh = includeBoishakh ? Math.round(basicPay * 0.15) : 0;
    const wash = hasWashAllowance ? 300 : 0;
    const charge = hasCurrentCharge ? 1500 : 0;

    const totalAllowances = houseRent + medical + education + tiffin + conveyance + mobile + festival + boishakh + wash + charge;
    const grossSalary = basicPay + totalAllowances;

    const gpf = Math.round((basicPay * Math.max(10, Math.min(25, gpfPercentage))) / 100);
    const totalDeductions = gpf + taxAmount + groupInsurance + benevolentFund + otherDeductions;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    return {
      allowance: {
        basicPay,
        houseRent,
        houseRentRatePercentage: houseRate,
        statutoryHouseRentInfo,
        medicalAllowance: medical,
        bengaliNewYearAllowance: boishakh,
        festivalAllowance: festival,
        educationAllowance: education,
        tiffinAllowance: tiffin,
        conveyanceAllowance: conveyance,
        mobileAllowance: mobile,
        washAllowance: wash,
        chargeAllowance: charge,
        hillAllowance: 0,
        haorAllowance: 0,
        specialChildAllowance: 0,
        totalAllowances,
        grossSalary,
        trace: []
      } as AllowanceResult,
      deduction: {
        gpfDeduction: gpf,
        incomeTax: taxAmount,
        groupInsurance,
        benevolentFund,
        otherDeductions,
        totalDeductions,
        netSalary,
        trace: []
      } as DeductionResult
    };
  };

  // Perform full calculation from server with instant fallback
  const calculateSalary = async () => {
    setLoading(true);
    const fallback = computeLocalFallback();
    setAllowanceResult(fallback.allowance);
    setDeductionResult(fallback.deduction);

    try {
      const response = await fetch('/api/salary/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicPay,
          grade,
          age,
          cityType,
          isGovtQuarterProvided,
          childrenCount,
          isEligibleTiffin,
          isEligibleConveyance,
          includeFestival,
          includeBoishakh,
          hasWashAllowance,
          hasCurrentCharge,
          houseRentRule,
          gpfPercentage,
          incomeTax: taxAmount,
          groupInsurance,
          benevolentFund,
          otherDeductions
        })
      });

      const json = await response.json();
      if (json.success && json.data) {
        if (json.data.allowances) setAllowanceResult(json.data.allowances);
        if (json.data.deductions) setDeductionResult(json.data.deductions);
      }
    } catch (err) {
      console.warn('Using local calculations engine fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSalary();
  }, [
    basicPay,
    grade,
    age,
    cityType,
    isGovtQuarterProvided,
    childrenCount,
    isEligibleTiffin,
    isEligibleConveyance,
    includeFestival,
    includeBoishakh,
    hasWashAllowance,
    hasCurrentCharge,
    houseRentRule,
    gpfPercentage,
    taxAmount,
    groupInsurance,
    benevolentFund,
    otherDeductions
  ]);

  // Export to PDF
  const handleExportPDF = () => {
    if (!allowanceResult || !deductionResult) return;

    const allowancesList = [
      { name: 'Basic Pay (মূল বেতন)', amount: basicPay },
      { name: `House Rent (${allowanceResult.houseRentRatePercentage}%)`, amount: allowanceResult.houseRent },
      { name: 'Medical Allowance (চিকিৎসা)', amount: allowanceResult.medicalAllowance },
      ...(allowanceResult.educationAllowance > 0 ? [{ name: 'Education Assistance (শিক্ষা)', amount: allowanceResult.educationAllowance }] : []),
      ...(allowanceResult.tiffinAllowance > 0 ? [{ name: 'Tiffin Allowance (টিফিন)', amount: allowanceResult.tiffinAllowance }] : []),
      ...(allowanceResult.conveyanceAllowance > 0 ? [{ name: 'Conveyance (যাতায়াত)', amount: allowanceResult.conveyanceAllowance }] : []),
      ...(allowanceResult.mobileAllowance > 0 ? [{ name: 'Mobile / Phone (মোবাইল)', amount: allowanceResult.mobileAllowance }] : []),
      ...(allowanceResult.washAllowance > 0 ? [{ name: 'Wash Allowance (ধোলাই)', amount: allowanceResult.washAllowance }] : []),
      ...(allowanceResult.chargeAllowance > 0 ? [{ name: 'Charge Allowance (দায়িত্ব)', amount: allowanceResult.chargeAllowance }] : []),
      ...(allowanceResult.festivalAllowance > 0 ? [{ name: 'Festival Allowance (উৎসব)', amount: allowanceResult.festivalAllowance }] : []),
      ...(allowanceResult.bengaliNewYearAllowance > 0 ? [{ name: 'Boishakh Allowance (বৈশাখী)', amount: allowanceResult.bengaliNewYearAllowance }] : [])
    ];

    const deductionsList = [
      { name: `GPF Subscription (${gpfPercentage}%)`, amount: deductionResult.gpfDeduction },
      ...(deductionResult.incomeTax > 0 ? [{ name: 'Income Tax (আয়কর)', amount: deductionResult.incomeTax }] : []),
      { name: 'Group Insurance (যৌথ বীমা)', amount: deductionResult.groupInsurance },
      { name: 'Benevolent Fund (কল্যাণ তহবিল)', amount: deductionResult.benevolentFund },
      ...(deductionResult.otherDeductions > 0 ? [{ name: 'Other Deductions (অন্যান্য)', amount: deductionResult.otherDeductions }] : [])
    ];

    exportPaySlipPDF({
      employeeName,
      designation,
      grade,
      basicPay,
      grossSalary: allowanceResult.grossSalary,
      totalDeductions: deductionResult.totalDeductions,
      netSalary: deductionResult.netSalary,
      monthStr: salaryMonth,
      allowancesList,
      deductionsList,
      filename: `pay-slip-${employeeCode || 'employee'}-${salaryMonth.replace(/\s+/g, '-').toLowerCase()}`
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!allowanceResult || !deductionResult) return;
    const data = [
      { Parameter: 'Employee Code', Value: employeeCode },
      { Parameter: 'Employee Name', Value: employeeName },
      { Parameter: 'Designation', Value: designation },
      { Parameter: 'Grade', Value: `Grade ${grade}` },
      { Parameter: 'Month', Value: salaryMonth },
      { Parameter: 'Basic Pay', Value: basicPay },
      { Parameter: 'House Rent Allowance', Value: allowanceResult.houseRent },
      { Parameter: 'Medical Allowance', Value: allowanceResult.medicalAllowance },
      { Parameter: 'Education Allowance', Value: allowanceResult.educationAllowance },
      { Parameter: 'Tiffin Allowance', Value: allowanceResult.tiffinAllowance },
      { Parameter: 'Conveyance Allowance', Value: allowanceResult.conveyanceAllowance },
      { Parameter: 'Mobile Allowance', Value: allowanceResult.mobileAllowance },
      { Parameter: 'Gross Salary (মোট বেতন)', Value: allowanceResult.grossSalary },
      { Parameter: 'GPF Deduction', Value: deductionResult.gpfDeduction },
      { Parameter: 'Income Tax', Value: deductionResult.incomeTax },
      { Parameter: 'Group Insurance', Value: deductionResult.groupInsurance },
      { Parameter: 'Benevolent Fund', Value: deductionResult.benevolentFund },
      { Parameter: 'Total Deductions (মোট কর্তন)', Value: deductionResult.totalDeductions },
      { Parameter: 'Net Payable Salary (নিট প্রদেয় বেতন)', Value: deductionResult.netSalary }
    ];
    exportToExcel(data, `pay-slip-${employeeCode || 'custom'}`);
  };

  // Export to Word
  const handleExportDocx = () => {
    if (!allowanceResult || !deductionResult) return;
    const rows = [
      { label: 'Employee Name / নাম', value: employeeName },
      { label: 'Employee Code / কোড', value: employeeCode },
      { label: 'Designation / পদবি', value: designation },
      { label: 'Department / বিভাগ', value: department },
      { label: 'Grade / গ্রেড', value: `গ্রেড ${grade}` },
      { label: 'Salary Month / মাস', value: salaryMonth },
      { label: 'Basic Pay / মূল বেতন', value: `Tk. ${basicPay.toLocaleString('en-IN')}` },
      { label: 'House Rent / বাড়ি ভাড়া', value: `Tk. ${allowanceResult.houseRent.toLocaleString('en-IN')} (${allowanceResult.houseRentRatePercentage}%)` },
      { label: 'Medical Allowance / চিকিৎসা', value: `Tk. ${allowanceResult.medicalAllowance.toLocaleString('en-IN')}` },
      { label: 'Gross Salary / মোট বেতন', value: `Tk. ${allowanceResult.grossSalary.toLocaleString('en-IN')}` },
      { label: 'GPF Deduction / জিপিএফ কর্তন', value: `Tk. ${deductionResult.gpfDeduction.toLocaleString('en-IN')} (${gpfPercentage}%)` },
      { label: 'Total Deductions / মোট কর্তন', value: `Tk. ${deductionResult.totalDeductions.toLocaleString('en-IN')}` },
      { label: 'Net Payable Salary / নিট বেতন', value: `Tk. ${deductionResult.netSalary.toLocaleString('en-IN')}` },
      { label: 'In Words / কথায়', value: numberToBanglaWords(deductionResult.netSalary) }
    ];
    exportToDocx(`Employee Pay Slip - ${salaryMonth}`, rows, `pay-slip-${employeeCode || 'doc'}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Controls (Hidden on paper print) */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bangla font-semibold mb-1.5">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>গেজেট অনুচ্ছেদ ১৩-২৩ ভাতাদি ও জিপিএফ/আয়কর কর্তন ক্যালকুলেটর</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'স্মার্ট সরকারি বেতন নির্ধারণী ও প্রমিত পে-স্লিপ' : 'Smart Pay Slip & Salary Calculator'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla mt-0.5">
            {lang === 'bn'
              ? 'বাড়ি ভাড়া (৪০%-৬০%), চিকিৎসা, শিক্ষা, টিফিন, যাতায়াত ভাতাসহ জিপিএফ ও আয়কর কর্তন এবং নিট প্রদেয় স্লিপ প্রিন্ট'
              : 'Calculate allowances, statutory GPF & tax deductions, and print official government pay slips'}
          </p>
        </div>

        {/* Action Buttons: Print, PDF, Word, Excel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerPrint}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 font-bangla cursor-pointer"
            title="ব্রাউজারের প্রিন্ট ডায়ালগ খুলুন (A4 পেপার প্রিন্ট)"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>{lang === 'bn' ? 'পে-স্লিপ প্রিন্ট করুন' : 'Print Pay Slip'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xs transition font-bangla cursor-pointer"
            title="অফিসিয়াল পিডিএফ ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'bn' ? 'পিডিএফ (PDF)' : 'PDF'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition font-bangla cursor-pointer"
            title="এক্সেল ফাইল ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'bn' ? 'এক্সেল (XLSX)' : 'Excel'}</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition font-bangla cursor-pointer"
            title="ওয়ার্ড ডকুমেন্ট ডাউনলোড করুন"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'bn' ? 'ওয়ার্ড (DOCX)' : 'Word'}</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Employee Selection, Scale Presets & Parameters (Hidden on paper print) */}
      <div className="no-print space-y-4">
        {/* Preset Quick Chooser */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 font-bangla flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {lang === 'bn' ? 'দ্রুত বেতন স্কেল নির্বাচন (Quick Presets):' : 'Quick Scale Presets:'}
            </span>
            <span className="text-[11px] text-slate-400 font-bangla">গেজেট ২০২৬ প্রারম্ভিক ও বিশেষ ধাপসমূহ</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SCALE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setGrade(p.grade);
                  setBasicPay(p.basic);
                  setSelectedEmployeeId('custom');
                }}
                className={`text-[11px] px-2.5 py-1 rounded-md border font-bangla transition cursor-pointer ${
                  basicPay === p.basic && grade === p.grade
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                }`}
                title={p.descBn}
              >
                {lang === 'bn' ? p.labelBn : p.labelEn} (৳{toBanglaNum(p.basic.toLocaleString('en-IN'))})
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 font-bangla flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              {lang === 'bn' ? 'বেতন ও ভাতার ইনপুট পরামিতি' : 'Salary Parameters & Employee Details'}
            </h3>

            {/* Employee Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 font-bangla">
                {lang === 'bn' ? 'বিদ্যমান কর্মচারী:' : 'Select Employee:'}
              </span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="text-xs p-1.5 border border-slate-300 rounded-md bg-slate-50 font-bangla text-slate-800 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="custom">{lang === 'bn' ? '➕ কাস্টম হিসাব (ম্যানুয়াল ইনপুট)' : 'Custom Manual Input'}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={String(emp.id)}>
                    {emp.nameBangla} ({emp.employeeCode}) - গ্রেড {toBanglaNum(emp.grade)} (৳{toBanglaNum(emp.currentBasicPay?.toLocaleString('en-IN'))})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-bangla text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'নির্ধারিত মূল বেতন (২০২৬)' : 'Basic Pay 2026'}
              </label>
              <input
                type="number"
                value={basicPay}
                onChange={(e) => setBasicPay(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono text-slate-900 bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কর্মরত গ্রেড' : 'Pay Grade'}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(g => (
                  <option key={g} value={g}>
                    {lang === 'bn' ? `${toBanglaNum(g)}ম গ্রেড` : `Grade ${g}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কর্মস্থল এলাকা (বাড়ি ভাড়া)' : 'City Location'}
              </label>
              <select
                value={cityType}
                onChange={(e) => setCityType(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="dhaka">{lang === 'bn' ? 'ঢাকা উত্তর ও দক্ষিণ সিটি করপোরেশন' : 'Dhaka North & South City Corp'}</option>
                <option value="other_city_corporation">{lang === 'bn' ? 'অন্যান্য সিটি কর্পোরেশন ও সাভার' : 'Other City Corp & Savar'}</option>
                <option value="other_areas">{lang === 'bn' ? 'অন্যান্য জেলা / উপজেলা এলাকা' : 'Other Districts / Upazila'}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  {lang === 'bn' ? 'বাড়ি ভাড়া বিধিমালা' : 'House Rent Rule'}
                </label>
                <span className="text-[10px] text-sky-800 font-bold bg-sky-50 px-1.5 py-0.5 rounded">
                  {houseRentRule === '2015_statutory' ? '২০১৫ সারণি (১/৭/১৬)' : '২০২৬ খসড়া'}
                </span>
              </div>
              <select
                value={houseRentRule}
                onChange={(e) => setHouseRentRule(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500 text-xs font-medium"
              >
                <option value="2015_statutory">
                  {lang === 'bn' ? 'জাতীয় বেতনস্কেল ২০১৫ সারণি (বিধিবদ্ধ ন্যূনতম সীমা)' : 'National Pay Scale 2015 Slabs'}
                </option>
                <option value="2026_grade_based">
                  {lang === 'bn' ? 'প্রস্তাবিত ২০২৬ খসড়া (গ্রেডভিত্তিক)' : 'Proposed 2026 Draft'}
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'বেতন বিবরণীর মাস' : 'Salary Month'}
              </label>
              <select
                value={salaryMonth}
                onChange={(e) => setSalaryMonth(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
              >
                {SALARY_MONTHS.map(m => (
                  <option key={m.value} value={m.value}>
                    {lang === 'bn' ? m.labelBn : m.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কর্মচারীর বয়স (চিকিৎসা ভাতা)' : 'Employee Age'}
              </label>
              <input
                type="number"
                min={20}
                max={65}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono text-slate-900 bg-white focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">
                {age > 50 ? '৫০ ঊর্ধ্ব: ৳৪,০০০' : '৫০ পর্যন্ত: ৳৩,০০০'} (অনুচ্ছেদ ১৩)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'সন্তান সংখ্যা (শিক্ষা ভাতা - ৫০০/জন)' : 'Children Count'}
              </label>
              <select
                value={childrenCount}
                onChange={(e) => setChildrenCount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-emerald-500"
              >
                <option value={0}>{lang === 'bn' ? 'সন্তান নেই (৳ ০)' : '0 Children (Tk. 0)'}</option>
                <option value={1}>{lang === 'bn' ? '১ সন্তান (৳ ৫০০)' : '1 Child (Tk. 500)'}</option>
                <option value={2}>{lang === 'bn' ? '২ বা ততোধিক সন্তান (সর্বোচ্চ ৳ ১,০০০)' : '2+ Children (Max Tk. 1,000)'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'জিপিএফ কর্তন হার (১০% - ২৫%)' : 'GPF Deduction Rate'}
              </label>
              <input
                type="number"
                min={10}
                max={25}
                value={gpfPercentage}
                onChange={(e) => setGpfPercentage(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono text-slate-900 bg-white focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">
                মাসিক চাঁদা: ৳{toBanglaNum(Math.round((basicPay * gpfPercentage) / 100).toLocaleString('en-IN'))}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'উৎস আয়কর কর্তন (টাকা)' : 'Income Tax (Tk)'}
              </label>
              <input
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-mono text-slate-900 bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Checkboxes for special allowances & quarter status */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bangla">
            <label className="inline-flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isGovtQuarterProvided}
                onChange={(e) => setIsGovtQuarterProvided(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700">
                {lang === 'bn' ? 'সরকারি বাসস্থান বরাদ্দপ্রাপ্ত (বাড়ি ভাড়া শূন্য)' : 'Govt Quarter (Zero House Rent)'}
              </span>
            </label>

            <label className="inline-flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeFestival}
                onChange={(e) => setIncludeFestival(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700">
                {lang === 'bn' ? 'উৎসব ভাতা (১০০% মূল বেতন)' : 'Festival Allowance (100%)'}
              </span>
            </label>

            <label className="inline-flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBoishakh}
                onChange={(e) => setIncludeBoishakh(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700">
                {lang === 'bn' ? 'বাংলা নববর্ষ ভাতা (১৫%)' : 'Boishakh Allowance (15%)'}
              </span>
            </label>

            <label className="inline-flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWashAllowance}
                onChange={(e) => setHasWashAllowance(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700">
                {lang === 'bn' ? 'ধোলাই ভাতা (৳৩০০)' : 'Wash Allowance (Tk. 300)'}
              </span>
            </label>

            <label className="inline-flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasCurrentCharge}
                onChange={(e) => setHasCurrentCharge(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-700">
                {lang === 'bn' ? 'চলতি দায়িত্ব ভাতা (৳১,৫০০)' : 'Charge Allowance (Tk. 1,500)'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL PAY SLIP (Strictly Styled for Screen and Paper Print)   */}
      {/* ========================================================================= */}
      {allowanceResult && deductionResult && (
        <div
          id="official-printable-pay-slip"
          className="printable-pay-slip bg-white rounded-xl border border-slate-300 p-6 md:p-8 shadow-xs max-w-4xl mx-auto font-bangla text-slate-900"
        >
          {/* Slip Official Government Header */}
          <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-800 flex items-center justify-center font-bold text-emerald-800 text-xs">
                BD
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-wide">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  অর্থ বিভাগ, অর্থ মন্ত্রণালয় | বেতন ও ভাতাদি অনুবিভাগ
                </p>
              </div>
            </div>
            <h4 className="text-lg font-black text-emerald-950 mt-1 uppercase">
              মাসিক বেতন নির্ধারণী বিবরণী ও পে-স্লিপ
            </h4>
            <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-600 mt-1 font-mono">
              <span>গেজেট আদেশ: এস. আর. ও. নং ৩৪৭-আইন/২০২৬</span>
              <span>•</span>
              <span>ফর্ম কোড: CGA-PAY-2026/SLIP</span>
              <span>•</span>
              <span className="font-bold text-slate-900">বেতন মাস: {salaryMonth}</span>
            </div>
          </div>

          {/* Employee Identification Grid */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
              <div>
                <span className="text-slate-500 block text-[10px]">কর্মচারীর নাম:</span>
                <span className="font-bold text-slate-900">{employeeName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">পরিচিতি / ইম্প্লয়ি কোড:</span>
                <span className="font-mono font-bold text-slate-900">{employeeCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">পদবি ও শাখা:</span>
                <span className="font-semibold text-slate-900">{designation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">গ্রেড ও মূল বেতন:</span>
                <span className="font-bold text-emerald-900">
                  গ্রেড {toBanglaNum(grade)} (৳{toBanglaNum(basicPay.toLocaleString('en-IN'))})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">জাতীয় পরিচয়পত্র (NID):</span>
                <span className="font-mono text-slate-800">{nid}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ব্যাংক হিসাব নম্বর:</span>
                <span className="font-mono text-slate-800">{bankAccount}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ব্যাংকের নাম ও শাখা:</span>
                <span className="text-slate-800">{bankName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">জিপিএফ হিসাব নম্বর:</span>
                <span className="font-mono font-semibold text-slate-800">{gpfAccountNumber}</span>
              </div>
            </div>
          </div>

          {/* Two Columns Table: Allowances (Left) vs Deductions (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Left Box: Earnings & Allowances */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-emerald-100/70 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                <span className="font-bold text-emerald-950 text-xs">প্রাপ্য আয় ও ভাতাসমূহ (Earnings)</span>
                <span className="font-bold text-emerald-950 text-xs">পরিমাণ (টাকা)</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-emerald-50/40 font-bold">
                    <td className="p-2 text-slate-900">মূল বেতন (Basic Pay ২০২৬)</td>
                    <td className="p-2 text-right font-mono text-slate-900">
                      {formatCurrency(basicPay, lang)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold">বাড়ি ভাড়া ভাতা ({allowanceResult.houseRentRatePercentage}%)</span>
                        {allowanceResult.statutoryHouseRentInfo?.minApplied && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            বিধিবদ্ধ ন্যূনতম সীমা
                          </span>
                        )}
                      </div>
                      {allowanceResult.statutoryHouseRentInfo && !isGovtQuarterProvided && (
                        <span className="text-[10px] text-slate-500 block">
                          স্ল্যাব: {allowanceResult.statutoryHouseRentInfo.tierRangeText} (ন্যূনতম: ৳{allowanceResult.statutoryHouseRentInfo.minimumAmount.toLocaleString('en-IN')})
                        </span>
                      )}
                      {isGovtQuarterProvided && <span className="text-[10px] text-rose-600 block">(সরকারি বাসস্থান বরাদ্দ)</span>}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(allowanceResult.houseRent, lang)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-800">
                      চিকিৎসা ভাতা (অনুচ্ছেদ ১৩(১))
                      <span className="text-[10px] text-slate-500 block">{age > 50 ? '৫০ ঊর্ধ্ব বয়স' : 'অনধিক ৫০ বছর'}</span>
                    </td>
                    <td className="p-2 text-right font-mono">
                      {formatCurrency(allowanceResult.medicalAllowance, lang)}
                    </td>
                  </tr>
                  {allowanceResult.educationAllowance > 0 && (
                    <tr>
                      <td className="p-2 text-slate-800">
                        শিক্ষা সহায়তা ভাতা ({childrenCount} সন্তান)
                      </td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(allowanceResult.educationAllowance, lang)}
                      </td>
                    </tr>
                  )}
                  {allowanceResult.tiffinAllowance > 0 && (
                    <tr>
                      <td className="p-2 text-slate-800">টিফিন ভাতা (অনুচ্ছেদ ১৯)</td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(allowanceResult.tiffinAllowance, lang)}
                      </td>
                    </tr>
                  )}
                  {allowanceResult.conveyanceAllowance > 0 && (
                    <tr>
                      <td className="p-2 text-slate-800">যাতায়াত ভাতা (অনুচ্ছেদ ২১)</td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(allowanceResult.conveyanceAllowance, lang)}
                      </td>
                    </tr>
                  )}
                  {allowanceResult.mobileAllowance > 0 && (
                    <tr>
                      <td className="p-2 text-slate-800">মোবাইল ও টেলিফোন ভাতা (অনুচ্ছেদ ২২)</td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(allowanceResult.mobileAllowance, lang)}
                      </td>
                    </tr>
                  )}
                  {allowanceResult.washAllowance > 0 && (
                    <tr>
                      <td className="p-2 text-slate-800">ধোলাই ভাতা (অনুচ্ছেদ ২৩)</td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(allowanceResult.washAllowance, lang)}
                      </td>
                    </tr>
                  )}
                  {allowanceResult.chargeAllowance > 0 && (
                    <tr>
                      <td className="p-2 text-slate-800">চলতি দায়িত্ব ভাতা (অনুচ্ছেদ ২০)</td>
                      <td className="p-2 text-right font-mono">
                        {formatCurrency(allowanceResult.chargeAllowance, lang)}
                      </td>
                    </tr>
                  )}
                  {allowanceResult.bengaliNewYearAllowance > 0 && (
                    <tr className="bg-amber-50/50">
                      <td className="p-2 text-amber-900 font-medium">বাংলা নববর্ষ ভাতা (১৫%)</td>
                      <td className="p-2 text-right font-mono font-semibold text-amber-900">
                        {formatCurrency(allowanceResult.bengaliNewYearAllowance, lang)}
                      </td>
                    </tr>
                  )}
                  {allowanceResult.festivalAllowance > 0 && (
                    <tr className="bg-amber-50/50">
                      <td className="p-2 text-amber-900 font-medium">উৎসব ভাতা (১০০% মূল বেতন)</td>
                      <td className="p-2 text-right font-mono font-semibold text-amber-900">
                        {formatCurrency(allowanceResult.festivalAllowance, lang)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td className="p-2">সর্বমোট মোট বেতন (Gross Earnings):</td>
                    <td className="p-2 text-right font-mono text-emerald-900 text-sm">
                      {formatCurrency(allowanceResult.grossSalary, lang)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Right Box: Deductions */}
            <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-rose-100/70 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                  <span className="font-bold text-rose-950 text-xs">কর্তনসমূহ (Statutory Deductions)</span>
                  <span className="font-bold text-rose-950 text-xs">পরিমাণ (টাকা)</span>
                </div>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 text-slate-800">
                        জিপিএফ মাসিক চাঁদা কর্তন ({gpfPercentage}%)
                        <span className="text-[10px] text-slate-500 block">General Provident Fund</span>
                      </td>
                      <td className="p-2 text-right font-mono text-rose-700 font-medium">
                        -{formatCurrency(deductionResult.gpfDeduction, lang)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-800">
                        উৎস আয়কর কর্তন (Income Tax)
                      </td>
                      <td className="p-2 text-right font-mono text-rose-700 font-medium">
                        -{formatCurrency(deductionResult.incomeTax, lang)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-800">
                        যৌথ বীমা প্রিমিয়াম কর্তন (Group Insurance)
                      </td>
                      <td className="p-2 text-right font-mono text-rose-700 font-medium">
                        -{formatCurrency(deductionResult.groupInsurance, lang)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-800">
                        কল্যাণ তহবিল কর্তন (Benevolent Fund)
                      </td>
                      <td className="p-2 text-right font-mono text-rose-700 font-medium">
                        -{formatCurrency(deductionResult.benevolentFund, lang)}
                      </td>
                    </tr>
                    {deductionResult.otherDeductions > 0 && (
                      <tr>
                        <td className="p-2 text-slate-800">অন্যান্য কর্তন (Other Deductions)</td>
                        <td className="p-2 text-right font-mono text-rose-700 font-medium">
                          -{formatCurrency(deductionResult.otherDeductions, lang)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-rose-50 border-t-2 border-slate-300 p-2 flex justify-between items-center font-bold text-xs text-slate-900">
                <span>সর্বমোট কর্তন (Total Deductions):</span>
                <span className="font-mono text-rose-800 text-sm">
                  -{formatCurrency(deductionResult.totalDeductions, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Net Payable Highlight Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ব্যাংক হিসাবে নিট প্রদেয় বেতন (Net Payable Pay)</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                কথায়: <span className="font-bold text-amber-300">{numberToBanglaWords(deductionResult.netSalary)}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                In Words: {numberToEnglishWords(deductionResult.netSalary)}
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {formatCurrency(deductionResult.netSalary, lang)}
            </div>
          </div>

          {/* Official Signatures Row */}
          <div className="mt-10 pt-6 border-t-2 border-slate-400 grid grid-cols-3 text-center text-xs text-slate-800">
            <div>
              <div className="h-10"></div>
              <p className="border-t border-slate-600 pt-1 font-semibold w-40 mx-auto">
                বিল প্রস্তুতকারী / সহকারী
              </p>
              <span className="text-[10px] text-slate-500 block">স্বাক্ষর ও তারিখ</span>
            </div>
            <div>
              <div className="h-10"></div>
              <p className="border-t border-slate-600 pt-1 font-semibold w-40 mx-auto">
                হিসাবরক্ষণ কর্মকর্তা
              </p>
              <span className="text-[10px] text-slate-500 block">সিজিএ / এজি অফিস</span>
            </div>
            <div>
              <div className="h-10"></div>
              <p className="border-t border-slate-600 pt-1 font-semibold w-40 mx-auto">
                আয়ন-ব্যয়ন কর্মকর্তা (DDO)
              </p>
              <span className="text-[10px] text-slate-500 block">সরকারি সিলমোহর</span>
            </div>
          </div>

          {/* Footer Gazette Certification */}
          <div className="mt-6 pt-2 border-t border-slate-200 text-[10px] text-slate-500 text-center flex flex-col sm:flex-row items-center justify-between gap-1 font-mono">
            <span>বাংলাদেশ গেজেট অতিরিক্ত, ১৭ সেপ্টেম্বর ২০২৬ (এস. আর. ও. নং ৩৪৭-আইন/২০২৬)</span>
            <span>ইএফটি / অনলাইন বেতন বিল ব্যবস্থা • সিস্টেম জেনারেটেড কপি</span>
          </div>
        </div>
      )}
    </div>
  );
};
