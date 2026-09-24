import { HouseRentLocation, StatutoryHouseRentResult } from '../types.ts';

export interface StatutoryHouseRentSlab {
  tierNumber: 1 | 2 | 3 | 4;
  basicRangeBangla: string;
  basicRangeEnglish: string;
  minBasic: number;
  maxBasic: number | null; // null for above
  dhaka: {
    ratePercentage: number;
    minimumAmount: number;
    ruleBangla: string;
    ruleEnglish: string;
  };
  otherCityCorporation: {
    ratePercentage: number;
    minimumAmount: number;
    ruleBangla: string;
    ruleEnglish: string;
  };
  otherAreas: {
    ratePercentage: number;
    minimumAmount: number;
    ruleBangla: string;
    ruleEnglish: string;
  };
}

/**
 * Official Statutory House Rent Table of National Pay Scale 2015
 * Effective from 1 July 2016 (অর্থ বিভাগ, অর্থ মন্ত্রণালয় প্রজ্ঞাপন তারিখ ১৫/১২/২০১৫ ও কার্যকর ০১/০৭/২০১৬)
 */
export const STATUTORY_HOUSE_RENT_SLABS_2015: StatutoryHouseRentSlab[] = [
  {
    tierNumber: 1,
    basicRangeBangla: '৯,৭০০/- টাকা পর্যন্ত',
    basicRangeEnglish: 'Up to Tk. 9,700',
    minBasic: 0,
    maxBasic: 9700,
    dhaka: {
      ratePercentage: 65,
      minimumAmount: 5600,
      ruleBangla: 'মূল বেতনের ৬৫% (ন্যূনতম ৫,৬০০/- টাকা)',
      ruleEnglish: '65% of basic salary (min Tk. 5,600)'
    },
    otherCityCorporation: {
      ratePercentage: 55,
      minimumAmount: 5000,
      ruleBangla: 'মূল বেতনের ৫৫% (ন্যূনতম ৫,০০০/- টাকা)',
      ruleEnglish: '55% of basic salary (min Tk. 5,000)'
    },
    otherAreas: {
      ratePercentage: 50,
      minimumAmount: 4500,
      ruleBangla: 'মূল বেতনের ৫০% (ন্যূনতম ৪,৫০০/- টাকা)',
      ruleEnglish: '50% of basic salary (min Tk. 4,500)'
    }
  },
  {
    tierNumber: 2,
    basicRangeBangla: '৯,৭০১/- টাকা হইতে ১৬,০০০/- টাকা পর্যন্ত',
    basicRangeEnglish: 'From Tk. 9,701 to Tk. 16,000',
    minBasic: 9701,
    maxBasic: 16000,
    dhaka: {
      ratePercentage: 60,
      minimumAmount: 6400,
      ruleBangla: 'মূল বেতনের ৬০% (ন্যূনতম ৬,৪০০/- টাকা)',
      ruleEnglish: '60% of basic salary (min Tk. 6,400)'
    },
    otherCityCorporation: {
      ratePercentage: 50,
      minimumAmount: 5400,
      ruleBangla: 'মূল বেতনের ৫০% (ন্যূনতম ৫,৪০০/- টাকা)',
      ruleEnglish: '50% of basic salary (min Tk. 5,400)'
    },
    otherAreas: {
      ratePercentage: 45,
      minimumAmount: 4800,
      ruleBangla: 'মূল বেতনের ৪৫% (ন্যূনতম ৪,৮০০/- টাকা)',
      ruleEnglish: '45% of basic salary (min Tk. 4,800)'
    }
  },
  {
    tierNumber: 3,
    basicRangeBangla: '১৬,০০১/- টাকা হইতে ৩৫,৫০০/- টাকা পর্যন্ত',
    basicRangeEnglish: 'From Tk. 16,001 to Tk. 35,500',
    minBasic: 16001,
    maxBasic: 35500,
    dhaka: {
      ratePercentage: 55,
      minimumAmount: 9600,
      ruleBangla: 'মূল বেতনের ৫৫% (ন্যূনতম ৯,৬০০/- টাকা)',
      ruleEnglish: '55% of basic salary (min Tk. 9,600)'
    },
    otherCityCorporation: {
      ratePercentage: 45,
      minimumAmount: 8000,
      ruleBangla: 'মূল বেতনের ৪৫% (ন্যূনতম ৮,০০০/- টাকা)',
      ruleEnglish: '45% of basic salary (min Tk. 8,000)'
    },
    otherAreas: {
      ratePercentage: 40,
      minimumAmount: 7000,
      ruleBangla: 'মূল বেতনের ৪০% (ন্যূনতম ৭,০০০/- টাকা)',
      ruleEnglish: '40% of basic salary (min Tk. 7,000)'
    }
  },
  {
    tierNumber: 4,
    basicRangeBangla: '৩৫,৫০১/- টাকা ও তদূর্ধ্ব',
    basicRangeEnglish: 'Tk. 35,501 and above',
    minBasic: 35501,
    maxBasic: null,
    dhaka: {
      ratePercentage: 50,
      minimumAmount: 19500,
      ruleBangla: 'মূল বেতনের ৫০% (ন্যূনতম ১৯,৫০০/- টাকা)',
      ruleEnglish: '50% of basic salary (min Tk. 19,500)'
    },
    otherCityCorporation: {
      ratePercentage: 40,
      minimumAmount: 16000,
      ruleBangla: 'মূল বেতনের ৪০% (ন্যূনতম ১৬,০০০/- টাকা)',
      ruleEnglish: '40% of basic salary (min Tk. 16,000)'
    },
    otherAreas: {
      ratePercentage: 35,
      minimumAmount: 13800,
      ruleBangla: 'মূল বেতনের ৩৫% (ন্যূনতম ১৩,৮০০/- টাকা)',
      ruleEnglish: '35% of basic salary (min Tk. 13,800)'
    }
  }
];

