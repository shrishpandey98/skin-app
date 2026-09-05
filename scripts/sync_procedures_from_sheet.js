const fs = require('fs');
const path = require('path');
const https = require('https');

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1W26C7Znao0cKC-smQmmP37D4tNxnhfH-/export?format=csv';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Robust CSV parser supporting quotes, newlines, commas
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal);
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx] : '';
    });
    return obj;
  });
}

function parseBullets(text) {
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const cleaned = [];
  for (const l of lines) {
    const c = l.replace(/^(\d+\.|\u2022|\-|\*)\s*/, '').trim();
    if (c) cleaned.push(c);
  }
  return cleaned;
}

function parseFAQs(text) {
  if (!text) return [];
  const faqs = [];
  const qMatches = [...text.matchAll(/(?:^|\n)Q:\s*([\s\S]+?)(?=\n\s*A:|$)/g)];
  for (let i = 0; i < qMatches.length; i++) {
    const qText = qMatches[i][1].trim();
    const startA = qMatches[i].index + qMatches[i][0].length;
    const endA = i + 1 < qMatches.length ? qMatches[i + 1].index : text.length;
    const aChunk = text.substring(startA, endA);
    const aMatch = aChunk.match(/A:\s*([\s\S]+)/);
    const aText = aMatch ? aMatch[1].trim() : '';
    if (qText && aText) {
      faqs.push({ question: qText, answer: aText });
    }
  }
  return faqs;
}

async function run() {
  console.log('Fetching live knowledge base from Google Sheet...');
  const csvText = await fetchUrl(SHEET_CSV_URL);
  const records = parseCSV(csvText);
  console.log(`Parsed ${records.length} raw rows.`);

  const procedures = [];

  records.forEach((r, index) => {
    const name = (r['Procedure Name'] || '').trim();
    if (!name) return;

    const id = (r['ID'] || `proc_${index + 1}`).trim();
    const slug = (
      r['Slug'] ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    ).trim();

    const category = (r['Category'] || 'skin').trim();
    const categoryLabel = (r['Category Label'] || category.toUpperCase()).trim();
    const shortDescription = (r['Short Description'] || '').trim();
    const description = (r['Full Description'] || shortDescription).trim();
    const machineOrTechnology = (r['Machine/Technology'] || '').trim();
    const commonUses = parseBullets(r['Common Uses / Indications']);
    const benefits = parseBullets(r['Key Benefits']);
    const whatToExpect = (r['What To Expect'] || '').trim();
    const sessionsInfo = (r['Sessions, Duration & Frequency'] || '').trim();
    const downtime = (r['Downtime & Recovery'] || '').trim();
    const considerations = parseBullets(r['Clinical Considerations & Precautions']);
    const faqs = parseFAQs(r['FAQs'] || '');
    const relatedStr = (r['Related Procedures'] || '').trim();
    const relatedProcedureSlugs = relatedStr
      ? relatedStr.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    let heroImageUrl = (r['Hero Image URL'] || '').trim();
    if (!heroImageUrl || !heroImageUrl.startsWith('http')) {
      heroImageUrl =
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop';
    }

    const isActive = (r['Active Status'] || 'Active').trim().toLowerCase() === 'active';
    const sortOrder = parseInt(r['Sort Order'], 10) || index + 1;
    const addedByName = (r['Added By (Name)'] || r['Added By'] || 'System').trim();

    procedures.push({
      id,
      name,
      slug,
      category,
      categoryLabel,
      shortDescription,
      description,
      heroImageUrl,
      ...(machineOrTechnology ? { machineOrTechnology } : {}),
      commonUses,
      benefits,
      whatToExpect,
      sessionsInfo,
      downtime,
      considerations,
      faqs,
      sortOrder,
      isActive,
      relatedProcedureSlugs,
      addedByName,
    });
  });

  console.log(`Processed ${procedures.length} valid procedures.`);

  // Write TypeScript file
  const tsContent = `// AUTO-GENERATED FROM LIVE GOOGLE SHEET KNOWLEDGE BASE
// Source: ${SHEET_CSV_URL}
// Generated at: ${new Date().toISOString()}

import { Procedure } from '../types/procedure.types';

export const PROCEDURES_KNOWLEDGE_BASE: Procedure[] = ${JSON.stringify(procedures, null, 2)};

export const MOCK_PROCEDURES: Procedure[] = PROCEDURES_KNOWLEDGE_BASE;
`;

  const outputPath = path.join(__dirname, '../src/data/procedures.data.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf-8');
  console.log(`Saved procedures to: ${outputPath}`);
}

run().catch((err) => {
  console.error('Error syncing procedures:', err);
  process.exit(1);
});
