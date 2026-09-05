import { MOCK_CLINICS } from '../data/mockData';
import { Procedure } from '../types/procedure.types';
import { ClinicOfferingProcedure } from '../types/clinic.types';
import { procedureKnowledgeBaseService } from './procedureKnowledgeBase.service';

export const proceduresService = {
  getAllProcedures: async (category?: string, forceRefresh: boolean = false): Promise<Procedure[]> => {
    return procedureKnowledgeBaseService.getAllProcedures(category, forceRefresh);
  },

  getProcedureBySlug: async (slug: string): Promise<Procedure | null> => {
    return procedureKnowledgeBaseService.getProcedureBySlug(slug);
  },

  getClinicsOfferingProcedure: async (procedureSlug: string): Promise<ClinicOfferingProcedure[]> => {
    const procedure = await procedureKnowledgeBaseService.getProcedureBySlug(procedureSlug);
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
    const all = await procedureKnowledgeBaseService.getAllProcedures();
    return all.filter((p) => relatedSlugs.includes(p.slug) || relatedSlugs.includes(p.id));
  },

  getCategories: async () => {
    return procedureKnowledgeBaseService.getCategories();
  },

  refreshLiveProcedures: async (): Promise<Procedure[]> => {
    return procedureKnowledgeBaseService.fetchLiveSheet(true);
  },
};
