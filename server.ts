/**
 * Server Entry Point - Express + Vite + SQLite
 * Smart Pay Scale 2026 - Government of Bangladesh
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getDatabase, saveDatabase, generateSqlScript } from './server/database.ts';
import { OFFICIAL_PAY_SCALES, OFFICIAL_PENSION_INCREASE_SLABS, OFFICIAL_DOC_REFERENCES } from './server/payscaleData.ts';
import { PayFixationEngine, PayFixationRequest, AllowanceInputs, PensionCalculationInputs, DeductionInputs } from './server/rulesEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Initialize SQL database
  const db = await getDatabase();

  // -------------------------------------------------------------
  // API ROUTES (Mounted BEFORE Vite middleware)
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      system: 'Smart Pay Scale 2026 Engine',
      gazette: 'S.R.O. No. 347-Law/2026',
      dbActive: !!db
    });
  });

  // Document References (Gazette Metadata)
  app.get('/api/document-references', (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM DocumentReferences ORDER BY id ASC");
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      res.json({ success: true, data: rows.length > 0 ? rows : OFFICIAL_DOC_REFERENCES });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Pay Scale Grades & Stages
  app.get('/api/payscale-grades', (req, res) => {
    try {
      res.json({
        success: true,
        version: 'NPS_2026',
        gazetteOrder: 'এস. আর. ও. নং ৩৪৭-আইন/২০২৬',
        grades: OFFICIAL_PAY_SCALES
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Pension Slabs
  app.get('/api/pension-slabs', (req, res) => {
    res.json({
      success: true,
      slabs: OFFICIAL_PENSION_INCREASE_SLABS
    });
  });

  // Pay Fixation Calculation
  app.post('/api/fixation/calculate', (req, res) => {
    try {
      const { grade, drawnBasic2015, advanceIncrementCount, effectiveDate } = req.body;
      if (!grade || !drawnBasic2015) {
        return res.status(400).json({ success: false, error: "grade and drawnBasic2015 are required." });
      }

      const result = PayFixationEngine.calculateFixation({
        grade: Number(grade),
        drawnBasic2015: Number(drawnBasic2015),
        advanceIncrementCount: advanceIncrementCount ? Number(advanceIncrementCount) : 0,
        effectiveDate: effectiveDate || "2026-07-01"
      });

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Arrears Calculation
  app.post('/api/arrears/calculate', (req, res) => {
    try {
      const {
        grade,
        drawnBasic2015,
        fixedBasic2026,
        location = 'dhaka',
        isGovtQuarter = false,
        stepNumber,
        customIncrementPct = 5,
        customSpecialBenefitPct = 15,
        july1BasicOverride
      } = req.body;
      if (!grade || !drawnBasic2015 || !fixedBasic2026) {
        return res.status(400).json({ success: false, error: "grade, drawnBasic2015, and fixedBasic2026 are required." });
      }

      const result = PayFixationEngine.calculateArrears(
        Number(grade),
        Number(drawnBasic2015),
        Number(fixedBasic2026),
        location,
        Boolean(isGovtQuarter),
        {
          stepNumber: stepNumber ? Number(stepNumber) : undefined,
          customIncrementPct: Number(customIncrementPct),
          customSpecialBenefitPct: Number(customSpecialBenefitPct),
          july1BasicOverride: july1BasicOverride ? Number(july1BasicOverride) : undefined
        }
      );

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Salary Calculation (Unified Allowances + Deductions + Full Pay Slip breakdown)
  app.post('/api/salary/calculate', (req, res) => {
    try {
      const {
        grade = 11,
        basicPay = 26300,
        age = 45,
        cityType = 'dhaka',
        isGovtQuarterProvided = false,
        childrenCount = 0,
        specialChildCount = 0,
        isEligibleTiffin = true,
        isEligibleConveyance = false,
        includeFestival = false,
        includeBoishakh = false,
        hasWashAllowance = false,
        hasCurrentCharge = false,
        hasHillAllowance = false,
        hasHaorAllowance = false,
        houseRentRule = '2015_statutory',
        gpfPercentage = 10,
        customGpfAmount,
        incomeTax = 0,
        groupInsurance = 0,
        benevolentFund = 0,
        otherDeductions = 0
      } = req.body;

      const allowanceInputs: AllowanceInputs = {
        grade: Number(grade),
        basicPay: Number(basicPay),
        age: Number(age),
        cityType,
        isGovtQuarterProvided: Boolean(isGovtQuarterProvided),
        childrenCount: Number(childrenCount),
        specialChildCount: Number(specialChildCount),
        isEligibleTiffin: isEligibleTiffin !== false,
        isEligibleConveyance: Boolean(isEligibleConveyance),
        isFestivalMonth: Boolean(includeFestival),
        isBoishakhMonth: Boolean(includeBoishakh),
        hasWashAllowance: Boolean(hasWashAllowance),
        hasCurrentCharge: Boolean(hasCurrentCharge),
        hasHillAllowance: Boolean(hasHillAllowance),
        hasHaorAllowance: Boolean(hasHaorAllowance),
        houseRentRule: houseRentRule === '2026_grade_based' ? '2026_grade_based' : '2015_statutory'
      };

      const allowanceResult = PayFixationEngine.calculateAllowances(allowanceInputs);

      const deductionInputs: DeductionInputs = {
        grossSalary: allowanceResult.grossSalary,
        basicPay: Number(basicPay),
        gpfPercentage: Number(gpfPercentage),
        customGpfAmount: customGpfAmount !== undefined ? Number(customGpfAmount) : undefined,
        incomeTax: Number(incomeTax),
        groupInsurance: Number(groupInsurance),
        benevolentFund: Number(benevolentFund),
        otherDeductions: Number(otherDeductions)
      };

      const deductionResult = PayFixationEngine.calculateDeductions(deductionInputs);

      res.json({
        success: true,
        data: {
          allowances: allowanceResult,
          deductions: deductionResult,
          basicPay: Number(basicPay),
          grossSalary: allowanceResult.grossSalary,
          totalAllowances: allowanceResult.totalAllowances,
          totalDeductions: deductionResult.totalDeductions,
          netSalary: deductionResult.netSalary
        }
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Allowances Calculation
  app.post('/api/allowances/calculate', (req, res) => {
    try {
      const allowanceInputs: AllowanceInputs = req.body;
      const allowanceResult = PayFixationEngine.calculateAllowances(allowanceInputs);

      // Also compute deductions if requested
      let deductionResult = null;
      if (req.body.calculateDeductions || req.body.gpfPercentage !== undefined) {
        const deductionInputs: DeductionInputs = {
          grossSalary: allowanceResult.grossSalary,
          basicPay: allowanceResult.basicPay,
          gpfPercentage: req.body.gpfPercentage || 10,
          customGpfAmount: req.body.customGpfAmount,
          incomeTax: req.body.incomeTax || 0,
          groupInsurance: req.body.groupInsurance || 0,
          benevolentFund: req.body.benevolentFund || 0,
          otherDeductions: req.body.otherDeductions || 0
        };
        deductionResult = PayFixationEngine.calculateDeductions(deductionInputs);
      }

      res.json({
        success: true,
        data: {
          ...allowanceResult,
          allowances: allowanceResult,
          deductions: deductionResult
        }
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Dedicated House Rent Allowance endpoint strictly implementing National Pay Scale 2015 Table (effective 1 July 2016)
  app.post('/api/house-rent/calculate', (req, res) => {
    try {
      const {
        basicSalary,
        location = 'dhaka',
        isGovtQuarter = false
      } = req.body;

      if (basicSalary === undefined || isNaN(Number(basicSalary))) {
        return res.status(400).json({ success: false, error: 'Valid basicSalary is required.' });
      }

      const basic = Number(basicSalary);
      const loc = (location === 'dhaka' || location === 'other_city_corporation' || location === 'other') ? location : 'dhaka';
      const quarter = Boolean(isGovtQuarter);

      const result = PayFixationEngine.calculateStatutoryHouseRent2015(basic, loc, quarter);
      const dhakaResult = PayFixationEngine.calculateStatutoryHouseRent2015(basic, 'dhaka', quarter);
      const otherCCResult = PayFixationEngine.calculateStatutoryHouseRent2015(basic, 'other_city_corporation', quarter);
      const otherAreasResult = PayFixationEngine.calculateStatutoryHouseRent2015(basic, 'other', quarter);

      res.json({
        success: true,
        data: {
          result,
          comparison: {
            basicSalary: basic,
            isGovtQuarter: quarter,
            tierNumber: result.tierNumber,
            tierRangeText: result.tierRangeText,
            dhaka: dhakaResult,
            otherCityCorporation: otherCCResult,
            otherAreas: otherAreasResult
          },
          ruleCode: "NATIONAL_PAY_SCALE_2015_HOUSE_RENT",
          effectiveDate: "2016-07-01",
          sourceGazette: "জাতীয় বেতনস্কেল ২০১৫: বাড়ি ভাড়া ভাতা সারণি (অর্থ বিভাগ, অর্থ মন্ত্রণালয়, কার্যকর ০১/০৭/২০১৬)"
        }
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Deductions Calculation
  app.post('/api/deductions/calculate', (req, res) => {
    try {
      const deductionInputs: DeductionInputs = {
        grossSalary: Number(req.body.grossSalary || req.body.basicPay || 0),
        basicPay: Number(req.body.basicPay || 0),
        gpfPercentage: req.body.gpfPercentage !== undefined ? Number(req.body.gpfPercentage) : 10,
        customGpfAmount: req.body.customGpfAmount !== undefined ? Number(req.body.customGpfAmount) : undefined,
        incomeTax: Number(req.body.incomeTax || 0),
        groupInsurance: Number(req.body.groupInsurance || 0),
        benevolentFund: Number(req.body.benevolentFund || 0),
        otherDeductions: Number(req.body.otherDeductions || 0)
      };

      const deductionResult = PayFixationEngine.calculateDeductions(deductionInputs);
      res.json({ success: true, data: deductionResult });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Pension Calculation
  app.post('/api/pension/calculate', (req, res) => {
    try {
      const inputs: PensionCalculationInputs = req.body;
      if (inputs.existingNetPension2015 === undefined || !inputs.age) {
        return res.status(400).json({ success: false, error: "existingNetPension2015 and age are required." });
      }

      const result = PayFixationEngine.calculatePension(inputs);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Employees CRUD
  app.get('/api/employees', (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT e.*, g.currentBalance as gpfBalance 
        FROM Employees e 
        LEFT JOIN GPFAccounts g ON e.id = g.employeeId 
        ORDER BY e.id DESC
      `);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      res.json({ success: true, data: rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/employees/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      const stmt = db.prepare("SELECT * FROM Employees WHERE id = ?");
      stmt.bind([id]);
      if (stmt.step()) {
        const emp = stmt.getAsObject();
        stmt.free();

        // fetch salary history
        const histStmt = db.prepare("SELECT * FROM SalaryHistory WHERE employeeId = ? ORDER BY id DESC");
        histStmt.bind([id]);
        const history = [];
        while (histStmt.step()) {
          history.push(histStmt.getAsObject());
        }
        histStmt.free();

        // fetch gpf
        const gpfStmt = db.prepare("SELECT * FROM GPFAccounts WHERE employeeId = ?");
        gpfStmt.bind([id]);
        let gpf = null;
        if (gpfStmt.step()) {
          gpf = gpfStmt.getAsObject();
        }
        gpfStmt.free();

        res.json({ success: true, data: { employee: emp, history, gpf } });
      } else {
        stmt.free();
        res.status(404).json({ success: false, error: "Employee not found." });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/employees', (req, res) => {
    try {
      const e = req.body;
      if (!e.employeeCode || !e.nameBangla || !e.grade || !e.currentBasicPay) {
        return res.status(400).json({ success: false, error: "Employee Code, Name (Bangla), Grade, and Basic Pay are required." });
      }

      // Calculate retirement date if not provided (Age 59 for general, 60 for freedom fighters)
      let retDate = e.retirementDate;
      let prlStart = e.prlStartDate;
      let prlEnd = e.prlEndDate;
      if (!retDate && e.dateOfBirth) {
        const dob = new Date(e.dateOfBirth);
        if (!isNaN(dob.getTime())) {
          dob.setFullYear(dob.getFullYear() + 59);
          retDate = dob.toISOString().split('T')[0];
          prlStart = retDate;
          const prlEndDateObj = new Date(retDate);
          prlEndDateObj.setFullYear(prlEndDateObj.getFullYear() + 1);
          prlEnd = prlEndDateObj.toISOString().split('T')[0];
        }
      }

      db.run(`
        INSERT INTO Employees (
          employeeCode, nid, nameBangla, nameEnglish, fatherName, motherName,
          dateOfBirth, joiningDate, currentDesignation, department, ministry,
          cadre, employeeType, grade, currentBasicPay, previousBasicPay,
          serviceStatus, gender, mobile, email, bankAccount, bankName,
          branchName, nomineeName, nomineeRelation, retirementDate,
          prlStartDate, prlEndDate, gpfAccountNumber, cityType,
          isGovtQuarterProvided, childrenCount, remarks
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?
        )
      `, [
        e.employeeCode, e.nid || '', e.nameBangla, e.nameEnglish || '', e.fatherName || '', e.motherName || '',
        e.dateOfBirth || '', e.joiningDate || '', e.currentDesignation || '', e.department || '', e.ministry || '',
        e.cadre || 'Non-Cadre', e.employeeType || 'Regular Government Employee', Number(e.grade), Number(e.currentBasicPay), Number(e.previousBasicPay || e.currentBasicPay),
        e.serviceStatus || 'Active', e.gender || 'Male', e.mobile || '', e.email || '', e.bankAccount || '', e.bankName || '',
        e.branchName || '', e.nomineeName || '', e.nomineeRelation || '', retDate || '',
        prlStart || '', prlEnd || '', e.gpfAccountNumber || `GPF-${e.employeeCode}`, e.cityType || 'dhaka',
        e.isGovtQuarterProvided ? 1 : 0, Number(e.childrenCount || 0), e.remarks || ''
      ]);

      const empIdRes = db.exec("SELECT last_insert_rowid() as id");
      const empId = empIdRes[0]?.values[0]?.[0] as number;

      // Auto-create GPF Account
      const monthlySub = Math.round(Number(e.currentBasicPay) * 0.10);
      db.run(`
        INSERT OR IGNORE INTO GPFAccounts (employeeId, gpfAccountNumber, openingBalance, monthlySubscription, currentBalance, interestRate)
        VALUES (?, ?, 0, ?, 0, 11.5)
      `, [empId, e.gpfAccountNumber || `GPF-${e.employeeCode}`, monthlySub]);

      // Log salary history initial record
      db.run(`
        INSERT INTO SalaryHistory (employeeId, eventDate, eventType, oldGrade, newGrade, oldBasic, newBasic, incrementAmount, ruleCode, orderReference, calculationDetailsJson)
        VALUES (?, ?, 'Initial Entry', ?, ?, ?, ?, 0, 'INITIAL', 'পূর্বতন বেতন', '{}')
      `, [empId, e.joiningDate || '2026-06-30', Number(e.grade), Number(e.grade), Number(e.currentBasicPay), Number(e.currentBasicPay)]);

      // Log in Audit
      db.run(`
        INSERT INTO AuditLogs (action, entity, recordId, username, details)
        VALUES ('CREATE', 'Employee', ?, 'admin', ?)
      `, [String(empId), `Added employee ${e.nameBangla} (${e.employeeCode})`]);

      saveDatabase();
      res.json({ success: true, employeeId: empId });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/employees/seed-examples', (req, res) => {
    try {
      // Check if example exists
      const checkStmt = db.prepare("SELECT count(*) as count FROM Employees WHERE employeeCode IN ('EMP-GZ-16', 'EMP-GZ-11')");
      checkStmt.step();
      const count = checkStmt.getAsObject().count;
      checkStmt.free();

      if (Number(count) === 0) {
        // Example 1: Grade 16 (Gazette Page 7)
        db.run(`
          INSERT INTO Employees (
            employeeCode, nid, nameBangla, nameEnglish, currentDesignation, department, ministry,
            cadre, employeeType, grade, currentBasicPay, previousBasicPay, serviceStatus, gender,
            mobile, email, bankAccount, bankName, branchName, cityType, isGovtQuarterProvided,
            childrenCount, gpfAccountNumber, remarks
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'EMP-GZ-16', '19882691234567890', 'মো: রফিকুল ইসলাম', 'Md. Rafiqul Islam', 'অফিস সহকারী কাম কম্পিউটার মুদ্রাক্ষরিক',
          'প্রশাসন অনুবিভাগ', 'অর্থ মন্ত্রণালয়', 'Non-Cadre', 'Regular Government Employee', 16,
          21900, 9300, 'Active', 'Male', '01711000001', 'rafiq.islam@mof.gov.bd', '2001234567891',
          'সোনালী ব্যাংক পিএলসি', 'সচিবালয় কর্পোরেট শাখা', 'dhaka', 0, 1, 'GPF-GZ-1601',
          'গেজেট উদাহরণ ১ (পৃষ্ঠা ৭): ১৬ম গ্রেড, প্রারম্ভিক ৯,৩০০ টাকা হইতে ২১,৯০০ টাকা নির্ধারণ'
        ]);

        const id1Stmt = db.prepare("SELECT last_insert_rowid() as id");
        id1Stmt.step();
        const id1 = id1Stmt.getAsObject().id;
        id1Stmt.free();

        db.run(`
          INSERT INTO GPFAccounts (employeeId, gpfAccountNumber, openingBalance, monthlySubscription, currentBalance)
          VALUES (?, ?, 125000, 2190, 125000)
        `, [id1, 'GPF-GZ-1601']);

        // Example 2: Grade 11 (Gazette Page 8)
        db.run(`
          INSERT INTO Employees (
            employeeCode, nid, nameBangla, nameEnglish, currentDesignation, department, ministry,
            cadre, employeeType, grade, currentBasicPay, previousBasicPay, serviceStatus, gender,
            mobile, email, bankAccount, bankName, branchName, cityType, isGovtQuarterProvided,
            childrenCount, gpfAccountNumber, remarks
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'EMP-GZ-11', '19822699876543210', 'মোসাম্মৎ আয়েশা খাতুন', 'Mst. Ayesha Khatun', 'ব্যক্তিগত কর্মকর্তা (PO)',
          'বাজেট অনুবিভাগ', 'অর্থ মন্ত্রণালয়', 'Non-Cadre', 'Regular Government Employee', 11,
          26300, 13790, 'Active', 'Female', '01819000002', 'ayesha.khatun@mof.gov.bd', '2001987654321',
          'সোনালী ব্যাংক পিএলসি', 'সচিবালয় কর্পোরেট শাখা', 'dhaka', 0, 2, 'GPF-GZ-1102',
          'গেজেট উদাহরণ ২ (পৃষ্ঠা ৮): ১১তম গ্রেড, ১৩,৭৯০ টাকা হইতে ২৬,৩০০ টাকা নির্ধারণ'
        ]);

        const id2Stmt = db.prepare("SELECT last_insert_rowid() as id");
        id2Stmt.step();
        const id2 = id2Stmt.getAsObject().id;
        id2Stmt.free();

        db.run(`
          INSERT INTO GPFAccounts (employeeId, gpfAccountNumber, openingBalance, monthlySubscription, currentBalance)
          VALUES (?, ?, 245000, 2630, 245000)
        `, [id2, 'GPF-GZ-1102']);

        saveDatabase();
      }

      res.json({ success: true, message: "Gazette Examples 1 and 2 seeded successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/employees/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      const e = req.body;

      db.run(`
        UPDATE Employees SET
          nameBangla = ?, nameEnglish = ?, employeeCode = COALESCE(?, employeeCode), nid = ?,
          currentDesignation = ?, department = ?, ministry = ?, cadre = ?, employeeType = ?,
          grade = ?, currentBasicPay = ?, previousBasicPay = ?, dateOfBirth = ?, joiningDate = ?,
          serviceStatus = ?, mobile = ?, email = ?, bankAccount = ?, bankName = ?, branchName = ?,
          gpfAccountNumber = ?, cityType = ?, isGovtQuarterProvided = ?,
          childrenCount = ?, remarks = ?, updatedDate = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        e.nameBangla, e.nameEnglish || '', e.employeeCode || null, e.nid || '',
        e.currentDesignation || '', e.department || '', e.ministry || '',
        e.cadre || '', e.employeeType || '', Number(e.grade), Number(e.currentBasicPay),
        e.previousBasicPay ? Number(e.previousBasicPay) : null, e.dateOfBirth || '', e.joiningDate || '',
        e.serviceStatus || 'Active', e.mobile || '', e.email || '', e.bankAccount || '',
        e.bankName || 'সোনালী ব্যাংক পিএলসি', e.branchName || '', e.gpfAccountNumber || '',
        e.cityType || 'dhaka', e.isGovtQuarterProvided ? 1 : 0,
        Number(e.childrenCount || 0), e.remarks || '', id
      ]);

      // Audit log
      db.run(`
        INSERT INTO AuditLogs (action, entity, recordId, username, details)
        VALUES ('UPDATE', 'Employee', ?, 'admin', ?)
      `, [String(id), `Updated employee details for ID ${id}`]);

      saveDatabase();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/employees/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      db.run("DELETE FROM GPFAccounts WHERE employeeId = ?", [id]);
      db.run("DELETE FROM SalaryHistory WHERE employeeId = ?", [id]);
      db.run("DELETE FROM PayrollDetails WHERE employeeId = ?", [id]);
      db.run("DELETE FROM Employees WHERE id = ?", [id]);

      db.run(`
        INSERT INTO AuditLogs (action, entity, recordId, username, details)
        VALUES ('DELETE', 'Employee', ?, 'admin', ?)
      `, [String(id), `Deleted employee record ID ${id}`]);

      saveDatabase();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Apply Pay Fixation to Employee
  app.post('/api/employees/:id/apply-fixation', (req, res) => {
    try {
      const id = Number(req.params.id);
      const { fixedBasic2026, oldBasic, grade, calculationTrace, eventType, orderRef } = req.body;

      // Update employee record
      db.run(`
        UPDATE Employees SET
          previousBasicPay = ?,
          currentBasicPay = ?,
          updatedDate = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [oldBasic, fixedBasic2026, id]);

      // Add to SalaryHistory
      db.run(`
        INSERT INTO SalaryHistory (
          employeeId, eventDate, eventType, oldGrade, newGrade, oldBasic,
          newBasic, incrementAmount, ruleCode, orderReference, calculationDetailsJson
        ) VALUES (
          ?, '2026-07-01', ?, ?, ?, ?,
          ?, ?, 'CLAUSE_5', ?, ?
        )
      `, [
        id, eventType || 'Pay Fixation 2026', grade, grade, oldBasic,
        fixedBasic2026, fixedBasic2026 - oldBasic, orderRef || 'এস. আর. ও. নং ৩৪৭-আইন/২০২৬',
        JSON.stringify(calculationTrace || {})
      ]);

      // Audit Log
      db.run(`
        INSERT INTO AuditLogs (action, entity, recordId, username, details)
        VALUES ('PAY_FIXATION', 'Employee', ?, 'admin', ?)
      `, [String(id), `Applied 2026 Pay Fixation: ৳${oldBasic} -> ৳${fixedBasic2026}`]);

      saveDatabase();
      res.json({ success: true, message: "Pay fixation applied and history recorded successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GPF Endpoints
  app.get('/api/gpf/accounts', (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT g.*, e.employeeCode, e.nameBangla, e.currentDesignation, e.grade, e.currentBasicPay
        FROM GPFAccounts g
        JOIN Employees e ON g.employeeId = e.id
        ORDER BY g.id DESC
      `);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      res.json({ success: true, data: rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/gpf/transaction', (req, res) => {
    try {
      const { gpfAccountId, transactionDate, transactionType, amount, remarks } = req.body;
      const numAmount = Number(amount);
      if (!gpfAccountId || !numAmount) {
        return res.status(400).json({ success: false, error: "gpfAccountId and amount are required." });
      }

      // Fetch current balance
      const stmt = db.prepare("SELECT currentBalance FROM GPFAccounts WHERE id = ?");
      stmt.bind([gpfAccountId]);
      if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ success: false, error: "GPF Account not found." });
      }
      const current = Number(stmt.getAsObject().currentBalance || 0);
      stmt.free();

      let newBalance = current;
      let credit = 0;
      let debit = 0;
      let interest = 0;

      if (['Monthly Subscription', 'Refund', 'Opening Balance'].includes(transactionType)) {
        credit = numAmount;
        newBalance = current + credit;
      } else if (['Advance', 'Withdrawal'].includes(transactionType)) {
        debit = numAmount;
        newBalance = Math.max(0, current - debit);
      } else if (transactionType === 'Interest') {
        interest = numAmount;
        newBalance = current + interest;
      }

      db.run(`
        INSERT INTO GPFTransactions (
          gpfAccountId, transactionDate, transactionType, credit, debit, interest, balanceAfter, reference, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        gpfAccountId, transactionDate || new Date().toISOString().split('T')[0],
        transactionType, credit, debit, interest, newBalance, 'Manual Entry', remarks || ''
      ]);

      db.run(`
        UPDATE GPFAccounts SET currentBalance = ?, updatedDate = CURRENT_TIMESTAMP WHERE id = ?
      `, [newBalance, gpfAccountId]);

      saveDatabase();
      res.json({ success: true, newBalance });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Payroll Batch Process
  app.post('/api/payroll/process', (req, res) => {
    try {
      const { fiscalYear, salaryMonth } = req.body;
      if (!salaryMonth) {
        return res.status(400).json({ success: false, error: "salaryMonth is required (e.g. July 2026)." });
      }

      // Check duplicate payroll
      const checkStmt = db.prepare("SELECT id FROM Payroll WHERE salaryMonth = ?");
      checkStmt.bind([salaryMonth]);
      if (checkStmt.step()) {
        checkStmt.free();
        return res.status(400).json({ success: false, error: `Payroll for ${salaryMonth} has already been processed.` });
      }
      checkStmt.free();

      // Fetch active employees
      const empStmt = db.prepare("SELECT * FROM Employees WHERE serviceStatus = 'Active'");
      const employees = [];
      while (empStmt.step()) {
        employees.push(empStmt.getAsObject());
      }
      empStmt.free();

      if (employees.length === 0) {
        return res.status(400).json({ success: false, error: "No active employees found to generate payroll." });
      }

      let totBasic = 0;
      let totAllowances = 0;
      let totDeductions = 0;
      let totNet = 0;

      // Insert Payroll Header
      db.run(`
        INSERT INTO Payroll (fiscalYear, salaryMonth, processedDate, totalEmployees, totalBasic, totalAllowances, totalDeductions, totalNet, status)
        VALUES (?, ?, ?, ?, 0, 0, 0, 0, 'Finalized')
      `, [fiscalYear || '2026-2027', salaryMonth, new Date().toISOString().split('T')[0], employees.length]);

      const pIdRes = db.exec("SELECT last_insert_rowid() as id");
      const payrollId = pIdRes[0]?.values[0]?.[0] as number;

      // Calculate for each employee
      for (const emp of employees as any[]) {
        const basic = Number(emp.currentBasicPay);
        const age = 45; // default estimation or calculated from DOB
        const allowanceRes = PayFixationEngine.calculateAllowances({
          grade: emp.grade,
          basicPay: basic,
          age: age,
          cityType: (emp.cityType as any) || 'dhaka',
          isGovtQuarterProvided: Boolean(emp.isGovtQuarterProvided),
          childrenCount: emp.childrenCount || 0,
          isEligibleTiffin: true,
          isEligibleConveyance: emp.cityType === 'dhaka',
          isFestivalMonth: salaryMonth.toLowerCase().includes('eid') || salaryMonth.toLowerCase().includes('festival'),
          isBoishakhMonth: salaryMonth.toLowerCase().includes('april') || salaryMonth.toLowerCase().includes('boishakh')
        });

        const deductionRes = PayFixationEngine.calculateDeductions({
          grossSalary: allowanceRes.grossSalary,
          basicPay: basic,
          gpfPercentage: 10,
          incomeTax: basic > 50000 ? Math.round(basic * 0.05) : 0
        });

        totBasic += basic;
        totAllowances += allowanceRes.totalAllowances;
        totDeductions += deductionRes.totalDeductions;
        totNet += deductionRes.netSalary;

        // Insert PayrollDetails
        db.run(`
          INSERT INTO PayrollDetails (
            payrollId, employeeId, grade, basicPay, houseRent, medicalAllowance,
            tiffinAllowance, mobileAllowance, conveyanceAllowance, educationAllowance,
            festivalAllowance, bengaliNewYearAllowance, otherAllowances,
            grossSalary, gpfDeduction, incomeTax, otherDeductions, totalDeduction, netPay
          ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `, [
          payrollId, emp.id, emp.grade, basic, allowanceRes.houseRent, allowanceRes.medicalAllowance,
          allowanceRes.tiffinAllowance, allowanceRes.mobileAllowance, allowanceRes.conveyanceAllowance, allowanceRes.educationAllowance,
          allowanceRes.festivalAllowance, allowanceRes.bengaliNewYearAllowance, 0,
          allowanceRes.grossSalary, deductionRes.gpfDeduction, deductionRes.incomeTax, 0, deductionRes.totalDeductions, deductionRes.netSalary
        ]);

        // Credit GPF transaction automatically
        if (deductionRes.gpfDeduction > 0) {
          const gpfAccStmt = db.prepare("SELECT id, currentBalance FROM GPFAccounts WHERE employeeId = ?");
          gpfAccStmt.bind([emp.id]);
          if (gpfAccStmt.step()) {
            const acc = gpfAccStmt.getAsObject();
            const gpfAccId = acc.id;
            const newBal = Number(acc.currentBalance || 0) + deductionRes.gpfDeduction;
            db.run(`
              INSERT INTO GPFTransactions (gpfAccountId, transactionDate, transactionType, credit, balanceAfter, reference, remarks)
              VALUES (?, ?, 'Monthly Subscription', ?, ?, ?, ?)
            `, [gpfAccId, new Date().toISOString().split('T')[0], deductionRes.gpfDeduction, newBal, `Payroll: ${salaryMonth}`, 'Automatic payroll subscription deduction']);

            db.run("UPDATE GPFAccounts SET currentBalance = ? WHERE id = ?", [newBal, gpfAccId]);
          }
          gpfAccStmt.free();
        }
      }

      // Update Payroll totals
      db.run(`
        UPDATE Payroll SET
          totalBasic = ?,
          totalAllowances = ?,
          totalDeductions = ?,
          totalNet = ?
        WHERE id = ?
      `, [totBasic, totAllowances, totDeductions, totNet, payrollId]);

      // Audit Log
      db.run(`
        INSERT INTO AuditLogs (action, entity, recordId, username, details)
        VALUES ('PAYROLL_RUN', 'Payroll', ?, 'admin', ?)
      `, [String(payrollId), `Processed payroll for ${salaryMonth} (${employees.length} employees, Net: ৳${totNet.toLocaleString('en-IN')})`]);

      saveDatabase();
      res.json({ success: true, payrollId, totalEmployees: employees.length, totalNet: totNet });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Payroll History
  app.get('/api/payroll/history', (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM Payroll ORDER BY id DESC");
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      res.json({ success: true, data: rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Payroll Detail by ID
  app.get('/api/payroll/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      const stmt = db.prepare("SELECT * FROM Payroll WHERE id = ?");
      stmt.bind([id]);
      if (!stmt.step()) {
        stmt.free();
        return res.status(404).json({ success: false, error: "Payroll not found." });
      }
      const header = stmt.getAsObject();
      stmt.free();

      const detailsStmt = db.prepare(`
        SELECT pd.*, e.employeeCode, e.nameBangla, e.nameEnglish, e.currentDesignation, e.department
        FROM PayrollDetails pd
        JOIN Employees e ON pd.employeeId = e.id
        WHERE pd.payrollId = ?
      `);
      detailsStmt.bind([id]);
      const details = [];
      while (detailsStmt.step()) {
        details.push(detailsStmt.getAsObject());
      }
      detailsStmt.free();

      res.json({ success: true, data: { header, details } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dashboard Aggregates (Strictly from real SQL data, empty states if no data)
  app.get('/api/dashboard/stats', (req, res) => {
    try {
      const empCountRes = db.exec("SELECT COUNT(*) FROM Employees");
      const totalEmployees = empCountRes[0]?.values[0]?.[0] || 0;

      const activeEmpRes = db.exec("SELECT COUNT(*) FROM Employees WHERE serviceStatus = 'Active'");
      const activeEmployees = activeEmpRes[0]?.values[0]?.[0] || 0;

      const totalBasicRes = db.exec("SELECT SUM(currentBasicPay) FROM Employees WHERE serviceStatus = 'Active'");
      const totalBasic = totalBasicRes[0]?.values[0]?.[0] || 0;

      const totalGpfRes = db.exec("SELECT SUM(currentBalance) FROM GPFAccounts");
      const totalGpf = totalGpfRes[0]?.values[0]?.[0] || 0;

      const payrollRes = db.exec("SELECT SUM(totalNet) FROM Payroll");
      const totalDisbursed = payrollRes[0]?.values[0]?.[0] || 0;

      // Grade breakdown
      const gradeStmt = db.prepare(`
        SELECT grade, COUNT(*) as count, SUM(currentBasicPay) as sumBasic
        FROM Employees
        GROUP BY grade
        ORDER BY grade ASC
      `);
      const gradeDistribution = [];
      while (gradeStmt.step()) {
        gradeDistribution.push(gradeStmt.getAsObject());
      }
      gradeStmt.free();

      res.json({
        success: true,
        data: {
          totalEmployees,
          activeEmployees,
          totalBasic,
          totalGpf,
          totalDisbursed,
          gradeDistribution
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM AuditLogs ORDER BY id DESC LIMIT 100");
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      res.json({ success: true, data: rows });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Section 45: Downloadable / Viewable Database.sql script
  app.get('/api/sql/export', (req, res) => {
    try {
      const sqlContent = generateSqlScript();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="SmartPayScale2026_Database.sql"');
      res.send(sqlContent);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // SQL Query Console (for authorized admin review)
  app.post('/api/sql/query', (req, res) => {
    try {
      const sqlQuery = req.body.query || req.body.sqlQuery;
      if (!sqlQuery || typeof sqlQuery !== 'string') {
        return res.status(400).json({ success: false, error: "sql query string is required." });
      }

      // Execute read or DML
      const raw = db.exec(sqlQuery);
      saveDatabase();

      let data: any[] = [];
      if (raw && raw.length > 0) {
        const cols = raw[0].columns;
        data = raw[0].values.map(row => {
          const obj: any = {};
          cols.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (Development) vs STATIC FALLBACK (Production)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Pay Scale 2026 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
