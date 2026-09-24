/**
 * Official Bangladesh National Pay Scale 2015 & 2026 Data
 * Extracted directly from Bangladesh Gazette S.R.O. No. 347-Law/2026
 * Published: 17 September 2026 (02 Ashwin 1433)
 */

export interface GradeScaleData {
  grade: number;
  gradeBangla: string;
  minYearsForFullPay?: number; // Clause 11 for Grade 1-7
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

export const SPECIAL_FIXED_POSITIONS = [
  {
    titleBangla: "মন্ত্রিপরিষদ সচিব / প্রধানমন্ত্রীর মুখ্য সচিব",
    titleEnglish: "Cabinet Secretary / Principal Secretary to the Prime Minister",
    basicAmount: 172000,
    sourceClause: "অনুচ্ছেদ ৩(২)"
  },
  {
    titleBangla: "সিনিয়র সচিব / সমমর্যাদার পদ",
    titleEnglish: "Senior Secretary / Equivalent Posts",
    basicAmount: 164000,
    sourceClause: "অনুচ্ছেদ ৩(২)"
  }
];

export const OFFICIAL_PENSION_INCREASE_SLABS = [
  {
    slabName: "সর্বনিম্ন - ৯,০০০ টাকা",
    minDrawn: 0,
    maxDrawn: 9000,
    percentage: 100,
    minNetPension: 10000,
    maxNetPension: 18000,
    sourceClause: "অনুচ্ছেদ ৮(১)(খ) সারণি"
  },
  {
    slabName: "৯,০০১ - ২০,০০০ টাকা",
    minDrawn: 9001,
    maxDrawn: 20000,
    percentage: 75,
    minNetPension: 18001,
    maxNetPension: 35000,
    sourceClause: "অনুচ্ছেদ ৮(১)(খ) সারণি"
  },
  {
    slabName: "২০,০০১ - ৩০,০০০ টাকা",
    minDrawn: 20001,
    maxDrawn: 30000,
    percentage: 65,
    minNetPension: 35001,
    maxNetPension: 49000,
    sourceClause: "অনুচ্ছেদ ৮(১)(খ) সারণি"
  },
  {
    slabName: "৩০,০০১ - ৪০,০০০ টাকা",
    minDrawn: 30001,
    maxDrawn: 40000,
    percentage: 60,
    minNetPension: 49001,
    maxNetPension: 62000,
    sourceClause: "অনুচ্ছেদ ৮(১)(খ) সারণি"
  },
  {
    slabName: "৪০,০০১ ও তদূর্ধ্ব",
    minDrawn: 40001,
    maxDrawn: 9999999,
    percentage: 55,
    minNetPension: 62001,
    maxNetPension: 70200,
    sourceClause: "অনুচ্ছেদ ৮(১)(খ) সারণি"
  }
];

export const OFFICIAL_DOC_REFERENCES = [
  {
    code: "SRO_347_2026",
    documentName: "বাংলাদেশ গেজেট, অতিরিক্ত সংখ্যা, ১৭ সেপ্টেম্বর ২০২৬",
    orderNumber: "এস. আর. ও. নং ৩৪৭-আইন/২০২৬",
    gazetteDate: "2026-09-17",
    effectiveDate: "2026-07-01",
    authority: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, অর্থ মন্ত্রণালয়, অর্থ বিভাগ (বাস্তবায়ন-১ অনুবিভাগ)",
    actName: "সরকারি চাকরি আইন, ২০১৮ (২০১৮ সনের ৫৭ নং আইন) এর ধারা ১৫",
    shortTitle: "চাকরি (বেতন ও ভাতাদি) আদেশ, ২০২৬"
  }
];
