import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Download,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  Eye,
  X
} from 'lucide-react';
import { Language, PayrollRecord, PayrollDetailItem } from '../types.ts';
import { formatCurrency, toBanglaNum, exportToExcel, triggerPrint } from '../utils/formatters.ts';

interface PayrollViewProps {
  lang: Language;
}

export const PayrollView: React.FC<PayrollViewProps> = ({ lang }) => {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<{ record: PayrollRecord; items: PayrollDetailItem[] } | null>(null);
  const [processing, setProcessing] = useState(false);

  // Generate form
  const [salaryMonth, setSalaryMonth] = useState('2026-07');
  const [fiscalYear, setFiscalYear] = useState('2026-2027');

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payroll');
      const json = await res.json();
      if (json.success) {
        setPayrolls(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleRunPayroll = async () => {
    if (!window.confirm(lang === 'bn' ? `${salaryMonth} মাসের পেরোল প্রসেস করতে চান?` : `Run payroll for ${salaryMonth}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscalYear, salaryMonth })
      });
      const json = await res.json();
      if (json.success) {
        alert(lang === 'bn' ? "পেরোল সফলভাবে প্রক্রিয়াকরণ সম্পন্ন হয়েছে!" : "Payroll batch completed successfully!");
        fetchPayrolls();
      } else {
        alert(json.error || "Failed to process payroll");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/payroll/${id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedPayroll(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    if (!selectedPayroll) return;
    const rows = selectedPayroll.items.map(item => ({
      "Employee Code": item.employeeCode,
      "Name": item.nameBangla,
      "Designation": item.currentDesignation,
      "Grade": item.grade,
      "Basic Pay": item.basicPay,
      "House Rent": item.houseRent,
      "Medical Allowance": item.medicalAllowance,
      "Gross Salary": item.grossSalary,
      "GPF Deduction": item.gpfDeduction,
      "Tax": item.incomeTax,
      "Total Deductions": item.totalDeduction,
      "Net Payable Pay": item.netPay
    }));
    exportToExcel(rows, `Monthly_Payroll_${selectedPayroll.record.salaryMonth}`, 'Payroll Sheet');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bangla font-semibold mb-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>মাসিক স্বয়ংক্রিয় পেরোল ইঞ্জিন</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'মাসিক পেরোল প্রসেসিং ও বিবরণী' : 'Monthly Payroll Processing'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla">
            {lang === 'bn'
              ? 'সকল সক্রিয় কর্মচারীদের বেতন, বাড়ি ভাড়া, ভাতাদি ও জিপিএফ কর্তনসহ এক ক্লিকে স্বয়ংক্রিয় পেরোল'
              : 'One-click batch payroll processing with full allowances, statutory deductions, and EFT output'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 font-bangla">
          <input
            type="month"
            value={salaryMonth}
            onChange={(e) => setSalaryMonth(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded bg-white font-mono"
          />
          <button
            onClick={handleRunPayroll}
            disabled={processing}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{processing ? (lang === 'bn' ? 'প্রক্রিয়াকরণ চলছে...' : 'Processing...') : (lang === 'bn' ? 'পেরোল রান করুন' : 'Run Payroll Batch')}</span>
          </button>
        </div>
      </div>

      {/* Payroll History Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 font-bangla">
            {lang === 'bn' ? 'সম্পন্নকৃত মাসিক পেরোলের তালিকা' : 'Finalized Payroll Runs'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">SQLite Ledger</span>
        </div>

        {payrolls.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-bangla">
            {lang === 'bn'
              ? 'এখনো কোনো পেরোল রান করা হয়নি। ওপরের "পেরোল রান করুন" বাটনে ক্লিক করুন।'
              : 'No payroll records yet. Click "Run Payroll Batch" above.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bangla">
              <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">মাস ও অর্থবছর</th>
                  <th className="py-3 px-4 text-center">কর্মচারী সংখ্যা</th>
                  <th className="py-3 px-4">মোট মূল বেতন</th>
                  <th className="py-3 px-4">মোট ভাতাদি</th>
                  <th className="py-3 px-4">মোট কর্তন</th>
                  <th className="py-3 px-4 text-right">নিট পরিশোধযোগ্য</th>
                  <th className="py-3 px-4 text-center">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {p.salaryMonth} ({p.fiscalYear})
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {toBanglaNum(p.totalEmployees)} জন
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatCurrency(p.totalBasic, lang)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatCurrency(p.totalAllowances, lang)}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-700">
                      -{formatCurrency(p.totalDeductions, lang)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800 text-sm">
                      {formatCurrency(p.totalNet, lang)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewDetails(p.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>বিবরণী</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Payroll Detail Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-bangla">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold">
                  মাসিক পেরোল বিবরণী: {selectedPayroll.record.salaryMonth} ({selectedPayroll.record.fiscalYear})
                </h3>
                <p className="text-xs text-slate-300">
                  মোট কর্মচারী: {selectedPayroll.record.totalEmployees} জন | নিট পরিশোধ: {formatCurrency(selectedPayroll.record.totalNet, lang)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportExcel}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>এক্সেল এক্সপোর্ট</span>
                </button>
                <button
                  onClick={triggerPrint}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>প্রিন্ট</span>
                </button>
                <button onClick={() => setSelectedPayroll(null)} className="text-slate-400 hover:text-white pl-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">আইডি</th>
                    <th className="py-2.5 px-3">নাম ও পদবি</th>
                    <th className="py-2.5 px-3">গ্রেড</th>
                    <th className="py-2.5 px-3">মূল বেতন</th>
                    <th className="py-2.5 px-3">বাড়ি ভাড়া</th>
                    <th className="py-2.5 px-3">চিকিৎসা</th>
                    <th className="py-2.5 px-3">মোট প্রাপ্তি (Gross)</th>
                    <th className="py-2.5 px-3">জিপিএফ</th>
                    <th className="py-2.5 px-3 text-right">নিট বেতন (Net)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {selectedPayroll.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-600">{item.employeeCode}</td>
                      <td className="py-2 px-3 font-bangla">
                        <div className="font-semibold text-slate-900">{item.nameBangla}</div>
                        <div className="text-[10px] text-slate-500">{item.currentDesignation}</div>
                      </td>
                      <td className="py-2 px-3 font-bangla">{toBanglaNum(item.grade)}ম</td>
                      <td className="py-2 px-3">{formatCurrency(item.basicPay, lang)}</td>
                      <td className="py-2 px-3">{formatCurrency(item.houseRent, lang)}</td>
                      <td className="py-2 px-3">{formatCurrency(item.medicalAllowance, lang)}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{formatCurrency(item.grossSalary, lang)}</td>
                      <td className="py-2 px-3 text-rose-700">-{formatCurrency(item.gpfDeduction, lang)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-800">{formatCurrency(item.netPay, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
