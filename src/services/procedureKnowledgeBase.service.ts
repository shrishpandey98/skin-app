import AsyncStorage from '@react-native-async-storage/async-storage';
import { Procedure, ProcedureCategory } from '../types/procedure.types';
import { PROCEDURES_KNOWLEDGE_BASE } from '../data/procedures.data';

const MAIN_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1xA9F2Y-4ErfPq3oR0TmKFNIjmMdVo6twtLwc2dH7ETQ/gviz/tq?tqx=out:csv&sheet=Main';
const MAIN_SHEET_FALLBACK_URL =
  'https://docs.google.com/spreadsheets/d/1xA9F2Y-4ErfPq3oR0TmKFNIjmMdVo6twtLwc2dH7ETQ/export?format=csv&gid=0';

const NEW_PROCEDURES_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1xA9F2Y-4ErfPq3oR0TmKFNIjmMdVo6twtLwc2dH7ETQ/gviz/tq?tqx=out:csv&sheet=New%20procedures';
const NEW_PROCEDURES_FALLBACK_URL =
  'https://docs.google.com/spreadsheets/d/1xA9F2Y-4ErfPq3oR0TmKFNIjmMdVo6twtLwc2dH7ETQ/export?format=csv&gid=680012059';

// Webhook URL for Google Apps Script to write new rows (can be set via environment variable or default)
const GOOGLE_APPS_SCRIPT_WEBHOOK_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_PROCEDURES_SHEET_WEBHOOK_URL) ||
  'https://script.google.com/macros/s/AKfycbyJQfjOU2Szm_iVZ4pa5HTfvltjPNqOBhVrk6afGJdWhjsUGqg8s-Ep-Lu5y25eMi9S/exec';

const STORAGE_KEY = '@aura_live_procedures_knowledge_base_v9';
const LAST_FETCHED_KEY = '@aura_live_procedures_last_fetched';
const CACHE_TTL_MS = 1000 * 60 * 2; // 2 minutes fresh cache for quick updates from sheet
const AUTO_SYNC_INTERVAL_MS = 1000 * 60; // Auto-poll sheet every 60 seconds in background

// CSV Parser Helper
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
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
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] !== undefined ? row[idx] : '';
    });
    return obj;
  });
}

function parseBullets(text?: string): string[] {
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const cleaned: string[] = [];
  for (const l of lines) {
    const c = l.replace(/^(\d+\.|\u2022|\-|\*)\s*/, '').trim();
    if (c) cleaned.push(c);
  }
  return cleaned;
}

function normalizeCategory(cat: string): ProcedureCategory {
  const c = (cat || '').toLowerCase().trim();
  if (c === 'skin' || c === 'hair' || c === 'laser' || c === 'aesthetics') return c as ProcedureCategory;
  if (c.includes('hair') || c.includes('scalp')) return 'hair';
  if (c.includes('laser') || c.includes('toning') || c.includes('ipl')) return 'laser';
  if (
    c.includes('anti-aging') ||
    c.includes('injectable') ||
    c.includes('aesthetic') ||
    c.includes('botox') ||
    c.includes('filler') ||
    c.includes('hifu') ||
    c.includes('thread') ||
    c.includes('contour')
  ) {
    return 'aesthetics';
  }
  return 'skin';
}

