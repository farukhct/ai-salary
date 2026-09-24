/**
 * Calculation and Rules Engine strictly based on
 * চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ (S.R.O. No. 347-Law/2026)
 */

import { OFFICIAL_PAY_SCALES, OFFICIAL_PENSION_INCREASE_SLABS, GradeScaleData } from './payscaleData.ts';

export interface PayFixationRequest {
  employeeId?: string;
  grade: number;
  drawnBasic2015: number;
  asOfDate?: string; // default "2026-06-30"
  effectiveDate?: string; // default "2026-07-01"
  hasHigherGrade?: boolean;
  hasPromotion?: boolean;
  newPromotionGrade?: number;
  advanceIncrementCount?: number; // Clause 10 advance increments
}

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
  salaryDifference: number; // 2026 basic - 2015 basic
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
    monthlyBasicWithJulyIncrementPayable: number;
    totalDifferenceWithIncrement: number;
    monthlyDisbursedDiffWithIncrement: number;
    monthlyBasicPayableByDiffWithIncrement: number;
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
  payableDifference: number; // Gross payable diff (backward compatibility)
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

/**
 * 3 Stages of Incremental Basic Pay Rates under Section 9 (অনুচ্ছেদ ৯: বার্ষিক বেতনবৃদ্ধি)
 * Strictly codified as per চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬
 */
export const SECTION_9_INCREMENT_RATE_TIERS: Section9IncrementRateTier[] = [
  {
    tierNumber: 1,
    tierNameBangla: "১ম স্তর: ৬ষ্ঠ হইতে ২০তম গ্রেড",
    tierNameEnglish: "Stage 1: Grades 6 to 20",
    gradeCoverageBangla: "৬ষ্ঠ, ৭ম, ৮ম, ৯ম, ১০ম, ১১তম, ১২তম, ১৩তম, ১৪তম, ১৫তম, ১৬তম, ১৭তম, ১৮তম, ১৯তম ও ২০তম গ্রেড",
    gradeCoverageEnglish: "Grades 6 to 20",
    grades: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    statutoryRatePercent: 5.0,
    statutoryRateBangla: "৫.০০%",
    legalBasisBangla: "অনুচ্ছেদ ৯(১) ও ৯(২)",
    descriptionBangla: "৬ষ্ঠ হইতে ২০তম গ্রেডের কর্মচারীদের জন্য বার্ষিক ৫.০০% যৌগিক চক্রবৃদ্ধি হারে ইনক্রিমেন্ট প্রদেয় হয়।"
  },
  {
    tierNumber: 2,
    tierNameBangla: "২য় স্তর: ৩য়, ৪র্থ ও ৫ম গ্রেড",
    tierNameEnglish: "Stage 2: Grades 3, 4 and 5",
    gradeCoverageBangla: "৩য়, ৪র্থ ও ৫ম গ্রেড (৫ম গ্রেড: ৪.০০%, ৩য় ও ৪র্থ গ্রেড: ৩.৫০%)",
    gradeCoverageEnglish: "Grades 3, 4 & 5",
    grades: [3, 4, 5],
    statutoryRatePercent: 4.0,
    statutoryRateBangla: "৩.৫০% - ৪.০০%",
    legalBasisBangla: "অনুচ্ছেদ ৯(১) ও ৯(২)",
    descriptionBangla: "মধ্যম ও ঊর্ধ্বতন পর্যায়ের ৩য়, ৪র্থ ও ৫ম গ্রেডের কর্মকর্তাদের জন্য ৩.৫০% হইতে ৪.০০% হারে ইনক্রিমেন্ট নির্ধারিত।"
  },
  {
    tierNumber: 3,
    tierNameBangla: "৩য় স্তর: ২য় গ্রেড",
    tierNameEnglish: "Stage 3: Grade 2",
    gradeCoverageBangla: "২য় গ্রেড",
    gradeCoverageEnglish: "Grade 2",
    grades: [2],
    statutoryRatePercent: 2.75,
    statutoryRateBangla: "২.৭৫%",
    legalBasisBangla: "অনুচ্ছেদ ৯(১) ও ৯(২)",
    descriptionBangla: "শীর্ষ পর্যায়ের ২য় গ্রেডের কর্মকর্তাদের জন্য ২.৭৫% হারে বার্ষিক বেতনবৃদ্ধি প্রদেয় হয়।"
  }
];

