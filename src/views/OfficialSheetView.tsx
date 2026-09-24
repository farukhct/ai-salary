import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck,
  Printer,
  Download,
  Building2,
  CheckCircle,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';
import { Employee, Language } from '../types.ts';
import { formatCurrency, toBanglaNum, triggerPrint, exportFixationToPDF } from '../utils/formatters.ts';
import { calculateSimpleFixationClient } from '../utils/payscaleData.ts';

interface OfficialSheetViewProps {
  lang: Language;
}

export const OfficialSheetView: React.FC<OfficialSheetViewProps> = ({ lang }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data.length > 0) {
          setEmployees(json.data);
          setSelectedEmp(json.data[0]);
        }
      })
      .catch(console.error);
  }, []);

  const fixation = useMemo(() => {
    if (!selectedEmp) return null;
    const drawn = selectedEmp.previousBasicPay || selectedEmp.currentBasicPay;
    return calculateSimpleFixationClient(selectedEmp.grade, drawn);
  }, [selectedEmp]);

  const handleExportPdf = () => {
    if (!selectedEmp) return;
    const headers = ["Serial", "Description / Parameter", "Details / Value", "Rule Citation"];
    const rows = [
      ["1", "Employee Name (বাংলা ও ইংরেজি)", `${selectedEmp.nameBangla} ${selectedEmp.nameEnglish ? `(${selectedEmp.nameEnglish})` : ''}`, "সংরক্ষিত ডাটাবেজ"],
      ["2", "Employee Code & NID", `কোড: ${selectedEmp.employeeCode} | NID: ${selectedEmp.nid || 'N/A'}`, "সরকারি পরিচয়পত্র"],
      ["3", "Designation & Dept", `${selectedEmp.currentDesignation}, ${selectedEmp.department} (${selectedEmp.ministry})`, "বর্তমান কর্মস্থল"],
      ["4", "Cadre & Category", `${selectedEmp.cadre} (${selectedEmp.grade <= 9 ? '১ম শ্রেণি' : '২য়/৩য় শ্রেণি'})`, "সার্ভিস বুক"],
      ["5", "Date of Birth & Joining", `জন্ম: ${selectedEmp.dateOfBirth || '-'} | যোগদান: ${selectedEmp.joiningDate || '-'}`, "চাকরির বিবরণ"],
      ["6", "Bank & GPF Account", `${selectedEmp.bankName || 'সোনালী ব্যাংক'} (${selectedEmp.bankAccount || '-'}) | GPF: ${selectedEmp.gpfAccountNumber || '-'}`, "ইলেকট্রনিক ফান্ড ট্রান্সফার"],
      ["7", "Grade & Scale", `Grade ${selectedEmp.grade} (${toBanglaNum(selectedEmp.grade)}ম গ্রেড)`, "অনুচ্ছেদ ৩"],
      ["8", "Basic Pay (30 June 2026)", `Tk. ${(selectedEmp.previousBasicPay || selectedEmp.currentBasicPay).toLocaleString('en-IN')}`, "স্কেল ২০১৫"],
      ["9", "Fixed Basic Pay 2026", `Tk. ${(fixation?.fixedBasic2026 || selectedEmp.currentBasicPay).toLocaleString('en-IN')}`, "অনুচ্ছেদ ৫(খ)"],
      ["10", "July 1, 2026 Increment", `+Tk. ${(fixation?.annualIncrementAmount || 0).toLocaleString('en-IN')}`, "অনুচ্ছেদ ৯(২)"],
      ["11", "Basic With July 1 Increment", `Tk. ${(fixation?.basicWithJuly2026Increment || selectedEmp.currentBasicPay).toLocaleString('en-IN')}`, "অনুচ্ছেদ ৫ ও ৯"],
      ["12", "Phase 1 Disbursed Basic", `Tk. ${(fixation?.disbursementStages?.[0]?.monthlyBasicPayable || selectedEmp.currentBasicPay).toLocaleString('en-IN')}`, "অনুচ্ছেদ ১(৩)(ক)"],
      ["13", "Phase 2 Disbursed Basic", `Tk. ${(fixation?.disbursementStages?.[1]?.monthlyBasicPayable || selectedEmp.currentBasicPay).toLocaleString('en-IN')}`, "অনুচ্ছেদ ১(৩)(খ)"],
      ["14", "Phase 3 Full Payable Basic", `Tk. ${(fixation?.disbursementStages?.[2]?.monthlyBasicPayable || selectedEmp.currentBasicPay).toLocaleString('en-IN')}`, "অনুচ্ছেদ ১(৩)(গ)"],
      ["15", "Gazette S.R.O. Ref", "S.R.O. No. 347-Law/2026 (চাকরি আদেশ, ২০২৬)", "১৭ সেপ্টেম্বর ২০২৬"]
    ];
    exportFixationToPDF(`Official Pay Fixation Statement - ${selectedEmp.nameBangla} (${selectedEmp.employeeCode})`, headers, rows, `Pay_Fixation_${selectedEmp.employeeCode}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded font-bangla font-semibold mb-1">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>বাংলাদেশ সরকার প্রমিত বেতন নির্ধারণী ফরম</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'অফিসিয়াল বেতন নির্ধারণী বিবরণী (Pay Fixation Sheet)' : 'Official Pay Fixation Sheet'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla">
            {lang === 'bn'
              ? 'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর বিধি মোতাবেক সংরক্ষিত কর্মকর্তা ও কর্মচারীর তথ্যাদিসহ নির্ধারিত প্রমিত ফরম'
              : 'Standard official government fixation sheet with saved employee details for Accounts Officer approval & printing'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-bangla">
          {employees.length > 0 && (
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <select
                value={selectedEmp?.id || ''}
                onChange={(e) => {
                  const emp = employees.find(em => em.id === Number(e.target.value));
                  if (emp) setSelectedEmp(emp);
                }}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 cursor-pointer shadow-2xs"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameBangla} {emp.nameEnglish ? `(${emp.nameEnglish})` : ''} — {emp.currentDesignation} [{toBanglaNum(emp.grade)}ম গ্রেড]
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportPdf}
            disabled={!selectedEmp}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition font-bangla disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF ডাউনলোড</span>
          </button>

          <button
            onClick={triggerPrint}
            disabled={!selectedEmp}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition font-bangla disabled:opacity-50 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Printable Official Sheet */}
      {!selectedEmp ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs font-bangla">
          কোনো কর্মকর্তা সংরক্ষিত নেই।
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-300 p-8 shadow-xs max-w-4xl mx-auto printable-statement font-bangla text-slate-900 space-y-6">
          {/* Government Logo & Header */}
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center mx-auto mb-2 font-bold text-slate-800">
              <span>বিডি</span>
            </div>
            <h2 className="text-base font-bold tracking-tight">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h2>
            <h3 className="text-sm font-semibold text-slate-700">{selectedEmp.ministry}</h3>
            <p className="text-xs text-slate-600">{selectedEmp.department}</p>
            <p className="text-[11px] text-slate-500">www.mof.gov.bd</p>
          </div>

          {/* Subject & Reference */}
          <div className="text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>স্মারক নং: ০৭.০০.০০০০.১৪১.২২.০০১.২৬-</span>
              <span className="font-mono">তারিখ: ১৭/০৯/২০২৬</span>
            </div>
            <div className="font-bold pt-2 text-slate-900 text-sm">
              বিষয়: চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর অনুচ্ছেদ ৫ মোতাবেক বেতন নির্ধারণ ও অনুমোদন।
            </div>
            <div className="text-slate-600 text-[11px]">
              সূত্র: অর্থ বিভাগ, অর্থ মন্ত্রণালয় এর প্রজ্ঞাপন এস. আর. ও. নং ৩৪৭-আইন/২০২৬, তারিখ: ১৭ সেপ্টেম্বর ২০২৬ খ্রি.
            </div>
          </div>

          {/* Statement Table */}
          <div className="border border-slate-400 rounded-xs overflow-hidden">
            <table className="w-full text-left text-xs divide-y divide-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-900">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">ক্রমিক</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">বিবরণ</th>
                  <th className="py-2.5 px-3">তথ্য ও সরকারি রেকর্ড</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">১</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">কর্মকর্তা/কর্মচারীর নাম (বাংলা ও ইংরেজি)</td>
                  <td className="py-2 px-3 font-bold">
                    {selectedEmp.nameBangla}
                    {selectedEmp.nameEnglish && <span className="ml-2 font-normal text-slate-600 font-sans">({selectedEmp.nameEnglish})</span>}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">২</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">পরিচিতি নম্বর (Employee Code) ও NID</td>
                  <td className="py-2 px-3 font-mono">
                    <span className="font-bold">{selectedEmp.employeeCode}</span>
                    <span className="ml-3 text-slate-600">NID: {selectedEmp.nid || 'রেকর্ড নেই'}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">৩</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">পদবি ও বর্তমান কর্মস্থল</td>
                  <td className="py-2 px-3">{selectedEmp.currentDesignation}, {selectedEmp.department}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">৪</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">মন্ত্রণালয় ও ক্যাডার/শ্রেণি</td>
                  <td className="py-2 px-3">{selectedEmp.ministry} — {selectedEmp.cadre} ({selectedEmp.grade <= 9 ? '১ম শ্রেণি' : '২য়/৩য় শ্রেণি'})</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">৫</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">জন্ম তারিখ ও চাকরিতে যোগদানের তারিখ</td>
                  <td className="py-2 px-3 font-mono text-slate-800">
                    জন্ম: {selectedEmp.dateOfBirth ? toBanglaNum(selectedEmp.dateOfBirth) : '-'} | যোগদান: {selectedEmp.joiningDate ? toBanglaNum(selectedEmp.joiningDate) : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">৬</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">ব্যাংক হিসাব ও শাখা</td>
                  <td className="py-2 px-3">
                    {selectedEmp.bankName || 'সোনালী ব্যাংক পিএলসি'} ({selectedEmp.branchName || 'সচিবালয় কর্পোরেট শাখা'})
                    {selectedEmp.bankAccount && <span className="ml-2 font-mono font-bold">হিসাব: {selectedEmp.bankAccount}</span>}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">৭</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">জিপিএফ হিসাব ও মোবাইল নম্বর</td>
                  <td className="py-2 px-3 font-mono">
                    <span className="font-bold text-emerald-800">GPF: {selectedEmp.gpfAccountNumber || '-'}</span>
                    <span className="ml-3 text-slate-600">মোবাইল: {selectedEmp.mobile || '-'}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">৮</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">৩০ জুন ২০২৬ আহরিত মূল বেতন ও স্কেল (২০১৫)</td>
                  <td className="py-2 px-3 font-mono">
                    ৳{toBanglaNum((selectedEmp.previousBasicPay || selectedEmp.currentBasicPay).toLocaleString('en-IN'))} (গ্রেড {toBanglaNum(selectedEmp.grade)})
                  </td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">৯</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-bold text-emerald-900">
                    ১ জুলাই ২০২৬ নির্ধারিত নতুন মূল বেতন (অনুচ্ছেদ ৫)
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-800 text-sm">
                    ৳{toBanglaNum((fixation?.fixedBasic2026 || selectedEmp.currentBasicPay).toLocaleString('en-IN'))}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">১০</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">১ জুলাই ২০২৬ বার্ষিক বেতনবৃদ্ধি (অনুচ্ছেদ ৯(২))</td>
                  <td className="py-2 px-3 font-mono text-emerald-700 font-bold">
                    +৳{toBanglaNum((fixation?.annualIncrementAmount || 0).toLocaleString('en-IN'))}
                    <span className="ml-2 text-xs font-normal text-slate-600 font-bangla">
                      (ইনক্রিমেন্টসহ নির্ধারিত মূল বেতন: ৳{toBanglaNum((fixation?.basicWithJuly2026Increment || selectedEmp.currentBasicPay).toLocaleString('en-IN'))})
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">১১</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">নির্ধারিত বেতন ও ইনক্রিমেন্টসহ স্কেল পার্থক্য</td>
                  <td className="py-2 px-3 font-mono text-amber-800 font-bold">
                    +৳{toBanglaNum(Math.max(0, (fixation?.basicWithJuly2026Increment || selectedEmp.currentBasicPay) - (selectedEmp.previousBasicPay || selectedEmp.currentBasicPay)).toLocaleString('en-IN'))}
                  </td>
                </tr>
                <tr className="bg-sky-50/50">
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">১২</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold text-sky-950">
                    বাস্তবায়ন পর্যায় মোতাবেক প্রদেয় মাসিক মূল বেতন (অনুচ্ছেদ ১(৩))
                  </td>
                  <td className="py-2 px-3 text-slate-800">
                    {fixation?.disbursementStages ? (
                      <div className="space-y-1 font-mono text-xs">
                        {fixation.disbursementStages.map(ds => (
                          <div key={ds.stageNumber} className="flex items-center justify-between">
                            <span>পর্যায় {toBanglaNum(ds.stageNumber)} ({toBanglaNum(ds.percentage)}% পার্থক্য):</span>
                            <span className="font-bold text-emerald-900">৳{toBanglaNum(ds.monthlyBasicPayable.toLocaleString('en-IN'))}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span>স্বাভাবিক নিয়মে প্রযোজ্য</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-300 font-mono">১৩</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">বেতন কার্যকর হওয়ার তারিখ</td>
                  <td className="py-2 px-3 font-bold font-mono">০১ জুলাই ২০২৬ খ্রিষ্টাব্দ</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Certification text */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] leading-relaxed text-slate-700">
            <strong>প্রত্যয়ন:</strong> প্রত্যয়ন করা যাইতেছে যে, উপর্যুক্ত কর্মকর্তা/কর্মচারীর সংরক্ষিত দাপ্তরিক তথ্যাদি ও সার্ভিস রেকর্ডের আলোকে চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর বিধি ও প্রজ্ঞাপনের ধারা মোতাবেক নির্ভুলভাবে বেতন নির্ধারণ করা হইয়াছে। ভবিষ্যতে কোনো অতিরিক্ত বা অসঙ্গত অর্থ পরিশোধিত হইলে তাহা সমন্বয় বা ফেরতযোগ্য হইবে।
          </div>

          {/* Official Signature Lines */}
          <div className="pt-16 grid grid-cols-3 text-center text-xs text-slate-800 font-bangla">
            <div>
              <div className="border-t border-slate-400 pt-1 w-36 mx-auto font-semibold">
                বিল প্রস্তুতকারী
              </div>
              <p className="text-[10px] text-slate-500">তারিখ: ....................</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 w-36 mx-auto font-semibold">
                হিসাবরক্ষণ কর্মকর্তা
              </div>
              <p className="text-[10px] text-slate-500">হিসাব মহানিয়ন্ত্রক কার্যালয়</p>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 w-36 mx-auto font-semibold">
                আয়ন-ব্যয়ন কর্মকর্তা
              </div>
              <p className="text-[10px] text-slate-500">পদবি ও সরকারি সিলমোহর</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
