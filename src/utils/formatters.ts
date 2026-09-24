/**
 * Utility functions for bilingual currency, numbers, and document exports
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { Language } from '../types.ts';

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaNum(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BANGLA_DIGITS[parseInt(digit, 10)]);
}

export function formatCurrency(amount: number | undefined | null, lang: Language = 'bn'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return lang === 'bn' ? '০ টাকা' : '৳ 0.00';
  }

  // Format with Indian numbering system (lakh/crore)
  const formattedEn = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);

  if (lang === 'bn') {
    return `${toBanglaNum(formattedEn)} টাকা`;
  }
  return `৳ ${formattedEn}`;
}

export function formatDate(dateStr?: string, lang: Language = 'bn'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const formatted = d.toLocaleDateString('en-GB'); // DD/MM/YYYY
    return lang === 'bn' ? toBanglaNum(formatted) : formatted;
  } catch {
    return dateStr;
  }
}

/**
 * Trigger official desktop print dialog
 */
export function triggerPrint() {
  window.print();
}

/**
 * Export table data to Excel (.xlsx)
 */
export function exportToExcel(data: Record<string, any>[], filename: string, sheetName: string = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export Pay Fixation Sheet to PDF using jsPDF + autoTable with embedded Nikosh font
 */
export async function exportFixationToPDF(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const doc = new jsPDF();
  let fontName = 'helvetica';

  try {
    const res = await fetch('/fonts/Nikosh.ttf');
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      doc.addFileToVFS('Nikosh.ttf', base64);
      doc.addFont('Nikosh.ttf', 'Nikosh', 'normal');
      fontName = 'Nikosh';
    }
  } catch (err) {
    console.warn('Nikosh font could not be embedded into PDF:', err);
  }

  doc.setFont(fontName);
  doc.setFontSize(14);
  doc.text("Government of the People's Republic of Bangladesh", 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text("Finance Division, Ministry of Finance", 105, 22, { align: 'center' });
  doc.setFontSize(11);
  doc.text(title, 105, 29, { align: 'center' });
  doc.setFontSize(9);
  doc.text("Gazette Reference: S.R.O. No. 347-Law/2026 (17 September 2026)", 105, 35, { align: 'center' });

  autoTable(doc, {
    startY: 40,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: 'bold', font: fontName },
    styles: { font: fontName, fontSize: 9, cellPadding: 3 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  doc.setFont(fontName);
  doc.setFontSize(9);
  doc.text("Prepared By: ____________________", 20, finalY + 30);
  doc.text("Checked By: ____________________", 100, finalY + 30);
  doc.text("Approved By: ____________________", 150, finalY + 30);

  doc.save(`${filename}.pdf`);
}

/**
 * Export to DOCX Word Document using docx library with Nikosh font
 */
export async function exportToDocx(title: string, tableRows: { label: string; value: string }[], filename: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Government of the People's Republic of Bangladesh", font: 'Nikosh', bold: true, size: 28 })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: "Ministry of Finance | Finance Division", font: 'Nikosh', size: 24 })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: title, font: 'Nikosh', bold: true, size: 22 })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: "Official Reference: National Pay Scale Order 2026 (S.R.O. 347-Law/2026)", font: 'Nikosh', size: 18 })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows.map(
              r =>
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 40, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: r.label, bold: true, font: 'Nikosh' })] })]
                    }),
                    new TableCell({
                      width: { size: 60, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: r.value, font: 'Nikosh' })] })]
                    })
                  ]
                })
            )
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Prepared By: _________________       ", font: 'Nikosh' }),
              new TextRun({ text: "Checked By: _________________       ", font: 'Nikosh' }),
              new TextRun({ text: "Approved By: _________________", font: 'Nikosh' })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

