export type ProcedureCategory = 'all' | 'skin' | 'hair' | 'injectables' | 'laser' | 'anti_ageing' | 'body';

export interface FAQItemData {
  question: string;
  answer: string;
}

export interface Procedure {
  id: string;
  name: string;
  slug: string;
  category: ProcedureCategory;
  categoryLabel?: string;
  shortDescription: string;
  description: string;
  heroImageUrl: string;
  commonUses: string[];
  benefits: string[];
  whatToExpect: string;
  sessionsInfo: string;
  downtime: string;
  considerations: string[];
  faqs: FAQItemData[];
  sortOrder: number;
  isActive: boolean;
  relatedProcedureSlugs?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcedureWithClinicsCount extends Procedure {
  clinicsCount?: number;
  startingPrice?: number;
}