export function getStatutorySlabForBasic(basicSalary: number): StatutoryHouseRentSlab {
  if (basicSalary <= 9700) return STATUTORY_HOUSE_RENT_SLABS_2015[0];
  if (basicSalary <= 16000) return STATUTORY_HOUSE_RENT_SLABS_2015[1];
  if (basicSalary <= 35500) return STATUTORY_HOUSE_RENT_SLABS_2015[2];
  return STATUTORY_HOUSE_RENT_SLABS_2015[3];
}

export function calculateStatutoryHouseRent2015Client(
  basicSalary: number,
  location: HouseRentLocation = 'dhaka',
  isGovtQuarter: boolean = false
): StatutoryHouseRentResult {
  const locNameBn =
    location === 'dhaka'
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

  const slab = getStatutorySlabForBasic(basicSalary);
  let ratePercentage = 0;
  let minimumAmount = 0;

  if (location === 'dhaka') {
    ratePercentage = slab.dhaka.ratePercentage;
    minimumAmount = slab.dhaka.minimumAmount;
  } else if (location === 'other_city_corporation') {
    ratePercentage = slab.otherCityCorporation.ratePercentage;
    minimumAmount = slab.otherCityCorporation.minimumAmount;
  } else {
    ratePercentage = slab.otherAreas.ratePercentage;
    minimumAmount = slab.otherAreas.minimumAmount;
  }

  const calculatedAmount = Math.round((basicSalary * ratePercentage) / 100);
  const minApplied = calculatedAmount < minimumAmount;
  const finalAmount = Math.max(calculatedAmount, minimumAmount);

  const explanationBangla = `মূল বেতন ৳${basicSalary.toLocaleString('en-IN')} (স্ল্যাব: ${slab.basicRangeBangla})। ${locNameBn}র জন্য নির্ধারিত হার ${ratePercentage}%, যার পরিমাণ ৳${calculatedAmount.toLocaleString('en-IN')}${
    minApplied
      ? `, তবে সারণির বিধিবদ্ধ ন্যূনতম সীমা ৳${minimumAmount.toLocaleString('en-IN')} প্রযোজ্য হওয়ায় বাড়ি ভাড়া ভাতা ৳${finalAmount.toLocaleString('en-IN')}`
      : ` (ন্যূনতম সীমা ৳${minimumAmount.toLocaleString('en-IN')} এর বেশি হওয়ায় ৳${finalAmount.toLocaleString('en-IN')})`
  }।`;

  return {
    basicSalary,
    location,
    locationNameBangla: locNameBn,
    isGovtQuarter: false,
    tierNumber: slab.tierNumber,
    tierRangeText: slab.basicRangeBangla,
    ratePercentage,
    calculatedAmount,
    minimumAmount,
    finalAmount,
    minApplied,
    explanationBangla
  };
}

export interface AllLocationsHouseRentComparison {
  basicSalary: number;
  isGovtQuarter: boolean;
  tierNumber: 1 | 2 | 3 | 4;
  tierRangeBangla: string;
  tierRangeEnglish: string;
  dhaka: StatutoryHouseRentResult;
  otherCityCorporation: StatutoryHouseRentResult;
  otherAreas: StatutoryHouseRentResult;
}

export function calculateAllLocationsHouseRent(
  basicSalary: number,
  isGovtQuarter: boolean = false
): AllLocationsHouseRentComparison {
  const slab = getStatutorySlabForBasic(basicSalary);
  return {
    basicSalary,
    isGovtQuarter,
    tierNumber: slab.tierNumber,
    tierRangeBangla: slab.basicRangeBangla,
    tierRangeEnglish: slab.basicRangeEnglish,
    dhaka: calculateStatutoryHouseRent2015Client(basicSalary, 'dhaka', isGovtQuarter),
    otherCityCorporation: calculateStatutoryHouseRent2015Client(basicSalary, 'other_city_corporation', isGovtQuarter),
    otherAreas: calculateStatutoryHouseRent2015Client(basicSalary, 'other', isGovtQuarter)
  };
}
