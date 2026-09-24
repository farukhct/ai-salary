import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Database,
  Terminal,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  FileCode,
  Layers,
  History
} from 'lucide-react';
import { AuditLog, Language } from '../types.ts';
import { exportToExcel } from '../utils/formatters.ts';

interface AdminSqlViewProps {
  lang: Language;
}

export const AdminSqlView: React.FC<AdminSqlViewProps> = ({ lang }) => {
  // SQL console state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM Employees LIMIT 10;');
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(json => {
        if (json.success) setAuditLogs(json.data);
      })
      .catch(console.error);
  }, []);

  const handleExecuteSql = async () => {
    setExecuting(true);
    setSqlError(null);
    setSqlResults(null);
    try {
      const res = await fetch('/api/sql/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });
      const json = await res.json();
      if (json.success) {
        setSqlResults(json.data);
      } else {
        setSqlError(json.error || "Query execution failed");
      }
    } catch (err: any) {
      setSqlError(err.message || "Failed to contact database");
    } finally {
      setExecuting(false);
    }
  };

  const handleDownloadSqlScript = () => {
    window.open('/api/sql/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-bangla font-semibold mb-1">
            <Terminal className="w-3.5 h-3.5 text-slate-600" />
            <span>এসকিউএল ডাটাবেজ কনসোল ও গেজেট বিধিমালা</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'গেজেট বিধিমালা ও এসকিউএল (SQL) কনসোল' : 'Gazette Rules & SQL Console'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla">
            {lang === 'bn'
              ? 'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর বিধি বিবরণী এবং ডাটাবেজ কুয়েরি ও ব্যাকআপ টুল'
              : 'Execute SQL queries, inspect database schema, and export full .sql database script'}
          </p>
        </div>

        <button
          onClick={handleDownloadSqlScript}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition font-bangla"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'bn' ? 'Database.sql স্ক্রিপ্ট ডাউনলোড' : 'Download Database.sql'}</span>
        </button>
      </div>

      {/* SQL Interactive Terminal */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold">SQLite Database Query Terminal</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSqlQuery('SELECT * FROM Employees;')}
              className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
            >
              Employees
            </button>
            <button
              onClick={() => setSqlQuery('SELECT * FROM PayGrades;')}
              className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
            >
              PayGrades
            </button>
            <button
              onClick={() => setSqlQuery('SELECT * FROM GPFAccounts;')}
              className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
            >
              GPFAccounts
            </button>
            <button
              onClick={() => setSqlQuery('SELECT * FROM AuditLogs ORDER BY id DESC LIMIT 20;')}
              className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono"
            >
              AuditLogs
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950">
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-slate-900 text-emerald-300 font-mono text-xs p-3 rounded border border-slate-800 focus:outline-none focus:border-emerald-500"
            placeholder="SELECT * FROM Employees;"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleExecuteSql}
              disabled={executing}
              className="inline-flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded font-mono transition"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{executing ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>
        </div>

        {/* Error or Results Display */}
        {sqlError && (
          <div className="p-4 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{sqlError}</span>
          </div>
        )}

        {sqlResults && (
          <div className="border-t border-slate-200 overflow-x-auto max-h-80">
            {sqlResults.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 font-mono">0 rows returned.</div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <tr>
                    {Object.keys(sqlResults[0]).map((col) => (
                      <th key={col} className="py-2 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sqlResults.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-3 text-slate-800 truncate max-w-xs">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Gazette S.R.O. 347/2026 Key Clauses Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs font-bangla space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ScrollText className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর গুরুত্বপূর্ণ অনুচ্ছেদসমূহ
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">অনুচ্ছেদ ১: সংক্ষিপ্ত শিরোনাম ও প্রবর্তন</span>
            <p className="text-slate-600">
              (২) ইহা ১ জুলাই ২০২৬ খ্রিষ্টাব্দ তারিখে কার্যকর হইয়াছে বলিয়া গণ্য হইবে। (৩) বেতনস্কেলের পার্থক্য দুই পর্যায়ে বকেয়াসহ পরিশোধিত হইবে (১ম পর্যায়: জুলাই-ডিসে ২০২৬ এবং ২য় পর্যায়: জানু-জুন ২০২৭)।
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">অনুচ্ছেদ ৫: বেতন নির্ধারণ (Pay Fixation)</span>
            <p className="text-slate-600">
              ৩০ জুন ২০২৬ তারিখে আহরিত মূল বেতন হইতে ২০১৫ স্কেলের প্রারম্ভিক মূল বেতন বিয়োগ করিয়া, প্রাপ্ত পার্থক্য ২০২৬ স্কেলের প্রারম্ভিক মূল বেতনের সহিত যোগ করিতে হইবে এবং প্রাপ্ত অংক ২০২৬ স্কেলের সমপরিমাণ বা পরবর্তী উচ্চতর ধাপে নির্ধারিত হইবে।
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">অনুচ্ছেদ ৬: ভাতাদি ও সুবিধাদি</span>
            <p className="text-slate-600">
              বাড়ি ভাড়া ভাতা তফসিল-২ অনুসারে এলাকাভেদে (ঢাকা ৫০-৬০%, অন্যান্য সিটি ৪০-৫০%, অন্যান্য এলাকা ৩৫-৪৫%)। চিকিৎসা ভাতা মাসিক ১,৫০০ টাকা। শিক্ষা সহায়তা ভাতা সন্তান প্রতি ১,০০০ টাকা (সর্বোচ্চ ২ সন্তান)।
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">অনুচ্ছেদ ৮: অবসরোত্তর সুবিধা ও পেনশন</span>
            <p className="text-slate-600">
              পেনশনারদের নিট পেনশনের সারণি অনুসারে ২৫% হইতে ৫০% পর্যন্ত বৃদ্ধি এবং বয়সানুসারে মাসিক ৩,০০০ হইতে ৬,০০০ টাকা চিকিৎসা ভাতা প্রদান।
            </p>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bangla">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">সিস্টেম অডিট ও নিরাপত্তা লগ (Audit Logs)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">SQLite Audit Trail</span>
        </div>

        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 px-3">Record ID</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-1.5 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">{log.action}</td>
                  <td className="py-1.5 px-3 text-slate-600">{log.entity}</td>
                  <td className="py-1.5 px-3 text-slate-600">{log.recordId}</td>
                  <td className="py-1.5 px-3 text-slate-600">{log.username}</td>
                  <td className="py-1.5 px-3 text-slate-700 truncate max-w-sm">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