const banglaNumbersMap: Record<number, string> = {
  0: 'শূন্য', 1: 'এক', 2: 'দুই', 3: 'তিন', 4: 'চার', 5: 'পাঁচ', 6: 'ছয়', 7: 'সাত', 8: 'আট', 9: 'নয়', 10: 'দশ',
  11: 'এগারো', 12: 'বারো', 13: 'তেরো', 14: 'চৌদ্দ', 15: 'পনেরো', 16: 'ষোলো', 17: 'সতেরো', 18: 'আঠারো', 19: 'উনিশ', 20: 'বিশ',
  21: 'একুশ', 22: 'বাইশ', 23: 'তেইশ', 24: 'চব্বিশ', 25: 'পঁচিশ', 26: 'ছাব্বিশ', 27: 'সাতাশ', 28: 'আঠাশ', 29: 'উনত্রিশ', 30: 'ত্রিশ',
  31: 'একত্রিশ', 32: 'বত্রিশ', 33: 'তেত্রিশ', 34: 'চৌত্রিশ', 35: 'পঁয়ত্রিশ', 36: 'ছত্রিশ', 37: 'সাঁইত্রিশ', 38: 'আটত্রিশ', 39: 'উনচল্লিশ', 40: 'চল্লিশ',
  41: 'একচল্লিশ', 42: 'বিয়াল্লিশ', 43: 'তেতাল্লিশ', 44: 'চুয়াল্লিশ', 45: 'পঁয়তাল্লিশ', 46: 'ছেচল্লিশ', 47: 'সাতচল্লিশ', 48: 'আটচল্লিশ', 49: 'উনপঞ্চাশ', 50: 'পঞ্চাশ',
  51: 'একান্ন', 52: 'বায়ান্ন', 53: 'তিপ্পান্ন', 54: 'চুয়ান্ন', 55: 'পঞ্চান্ন', 56: 'ছাপ্পান্ন', 57: 'সাতান্ন', 58: 'আটান্ন', 59: 'উনষাট', 60: 'ষাট',
  61: 'একষট্টি', 62: 'বাষট্টি', 63: 'তেষট্টি', 64: 'চৌষট্টি', 65: 'পঁয়ষট্টি', 66: 'ছেষট্টি', 67: 'সাতষট্টি', 68: 'আটষট্টি', 69: 'উনসত্তর', 70: 'সত্তর',
  71: 'একাত্তর', 72: 'বাহাত্তর', 73: 'তিয়াত্তর', 74: 'চুয়াত্তর', 75: 'পঁচাত্তর', 76: 'ছিয়াত্তর', 77: 'সাতাত্তর', 78: 'আটাত্তর', 79: 'উনআশি', 80: 'আশি',
  81: 'একাশি', 82: 'বিরাশি', 83: 'তিরাশি', 84: 'চুরাশি', 85: 'পঁচাশি', 86: 'ছিয়াশি', 87: 'সাতাশি', 88: 'আটাশি', 89: 'উননব্বই', 90: 'নব্বই',
  91: 'একানব্বই', 92: 'বানব্বই', 93: 'তিরানব্বই', 94: 'চুরানব্বই', 95: 'পঁচানব্বই', 96: 'ছিয়ানব্বই', 97: 'সাতানব্বই', 98: 'আটানব্বই', 99: 'নিরানব্বই'
};

export function numberToBanglaWords(num: number): string {
  if (isNaN(num) || num === 0) return 'শূন্য টাকা মাত্র';
  const n = Math.floor(Math.abs(num));
  let result = '';

  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  const rest = rem % 100;

  if (crore > 0) {
    result += (banglaNumbersMap[crore] || crore) + ' কোটি ';
  }
  if (lakh > 0) {
    result += (banglaNumbersMap[lakh] || lakh) + ' লক্ষ ';
  }
  if (thousand > 0) {
    result += (banglaNumbersMap[thousand] || thousand) + ' হাজার ';
  }
  if (hundred > 0) {
    result += (banglaNumbersMap[hundred] || hundred) + ' শত ';
  }
  if (rest > 0) {
    result += (banglaNumbersMap[rest] || rest) + ' ';
  }

  return result.trim() + ' টাকা মাত্র';
}

