import React, { useState, useEffect } from 'react';
import {
  TableProperties,
  Download,
  Printer,
  Search,
  Eye,
  X,
  Layers,
  Award
} from 'lucide-react';
import { GradeScale, Language } from '../types.ts';
import { formatCurrency, toBanglaNum, exportToExcel, triggerPrint } from '../utils/formatters.ts';

interface PayScaleMasterViewProps {
  lang: Language;
}

export const PayScaleMasterView: React.FC<PayScaleMasterViewProps> = ({ lang }) => {
  const [grades, setGrades] = useState<GradeScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<GradeScale | null>(null);

  useEffect(() => {
    fetch('/api/payscale/grades')
      .then(res => res.json())
      .then(json => {
        if (json.success) setGrades(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportExcel = () => {
    const rows = grades.map(g => ({
      "Grade": g.grade,
      "Name": g.gradeBangla,
      "Min Years Service": g.minYearsForFullPay || 'N/A',
      "2015 Starting": g.scale2015.startingBasic,
      "2015 Ending": g.scale2015.endingBasic,
      "2026 Starting": g.scale2026.startingBasic,
      "2026 Ending": g.scale2026.endingBasic,
      "2026 Stages Count": g.scale2026.stages.length
    }));
    exportToExcel(rows, 'National_Pay_Scale_2026_Master', 'Pay Scale 2026');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bangla font-semibold mb-1">
            <TableProperties className="w-3.5 h-3.5 text-emerald-600" />
            <span>গেজেট অনুচ্ছেদ ৩ ও তফসিল ১ বাস্তবায়ন</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'জাতীয় পে-স্কেল ২০২৬ সারণি (Pay Scale Master)' : 'National Pay Scale 2026 Master Table'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla">
            {lang === 'bn'
              ? 'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর ১ থেকে ২০তম গ্রেডের তুলনামূলক স্কেল ও প্রতিটি ধাপ'
              : 'Complete comparative schedules for Grades 1 through 20 under S.R.O. 347-Law/2026'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
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

      {/* Special Posts Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bangla text-xs">
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-emerald-400 font-semibold uppercase">বিশেষ নির্ধারিত পদ (Fixed Post)</span>
            <h4 className="text-sm font-bold text-white mt-0.5">মন্ত্রিপরিষদ সচিব ও মুখ্য সচিব</h4>
            <p className="text-xs text-slate-300 font-mono mt-0.5">নির্ধারিত মূল বেতন: ৳ ১,৭২,০০০ (২০১৫ স্কেলে: ৳ ৮৬,০০০)</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-sky-400 font-semibold uppercase">বিশেষ নির্ধারিত পদ (Fixed Post)</span>
            <h4 className="text-sm font-bold text-white mt-0.5">সিনিয়র সচিব</h4>
            <p className="text-xs text-slate-300 font-mono mt-0.5">নির্ধারিত মূল বেতন: ৳ ১,৬৪,০০০ (২০১৫ স্কেলে: ৳ ৮২,০০০)</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 font-bangla">
            {lang === 'bn' ? '১ম হইতে ২০তম গ্রেডের জাতীয় বেতনস্কেল সারণি' : 'Schedule of Grades 1 through 20'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">২০১৫ বনাম ২০২৬ স্কেল</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bangla">
            <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{lang === 'bn' ? 'গ্রেড নম্বর' : 'Grade'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'যোগ্য চাকরিকাল (পূর্ণ বেতন)' : 'Qualifying Service'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'জাতীয় বেতনস্কেল ২০১৫ (টাকা)' : 'Pay Scale 2015'}</th>
                <th className="py-3 px-4">{lang === 'bn' ? 'জাতীয় বেতনস্কেল ২০২৬ (টাকা)' : 'Pay Scale 2026'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'ধাপ সংখ্যা' : 'Stages'}</th>
                <th className="py-3 px-4 text-center">{lang === 'bn' ? 'ধাপসমূহ দেখুন' : 'View Stages'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {grades.map((g) => (
                <tr key={g.grade} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 font-bangla">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {lang === 'bn' ? `${toBanglaNum(g.grade)}ম গ্রেড` : `Grade ${g.grade}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-bangla">
                    {g.minYearsForFullPay ? `${toBanglaNum(g.minYearsForFullPay)} বছর` : 'প্রযোজ্য নয়'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {g.scale2015.startingBasic === g.scale2015.endingBasic
                      ? `${formatCurrency(g.scale2015.startingBasic, lang)} (নির্ধারিত)`
                      : `${formatCurrency(g.scale2015.startingBasic, lang)} - ${formatCurrency(g.scale2015.endingBasic, lang)}`}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-800 font-mono">
                    {g.scale2026.startingBasic === g.scale2026.endingBasic
                      ? `${formatCurrency(g.scale2026.startingBasic, lang)} (নির্ধারিত)`
                      : `${formatCurrency(g.scale2026.startingBasic, lang)} - ${formatCurrency(g.scale2026.endingBasic, lang)}`}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700 font-mono">
                    {toBanglaNum(g.scale2026.stages.length)} টি
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedGrade(g)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] font-bangla transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>সকল ধাপ</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage Breakdown Modal */}
      {selectedGrade && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-bangla">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold">
                  {lang === 'bn' ? `${toBanglaNum(selectedGrade.grade)}ম গ্রেডের সকল ধাপ (২০২৬ পে-স্কেল)` : `Grade ${selectedGrade.grade} Stages Breakdown`}
                </h3>
                <p className="text-xs text-slate-300">
                  {formatCurrency(selectedGrade.scale2026.startingBasic, lang)} হইতে {formatCurrency(selectedGrade.scale2026.endingBasic, lang)}
                </p>
              </div>
              <button onClick={() => setSelectedGrade(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs font-mono">
                {selectedGrade.scale2026.stages.map((stageAmt, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[10px] text-slate-400 font-bangla block">
                      ধাপ #{toBanglaNum(idx + 1)}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {formatCurrency(stageAmt, lang)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
