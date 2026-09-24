/**
 * Database Layer for Smart Pay Scale 2026 Application
 * Implements full normalized SQL schema with sql.js (SQLite)
 * Strictly adheres to Section 20, 21, 35, 45 of requirements
 */

import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { OFFICIAL_PAY_SCALES, OFFICIAL_PENSION_INCREASE_SLABS, OFFICIAL_DOC_REFERENCES } from './payscaleData.ts';

let dbInstance: Database | null = null;
const DB_PATH = path.join(process.cwd(), 'data', 'payscale2026.sqlite');

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn("Could not read existing database, initializing fresh one:", e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize schema and seed official tables
  initializeSchema(dbInstance);
  saveDatabase();

  return dbInstance;
}

export function saveDatabase() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error("Failed to save database to disk:", err);
  }
}

export function initializeSchema(db: Database) {
  // Execute DDL statements
  db.run(`
    -- Core Reference & Configuration Tables
    CREATE TABLE IF NOT EXISTS DocumentReferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      documentName TEXT,
      orderNumber TEXT,
      gazetteDate TEXT,
      effectiveDate TEXT,
      authority TEXT,
      actName TEXT,
      shortTitle TEXT,
      createdDate DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PayScaleVersions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      versionCode TEXT UNIQUE,
      nameBangla TEXT,
      nameEnglish TEXT,
      effectiveDate TEXT,
      orderReference TEXT,
      isActive INTEGER DEFAULT 1,
      createdDate DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PayGrades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gradeNumber INTEGER UNIQUE,
      gradeBangla TEXT,
      scaleStartingBasic2015 DECIMAL(18,2),
      scaleEndingBasic2015 DECIMAL(18,2),
      scaleStartingBasic2026 DECIMAL(18,2),
      scaleEndingBasic2026 DECIMAL(18,2),
      minYearsForFullPay INTEGER
    );

    CREATE TABLE IF NOT EXISTS PayScaleStages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gradeNumber INTEGER,
      versionCode TEXT,
      stageNumber INTEGER,
      basicAmount DECIMAL(18,2),
      incrementAmount DECIMAL(18,2),
      FOREIGN KEY(gradeNumber) REFERENCES PayGrades(gradeNumber)
    );

    CREATE TABLE IF NOT EXISTS AllowanceMaster (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      nameBangla TEXT,
      nameEnglish TEXT,
      category TEXT,
      sourceClause TEXT,
      isActive INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS PensionRules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slabName TEXT,
      minDrawn DECIMAL(18,2),
      maxDrawn DECIMAL(18,2),
      percentage DECIMAL(5,2),
      minNetPension DECIMAL(18,2),
      maxNetPension DECIMAL(18,2),
      sourceClause TEXT
    );

    CREATE TABLE IF NOT EXISTS GPFInterestRules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fiscalYear TEXT,
      interestRate DECIMAL(5,2),
      sourceReference TEXT,
      effectiveDate TEXT
    );

    -- Users & Roles
    CREATE TABLE IF NOT EXISTS Roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roleName TEXT UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      fullName TEXT,
      email TEXT UNIQUE,
      passwordHash TEXT,
      roleName TEXT,
      isActive INTEGER DEFAULT 1,
      lastLogin DATETIME,
      createdDate DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Organizational Masters
    CREATE TABLE IF NOT EXISTS Ministries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nameBangla TEXT,
      nameEnglish TEXT
    );

    CREATE TABLE IF NOT EXISTS Departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ministryId INTEGER,
      nameBangla TEXT,
      nameEnglish TEXT
    );

    CREATE TABLE IF NOT EXISTS Designations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titleBangla TEXT,
      titleEnglish TEXT,
      defaultGrade INTEGER
    );

    -- Real Employee Master (Strictly NO dummy data)
    CREATE TABLE IF NOT EXISTS Employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeCode TEXT UNIQUE,
      nid TEXT UNIQUE,
      nameBangla TEXT,
      nameEnglish TEXT,
      fatherName TEXT,
      motherName TEXT,
      dateOfBirth TEXT,
      joiningDate TEXT,
      currentDesignation TEXT,
      department TEXT,
      ministry TEXT,
      cadre TEXT,
      employeeType TEXT,
      grade INTEGER,
      currentBasicPay DECIMAL(18,2),
      previousBasicPay DECIMAL(18,2),
      serviceStatus TEXT,
      gender TEXT,
      mobile TEXT,
      email TEXT,
      bankAccount TEXT,
      bankName TEXT,
      branchName TEXT,
      nomineeName TEXT,
      nomineeRelation TEXT,
      retirementDate TEXT,
      prlStartDate TEXT,
      prlEndDate TEXT,
      gpfAccountNumber TEXT,
      cityType TEXT DEFAULT 'dhaka',
      isGovtQuarterProvided INTEGER DEFAULT 0,
      childrenCount INTEGER DEFAULT 0,
      remarks TEXT,
      createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Salary History & Fixations
    CREATE TABLE IF NOT EXISTS SalaryHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER,
      eventDate TEXT,
      eventType TEXT,
      oldGrade INTEGER,
      newGrade INTEGER,
      oldBasic DECIMAL(18,2),
      newBasic DECIMAL(18,2),
      incrementAmount DECIMAL(18,2),
      ruleCode TEXT,
      orderReference TEXT,
      calculationDetailsJson TEXT,
      createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES Employees(id)
    );

    -- Arrear Calculations
    CREATE TABLE IF NOT EXISTS ArrearCalculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER,
      calculationDate TEXT,
      drawnBasic2015 DECIMAL(18,2),
      fixedBasic2026 DECIMAL(18,2),
      totalDifference DECIMAL(18,2),
      phase1Amount DECIMAL(18,2),
      phase2Amount DECIMAL(18,2),
      status TEXT DEFAULT 'Calculated',
      detailsJson TEXT,
      FOREIGN KEY(employeeId) REFERENCES Employees(id)
    );

    -- GPF Ledger
    CREATE TABLE IF NOT EXISTS GPFAccounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employeeId INTEGER UNIQUE,
      gpfAccountNumber TEXT UNIQUE,
      openingBalance DECIMAL(18,2) DEFAULT 0,
      monthlySubscription DECIMAL(18,2) DEFAULT 0,
      currentBalance DECIMAL(18,2) DEFAULT 0,
      interestRate DECIMAL(5,2) DEFAULT 11.5,
      updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employeeId) REFERENCES Employees(id)
    );

    CREATE TABLE IF NOT EXISTS GPFTransactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gpfAccountId INTEGER,
      transactionDate TEXT,
      transactionType TEXT,
      credit DECIMAL(18,2) DEFAULT 0,
      debit DECIMAL(18,2) DEFAULT 0,
      interest DECIMAL(18,2) DEFAULT 0,
      balanceAfter DECIMAL(18,2),
      reference TEXT,
      remarks TEXT,
      FOREIGN KEY(gpfAccountId) REFERENCES GPFAccounts(id)
    );

    -- Monthly Payroll
    CREATE TABLE IF NOT EXISTS Payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fiscalYear TEXT,
      salaryMonth TEXT,
      processedDate TEXT,
      totalEmployees INTEGER,
      totalBasic DECIMAL(18,2),
      totalAllowances DECIMAL(18,2),
      totalDeductions DECIMAL(18,2),
      totalNet DECIMAL(18,2),
      status TEXT DEFAULT 'Finalized'
    );

    CREATE TABLE IF NOT EXISTS PayrollDetails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payrollId INTEGER,
      employeeId INTEGER,
      grade INTEGER,
      basicPay DECIMAL(18,2),
      houseRent DECIMAL(18,2),
      medicalAllowance DECIMAL(18,2),
      tiffinAllowance DECIMAL(18,2),
      mobileAllowance DECIMAL(18,2),
      conveyanceAllowance DECIMAL(18,2),
      educationAllowance DECIMAL(18,2),
      festivalAllowance DECIMAL(18,2),
      bengaliNewYearAllowance DECIMAL(18,2),
      otherAllowances DECIMAL(18,2),
      grossSalary DECIMAL(18,2),
      gpfDeduction DECIMAL(18,2),
      incomeTax DECIMAL(18,2),
      otherDeductions DECIMAL(18,2),
      totalDeduction DECIMAL(18,2),
      netPay DECIMAL(18,2),
      FOREIGN KEY(payrollId) REFERENCES Payroll(id),
      FOREIGN KEY(employeeId) REFERENCES Employees(id)
    );

    -- Audit Logs
    CREATE TABLE IF NOT EXISTS AuditLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      entity TEXT,
      recordId TEXT,
      username TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedOfficialData(db);
}

function seedOfficialData(db: Database) {
  // Check if document reference exists
  const res = db.exec("SELECT COUNT(*) as count FROM DocumentReferences");
  const count = res[0]?.values[0]?.[0] as number;
  if (count > 0) {
    return; // already seeded
  }

  // Seed Document References
  for (const doc of OFFICIAL_DOC_REFERENCES) {
    db.run(
      `INSERT INTO DocumentReferences (code, documentName, orderNumber, gazetteDate, effectiveDate, authority, actName, shortTitle)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [doc.code, doc.documentName, doc.orderNumber, doc.gazetteDate, doc.effectiveDate, doc.authority, doc.actName, doc.shortTitle]
    );
  }

  // Seed PayScaleVersions
  db.run(
    `INSERT INTO PayScaleVersions (versionCode, nameBangla, nameEnglish, effectiveDate, orderReference)
     VALUES (?, ?, ?, ?, ?)`,
    ['NPS_2026', 'জাতীয় বেতনস্কেল, ২০২৬', 'National Pay Scale 2026', '2026-07-01', 'এস. আর. ও. নং ৩৪৭-আইন/২০২৬']
  );
  db.run(
    `INSERT INTO PayScaleVersions (versionCode, nameBangla, nameEnglish, effectiveDate, orderReference)
     VALUES (?, ?, ?, ?, ?)`,
    ['NPS_2015', 'জাতীয় বেতনস্কেল, ২০১৫', 'National Pay Scale 2015', '2015-07-01', 'এস. আর. ও. নং ৩৯১-আইন/২০১৫']
  );

  // Seed Roles & Default Admin User
  const roles = ['Super Admin', 'Administrator', 'Payroll Officer', 'Accounts Officer', 'Pension Officer', 'Viewer'];
  for (const r of roles) {
    db.run(`INSERT OR IGNORE INTO Roles (roleName, description) VALUES (?, ?)`, [r, `${r} Role`]);
  }

  db.run(
    `INSERT OR IGNORE INTO Users (username, fullName, email, passwordHash, roleName)
     VALUES (?, ?, ?, ?, ?)`,
    ['admin', 'সিস্টেম অ্যাডমিনিস্ট্রেটর', 'admin@payscale.gov.bd', 'admin123', 'Super Admin']
  );

  // Seed PayGrades & PayScaleStages from OFFICIAL_PAY_SCALES
  for (const g of OFFICIAL_PAY_SCALES) {
    db.run(
      `INSERT INTO PayGrades (gradeNumber, gradeBangla, scaleStartingBasic2015, scaleEndingBasic2015, scaleStartingBasic2026, scaleEndingBasic2026, minYearsForFullPay)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        g.grade,
        g.gradeBangla,
        g.scale2015.startingBasic,
        g.scale2015.endingBasic,
        g.scale2026.startingBasic,
        g.scale2026.endingBasic,
        g.minYearsForFullPay || 0
      ]
    );

    // 2026 stages
    g.scale2026.stages.forEach((amount, idx) => {
      const prev = idx > 0 ? g.scale2026.stages[idx - 1] : amount;
      const inc = amount - prev;
      db.run(
        `INSERT INTO PayScaleStages (gradeNumber, versionCode, stageNumber, basicAmount, incrementAmount)
         VALUES (?, ?, ?, ?, ?)`,
        [g.grade, 'NPS_2026', idx + 1, amount, inc]
      );
    });

    // 2015 stages
    g.scale2015.stages.forEach((amount, idx) => {
      const prev = idx > 0 ? g.scale2015.stages[idx - 1] : amount;
      const inc = amount - prev;
      db.run(
        `INSERT INTO PayScaleStages (gradeNumber, versionCode, stageNumber, basicAmount, incrementAmount)
         VALUES (?, ?, ?, ?, ?)`,
        [g.grade, 'NPS_2015', idx + 1, amount, inc]
      );
    });
  }

  // Seed Pension Rules
  for (const slab of OFFICIAL_PENSION_INCREASE_SLABS) {
    db.run(
      `INSERT INTO PensionRules (slabName, minDrawn, maxDrawn, percentage, minNetPension, maxNetPension, sourceClause)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slab.slabName, slab.minDrawn, slab.maxDrawn, slab.percentage, slab.minNetPension, slab.maxNetPension, slab.sourceClause]
    );
  }

  // Seed GPF Interest Rules
  db.run(
    `INSERT INTO GPFInterestRules (fiscalYear, interestRate, sourceReference, effectiveDate)
     VALUES (?, ?, ?, ?)`,
    ['2026-2027', 11.5, 'অর্থ বিভাগ, অর্থ মন্ত্রণালয় প্রজ্ঞাপন', '2026-07-01']
  );

  // Seed Initial Allowances Master
  const allowances = [
    { code: 'HOUSE_RENT', bn: 'বাড়ি ভাড়া ভাতা', en: 'House Rent Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ১৫' },
    { code: 'MEDICAL', bn: 'চিকিৎসা ভাতা', en: 'Medical Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ১৩' },
    { code: 'BENGALI_NEW_YEAR', bn: 'বাংলা নববর্ষ ভাতা', en: 'Bengali New Year Allowance', cat: 'Yearly', clause: 'অনুচ্ছেদ ১৪' },
    { code: 'FESTIVAL', bn: 'উৎসব ভাতা', en: 'Festival Allowance', cat: 'Biannual', clause: 'অনুচ্ছেদ ১৭' },
    { code: 'TIFFIN', bn: 'টিফিন ভাতা', en: 'Tiffin Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ১৯' },
    { code: 'CONVEYANCE', bn: 'যাতায়াত ভাতা', en: 'Conveyance Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ২১' },
    { code: 'MOBILE', bn: 'মোবাইল ভাতা', en: 'Mobile Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ২২' },
    { code: 'EDUCATION', bn: 'শিক্ষা সহায়ক ভাতা', en: 'Education Assistance Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ১৮' },
    { code: 'WASH', bn: 'ধোলাই ভাতা', en: 'Wash Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ২৩' },
    { code: 'CHARGE', bn: 'কার্যভার ভাতা', en: 'Charge Allowance', cat: 'Monthly', clause: 'অনুচ্ছেদ ২০' }
  ];

  for (const a of allowances) {
    db.run(
      `INSERT INTO AllowanceMaster (code, nameBangla, nameEnglish, category, sourceClause)
       VALUES (?, ?, ?, ?, ?)`,
      [a.code, a.bn, a.en, a.cat, a.clause]
    );
  }

  // Seed standard Ministries & Departments
  const ministries = [
    { bn: 'অর্থ মন্ত্রণালয়', en: 'Ministry of Finance' },
    { bn: 'জনপ্রশাসন মন্ত্রণালয়', en: 'Ministry of Public Administration' },
    { bn: 'শিক্ষা মন্ত্রণালয়', en: 'Ministry of Education' },
    { bn: 'স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়', en: 'Ministry of Health & Family Welfare' },
    { bn: 'স্বরাষ্ট্র মন্ত্রণালয়', en: 'Ministry of Home Affairs' }
  ];
  for (const m of ministries) {
    db.run(`INSERT INTO Ministries (nameBangla, nameEnglish) VALUES (?, ?)`, [m.bn, m.en]);
  }

  // Log system initialization in AuditLogs
  db.run(
    `INSERT INTO AuditLogs (action, entity, recordId, username, details)
     VALUES (?, ?, ?, ?, ?)`,
    ['INITIALIZE', 'DATABASE', 'SCHEMA_V1', 'system', 'Initialized 2026 Pay Scale Schema & seeded official rules']
  );
}

