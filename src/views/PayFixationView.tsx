import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  CheckCircle2,
  FileCheck,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  UserCheck,
  RefreshCw,
  HelpCircle,
  Award,
  Percent,
  Edit3,
  Save,
  Check,
  X,
  Building,
  CreditCard,
  Briefcase,
  Calendar,
  Hash,
  User
} from 'lucide-react';
import { Employee, Language, PayFixationResult } from '../types.ts';
import {
  formatCurrency,
  toBanglaNum,
  triggerPrint,
  exportFixationToPDF,
  exportToExcel,
  exportToDocx,
  numberToBanglaWords
} from '../utils/formatters.ts';
import {
  OFFICIAL_PAY_SCALES,
  calculateSimpleFixationClient,
  getClientGradeScale,
  getIncrementalScale3StagesDescription,
  SECTION_9_INCREMENT_RATE_TIERS,
  getSection9IncrementRateForGrade
} from '../utils/payscaleData.ts';

interface PayFixationViewProps {
  lang: Language;
  selectedEmployee?: Employee | null;
  onFixationSaved?: () => void;
}

const QUICK_GRADES = [
  { grade: 11, labelBn: '১১তম গ্রেড (গেজেট উদা-২)', labelEn: 'Grade 11 (Ex-2)' },
  { grade: 16, labelBn: '১৬তম গ্রেড (গেজেট উদা-১)', labelEn: 'Grade 16 (Ex-1)' },
  { grade: 9, labelBn: '৯ম গ্রেড (সহকারী সচিব)', labelEn: 'Grade 9 (Cadre Entry)' },
  { grade: 10, labelBn: '১০ম গ্রেড (কর্মকর্তা)', labelEn: 'Grade 10' },
  { grade: 20, labelBn: '২০তম গ্রেড (অফিস সহায়ক)', labelEn: 'Grade 20 (Support)' }
];

