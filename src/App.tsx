import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, TabType } from './components/Sidebar.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { EmployeesView } from './views/EmployeesView.tsx';
import { PayFixationView } from './views/PayFixationView.tsx';
import { ArrearsView } from './views/ArrearsView.tsx';
import { HouseRentView } from './views/HouseRentView.tsx';
import { SalaryCalculatorView } from './views/SalaryCalculatorView.tsx';
import { PensionView } from './views/PensionView.tsx';
import { GPFView } from './views/GPFView.tsx';
import { PayrollView } from './views/PayrollView.tsx';
import { OfficialSheetView } from './views/OfficialSheetView.tsx';
import { PayScaleMasterView } from './views/PayScaleMasterView.tsx';
import { AdminSqlView } from './views/AdminSqlView.tsx';
import { Employee, Language } from './types.ts';

export function App() {
  const [currentTab, setTab] = useState<TabType>('dashboard');
  const [lang, setLang] = useState<Language>('bn');
  const [selectedEmpForFixation, setSelectedEmpForFixation] = useState<Employee | null>(null);

  const handleSelectEmployeeForFixation = (emp: Employee) => {
    setSelectedEmpForFixation(emp);
    setTab('fixation');
  };

  const handlePreloadExamples = async () => {
    try {
      const res = await fetch('/api/employees/seed-examples', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Top Application Navbar */}
      <Navbar lang={lang} setLang={setLang} activeTab={currentTab} />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} setTab={setTab} lang={lang} />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                lang={lang}
                setTab={setTab}
                onPreloadExamples={handlePreloadExamples}
              />
            )}

            {currentTab === 'employees' && (
              <EmployeesView
                lang={lang}
                onSelectEmployeeForFixation={handleSelectEmployeeForFixation}
              />
            )}

            {currentTab === 'fixation' && (
              <PayFixationView
                lang={lang}
                selectedEmployee={selectedEmpForFixation}
                onFixationSaved={() => {}}
              />
            )}

            {currentTab === 'arrears' && (
              <ArrearsView lang={lang} />
            )}

            {currentTab === 'houseRent' && (
              <HouseRentView lang={lang} />
            )}

            {currentTab === 'salary' && (
              <SalaryCalculatorView lang={lang} />
            )}

            {currentTab === 'pension' && (
              <PensionView lang={lang} />
            )}

            {currentTab === 'gpf' && (
              <GPFView lang={lang} />
            )}

            {currentTab === 'payroll' && (
              <PayrollView lang={lang} />
            )}

            {currentTab === 'officialSheet' && (
              <OfficialSheetView lang={lang} />
            )}

            {currentTab === 'payscaleMaster' && (
              <PayScaleMasterView lang={lang} />
            )}

            {currentTab === 'adminSql' && (
              <AdminSqlView lang={lang} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