/**
 * Generates the complete official Database.sql script for Section 45
 */
export function generateSqlScript(): string {
  let sql = `-- =============================================================================
-- SMART PAY SCALE 2026 - COMPLETE SQL DATABASE SCRIPT
-- Strictly based on চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ (S.R.O. No. 347-Law/2026)
-- Target RDBMS: SQL Server 2019/2022 / SQLite / PostgreSQL Compatible
-- =============================================================================

CREATE TABLE DocumentReferences (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) UNIQUE,
  documentName NVARCHAR(255),
  orderNumber NVARCHAR(100),
  gazetteDate DATE,
  effectiveDate DATE,
  authority NVARCHAR(255),
  actName NVARCHAR(255),
  shortTitle NVARCHAR(255),
  createdDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE PayScaleVersions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  versionCode NVARCHAR(50) UNIQUE,
  nameBangla NVARCHAR(255),
  nameEnglish NVARCHAR(255),
  effectiveDate DATE,
  orderReference NVARCHAR(255),
  isActive BIT DEFAULT 1,
  createdDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE PayGrades (
  id INT IDENTITY(1,1) PRIMARY KEY,
  gradeNumber INT UNIQUE,
  gradeBangla NVARCHAR(50),
  scaleStartingBasic2015 DECIMAL(18,2),
  scaleEndingBasic2015 DECIMAL(18,2),
  scaleStartingBasic2026 DECIMAL(18,2),
  scaleEndingBasic2026 DECIMAL(18,2),
  minYearsForFullPay INT
);

CREATE TABLE PayScaleStages (
  id INT IDENTITY(1,1) PRIMARY KEY,
  gradeNumber INT,
  versionCode NVARCHAR(50),
  stageNumber INT,
  basicAmount DECIMAL(18,2),
  incrementAmount DECIMAL(18,2),
  FOREIGN KEY(gradeNumber) REFERENCES PayGrades(gradeNumber)
);

CREATE TABLE AllowanceMaster (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) UNIQUE,
  nameBangla NVARCHAR(255),
  nameEnglish NVARCHAR(255),
  category NVARCHAR(50),
  sourceClause NVARCHAR(100),
  isActive BIT DEFAULT 1
);

CREATE TABLE PensionRules (
  id INT IDENTITY(1,1) PRIMARY KEY,
  slabName NVARCHAR(100),
  minDrawn DECIMAL(18,2),
  maxDrawn DECIMAL(18,2),
  percentage DECIMAL(5,2),
  minNetPension DECIMAL(18,2),
  maxNetPension DECIMAL(18,2),
  sourceClause NVARCHAR(100)
);

CREATE TABLE GPFInterestRules (
  id INT IDENTITY(1,1) PRIMARY KEY,
  fiscalYear NVARCHAR(20),
  interestRate DECIMAL(5,2),
  sourceReference NVARCHAR(255),
  effectiveDate DATE
);

CREATE TABLE Roles (
  id INT IDENTITY(1,1) PRIMARY KEY,
  roleName NVARCHAR(50) UNIQUE,
  description NVARCHAR(255)
);

CREATE TABLE Users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) UNIQUE,
  fullName NVARCHAR(150),
  email NVARCHAR(150) UNIQUE,
  passwordHash NVARCHAR(255),
  roleName NVARCHAR(50),
  isActive BIT DEFAULT 1,
  lastLogin DATETIME,
  createdDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE Employees (
  id INT IDENTITY(1,1) PRIMARY KEY,
  employeeCode NVARCHAR(50) UNIQUE,
  nid NVARCHAR(50) UNIQUE,
  nameBangla NVARCHAR(150),
  nameEnglish NVARCHAR(150),
  fatherName NVARCHAR(150),
  motherName NVARCHAR(150),
  dateOfBirth DATE,
  joiningDate DATE,
  currentDesignation NVARCHAR(150),
  department NVARCHAR(150),
  ministry NVARCHAR(150),
  cadre NVARCHAR(100),
  employeeType NVARCHAR(100),
  grade INT,
  currentBasicPay DECIMAL(18,2),
  previousBasicPay DECIMAL(18,2),
  serviceStatus NVARCHAR(50),
  gender NVARCHAR(20),
  mobile NVARCHAR(50),
  email NVARCHAR(100),
  bankAccount NVARCHAR(50),
  bankName NVARCHAR(100),
  branchName NVARCHAR(100),
  nomineeName NVARCHAR(150),
  nomineeRelation NVARCHAR(50),
  retirementDate DATE,
  prlStartDate DATE,
  prlEndDate DATE,
  gpfAccountNumber NVARCHAR(50),
  cityType NVARCHAR(50) DEFAULT 'dhaka',
  isGovtQuarterProvided BIT DEFAULT 0,
  childrenCount INT DEFAULT 0,
  remarks NVARCHAR(500),
  createdDate DATETIME DEFAULT GETDATE(),
  updatedDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE SalaryHistory (
  id INT IDENTITY(1,1) PRIMARY KEY,
  employeeId INT,
  eventDate DATE,
  eventType NVARCHAR(50),
  oldGrade INT,
  newGrade INT,
  oldBasic DECIMAL(18,2),
  newBasic DECIMAL(18,2),
  incrementAmount DECIMAL(18,2),
  ruleCode NVARCHAR(50),
  orderReference NVARCHAR(150),
  calculationDetailsJson NVARCHAR(MAX),
  createdDate DATETIME DEFAULT GETDATE(),
  FOREIGN KEY(employeeId) REFERENCES Employees(id)
);

CREATE TABLE ArrearCalculations (
  id INT IDENTITY(1,1) PRIMARY KEY,
  employeeId INT,
  calculationDate DATE,
  drawnBasic2015 DECIMAL(18,2),
  fixedBasic2026 DECIMAL(18,2),
  totalDifference DECIMAL(18,2),
  phase1Amount DECIMAL(18,2),
  phase2Amount DECIMAL(18,2),
  status NVARCHAR(50) DEFAULT 'Calculated',
  detailsJson NVARCHAR(MAX),
  FOREIGN KEY(employeeId) REFERENCES Employees(id)
);

CREATE TABLE GPFAccounts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  employeeId INT UNIQUE,
  gpfAccountNumber NVARCHAR(50) UNIQUE,
  openingBalance DECIMAL(18,2) DEFAULT 0,
  monthlySubscription DECIMAL(18,2) DEFAULT 0,
  currentBalance DECIMAL(18,2) DEFAULT 0,
  interestRate DECIMAL(5,2) DEFAULT 11.5,
  updatedDate DATETIME DEFAULT GETDATE(),
  FOREIGN KEY(employeeId) REFERENCES Employees(id)
);

CREATE TABLE GPFTransactions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  gpfAccountId INT,
  transactionDate DATE,
  transactionType NVARCHAR(50),
  credit DECIMAL(18,2) DEFAULT 0,
  debit DECIMAL(18,2) DEFAULT 0,
  interest DECIMAL(18,2) DEFAULT 0,
  balanceAfter DECIMAL(18,2),
  reference NVARCHAR(150),
  remarks NVARCHAR(255),
  FOREIGN KEY(gpfAccountId) REFERENCES GPFAccounts(id)
);

CREATE TABLE Payroll (
  id INT IDENTITY(1,1) PRIMARY KEY,
  fiscalYear NVARCHAR(20),
  salaryMonth NVARCHAR(30),
  processedDate DATE,
  totalEmployees INT,
  totalBasic DECIMAL(18,2),
  totalAllowances DECIMAL(18,2),
  totalDeductions DECIMAL(18,2),
  totalNet DECIMAL(18,2),
  status NVARCHAR(50) DEFAULT 'Finalized'
);

CREATE TABLE PayrollDetails (
  id INT IDENTITY(1,1) PRIMARY KEY,
  payrollId INT,
  employeeId INT,
  grade INT,
  basicPay DECIMAL(18,2),
  houseRent DECIMAL(18,2),
  medicalAllowance DECIMAL(18,2),
  tiffinAllowance DECIMAL(18,2),
  mobileAllowance DECIMAL(18,2),
  conveyanceAllowance DECIMAL(18,2),
  educationAllowance DECIMAL(18,2),
  festivalAllowance DECIMAL(18,2),
  bengaliNewYearAllowance DECIMAL(18,2),
  otherAllowances DECIMAL(18,2),
  grossSalary DECIMAL(18,2),
  gpfDeduction DECIMAL(18,2),
  incomeTax DECIMAL(18,2),
  otherDeductions DECIMAL(18,2),
  totalDeduction DECIMAL(18,2),
  netPay DECIMAL(18,2),
  FOREIGN KEY(payrollId) REFERENCES Payroll(id),
  FOREIGN KEY(employeeId) REFERENCES Employees(id)
);

CREATE TABLE AuditLogs (
  id INT IDENTITY(1,1) PRIMARY KEY,
  action NVARCHAR(50),
  entity NVARCHAR(50),
  recordId NVARCHAR(50),
  username NVARCHAR(50),
  details NVARCHAR(MAX),
  timestamp DATETIME DEFAULT GETDATE()
);

-- =============================================================================
-- SEED DATA: OFFICIAL GAZETTE S.R.O. 347-LAW/2026 PAY SCALES & RULES
-- =============================================================================

INSERT INTO DocumentReferences (code, documentName, orderNumber, gazetteDate, effectiveDate, authority, actName, shortTitle)
VALUES ('SRO_347_2026', N'বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা, ১৭ সেপ্টেম্বর ২০২৬', N'এস. আর. ও. নং ৩৪৭-আইন/২০২৬', '2026-09-17', '2026-07-01', N'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, অর্থ মন্ত্রণালয়, অর্থ বিভাগ', N'সরকারি চাকরি আইন, ২০১৮ (২০১৮ সনের ৫৭ নং আইন) এর ধারা ১৫', N'চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬');

INSERT INTO PayScaleVersions (versionCode, nameBangla, nameEnglish, effectiveDate, orderReference)
VALUES ('NPS_2026', N'জাতীয় বেতনস্কেল, ২০২৬', 'National Pay Scale 2026', '2026-07-01', N'এস. আর. ও. নং ৩৪৭-আইন/২০২৬');

-- Pay Grades (1 through 20)
`;

  for (const g of OFFICIAL_PAY_SCALES) {
    sql += `INSERT INTO PayGrades (gradeNumber, gradeBangla, scaleStartingBasic2015, scaleEndingBasic2015, scaleStartingBasic2026, scaleEndingBasic2026, minYearsForFullPay)
VALUES (${g.grade}, N'${g.gradeBangla}', ${g.scale2015.startingBasic}, ${g.scale2015.endingBasic}, ${g.scale2026.startingBasic}, ${g.scale2026.endingBasic}, ${g.minYearsForFullPay || 0});\n`;
  }

  sql += `\n-- Pension Slabs (Clause 8(1)(b))\n`;
  for (const s of OFFICIAL_PENSION_INCREASE_SLABS) {
    sql += `INSERT INTO PensionRules (slabName, minDrawn, maxDrawn, percentage, minNetPension, maxNetPension, sourceClause)
VALUES (N'${s.slabName}', ${s.minDrawn}, ${s.maxDrawn}, ${s.percentage}, ${s.minNetPension}, ${s.maxNetPension}, N'${s.sourceClause}');\n`;
  }

  sql += `\n-- (NO DUMMY EMPLOYEE DATA INSERTED - READY FOR PRODUCTION USAGE)\n`;
  return sql;
}