export const PayFixationView: React.FC<PayFixationViewProps> = ({
  lang,
  selectedEmployee,
  onFixationSaved
}) => {
  // Mode: simple (default) or detailed
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');

  // Input states & Saved Employee Object
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(selectedEmployee ? String(selectedEmployee.id) : 'manual');
  const [selectedEmpObj, setSelectedEmpObj] = useState<Employee | null>(selectedEmployee || null);
  const [grade, setGrade] = useState<number>(selectedEmployee ? selectedEmployee.grade : 10);
  const [drawnBasic, setDrawnBasic] = useState<number>(
    selectedEmployee ? (selectedEmployee.previousBasicPay || selectedEmployee.currentBasicPay) : 27430
  );
  const [advanceIncrements, setAdvanceIncrements] = useState<number>(0);

  // Metadata for official statement & employee identification
  const [employeeName, setEmployeeName] = useState<string>(selectedEmployee ? (selectedEmployee.nameBangla || selectedEmployee.nameEnglish) : 'মোহাম্মদ ফারুক হোসেন');
  const [nameEnglish, setNameEnglish] = useState<string>(selectedEmployee?.nameEnglish || 'Mohammad Faruk Hossain');
  const [employeeCode, setEmployeeCode] = useState<string>(selectedEmployee?.employeeCode || 'EMP-4547');
  const [nid, setNid] = useState<string>(selectedEmployee?.nid || '19852691234567890');
  const [designation, setDesignation] = useState<string>(selectedEmployee?.currentDesignation || 'সহকারী পরিচালক');
  const [department, setDepartment] = useState<string>(selectedEmployee?.department || 'অর্থ বিভাগ');
  const [ministry, setMinistry] = useState<string>(selectedEmployee?.ministry || 'অর্থ মন্ত্রণালয়');
  const [cadre, setCadre] = useState<string>(selectedEmployee?.cadre || 'Non-Cadre');
  const [employeeType, setEmployeeType] = useState<string>(selectedEmployee?.employeeType || 'Regular Government Employee');
  const [dateOfBirth, setDateOfBirth] = useState<string>(selectedEmployee?.dateOfBirth || '1985-05-15');
  const [joiningDate, setJoiningDate] = useState<string>(selectedEmployee?.joiningDate || '2012-07-01');
  const [bankAccount, setBankAccount] = useState<string>(selectedEmployee?.bankAccount || '2001234567891');
  const [bankName, setBankName] = useState<string>(selectedEmployee?.bankName || 'সোনালী ব্যাংক পিএলসি');
  const [branchName, setBranchName] = useState<string>(selectedEmployee?.branchName || 'সচিবালয় কর্পোরেট শাখা');
  const [gpfAccountNumber, setGpfAccountNumber] = useState<string>(selectedEmployee?.gpfAccountNumber || 'GPF-EMP-4547');
  const [mobile, setMobile] = useState<string>(selectedEmployee?.mobile || '01711000001');
  const [email, setEmail] = useState<string>(selectedEmployee?.email || 'faruk.hossain@mof.gov.bd');
  const [fatherName, setFatherName] = useState<string>(selectedEmployee?.fatherName || '');
  const [motherName, setMotherName] = useState<string>(selectedEmployee?.motherName || '');

  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(false);
  const [isSavingEmp, setIsSavingEmp] = useState<boolean>(false);

  // Calculation Results
  const [fixationResult, setFixationResult] = useState<PayFixationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get current grade's official scale data
  const currentGradeData = useMemo(() => getClientGradeScale(grade), [grade]);

  // Instant local client calculation fallback
  const clientCalc = useMemo(() => {
    return calculateSimpleFixationClient(grade, drawnBasic);
  }, [grade, drawnBasic]);

  // Populate state from Employee model
  const populateEmployeeData = (emp: Employee) => {
    setSelectedEmpObj(emp);
    setSelectedEmpId(String(emp.id));
    setGrade(emp.grade);

    const gData = getClientGradeScale(emp.grade);
    let drawn = emp.previousBasicPay || emp.currentBasicPay;
    if (gData) {
      if (drawn < gData.scale2015.startingBasic || drawn > gData.scale2015.endingBasic) {
        if (emp.previousBasicPay && emp.previousBasicPay >= gData.scale2015.startingBasic && emp.previousBasicPay <= gData.scale2015.endingBasic) {
          drawn = emp.previousBasicPay;
        } else {
          drawn = gData.scale2015.startingBasic;
        }
      }
    }
    setDrawnBasic(drawn);

    setEmployeeName(emp.nameBangla || emp.nameEnglish || '');
    setNameEnglish(emp.nameEnglish || '');
    setEmployeeCode(emp.employeeCode || '');
    setNid(emp.nid || '');
    setDesignation(emp.currentDesignation || '');
    setDepartment(emp.department || 'অর্থ বিভাগ');
    setMinistry(emp.ministry || 'অর্থ মন্ত্রণালয়');
    setCadre(emp.cadre || 'Non-Cadre');
    setEmployeeType(emp.employeeType || 'Regular Government Employee');
    setDateOfBirth(emp.dateOfBirth || '');
    setJoiningDate(emp.joiningDate || '');
    setBankAccount(emp.bankAccount || '');
    setBankName(emp.bankName || 'সোনালী ব্যাংক পিএলসি');
    setBranchName(emp.branchName || 'সচিবালয় কর্পোরেট শাখা');
    setGpfAccountNumber(emp.gpfAccountNumber || '');
    setMobile(emp.mobile || '');
    setEmail(emp.email || '');
    setFatherName(emp.fatherName || '');
    setMotherName(emp.motherName || '');
  };

  // Fetch employees list for dropdown
  const fetchEmployeesList = () => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setEmployees(json.data);
          // If no employee was passed via props and still on default or manual, load the first saved employee
          if (!selectedEmployee && selectedEmpId === 'manual') {
            populateEmployeeData(json.data[0]);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  // Sync when selectedEmployee changes from props
  useEffect(() => {
    if (selectedEmployee) {
      populateEmployeeData(selectedEmployee);
    }
  }, [selectedEmployee]);

  // Handle employee dropdown change
  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedEmpId(val);
    setSaveSuccess(false);
    if (val === 'manual') {
      setSelectedEmpObj(null);
    } else {
      const emp = employees.find(em => em.id === Number(val));
      if (emp) {
        populateEmployeeData(emp);
      }
    }
  };

  // Update employee metadata in database
  const handleUpdateEmployeeInfo = async () => {
    if (selectedEmpId === 'manual' || !selectedEmpObj) {
      setIsEditingDetails(false);
      return;
    }
    try {
      setIsSavingEmp(true);
      const res = await fetch(`/api/employees/${selectedEmpObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameBangla: employeeName,
          nameEnglish: nameEnglish,
          employeeCode: employeeCode,
          nid: nid,
          currentDesignation: designation,
          department: department,
          ministry: ministry,
          cadre: cadre,
          employeeType: employeeType,
          grade: grade,
          currentBasicPay: clientCalc?.fixedBasic2026 || drawnBasic,
          previousBasicPay: drawnBasic,
          dateOfBirth: dateOfBirth,
          joiningDate: joiningDate,
          bankAccount: bankAccount,
          bankName: bankName,
          branchName: branchName,
          gpfAccountNumber: gpfAccountNumber,
          mobile: mobile,
          email: email,
          fatherName: fatherName,
          motherName: motherName
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsEditingDetails(false);
        fetchEmployeesList();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEmp(false);
    }
  };

  // Grade change handler: automatically set basic to starting basic of new grade if out of bounds
  const handleGradeChange = (newGrade: number) => {
    setGrade(newGrade);
    const gData = getClientGradeScale(newGrade);
    if (gData) {
      // If current drawnBasic is not in new grade's range, reset to starting basic
      if (drawnBasic < gData.scale2015.startingBasic || drawnBasic > gData.scale2015.endingBasic) {
        setDrawnBasic(gData.scale2015.startingBasic);
      }
    }
  };

  // Run calculation from server (with client fallback)
  const handleCalculate = async () => {
    setLoading(true);
    setSaveSuccess(false);

    // Populate from client calculation immediately
    if (clientCalc) {
      setFixationResult({
        grade: clientCalc.grade,
        drawnBasic2015: clientCalc.drawnBasic2015,
        startingBasic2015: clientCalc.startingBasic2015,
        startingBasic2026: clientCalc.startingBasic2026,
        difference2015: clientCalc.difference2015,
        theoreticalSum: clientCalc.theoreticalSum,
        fixedBasic2026: clientCalc.fixedBasic2026,
        fixationStageIndex: clientCalc.stageIndex,
        salaryDifference: clientCalc.salaryDifference,
        annualIncrementAmount: clientCalc.annualIncrementAmount,
        basicWithJuly2026Increment: clientCalc.basicWithJuly2026Increment,
        effectiveDate: '2026-07-01',
        ruleCode: 'Clause 5',
        ruleNameBangla: clientCalc.ruleAppliedBangla,
        trace: [
          {
            stepNumber: 1,
            stepName: 'Existing Drawn Basic (30-06-2026)',
            stepNameBangla: '৩০ জুন ২০২৬ আহরিত মূল বেতন',
            formula: 'বিদ্যমান স্কেল যাচাই',
            intermediateValues: `গ্রেড ${toBanglaNum(grade)}, আহরিত বেতন: ৳${toBanglaNum(drawnBasic.toLocaleString('en-IN'))}`,
            result: drawnBasic,
            sourceClause: 'অনুচ্ছেদ ৪',
            sourcePage: 4
          },
          {
            stepNumber: 2,
            stepName: 'Difference from 2015 Starting Step',
            stepNameBangla: 'প্রারম্ভিক ধাপ হইতে পার্থক্যের পরিমাণ',
            formula: 'আহরিত বেতন - ২০১৫ স্কেলের প্রারম্ভিক বেতন',
            intermediateValues: `৳${toBanglaNum(drawnBasic.toLocaleString('en-IN'))} - ৳${toBanglaNum(clientCalc.startingBasic2015.toLocaleString('en-IN'))} = ৳${toBanglaNum(clientCalc.difference2015.toLocaleString('en-IN'))}`,
            result: clientCalc.difference2015,
            sourceClause: 'অনুচ্ছেদ ৫(খ)',
            sourcePage: 7
          },
          {
            stepNumber: 3,
            stepName: 'Add Difference to 2026 Starting Step',
            stepNameBangla: '২০২৬ স্কেলের প্রারম্ভিক ধাপের সহিত পার্থক্য যোগ',
            formula: '২০২৬ প্রারম্ভিক + পার্থক্যের পরিমাণ',
            intermediateValues: `৳${toBanglaNum(clientCalc.startingBasic2026.toLocaleString('en-IN'))} + ৳${toBanglaNum(clientCalc.difference2015.toLocaleString('en-IN'))} = ৳${toBanglaNum(clientCalc.theoreticalSum.toLocaleString('en-IN'))}`,
            result: clientCalc.theoreticalSum,
            sourceClause: 'অনুচ্ছেদ ৫(খ)',
            sourcePage: 7
          },
          {
            stepNumber: 4,
            stepName: 'Fixation at Equal or Next Higher Stage in 2026 Scale',
            stepNameBangla: '২০২৬ স্কেলে সমপর্যায়ের বা পরবর্তী উচ্চতর ধাপে বেতন নির্ধারণ',
            formula: 'অনুরূপ ধাপ বা পরবর্তী উচ্চতর ধাপ গ্রহণ',
            intermediateValues: `নির্ধারিত ধাপ #${toBanglaNum(clientCalc.stageIndex + 1)}: ৳${toBanglaNum(clientCalc.fixedBasic2026.toLocaleString('en-IN'))}`,
            result: clientCalc.fixedBasic2026,
            sourceClause: 'অনুচ্ছেদ ৫(খ)(আ)',
            sourcePage: 7
          },
          {
            stepNumber: 5,
            stepName: 'Next Annual Increment as on 1 July 2026',
            stepNameBangla: '১ জুলাই ২০২৬ তারিখে পরবর্তী নিয়মিত বার্ষিক বেতনবৃদ্ধি',
            formula: 'পরবর্তী ধাপ (অনুচ্ছেদ ৯(২))',
            intermediateValues: `ইনক্রিমেন্ট: +৳${toBanglaNum(clientCalc.annualIncrementAmount.toLocaleString('en-IN'))}`,
            result: clientCalc.basicWithJuly2026Increment,
            sourceClause: 'অনুচ্ছেদ ৯(২)',
            sourcePage: 11
          }
        ],
        scaleStageTier: clientCalc.scaleStageTier,
        disbursementStages: clientCalc.disbursementStages
      });
    }

    // Try server calculation for full synchronization
    try {
      const res = await fetch('/api/fixation/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          drawnBasic2015: drawnBasic,
          advanceIncrementCount: advanceIncrements,
          effectiveDate: '2026-07-01'
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setFixationResult(json.data);
      }
    } catch (err) {
      console.warn('Using client-side calculation engine:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger calculation on input changes
  useEffect(() => {
    handleCalculate();
  }, [grade, drawnBasic, advanceIncrements]);

  // Apply fixation to employee profile
  const handleApplyToEmployee = async () => {
    if (selectedEmpId === 'manual' || !selectedEmpObj) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে সংরক্ষিত কর্মকর্তা বা কর্মচারী নির্বাচন করুন।' : 'Please select a saved employee.');
      return;
    }

    try {
      const empId = Number(selectedEmpId);
      const fixedAmount = fixationResult?.fixedBasic2026 || clientCalc?.fixedBasic2026;
      const res = await fetch(`/api/employees/${empId}/apply-fixation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldBasic: drawnBasic,
          fixedBasic2026: fixedAmount,
          grade: grade,
          calculationTrace: fixationResult?.trace || [],
          eventType: 'Pay Fixation 2026 (Clause 5)',
          orderRef: 'এস. আর. ও. নং ৩৪৭-আইন/২০২৬'
        })
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        fetchEmployeesList();
        if (onFixationSaved) onFixationSaved();
      } else {
        alert(json.error || 'Failed to apply fixation');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export handlers
  const handleExportPDF = () => {
    if (!fixationResult) return;
    const headers = ['Step / বিবরণ', 'Description / হিসাবের সূত্র', 'Values / ভিত্তি', 'Amount / টাকা (BDT)', 'Gazette Clause / বিধি'];
    const rows = [
      ['১', 'কর্মকর্তা/কর্মচারীর নাম', employeeName, nameEnglish ? `(${nameEnglish})` : '', 'সংরক্ষিত সরকারি রেকর্ড'],
      ['২', 'পরিচিতি নম্বর (Code) ও NID', employeeCode, nid || 'রেকর্ড করা হয়নি', 'ডাটাবেজ প্রোফাইল'],
      ['৩', 'পদবি, দপ্তর ও মন্ত্রণালয়', designation, `${department}, ${ministry}`, 'বর্তমান কর্মস্থল'],
      ['৪', 'ক্যাডার ও শ্রেণি', cadre, `${grade <= 9 ? '১ম শ্রেণি' : '২য়/৩য় শ্রেণি'} (${employeeType})`, 'সার্ভিস বুক'],
      ['৫', 'ব্যাংক ও জিপিএফ হিসাব', bankName, `${bankAccount ? `হিসাব: ${bankAccount}` : ''} | GPF: ${gpfAccountNumber || '-'}`, 'ইলেকট্রনিক ফান্ড ট্রান্সফার'],
      ...fixationResult.trace.map(t => [
        String(t.stepNumber),
        t.stepNameBangla,
        t.formula,
        t.intermediateValues,
        t.sourceClause
      ])
    ];

    // Add 3-stage incremental scale and disbursement rows
    if (clientCalc?.scaleStageTier) {
      rows.push([
        '★',
        'ইনক্রিমেন্টাল পে স্কেলের স্তর (৩টি ধাপের মধ্যে অবস্থান)',
        clientCalc.scaleStageTier.currentTierName,
        `ধাপ #${toBanglaNum(clientCalc.scaleStageTier.stageNumber)} (মোট ${toBanglaNum(clientCalc.scaleStageTier.totalStagesInGrade)}টি ধাপ)`,
        'অনুচ্ছেদ ৫ ও অনুচ্ছেদ ৯'
      ]);
    }
    if (clientCalc?.disbursementStages) {
      clientCalc.disbursementStages.forEach(ds => {
        rows.push([
          `পর্যায় ${toBanglaNum(ds.stageNumber)}`,
          ds.periodBangla,
          `প্রদেয় হার: ${toBanglaNum(ds.percentage)}% | প্রদেয় স্কেল পার্থক্য: +৳${toBanglaNum(ds.monthlyDisbursedDiff.toLocaleString('en-IN'))}`,
          `মাসিক প্রদেয় মূল বেতন: ৳${toBanglaNum(ds.monthlyBasicPayable.toLocaleString('en-IN'))}`,
          `${ds.sourceClause}`
        ]);
      });
    }

    exportFixationToPDF(`Official Pay Fixation Statement - ${employeeName} (${employeeCode})`, headers, rows, `Pay_Fixation_${employeeCode || grade}`);
  };

  const handleExportExcel = () => {
    if (!fixationResult) return;
    const rows: Array<Record<string, any>> = [
      { 'Step': 'কর্মকর্তার নাম', 'Step Name': employeeName, 'Formula': nameEnglish || '', 'Values': `পরিচিতি কোড: ${employeeCode}`, 'Result': `NID: ${nid || '-'}`, 'Source Clause': 'ব্যক্তিগত তথ্য' },
      { 'Step': 'পদবি ও দপ্তর', 'Step Name': designation, 'Formula': department, 'Values': ministry, 'Result': `${cadre} (${toBanglaNum(grade)}ম গ্রেড)`, 'Source Clause': 'কর্মস্থল ও ক্যাডার' },
      { 'Step': 'ব্যাংক ও জিপিএফ', 'Step Name': bankName, 'Formula': `হিসাব: ${bankAccount || '-'}`, 'Values': `GPF: ${gpfAccountNumber || '-'}`, 'Result': `মোবাইল: ${mobile || '-'}`, 'Source Clause': 'আর্থিক তথ্য' },
      ...fixationResult.trace.map(t => ({
        'Step': t.stepNumber,
        'Step Name': t.stepNameBangla,
        'Formula': t.formula,
        'Values': t.intermediateValues,
        'Result': t.result,
        'Source Clause': t.sourceClause
      }))
    ];

    if (clientCalc?.scaleStageTier) {
      rows.push({
        'Step': 'স্কেল স্তর',
        'Step Name': 'ইনক্রিমেন্টাল পে স্কেল স্তর',
        'Formula': clientCalc.scaleStageTier.currentTierName,
        'Values': `ধাপ #${clientCalc.scaleStageTier.stageNumber} / ${clientCalc.scaleStageTier.totalStagesInGrade}`,
        'Result': clientCalc.fixedBasic2026,
        'Source Clause': 'অনুচ্ছেদ ৫/৯'
      });
    }

    if (clientCalc?.disbursementStages) {
      clientCalc.disbursementStages.forEach(ds => {
        rows.push({
          'Step': `পর্যায় ${ds.stageNumber}`,
          'Step Name': `বাস্তবায়ন পর্যায় ${ds.stageNumber} (নির্ধারিত বেতন + ১টি ইনক্রিমেন্ট)`,
          'Formula': `[ইনক্রিমেন্টসহ নির্ধারিত বেতন - আহরিত বেতন] × ${ds.percentage}%`,
          'Values': `মোট স্কেল পার্থক্য: ৳${ds.totalDifferenceWithIncrement.toLocaleString('en-IN')} এর ${ds.percentage}% = +৳${ds.monthlyDisbursedDiff.toLocaleString('en-IN')}`,
          'Result': ds.monthlyBasicPayable,
          'Source Clause': ds.sourceClause
        });
      });
    }

    exportToExcel(rows, `Pay_Fixation_${employeeCode || grade}`, 'Pay Fixation');
  };

  const handleExportDocx = () => {
    if (!fixationResult) return;
    const rows = [
      { label: 'Employee Name (Bangla) / কর্মকর্তা/কর্মচারীর নাম (বাংলা)', value: employeeName },
      { label: 'Employee Name (English) / নাম (ইংরেজি)', value: nameEnglish || '-' },
      { label: 'Employee Code / পরিচিতি নম্বর (কোড)', value: employeeCode },
      { label: 'National ID / জাতীয় পরিচয়পত্র (NID) নম্বর', value: nid || '-' },
      { label: 'Designation / বর্তমান পদবি', value: designation },
      { label: 'Department / দপ্তর বা অনুবিভাগ', value: department },
      { label: 'Ministry / মন্ত্রণালয় বা বিভাগ', value: ministry || 'অর্থ মন্ত্রণালয়' },
      { label: 'Cadre & Category / ক্যাডার ও কর্মকর্তা শ্রেণি', value: `${cadre} (${grade <= 9 ? '১ম শ্রেণি' : '২য়/৩য় শ্রেণি'})` },
      { label: 'Employee Type / কর্মচারীর ধরণ', value: employeeType },
      { label: 'Date of Birth / জন্ম তারিখ', value: dateOfBirth || '-' },
      { label: 'Govt Service Joining Date / প্রথম সরকারি চাকরিতে যোগদান', value: joiningDate || '-' },
      { label: 'Bank Account & Branch / ব্যাংক হিসাব নম্বর ও শাখা', value: `${bankAccount ? `${bankAccount}, ${bankName} (${branchName})` : bankName}` },
      { label: 'GPF Account No / সাধারণ ভবিষ্য তহবিল (জিপিএফ) হিসাব নং', value: gpfAccountNumber || '-' },
      { label: 'Mobile & Email / মোবাইল নম্বর ও ইমেইল', value: `${mobile || '-'} ${email ? `| ${email}` : ''}` },
      { label: 'New Grade 2026 / নির্ধারিত নতুন বেতনস্কেল গ্রেড', value: `Grade ${grade} (${toBanglaNum(grade)}ম গ্রেড)` },
      { label: 'Drawn Basic (30-06-2026) / ৩০ জুন ২০২৬ আহরিত মূল বেতন', value: `Tk. ${drawnBasic.toLocaleString('en-IN')}` },
      { label: '2015 Starting Basic / ২০১৫ স্কেলের প্রারম্ভিক বেতন', value: `Tk. ${fixationResult.startingBasic2015.toLocaleString('en-IN')}` },
      { label: 'Difference Amount / প্রারম্ভিক ধাপ হইতে পার্থক্যের পরিমাণ', value: `Tk. ${fixationResult.difference2015.toLocaleString('en-IN')}` },
      { label: '2026 Starting Basic / ২০২৬ স্কেলের প্রারম্ভিক বেতন', value: `Tk. ${fixationResult.startingBasic2026.toLocaleString('en-IN')}` },
      { label: 'Fixed Basic Pay 2026 (Clause 5) / ১ জুলাই ২০২৬ নির্ধারিত মূল বেতন', value: `Tk. ${fixationResult.fixedBasic2026.toLocaleString('en-IN')}` },
      { label: 'July 1, 2026 Annual Increment (Clause 9) / বার্ষিক বেতনবৃদ্ধি', value: `+Tk. ${clientCalc?.annualIncrementAmount?.toLocaleString('en-IN') || '-'}` },
      { label: 'Fixed Basic With July 1 Increment / ইনক্রিমেন্টসহ নির্ধারিত মূল বেতন', value: `Tk. ${fixationResult.basicWithJuly2026Increment.toLocaleString('en-IN')}` },
      { label: 'Total Scale Difference (With Increment) / মোট স্কেল ব্যবধান', value: `Tk. ${(fixationResult.basicWithJuly2026Increment - drawnBasic).toLocaleString('en-IN')}` },
      { label: 'Incremental Scale Stage (3 Stages) / ৩টি পর্যায়ের স্কেল স্তর', value: clientCalc?.scaleStageTier?.currentTierName || '২য় স্তর: ইনক্রিমেন্টাল প্রবৃদ্ধি ধাপ' },
      { label: 'Phase 1 Scale Diff Disbursed Portion / ১ম পর্যায় প্রদেয় অংশ', value: `+Tk. ${clientCalc?.disbursementStages?.[0]?.monthlyDisbursedDiff.toLocaleString('en-IN') || '-'}` },
      { label: 'Phase 1 Monthly Payable Basic / ১ম পর্যায় মাসিক প্রদেয় মূল বেতন', value: `Tk. ${clientCalc?.disbursementStages?.[0]?.monthlyBasicPayable.toLocaleString('en-IN') || '-'}` },
      { label: 'Phase 2 Scale Diff Disbursed Portion / ২য় পর্যায় প্রদেয় অংশ', value: `+Tk. ${clientCalc?.disbursementStages?.[1]?.monthlyDisbursedDiff.toLocaleString('en-IN') || '-'}` },
      { label: 'Phase 2 Monthly Payable Basic / ২য় পর্যায় মাসিক প্রদেয় মূল বেতন', value: `Tk. ${clientCalc?.disbursementStages?.[1]?.monthlyBasicPayable.toLocaleString('en-IN') || '-'}` },
      { label: 'Phase 3 Monthly Payable Basic (100%) / ৩য় পর্যায় প্রদেয় মূল বেতন (শতভাগ)', value: `Tk. ${clientCalc?.disbursementStages?.[2]?.monthlyBasicPayable.toLocaleString('en-IN') || '-'}` },
      { label: 'Official Reference / গেজেট প্রজ্ঞাপন রেফারেন্স', value: 'Clause 5, Clause 9 & Clause 1(3) of S.R.O. 347-Law/2026 (চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬)' }
    ];
    exportToDocx(`Pay Fixation Sheet - ${employeeName} (${employeeCode})`, rows, `Pay_Fixation_${employeeCode || grade}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher (Hidden on paper print) */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bangla font-semibold mb-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>গেজেট অনুচ্ছেদ ৫ বাস্তবায়ন ও সহজ বেতন নির্ধারণী</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'সহজ বেতন নির্ধারণী মডিউল ২০২৬' : 'Simple Pay Fixation Module 2026'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla mt-0.5">
            {lang === 'bn'
              ? 'গ্রেড ও বর্তমান মূল বেতন সিলেক্ট করলেই মুহূর্তেই নতুন পে স্কেলের মূল বেতন, ধাপ ও ইনক্রিমেন্ট হিসাব'
              : 'Select grade and drawn basic pay to instantly fix salary under National Pay Scale 2026'}
          </p>
        </div>

        {/* Mode Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Pill Toggle */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 font-bangla text-xs">
            <button
              onClick={() => setMode('simple')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                mode === 'simple'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'সহজ মোড (Simple)' : 'Simple Mode'}
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                mode === 'detailed'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'অডিট ও সূত্র ট্রেইল (Detailed)' : 'Audit Trail'}
            </button>
          </div>

          <button
            onClick={triggerPrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition font-bangla cursor-pointer active:scale-95"
            title="বেতন নির্ধারণী বিবরণী প্রিন্ট করুন"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বিবরণী প্রিন্ট' : 'Print Statement'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMPLE INTERACTIVE INPUT PANEL                                            */}
      {/* ========================================================================= */}
      <div className="no-print bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* SECTION 0: SAVED OFFICER & EMPLOYEE SELECTOR & PROFILE CARD */}
        <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-bangla flex items-center gap-1.5">
                  <span>{lang === 'bn' ? 'সংরক্ষিত কর্মকর্তা ও কর্মচারীর তথ্য:' : 'Saved Officer & Employee Information:'}</span>
                  {selectedEmpObj ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      {lang === 'bn' ? 'ডাটাবেজে সংরক্ষিত' : 'Saved in Database'}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                      {lang === 'bn' ? 'কাস্টম এন্ট্রি' : 'Custom Manual'}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 font-bangla">
                  {lang === 'bn'
                    ? 'ডাটাবেজের সংরক্ষিত কর্মকর্তা নির্বাচন করলে নাম, কোড, এনআইডি, পদবি, ব্যাংক ও জিপিএফ তথ্য বিবরণীতে যুক্ত হবে'
                    : 'Select saved officer from database to load particulars into Pay Fixation Statement'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingDetails(!isEditingDetails)}
                className="text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bangla font-medium flex items-center gap-1 cursor-pointer transition shadow-2xs"
              >
                <Edit3 className="w-3 h-3 text-slate-500" />
                <span>{isEditingDetails ? (lang === 'bn' ? 'ফর্ম লুকান' : 'Hide Edit') : (lang === 'bn' ? 'তথ্য সম্পাদন / সংশোধন' : 'Edit Info')}</span>
              </button>

              {selectedEmpObj && (
                <button
                  type="button"
                  onClick={handleApplyToEmployee}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bangla font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  title="এই কর্মকর্তার ফাইলে নতুন বেতন নির্ধারণ অনুমোদন ও হালনাগাদ করুন"
                >
                  <Save className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'ফিক্সেশন সংরক্ষণ' : 'Save Fixation'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8">
              <select
                value={selectedEmpId}
                onChange={handleEmployeeChange}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-bangla font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="manual">
                  {lang === 'bn' ? '➕ কাস্টম কর্মকর্তা/কর্মচারী (ম্যানুয়াল এন্ট্রি)' : '➕ Custom Officer / Employee (Manual Entry)'}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameBangla} {emp.nameEnglish ? `(${emp.nameEnglish})` : ''} — {emp.currentDesignation || 'পদবি'} [{toBanglaNum(emp.grade)}ম গ্রেড, কোড: {emp.employeeCode}]
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-bangla">
                {lang === 'bn' ? `মোট সংরক্ষিত: ${toBanglaNum(employees.length)} জন` : `Total: ${employees.length} employees`}
              </span>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bangla font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full animate-fade-in">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {lang === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved'}
                </span>
              )}
            </div>
          </div>

          {/* Active Employee Details Display Card */}
          <div className="mt-3 bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-bangla">
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'নাম (বাংলা/ইংরেজি):' : 'Name:'}</span>
                <span className="font-bold text-slate-900 truncate block">{employeeName || '-'}</span>
                {nameEnglish && <span className="text-[10px] text-slate-500 truncate block font-sans">{nameEnglish}</span>}
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'পরিচিতি কোড ও NID:' : 'Code & NID:'}</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] block">{employeeCode || '-'}</span>
                <span className="font-mono text-slate-600 text-[10px] block">{nid || 'NID রেকর্ড নেই'}</span>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'পদবি ও ক্যাডার:' : 'Designation & Cadre:'}</span>
                <span className="font-semibold text-slate-800 truncate block">{designation || '-'}</span>
                <span className="text-[10px] text-slate-500 block">{cadre || 'Non-Cadre'}</span>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'দপ্তর ও মন্ত্রণালয়:' : 'Dept & Ministry:'}</span>
                <span className="text-slate-800 truncate block font-medium">{department || '-'}</span>
                <span className="text-[10px] text-slate-500 truncate block">{ministry || 'অর্থ মন্ত্রণালয়'}</span>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'ব্যাংক ও শাখা:' : 'Bank & Branch:'}</span>
                <span className="text-slate-800 truncate block font-medium">{bankName}</span>
                <span className="text-[10px] text-slate-500 font-mono block">{bankAccount ? `হিসাব: ${bankAccount}` : (branchName || '-')}</span>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px]">{lang === 'bn' ? 'জিপিএফ হিসাব নং:' : 'GPF Account:'}</span>
                <span className="font-mono font-bold text-emerald-800 block">{gpfAccountNumber || 'রেকর্ড নেই'}</span>
                <span className="text-[10px] text-slate-500 font-mono block">{mobile || '-'}</span>
              </div>
            </div>
          </div>

          {/* Quick Edit Expandable Form */}
          {isEditingDetails && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-300 shadow-xs space-y-3 font-bangla animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'bn' ? 'কর্মকর্তা ও কর্মচারীর বিস্তারিত তথ্য সংশোধন / সংযোজন' : 'Edit Officer & Employee Details'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingDetails(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">কর্মকর্তার নাম (বাংলা):</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bangla text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="উদা: মোহাম্মদ ফারুক হোসেন"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">নাম (ইংরেজি):</label>
                  <input
                    type="text"
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-sans text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. Mohammad Faruk Hossain"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">পরিচিতি নম্বর (Employee Code):</label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="EMP-4547"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">জাতীয় পরিচয়পত্র (NID):</label>
                  <input
                    type="text"
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="19852691234567890"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">বর্তমান পদবি:</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bangla text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="সহকারী পরিচালক / ব্যক্তিগত কর্মকর্তা"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">দপ্তর বা অনুবিভাগ:</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bangla text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="অর্থ বিভাগ"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">মন্ত্রণালয়:</label>
                  <input
                    type="text"
                    value={ministry}
                    onChange={(e) => setMinistry(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bangla text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="অর্থ মন্ত্রণালয়"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">ক্যাডার / শ্রেণি:</label>
                  <input
                    type="text"
                    value={cadre}
                    onChange={(e) => setCadre(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-bangla text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="BCS (Admin) / Non-Cadre"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">জন্ম তারিখ:</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">চাকরিতে যোগদানের তারিখ:</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">ব্যাংক হিসাব ও ব্যাংকের নাম:</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-1/2 p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                      placeholder="হিসাব নম্বর"
                    />
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-1/2 p-2 border border-slate-300 rounded font-bangla text-xs focus:ring-1 focus:ring-emerald-500"
                      placeholder="সোনালী ব্যাংক পিএলসি"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">জিপিএফ হিসাব নম্বর:</label>
                  <input
                    type="text"
                    value={gpfAccountNumber}
                    onChange={(e) => setGpfAccountNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="GPF-EMP-4547"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">মোবাইল নম্বর:</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="01711000000"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold mb-1 block">ই-মেইল:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    placeholder="employee@mof.gov.bd"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingDetails(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-xs font-bangla text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleUpdateEmployeeInfo}
                  disabled={isSavingEmp}
                  className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold font-bangla flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingEmp ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন ডাটাবেজে সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Row 1: Grade Selection with Quick Grade Chips */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold text-slate-800 font-bangla flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? '১. আপনার গ্রেড নির্বাচন করুন:' : '1. Select Pay Grade:'}</span>
            </label>

            {/* Quick Gazette Examples */}
            <div className="flex flex-wrap items-center gap-1 text-[11px] font-bangla">
              <span className="text-slate-400 mr-1">{lang === 'bn' ? 'গেজেট উদাহরণ:' : 'Examples:'}</span>
              <button
                onClick={() => {
                  setGrade(11);
                  setDrawnBasic(13790);
                  setSelectedEmpId('manual');
                }}
                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold cursor-pointer transition"
                title="গেজেট পৃষ্ঠা ৮ উদাহরণ: ১১তম গ্রেড (১৩,৭৯০ ➔ ২৬,৩০০)"
              >
                {lang === 'bn' ? '১১তম গ্রেড (৳১৩,৭৯০ ➔ ৳২৬,৩০০)' : 'Grade 11 (13,790 ➔ 26,300)'}
              </button>
              <button
                onClick={() => {
                  setGrade(16);
                  setDrawnBasic(9300);
                  setSelectedEmpId('manual');
                }}
                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold cursor-pointer transition"
                title="গেজেট পৃষ্ঠা ৭ উদাহরণ: ১৬তম গ্রেড (৯,৩০০ ➔ ২১,৯০০)"
              >
                {lang === 'bn' ? '১৬তম গ্রেড (৳৯,৩০০ ➔ ৳২১,৯০০)' : 'Grade 16 (9,300 ➔ 21,900)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Grade Dropdown */}
            <div>
              <select
                value={grade}
                onChange={(e) => handleGradeChange(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-bangla font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                {OFFICIAL_PAY_SCALES.map((g) => (
                  <option key={g.grade} value={g.grade}>
                    {toBanglaNum(g.grade)}ম গ্রেড — ২০১৫ স্কেল: ৳{toBanglaNum(g.scale2015.startingBasic.toLocaleString('en-IN'))} ➔ ২০২৬ স্কেল: ৳{toBanglaNum(g.scale2026.startingBasic.toLocaleString('en-IN'))}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Popular Grade Buttons */}
            <div className="sm:col-span-1 lg:col-span-2 flex flex-wrap items-center gap-1.5">
              {QUICK_GRADES.map((qg) => (
                <button
                  key={qg.grade}
                  onClick={() => handleGradeChange(qg.grade)}
                  className={`text-[11px] px-2.5 py-1.5 rounded-md border font-bangla transition cursor-pointer ${
                    grade === qg.grade
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 font-medium'
                  }`}
                >
                  {lang === 'bn' ? qg.labelBn : qg.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Basic Pay Input + Interactive Clickable Stage Chips */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold text-slate-800 font-bangla flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {lang === 'bn'
                  ? '২. ৩০ জুন ২০২৬ তারিখে আহরিত মূল বেতন (নিচে ক্লিক করুন অথবা লিখুন):'
                  : '2. Drawn Basic Pay as on 30 June 2026:'}
              </span>
            </label>

            {/* Employee auto-select dropdown (Optional) */}
            <div className="flex items-center gap-1.5 text-xs font-bangla">
              <span className="text-slate-500 text-[11px]">{lang === 'bn' ? 'ডাটাবেজ থেকে:' : 'From DB:'}</span>
              <select
                value={selectedEmpId}
                onChange={handleEmployeeChange}
                className="text-[11px] p-1 border border-slate-300 rounded bg-slate-50 font-bangla text-slate-700"
              >
                <option value="manual">{lang === 'bn' ? 'কাস্টম হিসাব' : 'Custom Input'}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameBangla} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Number Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-bangla">৳</span>
              <input
                type="number"
                value={drawnBasic}
                onChange={(e) => {
                  setDrawnBasic(Number(e.target.value));
                  setSelectedEmpId('manual');
                }}
                className="w-full pl-8 pr-3 py-2 text-sm font-bold font-mono text-emerald-950 bg-white border-2 border-emerald-600/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="যেমন: 13790"
              />
            </div>

            <div className="text-xs text-slate-500 font-bangla">
              {lang === 'bn' ? (
                <span>
                  ২০১৫ স্কেলে এই গ্রেডের বেতন সীমা: ৳{toBanglaNum(currentGradeData?.scale2015.startingBasic.toLocaleString('en-IN'))} হইতে ৳{toBanglaNum(currentGradeData?.scale2015.endingBasic.toLocaleString('en-IN'))}
                </span>
              ) : (
                <span>
                  2015 Scale Range: Tk. {currentGradeData?.scale2015.startingBasic} to {currentGradeData?.scale2015.endingBasic}
                </span>
              )}
            </div>
          </div>

          {/* Interactive Clickable Chips of all 2015 stages of this grade */}
          {currentGradeData && currentGradeData.scale2015.stages.length > 0 && (
            <div className="mt-3">
              <span className="text-[11px] text-slate-500 font-bangla block mb-1.5 font-medium">
                {lang === 'bn'
                  ? '👇 অথবা আপনার ধাপটিতে সরাসরি ক্লিক করুন (২০১৫ স্কেলের ধাপসমূহ):'
                  : 'Or click your existing pay step:'}
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                {currentGradeData.scale2015.stages.map((stg, idx) => {
                  const isSelected = drawnBasic === stg;
                  return (
                    <button
                      key={stg}
                      onClick={() => {
                        setDrawnBasic(stg);
                        setSelectedEmpId('manual');
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded font-mono font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs font-bold ring-2 ring-emerald-500'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300'
                      }`}
                      title={`ধাপ #${idx + 1}: ৳${stg.toLocaleString('en-IN')}`}
                    >
                      <span>৳{toBanglaNum(stg.toLocaleString('en-IN'))}</span>
                      {idx === 0 && <span className="ml-1 text-[9px] text-emerald-200">(প্রারম্ভিক)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Mode Additions: Advance Increments */}
        {mode === 'detailed' && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bangla">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'অগ্রিম বেতনবৃদ্ধি (অনুচ্ছেদ ১০ - Advance Increments):' : 'Advance Increments (Clause 10):'}
              </label>
              <select
                value={advanceIncrements}
                onChange={(e) => setAdvanceIncrements(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500"
              >
                <option value={0}>{lang === 'bn' ? 'প্রযোজ্য নয় (০টি ইনক্রিমেন্ট)' : 'None (0)'}</option>
                <option value={1}>{lang === 'bn' ? '১টি অগ্রিম ইনক্রিমেন্ট (MBBS/ইঞ্জিনিয়ারিং/কৃষি)' : '1 Increment (MBBS/Eng)'}</option>
                <option value={2}>{lang === 'bn' ? '২টি অগ্রিম ইনক্রিমেন্ট (স্নাতকোত্তর/আইন/প্ল্যানিং)' : '2 Increments (Masters/Law)'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'কার্যকর তারিখ:' : 'Effective Date:'}
              </label>
              <input
                type="text"
                disabled
                value="১ জুলাই ২০২৬ (01 July 2026)"
                className="w-full p-2 border border-slate-200 rounded bg-slate-100 text-slate-600 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INSTANT RESULTS DISPLAY (Clean, Beautiful, Legible Cards)                 */}
      {/* ========================================================================= */}
      {clientCalc && (
        <div className="space-y-4">
          {/* 4 Summary Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-bangla">
            {/* Card 1: 2015 Existing Basic */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
                {lang === 'bn' ? 'বিদ্যমান আহরিত বেতন (২০১৫)' : 'Existing Basic (2015)'}
              </span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {formatCurrency(clientCalc.drawnBasic2015, lang)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>{toBanglaNum(grade)}ম গ্রেড</span>
                <span>•</span>
                <span>প্রারম্ভিক ৳{toBanglaNum(clientCalc.startingBasic2015.toLocaleString('en-IN'))}</span>
              </div>
            </div>

            {/* Card 2: 2026 Fixed Basic Pay (Star Highlight) */}
            <div className="bg-emerald-900 text-white p-4 rounded-xl border border-emerald-800 shadow-xs relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-15">
                <Award className="w-12 h-12 text-emerald-300" />
              </div>
              <span className="text-[11px] font-bold text-emerald-300 block uppercase tracking-wider">
                {lang === 'bn' ? '১ জুলাই ২০২৬ নির্ধারিত মূল বেতন' : 'Fixed Basic Pay 2026'}
              </span>
              <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
                {formatCurrency(clientCalc.fixedBasic2026, lang)}
              </div>
              <div className="text-[11px] text-emerald-200 mt-1 font-semibold flex items-center gap-1">
                <span className="bg-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                  ধাপ #{toBanglaNum(clientCalc.stageIndex + 1)}
                </span>
                <span>(গেজেট অনুচ্ছেদ ৫)</span>
              </div>
            </div>

            {/* Card 3: Basic Increase */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
                {lang === 'bn' ? 'মূল বেতন বৃদ্ধির পরিমাণ' : 'Net Basic Increase'}
              </span>
              <div className="text-xl font-black text-emerald-700 font-mono mt-1 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-emerald-600" />
                +{formatCurrency(clientCalc.salaryDifference, lang)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                +{toBanglaNum(clientCalc.percentageIncrease)}% বেতন প্রবৃদ্ধি
              </div>
            </div>

            {/* Card 4: Basic with July 1 Increment & Section 9 Statutory Rate */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {lang === 'bn' ? '১ জুলাই ইনক্রিমেন্টসহ প্রাপ্য' : 'With July 1 Increment'}
                </span>
                {clientCalc.section9Increment && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold font-mono">
                    হার: {clientCalc.section9Increment.statutoryRateBangla}
                  </span>
                )}
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1 text-sky-900">
                {formatCurrency(clientCalc.basicWithJuly2026Increment, lang)}
              </div>
              <div className="text-[11px] text-sky-700 font-semibold mt-1">
                ইনক্রিমেন্ট: +{formatCurrency(clientCalc.annualIncrementAmount, lang)} ({clientCalc.section9Increment?.rateTierNameBangla || 'অনুচ্ছেদ ৯'})
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP-BY-STEP CALCULATION EXPLANATION (Plain Language Breakdown)           */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs font-bangla">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'bn' ? 'সহজ ৩টি ধাপে বেতন নির্ধারণের হিসাব (গেজেট বিধি ৫)' : 'Simple 3-Step Fixation Rule'}</span>
              </h3>
              <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
                {clientCalc.ruleAppliedBangla}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Step 1 */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[11px]">১</span>
                  <span>আহরিত ও প্রারম্ভিক বেতনের পার্থক্য</span>
                </div>
                <p className="text-slate-600 mb-2">
                  ৩০ জুন তারিখে আহরিত বেতন থেকে বিদ্যমান ২০১৫ স্কেলের প্রারম্ভিক বেতনের ব্যবধান বের করা হয়:
                </p>
                <div className="p-2 bg-white rounded border border-slate-300 font-mono font-bold text-slate-900 text-center">
                  ৳{toBanglaNum(clientCalc.drawnBasic2015.toLocaleString('en-IN'))} - ৳{toBanglaNum(clientCalc.startingBasic2015.toLocaleString('en-IN'))} = ৳{toBanglaNum(clientCalc.difference2015.toLocaleString('en-IN'))}
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[11px]">২</span>
                  <span>২০২৬ প্রারম্ভিক ধাপে যোগ</span>
                </div>
                <p className="text-slate-600 mb-2">
                  প্রাপ্ত পার্থক্য ২০২৬ স্কেলের সংশ্লিষ্ট গ্রেডের প্রারম্ভিক বেতনের সহিত যোগ করা হয়:
                </p>
                <div className="p-2 bg-white rounded border border-slate-300 font-mono font-bold text-slate-900 text-center">
                  ৳{toBanglaNum(clientCalc.startingBasic2026.toLocaleString('en-IN'))} + ৳{toBanglaNum(clientCalc.difference2015.toLocaleString('en-IN'))} = ৳{toBanglaNum(clientCalc.theoreticalSum.toLocaleString('en-IN'))}
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-emerald-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[11px]">৩</span>
                  <span>২০২৬ স্কেলে ধাপ নির্ধারণ</span>
                </div>
                <p className="text-slate-700 mb-2">
                  {clientCalc.theoreticalSum === clientCalc.fixedBasic2026 ? (
                    <span>যোগফল ২০২৬ স্কেলে হুবহু বিদ্যমান থাকায় সমপর্যায়ের ধাপে বেতন নির্ধারিত হলো।</span>
                  ) : (
                    <span>যোগফল (৳{toBanglaNum(clientCalc.theoreticalSum.toLocaleString('en-IN'))}) স্কেলে না থাকায় পরবর্তী উচ্চতর ধাপে নির্ধারিত হলো:</span>
                  )}
                </p>
                <div className="p-2 bg-emerald-800 text-white rounded font-mono font-black text-center text-sm">
                  ৳{toBanglaNum(clientCalc.fixedBasic2026.toLocaleString('en-IN'))} (ধাপ #{toBanglaNum(clientCalc.stageIndex + 1)})
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VISUAL 2026 SCALE STAGE PROGRESSION MAP                                   */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs font-bangla">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{toBanglaNum(grade)}ম গ্রেডের ২০২৬ পে স্কেলের ধাপ ও আপনার অবস্থান:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                সর্বমোট {toBanglaNum(clientCalc.scale2026Stages.length)}টি ধাপ (৳{toBanglaNum(clientCalc.startingBasic2026.toLocaleString('en-IN'))} - ৳{toBanglaNum(clientCalc.scale2026Stages[clientCalc.scale2026Stages.length - 1].toLocaleString('en-IN'))})
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1">
              {clientCalc.scale2026Stages.map((stg, idx) => {
                const isFixed = idx === clientCalc.stageIndex;
                const isNextIncrement = idx === clientCalc.stageIndex + 1;
                return (
                  <div
                    key={stg}
                    className={`flex-shrink-0 text-center px-3 py-2 rounded-lg border text-xs transition ${
                      isFixed
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm scale-105 font-bold ring-2 ring-emerald-500'
                        : isNextIncrement
                        ? 'bg-sky-50 text-sky-900 border-sky-300 font-semibold'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">ধাপ {toBanglaNum(idx + 1)}</div>
                    <div className="font-mono font-bold mt-0.5">৳{toBanglaNum(stg.toLocaleString('en-IN'))}</div>
                    {isFixed && (
                      <span className="inline-block mt-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                        ★ নির্ধারিত
                      </span>
                    )}
                    {isNextIncrement && (
                      <span className="inline-block mt-1 text-[9px] bg-sky-200 text-sky-900 px-1.5 py-0.2 rounded">
                        ১ জুলাই
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3 STAGES OF INCREMENTAL BASIC PAY SCALE & APPLICATION TO FIXATION         */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs font-bangla space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold mb-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'bn' ? 'মৌলিক কাঠামো ও গেজেট বিধি' : 'Scale Structure & Stages'}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'bn' ? 'ইনক্রিমেন্টাল মূল বেতনস্কেলের ৩টি ধাপ/স্তর ও ফিক্সেশনে এর প্রয়োগ' : 'Stages of the Incremental Basic Pay Scale (3 Stages)'}
                </h3>
              </div>

              {/* Current Employee Tier Badge */}
              {clientCalc.scaleStageTier && (
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>
                    {lang === 'bn'
                      ? `কর্মচারীর বর্তমান অবস্থান: ${clientCalc.scaleStageTier.currentTierName}`
                      : `Employee Status: Tier ${clientCalc.scaleStageTier.currentTier}`}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'bn'
                ? 'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ (এস. আর. ও. নং ৩৪৭-আইন/২০২৬) এর কাঠামো অনুযায়ী প্রতিটি গ্রেডের ইনক্রিমেন্টাল পে স্কেল ৩টি সুনির্দিষ্ট স্তরে (3 Stages) পরিচালিত হয়। পে ফিক্সেশন ও ইনক্রিমেন্ট নির্ধারণের সময় কর্মচারীর অবস্থান এই ৩টি স্তরের নিয়মানুযায়ী নির্ধারিত হয়:'
                : 'Under Bangladesh National Pay Scale 2026, the incremental basic pay scale progresses systematically through 3 fundamental stages:'}
            </p>

            {/* 3 Tier Detailed Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              {/* Stage 1 Card */}
              <div
                className={`p-4 rounded-xl border transition ${
                  clientCalc.scaleStageTier?.currentTier === 1
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    ১
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-200 text-slate-700">
                    অনুচ্ছেদ ৫(ক) ও ৪
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ১ম স্তর: প্রারম্ভিক ধাপ (Entry / Starting Basic)
                </h4>
                <div className="text-[11px] text-emerald-800 font-mono font-bold mb-2">
                  ধাপ #১ — মূল বেতন: ৳{toBanglaNum(clientCalc.startingBasic2026.toLocaleString('en-IN'))}
                </div>
                <p className="text-slate-600 mb-3 leading-relaxed">
                  স্কেলের সর্বনিম্ন বা প্রবেশস্তর। নতুন সরাসরি নিয়োগপ্রাপ্ত অথবা বিদ্যমান স্কেলের প্রারম্ভিক ধাপে আহরিত কর্মকর্তাদের কোনো পূর্ববর্তী ইনক্রিমেন্ট ব্যবধান থাকে না (পার্থক্য শূন্য)। অনুচ্ছেদ ৫(ক) অনুসারে সরাসরি ২০২৬ স্কেলের ধাপ ১-এ বেতন নির্ধারিত হয়।
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">২০১৫ প্রারম্ভিক:</span>
                    <span className="font-mono font-bold">৳{toBanglaNum(clientCalc.startingBasic2015.toLocaleString('en-IN'))}</span>
                  </div>
                  <div className="flex justify-between text-emerald-900 font-bold">
                    <span>২০২৬ প্রারম্ভিক:</span>
                    <span className="font-mono">৳{toBanglaNum(clientCalc.startingBasic2026.toLocaleString('en-IN'))}</span>
                  </div>
                </div>
                {clientCalc.scaleStageTier?.currentTier === 1 && (
                  <div className="mt-3 p-1.5 bg-emerald-600 text-white text-center rounded font-bold text-[11px]">
                    ✓ কর্মচারীর বর্তমান নির্ধারিত অবস্থান (ধাপ #১)
                  </div>
                )}
              </div>

              {/* Stage 2 Card */}
              <div
                className={`p-4 rounded-xl border transition ${
                  clientCalc.scaleStageTier?.currentTier === 2
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                    ২
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                    অনুচ্ছেদ ৫(খ) ও ৯(২)
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ২য় স্তর: ইনক্রিমেন্টাল প্রবৃদ্ধি ধাপসমূহ (Progressive Steps)
                </h4>
                <div className="text-[11px] text-emerald-800 font-mono font-bold mb-2">
                  ধাপ #২ হইতে ধাপ #{toBanglaNum(Math.max(2, clientCalc.scale2026Stages.length - 1))}
                </div>
                <p className="text-slate-600 mb-3 leading-relaxed">
                  সন্তোষজনক কার্যকালের জন্য বার্ষিক ১ জুলাই অর্জিত যৌগিক ইনক্রিমেন্টাল ধাপসমূহ। বেতন ফিক্সেশনে বিদ্যমান ব্যবধান যোগ করিয়া অনুরূপ বা পরবর্তী উচ্চতর ধাপে বেতন নির্ধারিত হয়। পরবর্তীতে অনুচ্ছেদ ৯(২) মোতাবেক ১ জুলাই ২০২৬ তারিখে পরবর্তী ধাপে ১টি নিয়মিত ইনক্রিমেন্ট নিশ্চিত হয়।
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">নির্ধারিত ধাপ:</span>
                    <span className="font-mono font-bold text-emerald-900">ধাপ #{toBanglaNum(clientCalc.stageIndex + 1)} (৳{toBanglaNum(clientCalc.fixedBasic2026.toLocaleString('en-IN'))})</span>
                  </div>
                  <div className="flex justify-between text-sky-800 font-bold">
                    <span>১ জুলাই ইনক্রিমেন্ট:</span>
                    <span className="font-mono">+৳{toBanglaNum(clientCalc.annualIncrementAmount.toLocaleString('en-IN'))}</span>
                  </div>
                </div>
                {clientCalc.scaleStageTier?.currentTier === 2 && (
                  <div className="mt-3 p-1.5 bg-emerald-700 text-white text-center rounded font-bold text-[11px]">
                    ✓ কর্মচারীর বর্তমান নির্ধারিত অবস্থান (ধাপ #{toBanglaNum(clientCalc.stageIndex + 1)})
                  </div>
                )}
              </div>

              {/* Stage 3 Card */}
              <div
                className={`p-4 rounded-xl border transition ${
                  clientCalc.scaleStageTier?.currentTier === 3
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    ৩
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                    অনুচ্ছেদ ৯(৩) ও সিলিং
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ৩য় স্তর: সর্বোচ্চ সিলিং ও স্থবিরতা ইনক্রিমেন্ট (Ceiling & Stagnation)
                </h4>
                <div className="text-[11px] text-amber-800 font-mono font-bold mb-2">
                  ধাপ #{toBanglaNum(clientCalc.scale2026Stages.length)} — সিলিং: ৳{toBanglaNum(clientCalc.scale2026Stages[clientCalc.scale2026Stages.length - 1].toLocaleString('en-IN'))}
                </div>
                <p className="text-slate-600 mb-3 leading-relaxed">
                  সংশ্লিষ্ট গ্রেড স্কেলের সর্বশেষ সর্বোচ্চ ধাপ (Maximum Pay Ceiling)। পদোন্নতি ব্যতীত কর্মচারী সর্বোচ্চ ধাপে পৌঁছালে সাধারণ ধাপ সমাপ্ত হয়। অনুচ্ছেদ ৯(৩) মোতাবেক সর্বোচ্চ ধাপে ১ বছর অবস্থানের পর বার্ষিক ৫% হারে ব্যক্তিগত স্থবিরতা বেতনবৃদ্ধি (Stagnation Increment) প্রদেয় হয়।
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">স্কেলের সর্বোচ্চ সীমা:</span>
                    <span className="font-mono font-bold">৳{toBanglaNum(clientCalc.scale2026Stages[clientCalc.scale2026Stages.length - 1].toLocaleString('en-IN'))}</span>
                  </div>
                  <div className="flex justify-between text-amber-900 font-bold">
                    <span>স্থবিরতা ইনক্রিমেন্ট (৫%):</span>
                    <span className="font-mono">+৳{toBanglaNum(Math.round(clientCalc.scale2026Stages[clientCalc.scale2026Stages.length - 1] * 0.05).toLocaleString('en-IN'))}</span>
                  </div>
                </div>
                {clientCalc.scaleStageTier?.currentTier === 3 && (
                  <div className="mt-3 p-1.5 bg-amber-700 text-white text-center rounded font-bold text-[11px]">
                    ✓ কর্মচারীর বর্তমান নির্ধারিত অবস্থান (সর্বোচ্চ সিলিং স্তর)
                  </div>
                )}
              </div>
            </div>

            {/* Visual 3-Stage Progress Gauge */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700 mb-1.5">
                <span>১ম স্তর: প্রারম্ভিক (ধাপ ১)</span>
                <span>২য় স্তর: ইনক্রিমেন্টাল ধাপসমূহ (ধাপ ২ - {toBanglaNum(clientCalc.scale2026Stages.length - 1)})</span>
                <span>৩য় স্তর: সিলিং (ধাপ {toBanglaNum(clientCalc.scale2026Stages.length)})</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 flex overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    clientCalc.scaleStageTier?.currentTier === 1
                      ? 'bg-emerald-600 w-1/12'
                      : clientCalc.scaleStageTier?.currentTier === 2
                      ? 'bg-emerald-700'
                      : 'bg-emerald-800 w-full'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(8, ((clientCalc.stageIndex + 1) / clientCalc.scale2026Stages.length) * 100))}%`
                  }}
                ></div>
              </div>
              <div className="mt-1 flex justify-between items-center text-[10px] text-slate-500">
                <span>প্রারম্ভিক ভিত্তি</span>
                <span className="font-bold text-emerald-900">
                  বর্তমান ধাপ #{toBanglaNum(clientCalc.stageIndex + 1)} ({toBanglaNum(Math.round(((clientCalc.stageIndex + 1) / clientCalc.scale2026Stages.length) * 100))}% অগ্রসর)
                </span>
                <span>সর্বোচ্চ সীমা</span>
              </div>
            </div>

            {/* 3 DISBURSEMENT / IMPLEMENTATION STAGES (Clause 1(3) & 9(2)) */}
            {clientCalc.disbursementStages && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'bn' ? 'নির্ধারিত বেতনের সাথে ১টি ইনক্রিমেন্ট যোগ করে স্কেল পার্থক্যের প্রদেয় অংশ ও বাস্তবায়ন পর্যায় (অনুচ্ছেদ ১(৩) ও ৯(২)):' : 'Scale Difference Payable Portion Calculated by Adding 1 Increment to Fixed Pay (Clause 1(3) & 9(2)):'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'bn'
                        ? 'নির্ধারিত মূল বেতনের সাথে ০১ জুলাই ২০২৬ এর ১টি ইনক্রিমেন্ট যোগ করিয়া মোট স্কেল পার্থক্য নির্ধারণপূর্বক পর্যায়ভিত্তিক প্রদেয় অংশ হিসাব করা হইয়াছে।'
                        : 'Calculated by adding the 1 July 2026 increment to the fixed basic pay first, then calculating the payable portion of total scale difference.'}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold">
                    <span>{grade <= 9 ? '১ম-৯ম গ্রেড (৪০% / ৭০% / ১০০%)' : '১০ম-২০তম গ্রেড (৫০% / ৭৫% / ১০০%)'}</span>
                  </div>
                </div>

                {/* Formula Breakdown Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-slate-100/80 rounded-lg text-[11px] text-slate-700 border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">ইনক্রিমেন্টসহ নির্ধারিত মূল বেতন:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ৳{toBanglaNum(clientCalc.basicWithJuly2026Increment.toLocaleString('en-IN'))}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      (নির্ধারিত ৳{toBanglaNum(clientCalc.fixedBasic2026.toLocaleString('en-IN'))} + ইনক্রিমেন্ট ৳{toBanglaNum(clientCalc.annualIncrementAmount.toLocaleString('en-IN'))})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">২০১৫ স্কেলে আহরিত মূল বেতন:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      ৳{toBanglaNum(drawnBasic.toLocaleString('en-IN'))}
                    </span>
                    <span className="text-[10px] text-slate-400 block">আহরণের শেষ তারিখ ৩০-০৬-২০২৬</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ইনক্রিমেন্টসহ মোট স্কেল পার্থক্য:</span>
                    <span className="font-mono font-extrabold text-emerald-800">
                      +৳{toBanglaNum((clientCalc.basicWithJuly2026Increment - drawnBasic).toLocaleString('en-IN'))}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">এই পার্থক্যের ওপর পর্যায়ভিত্তিক % প্রদেয়</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                  {clientCalc.disbursementStages.map((stg) => (
                    <div
                      key={stg.stageNumber}
                      className={`p-4 rounded-xl border transition ${
                        stg.stageNumber === 1
                          ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200'
                          : stg.stageNumber === 3
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-xs">{stg.periodBangla}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded">
                          {toBanglaNum(stg.percentage)}%
                        </span>
                      </div>

                      {/* Scale Difference Calculation Details */}
                      <div className="space-y-1.5 text-slate-600 text-[11px] pb-2.5 border-b border-slate-200/80">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-600 font-medium">
                            স্কেল পার্থক্যের প্রদেয় অংশ ({toBanglaNum(stg.percentage)}%):
                          </span>
                          <span className="font-mono font-bold text-emerald-700 text-sm">
                            +৳{toBanglaNum(stg.monthlyDisbursedDiff.toLocaleString('en-IN'))}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          (মোট পার্থক্য ৳{toBanglaNum((stg.totalDifferenceWithIncrement).toLocaleString('en-IN'))} এর {toBanglaNum(stg.percentage)}%)
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">২০১৫ আহরিত মূল বেতন:</span>
                          <span className="font-mono font-medium text-slate-700">
                            ৳{toBanglaNum(drawnBasic.toLocaleString('en-IN'))}
                          </span>
                        </div>
                      </div>

                      {/* Highlighted Net Payable Basic */}
                      <div className="pt-2.5">
                        <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wide">
                          {stg.stageNumber === 3
                            ? (lang === 'bn' ? '১০০% ইনক্রিমেন্টসহ পূর্ণ মাসিক মূল বেতন:' : '100% Full Monthly Basic:')
                            : (lang === 'bn' ? 'প্রদেয় মাসিক মূল বেতন:' : 'Payable Monthly Basic:')}
                        </span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xl font-black font-mono text-emerald-950">
                            ৳{toBanglaNum(stg.monthlyBasicPayable.toLocaleString('en-IN'))}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {stg.sourceClause}
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-500 flex justify-between">
                          <span>
                            (আহরিত ৳{toBanglaNum(drawnBasic.toLocaleString('en-IN'))} + প্রদেয় পার্থক্য ৳{toBanglaNum(stg.monthlyDisbursedDiff.toLocaleString('en-IN'))})
                          </span>
                        </div>
                        {stg.stageNumber === 3 && (
                          <div className="mt-1.5 text-[10px] text-emerald-700 font-medium bg-emerald-100/60 px-2 py-0.5 rounded">
                            ✓ নতুন স্কেলের পূর্ণ সুবিধা (১০০%) কার্যকর
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statutory Guideline Note */}
                <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">বিধি নির্দেশিকা (অনুচ্ছেদ ১(৩) ও ৯(২)): </span>
                    <span>
                      নির্ধারিত মূল বেতন ৳{toBanglaNum(clientCalc.fixedBasic2026.toLocaleString('en-IN'))} এর সহিত ০১ জুলাই ২০২৬ তারিখের ১টি বার্ষিক ইনক্রিমেন্ট ৳{toBanglaNum(clientCalc.annualIncrementAmount.toLocaleString('en-IN'))} যোগ করিয়া ইনক্রিমেন্টসহ নির্ধারিত মূল বেতন হয় ৳{toBanglaNum(clientCalc.basicWithJuly2026Increment.toLocaleString('en-IN'))}। অতঃপর ২০১৫ স্কেলে আহরিত মূল বেতন (৳{toBanglaNum(drawnBasic.toLocaleString('en-IN'))}) বাদ দিয়া মোট স্কেল পার্থক্য (৳{toBanglaNum((clientCalc.basicWithJuly2026Increment - drawnBasic).toLocaleString('en-IN'))}) নির্ধারণ করা হইয়াছে এবং অনুচ্ছেদ ১(৩) অনুসারে উক্ত পার্থক্যের {grade <= 9 ? '৪০% / ৭০% / ১০০%' : '৫০% / ৭৫% / ১০০%'} অংশ যোগ করিয়া পর্যায়ভিত্তিক মাসিক প্রদেয় মূল বেতন নির্ধারিত হইয়াছে।
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 9: INCREMENTAL BASIC PAY RATES (3 STAGES/STEPS) & FIXATION        */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs font-bangla space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full font-semibold mb-1">
                  <Percent className="w-3.5 h-3.5 text-sky-600" />
                  <span>{lang === 'bn' ? 'অনুচ্ছেদ ৯: বার্ষিক বেতনবৃদ্ধি ও সংবিধিবদ্ধ হার' : 'Section 9: Annual Increment Rates'}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'bn' ? 'অনুচ্ছেদ ৯: বার্ষিক বেতনবৃদ্ধির ৩টি ধাপ/স্তরের হার ও পে ফিক্সেশনে প্রয়োগ' : 'Section 9: Incremental Basic Pay Rates (3 Stages) & Pay Fixation'}
                </h3>
              </div>

              {clientCalc.section9Increment && (
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-300 text-sky-950 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
                  <span>
                    {lang === 'bn'
                      ? `${toBanglaNum(grade)}ম গ্রেডের সংবিধিবদ্ধ হার: ${clientCalc.section9Increment.statutoryRateBangla} (${clientCalc.section9Increment.rateTierNameBangla})`
                      : `Statutory Rate for Grade ${grade}: ${clientCalc.section9Increment.statutoryRatePercent}%`}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'bn'
                ? 'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর অনুচ্ছেদ ৯ অনুসারে সরকারি কর্মচারীদের বাৎসরিক মূল বেতনবৃদ্ধি (ইনক্রিমেন্ট) হার পূর্বেকার অভিন্ন ৫% এর পরিবর্তে গ্রেডভিত্তিক ৩টি সুনির্দিষ্ট সংবিধিবদ্ধ স্তরে/ধাপে বিভক্ত করা হইয়াছে। পে ফিক্সেশনে ১ জুলাই ২০২৬ তারিখে এই সংবিধিবদ্ধ হার মোতাবেক মূল বেতন পরবর্তী উচ্চতর ধাপে উন্নীত হয়:'
                : 'Under Section 9 of the Service (Pay and Allowances) Order 2026, annual increments are classified into 3 distinct statutory rate stages based on employee pay grade, replacing the previous uniform rate:'}
            </p>

            {/* 3 Statutory Rate Tier Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              {SECTION_9_INCREMENT_RATE_TIERS.map((tier) => {
                const isCurrentEmployeeGradeInTier = tier.grades.includes(grade);
                return (
                  <div
                    key={tier.tierNumber}
                    className={`p-4 rounded-xl border transition ${
                      isCurrentEmployeeGradeInTier
                        ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-400 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-sky-800 text-white flex items-center justify-center font-bold text-xs">
                        {toBanglaNum(tier.tierNumber)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-sky-100 text-sky-800">
                        {tier.legalBasisBangla}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      {tier.tierNameBangla}
                    </h4>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-black font-mono text-sky-900">
                        {tier.statutoryRateBangla}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">বার্ষিক সংবিধিবদ্ধ হার</span>
                    </div>

                    <p className="text-slate-600 mb-3 leading-relaxed text-[11px]">
                      {tier.descriptionBangla}
                    </p>

                    <div className="p-2 bg-white rounded border border-slate-200 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">গ্রেড কভারেজ:</span>
                        <span className="font-bold text-slate-800">{tier.gradeCoverageBangla}</span>
                      </div>
                      <div className="flex justify-between text-sky-900 font-semibold">
                        <span>হিসাব পদ্ধতি:</span>
                        <span>যৌগিক চক্রবৃদ্ধি ধাপ প্রবৃদ্ধি</span>
                      </div>
                    </div>

                    {isCurrentEmployeeGradeInTier && (
                      <div className="mt-3 p-1.5 bg-sky-700 text-white text-center rounded font-bold text-[11px] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>আপনার গ্রেড ({toBanglaNum(grade)}ম গ্রেড) এই স্তরের অন্তর্ভুক্ত</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Special Note for Grade 1 */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">১ম গ্রেডের কর্মকর্তা (নির্ধারিত বেতন): </span>
                <span>অনুচ্ছেদ ৩(১) ও ৯ অনুসারে ১ম গ্রেডের মূল বেতন ১,৫৬,০০০ টাকা স্থায়ীভাবে নির্ধারিত (Fixed) হওয়ায় বার্ষিক বেতনবৃদ্ধি বা ইনক্রিমেন্ট প্রযোজ্য নহে।</span>
              </div>
            </div>

            {/* Application to This Fixation Breakdown */}
            {clientCalc.section9Increment && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-1">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>পে ফিক্সেশনে অনুচ্ছেদ ৯ এর প্রয়োগ ও গাণিতিক প্রভাব:</span>
                  </span>
                  <span className="text-[11px] font-mono text-sky-800 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {clientCalc.section9Increment.statutoryClause}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">নির্ধারিত মূল বেতন (১ জুলাই ২৬)</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ৳{toBanglaNum(clientCalc.fixedBasic2026.toLocaleString('en-IN'))}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">ধাপ #{toBanglaNum(clientCalc.stageIndex + 1)}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">প্রযোজ্য সংবিধিবদ্ধ হার (Section 9)</span>
                    <span className="font-mono font-bold text-sky-700 text-sm">
                      {clientCalc.section9Increment.statutoryRateBangla}
                    </span>
                    <span className="text-[10px] text-sky-600 block mt-0.5">{clientCalc.section9Increment.rateTierNameBangla}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">১ জুলাই ২০২৬ ইনক্রিমেন্ট বৃদ্ধি</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      +৳{toBanglaNum(clientCalc.annualIncrementAmount.toLocaleString('en-IN'))}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      কার্যকর বৃদ্ধি: {toBanglaNum(clientCalc.section9Increment.effectiveIncrementPercentage)}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px] block">ইনক্রিমেন্টসহ মূল বেতন</span>
                    <span className="font-mono font-bold text-emerald-950 text-sm">
                      ৳{toBanglaNum(clientCalc.basicWithJuly2026Increment.toLocaleString('en-IN'))}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">পরবর্তী ধাপ #{toBanglaNum(clientCalc.stageIndex + 2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-sky-100 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-sky-900">গেজেট বিধি নির্দেশিকা: </span>
                  {clientCalc.section9Increment.explanationBangla}
                </div>

                {/* Stagnation Note under Section 9(3) if applicable */}
                {clientCalc.section9Increment.isCeilingReached && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-[11px] text-amber-950 font-medium">
                    <span className="font-bold">⚠️ অনুচ্ছেদ ৯(৩) স্থবিরতা বেতনবৃদ্ধি (Stagnation Increment): </span>
                    কর্মচারী স্কেলের সর্বোচ্চ সিলিং ধাপে উপনীত হওয়ায় সাধারণ ইনক্রিমেন্ট ধাপ সমাপ্ত হইয়াছে। সর্বোচ্চ ধাপে ১ বছর অবস্থানের পর বার্ষিক ৫.০০% হারে ব্যক্তিগত বেতনবৃদ্ধি (+৳{toBanglaNum(clientCalc.section9Increment.stagnationIncrementAmount.toLocaleString('en-IN'))}) প্রাপ্য হইবেন।
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Mode Trace Table (Shown only when toggled) */}
          {mode === 'detailed' && fixationResult && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 font-bangla flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'bn' ? 'পূর্ণাঙ্গ নিরীক্ষা ট্রেইল ও গেজেট অনুচ্ছেদ (Audit Trail)' : 'Deterministic Calculation Steps & Audit Trail'}</span>
                </h3>
                <span className="text-xs text-slate-500 font-bangla">গেজেট ধারা ও সূত্রভিত্তিক</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bangla">
                  <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">{lang === 'bn' ? 'ধাপের বিবরণ' : 'Step Description'}</th>
                      <th className="py-2.5 px-4">{lang === 'bn' ? 'গেজেটের সূত্র' : 'Formula'}</th>
                      <th className="py-2.5 px-4">{lang === 'bn' ? 'মধ্যবর্তী মান / হিসাব' : 'Intermediate Values'}</th>
                      <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'ফলাফল' : 'Result'}</th>
                      <th className="py-2.5 px-4 text-right">{lang === 'bn' ? 'গেজেট অনুচ্ছেদ' : 'Source Clause'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {fixationResult.trace.map((step) => (
                      <tr key={step.stepNumber} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">
                          {step.stepNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 font-bangla">
                          {lang === 'bn' ? step.stepNameBangla : step.stepName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-bangla">
                          {step.formula}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {step.intermediateValues}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-800 font-mono">
                          {typeof step.result === 'number' ? formatCurrency(step.result, lang) : step.result}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 font-bangla font-medium">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {step.sourceClause}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Row: Save to employee & Export buttons */}
          <div className="no-print bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-bangla flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>গেজেট এস. আর. ও. নং ৩৪৭-আইন/২০২৬ অনুচ্ছেদ ৫ এবং অনুচ্ছেদ ৯(২) মোতাবেক নির্ভুল হিসাব।</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-bangla">
              {selectedEmpId !== 'manual' && (
                <button
                  onClick={handleApplyToEmployee}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-lg transition shadow-xs cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{lang === 'bn' ? 'কর্মকর্তার প্রোফাইলে সংরক্ষণ করুন' : 'Save to Employee Profile'}</span>
                </button>
              )}

              <button
                onClick={handleExportPDF}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>

              <button
                onClick={handleExportDocx}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>DOCX</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="no-print p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-bangla flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>কর্মকর্তার বেতন নির্ধারণী সফলভাবে ডেটাবেজে সংরক্ষিত হয়েছে!</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL PAY FIXATION STATEMENT (A4 Certificate Format)         */}
      {/* ========================================================================= */}
      {clientCalc && (
        <div
          id="official-printable-fixation-sheet"
          className="printable-statement bg-white rounded-xl border border-slate-300 p-6 md:p-8 shadow-xs max-w-4xl mx-auto font-bangla text-slate-900"
        >
          {/* Official Header */}
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
                  অর্থ বিভাগ, অর্থ মন্ত্রণালয় | বাস্তবায়ন অনুবিভাগ
                </p>
              </div>
            </div>
            <h4 className="text-lg font-black text-emerald-950 mt-1 uppercase">
              নতুন জাতীয় বেতনস্কেল ২০২৬ এ বেতন নির্ধারণী বিবরণী
            </h4>
            <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-600 mt-1 font-mono">
              <span>গেজেট প্রজ্ঞাপন: এস. আর. ও. নং ৩৪৭-আইন/২০২৬</span>
              <span>•</span>
              <span>কার্যকর তারিখ: ০১ জুলাই ২০২৬</span>
            </div>
          </div>

          {/* Employee Info - Official Particulars Card */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 mb-4 text-xs font-bangla">
            <div className="text-[11px] font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2.5 flex items-center justify-between">
              <span>কর্মকর্তা / কর্মচারীর ব্যক্তিগত ও দাপ্তরিক বিবরণী (Official Particulars):</span>
              <span className="font-mono text-slate-500 font-normal">কোড: {employeeCode}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-slate-500 block text-[10px]">কর্মকর্তা/কর্মচারীর নাম:</span>
                <span className="font-bold text-slate-900 block">{employeeName}</span>
                {nameEnglish && <span className="text-[10px] text-slate-600 block font-sans">{nameEnglish}</span>}
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">পরিচিতি কোড ও NID:</span>
                <span className="font-mono font-bold text-slate-900 block">{employeeCode}</span>
                <span className="font-mono text-slate-700 block text-[10px]">NID: {nid || 'রেকর্ড করা হয়নি'}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">পদবি ও দপ্তর:</span>
                <span className="font-semibold text-slate-900 block">{designation}</span>
                <span className="text-[10px] text-slate-600 block">{department}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">মন্ত্রণালয় ও ক্যাডার:</span>
                <span className="font-medium text-slate-900 block">{ministry}</span>
                <span className="text-[10px] text-slate-600 block">{cadre} ({grade <= 9 ? '১ম শ্রেণি' : '২য়/৩য় শ্রেণি'})</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">জন্ম ও যোগদানের তারিখ:</span>
                <span className="font-mono text-slate-800 text-[11px] block">
                  জন্ম: {dateOfBirth ? toBanglaNum(dateOfBirth) : '-'}
                </span>
                <span className="font-mono text-slate-600 text-[10px] block">
                  যোগদান: {joiningDate ? toBanglaNum(joiningDate) : '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">ব্যাংক হিসাব ও শাখা:</span>
                <span className="text-slate-900 font-medium truncate block">{bankName}</span>
                <span className="font-mono text-slate-600 text-[10px] truncate block">
                  {bankAccount ? `হিসাব: ${bankAccount}` : (branchName || '-')}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">জিপিএফ হিসাব ও যোগাযোগ:</span>
                <span className="font-mono font-bold text-emerald-900 block">{gpfAccountNumber || '-'}</span>
                <span className="font-mono text-slate-600 text-[10px] block">{mobile || '-'}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">নির্ধারিত গ্রেড ও স্কেল:</span>
                <span className="font-bold text-emerald-950 block">{toBanglaNum(grade)}ম গ্রেড</span>
                <span className="text-[10px] text-emerald-800 font-medium block">
                  ২০১৫ আহরিত: ৳{toBanglaNum(drawnBasic.toLocaleString('en-IN'))}
                </span>
              </div>
            </div>
          </div>

          {/* Fixation Steps Table */}
          <table className="w-full text-xs border border-slate-400 mb-4">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-900">
                <th className="p-2 border-r border-slate-400 w-12 text-center">ক্রম</th>
                <th className="p-2 border-r border-slate-400 text-left">বিবরণ</th>
                <th className="p-2 border-r border-slate-400 text-left">হিসাবের ভিত্তি / সূত্র</th>
                <th className="p-2 text-right">টাকা (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="p-2 border-r border-slate-300 text-center font-mono">১</td>
                <td className="p-2 border-r border-slate-300 font-semibold">৩০ জুন ২০২৬ তারিখে আহরিত মূল বেতন</td>
                <td className="p-2 border-r border-slate-300">২০১৫ বেতনস্কেলের মূল বেতন</td>
                <td className="p-2 text-right font-mono font-bold">৳{toBanglaNum(clientCalc.drawnBasic2015.toLocaleString('en-IN'))}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 text-center font-mono">২</td>
                <td className="p-2 border-r border-slate-300">২০১৫ স্কেলের প্রারম্ভিক বেতন হইতে ব্যবধান</td>
                <td className="p-2 border-r border-slate-300 font-mono">
                  ৳{toBanglaNum(clientCalc.drawnBasic2015.toLocaleString('en-IN'))} - ৳{toBanglaNum(clientCalc.startingBasic2015.toLocaleString('en-IN'))}
                </td>
                <td className="p-2 text-right font-mono font-medium">৳{toBanglaNum(clientCalc.difference2015.toLocaleString('en-IN'))}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 text-center font-mono">৩</td>
                <td className="p-2 border-r border-slate-300">২০২৬ স্কেলের প্রারম্ভিক বেতনের সাথে ব্যবধান যোগ</td>
                <td className="p-2 border-r border-slate-300 font-mono">
                  ৳{toBanglaNum(clientCalc.startingBasic2026.toLocaleString('en-IN'))} + ৳{toBanglaNum(clientCalc.difference2015.toLocaleString('en-IN'))}
                </td>
                <td className="p-2 text-right font-mono font-medium">৳{toBanglaNum(clientCalc.theoreticalSum.toLocaleString('en-IN'))}</td>
              </tr>
              <tr className="bg-emerald-50/70 font-bold border-t-2 border-slate-400">
                <td className="p-2 border-r border-slate-300 text-center font-mono text-emerald-900">৪</td>
                <td className="p-2 border-r border-slate-300 text-emerald-950 font-bold">
                  ০১ জুলাই ২০২৬ তারিখে নির্ধারিত মূল বেতন
                  <span className="block text-[10px] text-slate-600 font-normal">
                    {clientCalc.ruleAppliedBangla} (ধাপ #{toBanglaNum(clientCalc.stageIndex + 1)})
                  </span>
                </td>
                <td className="p-2 border-r border-slate-300 text-emerald-900">গেজেট অনুচ্ছেদ ৫(খ)(আ)</td>
                <td className="p-2 text-right font-mono text-sm font-black text-emerald-900">
                  ৳{toBanglaNum(clientCalc.fixedBasic2026.toLocaleString('en-IN'))}
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-300 text-center font-mono">৫</td>
                <td className="p-2 border-r border-slate-300 font-semibold">
                  ০১ জুলাই ২০২৬ তারিখের বার্ষিক বেতনবৃদ্ধি (ইনক্রিমেন্ট)
                  <span className="block text-[10px] text-sky-800 font-normal">
                    {clientCalc.section9Increment
                      ? `অনুচ্ছেদ ৯(২) সংবিধিবদ্ধ হার: ${clientCalc.section9Increment.statutoryRateBangla} (${clientCalc.section9Increment.rateTierNameBangla}) — পরবর্তী ধাপ #${toBanglaNum(clientCalc.stageIndex + 2)}`
                      : `পরবর্তী ধাপ #${toBanglaNum(clientCalc.stageIndex + 2)}`}
                  </span>
                </td>
                <td className="p-2 border-r border-slate-300">
                  {clientCalc.section9Increment?.statutoryClause || 'গেজেট অনুচ্ছেদ ৯(২)'}
                </td>
                <td className="p-2 text-right font-mono font-bold text-sky-800">
                  +৳{toBanglaNum(clientCalc.annualIncrementAmount.toLocaleString('en-IN'))}
                </td>
              </tr>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                <td className="p-2 border-r border-slate-300 text-center font-mono">৬</td>
                <td className="p-2 border-r border-slate-300 font-bold text-slate-900" colSpan={2}>
                  ০১ জুলাই ২০২৬ তারিখে ইনক্রিমেন্টসহ প্রাপ্য মূল বেতন:
                </td>
                <td className="p-2 text-right font-mono text-sm font-black text-slate-950">
                  ৳{toBanglaNum(clientCalc.basicWithJuly2026Increment.toLocaleString('en-IN'))}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount In Words */}
          <div className="bg-slate-50 border border-slate-300 p-2.5 rounded text-xs mb-3 font-semibold">
            <span className="text-slate-600">নির্ধারিত মূল বেতন কথায়: </span>
            <span className="text-emerald-950">{numberToBanglaWords(clientCalc.fixedBasic2026)} টাকা মাত্র।</span>
          </div>

          {/* Incremental Pay Scale Stage Tier & Position Box */}
          {clientCalc.scaleStageTier && (
            <div className="bg-slate-50 border border-slate-300 rounded p-2.5 mb-2 text-xs">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-700">
                  ইনক্রিমেন্টাল পে স্কেলের স্তর ও কর্মচারীর অবস্থান:
                </span>
                <span className="text-emerald-950 font-bold">
                  {clientCalc.scaleStageTier.currentTierName} (ধাপ #{toBanglaNum(clientCalc.scaleStageTier.stageNumber)} / মোট {toBanglaNum(clientCalc.scaleStageTier.totalStagesInGrade)} ধাপ)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {clientCalc.scaleStageTier.currentTier === 1 && 'স্কেলের প্রারম্ভিক স্তর (অনুচ্ছেদ ৫(ক)) — প্রবেশ ধাপে সমতুল্য বেতন কার্যকর।'}
                {clientCalc.scaleStageTier.currentTier === 2 && `ইনক্রিমেন্টাল প্রবৃদ্ধি স্তর (অনুচ্ছেদ ৫(খ) ও ৯(২)) — ১ জুলাই ২০২৬ তারিখে পরবর্তী ধাপের নিয়মিত বেতনবৃদ্ধি প্রাপ্য।`}
                {clientCalc.scaleStageTier.currentTier === 3 && 'স্কেলের সর্বোচ্চ সিলিং স্তর (অনুচ্ছেদ ৯(৩)) — ১ বছর অবস্থানের পর ৫% হারে ব্যক্তিগত স্থবিরতা বেতনবৃদ্ধি প্রাপ্য।'}
              </div>
            </div>
          )}

          {/* Section 9 Incremental Rate & Tier Box */}
          {clientCalc.section9Increment && (
            <div className="bg-sky-50/60 border border-sky-300 rounded p-2.5 mb-3 text-xs">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-sky-950 font-bold">
                  অনুচ্ছেদ ৯ অনুসারে সংবিধিবদ্ধ বার্ষিক ইনক্রিমেন্ট হার ও ধাপ:
                </span>
                <span className="text-sky-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-sky-200">
                  {clientCalc.section9Increment.statutoryRateBangla} ({clientCalc.section9Increment.rateTierNameBangla})
                </span>
              </div>
              <div className="text-[10px] text-sky-800 mt-1">
                {clientCalc.section9Increment.explanationBangla}
              </div>
            </div>
          )}

          {/* Disbursement Schedule Table (Clause 1(3) Linked with Clause 9(2) Increment) */}
          {clientCalc.disbursementStages && (
            <div className="mb-6">
              <div className="text-[11px] font-bold text-slate-900 mb-1 flex items-center justify-between">
                <span>বাস্তবায়নের ৩টি পর্যায়ে স্কেল পার্থক্যের প্রদেয় অংশ ও মাসিক প্রদেয় মূল বেতন (অনুচ্ছেদ ১(৩) ও ৯(২)):</span>
                <span className="text-[10px] text-sky-900 font-mono font-semibold">
                  নির্ধারিত বেতন + ১টি ইনক্রিমেন্ট = ৳{toBanglaNum(clientCalc.basicWithJuly2026Increment.toLocaleString('en-IN'))} | মোট পার্থক্য: ৳{toBanglaNum((clientCalc.basicWithJuly2026Increment - drawnBasic).toLocaleString('en-IN'))}
                </span>
              </div>
              <table className="w-full text-xs border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-800 text-center">
                    <th className="p-1.5 border-r border-slate-400">পর্যায় / স্তর</th>
                    <th className="p-1.5 border-r border-slate-400">সময়কাল</th>
                    <th className="p-1.5 border-r border-slate-400">প্রদেয় হার</th>
                    <th className="p-1.5 border-r border-slate-400 text-right">ইনক্রিমেন্টসহ মোট স্কেল পার্থক্য</th>
                    <th className="p-1.5 border-r border-slate-400 text-right text-emerald-900">স্কেল পার্থক্যের প্রদেয় অংশ</th>
                    <th className="p-1.5 text-right font-black text-slate-900 bg-emerald-50/70">মাসিক প্রদেয় মূল বেতন</th>
                    <th className="p-1.5 border-l border-slate-400 text-center">গেজেট বিধি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-800">
                  {clientCalc.disbursementStages.map((stg) => (
                    <tr key={stg.stageNumber} className={stg.stageNumber === 3 ? 'bg-emerald-50/60 font-bold' : ''}>
                      <td className="p-1.5 border-r border-slate-300 text-center font-mono font-bold">
                        {toBanglaNum(stg.stageNumber)}য় পর্যায়
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center">{stg.periodBangla}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center font-mono font-bold">{toBanglaNum(stg.percentage)}%</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        ৳{toBanglaNum(stg.totalDifferenceWithIncrement.toLocaleString('en-IN'))}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-emerald-800">
                        +৳{toBanglaNum(stg.monthlyDisbursedDiff.toLocaleString('en-IN'))}
                        <span className="text-[9px] text-slate-500 block">
                          (মোট পার্থক্যের {toBanglaNum(stg.percentage)}%)
                        </span>
                      </td>
                      <td className="p-1.5 text-right font-mono font-black text-emerald-950 bg-emerald-50/40 text-sm">
                        ৳{toBanglaNum(stg.monthlyBasicPayable.toLocaleString('en-IN'))}
                        <span className="text-[9px] text-slate-500 font-normal block">
                          (আহরিত ৳{toBanglaNum(drawnBasic.toLocaleString('en-IN'))} + প্রদেয় ৳{toBanglaNum(stg.monthlyDisbursedDiff.toLocaleString('en-IN'))})
                        </span>
                      </td>
                      <td className="p-1.5 border-l border-slate-300 text-center text-[10px] text-slate-600 font-mono">
                        {stg.sourceClause}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-1 text-[10px] text-slate-500 leading-tight">
                * বিধি স্পষ্টীকরণ: নির্ধারিত বেতনের সাথে ০১ জুলাই ২০২৬ এর ১টি বার্ষিক ইনক্রিমেন্ট যোগ করিয়া মোট স্কেল পার্থক্য (৳{toBanglaNum((clientCalc.basicWithJuly2026Increment - drawnBasic).toLocaleString('en-IN'))}) নির্ধারণ করা হইয়াছে। অতঃপর অনুচ্ছেদ ১(৩) অনুসারে উক্ত পার্থক্যের {grade <= 9 ? '৪০% / ৭০% / ১০০%' : '৫০% / ৭৫% / ১০০%'} অংশ ২০১৫ স্কেলের আহরিত মূল বেতনের সাথে যোগ করিয়া পর্যায়ভিত্তিক মাসিক প্রদেয় মূল বেতন চূড়ান্ত করা হইয়াছে।
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs pt-8 border-t border-slate-300">
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                বিল সহকারী / যাচাইকারী
              </div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও সীল</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                হিসাবরক্ষণ কর্মকর্তা
              </div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও সীল</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                নিয়ন্ত্রণকারী কর্তৃপক্ষ / ডিডিও
              </div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও অফিসিয়াল সীল</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