export function getSection9IncrementRateForGrade(grade: number): {
  statutoryRatePercent: number;
  statutoryRateBangla: string;
  rateTierNumber: 1 | 2 | 3;
  rateTierNameBangla: string;
  rateTierCoverageBangla: string;
} {
  if (grade >= 6 && grade <= 20) {
    return {
      statutoryRatePercent: 5.0,
      statutoryRateBangla: "৫.০০%",
      rateTierNumber: 1,
      rateTierNameBangla: "১ম স্তর (৬ষ্ঠ - ২০তম গ্রেড)",
      rateTierCoverageBangla: "৬ষ্ঠ হইতে ২০তম গ্রেড"
    };
  }
  if (grade === 5) {
    return {
      statutoryRatePercent: 4.0,
      statutoryRateBangla: "৪.০০%",
      rateTierNumber: 2,
      rateTierNameBangla: "২য় স্তর (৫ম গ্রেড)",
      rateTierCoverageBangla: "৫ম গ্রেড"
    };
  }
  if (grade === 3 || grade === 4) {
    return {
      statutoryRatePercent: 3.5,
      statutoryRateBangla: "৩.৫০%",
      rateTierNumber: 2,
      rateTierNameBangla: "২য় স্তর (৩য় ও ৪র্থ গ্রেড)",
      rateTierCoverageBangla: "৩য় ও ৪র্থ গ্রেড"
    };
  }
  if (grade === 2) {
    return {
      statutoryRatePercent: 2.75,
      statutoryRateBangla: "২.৭৫%",
      rateTierNumber: 3,
      rateTierNameBangla: "৩য় স্তর (২য় গ্রেড)",
      rateTierCoverageBangla: "২য় গ্রেড"
    };
  }
  return {
    statutoryRatePercent: 0,
    statutoryRateBangla: "০.০০% (নির্ধারিত)",
    rateTierNumber: 3,
    rateTierNameBangla: "১ম গ্রেড (নির্ধারিত)",
    rateTierCoverageBangla: "১ম গ্রেড (কোনো ইনক্রিমেন্ট প্রযোজ্য নহে)"
  };
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

export interface DeductionInputs {
  grossSalary: number;
  basicPay: number;
  gpfPercentage?: number; // default e.g. 10% (min 10%, max 25%)
  customGpfAmount?: number;
  incomeTax?: number;
  groupInsurance?: number;
  benevolentFund?: number;
  otherDeductions?: number;
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

export interface PensionCalculationInputs {
  existingNetPension2015: number;
  age: number;
  isFamilyPension?: boolean;
  familyMembersCount?: number;
  qualifyingServiceYears?: number; // e.g. 25 years
  lastBasicPay?: number; // if retiring fresh
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
  // Phase wise difference
  phase1Percentage: number; // 40% or 50%
  phase1MonthlyPayableDiff: number;
  phase2Percentage: number; // 70% or 75%
  phase2MonthlyPayableDiff: number;
  medicalAllowance: number;
  bengaliNewYearAllowance: number;
  festivalAllowanceMonthlyEquiv: number;
  totalMonthlyPension: number;
  trace: CalculationTraceStep[];
}

export class PayFixationEngine {
  public static getGradeData(grade: number): GradeScaleData {
    const data = OFFICIAL_PAY_SCALES.find(g => g.grade === grade);
    if (!data) {
      throw new Error(`Invalid grade: ${grade}. Grade must be between 1 and 20.`);
    }
    return data;
  }

  /**
   * Fix salary according to Clause 5 of Gazette
   */
  public static calculateFixation(req: PayFixationRequest): PayFixationResult {
    const gradeData = this.getGradeData(req.grade);
    const trace: CalculationTraceStep[] = [];
    const drawn2015 = req.drawnBasic2015;
    const start2015 = gradeData.scale2015.startingBasic;
    const start2026 = gradeData.scale2026.startingBasic;
    const stages2026 = gradeData.scale2026.stages;

    trace.push({
      stepNumber: 1,
      stepName: "Existing Scale & Drawn Basic as of 30 June 2026",
      stepNameBangla: "৩০ জুন ২০২৬ তারিখে বিদ্যমান বেতনস্কেল ও আহরিত মূল বেতন",
      formula: "বিদ্যমান মূল বেতন যাচাই",
      intermediateValues: `গ্রেড: ${gradeData.gradeBangla}, বিদ্যমান স্কেল: ৳${gradeData.scale2015.startingBasic}-${gradeData.scale2015.endingBasic}, আহরিত বেতন: ৳${drawn2015.toLocaleString('en-IN')}`,
      result: drawn2015,
      sourceClause: "অনুচ্ছেদ ২(খ) ও অনুচ্ছেদ ৪",
      sourcePage: 4
    });

    let fixedBasic2026 = start2026;
    let diff2015 = 0;
    let theoreticalSum = start2026;
    let stageIndex = 0;

    // Clause 5(ক): If employee was at initial step of 2015 scale
    if (drawn2015 === start2015) {
      fixedBasic2026 = start2026;
      stageIndex = 0;
      trace.push({
        stepNumber: 2,
        stepName: "Initial Stage Fixation Rule (Clause 5(a))",
        stepNameBangla: "প্রারম্ভিক ধাপে বেতন নির্ধারণ (অনুচ্ছেদ ৫(ক))",
        formula: "বিদ্যমান স্কেলের প্রারম্ভিক ধাপ = ২০২৬ অনুরূপ স্কেলের প্রারম্ভিক ধাপ",
        intermediateValues: `বিদ্যমান প্রারম্ভিক: ৳${start2015.toLocaleString('en-IN')} == ২০২৬ প্রারম্ভিক: ৳${start2026.toLocaleString('en-IN')}`,
        result: fixedBasic2026,
        sourceClause: "অনুচ্ছেদ ৫(ক)",
        sourcePage: 7
      });
    } else {
      // Clause 5(খ): Difference added to 2026 starting step
      diff2015 = drawn2015 - start2015;
      theoreticalSum = start2026 + diff2015;

      trace.push({
        stepNumber: 2,
        stepName: "Calculate Difference from Initial Step (Clause 5(b))",
        stepNameBangla: "প্রারম্ভিক ধাপ হইতে পার্থক্যের পরিমাণ নির্ণয় (অনুচ্ছেদ ৫(খ))",
        formula: "পার্থক্য = ৩০ জুন ২০২৬ আহরিত বেতন - বিদ্যমান স্কেলের প্রারম্ভিক ধাপ",
        intermediateValues: `৳${drawn2015.toLocaleString('en-IN')} - ৳${start2015.toLocaleString('en-IN')} = ৳${diff2015.toLocaleString('en-IN')}`,
        result: diff2015,
        sourceClause: "অনুচ্ছেদ ৫(খ)",
        sourcePage: 7
      });

      trace.push({
        stepNumber: 3,
        stepName: "Add Difference to 2026 Initial Step",
        stepNameBangla: "অনুরূপ ২০২৬ স্কেলের প্রারম্ভিক ধাপের সহিত পার্থক্য যোগ",
        formula: "যোগফল = ২০২৬ স্কেলের প্রারম্ভিক ধাপ + পার্থক্য",
        intermediateValues: `৳${start2026.toLocaleString('en-IN')} + ৳${diff2015.toLocaleString('en-IN')} = ৳${theoreticalSum.toLocaleString('en-IN')}`,
        result: theoreticalSum,
        sourceClause: "অনুচ্ছেদ ৫(খ)",
        sourcePage: 7
      });

      // Find if exact match exists in 2026 scale (Clause 5(খ)(অ)) or take next higher stage (Clause 5(খ)(আ))
      const exactIndex = stages2026.indexOf(theoreticalSum);
      if (exactIndex !== -1) {
        fixedBasic2026 = theoreticalSum;
        stageIndex = exactIndex;
        trace.push({
          stepNumber: 4,
          stepName: "Exact Stage Match (Clause 5(b)(i))",
          stepNameBangla: "অনুরূপ স্কেলে হুবহু ধাপ পাওয়া গিয়াছে (অনুচ্ছেদ ৫(খ)(অ))",
          formula: "যোগফল = ২০২৬ স্কেলের নির্দিষ্ট ধাপ",
          intermediateValues: `যোগফল ৳${theoreticalSum.toLocaleString('en-IN')} ধাপ #${stageIndex + 1} এর সমান`,
          result: fixedBasic2026,
          sourceClause: "অনুচ্ছেদ ৫(খ)(অ)",
          sourcePage: 7
        });
      } else {
        // Next higher stage
        let nextIndex = stages2026.findIndex(s => s > theoreticalSum);
        if (nextIndex === -1) {
          // If above highest stage, cap at highest stage
          nextIndex = stages2026.length - 1;
        }
        fixedBasic2026 = stages2026[nextIndex];
        stageIndex = nextIndex;
        trace.push({
          stepNumber: 4,
          stepName: "Next Higher Stage Allocation (Clause 5(b)(ii))",
          stepNameBangla: "অনুরূপ স্কেলে ঐ অংকের সমান ধাপ না থাকায় পরবর্তী উচ্চতর ধাপ নির্ধারণ (অনুচ্ছেদ ৫(খ)(আ))",
          formula: "পরবর্তী উচ্চতর ধাপ = Next higher stage in 2026 scale",
          intermediateValues: `যোগফল ৳${theoreticalSum.toLocaleString('en-IN')} এর পরবর্তী উচ্চতর ধাপ #${stageIndex + 1}: ৳${fixedBasic2026.toLocaleString('en-IN')}`,
          result: fixedBasic2026,
          sourceClause: "অনুচ্ছেদ ৫(খ)(আ) এবং উদাহরণ ২",
          sourcePage: 7
        });
      }
    }

    // Advance Increments on first appointment (Clause 10)
    if (req.advanceIncrementCount && req.advanceIncrementCount > 0) {
      const origStage = stageIndex;
      const targetStage = Math.min(stages2026.length - 1, stageIndex + req.advanceIncrementCount);
      fixedBasic2026 = stages2026[targetStage];
      stageIndex = targetStage;
      trace.push({
        stepNumber: 5,
        stepName: "Advance Increment(s) on First Appointment",
        stepNameBangla: "প্রথম নিয়োগে অগ্রিম বেতনবৃদ্ধি (অনুচ্ছেদ ১০)",
        formula: `অগ্রিম বেতনবৃদ্ধি সংখ্যা: ${req.advanceIncrementCount}`,
        intermediateValues: `ধাপ #${origStage + 1} হইতে ধাপ #${targetStage + 1} এ উত্তীর্ণ`,
        result: fixedBasic2026,
        sourceClause: "অনুচ্ছেদ ১০(ক/খ/গ)",
        sourcePage: 11
      });
    }

    // Section 9 Incremental Rate & 3 Stages Calculation
    const sec9RateInfo = getSection9IncrementRateForGrade(req.grade);
    const incrementIndex = Math.min(stages2026.length - 1, stageIndex + 1);
    const basicWithIncrement = stages2026[incrementIndex];
    const incrementAmount = basicWithIncrement - fixedBasic2026;
    const effectiveIncrementPct = fixedBasic2026 > 0 ? Number(((incrementAmount / fixedBasic2026) * 100).toFixed(2)) : 0;

    trace.push({
      stepNumber: trace.length + 1,
      stepName: "Section 9 Incremental Rate Tier Classification",
      stepNameBangla: "বার্ষিক বেতনবৃদ্ধির হার ও ৩টি ধাপ/স্তর নির্ধারণ (অনুচ্ছেদ ৯(২))",
      formula: `গ্রেডভিত্তিক সংবিধিবদ্ধ হার: ${sec9RateInfo.statutoryRateBangla}`,
      intermediateValues: `${req.grade}ম গ্রেড অন্তর্ভুক্ত: ${sec9RateInfo.rateTierNameBangla} (${sec9RateInfo.rateTierCoverageBangla}), সংবিধিবদ্ধ ইনক্রিমেন্ট হার = ${sec9RateInfo.statutoryRateBangla}`,
      result: `${sec9RateInfo.statutoryRateBangla}`,
      sourceClause: "অনুচ্ছেদ ৯(১) ও ৯(২)",
      sourcePage: 11
    });

    trace.push({
      stepNumber: trace.length + 1,
      stepName: "Annual Increment on 1 July 2026 (Clause 9(2))",
      stepNameBangla: "১ জুলাই ২০২৬ তারিখে ১টি বার্ষিক বেতনবৃদ্ধি (অনুচ্ছেদ ৯(২))",
      formula: "নির্ধারিত বেতন + পরবর্তী ধাপের বেতনবৃদ্ধি",
      intermediateValues: `নির্ধারিত মূল বেতন ৳${fixedBasic2026.toLocaleString('en-IN')} + বেতনবৃদ্ধি ৳${incrementAmount.toLocaleString('en-IN')} (কার্যকর হার ${effectiveIncrementPct}%) = ৳${basicWithIncrement.toLocaleString('en-IN')}`,
      result: basicWithIncrement,
      sourceClause: "অনুচ্ছেদ ৯(২)",
      sourcePage: 11
    });

    // 3 Stages of Incremental Basic Pay Scale Classification
    const totalStages = stages2026.length;
    let currentTier: 1 | 2 | 3 = 2;
    let currentTierName = "২য় স্তর: ইনক্রিমেন্টাল প্রবৃদ্ধি ধাপসমূহ";
    let tierDescription = "নিয়মিত বার্ষিক বেতনবৃদ্ধির মাধ্যমে অর্জিত মধ্যবর্তী ধাপে অবস্থান (অনুচ্ছেদ ৫(খ) ও ৯(২))।";
    let isCeilingReached = false;
    let stagnationIncrementAmount = 0;

    if (stageIndex === 0) {
      currentTier = 1;
      currentTierName = "১ম স্তর: প্রারম্ভিক ধাপ (Entry / Starting Basic)";
      tierDescription = "স্কেলের সর্বনিম্ন বা প্রারম্ভিক ধাপে অবস্থান (অনুচ্ছেদ ৫(ক))।";
    } else if (stageIndex >= totalStages - 1) {
      currentTier = 3;
      currentTierName = "৩য় স্তর: সর্বোচ্চ সিলিং ও স্থবিরতা ধাপ (Ceiling & Stagnation)";
      tierDescription = "স্কেলের সর্বশেষ ধাপে অবস্থান। অনুচ্ছেদ ৯(৩) অনুযায়ী ১ বছর পূর্তিতে ৫% স্থবিরতা ইনক্রিমেন্ট প্রাপ্য।";
      isCeilingReached = true;
      stagnationIncrementAmount = Math.round(fixedBasic2026 * 0.05);

      trace.push({
        stepNumber: trace.length + 1,
        stepName: "Stagnation Increment under Clause 9(3)",
        stepNameBangla: "সর্বোচ্চ স্কেল সিলিংয়ে স্থবিরতা ইনক্রিমেন্ট প্রাপ্যতা (অনুচ্ছেদ ৯(৩))",
        formula: "মূল বেতনের ৫% স্থবিরতা বেতনবৃদ্ধি",
        intermediateValues: `সর্বোচ্চ ধাপ ৳${fixedBasic2026.toLocaleString('en-IN')} এ ১ বছর অতিক্রান্তে ৫% হারে ব্যক্তিগত বেতনবৃদ্ধি = ৳${stagnationIncrementAmount.toLocaleString('en-IN')}`,
        result: stagnationIncrementAmount,
        sourceClause: "অনুচ্ছেদ ৯(৩)",
        sourcePage: 11
      });
    }

    const section9Increment: Section9IncrementInfo = {
      grade: req.grade,
      statutoryRatePercent: sec9RateInfo.statutoryRatePercent,
      statutoryRateBangla: sec9RateInfo.statutoryRateBangla,
      rateTierNumber: sec9RateInfo.rateTierNumber,
      rateTierNameBangla: sec9RateInfo.rateTierNameBangla,
      rateTierCoverageBangla: sec9RateInfo.rateTierCoverageBangla,
      fixedBasic2026,
      annualIncrementAmount: incrementAmount,
      basicWithJuly2026Increment: basicWithIncrement,
      effectiveIncrementPercentage: effectiveIncrementPct,
      isCeilingReached,
      isStagnationIncrement: isCeilingReached,
      stagnationIncrementAmount,
      statutoryClause: isCeilingReached ? "অনুচ্ছেদ ৯(৩)" : "অনুচ্ছেদ ৯(১) ও ৯(২)",
      explanationBangla: isCeilingReached
        ? "কর্মচারী স্কেলের সর্বোচ্চ সিলিং ধাপে উপনীত হওয়ায় অনুচ্ছেদ ৯(৩) অনুযায়ী ১ বছর পূর্তিতে ৫.০০% ব্যক্তিগত স্থবিরতা বেতনবৃদ্ধি (Stagnation Increment) প্রাপ্য হইবেন।"
        : `চাকরি আদেশ, ২০২৬ এর অনুচ্ছেদ ৯(২) মোতাবেক ${req.grade}ম গ্রেডের নির্ধারিত বার্ষিক ইনক্রিমেন্ট হার ${sec9RateInfo.statutoryRateBangla} (${sec9RateInfo.rateTierNameBangla})। ১ জুলাই ২০২৬ তারিখে পরবর্তী ধাপে (ধাপ #${stageIndex + 2}) বেতনবৃদ্ধি প্রদেয়।`,
      threeRateTiers: SECTION_9_INCREMENT_RATE_TIERS
    };

    // 3 Disbursement Stages (Clause 1(3)) linked with 1 July 2026 Increment (Clause 9(2))
    const isHigherGrade = req.grade <= 9;
    const p1Pct = isHigherGrade ? 40 : 50;
    const p2Pct = isHigherGrade ? 70 : 75;
    const p3Pct = 100;
    const salDiff = fixedBasic2026 - drawn2015;
    const p1MonthlyDiff = Math.round((salDiff * p1Pct) / 100);
    const p2MonthlyDiff = Math.round((salDiff * p2Pct) / 100);

    const totalDiffWithInc = basicWithIncrement - drawn2015;
    const p1MonthlyDiffWithInc = Math.round((totalDiffWithInc * p1Pct) / 100);
    const p2MonthlyDiffWithInc = Math.round((totalDiffWithInc * p2Pct) / 100);

    const disbursementStages = [
      {
        stageNumber: 1 as const,
        periodBangla: "১ম পর্যায়: ১ জুলাই ২০২৬ হইতে ৩১ ডিসেম্বর ২০২৬",
        periodEnglish: "Phase 1: 1 July 2026 - 31 Dec 2026",
        percentage: p1Pct,
        monthlyDisbursedDiff: p1MonthlyDiffWithInc,
        monthlyBasicPayable: drawn2015 + p1MonthlyDiffWithInc,
        sourceClause: "অনুচ্ছেদ ১(৩)(ক) ও ৯(২)",
        annualIncrementAmount: incrementAmount,
        fixedBasicWithIncrement: basicWithIncrement,
        totalDifferenceWithIncrement: totalDiffWithInc,
        monthlyDisbursedDiffWithIncrement: p1MonthlyDiffWithInc,
        monthlyBasicPayableByDiffWithIncrement: drawn2015 + p1MonthlyDiffWithInc,
        monthlyBasicWithJulyIncrementPayable: drawn2015 + p1MonthlyDiffWithInc,
        baseDiffWithoutIncrement: salDiff,
        monthlyDisbursedDiffWithoutIncrement: p1MonthlyDiff
      },
      {
        stageNumber: 2 as const,
        periodBangla: "২য় পর্যায়: ১ জানুয়ারি ২০২৭ হইতে ৩০ জুন ২০২৭",
        periodEnglish: "Phase 2: 1 Jan 2027 - 30 June 2027",
        percentage: p2Pct,
        monthlyDisbursedDiff: p2MonthlyDiffWithInc,
        monthlyBasicPayable: drawn2015 + p2MonthlyDiffWithInc,
        sourceClause: "অনুচ্ছেদ ১(৩)(খ) ও ৯(২)",
        annualIncrementAmount: incrementAmount,
        fixedBasicWithIncrement: basicWithIncrement,
        totalDifferenceWithIncrement: totalDiffWithInc,
        monthlyDisbursedDiffWithIncrement: p2MonthlyDiffWithInc,
        monthlyBasicPayableByDiffWithIncrement: drawn2015 + p2MonthlyDiffWithInc,
        monthlyBasicWithJulyIncrementPayable: drawn2015 + p2MonthlyDiffWithInc,
        baseDiffWithoutIncrement: salDiff,
        monthlyDisbursedDiffWithoutIncrement: p2MonthlyDiff
      },
      {
        stageNumber: 3 as const,
        periodBangla: "৩য় পর্যায়: ১ জুলাই ২০২৭ হইতে পরবর্তী সময়",
        periodEnglish: "Phase 3: From 1 July 2027 onwards",
        percentage: p3Pct,
        monthlyDisbursedDiff: totalDiffWithInc,
        monthlyBasicPayable: basicWithIncrement,
        sourceClause: "অনুচ্ছেদ ১(৩)(গ) ও ৯(২)",
        annualIncrementAmount: incrementAmount,
        fixedBasicWithIncrement: basicWithIncrement,
        totalDifferenceWithIncrement: totalDiffWithInc,
        monthlyDisbursedDiffWithIncrement: totalDiffWithInc,
        monthlyBasicPayableByDiffWithIncrement: basicWithIncrement,
        monthlyBasicWithJulyIncrementPayable: basicWithIncrement,
        baseDiffWithoutIncrement: salDiff,
        monthlyDisbursedDiffWithoutIncrement: salDiff
      }
    ];

    trace.push({
      stepNumber: trace.length + 1,
      stepName: "Disbursement Stages Calculated by Adding Increment to Fixed Pay (Clause 1(3) & 9(2))",
      stepNameBangla: "নির্ধারিত বেতনের সাথে ১টি ইনক্রিমেন্ট যোগ করে স্কেল পার্থক্যের প্রদেয় অংশ ও মাসিক বেতন নির্ধারণ (অনুচ্ছেদ ১(৩) ও ৯(২))",
      formula: "স্কেল পার্থক্যের প্রদেয় অংশ = [(নির্ধারিত মূল বেতন + ১টি ইনক্রিমেন্ট) - ২০১৫ আহরিত মূল বেতন] × প্রদেয় হার%",
      intermediateValues: `ইনক্রিমেন্টসহ নির্ধারিত বেতন ৳${basicWithIncrement.toLocaleString('en-IN')}, মোট স্কেল পার্থক্য ৳${totalDiffWithInc.toLocaleString('en-IN')}. ১ম পর্যায় (${p1Pct}%): প্রদেয় পার্থক্য ৳${p1MonthlyDiffWithInc.toLocaleString('en-IN')}, মাসিক বেতন ৳${(drawn2015 + p1MonthlyDiffWithInc).toLocaleString('en-IN')} | ২য় পর্যায় (${p2Pct}%): প্রদেয় পার্থক্য ৳${p2MonthlyDiffWithInc.toLocaleString('en-IN')}, মাসিক বেতন ৳${(drawn2015 + p2MonthlyDiffWithInc).toLocaleString('en-IN')} | ৩য় পর্যায় (১০০%): প্রদেয় পার্থক্য ৳${totalDiffWithInc.toLocaleString('en-IN')}, মাসিক বেতন ৳${basicWithIncrement.toLocaleString('en-IN')}`,
      result: `১ম পর্যায়: ৳${(drawn2015 + p1MonthlyDiffWithInc).toLocaleString('en-IN')}, ২য় পর্যায়: ৳${(drawn2015 + p2MonthlyDiffWithInc).toLocaleString('en-IN')}, ৩য় পর্যায়: ৳${basicWithIncrement.toLocaleString('en-IN')}`,
      sourceClause: "অনুচ্ছেদ ১(৩) ও অনুচ্ছেদ ৯(২)",
      sourcePage: 2
    });

    return {
      grade: req.grade,
      drawnBasic2015: drawn2015,
      startingBasic2015: start2015,
      startingBasic2026: start2026,
      difference2015: diff2015,
      theoreticalSum: theoreticalSum,
      fixedBasic2026: fixedBasic2026,
      fixationStageIndex: stageIndex,
      salaryDifference: fixedBasic2026 - drawn2015,
      annualIncrementAmount: incrementAmount,
      basicWithJuly2026Increment: basicWithIncrement,
      effectiveDate: req.effectiveDate || "2026-07-01",
      ruleCode: "CLAUSE_5",
      ruleNameBangla: "চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬ এর অনুচ্ছেদ ৫",
      trace,
      scaleStageTier: {
        currentTier,
        currentTierName,
        stageNumber: stageIndex + 1,
        totalStagesInGrade: totalStages,
        isCeilingReached,
        tierDescription,
        stagnationIncrementEligible: isCeilingReached,
        stagnationIncrementAmount
      },
      disbursementStages,
      section9Increment
    };
  }

  /**
   * Calculate Statutory House Rent Allowance strictly based on Pay Scale 2015 Schedule (effective 1 July 2016)
   * Slab-based percentage and statutory minimum amounts by location
   */
  public static calculateStatutoryHouseRent2015(
    basicSalary: number,
    location: HouseRentLocation = 'dhaka',
    isGovtQuarter: boolean = false
  ): StatutoryHouseRentResult {
    const locNameBn = location === 'dhaka'
      ? 'ঢাকা সিটি কর্পোরেশন এলাকা'
      : location === 'other_city_corporation'
      ? 'চট্টগ্রাম, খুলনা, রাজশাহী, সিলেট, বরিশাল, রংপুর, নারায়ণগঞ্জ ও গাজীপুর সিটি কর্পোরেশন এবং সাভার পৌর এলাকা'
      : 'অন্যান্য এলাকা (জেলা ও উপজেলা)';

    if (isGovtQuarter) {
      return {
        basicSalary,
        location,
        locationNameBangla: locNameBn,
        isGovtQuarter: true,
        tierNumber: 1,
        tierRangeText: 'সরকারি বাসস্থান বরাদ্দপ্রাপ্ত',
        ratePercentage: 0,
        calculatedAmount: 0,
        minimumAmount: 0,
        finalAmount: 0,
        minApplied: false,
        explanationBangla: 'সরকারি আবাসন বরাদ্দপ্রাপ্ত হওয়ায় বাড়ি ভাড়া ভাতা শূন্য (০) টাকা।'
      };
    }

    let tierNumber: 1 | 2 | 3 | 4 = 1;
    let tierRangeText = '';
    let ratePercentage = 0;
    let minimumAmount = 0;

    if (basicSalary <= 9700) {
      tierNumber = 1;
      tierRangeText = '৯,৭০০ টাকা পর্যন্ত (Up to 9,700 Taka)';
      if (location === 'dhaka') {
        ratePercentage = 65;
        minimumAmount = 5600;
      } else if (location === 'other_city_corporation') {
        ratePercentage = 55;
        minimumAmount = 5000;
      } else {
        ratePercentage = 50;
        minimumAmount = 4500;
      }
    } else if (basicSalary <= 16000) {
      tierNumber = 2;
      tierRangeText = '৯,৭০১ টাকা হইতে ১৬,০০০ টাকা পর্যন্ত (From Tk 9,701 to Tk 16,000)';
      if (location === 'dhaka') {
        ratePercentage = 60;
        minimumAmount = 6400;
      } else if (location === 'other_city_corporation') {
        ratePercentage = 50;
        minimumAmount = 5400;
      } else {
        ratePercentage = 45;
        minimumAmount = 4800;
      }
    } else if (basicSalary <= 35500) {
      tierNumber = 3;
      tierRangeText = '১৬,০০১ টাকা হইতে ৩৫,৫০০ টাকা পর্যন্ত (From Tk 16,001 to Tk 35,500)';
      if (location === 'dhaka') {
        ratePercentage = 55;
        minimumAmount = 9600;
      } else if (location === 'other_city_corporation') {
        ratePercentage = 45;
        minimumAmount = 8000;
      } else {
        ratePercentage = 40;
        minimumAmount = 7000;
      }
    } else {
      tierNumber = 4;
      tierRangeText = '৩৫,৫০১ টাকা ও তদূর্ধ্ব (Tk 35,501 and above)';
      if (location === 'dhaka') {
        ratePercentage = 50;
        minimumAmount = 19500;
      } else if (location === 'other_city_corporation') {
        ratePercentage = 40;
        minimumAmount = 16000;
      } else {
        ratePercentage = 35;
        minimumAmount = 13800;
      }
    }

    const calculatedAmount = Math.round((basicSalary * ratePercentage) / 100);
    const minApplied = calculatedAmount < minimumAmount;
    const finalAmount = Math.max(calculatedAmount, minimumAmount);

    const explanationBangla = `মূল বেতন ৳${basicSalary.toLocaleString('en-IN')} (স্ল্যাব: ${tierRangeText})। ${locNameBn}র জন্য নির্ধারিত হার ${ratePercentage}%, যার পরিমাণ ৳${calculatedAmount.toLocaleString('en-IN')}${minApplied ? `, তবে সারণির বিধিবদ্ধ ন্যূনতম সীমা ৳${minimumAmount.toLocaleString('en-IN')} প্রযোজ্য হওয়ায় বাড়ি ভাড়া ভাতা ৳${finalAmount.toLocaleString('en-IN')}` : ` (ন্যূনতম সীমা ৳${minimumAmount.toLocaleString('en-IN')} এর বেশি হওয়ায় ৳${finalAmount.toLocaleString('en-IN')})`}।`;

    return {
      basicSalary,
      location,
      locationNameBangla: locNameBn,
      isGovtQuarter: false,
      tierNumber,
      tierRangeText,
      ratePercentage,
      calculatedAmount,
      minimumAmount,
      finalAmount,
      minApplied,
      explanationBangla
    };
  }

  /**
   * Calculate Arrears & Phase-wise difference according to Clause 1(3)
   * With statutory deductions for Increased House Rent and 15% Special Benefit
   * Based on grade/step as of June 30, 2026 and subsequent step as of July 1, 2026
   */
  public static calculateArrears(
    grade: number,
    drawn2015: number,
    fixed2026: number,
    location: HouseRentLocation = 'dhaka',
    isGovtQuarter: boolean = false,
    options?: {
      stepNumber?: number; // 1-based step in grade
      customIncrementPct?: number; // default 5%
      customSpecialBenefitPct?: number; // default 15%
      july1BasicOverride?: number;
    }
  ): ArrearCalculationResult {
    const diff = fixed2026 - drawn2015;
    const isHigherGrade = grade <= 9; // Grade 1 to 9 (৯ম গ্রেড ও তদূর্ধ্ব)
    const trace: CalculationTraceStep[] = [];

    // Resolve Grade and Step in 2015 Pay Scale
    const scale = OFFICIAL_PAY_SCALES.find(s => s.grade === grade);
    let stepNumber2015 = 1;
    let totalStepsInGrade2015 = scale ? scale.scale2015.stages.length : 1;
    let subsequentStepNumber2015 = 2;
    let subsequentStepBasic2015 = drawn2015;
    let isAtCeiling2015 = false;

    if (scale && scale.scale2015.stages.length > 0) {
      const stages = scale.scale2015.stages;
      totalStepsInGrade2015 = stages.length;

      let stageIdx = -1;
      if (options?.stepNumber && options.stepNumber >= 1 && options.stepNumber <= stages.length) {
        stageIdx = options.stepNumber - 1;
      } else {
        stageIdx = stages.findIndex(s => s === drawn2015);
        if (stageIdx === -1) {
          stageIdx = stages.findIndex(s => s >= drawn2015);
          if (stageIdx === -1) stageIdx = stages.length - 1;
        }
      }

      stepNumber2015 = stageIdx + 1;

      if (stageIdx < stages.length - 1) {
        subsequentStepNumber2015 = stageIdx + 2;
        subsequentStepBasic2015 = stages[stageIdx + 1];
        isAtCeiling2015 = false;
      } else {
        // At ceiling: subsequent is personal increment / 5%
        subsequentStepNumber2015 = stages.length;
        const inc = Math.round((drawn2015 * (options?.customIncrementPct ?? 5)) / 100);
        subsequentStepBasic2015 = drawn2015 + inc;
        isAtCeiling2015 = true;
      }
    } else {
      const inc = Math.round((drawn2015 * (options?.customIncrementPct ?? 5)) / 100);
      subsequentStepBasic2015 = drawn2015 + inc;
    }

    if (options?.july1BasicOverride) {
      subsequentStepBasic2015 = options.july1BasicOverride;
    }

    const increment5PctAmount = subsequentStepBasic2015 - drawn2015;
    const july1Basic2015WithIncrement = subsequentStepBasic2015;

    // Step 1: House Rent as of 30 June 2026 based on drawn grade/step
    const houseRentJune2026 = this.calculateStatutoryHouseRent2015(drawn2015, location, isGovtQuarter);

    // Step 2 & 3: 15% Special Benefit based on subsequent step of that grade
    const sbPct = options?.customSpecialBenefitPct ?? 15;
    const specialBenefit15PctAmount = Math.round((subsequentStepBasic2015 * sbPct) / 100);

    // Step 4: House Rent as of 1 July 2026 based on subsequent step of that grade
    const houseRentJuly2026 = this.calculateStatutoryHouseRent2015(subsequentStepBasic2015, location, isGovtQuarter);

    // Step 5: Isolate Increased House Rent Allowance (July 1 - June 30)
    const monthlyIncreasedHouseRent = Math.max(0, houseRentJuly2026.finalAmount - houseRentJune2026.finalAmount);

    // Step 6: Total Monthly Deductions from Arrears (Increased HRA + Special Benefit)
    const monthlyTotalDeductions = monthlyIncreasedHouseRent + specialBenefit15PctAmount;

    // Phase 1 (1 July 2026 to 31 December 2026):
    // Clause 1(3)(ক): 40% for Grade 1-9; 50% for Grade 10-20
    const phase1Pct = isHigherGrade ? 40 : 50;
    const phase1MonthlyGross = Math.round((diff * phase1Pct) / 100);
    const phase1MonthlyNet = Math.max(0, phase1MonthlyGross - monthlyTotalDeductions);

    // Phase 2 (1 January 2027 to 30 June 2027):
    // Clause 1(3)(খ): 70% for Grade 1-9; 75% for Grade 10-20
    const phase2Pct = isHigherGrade ? 70 : 75;
    const phase2MonthlyGross = Math.round((diff * phase2Pct) / 100);
    const phase2MonthlyNet = Math.max(0, phase2MonthlyGross - monthlyTotalDeductions);

    // Phase 3 (From 1 July 2027): 100% full pay with increment
    const phase3Pct = 100;
    const phase3MonthlyGross = diff;
    const phase3MonthlyNet = Math.max(0, phase3MonthlyGross - monthlyTotalDeductions);

    // Trace Step 1: House Rent June 30, 2026
    trace.push({
      stepNumber: 1,
      stepName: "House Rent Allowance as of 30 June 2026 (Pay Scale 2015 Schedule)",
      stepNameBangla: `৩০ জুন ২০২৬ আহরিত গ্রেড ও ধাপের বাড়ি ভাড়া ভাতা (${grade}ম গ্রেড, ${stepNumber2015}নং ধাপ)`,
      formula: `আহরিত মূল বেতন ৳${drawn2015.toLocaleString('en-IN')} এর উপর ${houseRentJune2026.ratePercentage}% (ন্যূনতম ৳${houseRentJune2026.minimumAmount.toLocaleString('en-IN')})`,
      intermediateValues: `${houseRentJune2026.locationNameBangla}, স্ল্যাব: ${houseRentJune2026.tierRangeText}। হিসাবকৃত: ৳${houseRentJune2026.calculatedAmount.toLocaleString('en-IN')}, বিধিবদ্ধ প্রদেয়: ৳${houseRentJune2026.finalAmount.toLocaleString('en-IN')}`,
      result: houseRentJune2026.finalAmount,
      sourceClause: "২০১৫ বেতনস্কেলের বাড়ি ভাড়া সারণি (কার্যকর ১ জুলাই ২০১৬)",
      sourcePage: 1
    });

    // Trace Step 2: Subsequent step of the grade
    trace.push({
      stepNumber: 2,
      stepName: "Subsequent Step of the Grade for 1 July 2026",
      stepNameBangla: `উক্ত গ্রেডের পরবর্তী ধাপ (${grade}ম গ্রেড, ${subsequentStepNumber2015}নং ধাপ)`,
      formula: isAtCeiling2015 ? "সর্বোচ্চ ধাপে ৫% স্থবিরতা/ব্যক্তিগত ইনক্রিমেন্ট" : "স্কেলের পরবর্তী উচ্চতর ধাপ",
      intermediateValues: `৩০ জুন আহরিত ধাপ #${stepNumber2015} (৳${drawn2015.toLocaleString('en-IN')}) হতে পরবর্তী ধাপ #${subsequentStepNumber2015} = ৳${subsequentStepBasic2015.toLocaleString('en-IN')} (বৃদ্ধি ৳${increment5PctAmount.toLocaleString('en-IN')})`,
      result: subsequentStepBasic2015,
      sourceClause: "২০১৫ বেতনস্কেলের ধাপ ও বার্ষিক বেতনবৃদ্ধি বিধিমালা",
      sourcePage: 1
    });

    // Trace Step 3: 15% Special Benefit on subsequent step
    trace.push({
      stepNumber: 3,
      stepName: "15% Special Benefit based on Subsequent Step",
      stepNameBangla: "পরবর্তী ধাপের মূল বেতনের ভিত্তিতে ১৫% বিশেষ সুবিধা নির্ধারণ",
      formula: `পরবর্তী ধাপের মূল বেতন (৳${subsequentStepBasic2015.toLocaleString('en-IN')}) × ১৫%`,
      intermediateValues: `৳${subsequentStepBasic2015.toLocaleString('en-IN')} × ১৫% = ৳${specialBenefit15PctAmount.toLocaleString('en-IN')}`,
      result: specialBenefit15PctAmount,
      sourceClause: "বিশেষ সুবিধা পরিপত্র",
      sourcePage: 1
    });

    // Trace Step 4: House Rent July 1, 2026 on subsequent step & Increased House Rent isolated
    trace.push({
      stepNumber: 4,
      stepName: "House Rent Allowance as of 1 July 2026 & Increased House Rent Allowance",
      stepNameBangla: "১ জুলাই ২০২৬ পরবর্তী ধাপের বাড়ি ভাড়া ও বৃদ্ধিপ্রাপ্ত বাড়ি ভাড়া ভাতা পৃথকীকরণ",
      formula: "১ জুলাই বাড়ি ভাড়া - ৩০ জুন বাড়ি ভাড়া",
      intermediateValues: `১ জুলাই পরবর্তী ধাপের বাড়ি ভাড়া ৳${houseRentJuly2026.finalAmount.toLocaleString('en-IN')} (হার ${houseRentJuly2026.ratePercentage}%) - ৩০ জুন আহরিত ধাপের বাড়ি ভাড়া ৳${houseRentJune2026.finalAmount.toLocaleString('en-IN')} = বৃদ্ধিপ্রাপ্ত বাড়ি ভাড়া ৳${monthlyIncreasedHouseRent.toLocaleString('en-IN')}`,
      result: monthlyIncreasedHouseRent,
      sourceClause: "২০১৫ বেতনস্কেলের বাড়ি ভাড়া সারণি",
      sourcePage: 1
    });

    // Trace Step 5: Arrear Difference & Phase Percentages
    trace.push({
      stepNumber: 5,
      stepName: "Salary Difference Determination (Clause 1(3))",
      stepNameBangla: "বেতন পার্থক্যের মোট অংক ও পর্যায়ভিত্তিক প্রদেয় হার",
      formula: "পার্থক্য = নতুন মূল বেতন - ৩০ জুন আহরিত মূল বেতন",
      intermediateValues: `৳${fixed2026.toLocaleString('en-IN')} - ৳${drawn2015.toLocaleString('en-IN')} = ৳${diff.toLocaleString('en-IN')} (১ম পর্যায়: ${phase1Pct}%, ২য় পর্যায়: ${phase2Pct}%)`,
      result: diff,
      sourceClause: "অনুচ্ছেদ ১(৩)(ক) ও ১(৩)(খ)",
      sourcePage: 1
    });

    // Trace Step 6: Deductions and Net Payable Arrears
    trace.push({
      stepNumber: 6,
      stepName: "Deduction of Increased House Rent & Special Benefit for Net Arrears",
      stepNameBangla: "বর্ধিত বাড়ি ভাড়া ও বিশেষ সুবিধা পৃথকভাবে কর্তনপূর্বক নীট প্রদেয় বকেয়া নির্ধারণ",
      formula: "নীট প্রদেয় বকেয়া = পর্যায়ভিত্তিক মোট বকেয়া - (বর্ধিত বাড়ি ভাড়া + ১৫% বিশেষ সুবিধা)",
      intermediateValues: `মাসিক মোট কর্তন: ৳${monthlyIncreasedHouseRent.toLocaleString('en-IN')} (বাড়ি ভাড়া বৃদ্ধি) + ৳${specialBenefit15PctAmount.toLocaleString('en-IN')} (১৫% বিশেষ সুবিধা) = ৳${monthlyTotalDeductions.toLocaleString('en-IN')}। ১ম পর্যায় নীট: ৳${phase1MonthlyGross.toLocaleString('en-IN')} - ৳${monthlyTotalDeductions.toLocaleString('en-IN')} = ৳${phase1MonthlyNet.toLocaleString('en-IN')}/মাস | ২য় পর্যায় নীট: ৳${phase2MonthlyGross.toLocaleString('en-IN')} - ৳${monthlyTotalDeductions.toLocaleString('en-IN')} = ৳${phase2MonthlyNet.toLocaleString('en-IN')}/মাস`,
      result: `১ম পর্যায় নীট: ৳${phase1MonthlyNet.toLocaleString('en-IN')}/মাস, ২য় পর্যায় নীট: ৳${phase2MonthlyNet.toLocaleString('en-IN')}/মাস`,
      sourceClause: "বকেয়া ও সমন্বয় বিধিমালা",
      sourcePage: 2
    });

    // 12 Months Breakdown
    const monthlyBreakdown: ArrearMonthBreakdown[] = [];
    const monthsPhase1 = [
      { m: "July", y: 2026 },
      { m: "August", y: 2026 },
      { m: "September", y: 2026 },
      { m: "October", y: 2026 },
      { m: "November", y: 2026 },
      { m: "December", y: 2026 }
    ];

    monthsPhase1.forEach(item => {
      monthlyBreakdown.push({
        month: item.m,
        year: item.y,
        phase: "Phase 1",
        phaseBangla: "১ম পর্যায়",
        basic2015: drawn2015,
        fixedBasic2026: fixed2026,
        difference: diff,
        percentage: phase1Pct,
        payableDifference: phase1MonthlyGross,
        grossPayableDifference: phase1MonthlyGross,
        increasedHouseRent: monthlyIncreasedHouseRent,
        specialBenefit: specialBenefit15PctAmount,
        totalMonthlyDeduction: monthlyTotalDeductions,
        netPayableDifference: phase1MonthlyNet,
        sourceClause: "অনুচ্ছেদ ১(৩)(ক)"
      });
    });

    const monthsPhase2 = [
      { m: "January", y: 2027 },
      { m: "February", y: 2027 },
      { m: "March", y: 2027 },
      { m: "April", y: 2027 },
      { m: "May", y: 2027 },
      { m: "June", y: 2027 }
    ];

    monthsPhase2.forEach(item => {
      monthlyBreakdown.push({
        month: item.m,
        year: item.y,
        phase: "Phase 2",
        phaseBangla: "২য় পর্যায়",
        basic2015: drawn2015,
        fixedBasic2026: fixed2026,
        difference: diff,
        percentage: phase2Pct,
        payableDifference: phase2MonthlyGross,
        grossPayableDifference: phase2MonthlyGross,
        increasedHouseRent: monthlyIncreasedHouseRent,
        specialBenefit: specialBenefit15PctAmount,
        totalMonthlyDeduction: monthlyTotalDeductions,
        netPayableDifference: phase2MonthlyNet,
        sourceClause: "অনুচ্ছেদ ১(৩)(খ)"
      });
    });

    const totalArrearJulyToDec2026 = phase1MonthlyGross * 6;
    const totalNetArrearJulyToDec2026 = phase1MonthlyNet * 6;
    const totalArrearJanToJun2027 = phase2MonthlyGross * 6;
    const totalNetArrearJanToJun2027 = phase2MonthlyNet * 6;

    const total12MonthsGrossArrear = totalArrearJulyToDec2026 + totalArrearJanToJun2027;
    const total12MonthsIncreasedHouseRent = monthlyIncreasedHouseRent * 12;
    const total12MonthsSpecialBenefit = specialBenefit15PctAmount * 12;
    const total12MonthsDeductions = monthlyTotalDeductions * 12;
    const total12MonthsNetArrear = totalNetArrearJulyToDec2026 + totalNetArrearJanToJun2027;

    return {
      grade,
      drawnBasic2015: drawn2015,
      fixedBasic2026: fixed2026,
      totalMonthlyDifference: diff,
      location,
      locationBangla: houseRentJune2026.locationNameBangla,
      isGovtQuarter,

      stepNumber2015,
      totalStepsInGrade2015,
      subsequentStepNumber2015,
      subsequentStepBasic2015,
      isAtCeiling2015,

      houseRentJune2026,
      increment5PctAmount,
      july1Basic2015WithIncrement,
      specialBenefit15PctAmount,
      houseRentJuly2026,
      monthlyIncreasedHouseRent,
      monthlyTotalDeductions,

      phase1MonthlyPayable: phase1MonthlyGross,
      phase1Percentage: phase1Pct,
      phase1MonthlyNetPayable: phase1MonthlyNet,

      phase2MonthlyPayable: phase2MonthlyGross,
      phase2Percentage: phase2Pct,
      phase2MonthlyNetPayable: phase2MonthlyNet,

      phase3MonthlyPayable: phase3MonthlyGross,
      phase3Percentage: phase3Pct,
      phase3MonthlyNetPayable: phase3MonthlyNet,

      monthlyBreakdown,
      totalArrearJulyToDec2026,
      totalNetArrearJulyToDec2026,
      totalArrearJanToJun2027,
      totalNetArrearJanToJun2027,

      total12MonthsGrossArrear,
      total12MonthsIncreasedHouseRent,
      total12MonthsSpecialBenefit,
      total12MonthsDeductions,
      total12MonthsNetArrear,

      trace
    };
  }

  /**
   * Calculate Allowances strictly based on Gazette Clauses 13, 14, 15, 17, 18, 19, 21, 22, 23
   */
  public static calculateAllowances(inputs: AllowanceInputs): AllowanceResult {
    const trace: CalculationTraceStep[] = [];
    const basic = inputs.basicPay;

    // 1. House Rent Allowance
    let houseRent = 0;
    let houseRentRate = 0;
    let statutoryHouseRentInfo: StatutoryHouseRentResult | undefined;

    if (inputs.isGovtQuarterProvided) {
      houseRent = 0;
      statutoryHouseRentInfo = PayFixationEngine.calculateStatutoryHouseRent2015(basic, 'dhaka', true);
      trace.push({
        stepNumber: 1,
        stepName: "House Rent Allowance (Govt Accommodation)",
        stepNameBangla: "বাড়ি ভাড়া ভাতা (সরকারি আবাসন বরাদ্দপ্রাপ্ত)",
        formula: "সরকারি বাসস্থানে বসবাস করিলে বাড়ি ভাড়া ভাতা প্রাপ্য হইবে না",
        intermediateValues: "সরকারি আবাসন বরাদ্দ",
        result: 0,
        sourceClause: "অনুচ্ছেদ ১৫(২)",
        sourcePage: 13
      });
    } else if (inputs.houseRentRule === '2015_statutory') {
      const loc: HouseRentLocation =
        inputs.cityType === 'dhaka'
          ? 'dhaka'
          : inputs.cityType === 'other_city_corporation'
          ? 'other_city_corporation'
          : 'other';
      statutoryHouseRentInfo = PayFixationEngine.calculateStatutoryHouseRent2015(basic, loc, false);
      houseRent = statutoryHouseRentInfo.finalAmount;
      houseRentRate = statutoryHouseRentInfo.ratePercentage;

      trace.push({
        stepNumber: 1,
        stepName: "House Rent Allowance (National Pay Scale 2015 Schedule)",
        stepNameBangla: "বাড়ি ভাড়া ভাতা (জাতীয় বেতনস্কেল ২০১৫ সারণি, ১ জুলাই ২০১৬ হতে কার্যকর)",
        formula: `মূল বেতন পরিসীমা (${statutoryHouseRentInfo.tierRangeText}) অনুযায়ী ${statutoryHouseRentInfo.ratePercentage}% (বিধিবদ্ধ ন্যূনতম সীমা ৳${statutoryHouseRentInfo.minimumAmount.toLocaleString('en-IN')})`,
        intermediateValues: statutoryHouseRentInfo.explanationBangla,
        result: houseRent,
        sourceClause: "জাতীয় বেতনস্কেল ২০১৫ সারণি (কার্যকর ০১/০৭/২০১৬)",
        sourcePage: 1
      });
    } else {
      if (inputs.grade >= 16 && inputs.grade <= 20) {
        if (inputs.cityType === 'dhaka') houseRentRate = 60;
        else if (inputs.cityType === 'other_city_corporation') houseRentRate = 50;
        else houseRentRate = 45;
      } else if (inputs.grade >= 10 && inputs.grade <= 15) {
        if (inputs.cityType === 'dhaka') houseRentRate = 50;
        else if (inputs.cityType === 'other_city_corporation') houseRentRate = 40;
        else houseRentRate = 35;
      } else if (inputs.grade >= 5 && inputs.grade <= 9) {
        if (inputs.cityType === 'dhaka') houseRentRate = 45;
        else if (inputs.cityType === 'other_city_corporation') houseRentRate = 35;
        else houseRentRate = 30;
      } else { // Grade 1 to 4
        if (inputs.cityType === 'dhaka') houseRentRate = 40;
        else if (inputs.cityType === 'other_city_corporation') houseRentRate = 30;
        else houseRentRate = 25;
      }
      houseRent = Math.round((basic * houseRentRate) / 100);

      trace.push({
        stepNumber: 1,
        stepName: "House Rent Allowance",
        stepNameBangla: "বাড়ি ভাড়া ভাতা (অনুচ্ছেদ ১৫(৬))",
        formula: `মূল বেতনের ${houseRentRate}% (এলাকা: ${inputs.cityType}, গ্রেড: ${inputs.grade})`,
        intermediateValues: `৳${basic.toLocaleString('en-IN')} × ${houseRentRate}% = ৳${houseRent.toLocaleString('en-IN')}`,
        result: houseRent,
        sourceClause: "অনুচ্ছেদ ১৫(৬) সারণি",
        sourcePage: 14
      });
    }

    // 2. Medical Allowance (Clause 13(1))
    // <= 50 years: 3000 Tk, > 50 years: 4000 Tk
    let medical = inputs.age > 50 ? 4000 : 3000;
    trace.push({
      stepNumber: 2,
      stepName: "Medical Allowance",
      stepNameBangla: "চিকিৎসা ভাতা (অনুচ্ছেদ ১৩(১))",
      formula: inputs.age > 50 ? "বয়স ৫০ বছর ১ দিন হইতে পিআরএল পর্যন্ত: ৪,০০০ টাকা" : "বয়স ৫০ বছর পর্যন্ত: ৩,০০০ টাকা",
      intermediateValues: `কর্মচারীর বর্তমান বয়স: ${inputs.age} বছর`,
      result: medical,
      sourceClause: "অনুচ্ছেদ ১৩(১)",
      sourcePage: 13
    });

    // 3. Bengali New Year Allowance (Clause 14)
    const boishakh = inputs.isBoishakhMonth ? Math.round(basic * 0.15) : 0;
    if (inputs.isBoishakhMonth) {
      trace.push({
        stepNumber: 3,
        stepName: "Bengali New Year Allowance",
        stepNameBangla: "বাংলা নববর্ষ ভাতা (অনুচ্ছেদ ১৪(১))",
        formula: "আহরিত মূল বেতনের ১৫% হারে",
        intermediateValues: `৳${basic.toLocaleString('en-IN')} × ১৫% = ৳${boishakh.toLocaleString('en-IN')}`,
        result: boishakh,
        sourceClause: "অনুচ্ছেদ ১৪(১)",
        sourcePage: 13
      });
    }

    // 4. Festival Allowance (Clause 17)
    const festival = inputs.isFestivalMonth ? basic : 0;
    if (inputs.isFestivalMonth) {
      trace.push({
        stepNumber: 4,
        stepName: "Festival Allowance",
        stepNameBangla: "উৎসব ভাতা (অনুচ্ছেদ ১৭(১))",
        formula: "মূল বেতনের সমপরিমাণ (বছরে ২টি)",
        intermediateValues: `৳${basic.toLocaleString('en-IN')} এর ১০০%`,
        result: festival,
        sourceClause: "অনুচ্ছেদ ১৭(১)",
        sourcePage: 15
      });
    }

    // 5. Education Allowance (Clause 18)
    const children = Math.min(2, inputs.childrenCount || 0);
    const education = children * 500;
    if (education > 0) {
      trace.push({
        stepNumber: 5,
        stepName: "Education Assistance Allowance",
        stepNameBangla: "শিক্ষা সহায়ক ভাতা (অনুচ্ছেদ ১৮)",
        formula: "প্রতি সন্তান ৫০০ টাকা হারে (অনধিক ২ সন্তান, সর্বোচ্চ ১০০০ টাকা)",
        intermediateValues: `${children} সন্তান × ৫০০ টাকা`,
        result: education,
        sourceClause: "অনুচ্ছেদ ১৮(১)",
        sourcePage: 15
      });
    }

    // 6. Tiffin Allowance (Clause 19)
    let tiffin = 0;
    if (inputs.grade >= 11 && inputs.grade <= 20 && inputs.isEligibleTiffin !== false) {
      tiffin = 500;
      trace.push({
        stepNumber: 6,
        stepName: "Tiffin Allowance",
        stepNameBangla: "টিফিন ভাতা (অনুচ্ছেদ ১৯)",
        formula: "১১তম হইতে ২০তম গ্রেডের কর্মচারী: ৫০০ টাকা",
        intermediateValues: `গ্রেড ${inputs.grade}`,
        result: tiffin,
        sourceClause: "অনুচ্ছেদ ১৯",
        sourcePage: 15
      });
    }

    // 7. Conveyance Allowance (Clause 21)
    let conveyance = 0;
    if (inputs.grade >= 11 && inputs.grade <= 20 && inputs.isEligibleConveyance) {
      conveyance = 600;
      trace.push({
        stepNumber: 7,
        stepName: "Conveyance Allowance",
        stepNameBangla: "যাতায়াত ভাতা (অনুচ্ছেদ ২১)",
        formula: "সিটি কর্পোরেশন এলাকায় কর্মরত ১১-২০ গ্রেড: ৬০০ টাকা",
        intermediateValues: `গ্রেড ${inputs.grade}`,
        result: conveyance,
        sourceClause: "অনুচ্ছেদ ২১(১)",
        sourcePage: 16
      });
    }

    // 8. Mobile Allowance (Clause 22)
    let mobile = 0;
    if (inputs.grade <= 5) {
      mobile = 500;
    } else {
      mobile = 150;
    }
    trace.push({
      stepNumber: 8,
      stepName: "Mobile Allowance",
      stepNameBangla: "মোবাইল ভাতা (অনুচ্ছেদ ২২)",
      formula: inputs.grade <= 5 ? "১ম-৫ম গ্রেড: ৫০০ টাকা" : "৬ষ্ঠ-২০তম গ্রেড: ১৫০ টাকা",
      intermediateValues: `গ্রেড ${inputs.grade}`,
      result: mobile,
      sourceClause: "অনুচ্ছেদ ২২",
      sourcePage: 16
    });

    // 9. Wash Allowance (Clause 23)
    const wash = inputs.hasWashAllowance ? 300 : 0;

    // 10. Charge Allowance (Clause 20)
    const charge = inputs.hasCurrentCharge ? 1500 : 0;

    // 11. Special Child Allowance (Clause 28)
    const specialChildren = Math.min(2, inputs.specialChildCount || 0);
    const specialChildAllowance = specialChildren * 3000;

    // 12. Hill / Haor (Clauses 25, 26)
    let hill = 0;
    if (inputs.hasHillAllowance) {
      hill = Math.min(5000, Math.round(basic * 0.20));
    }
    let haor = 0;
    if (inputs.hasHaorAllowance) {
      haor = Math.min(5000, Math.round(basic * 0.20));
    }

    const totalAllowances = houseRent + medical + boishakh + festival + education + tiffin + conveyance + mobile + wash + charge + specialChildAllowance + hill + haor;
    const grossSalary = basic + totalAllowances;

    return {
      basicPay: basic,
      houseRent,
      houseRentRatePercentage: houseRentRate,
      statutoryHouseRentInfo,
      medicalAllowance: medical,
      bengaliNewYearAllowance: boishakh,
      festivalAllowance: festival,
      educationAllowance: education,
      tiffinAllowance: tiffin,
      conveyanceAllowance: conveyance,
      mobileAllowance: mobile,
      washAllowance: wash,
      chargeAllowance: charge,
      hillAllowance: hill,
      haorAllowance: haor,
      specialChildAllowance,
      totalAllowances,
      grossSalary,
      trace
    };
  }

  /**
   * Calculate Deductions (GPF, Tax, Benevolent, Insurance)
   */
  public static calculateDeductions(inputs: DeductionInputs): DeductionResult {
    const trace: CalculationTraceStep[] = [];
    const basic = inputs.basicPay;

    // GPF Subscription (Min 10%, Max 25% under GPF Rules 1979 referenced in Clause 7)
    let gpf = 0;
    if (inputs.customGpfAmount !== undefined) {
      gpf = inputs.customGpfAmount;
    } else {
      const gpfPct = inputs.gpfPercentage || 10;
      gpf = Math.round((basic * gpfPct) / 100);
    }

    trace.push({
      stepNumber: 1,
      stepName: "General Provident Fund (GPF) Subscription",
      stepNameBangla: "সাধারণ ভবিষ্য তহবিল (জিপিএফ) কর্তন",
      formula: "মূল বেতনের সর্বনিম্ন ১০% হইতে সর্বোচ্চ ২৫%",
      intermediateValues: `৳${basic.toLocaleString('en-IN')} এর চাঁদা: ৳${gpf.toLocaleString('en-IN')}`,
      result: gpf,
      sourceClause: "অনুচ্ছেদ ৭ (General Provident Fund Rules 1979)",
      sourcePage: 10
    });

    const tax = inputs.incomeTax || 0;
    const groupIns = inputs.groupInsurance || 0;
    const benevolent = inputs.benevolentFund || 0;
    const other = inputs.otherDeductions || 0;

    const totalDeductions = gpf + tax + groupIns + benevolent + other;
    const netSalary = Math.max(0, inputs.grossSalary - totalDeductions);

    return {
      gpfDeduction: gpf,
      incomeTax: tax,
      groupInsurance: groupIns,
      benevolentFund: benevolent,
      otherDeductions: other,
      totalDeductions,
      netSalary,
      trace
    };
  }

  /**
   * Calculate Pension & Increase strictly based on Clause 8 and S.R.O. 347-Law/2026
   */
  public static calculatePension(inputs: PensionCalculationInputs): PensionCalculationResult {
    const trace: CalculationTraceStep[] = [];
    const drawn2015 = inputs.existingNetPension2015;

    // Find applicable slab from OFFICIAL_PENSION_INCREASE_SLABS
    const slab = OFFICIAL_PENSION_INCREASE_SLABS.find(
      s => drawn2015 >= s.minDrawn && drawn2015 <= s.maxDrawn
    ) || OFFICIAL_PENSION_INCREASE_SLABS[OFFICIAL_PENSION_INCREASE_SLABS.length - 1];

    trace.push({
      stepNumber: 1,
      stepName: "Existing Net Pension Verification",
      stepNameBangla: "৩০ জুন ২০২৬ তারিখে বিদ্যমান মাসিক নিট পেনশন যাচাই",
      formula: "বিদ্যমান মাসিক নিট পেনশন",
      intermediateValues: `বিদ্যমান নিট পেনশন: ৳${drawn2015.toLocaleString('en-IN')}`,
      result: drawn2015,
      sourceClause: "অনুচ্ছেদ ৮(১)(খ)",
      sourcePage: 10
    });

    // Special condition in Clause 8(1)(খ):
    // If existing net pension is already above 70,200 Tk, they retain existing amount until annual increment in July 2027
    let newNetPension = drawn2015;
    let calculatedIncrease = 0;

    if (drawn2015 > 70200) {
      newNetPension = drawn2015;
      calculatedIncrease = 0;
      trace.push({
        stepNumber: 2,
        stepName: "Special Retained Pension Threshold",
        stepNameBangla: "৭০,২০০ টাকার অতিরিক্ত নিট পেনশন উত্তোলনকারীদের বিশেষ বিধান",
        formula: "বিদ্যমান নিট পেনশন অপরিবর্তিত থাকিবে (১ জুলাই ২০২৭ পর্যন্ত)",
        intermediateValues: `বিদ্যমান নিট পেনশন ৳${drawn2015.toLocaleString('en-IN')} > ৳৭০,২০০`,
        result: newNetPension,
        sourceClause: "অনুচ্ছেদ ৮(১)(খ) শর্ত",
        sourcePage: 10
      });
    } else {
      calculatedIncrease = Math.round((drawn2015 * slab.percentage) / 100);
      let tentativePension = drawn2015 + calculatedIncrease;

      // Bound between min and max net pension in the slab
      tentativePension = Math.max(slab.minNetPension, Math.min(slab.maxNetPension, tentativePension));
      newNetPension = tentativePension;

      trace.push({
        stepNumber: 2,
        stepName: "Pension Increase Slabs Application",
        stepNameBangla: "নিট পেনশন বৃদ্ধির সারণি প্রয়োগ",
        formula: `${slab.slabName} স্ল্যাবে বৃদ্ধি: ${slab.percentage}% (সর্বনিম্ন ৳${slab.minNetPension.toLocaleString('en-IN')}, সর্বোচ্চ ৳${slab.maxNetPension.toLocaleString('en-IN')})`,
        intermediateValues: `৳${drawn2015.toLocaleString('en-IN')} + (${slab.percentage}% = ৳${calculatedIncrease.toLocaleString('en-IN')}) = ৳${newNetPension.toLocaleString('en-IN')}`,
        result: newNetPension,
        sourceClause: "অনুচ্ছেদ ৮(১)(খ) সারণি",
        sourcePage: 10
      });
    }

    const netDifference = newNetPension - drawn2015;

    // Phase 1 (1 July 2026 - 31 Dec 2026) Clause 1(3)(ঙ):
    // 40% for pension slab 20001 Tk and above; 50% for 1 to 20000 Tk
    const isHigherPension = drawn2015 > 20000;
    const phase1Pct = isHigherPension ? 40 : 50;
    const phase1MonthlyDiff = Math.round((netDifference * phase1Pct) / 100);

    // Phase 2 (1 Jan 2027 - 30 June 2027) Clause 1(3)(চ):
    // 70% for pension slab 20001 Tk and above; 75% for 1 to 20000 Tk
    const phase2Pct = isHigherPension ? 70 : 75;
    const phase2MonthlyDiff = Math.round((netDifference * phase2Pct) / 100);

    // Medical Allowance for Pensioners (Clause 13(2)):
    // <=50: 3000, 50-60: 4000, 60-70: 5000, >70: 6000 Tk
    let medical = 3000;
    if (inputs.age > 70) medical = 6000;
    else if (inputs.age > 60) medical = 5000;
    else if (inputs.age > 50) medical = 4000;

    // Proportional division among multiple family pensioners if applicable
    if (inputs.isFamilyPension && inputs.familyMembersCount && inputs.familyMembersCount > 1) {
      medical = Math.round(medical / inputs.familyMembersCount);
    }

    trace.push({
      stepNumber: 3,
      stepName: "Pensioner Medical Allowance",
      stepNameBangla: "অবসরভোগী/পারিবারিক পেনশনভোগীদের চিকিৎসা ভাতা (অনুচ্ছেদ ১৩(২))",
      formula: "৫০ বছর পর্যন্ত ৩,০০০; ৫০-৬০ পর্যন্ত ৪,০০০; ৬০-৭০ পর্যন্ত ৫,০০০; ৭০ এর ঊর্ধ্বে ৬,০০০ টাকা",
      intermediateValues: `পেনশনভোগীর বয়স: ${inputs.age} বছর`,
      result: medical,
      sourceClause: "অনুচ্ছেদ ১৩(২)",
      sourcePage: 13
    });

    // Bengali New Year for pensioners (Clause 14(2)): 15% of monthly net pension
    const boishakh = Math.round(newNetPension * 0.15);

    // Festival allowance (Clause 17(2)): 2 allowances equal to monthly net pension
    const festivalMonthlyEquiv = Math.round((newNetPension * 2) / 12);

    const totalMonthlyPension = newNetPension + medical;

    return {
      existingNetPension2015: drawn2015,
      appliedSlab: slab.slabName,
      increasePercentage: slab.percentage,
      calculatedIncrease,
      minNetPension: slab.minNetPension,
      maxNetPension: slab.maxNetPension,
      newNetPension2026: newNetPension,
      netPensionDifference: netDifference,
      phase1Percentage: phase1Pct,
      phase1MonthlyPayableDiff: phase1MonthlyDiff,
      phase2Percentage: phase2Pct,
      phase2MonthlyPayableDiff: phase2MonthlyDiff,
      medicalAllowance: medical,
      bengaliNewYearAllowance: boishakh,
      festivalAllowanceMonthlyEquiv: festivalMonthlyEquiv,
      totalMonthlyPension,
      trace
    };
  }
}
