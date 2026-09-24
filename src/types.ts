/**
 * Type Definitions for Smart Pay Scale 2026
 * Strictly based on চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬
 */

export type Language = 'bn' | 'en';

export interface CalculationTraceStep {
  stepNumber: number;
  stepName: string;
  stepNameBangla: string;
  formula: string;
  intermediateValues: string;
  result: string | number;
  sourceClause: string;
  sourcePage: number;
}

export interface PayFixationResult {
  grade: number;
  drawnBasic2015: number;
  startingBasic2015: number;
  startingBasic2026: number;
  difference2015: number;
  theoreticalSum: number;
  fixedBasic2026: number;
  fixationStageIndex: number;
  salaryDifference: number;
  annualIncrementAmount: number;
  basicWithJuly2026Increment: number;
  effectiveDate: string;
  ruleCode: string;
  ruleNameBangla: string;
  trace: CalculationTraceStep[];
  scaleStageTier?: {
    currentTier: 1 | 2 | 3;
    currentTierName: string;
    stageNumber: number;
    totalStagesInGrade: number;
    isCeilingReached: boolean;
    tierDescription: string;
    stagnationIncrementEligible?: boolean;
    stagnationIncrementAmount?: number;
  };
  disbursementStages?: {
    stageNumber: 1 | 2 | 3;
    periodBangla: string;
    periodEnglish: string;
    percentage: number;
    monthlyDisbursedDiff: number;
    monthlyBasicPayable: number;
    sourceClause: string;
    annualIncrementAmount: number;
    fixedBasicWithIncrement: number;
    totalDifferenceWithIncrement: number;
    monthlyDisbursedDiffWithIncrement: number;
    monthlyBasicPayableByDiffWithIncrement: number;
    monthlyBasicWithJulyIncrementPayable: number;
    baseDiffWithoutIncrement: number;
    monthlyDisbursedDiffWithoutIncrement: number;
  }[];
  section9Increment?: Section9IncrementInfo;
}

export interface Section9IncrementRateTier {
  tierNumber: 1 | 2 | 3;
  tierNameBangla: string;
  tierNameEnglish: string;
  gradeCoverageBangla: string;
  gradeCoverageEnglish: string;
  grades: number[];
  statutoryRatePercent: number;
  statutoryRateBangla: string;
  legalBasisBangla: string;
  descriptionBangla: string;
}

export interface Section9IncrementInfo {
  grade: number;
  statutoryRatePercent: number;
  statutoryRateBangla: string;
  rateTierNumber: 1 | 2 | 3;
  rateTierNameBangla: string;
  rateTierCoverageBangla: string;
  fixedBasic2026: number;
  annualIncrementAmount: number;
  basicWithJuly2026Increment: number;
  effectiveIncrementPercentage: number;
  isCeilingReached: boolean;
  isStagnationIncrement: boolean;
  stagnationIncrementAmount: number;
  statutoryClause: string;
  explanationBangla: string;
  threeRateTiers: Section9IncrementRateTier[];
}

export interface IncrementalScaleTierInfo {
  tierNumber: 1 | 2 | 3;
  tierNameBangla: string;
  tierNameEnglish: string;
  descriptionBangla: string;
  stageRangeText: string;
  legalClause: string;
  isCurrentTier: boolean;
  statusBadgeBangla: string;
}

export type HouseRentLocation = 'dhaka' | 'other_city_corporation' | 'other';

export interface StatutoryHouseRentResult {
  basicSalary: number;
  location: HouseRentLocation;
  locationNameBangla: string;
  isGovtQuarter: boolean;
  tierNumber: 1 | 2 | 3 | 4;
  tierRangeText: string;
  ratePercentage: number;
  calculatedAmount: number;
  minimumAmount: number;
  finalAmount: number;
  minApplied: boolean;
  explanationBangla: string;
}

export interface ArrearMonthBreakdown {
  month: string;
  year: number;
  phase: string;
  phaseBangla: string;
  basic2015: number;
  fixedBasic2026: number;
  difference: number;
  percentage: number;
  payableDifference: number; // Gross payable diff (backwards-compatible)
  grossPayableDifference: number;
  increasedHouseRent: number;
  specialBenefit: number;
  totalMonthlyDeduction: number;
  netPayableDifference: number;
  sourceClause: string;
}

export interface ArrearCalculationResult {
  grade: number;
  drawnBasic2015: number;
  fixedBasic2026: number;
  totalMonthlyDifference: number;
  location?: HouseRentLocation;
  locationBangla?: string;
  isGovtQuarter?: boolean;
  
  // Step information
  stepNumber2015?: number;
  totalStepsInGrade2015?: number;
  subsequentStepNumber2015?: number;
  subsequentStepBasic2015?: number;
  isAtCeiling2015?: boolean;

  // House Rent June 30, 2026
  houseRentJune2026?: StatutoryHouseRentResult;
  // 5% Increment & July 1 Basic in 2015 scale
  increment5PctAmount?: number;
  july1Basic2015WithIncrement?: number;
  // 15% Special Benefit
  specialBenefit15PctAmount?: number;
  // House Rent July 1, 2026
  houseRentJuly2026?: StatutoryHouseRentResult;
  // Increased House Rent (July 1 - June 30)
  monthlyIncreasedHouseRent?: number;
  // Total Monthly Deductions (Increased House Rent + Special Benefit)
  monthlyTotalDeductions?: number;

  phase1MonthlyPayable: number;
  phase1Percentage: number;
  phase1MonthlyNetPayable?: number;

  phase2MonthlyPayable: number;
  phase2Percentage: number;
  phase2MonthlyNetPayable?: number;

  phase3MonthlyPayable: number;
  phase3Percentage: number;
  phase3MonthlyNetPayable?: number;