function parseFAQs(text?: string): { question: string; answer: string }[] {
  if (!text) return [];
  const faqs: { question: string; answer: string }[] = [];
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

function parseProcedureRow(
  r: Record<string, string>,
  index: number,
  isFromNewProceduresSheet: boolean = false
): Procedure | null {
  const name = (r['Procedure Name'] || r['procedure_name'] || r['Name'] || '').trim();
  if (!name) return null;

  const rawId = (r['ID'] || r['id'] || `proc_${isFromNewProceduresSheet ? 'new_' : ''}${index + 1}`).trim();
  const rawSlug = (
    r['Slug'] ||
    r['slug'] ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  ).trim();

  const rawCat = (r['Category'] || r['category'] || 'skin').trim();
  const category = normalizeCategory(rawCat);
  const categoryLabel = (r['Category Label'] || r['category_label'] || rawCat.toUpperCase()).trim();
  const shortDescription = (r['Short Description'] || r['short_description'] || '').trim();
  const description = (r['Full Description'] || r['description'] || shortDescription).trim();
  const machineOrTechnology = (r['Machine/Technology'] || r['machine_technology'] || '').trim();
  const commonUses = parseBullets(r['Common Uses / Indications'] || r['common_uses']);
  const benefits = parseBullets(r['Key Benefits'] || r['benefits']);
  const whatToExpect = (r['What To Expect'] || r['what_to_expect'] || '').trim();
  const sessionsInfo = (r['Sessions, Duration & Frequency'] || r['sessions_info'] || '').trim();
  const downtime = (r['Downtime & Recovery'] || r['downtime'] || '').trim();
  const considerations = parseBullets(r['Clinical Considerations & Precautions'] || r['considerations']);
  const faqs = parseFAQs(r['FAQs'] || r['faqs'] || '');
  const relatedStr = (r['Related Procedures'] || r['related_procedures'] || '').trim();
  const relatedProcedureSlugs = relatedStr
    ? relatedStr.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  let heroImageUrl = (r['Hero Image URL'] || r['hero_image_url'] || '').trim();
  if (!heroImageUrl || !heroImageUrl.startsWith('http')) {
    heroImageUrl =
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop';
  }

  const isActive = (r['Active Status'] || r['active_status'] || 'Active').trim().toLowerCase() === 'active';
  const sortOrder = parseInt(r['Sort Order'] || r['sort_order'], 10) || index + 1;

  // Clinic attribution from new sheet columns or standard columns
  const clinicProfileId = (
    r['Clinic Profile ID'] ||
    r['Clinic ID'] ||
    r['clinic_profile_id'] ||
    r['clinicId'] ||
    r['addedByClinicId'] ||
    ''
  ).trim();

  const addedByName = (
    r['Clinic Name'] ||
    r['clinic_name'] ||
    r['Added By (Name)'] ||
    r['Added By'] ||
    r['addedByName'] ||
    'System'
  ).trim();

  return {
    id: rawId,
    name,
    slug: rawSlug,
    category,
    categoryLabel,
    shortDescription: shortDescription || `${name} procedure offered in-clinic.`,
    description: description || shortDescription || `${name} treatment tailored to clinical and aesthetic goals.`,
    heroImageUrl,
    ...(machineOrTechnology ? { machineOrTechnology } : {}),
    commonUses: commonUses.length > 0 ? commonUses : ['Clinical skincare & enhancement'],
    benefits: benefits.length > 0 ? benefits : ['Dermatologist supervised', 'Results-oriented care'],
    whatToExpect: whatToExpect || 'In-depth clinical assessment and customized protocol.',
    sessionsInfo: sessionsInfo || 'Tailored by dermatologist during consultation.',
    downtime: downtime || 'Zero downtime',
    considerations: considerations.length > 0 ? considerations : ['Follow post-care guidance and sun protection'],
    faqs: faqs.length > 0 ? faqs : [{ question: `Is ${name} safe?`, answer: 'Yes, performed by qualified dermatologists.' }],
    sortOrder,
    isActive,
    relatedProcedureSlugs,
    addedByName,
    addedByClinicId: clinicProfileId || undefined,
    addedByClinicName: addedByName !== 'System' ? addedByName : undefined,
    clinicProfileId: clinicProfileId || undefined,
    isGloballyEnabled: !isFromNewProceduresSheet && !clinicProfileId,
  };
}

class ProcedureKnowledgeBaseService {
  private inMemoryProcedures: Procedure[] = PROCEDURES_KNOWLEDGE_BASE;
  private isInitialized: boolean = false;
  private isFetching: boolean = false;
  private listeners: Set<(procedures: Procedure[]) => void> = new Set();
  private autoSyncTimer: any = null;

  constructor() {
    this.init();
  }

  // Subscribe to real-time updates when Google Sheet data changes
  subscribe(listener: (procedures: Procedure[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately call listener with current data
    listener(this.inMemoryProcedures);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const current = [...this.inMemoryProcedures];
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (e) {
        console.warn('[KnowledgeBase] Listener error:', e);
      }
    });
  }

  private async fetchCsvWithFallback(primaryUrl: string, fallbackUrl: string, timeoutMs: number = 8000): Promise<string | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(primaryUrl, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(id);
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes('<!DOCTYPE html>') && text.length > 50) {
          return text;
        }
      }
    } catch (e) {}

    // Fallback URL
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(fallbackUrl, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(id);
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes('<!DOCTYPE html>') && text.length > 50) {
          return text;
        }
      }
    } catch (e) {}

    return null;
  }

  private async init() {
    try {
      // 1. Try to load cached procedures from local storage
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= PROCEDURES_KNOWLEDGE_BASE.length) {
          this.inMemoryProcedures = parsed;
        } else {
          this.inMemoryProcedures = PROCEDURES_KNOWLEDGE_BASE;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(PROCEDURES_KNOWLEDGE_BASE));
        }
      } else {
        this.inMemoryProcedures = PROCEDURES_KNOWLEDGE_BASE;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(PROCEDURES_KNOWLEDGE_BASE));
      }

      this.isInitialized = true;
      this.notifyListeners();

      // 2. Immediately trigger live sync from Google Sheet (Main + New procedures) on startup
      this.fetchLiveSheet(true);

      // 3. Start recurring background auto-sync timer (every 60s)
      if (!this.autoSyncTimer) {
        this.autoSyncTimer = setInterval(() => {
          this.fetchLiveSheet(true);
        }, AUTO_SYNC_INTERVAL_MS);
      }
    } catch (e) {
      console.warn('[KnowledgeBase] Local init fallback to bundled data', e);
      this.inMemoryProcedures = PROCEDURES_KNOWLEDGE_BASE;
      this.isInitialized = true;
      this.notifyListeners();
    }
  }

  // Live Fetch & Parse from both worksheet "Main" and "New procedures"
  async fetchLiveSheet(forceRefresh: boolean = false): Promise<Procedure[]> {
    if (this.isFetching) return this.inMemoryProcedures;

    try {
      this.isFetching = true;

      // Fetch both Worksheet "Main" and Worksheet "New procedures" in parallel
      const [mainCsv, newProcsCsv] = await Promise.all([
        this.fetchCsvWithFallback(MAIN_SHEET_CSV_URL, MAIN_SHEET_FALLBACK_URL),
        this.fetchCsvWithFallback(NEW_PROCEDURES_SHEET_CSV_URL, NEW_PROCEDURES_FALLBACK_URL),
      ]);

      const parsedProcedures: Procedure[] = [];
      const seenSlugs = new Set<string>();

      // 1. Ingest Worksheet "Main"
      if (mainCsv) {
        try {
          const records = parseCSV(mainCsv);
          records.forEach((r, idx) => {
            const proc = parseProcedureRow(r, idx, false);
            if (proc && !seenSlugs.has(proc.slug)) {
              seenSlugs.add(proc.slug);
              parsedProcedures.push(proc);
            }
          });
        } catch (e) {
          console.warn('[KnowledgeBase] Error parsing Main sheet CSV:', e);
        }
      }

      // 2. Ingest Worksheet "New procedures"
      if (newProcsCsv) {
        try {
          const newRecords = parseCSV(newProcsCsv);
          newRecords.forEach((r, idx) => {
            const proc = parseProcedureRow(r, idx, true);
            if (proc) {
              // If already exists from Main sheet, update with the latest custom/clinic details
              const existingIdx = parsedProcedures.findIndex(
                (p) => p.slug === proc.slug || p.id === proc.id || p.name.toLowerCase() === proc.name.toLowerCase()
              );
              if (existingIdx >= 0) {
                parsedProcedures[existingIdx] = {
                  ...parsedProcedures[existingIdx],
                  ...proc,
                  addedByClinicId: proc.addedByClinicId || parsedProcedures[existingIdx].addedByClinicId,
                  addedByClinicName: proc.addedByClinicName || parsedProcedures[existingIdx].addedByClinicName,
                };
              } else {
                seenSlugs.add(proc.slug);
                parsedProcedures.push(proc);
              }
            }
          });
        } catch (e) {
          console.warn('[KnowledgeBase] Error parsing New procedures sheet CSV:', e);
        }
      }

      // 3. Retain local in-memory procedures added in this session that may not yet be in Google Sheet
      this.inMemoryProcedures.forEach((localProc) => {
        if (localProc.addedByClinicId) {
          const exists = parsedProcedures.some(
            (p) => p.slug === localProc.slug || p.id === localProc.id
          );
          if (!exists) {
            parsedProcedures.unshift(localProc);
          }
        }
      });

      if (parsedProcedures.length > 0) {
        this.inMemoryProcedures = parsedProcedures;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedProcedures));
        await AsyncStorage.setItem(LAST_FETCHED_KEY, Date.now().toString());
        console.log(`[KnowledgeBase] Successfully ingested ${parsedProcedures.length} procedures from live Google Sheets ("Main" + "New procedures").`);
        this.notifyListeners();
      }

      return this.inMemoryProcedures;
    } catch (err) {
      console.warn('[KnowledgeBase] Live sync error, continuing with current data:', err);
      return this.inMemoryProcedures;
    } finally {
      this.isFetching = false;
    }
  }

  // Get all procedures with optional category and clinic scope filter
  async getAllProcedures(
    category?: string,
    forceRefresh: boolean = false,
    forClinicId?: string
  ): Promise<Procedure[]> {
    if (this.inMemoryProcedures.length < PROCEDURES_KNOWLEDGE_BASE.length) {
      this.inMemoryProcedures = PROCEDURES_KNOWLEDGE_BASE;
    }

    if (forceRefresh) {
      try {
        await this.fetchLiveSheet(forceRefresh);
      } catch (e) {
        console.warn('Live fetch error in getAllProcedures:', e);
      }
    }

    let list = this.inMemoryProcedures;

    // Filter by clinic visibility:
    // - Global master procedures (isGloballyEnabled = true / no addedByClinicId)
    // - Clinic-specific procedures (only if matching forClinicId)
    if (forClinicId) {
      list = list.filter(
        (p) =>
          !p.addedByClinicId ||
          p.addedByClinicId === forClinicId ||
          p.clinicProfileId === forClinicId ||
          p.isGloballyEnabled
      );
    }

    if (!category || category === 'all') {
      return list;
    }

    const catKey = category.toLowerCase().trim();

    return list.filter((p) => {
      const pCat = normalizeCategory(p.category || '');
      return pCat === catKey;
    });
  }

  // Get single procedure by slug or ID
  async getProcedureBySlug(slug: string): Promise<Procedure | null> {
    const proc = this.inMemoryProcedures.find((p) => p.slug === slug || p.id === slug);
    if (proc) return proc;

    // If not found in current memory, try fresh sync once
    const fresh = await this.fetchLiveSheet(false);
    return fresh.find((p) => p.slug === slug || p.id === slug) || null;
  }

  // Get the 4 core categories
  async getCategories(): Promise<{ id: string; label: string; count: number }[]> {
    const list = await this.getAllProcedures();
    const categoriesConfig = [
      { id: 'skin', label: 'Skin' },
      { id: 'hair', label: 'Hair' },
      { id: 'laser', label: 'Laser' },
      { id: 'aesthetics', label: 'Aesthetics' },
    ];

    return categoriesConfig.map((cat) => ({
      id: cat.id,
      label: cat.label,
      count: list.filter((p) => p.category.toLowerCase() === cat.id).length,
    }));
  }

  // Sync newly added procedure to Google Sheet "New procedures" tab via Webhook / Apps Script
  async syncProcedureToGoogleSheet(proc: Procedure): Promise<boolean> {
    const payload = {
      action: 'add_new_procedure',
      sheetName: 'New procedures',
      sheetGid: '680012059',
      id: proc.id,
      sortOrder: proc.sortOrder || 1,
      procedureName: proc.name,
      slug: proc.slug,
      category: proc.category,
      categoryLabel: proc.categoryLabel || proc.category.toUpperCase(),
      clinicProfileId: proc.addedByClinicId || proc.clinicProfileId || '',
      clinicName: proc.addedByClinicName || proc.addedByName || '',
      shortDescription: proc.shortDescription || '',
      fullDescription: proc.description || '',
      machineTechnology: proc.machineOrTechnology || '',
      commonUses: (proc.commonUses || []).join('\n• '),
      keyBenefits: (proc.benefits || []).join('\n• '),
      whatToExpect: proc.whatToExpect || '',
      sessionsDurationFrequency: proc.sessionsInfo || '',
      downtimeRecovery: proc.downtime || 'Zero downtime',
      clinicalConsiderations: (proc.considerations || []).join('\n• '),
      faqs: (proc.faqs || []).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'),
      heroImageUrl: proc.heroImageUrl || '',
      addedByName: proc.addedByName || proc.addedByClinicName || 'Doctor',
      activeStatus: proc.isActive ? 'Active' : 'Pending Review',
      timestamp: new Date().toISOString(),
    };

    console.log('[GoogleSheetSync] Prepared procedure row for "New procedures" sheet:', payload);

    if (GOOGLE_APPS_SCRIPT_WEBHOOK_URL) {
      try {
        await fetch(GOOGLE_APPS_SCRIPT_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        console.log('[GoogleSheetSync] Successfully posted procedure to Google Sheet webhook.');
        return true;
      } catch (err) {
        console.warn('[GoogleSheetSync] Webhook network sync notice (will retain locally):', err);
      }
    } else {
      console.warn('[GoogleSheetSync] EXPO_PUBLIC_PROCEDURES_SHEET_WEBHOOK_URL is not configured. Deploy the Apps Script from docs/GOOGLE_SHEETS_INTEGRATION.md to enable automatic writing.');
    }

    return false;
  }

  // Add custom procedure (e.g. from Doctor portal)
  async addCustomProcedure(proc: Procedure): Promise<boolean> {
    const index = this.inMemoryProcedures.findIndex((p) => p.slug === proc.slug || p.id === proc.id);
    if (index >= 0) {
      this.inMemoryProcedures[index] = { ...this.inMemoryProcedures[index], ...proc };
    } else {
      this.inMemoryProcedures.unshift(proc);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryProcedures)).catch(() => {});
    this.notifyListeners();

    // Dispatch sync to Google Sheet
    return await this.syncProcedureToGoogleSheet(proc);
  }

  // Direct synchronous access to current in-memory knowledge base
  getSynchronousList(): Procedure[] {
    return this.inMemoryProcedures;
  }
}

export const procedureKnowledgeBaseService = new ProcedureKnowledgeBaseService();

