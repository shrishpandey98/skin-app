import AsyncStorage from '@react-native-async-storage/async-storage';
import { Procedure, ProcedureCategory } from '../types/procedure.types';
import { PROCEDURES_KNOWLEDGE_BASE } from '../data/procedures.data';

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1W26C7Znao0cKC-smQmmP37D4tNxnhfH-/export?format=csv';

const STORAGE_KEY = '@aura_live_procedures_knowledge_base_v4';
const LAST_FETCHED_KEY = '@aura_live_procedures_last_fetched';
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes fresh cache

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

class ProcedureKnowledgeBaseService {
  private inMemoryProcedures: Procedure[] = PROCEDURES_KNOWLEDGE_BASE;
  private isInitialized: boolean = false;
  private isFetching: boolean = false;

  constructor() {
    this.init();
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

      // 2. Refresh from live Google Sheet in background if stale
      const lastFetchedStr = await AsyncStorage.getItem(LAST_FETCHED_KEY);
      const lastFetched = lastFetchedStr ? parseInt(lastFetchedStr, 10) : 0;
      if (Date.now() - lastFetched > CACHE_TTL_MS) {
        this.fetchLiveSheet(false);
      }
    } catch (e) {
      console.warn('[KnowledgeBase] Local init fallback to bundled data', e);
      this.inMemoryProcedures = PROCEDURES_KNOWLEDGE_BASE;
      this.isInitialized = true;
    }
  }

  // Live Fetch & Parse from Google Sheet URL
  async fetchLiveSheet(forceRefresh: boolean = false): Promise<Procedure[]> {
    if (this.isFetching) return this.inMemoryProcedures;

    try {
      this.isFetching = true;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

      const response = await fetch(SHEET_CSV_URL, {
        signal: controller.signal,
        headers: { 'Cache-Control': forceRefresh ? 'no-cache' : 'default' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Google Sheet fetch failed with HTTP ${response.status}`);
      }

      const csvText = await response.text();
      const records = parseCSV(csvText);

      if (!records || records.length === 0) {
        throw new Error('Empty CSV returned from Google Sheet');
      }

      const procedures: Procedure[] = [];

      records.forEach((r, index) => {
        const name = (r['Procedure Name'] || '').trim();
        if (!name) return;

        const rawId = (r['ID'] || `proc_${index + 1}`).trim();
        const rawSlug = (
          r['Slug'] ||
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        ).trim();

        let slug = rawSlug;
        let counter = 1;
        while (procedures.some((p) => p.slug === slug)) {
          slug = `${rawSlug}-${counter++}`;
        }

        let id = rawId;
        counter = 1;
        while (procedures.some((p) => p.id === id)) {
          id = `${rawId}_${counter++}`;
        }

        const rawCat = (r['Category'] || 'skin').trim();
        const category = normalizeCategory(rawCat);
        const categoryLabel = (r['Category Label'] || rawCat.toUpperCase()).trim();
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

      if (procedures.length > 0) {
        this.inMemoryProcedures = procedures;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(procedures));
        await AsyncStorage.setItem(LAST_FETCHED_KEY, Date.now().toString());
        console.log(`[KnowledgeBase] Successfully synced ${procedures.length} procedures from live Google Sheet.`);
      }

      return this.inMemoryProcedures;
    } catch (err) {
      console.warn('[KnowledgeBase] Live sync error, continuing with cached/bundled data:', err);
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
      await this.fetchLiveSheet(forceRefresh);
    }

    let list = this.inMemoryProcedures;

    // Filter by clinic visibility: global master procedures + procedures created by this specific clinic
    if (forClinicId) {
      list = list.filter(
        (p) => !p.addedByClinicId || p.addedByClinicId === forClinicId || p.isGloballyEnabled
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

  // Add custom procedure (e.g. from Doctor portal)
  addCustomProcedure(proc: Procedure) {
    const index = this.inMemoryProcedures.findIndex((p) => p.slug === proc.slug || p.id === proc.id);
    if (index >= 0) {
      this.inMemoryProcedures[index] = proc;
    } else {
      this.inMemoryProcedures.unshift(proc);
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryProcedures)).catch(() => {});
  }

  // Direct synchronous access to current in-memory knowledge base
  getSynchronousList(): Procedure[] {
    return this.inMemoryProcedures;
  }
}

export const procedureKnowledgeBaseService = new ProcedureKnowledgeBaseService();
