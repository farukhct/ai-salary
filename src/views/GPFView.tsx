import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  TrendingUp,
  Download,
  Printer,
  X,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { GPFAccount, GPFTransaction, Language } from '../types.ts';
import { formatCurrency, toBanglaNum, exportToExcel, triggerPrint } from '../utils/formatters.ts';

interface GPFViewProps {
  lang: Language;
}

export const GPFView: React.FC<GPFViewProps> = ({ lang }) => {
  const [accounts, setAccounts] = useState<GPFAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<GPFAccount | null>(null);
  const [transactions, setTransactions] = useState<GPFTransaction[]>([]);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);

  // Transaction form
  const [transForm, setTransForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    transactionType: 'Subscription',
    credit: 2630,
    debit: 0,
    reference: 'Payroll July 2026',
    remarks: 'Monthly GPF subscription'
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gpf/accounts');
      const json = await res.json();
      if (json.success) {
        setAccounts(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSelectAccount = async (acc: GPFAccount) => {
    setSelectedAccount(acc);
    try {
      const res = await fetch(`/api/gpf/accounts/${acc.id}/transactions`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      const res = await fetch(`/api/gpf/accounts/${selectedAccount.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transForm)
      });
      const json = await res.json();
      if (json.success) {
        setIsTransModalOpen(false);
        handleSelectAccount(selectedAccount);
        fetchAccounts();
      } else {
        alert(json.error || "Failed to add transaction");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const rows = accounts.map(a => ({
      "Account No": a.gpfAccountNumber,
      "Employee": a.nameBangla,
      "Designation": a.currentDesignation,
      "Grade": a.grade,
      "Basic Pay": a.currentBasicPay,
      "Monthly Subscription": a.monthlySubscription,
      "Current Balance": a.currentBalance,
      "Interest Rate": `${a.interestRate}%`
    }));
    exportToExcel(rows, 'GPF_Accounts_Statement_2026', 'GPF Ledger');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bangla font-semibold mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
            <span>সাধারণ ভবিষ্য তহবিল (GPF) হিসাব লেজার</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-bangla">
            {lang === 'bn' ? 'ভবিষ্য তহবিল লেজার ও বার্ষিক সুদ ব্যবস্থাপনা' : 'General Provident Fund (GPF) Ledger'}
          </h2>
          <p className="text-xs text-slate-500 font-bangla">
            {lang === 'bn'
              ? 'কর্মচারীদের মাসিক জিপিএফ চাঁদা, ঋণ গ্রহণ, সমন্বয় এবং বার্ষিক ১১.৫% চক্রবৃদ্ধি সুদের হিসাব'
              : 'Track monthly employee subscriptions, advance withdrawals, and 11.5% annual compound interest'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            disabled={accounts.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition disabled:opacity-50 font-bangla"
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

      {/* Account List & Detail Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 font-bangla">
              {lang === 'bn' ? 'জিপিএফ হিসাবধারী কর্মচারীদের তালিকা' : 'GPF Account Holders'}
            </h3>
            <span className="text-xs text-slate-500 font-bangla">
              মোট: {accounts.length} টি হিসাব
            </span>
          </div>

          {accounts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-bangla">
              {lang === 'bn' ? 'কোনো সক্রিয় জিপিএফ হিসাব পাওয়া যায়নি।' : 'No active GPF accounts found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bangla">
                <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">হিসাব নম্বর</th>
                    <th className="py-2.5 px-3">কর্মকর্তার নাম</th>
                    <th className="py-2.5 px-3">মাসিক চাঁদা</th>
                    <th className="py-2.5 px-3 text-right">মোট স্থিতি</th>
                    <th className="py-2.5 px-3 text-center">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((acc) => (
                    <tr
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc)}
                      className={`cursor-pointer transition ${
                        selectedAccount?.id === acc.id ? 'bg-amber-50/80 font-semibold' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {acc.gpfAccountNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900">{acc.nameBangla}</div>
                        <div className="text-[10px] text-slate-500">{acc.currentDesignation}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {formatCurrency(acc.monthlySubscription, lang)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatCurrency(acc.currentBalance, lang)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAccount(acc);
                          }}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded"
                        >
                          লেজার
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Account Ledger Detail */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs font-bangla space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'bn' ? 'ব্যক্তিগত জিপিএফ বিবরণী' : 'GPF Ledger Detail'}
            </h3>
            {selectedAccount && (
              <button
                onClick={() => setIsTransModalOpen(true)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>লেনদেন যোগ</span>
              </button>
            )}
          </div>

          {!selectedAccount ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              বামে তালিকা হতে যেকোনো কর্মকর্তা নির্বাচন করুন।
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">হিসাব নম্বর:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAccount.gpfAccountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">নাম:</span>
                  <span className="font-bold text-slate-900">{selectedAccount.nameBangla}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">সুদের হার:</span>
                  <span className="font-mono font-bold text-amber-700">{selectedAccount.interestRate}% (চক্রবৃদ্ধি)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">বর্তমান মোট স্থিতি:</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {formatCurrency(selectedAccount.currentBalance, lang)}
                  </span>
                </div>
              </div>

              {/* Transactions list */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2">সাম্প্রতিক লেনদেনের ইতিহাস:</h4>
                {transactions.length === 0 ? (
                  <p className="text-slate-400 text-[11px] text-center py-3">এখনো কোনো লেনদেন লিপিবদ্ধ হয়নি।</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transactions.map(t => (
                      <div key={t.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{t.transactionType}</span>
                          <span className="font-mono text-emerald-800">
                            {t.credit > 0 ? `+${formatCurrency(t.credit, lang)}` : `-${formatCurrency(t.debit, lang)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>{t.reference}</span>
                          <span className="font-mono">{t.transactionDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isTransModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-bangla">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">জিপিএফ লেনদেন এন্ট্রি ({selectedAccount.gpfAccountNumber})</h3>
              <button onClick={() => setIsTransModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">তারিখ</label>
                <input
                  type="date"
                  required
                  value={transForm.transactionDate}
                  onChange={(e) => setTransForm({ ...transForm, transactionDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">লেনদেনের ধরন</label>
                <select
                  value={transForm.transactionType}
                  onChange={(e) => setTransForm({ ...transForm, transactionType: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Subscription">মাসিক চাঁদা (Subscription - Credit)</option>
                  <option value="Refund">ঋণ ফেরত জমা (Refund - Credit)</option>
                  <option value="Advance">অগ্রিম উত্তোলন (Advance - Debit)</option>
                  <option value="Interest">বার্ষিক সুদ প্রদান (Interest - Credit)</option>
                </select>
              </div>

              {transForm.transactionType !== 'Advance' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">জমার পরিমাণ (Credit Tk.)</label>
                  <input
                    type="number"
                    required
                    value={transForm.credit}
                    onChange={(e) => setTransForm({ ...transForm, credit: Number(e.target.value), debit: 0 })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">উত্তোলনের পরিমাণ (Debit Tk.)</label>
                  <input
                    type="number"
                    required
                    value={transForm.debit}
                    onChange={(e) => setTransForm({ ...transForm, debit: Number(e.target.value), credit: 0 })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">রেফারেন্স / বিল ভাউচার</label>
                <input
                  type="text"
                  value={transForm.reference}
                  onChange={(e) => setTransForm({ ...transForm, reference: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTransModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
