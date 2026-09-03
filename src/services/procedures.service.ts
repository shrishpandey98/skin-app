import { MOCK_PROCEDURES, MOCK_CLINICS } from '../data/mockData';
import { Procedure } from '../types/procedure.types';
import { ClinicOfferingProcedure } from '../types/clinic.types';

export const proceduresService = {
  getAllProcedures: async (category?: string): Promise<Procedure[]> => {
    // Simulated network delay
    await new Promise((r) => setTimeout(r, 100));
    if (!category || category === 'all') {
      return MOCK_PROCEDURES;
    }
    return MOCK_PROCEDURES.filter((p) => p.category === category);
  },

  getProcedureBySlug: async (slug: string): Promise<Procedure | null> => {
    await new Promise((r) => setTimeout(r, 80));
    return MOCK_PROCEDURES.find((p) => p.slug === slug || p.id === slug) || null;
  },

  getClinicsOfferingProcedure: async (procedureSlug: string): Promise<ClinicOfferingProcedure[]> => {
    await new Promise((r) => setTimeout(r, 100));
    const procedure = MOCK_PROCEDURES.find((p) => p.slug === procedureSlug || p.id === procedureSlug);
    if (!procedure) return [];

    const results: ClinicOfferingProcedure[] = [];

    for (const clinic of MOCK_CLINICS) {
      const matchPricing = clinic.procedures?.find(
        (cp) => cp.procedureId === procedure.id || cp.procedure?.slug === procedure.slug
      );
      if (matchPricing && matchPricing.isAvailable) {
        results.push({
          clinic,
          pricing: matchPricing,
        });
      }
    }

    return results;
  },

  getRelatedProcedures: async (relatedSlugs: string[]): Promise<Procedure[]> => {
    return MOCK_PROCEDURES.filter((p) => relatedSlugs.includes(p.slug));
  },
};