  monthlyBreakdown: ArrearMonthBreakdown[];
  totalArrearJulyToDec2026: number; // Gross
  totalNetArrearJulyToDec2026?: number; // Net
  totalArrearJanToJun2027: number; // Gross
  totalNetArrearJanToJun2027?: number; // Net

  total12MonthsGrossArrear?: number;
  total12MonthsIncreasedHouseRent?: number;
  total12MonthsSpecialBenefit?: number;
  total12MonthsDeductions?: number;
  total12MonthsNetArrear?: number;

  trace: CalculationTraceStep[];
}

export interface AllowanceInputs {
  grade: number;
  basicPay: number;
  age: number; // in years, e.g. 45 or 52
  cityType: 'dhaka' | 'other_city_corporation' | 'other_areas';
  isGovtQuarterProvided?: boolean;
  childrenCount?: number; // eligible children for education allowance (<=2)
  isEligibleTiffin?: boolean; // Gr 11-20
  isEligibleConveyance?: boolean; // Gr 11-20 in city corp
  hasCurrentCharge?: boolean; // Clause 20 charge allowance
  hasWashAllowance?: boolean; // Clause 23
  hasHillAllowance?: boolean; // Clause 25
  hasHaorAllowance?: boolean; // Clause 26
  specialChildCount?: number; // Clause 28 (3000/child)
  isFestivalMonth?: boolean; // Clause 17
  isBoishakhMonth?: boolean; // Clause 14
  houseRentRule?: '2015_statutory' | '2026_grade_based';
}

export interface AllowanceResult {
  basicPay: number;
  houseRent: number;
  houseRentRatePercentage: number;
  statutoryHouseRentInfo?: StatutoryHouseRentResult;
  medicalAllowance: number;
  bengaliNewYearAllowance: number;
  festivalAllowance: number;
  educationAllowance: number;
  tiffinAllowance: number;
  conveyanceAllowance: number;
  mobileAllowance: number;
  washAllowance: number;
  chargeAllowance: number;
  hillAllowance: number;
  haorAllowance: number;
  specialChildAllowance: number;
  totalAllowances: number;
  grossSalary: number;
  trace: CalculationTraceStep[];
}

export interface DeductionResult {
  gpfDeduction: number;
  incomeTax: number;
  groupInsurance: number;
  benevolentFund: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  trace: CalculationTraceStep[];
}

export interface PensionCalculationResult {
  existingNetPension2015: number;
  appliedSlab: string;
  increasePercentage: number;
  calculatedIncrease: number;
  minNetPension: number;
  maxNetPension: number;
  newNetPension2026: number;
  netPensionDifference: number;
  phase1Percentage: number;
  phase1MonthlyPayableDiff: number;
  phase2Percentage: number;
  phase2MonthlyPayableDiff: number;
  medicalAllowance: number;
  bengaliNewYearAllowance: number;
  festivalAllowanceMonthlyEquiv: number;
  totalMonthlyPension: number;
  trace: CalculationTraceStep[];
}

export interface Employee {
  id: number;
  employeeCode: string;
  nid: string;
  nameBangla: string;
  nameEnglish: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  currentDesignation: string;
  department: string;
  ministry: string;
  cadre: string;
  employeeType: string;
  grade: number;
  currentBasicPay: number;
  previousBasicPay?: number;
  serviceStatus: string;
  gender: string;
  mobile: string;
  email: string;
  bankAccount: string;
  bankName: string;
  branchName: string;
  nomineeName?: string;
  nomineeRelation?: string;
  retirementDate?: string;
  prlStartDate?: string;
  prlEndDate?: string;
  gpfAccountNumber: string;
  gpfBalance?: number;
  cityType: 'dhaka' | 'other_city_corporation' | 'other_areas';
  isGovtQuarterProvided: number;
  childrenCount: number;
  remarks?: string;
}

export interface GPFAccount {
  id: number;
  employeeId: number;
  employeeCode: string;
  nameBangla: string;
  currentDesignation: string;
  grade: number;
  currentBasicPay: number;
  gpfAccountNumber: string;
  openingBalance: number;
  monthlySubscription: number;
  currentBalance: number;
  interestRate: number;
}

export interface GPFTransaction {
  id: number;
  gpfAccountId: number;
  transactionDate: string;
  transactionType: string;
  credit: number;
  debit: number;
  interest: number;
  balanceAfter: number;
  reference: string;
  remarks: string;
}

export interface PayrollRecord {
  id: number;
  fiscalYear: string;
  salaryMonth: string;
  processedDate: string;
  totalEmployees: number;
  totalBasic: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNet: number;
  status: string;
}

export interface PayrollDetailItem {
  id: number;
  payrollId: number;
  employeeId: number;
  employeeCode: string;
  nameBangla: string;
  nameEnglish: string;
  currentDesignation: string;
  department: string;
  grade: number;
  basicPay: number;
  houseRent: number;
  medicalAllowance: number;
  tiffinAllowance: number;
  mobileAllowance: number;
  conveyanceAllowance: number;
  educationAllowance: number;
  festivalAllowance: number;
  bengaliNewYearAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  gpfDeduction: number;
  incomeTax: number;
  otherDeductions: number;
  totalDeduction: number;
  netPay: number;
}

export interface GradeScale {
  grade: number;
  gradeBangla: string;
  minYearsForFullPay?: number;
  scale2015: {
    startingBasic: number;
    endingBasic: number;
    stages: number[];
  };
  scale2026: {
    startingBasic: number;
    endingBasic: number;
    stages: number[];
  };
}

export interface AuditLog {
  id: number;
  action: string;
  entity: string;
  recordId: string;
  username: string;
  details: string;
  timestamp: string;
}
