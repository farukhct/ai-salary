/**
 * Official Bangladesh National Pay Scale 2015 & 2026 Data for Client & Components
 * Extracted directly from Bangladesh Gazette S.R.O. No. 347-Law/2026
 */
import {
  Section9IncrementRateTier,
  Section9IncrementInfo,
  HouseRentLocation,
  StatutoryHouseRentResult,
  ArrearCalculationResult,
  ArrearMonthBreakdown
} from '../types.ts';

export interface GradeScaleData {
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

export const OFFICIAL_PAY_SCALES: GradeScaleData[] = [
  {
    grade: 1,
    gradeBangla: "১ম গ্রেড",
    minYearsForFullPay: 20,
    scale2015: {
      startingBasic: 78000,
      endingBasic: 78000,
      stages: [78000]
    },
    scale2026: {
      startingBasic: 156000,
      endingBasic: 156000,
      stages: [156000]
    }
  },
  {
    grade: 2,
    gradeBangla: "২য় গ্রেড",
    minYearsForFullPay: 17,
    scale2015: {
      startingBasic: 66000,
      endingBasic: 76490,
      stages: [66000, 68640, 71390, 74250, 76490]
    },
    scale2026: {
      startingBasic: 132000,
      endingBasic: 153000,
      stages: [132000, 136700, 139400, 143200, 147200, 151300, 153000]
    }
  },
  {
    grade: 3,
    gradeBangla: "৩য় গ্রেড",
    minYearsForFullPay: 14,
    scale2015: {
      startingBasic: 56500,
      endingBasic: 74400,
      stages: [56500, 58760, 61120, 63570, 66120, 68770, 71530, 74400]
    },
    scale2026: {
      startingBasic: 113000,
      endingBasic: 148800,
      stages: [113000, 117000, 121100, 125300, 129700, 134300, 139000, 143800, 148800]
    }
  },
  {
    grade: 4,
    gradeBangla: "৪র্থ গ্রেড",
    minYearsForFullPay: 12,
    scale2015: {
      startingBasic: 50000,
      endingBasic: 71200,
      stages: [50000, 52000, 54080, 56250, 58500, 60840, 63280, 65820, 68460, 71200]
    },
    scale2026: {
      startingBasic: 100000,
      endingBasic: 142400,
      stages: [100000, 103500, 107200, 110900, 114800, 118800, 123000, 127300, 131700, 136300, 142400]
    }
  },
  {
    grade: 5,
    gradeBangla: "৫ম গ্রেড",
    minYearsForFullPay: 10,
    scale2015: {
      startingBasic: 43000,
      endingBasic: 69850,
      stages: [43000, 44940, 46970, 49090, 51300, 53610, 56030, 58560, 61200, 63960, 66840, 69850]
    },
    scale2026: {
      startingBasic: 86000,
      endingBasic: 136700,
      stages: [86000, 89500, 93100, 96800, 100700, 104700, 108900, 113200, 117700, 122400, 127400, 132400, 136700]
    }
  },
  {
    grade: 6,
    gradeBangla: "৬ষ্ঠ গ্রেড",
    minYearsForFullPay: 7,
    scale2015: {
      startingBasic: 35500,
      endingBasic: 67010,
      stages: [35500, 37280, 39150, 41110, 43170, 45330, 47600, 49980, 52480, 55110, 57870, 60770, 63810, 67010]
    },
    scale2026: {
      startingBasic: 71000,
      endingBasic: 134000,
      stages: [71000, 74600, 78300, 82200, 86400, 90700, 95200, 100000, 104900, 110200, 115700, 121500, 127600, 134000]
    }
  },
  {
    grade: 7,
    gradeBangla: "৭ম গ্রেড",
    minYearsForFullPay: 4,
    scale2015: {
      startingBasic: 29000,
      endingBasic: 63410,
      stages: [29000, 30450, 31980, 33580, 35260, 37030, 38890, 40840, 42890, 45040, 47300, 49670, 52160, 54770, 57510, 60390, 63410]
    },
    scale2026: {
      startingBasic: 58000,
      endingBasic: 126600,
      stages: [58000, 60900, 64000, 67200, 70500, 74100, 77800, 81700, 85700, 90000, 94500, 99200, 104200, 109400, 114900, 120600, 126600]
    }
  },
  {
    grade: 8,
    gradeBangla: "৮ম গ্রেড",
    scale2015: {
      startingBasic: 23000,
      endingBasic: 55470,
      stages: [23000, 24150, 25360, 26630, 27970, 29370, 30840, 32390, 34010, 35720, 37510, 39390, 41360, 43430, 45610, 47900, 50300, 52820, 55470]
    },
    scale2026: {
      startingBasic: 46000,
      endingBasic: 110800,
      stages: [46000, 48300, 50800, 53300, 56000, 58800, 61700, 64800, 68000, 71400, 75000, 78700, 82700, 86800, 91100, 95700, 100500, 105500, 110800]
    }
  },
  {
    grade: 9,
    gradeBangla: "৯ম গ্রেড",
    scale2015: {
      startingBasic: 22000,
      endingBasic: 53060,
      stages: [22000, 23100, 24260, 25480, 26760, 28100, 29510, 30990, 32540, 34170, 35880, 37680, 39570, 41550, 43630, 45820, 48120, 50530, 53060]
    },
    scale2026: {
      startingBasic: 44000,
      endingBasic: 105900,
      stages: [44000, 46200, 48600, 51000, 53500, 56200, 59000, 62000, 65100, 68300, 71700, 75300, 79100, 83000, 87200, 91500, 96100, 100900, 105900]
    }
  },
  {
    grade: 10,
    gradeBangla: "১০ম গ্রেড",
    scale2015: {
      startingBasic: 16000,
      endingBasic: 38640,
      stages: [16000, 16800, 17640, 18530, 19460, 20440, 21470, 22550, 23680, 24870, 26120, 27430, 28810, 30260, 31780, 33370, 35040, 36800, 38640]
    },
    scale2026: {
      startingBasic: 32000,
      endingBasic: 77100,
      stages: [32000, 33600, 35300, 37100, 38900, 40900, 42900, 45100, 47300, 49700, 52100, 54800, 57500, 60400, 63400, 66600, 69900, 73400, 77100]
    }
  },
  {
    grade: 11,
    gradeBangla: "১১তম গ্রেড",
    scale2015: {
      startingBasic: 12500,
      endingBasic: 30230,
      stages: [12500, 13130, 13790, 14480, 15210, 15980, 16780, 17620, 18510, 19440, 20420, 21450, 22530, 23660, 24850, 26100, 27410, 28790, 30230]
    },
    scale2026: {
      startingBasic: 25000,
      endingBasic: 60200,
      stages: [25000, 26300, 27600, 29000, 30400, 32000, 33600, 35200, 37000, 38800, 40800, 42800, 44900, 47200, 49500, 52000, 54600, 57300, 60200]
    }
  },
  {
    grade: 12,
    gradeBangla: "১২তম গ্রেড",
    scale2015: {
      startingBasic: 11300,
      endingBasic: 27300,
      stages: [11300, 11870, 12470, 13100, 13760, 14450, 15180, 15940, 16740, 17580, 18460, 19390, 20360, 21380, 22450, 23580, 24760, 26000, 27300]
    },
    scale2026: {
      startingBasic: 24300,
      endingBasic: 58700,
      stages: [24300, 25600, 26800, 28200, 29600, 31100, 32600, 34200, 36000, 37700, 39600, 41600, 43700, 45900, 48200, 50500, 53100, 55700, 58700]
    }
  },
  {
    grade: 13,
    gradeBangla: "১৩তম গ্রেড",
    scale2015: {
      startingBasic: 11000,
      endingBasic: 26590,
      stages: [11000, 11550, 12130, 12740, 13380, 14050, 14760, 15500, 16280, 17100, 17960, 18860, 19810, 20810, 21860, 22960, 24110, 25320, 26590]
    },
    scale2026: {
      startingBasic: 24000,
      endingBasic: 58000,
      stages: [24000, 25200, 26500, 27800, 29200, 30700, 32200, 33800, 35500, 37300, 39100, 41100, 43200, 45300, 47600, 49900, 52400, 55100, 58000]
    }
  },
  {
    grade: 14,
    gradeBangla: "১৪তম গ্রেড",
    scale2015: {
      startingBasic: 10200,
      endingBasic: 24680,
      stages: [10200, 10710, 11250, 11820, 12420, 13050, 13710, 14400, 15120, 15880, 16680, 17520, 18400, 19320, 20290, 21310, 22380, 23500, 24680]
    },
    scale2026: {
      startingBasic: 23500,
      endingBasic: 56800,
      stages: [23500, 24700, 26000, 27300, 28600, 30000, 31500, 33100, 34800, 36500, 38300, 40200, 42300, 44400, 46600, 48900, 51300, 53900, 56800]
    }
  },
  {
    grade: 15,
    gradeBangla: "১৫তম গ্রেড",
    scale2015: {
      startingBasic: 9700,
      endingBasic: 23490,
      stages: [9700, 10190, 10700, 11240, 11810, 12410, 13040, 13700, 14390, 15110, 15870, 16670, 17510, 18390, 19310, 20280, 21300, 22370, 23490]
    },
    scale2026: {
      startingBasic: 22800,
      endingBasic: 55200,
      stages: [22800, 24000, 25200, 26400, 27700, 29100, 30600, 32100, 33700, 35400, 37200, 39000, 41000, 43000, 45200, 47400, 49800, 52300, 55200]
    }
  },
  {
    grade: 16,
    gradeBangla: "১৬তম গ্রেড",
    scale2015: {
      startingBasic: 9300,
      endingBasic: 22490,
      stages: [9300, 9770, 10260, 10780, 11320, 11890, 12490, 13120, 13780, 14470, 15200, 15960, 16760, 17600, 18480, 19410, 20380, 21400, 22490]
    },
    scale2026: {
      startingBasic: 21900,
      endingBasic: 52900,
      stages: [21900, 23000, 24200, 25400, 26700, 28000, 29400, 30900, 32400, 34000, 35700, 37500, 39400, 41300, 43400, 45600, 47900, 50200, 52900]
    }
  },
  {
    grade: 17,
    gradeBangla: "১৭তম গ্রেড",
    scale2015: {
      startingBasic: 9000,
      endingBasic: 21800,
      stages: [9000, 9450, 9930, 10430, 10960, 11510, 12090, 12700, 13340, 14010, 14720, 15460, 16240, 17060, 17920, 18820, 19770, 20760, 21800]
    },
    scale2026: {
      startingBasic: 21400,
      endingBasic: 51900,
      stages: [21400, 22500, 23600, 24800, 26100, 27400, 28700, 30200, 31700, 33200, 34900, 36700, 38500, 40400, 42400, 44500, 46800, 49100, 51900]
    }
  },
  {
    grade: 18,
    gradeBangla: "১৮তম গ্রেড",
    scale2015: {
      startingBasic: 8800,
      endingBasic: 21310,
      stages: [8800, 9240, 9710, 10200, 10710, 11250, 11820, 12420, 13050, 13710, 14400, 15120, 15880, 16680, 17520, 18400, 19320, 20290, 21310]
    },
    scale2026: {
      startingBasic: 21000,
      endingBasic: 50900,
      stages: [21000, 22100, 23200, 24400, 25600, 26900, 28200, 29600, 31100, 32600, 34300, 36000, 37800, 39600, 41600, 43700, 45800, 48200, 50900]
    }
  },
  {
    grade: 19,
    gradeBangla: "১৯তম গ্রেড",
    scale2015: {
      startingBasic: 8500,
      endingBasic: 20570,
      stages: [8500, 8930, 9380, 9850, 10350, 10870, 11420, 12000, 12600, 13230, 13900, 14600, 15330, 16100, 16910, 17760, 18650, 19590, 20570]
    },
    scale2026: {
      startingBasic: 20500,
      endingBasic: 49600,
      stages: [20500, 21600, 22700, 23800, 25000, 26200, 27500, 28900, 30300, 31900, 33400, 35100, 36900, 38700, 40600, 42700, 44800, 47000, 49600]
    }
  },
  {
    grade: 20,
    gradeBangla: "২০তম গ্রেড",
    scale2015: {
      startingBasic: 8250,
      endingBasic: 20010,
      stages: [8250, 8670, 9110, 9570, 10050, 10560, 11090, 11650, 12240, 12860, 13510, 14190, 14900, 15650, 16440, 17270, 18140, 19050, 20010]
    },
    scale2026: {
      startingBasic: 20000,
      endingBasic: 48400,
      stages: [20000, 21000, 22100, 23200, 24400, 25600, 26800, 28200, 29600, 31100, 32600, 34300, 36000, 37800, 39800, 41800, 43900, 46100, 48400]
    }
  }
];

export function getClientGradeScale(grade: number): GradeScaleData | undefined {
  return OFFICIAL_PAY_SCALES.find(g => g.grade === grade);
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

/**
 * Fast client-side pay fixation function matching Gazette Clause 5 strictly
 */
export function calculateSimpleFixationClient(grade: number, drawnBasic2015: number) {
  const gradeData = getClientGradeScale(grade);
  if (!gradeData) return null;

  const start2015 = gradeData.scale2015.startingBasic;
  const start2026 = gradeData.scale2026.startingBasic;
  const stages2026 = gradeData.scale2026.stages;

  let fixedBasic2026 = start2026;
  let stageIndex = 0;
  let ruleAppliedBangla = 'অনুচ্ছেদ ৫(ক) - প্রারম্ভিক ধাপ';

  const diff2015 = Math.max(0, drawnBasic2015 - start2015);
  const theoreticalSum = start2026 + diff2015;

  if (drawnBasic2015 <= start2015) {
    fixedBasic2026 = start2026;
    stageIndex = 0;
    ruleAppliedBangla = 'অনুচ্ছেদ ৫(ক): প্রারম্ভিক ধাপে সমতুল্য নির্ধারণ';
  } else {
    const exactIndex = stages2026.indexOf(theoreticalSum);
    if (exactIndex !== -1) {
      fixedBasic2026 = theoreticalSum;
      stageIndex = exactIndex;
      ruleAppliedBangla = 'অনুচ্ছেদ ৫(খ)(অ): সমপরিমাণ ধাপে নির্ধারণ';
    } else {
      let higherIndex = -1;
      for (let i = 0; i < stages2026.length; i++) {
        if (stages2026[i] > theoreticalSum) {
          higherIndex = i;
          break;
        }
      }
      if (higherIndex !== -1) {
        fixedBasic2026 = stages2026[higherIndex];
        stageIndex = higherIndex;
        ruleAppliedBangla = 'অনুচ্ছেদ ৫(খ)(আ): পরবর্তী উচ্চতর ধাপে নির্ধারণ';
      } else {
        fixedBasic2026 = stages2026[stages2026.length - 1];
        stageIndex = stages2026.length - 1;
        ruleAppliedBangla = 'সর্বোচ্চ ধাপে নির্ধারণ (রোদে সীমা অতিক্রম)';
      }
    }
  }

  // Next July 1 increment (Clause 9(2))
  let basicWithJuly2026Increment = fixedBasic2026;
  let annualIncrementAmount = 0;
  if (stageIndex < stages2026.length - 1) {
    basicWithJuly2026Increment = stages2026[stageIndex + 1];
    annualIncrementAmount = basicWithJuly2026Increment - fixedBasic2026;
  } else {
    annualIncrementAmount = Math.round(fixedBasic2026 * 0.05);
    basicWithJuly2026Increment = fixedBasic2026 + annualIncrementAmount;
  }

  const salaryDifference = fixedBasic2026 - drawnBasic2015;
  const percentageIncrease = drawnBasic2015 > 0 ? ((salaryDifference / drawnBasic2015) * 100).toFixed(1) : '0';

  // Incremental Scale 3 Stages Classification
  const totalStages = stages2026.length;
  let currentTier: 1 | 2 | 3 = 2;
  let currentTierName = '২য় স্তর: ইনক্রিমেন্টাল প্রবৃদ্ধি ধাপসমূহ';
  let tierDescription = 'নিয়মিত বার্ষিক বেতনবৃদ্ধির মাধ্যমে মধ্যবর্তী ধাপে অবস্থান।';
  let isCeilingReached = false;
  let stagnationIncrementAmount = 0;

  if (stageIndex === 0) {
    currentTier = 1;
    currentTierName = '১ম স্তর: প্রারম্ভিক ধাপ (Entry / Starting Basic)';
    tierDescription = 'স্কেলের সর্বনিম্ন বা প্রারম্ভিক ধাপে অবস্থান (অনুচ্ছেদ ৫(ক))।';
  } else if (stageIndex >= totalStages - 1) {
    currentTier = 3;
    currentTierName = '৩য় স্তর: সর্বোচ্চ সিলিং ও স্থবিরতা ধাপ (Ceiling & Stagnation)';
    tierDescription = 'স্কেলের সর্বশেষ ধাপে অবস্থান। অনুচ্ছেদ ৯(৩) অনুযায়ী ১ বছর পূর্তিতে ৫% স্থবিরতা ইনক্রিমেন্ট প্রাপ্য।';
    isCeilingReached = true;
    stagnationIncrementAmount = Math.round(fixedBasic2026 * 0.05);
  }

  // 3 Disbursement Stages (Clause 1(3)) linked with 1 July 2026 Increment (Clause 9(2))
  const isHigherGrade = grade <= 9;
  const p1Pct = isHigherGrade ? 40 : 50;
  const p2Pct = isHigherGrade ? 70 : 75;
  const p3Pct = 100;

  // নির্ধারিত বেতনের সাথে একটি ইনক্রিমেন্ট যোগ করে স্কেল পার্থক্যের প্রদেয় অংশ হিসাব
  const fixedBasicWithIncrement = basicWithJuly2026Increment;
  const totalDifferenceWithIncrement = fixedBasicWithIncrement - drawnBasic2015;
  const p1MonthlyDiffWithInc = Math.round((totalDifferenceWithIncrement * p1Pct) / 100);
  const p2MonthlyDiffWithInc = Math.round((totalDifferenceWithIncrement * p2Pct) / 100);
  const p3MonthlyDiffWithInc = totalDifferenceWithIncrement;

  // ইনক্রিমেন্ট পূর্ববর্তী স্কেল পার্থক্য (রেফারেন্সের জন্য)
  const p1MonthlyDiff = Math.round((salaryDifference * p1Pct) / 100);
  const p2MonthlyDiff = Math.round((salaryDifference * p2Pct) / 100);
  const p3MonthlyDiff = salaryDifference;

  const disbursementStages = [
    {
      stageNumber: 1 as const,
      periodBangla: '১ম পর্যায়: ১ জুলাই ২০২৬ হইতে ৩১ ডিসেম্বর ২০২৬',
      periodEnglish: 'Phase 1: 1 July 2026 - 31 Dec 2026',
      percentage: p1Pct,
      monthlyDisbursedDiff: p1MonthlyDiffWithInc,
      monthlyBasicPayable: drawnBasic2015 + p1MonthlyDiffWithInc,
      sourceClause: 'অনুচ্ছেদ ১(৩)(ক) ও ৯(২)',
      annualIncrementAmount,
      fixedBasicWithIncrement,
      totalDifferenceWithIncrement,
      monthlyDisbursedDiffWithIncrement: p1MonthlyDiffWithInc,
      monthlyBasicPayableByDiffWithIncrement: drawnBasic2015 + p1MonthlyDiffWithInc,
      monthlyBasicWithJulyIncrementPayable: drawnBasic2015 + p1MonthlyDiffWithInc,
      baseDiffWithoutIncrement: salaryDifference,
      monthlyDisbursedDiffWithoutIncrement: p1MonthlyDiff
    },
    {
      stageNumber: 2 as const,
      periodBangla: '২য় পর্যায়: ১ জানুয়ারি ২০২৭ হইতে ৩০ জুন ২০২৭',
      periodEnglish: 'Phase 2: 1 Jan 2027 - 30 June 2027',
      percentage: p2Pct,
      monthlyDisbursedDiff: p2MonthlyDiffWithInc,
      monthlyBasicPayable: drawnBasic2015 + p2MonthlyDiffWithInc,
      sourceClause: 'অনুচ্ছেদ ১(৩)(খ) ও ৯(২)',
      annualIncrementAmount,
      fixedBasicWithIncrement,
      totalDifferenceWithIncrement,
      monthlyDisbursedDiffWithIncrement: p2MonthlyDiffWithInc,
      monthlyBasicPayableByDiffWithIncrement: drawnBasic2015 + p2MonthlyDiffWithInc,
      monthlyBasicWithJulyIncrementPayable: drawnBasic2015 + p2MonthlyDiffWithInc,
      baseDiffWithoutIncrement: salaryDifference,
      monthlyDisbursedDiffWithoutIncrement: p2MonthlyDiff
    },
    {
      stageNumber: 3 as const,
      periodBangla: '৩য় পর্যায়: ১ জুলাই ২০২৭ হইতে পরবর্তী সময়',
      periodEnglish: 'Phase 3: From 1 July 2027 onwards',
      percentage: p3Pct,
      monthlyDisbursedDiff: p3MonthlyDiffWithInc,
      monthlyBasicPayable: fixedBasicWithIncrement,
      sourceClause: 'অনুচ্ছেদ ১(৩)(গ) ও ৯(২)',
      annualIncrementAmount,
      fixedBasicWithIncrement,
      totalDifferenceWithIncrement,
      monthlyDisbursedDiffWithIncrement: p3MonthlyDiffWithInc,
      monthlyBasicPayableByDiffWithIncrement: fixedBasicWithIncrement,
      monthlyBasicWithJulyIncrementPayable: fixedBasicWithIncrement,
      baseDiffWithoutIncrement: salaryDifference,
      monthlyDisbursedDiffWithoutIncrement: p3MonthlyDiff
    }
  ];

  // Section 9 Incremental Rate & 3 Stages Calculation
  const sec9RateInfo = getSection9IncrementRateForGrade(grade);
  const effectiveIncrementPct = fixedBasic2026 > 0 ? Number(((annualIncrementAmount / fixedBasic2026) * 100).toFixed(2)) : 0;
  const section9Increment: Section9IncrementInfo = {
    grade,
    statutoryRatePercent: sec9RateInfo.statutoryRatePercent,
    statutoryRateBangla: sec9RateInfo.statutoryRateBangla,
    rateTierNumber: sec9RateInfo.rateTierNumber,
    rateTierNameBangla: sec9RateInfo.rateTierNameBangla,
    rateTierCoverageBangla: sec9RateInfo.rateTierCoverageBangla,
    fixedBasic2026,
    annualIncrementAmount,
    basicWithJuly2026Increment,
    effectiveIncrementPercentage: effectiveIncrementPct,
    isCeilingReached,
    isStagnationIncrement: isCeilingReached,
    stagnationIncrementAmount,
    statutoryClause: isCeilingReached ? 'অনুচ্ছেদ ৯(৩)' : 'অনুচ্ছেদ ৯(১) ও ৯(২)',
    explanationBangla: isCeilingReached
      ? 'কর্মচারী স্কেলের সর্বোচ্চ সিলিং ধাপে উপনীত হওয়ায় অনুচ্ছেদ ৯(৩) অনুযায়ী ১ বছর পূর্তিতে ৫.০০% ব্যক্তিগত স্থবিরতা বেতনবৃদ্ধি (Stagnation Increment) প্রাপ্য হইবেন।'
      : `চাকরি আদেশ, ২০২৬ এর অনুচ্ছেদ ৯(২) মোতাবেক ${grade}ম গ্রেডের নির্ধারিত বার্ষিক ইনক্রিমেন্ট হার ${sec9RateInfo.statutoryRateBangla} (${sec9RateInfo.rateTierNameBangla})। ১ জুলাই ২০২৬ তারিখে পরবর্তী ধাপে (ধাপ #${stageIndex + 2}) বেতনবৃদ্ধি প্রদেয়।`,
    threeRateTiers: SECTION_9_INCREMENT_RATE_TIERS
  };

  return {
    grade,
    gradeBangla: gradeData.gradeBangla,
    drawnBasic2015,
    startingBasic2015: start2015,
    startingBasic2026: start2026,
    difference2015: diff2015,
    theoreticalSum,
    fixedBasic2026,
    stageIndex,
    salaryDifference,
    percentageIncrease,
    annualIncrementAmount,
    basicWithJuly2026Increment,
    ruleAppliedBangla,
    scale2015Stages: gradeData.scale2015.stages,
    scale2026Stages: gradeData.scale2026.stages,
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
 * Comprehensive description of the 3 Stages of the Incremental Basic Pay Scale
 */
export function getIncrementalScale3StagesDescription(grade: number) {
  const gData = getClientGradeScale(grade);
  const stages = gData ? gData.scale2026.stages : [];
  const start = stages[0] || 0;
  const end = stages[stages.length - 1] || 0;
  const isCadre = grade <= 9;

  return [
    {
      tierNumber: 1 as const,
      tierNameBangla: '১ম স্তর: প্রারম্ভিক ধাপ (Entry / Starting Basic Stage)',
      tierNameEnglish: 'Stage 1: Entry / Starting Basic Stage',
      stageRangeText: `ধাপ #১ (মূল বেতন: ৳${start.toLocaleString('en-IN')})`,
      legalClause: 'অনুচ্ছেদ ৫(ক) ও অনুচ্ছেদ ৪',
      descriptionBangla: 'নতুন সরকারি চাকরিতে যোগদানকারী কর্মকর্তা-কর্মচারী অথবা বিদ্যমান স্কেলের প্রারম্ভিক ধাপে আহরিত কর্মকর্তাদের জন্য নির্ধারিত মূল ভিত্তি। অনুচ্ছেদ ৫(ক) মোতাবেক এই ধাপে আহরিত কর্মচারীদের বেতন সরাসরি ২০২৬ স্কেলের প্রারম্ভিক সমতুল্য ধাপে নির্ধারিত হয় (পার্থক্য শূন্য)।',
      rulesHighlight: '• কোনো পূর্ববর্তী ইনক্রিমেন্ট বিয়োগ/যোগ প্রযোজ্য নহে।\n• সরাসরি ২০২৬ স্কেলের ১নং ধাপে বেতন নির্ধারিত হইবে।'
    },
    {
      tierNumber: 2 as const,
      tierNameBangla: '২য় স্তর: ইনক্রিমেন্টাল প্রবৃদ্ধি ধাপসমূহ (Progressive Incremental Stages)',
      tierNameEnglish: 'Stage 2: Progressive Incremental Stages',
      stageRangeText: `ধাপ #২ হইতে ধাপ #${Math.max(2, stages.length - 1)} (৳${(stages[1] || start).toLocaleString('en-IN')} - ৳${(stages[stages.length - 2] || end).toLocaleString('en-IN')})`,
      legalClause: 'অনুচ্ছেদ ৫(খ) এবং অনুচ্ছেদ ৯(২)',
      descriptionBangla: 'চাকরিতে সন্তোষজনক কার্যকাল অতিক্রান্তের মাধ্যমে প্রতি বছর ১ জুলাই অর্জিত নিয়মিত বা অগ্রিম ইনক্রিমেন্টাল ধাপসমূহ। অনুচ্ছেদ ৫(খ) অনুসারে আহরিত বেতনের পার্থক্য ২০২৬ প্রারম্ভিকের সহিত যোগ করিয়া অনুরূপ বা পরবর্তী উচ্চতর ধাপে নির্ধারণ করা হয়। পরবর্তীতে অনুচ্ছেদ ৯(২) মোতাবেক ১ জুলাই ২০২৬ তারিখে পরবর্তী ধাপে আরও ১টি বার্ষিক ইনক্রিমেন্ট যুক্ত হয়।',
      rulesHighlight: '• ধাপের পর ধাপ নির্দিষ্ট ব্যবধানে বার্ষিক ৫% (বা সংশ্লিষ্ট হার) যৌগিক হারে বৃদ্ধি পায়।\n• অনুচ্ছেদ ৫(খ)(অ/আ) অনুসারে সমতুল্য বা পরবর্তী উচ্চতর ধাপ নিশ্চিত করা হয়।'
    },
    {
      tierNumber: 3 as const,
      tierNameBangla: '৩য় স্তর: সর্বোচ্চ সিলিং ও স্থবিরতা ইনক্রিমেন্ট স্তর (Ceiling & Stagnation Stage)',
      tierNameEnglish: 'Stage 3: Ceiling & Stagnation Increment Stage',
      stageRangeText: `ধাপ #${stages.length} (সর্বোচ্চ মূল বেতন: ৳${end.toLocaleString('en-IN')})`,
      legalClause: 'অনুচ্ছেদ ৯(৩) ও অনুচ্ছেদ ৫(খ)(আ) শর্ত',
      descriptionBangla: 'সংশ্লিষ্ট গ্রেডের সর্বশেষ চূড়ান্ত বা সর্বোচ্চ ধাপ (Pay Scale Ceiling)। যখন কোনো কর্মচারী পদোন্নতি ব্যতিরেকে স্কেলের সর্বোচ্চ ধাপে উপনীত হন, তখন সাধারণ ধাপ শেষ হয়। অনুচ্ছেদ ৯(৩) অনুসারে সর্বোচ্চ ধাপে ১ বছর অবস্থানের পর তিনি অতিরিক্ত ৫% হারে ব্যক্তিগত স্থবিরতা বেতনবৃদ্ধি (Stagnation Increment) প্রাপ্য হন।',
      rulesHighlight: '• স্কেলে আর কোনো উচ্চতর ধাপ না থাকিলেও বার্ষিক ৫% হারে ব্যক্তিগত বেতনবৃদ্ধি (Personal Pay / Increment) প্রদেয়।\n• বেতন ফিক্সেশনে যোগফল সর্বোচ্চ ধাপ অতিক্রম করিলে সর্বোচ্চ ধাপেই নির্ধারিত হইবে।'
    }
  ];
}

/**
 * Statutory House Rent Allowance strictly based on Pay Scale 2015 Schedule (effective 1 July 2016)
 * Up to 9,700: Dhaka 65% (min 5,600), Other CC 55% (min 5,000), Other 50% (min 4,500)
 * 9,701 - 16,000: Dhaka 60% (min 6,400), Other CC 50% (min 5,400), Other 45% (min 4,800)
 * 16,001 - 35,500: Dhaka 55% (min 9,600), Other CC 45% (min 8,000), Other 40% (min 7,000)
 * 35,501+: Dhaka 50% (min 19,500), Other CC 40% (min 16,000), Other 35% (min 13,800)
 */
export function calculateStatutoryHouseRent2015(
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
 * Client Arrears Calculator with House Rent & Special Benefit Deductions
 */
export function calculateClientArrearsNet(
  grade: number,
  drawn2015: number,
  fixed2026: number,
  location: HouseRentLocation = 'dhaka',
  isGovtQuarter: boolean = false,
  options?: {
    stepNumber?: number;
    customIncrementPct?: number;
    customSpecialBenefitPct?: number;
    july1BasicOverride?: number;
  }
): ArrearCalculationResult {
  const diff = fixed2026 - drawn2015;
  const isHigherGrade = grade <= 9;

  // Resolve Grade & Step in 2015 Pay Scale
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

  const houseRentJune2026 = calculateStatutoryHouseRent2015(drawn2015, location, isGovtQuarter);

  const sbPct = options?.customSpecialBenefitPct ?? 15;
  const specialBenefit15PctAmount = Math.round((subsequentStepBasic2015 * sbPct) / 100);

  const houseRentJuly2026 = calculateStatutoryHouseRent2015(subsequentStepBasic2015, location, isGovtQuarter);
  const monthlyIncreasedHouseRent = Math.max(0, houseRentJuly2026.finalAmount - houseRentJune2026.finalAmount);
  const monthlyTotalDeductions = monthlyIncreasedHouseRent + specialBenefit15PctAmount;

  const phase1Pct = isHigherGrade ? 40 : 50;
  const phase1MonthlyGross = Math.round((diff * phase1Pct) / 100);
  const phase1MonthlyNet = Math.max(0, phase1MonthlyGross - monthlyTotalDeductions);

  const phase2Pct = isHigherGrade ? 70 : 75;
  const phase2MonthlyGross = Math.round((diff * phase2Pct) / 100);
  const phase2MonthlyNet = Math.max(0, phase2MonthlyGross - monthlyTotalDeductions);

  const phase3Pct = 100;
  const phase3MonthlyGross = diff;
  const phase3MonthlyNet = Math.max(0, phase3MonthlyGross - monthlyTotalDeductions);

  const monthlyBreakdown: ArrearMonthBreakdown[] = [];
  const monthsPhase1 = [
    { m: 'July', y: 2026 },
    { m: 'August', y: 2026 },
    { m: 'September', y: 2026 },
    { m: 'October', y: 2026 },
    { m: 'November', y: 2026 },
    { m: 'December', y: 2026 }
  ];

  monthsPhase1.forEach(item => {
    monthlyBreakdown.push({
      month: item.m,
      year: item.y,
      phase: 'Phase 1',
      phaseBangla: '১ম পর্যায়',
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
      sourceClause: 'অনুচ্ছেদ ১(৩)(ক)'
    });
  });

  const monthsPhase2 = [
    { m: 'January', y: 2027 },
    { m: 'February', y: 2027 },
    { m: 'March', y: 2027 },
    { m: 'April', y: 2027 },
    { m: 'May', y: 2027 },
    { m: 'June', y: 2027 }
  ];

  monthsPhase2.forEach(item => {
    monthlyBreakdown.push({
      month: item.m,
      year: item.y,
      phase: 'Phase 2',
      phaseBangla: '২য় পর্যায়',
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
      sourceClause: 'অনুচ্ছেদ ১(৩)(খ)'
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

    trace: []
  };
}