export function numberToEnglishWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Taka Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };

  const n = Math.floor(Math.abs(num));
  let str = '';
  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  const rest = rem % 100;

  if (crore > 0) str += inWords(crore) + ' Crore ';
  if (lakh > 0) str += inWords(lakh) + ' Lakh ';
  if (thousand > 0) str += inWords(thousand) + ' Thousand ';
  if (hundred > 0) str += inWords(hundred) + ' Hundred ';
  if (rest > 0) str += inWords(rest) + ' ';

  return str.trim() + ' Taka Only';
}

/**
 * Export Pay Slip to PDF with professional Government layout
 */
export function exportPaySlipPDF(params: {
  employeeName: string;
  designation: string;
  grade: number;
  basicPay: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  monthStr: string;
  allowancesList: { name: string; amount: number }[];
  deductionsList: { name: string; amount: number }[];
  filename?: string;
}) {
  const doc = new jsPDF();

  // Government Header
  doc.setFontSize(14);
  doc.text("Government of the People's Republic of Bangladesh", 105, 14, { align: 'center' });
  doc.setFontSize(11);
  doc.text("Ministry of Finance | Finance Division", 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text("EMPLOYEE MONTHLY PAY SLIP", 105, 27, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Salary Period: ${params.monthStr}  |  Pay Scale Order 2026 (S.R.O. 347-Law/2026)`, 105, 33, { align: 'center' });

  // Employee details bar
  doc.setFontSize(10);
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 38, 182, 22, 'FD');

  doc.text(`Employee Name: ${params.employeeName}`, 18, 45);
  doc.text(`Designation: ${params.designation}`, 18, 51);
  doc.text(`Grade: Grade ${params.grade}`, 18, 57);

  doc.text(`Basic Pay: Tk. ${params.basicPay.toLocaleString('en-IN')}`, 120, 45);
  doc.text(`Gross Pay: Tk. ${params.grossSalary.toLocaleString('en-IN')}`, 120, 51);
  doc.text(`Net Payable: Tk. ${params.netSalary.toLocaleString('en-IN')}`, 120, 57);

  // Table of Allowances and Deductions
  const tableRows: (string | number)[][] = [];
  const maxRows = Math.max(params.allowancesList.length, params.deductionsList.length);

  for (let i = 0; i < maxRows; i++) {
    const al = params.allowancesList[i];
    const de = params.deductionsList[i];
    tableRows.push([
      al ? al.name : '',
      al ? al.amount.toLocaleString('en-IN') : '',
      de ? de.name : '',
      de ? de.amount.toLocaleString('en-IN') : ''
    ]);
  }

  // Totals row
  tableRows.push([
    'TOTAL EARNINGS (GROSS)',
    params.grossSalary.toLocaleString('en-IN'),
    'TOTAL DEDUCTIONS',
    params.totalDeductions.toLocaleString('en-IN')
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Earnings & Allowances', 'Amount (Tk)', 'Statutory Deductions', 'Amount (Tk)']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 78, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 160;

  // Net Pay Callout
  doc.setFillColor(235, 245, 240);
  doc.rect(14, finalY + 6, 182, 14, 'FD');
  doc.setFontSize(11);
  doc.setTextColor(15, 80, 50);
  doc.text(`NET PAYABLE SALARY: Tk. ${params.netSalary.toLocaleString('en-IN')}`, 20, finalY + 15);
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`In Words: ${numberToEnglishWords(params.netSalary)}`, 20, finalY + 25);

  // Signature lines
  const sigY = finalY + 50;
  doc.setFontSize(9);
  doc.text("_________________________", 25, sigY);
  doc.text("Prepared By (Bill Assistant)", 25, sigY + 5);

  doc.text("_________________________", 85, sigY);
  doc.text("Checked By (Accounts)", 85, sigY + 5);

  doc.text("_________________________", 145, sigY);
  doc.text("Approved By (D.D.O.)", 145, sigY + 5);

  doc.save(`${params.filename || 'salary-slip-2026'}.pdf`);
}
