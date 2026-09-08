import { CONCERN_CATEGORIES } from '../data/mockData';
import { Procedure } from '../types/procedure.types';
import { Clinic } from '../types/clinic.types';
import { Doctor } from '../types/doctor.types';
import { procedureKnowledgeBaseService } from './procedureKnowledgeBase.service';
import { clinicsService } from './clinics.service';

export interface SearchResultsData {
  procedures: Procedure[];
  clinics: Clinic[];
  doctors: Doctor[];
  concerns: Array<{ id: string; label: string; subtitle: string }>;
  totalCount: number;
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResultsData> => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        procedures: [],
        clinics: [],
        doctors: [],
        concerns: [],
        totalCount: 0,
      };
    }

    const [allProcedures, allClinics] = await Promise.all([
      procedureKnowledgeBaseService.getAllProcedures(),
      clinicsService.getAllClinics(),
    ]);

    // 1. Procedures match
    const procedures = allProcedures.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
        (p.machineOrTechnology && p.machineOrTechnology.toLowerCase().includes(q)) ||
        p.commonUses?.some((use) => use.toLowerCase().includes(q))
    );

    // 2. Clinics match
    const clinics = allClinics.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.area?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.specialties?.some((s) => s.toLowerCase().includes(q))
    );

    // 3. Doctors match from live clinics
    const allDoctors: Doctor[] = [];
    const seenDoctorIds = new Set<string>();
    allClinics.forEach((c) => {
      (c.doctors || []).forEach((d) => {
        if (!seenDoctorIds.has(d.id)) {
          seenDoctorIds.add(d.id);
          allDoctors.push(d);
        }
      });
    });

    const doctors = allDoctors.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.qualification?.toLowerCase().includes(q)
    );

    // 4. Concerns match
    const concerns = CONCERN_CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );

    const totalCount = procedures.length + clinics.length + doctors.length + concerns.length;

    return {
      procedures,
      clinics,
      doctors,
      concerns,
      totalCount,
    };
  },
};
