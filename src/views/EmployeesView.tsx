import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  Download,
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { Employee, Language } from '../types.ts';
import { formatCurrency, toBanglaNum, exportToExcel } from '../utils/formatters.ts';

interface EmployeesViewProps {
  lang: Language;
  onSelectEmployeeForFixation?: (emp: Employee) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ lang, onSelectEmployeeForFixation }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModalEmp, setHistoryModalEmp] = useState<any | null>(null);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeCode: '',
    nid: '',
    nameBangla: '',
    nameEnglish: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    joiningDate: '',
    currentDesignation: '',
    department: '',
    ministry: '',
    cadre: 'Non-Cadre',
    employeeType: 'Regular Government Employee',
    grade: 11,
    currentBasicPay: 13790,
    previousBasicPay: 13790,
    serviceStatus: 'Active',
    gender: 'Male',
    mobile: '',
    email: '',
    bankAccount: '',
    bankName: '',
    branchName: '',
    nomineeName: '',
    nomineeRelation: '',
    cityType: 'dhaka' as 'dhaka' | 'other_city_corporation' | 'other_areas',
    isGovtQuarterProvided: false,
    childrenCount: 1,
    remarks: ''
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      nid: '',
      nameBangla: '',
      nameEnglish: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: '1985-05-15',
      joiningDate: '2012-07-01',
      currentDesignation: 'সহকারী পরিচালক',
      department: 'অর্থ বিভাগ',
      ministry: 'অর্থ মন্ত্রণালয়',
      cadre: 'Non-Cadre',
      employeeType: 'Regular Government Employee',
      grade: 11,
      currentBasicPay: 13790,
      previousBasicPay: 13790,
      serviceStatus: 'Active',
      gender: 'Male',
      mobile: '',
      email: '',
      bankAccount: '',
      bankName: 'সোনালী ব্যাংক পিএলসি',
      branchName: 'সচিবালয় কর্পোরেট শাখা',
      nomineeName: '',
      nomineeRelation: '',
      cityType: 'dhaka',
      isGovtQuarterProvided: false,
      childrenCount: 1,
      remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      employeeCode: emp.employeeCode,
      nid: emp.nid || '',
      nameBangla: emp.nameBangla,
      nameEnglish: emp.nameEnglish || '',
      fatherName: emp.fatherName || '',
      motherName: emp.motherName || '',
      dateOfBirth: emp.dateOfBirth || '',
      joiningDate: emp.joiningDate || '',
      currentDesignation: emp.currentDesignation,
      department: emp.department,
      ministry: emp.ministry,
      cadre: emp.cadre,
      employeeType: emp.employeeType,
      grade: emp.grade,
      currentBasicPay: emp.currentBasicPay,
      previousBasicPay: emp.previousBasicPay || emp.currentBasicPay,
      serviceStatus: emp.serviceStatus,
      gender: emp.gender,
      mobile: emp.mobile,
      email: emp.email,
      bankAccount: emp.bankAccount,
      bankName: emp.bankName,
      branchName: emp.branchName,
      nomineeName: emp.nomineeName || '',
      nomineeRelation: emp.nomineeRelation || '',
      cityType: emp.cityType || 'dhaka',
      isGovtQuarterProvided: Boolean(emp.isGovtQuarterProvided),
      childrenCount: emp.childrenCount || 0,
      remarks: emp.remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(lang === 'bn' ? "আপনি কি নিশ্চিতভাবে এই কর্মকর্তা মুছে ফেলতে চান?" : "Are you sure you want to delete this employee?")) {
      return;
    }
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchEmployees();
      } else {
        alert(json.error || "Failed to delete employee");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchEmployees();
      } else {
        alert(json.error || "Failed to save employee");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewHistory = async (empId: number) => {
    try {
      const res = await fetch(`/api/employees/${empId}`);
      const json = await res.json();
      if (json.success) {
        setHistoryModalEmp(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const exportData = employees.map(e => ({
      "Employee Code": e.employeeCode,
      "Name (Bangla)": e.nameBangla,
      "Name (English)": e.nameEnglish,
      "Designation": e.currentDesignation,
      "Department": e.department,
      "Grade": e.grade,
      "Basic Pay": e.currentBasicPay,
      "Service Status": e.serviceStatus,
      "Mobile": e.mobile,
      "GPF A/C": e.gpfAccountNumber,
      "GPF Balance": e.gpfBalance || 0
    }));
    exportToExcel(exportData, 'Bangladesh_Govt_Employees_2026', 'Employees');
  };

  const filtered = employees.filter(e => {
    const matchSearch =
      e.nameBangla.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.currentDesignation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.nid && e.nid.includes(searchTerm));

    const matchGrade = gradeFilter === 'all' || e.grade === Number(gradeFilter);

    return matchSearch && matchGrade;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-bangla flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>{lang === 'bn' ? 'কর্মকর্তা ও কর্মচারী মাস্টার' : 'Employee Master Module'}</span>
          </h2>
          <p className="text-xs text-slate-500 font-bangla mt-0.5">
            {lang === 'bn'
              ? 'কর্মচারীদের তথ্যাদি, গ্রেড, বিদ্যমান মূল বেতন ও বেতন নির্ধারণী ইতিহাস সংরক্ষণ'
              : 'Manage employee profiles, current grades, and salary fixation history'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            disabled={employees.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition disabled:opacity-50 font-bangla"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'bn' ? 'এক্সেল এক্সপোর্ট' : 'Export Excel'}</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition font-bangla"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন কর্মকর্তা যোগ করুন' : 'Add Employee'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'নাম, আইডি, পদবি বা এনআইডি দ্বারা খুঁজুন...' : 'Search by name, ID, designation, NID...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bangla"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-medium text-slate-500 font-bangla">{lang === 'bn' ? 'গ্রেড ফিল্টার:' : 'Filter Grade:'}</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-bangla focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">{lang === 'bn' ? 'সকল গ্রেড' : 'All Grades'}</option>
            {Array.from({ length: 20 }, (_, i) => i + 1).map(g => (
              <option key={g} value={g}>
                {lang === 'bn' ? `${toBanglaNum(g)}ম গ্রেড` : `Grade ${g}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-bangla">
            {lang === 'bn' ? 'কোনো কর্মকর্তা বা কর্মচারী রেকর্ড পাওয়া যায়নি' : 'No Employee Records Found'}
          </h3>
          <p className="text-xs text-slate-500 font-bangla max-w-sm mx-auto mt-1">
            {lang === 'bn'
              ? 'নতুন কর্মচারী যোগ করতে ওপরের "নতুন কর্মকর্তা যোগ করুন" বাটনে ক্লিক করুন।'
              : 'Click "Add Employee" above to create an employee record.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bangla">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{lang === 'bn' ? 'আইডি ও এনআইডি' : 'Code & NID'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'কর্মকর্তার নাম' : 'Name'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'পদবি ও বিভাগ' : 'Designation & Dept'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'গ্রেড' : 'Grade'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'মূল বেতন' : 'Basic Pay'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'জিপিএফ স্থিতি' : 'GPF Balance'}</th>
                  <th className="py-3 px-4">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'bn' ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{emp.employeeCode}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.nid || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.nameBangla}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{emp.nameEnglish}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{emp.currentDesignation}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {lang === 'bn' ? `${toBanglaNum(emp.grade)}ম গ্রেড` : `Gr ${emp.grade}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800 font-mono">
                      {formatCurrency(emp.currentBasicPay, lang)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {formatCurrency(emp.gpfBalance || 0, lang)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        emp.serviceStatus === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {emp.serviceStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {onSelectEmployeeForFixation && (
                        <button
                          onClick={() => onSelectEmployeeForFixation(emp)}
                          title={lang === 'bn' ? 'বেতন নির্ধারণ করুন' : 'Fix Salary'}
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewHistory(emp.id)}
                        title={lang === 'bn' ? 'বেতন ইতিহাস' : 'Salary History'}
                        className="p-1 text-sky-600 hover:bg-sky-50 rounded"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-bangla">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingEmp
                  ? (lang === 'bn' ? 'কর্মকর্তার তথ্য সম্পাদনা' : 'Edit Employee')
                  : (lang === 'bn' ? 'নতুন কর্মকর্তা/কর্মচারী অন্তর্ভুক্তি' : 'Add New Employee')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'এমপ্লয়ি কোড *' : 'Employee Code *'}</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'জাতীয় পরিচয়পত্র (NID)' : 'National ID (NID)'}</label>
                  <input
                    type="text"
                    value={formData.nid}
                    onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'কর্মরত গ্রেড *' : 'Grade *'}</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(g => (
                      <option key={g} value={g}>{lang === 'bn' ? `${toBanglaNum(g)}ম গ্রেড` : `Grade ${g}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'নাম (বাংলা) *' : 'Name (Bangla) *'}</label>
                  <input
                    type="text"
                    required
                    value={formData.nameBangla}
                    onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'}</label>
                  <input
                    type="text"
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'বর্তমান পদবি' : 'Designation'}</label>
                  <input
                    type="text"
                    value={formData.currentDesignation}
                    onChange={(e) => setFormData({ ...formData, currentDesignation: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'মন্ত্রণালয়' : 'Ministry'}</label>
                  <input
                    type="text"
                    value={formData.ministry}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'বিভাগ/দপ্তর' : 'Department'}</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'বিদ্যমান মূল বেতন (৩০-০৬-২০২৬) *' : 'Basic Pay (30-06-2026) *'}</label>
                  <input
                    type="number"
                    required
                    value={formData.currentBasicPay}
                    onChange={(e) => setFormData({ ...formData, currentBasicPay: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'চাকরিতে যোগদানের তারিখ' : 'Joining Date'}</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'কর্মস্থল এলাকা (বাড়ি ভাড়ার জন্য)' : 'City Location (for House Rent)'}</label>
                  <select
                    value={formData.cityType}
                    onChange={(e) => setFormData({ ...formData, cityType: e.target.value as any })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="dhaka">{lang === 'bn' ? 'ঢাকা উত্তর ও দক্ষিণ সিটি' : 'Dhaka North/South'}</option>
                    <option value="other_city_corporation">{lang === 'bn' ? 'অন্যান্য সিটি কর্পোরেশন ও সাভার/কক্সবাজার' : 'Other City Corp & Savar'}</option>
                    <option value="other_areas">{lang === 'bn' ? 'অন্যান্য এলাকা (উপজেলা/গ্রাম)' : 'Other Areas'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{lang === 'bn' ? 'সন্তান সংখ্যা (শিক্ষা ভাতার জন্য)' : 'Children Count'}</label>
                  <input
                    type="number"
                    max={2}
                    min={0}
                    value={formData.childrenCount}
                    onChange={(e) => setFormData({ ...formData, childrenCount: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isGovtQuarterProvided}
                      onChange={(e) => setFormData({ ...formData, isGovtQuarterProvided: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{lang === 'bn' ? 'সরকারি বাসস্থান বরাদ্দপ্রাপ্ত' : 'Govt Quarter Provided'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {historyModalEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-bangla">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {lang === 'bn' ? 'বেতন ইতিহাস ও নির্ধারণী রেকর্ড' : 'Salary History & Fixation Trail'}
                </h3>
                <p className="text-xs text-slate-300">
                  {historyModalEmp.employee.nameBangla} ({historyModalEmp.employee.employeeCode})
                </p>
              </div>
              <button onClick={() => setHistoryModalEmp(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {historyModalEmp.history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  {lang === 'bn' ? 'এখনো কোনো বেতন পরিবর্তনের রেকর্ড নেই।' : 'No salary history records found.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {historyModalEmp.history.map((hist: any) => (
                    <div key={hist.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{hist.eventType}</span>
                        <span className="font-mono text-slate-500">{hist.eventDate}</span>
                      </div>
                      <div className="text-slate-600 flex justify-between">
                        <span>পূর্বতন মূল বেতন: {formatCurrency(hist.oldBasic, lang)}</span>
                        <span className="font-bold text-emerald-800">নতুন মূল বেতন: {formatCurrency(hist.newBasic, lang)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        রেফারেন্স: {hist.orderReference || 'এস. আর. ও. নং ৩৪৭-আইন/২০২৬'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
