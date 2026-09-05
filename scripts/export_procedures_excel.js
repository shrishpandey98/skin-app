const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Import procedures data from procedures.data.ts
const procDataContent = fs.readFileSync(path.join(__dirname, '../src/data/procedures.data.ts'), 'utf-8');

const procStart = procDataContent.indexOf('export const PROCEDURES_KNOWLEDGE_BASE: Procedure[] = [');
const procEnd = procDataContent.indexOf('export const MOCK_PROCEDURES');
const proceduresRaw = procDataContent.substring(procStart + 'export const PROCEDURES_KNOWLEDGE_BASE: Procedure[] = '.length, procEnd).trim().replace(/;$/, '');

let procedures = [];
try {
  procedures = eval(proceduresRaw);
} catch (e) {
  console.error('Eval error, using fallback parser', e);
}

console.log(`Loaded ${procedures.length} procedures.`);

// 1. MASTER SHEET - Full detail for each procedure
const masterRows = procedures.map((p, idx) => ({
  'ID': p.id,
  'Sort Order': p.sortOrder || idx + 1,
  'Procedure Name': p.name,
  'Slug': p.slug,
  'Category': p.category,
  'Category Label': p.categoryLabel,
  'Short Description': p.shortDescription,
  'Full Description': p.description,
  'Common Uses / Indications': (p.commonUses || []).map((u, i) => `${i + 1}. ${u}`).join('\n'),
  'Key Benefits': (p.benefits || []).map((b, i) => `• ${b}`).join('\n'),
  'What To Expect': p.whatToExpect,
  'Sessions & Frequency': p.sessionsInfo,
  'Downtime & Recovery': p.downtime,
  'Clinical Considerations & Precautions': (p.considerations || []).map((c, i) => `• ${c}`).join('\n'),
  'FAQs': (p.faqs || []).map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'),
  'Related Procedures': (p.relatedProcedureSlugs || []).join(', '),
  'Hero Image URL': p.heroImageUrl,
  'Added By (Name)': p.addedByName || 'System',
  'Added By Clinic ID': p.addedByClinicId || '',
  'Active Status': p.isActive ? 'Active' : 'Inactive',
}));

// 2. SUMMARY SHEET - Concise high-level view
const summaryRows = procedures.map((p, idx) => ({
  'No.': idx + 1,
  'Procedure Name': p.name,
  'Category': p.categoryLabel,
  'Downtime': p.downtime,
  'Recommended Sessions': p.sessionsInfo,
  'Quick Overview': p.shortDescription,
  'Top Uses': (p.commonUses || []).slice(0, 3).join('; '),
}));

// 3. FAQS SHEET - Individual questions and answers
const faqRows = [];
procedures.forEach(p => {
  (p.faqs || []).forEach(faq => {
    faqRows.push({
      'Procedure Name': p.name,
      'Category': p.categoryLabel,
      'Question': faq.question,
      'Answer': faq.answer,
    });
  });
});

// Create Workbook
const wb = XLSX.utils.book_new();

const wsMaster = XLSX.utils.json_to_sheet(masterRows);
const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
const wsFAQs = XLSX.utils.json_to_sheet(faqRows);

// Set column widths for better readability in Excel
wsMaster['!cols'] = [
  { wch: 15 }, // ID
  { wch: 10 }, // Sort Order
  { wch: 30 }, // Procedure Name
  { wch: 22 }, // Slug
  { wch: 15 }, // Category
  { wch: 18 }, // Category Label
  { wch: 45 }, // Short Description
  { wch: 60 }, // Full Description
  { wch: 45 }, // Common Uses
  { wch: 45 }, // Key Benefits
  { wch: 50 }, // What To Expect
  { wch: 35 }, // Sessions
  { wch: 35 }, // Downtime
  { wch: 45 }, // Considerations
  { wch: 50 }, // FAQs
  { wch: 30 }, // Related Procedures
  { wch: 40 }, // Hero Image URL
  { wch: 12 }, // Active Status
];

wsSummary['!cols'] = [
  { wch: 6 },
  { wch: 30 },
  { wch: 18 },
  { wch: 30 },
  { wch: 40 },
  { wch: 50 },
  { wch: 45 },
];

wsFAQs['!cols'] = [
  { wch: 30 },
  { wch: 18 },
  { wch: 45 },
  { wch: 70 },
];

XLSX.utils.book_append_sheet(wb, wsMaster, 'All Procedures (Master)');
XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Overview');
XLSX.utils.book_append_sheet(wb, wsFAQs, 'Patient FAQs');

const excelPath = path.join(__dirname, '../procedures_catalog.xlsx');
XLSX.writeFile(wb, excelPath);

// Also generate a clean Master CSV
const csvContent = XLSX.utils.sheet_to_csv(wsMaster);
const csvPath = path.join(__dirname, '../procedures_catalog.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');

console.log(`Successfully generated:`);
console.log(`- Excel Workbook: ${excelPath}`);
console.log(`- CSV File: ${csvPath}`);
