import { supabase } from './supabase';
import { MOCK_PROCEDURES, MOCK_CLINICS, MOCK_DOCTORS } from '../data/mockData';
import { Appointment, AppointmentStatus } from '../types/appointment.types';
import { Procedure, ProcedureCategory } from '../types/procedure.types';
import { Clinic, ClinicProcedure } from '../types/clinic.types';
import { Doctor } from '../types/doctor.types';
import { procedureKnowledgeBaseService } from './procedureKnowledgeBase.service';

export interface DoctorStats {
  todayAppointmentsCount: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  totalPatientsCount: number;
}

export interface PatientSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalVisits: number;
  lastVisitDate?: string;
  lastProcedureName?: string;
  notes?: string;
}

export interface NewProcedurePayload {
  name: string;
  category: ProcedureCategory;
  categoryLabel?: string;
  shortDescription: string;
  description: string;
  downtime: string;
  benefits: string[];
  priceFrom: number;
  priceTo?: number;
  priceUnit: string;
}

export interface NewDoctorPayload {
  name: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  bio?: string;
  photoUrl?: string;
}

class DoctorService {
  private knowledgeBaseProcedures: Procedure[] = procedureKnowledgeBaseService.getSynchronousList();
  private clinicProcedures: ClinicProcedure[] = [];
  private clinicDoctors: Doctor[] = [];

  // 1. Get Clinic Doctors
  async getClinicDoctors(clinicId: string): Promise<Doctor[]> {
    return this.clinicDoctors;
  }

  setClinicDoctors(doctors: Doctor[]): void {
    this.clinicDoctors = doctors;
  }

  setClinicProcedures(procedures: ClinicProcedure[]): void {
    this.clinicProcedures = procedures;
  }

  // 2. Add Doctor to Clinic (No forced Dr. prefix)
  async addDoctorToClinic(clinicId: string, payload: NewDoctorPayload): Promise<Doctor> {
    const slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const formattedName = payload.name.trim();

    const newDoctor: Doctor = {
      id: 'doc_' + Date.now(),
      name: formattedName,
      slug: slug,
      photoUrl:
        payload.photoUrl ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
      qualification: payload.qualification,
      specialization: payload.specialization,
      experienceYears: payload.experienceYears || 5,
      bio:
        payload.bio ||
        `${formattedName} is an experienced specialist specializing in ${payload.specialization}.`,
      rating: 5.0,
      reviewCount: 0,
      clinicId: clinicId,
      clinicName: MOCK_CLINICS.find((c) => c.id === clinicId)?.name || '',
      isActive: true,
      proceduresOffered: [],
    };

    this.clinicDoctors.push(newDoctor);

    // Also push to MOCK_DOCTORS for customer app discovery
    MOCK_DOCTORS.push(newDoctor);
    if (MOCK_CLINICS[0]) {
      if (!MOCK_CLINICS[0].doctors) MOCK_CLINICS[0].doctors = [];
      MOCK_CLINICS[0].doctors.push(newDoctor);
    }

    try {
      await supabase.from('doctors').insert([newDoctor]);
    } catch (e) {
      // local sync
    }

    return newDoctor;
  }

  // 3. Remove Doctor from Clinic
  async removeDoctor(doctorId: string): Promise<boolean> {
    this.clinicDoctors = this.clinicDoctors.filter((d) => d.id !== doctorId);
    const mockIdx = MOCK_DOCTORS.findIndex((d) => d.id === doctorId);
    if (mockIdx >= 0) {
      MOCK_DOCTORS.splice(mockIdx, 1);
    }
    if (MOCK_CLINICS[0]?.doctors) {
      MOCK_CLINICS[0].doctors = MOCK_CLINICS[0].doctors.filter((d) => d.id !== doctorId);
    }
    try {
      await supabase.from('doctors').delete().eq('id', doctorId);
    } catch (e) {
      // local sync
    }
    return true;
  }

  // 4. Toggle Doctor Active Status
  async toggleDoctorActive(doctorId: string, isActive: boolean): Promise<Doctor | null> {
    const doc = this.clinicDoctors.find((d) => d.id === doctorId);
    if (doc) {
      doc.isActive = isActive;
    }
    const mockDoc = MOCK_DOCTORS.find((d) => d.id === doctorId);
    if (mockDoc) {
      mockDoc.isActive = isActive;
    }
    return doc || null;
  }

  // 4b. Update Doctor Details
  async updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<Doctor | null> {
    const doc = this.clinicDoctors.find((d) => d.id === doctorId);
    if (doc) {
      Object.assign(doc, updates);
    }
    const mockDoc = MOCK_DOCTORS.find((d) => d.id === doctorId);
    if (mockDoc) {
      Object.assign(mockDoc, updates);
    }
    if (MOCK_CLINICS[0]?.doctors) {
      const cDoc = MOCK_CLINICS[0].doctors.find((d) => d.id === doctorId);
      if (cDoc) {
        Object.assign(cDoc, updates);
      }
    }
    try {
      await supabase.from('doctors').update(updates).eq('id', doctorId);
    } catch (e) {
      // local sync
    }
    return doc || mockDoc || null;
  }

  // 5. Update Clinic Profile Details
  async updateClinicProfile(clinicId: string, updates: Partial<Clinic>): Promise<Clinic | null> {
    const clinic = MOCK_CLINICS.find((c) => c.id === clinicId) || MOCK_CLINICS[0];
    if (clinic) {
      Object.assign(clinic, updates);
      try {
        await supabase.from('clinics').update(updates).eq('id', clinicId);
      } catch (e) {
        // local sync
      }
      return clinic;
    }
    return null;
  }

  // 1. Get Master Procedure Knowledge Base Catalog
  async getKnowledgeBaseProcedures(clinicId?: string): Promise<Procedure[]> {
    return procedureKnowledgeBaseService.getAllProcedures(undefined, false, clinicId);
  }

  // 2. Add New Procedure to Knowledge Base & Clinic Offering
  async addProcedureToKnowledgeBase(
    clinicId: string,
    payload: NewProcedurePayload
  ): Promise<{ procedure: Procedure; clinicProcedure: ClinicProcedure }> {
    const slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newProcedure: Procedure = {
      id: 'proc_custom_' + Date.now(),
      name: payload.name,
      slug: slug,
      category: payload.category,
      categoryLabel: payload.categoryLabel || payload.category.toUpperCase(),
      shortDescription: payload.shortDescription,
      description: payload.description || payload.shortDescription,
      heroImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop',
      commonUses: ['Clinical skin enhancement', 'Targeted aesthetic improvement'],
      benefits: payload.benefits.length > 0 ? payload.benefits : ['Dermatologist supervised', 'Results-driven protocol'],
      whatToExpect: 'In-clinic consultation followed by personalized procedure protocol.',
      sessionsInfo: 'Customized sessions tailored by dermatologist during consultation.',
      downtime: payload.downtime || 'Zero downtime',
      considerations: ['Follow post-procedure sunscreen and hydration guidelines'],
      faqs: [{ question: `Is ${payload.name} safe?`, answer: 'Yes, performed by board-certified dermatologists using certified clinical equipment.' }],
      sortOrder: 1,
      isActive: true,
      relatedProcedureSlugs: [],
      addedByName: MOCK_CLINICS.find((c) => c.id === clinicId)?.name || "Dr. Purva's Skin & Laser Clinic",
      addedByClinicId: clinicId,
      isGloballyEnabled: false, // Only visible in this clinic until backend mapping/enabling
    };

    const newClinicProcedure: ClinicProcedure = {
      id: 'cp_custom_' + Date.now(),
      clinicId: clinicId,
      procedureId: newProcedure.id,
      priceFrom: payload.priceFrom,
      priceTo: payload.priceTo,
      priceUnit: payload.priceUnit || 'per session',
      description: payload.shortDescription,
      isAvailable: true,
      procedures: newProcedure,
    };

    // Add to in-memory Knowledge Base and Clinic Offering
    procedureKnowledgeBaseService.addCustomProcedure(newProcedure);
    this.knowledgeBaseProcedures = procedureKnowledgeBaseService.getSynchronousList();
    this.clinicProcedures.unshift(newClinicProcedure);

    // Also update MOCK_CLINICS so customer app instantly sees it
    if (MOCK_CLINICS[0] && MOCK_CLINICS[0].procedures) {
      MOCK_CLINICS[0].procedures.unshift(newClinicProcedure);
    }
    MOCK_PROCEDURES.unshift(newProcedure);

    // Attempt Supabase insert if connected
    try {
      await supabase.from('procedures').insert([newProcedure]);
      await supabase.from('clinic_procedures').insert([
        {
          clinic_id: clinicId,
          procedure_id: newProcedure.id,
          price_from: payload.priceFrom,
          price_to: payload.priceTo,
          price_unit: payload.priceUnit,
          is_available: true,
        },
      ]);
    } catch (e) {
      console.log('Supabase sync notice: Stored in Knowledge Base reactive store');
    }

    return { procedure: newProcedure, clinicProcedure: newClinicProcedure };
  }

  // 3. Update Procedure Pricing & Availability for Clinic
  async updateClinicProcedure(
    procedureId: string,
    updates: { priceFrom?: number; priceTo?: number; priceUnit?: string; isAvailable?: boolean }
  ): Promise<ClinicProcedure | null> {
    const item = this.clinicProcedures.find((p) => p.procedureId === procedureId || p.id === procedureId);
    if (item) {
      if (updates.priceFrom !== undefined) item.priceFrom = updates.priceFrom;
      if (updates.priceTo !== undefined) item.priceTo = updates.priceTo;
      if (updates.priceUnit !== undefined) item.priceUnit = updates.priceUnit;
      if (updates.isAvailable !== undefined) item.isAvailable = updates.isAvailable;
    }

    // Sync to MOCK_CLINICS for customer view
    if (MOCK_CLINICS[0] && MOCK_CLINICS[0].procedures) {
      const target = MOCK_CLINICS[0].procedures.find(
        (p) => p.procedureId === procedureId || p.id === procedureId
      );
      if (target) {
        if (updates.priceFrom !== undefined) target.priceFrom = updates.priceFrom;
        if (updates.priceTo !== undefined) target.priceTo = updates.priceTo;
        if (updates.priceUnit !== undefined) target.priceUnit = updates.priceUnit;
        if (updates.isAvailable !== undefined) target.isAvailable = updates.isAvailable;
      }
    }

    try {
      await supabase
        .from('clinic_procedures')
        .update({
          price_from: updates.priceFrom,
          price_to: updates.priceTo,
          price_unit: updates.priceUnit,
          is_available: updates.isAvailable,
        })
        .eq('procedure_id', procedureId);
    } catch (e) {
      // local store updated
    }

    return item || null;
  }

  // 4. Toggle whether a Knowledge Base procedure is offered by the clinic
  async toggleProcedureOffering(
    clinicId: string,
    procedure: Procedure,
    isOffered: boolean
  ): Promise<void> {
    if (isOffered) {
      const exists = this.clinicProcedures.find((cp) => cp.procedureId === procedure.id);
      if (!exists) {
        const newCP: ClinicProcedure = {
          id: 'cp_' + procedure.id,
          clinicId: clinicId,
          procedureId: procedure.id,
          priceFrom: 2500,
          priceUnit: 'per session',
          description: procedure.shortDescription,
          isAvailable: true,
          procedures: procedure,
        };
        this.clinicProcedures.push(newCP);
        if (MOCK_CLINICS[0]?.procedures) MOCK_CLINICS[0].procedures.push(newCP);
      }
    } else {
      this.clinicProcedures = this.clinicProcedures.filter((cp) => cp.procedureId !== procedure.id);
      if (MOCK_CLINICS[0]?.procedures) {
        MOCK_CLINICS[0].procedures = MOCK_CLINICS[0].procedures.filter(
          (cp) => cp.procedureId !== procedure.id
        );
      }
    }
  }

  // 5. Get Clinic's Offered Procedures with Pricing
  async getClinicProcedures(clinicId: string): Promise<ClinicProcedure[]> {
    return this.clinicProcedures;
  }

  // 6. Get Patient Directory from Appointments
  getPatientDirectory(appointments: Appointment[]): PatientSummary[] {
    const patientMap = new Map<string, PatientSummary>();

    appointments.forEach((apt) => {
      const key = apt.patientPhone || apt.patientEmail || apt.patientName;
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          id: 'pat_' + Math.abs(key.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
          name: apt.patientName || 'Patient',
          phone: apt.patientPhone || '+91 98765 43210',
          email: apt.patientEmail,
          totalVisits: 1,
          lastVisitDate: apt.appointmentDate,
          lastProcedureName: apt.procedure?.name,
          notes: apt.notes,
        });
      } else {
        const existing = patientMap.get(key)!;
        existing.totalVisits += 1;
        if (apt.appointmentDate > (existing.lastVisitDate || '')) {
          existing.lastVisitDate = apt.appointmentDate;
          existing.lastProcedureName = apt.procedure?.name || existing.lastProcedureName;
        }
      }
    });

    return Array.from(patientMap.values());
  }

  // 7. Calculate Live Dashboard Metrics
  calculateStats(appointments: Appointment[]): DoctorStats {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayApts = appointments.filter((a) => a.appointmentDate === todayStr);

    return {
      todayAppointmentsCount: todayApts.length,
      pendingCount: appointments.filter((a) => a.status === 'pending').length,
      confirmedCount: appointments.filter((a) => a.status === 'confirmed').length,
      completedCount: appointments.filter((a) => a.status === 'completed').length,
      totalPatientsCount: this.getPatientDirectory(appointments).length,
    };
  }

  // 8. Full Cloud Sync to Supabase for Clinic, Doctors, and Publish State
  async syncClinicToSupabase(payload: {
    clinic: Clinic;
    doctors: Doctor[];
    procedures?: ClinicProcedure[];
    isPublished: boolean;
  }): Promise<boolean> {
    try {
      const { clinic, doctors, isPublished } = payload;
      const slug =
        clinic.slug ||
        clinic.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
        'aura-clinic';

      // 1. Upsert Clinic Record
      const clinicRecord: any = {
        name: clinic.name || 'Aura Skin Clinic',
        slug: slug,
        description: clinic.description || '',
        logo_url: clinic.logoUrl || '',
        cover_image_url: clinic.coverImageUrl || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        address: clinic.address || '',
        area: clinic.area || 'Chandigarh',
        city: clinic.city || 'Chandigarh',
        state: clinic.state || 'Chandigarh',
        latitude: clinic.latitude || 30.7333,
        longitude: clinic.longitude || 76.7794,
        opening_hours: clinic.openingHours || {},
        verification_status: clinic.verificationStatus || 'verified',
        rating: clinic.rating || 5.0,
        review_count: clinic.reviewCount || 0,
        specialties: clinic.specialties || [],
        gallery_images: clinic.galleryImages || [],
        is_active: isPublished,
        updated_at: new Date().toISOString(),
      };

      const { data: dbClinic, error: clinicError } = await supabase
        .from('clinics')
        .upsert(clinicRecord, { onConflict: 'slug' })
        .select()
        .single();

      if (clinicError) {
        console.warn('Supabase clinic sync notice:', clinicError.message);
      }

      // 2. Upsert Doctors
      if (doctors && doctors.length > 0) {
        for (const doc of doctors) {
          const docSlug =
            doc.slug ||
            doc.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
            `doc-${Date.now()}`;

          const docRecord: any = {
            name: doc.name,
            slug: docSlug,
            photo_url: doc.photoUrl || '',
            qualification: doc.qualification || '',
            specialization: doc.specialization || 'Dermatologist',
            experience_years: doc.experienceYears || 5,
            bio: doc.bio || '',
            rating: doc.rating || 5.0,
            review_count: doc.reviewCount || 0,
            is_active: doc.isActive !== false,
            updated_at: new Date().toISOString(),
          };

          const { data: dbDoc } = await supabase
            .from('doctors')
            .upsert(docRecord, { onConflict: 'slug' })
            .select()
            .single();

          if (dbClinic?.id && dbDoc?.id) {
            await supabase
              .from('clinic_doctors')
              .upsert(
                { clinic_id: dbClinic.id, doctor_id: dbDoc.id, is_primary: true },
                { onConflict: 'clinic_id,doctor_id' }
              );
          }
        }
      }

      return true;
    } catch (e: any) {
      console.warn('Cloud clinic sync error (saved locally):', e?.message || e);
      return false;
    }
  }

  // 9. Fetch Clinic from Supabase by Email or Slug
  async fetchClinicFromSupabase(emailOrSlug: string): Promise<Clinic | null> {
    try {
      const normalized = emailOrSlug.toLowerCase().trim();
      const { data, error } = await supabase
        .from('clinics')
        .select(`
          *,
          clinic_doctors (
            doctors (*)
          )
        `)
        .or(`email.ilike.%${normalized}%,slug.eq.${normalized}`)
        .maybeSingle();

      if (error || !data) return null;

      const doctors: Doctor[] = (data.clinic_doctors || []).map((cd: any) => ({
        id: cd.doctors?.id || `doc_${Date.now()}`,
        name: cd.doctors?.name || 'Doctor',
        slug: cd.doctors?.slug || 'doctor',
        photoUrl: cd.doctors?.photo_url || '',
        qualification: cd.doctors?.qualification || '',
        specialization: cd.doctors?.specialization || 'Dermatology',
        experienceYears: cd.doctors?.experience_years || 5,
        bio: cd.doctors?.bio || '',
        rating: cd.doctors?.rating || 5.0,
        reviewCount: cd.doctors?.review_count || 0,
        clinicId: data.id,
        clinicName: data.name,
        clinicAddress: data.address,
        isActive: cd.doctors?.is_active !== false,
      }));

      const clinic: Clinic = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        logoUrl: data.logo_url || '',
        coverImageUrl: data.cover_image_url || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        area: data.area || 'Chandigarh',
        city: data.city || 'Chandigarh',
        state: data.state || 'Chandigarh',
        latitude: Number(data.latitude) || 30.7333,
        longitude: Number(data.longitude) || 76.7794,
        openingHours: data.opening_hours || {},
        verificationStatus: data.verification_status || 'verified',
        rating: Number(data.rating) || 5.0,
        reviewCount: Number(data.review_count) || 0,
        specialties: data.specialties || [],
        galleryImages: data.gallery_images || [],
        isActive: data.is_active !== false,
        doctors: doctors,
      };

      return clinic;
    } catch (e) {
      return null;
    }
  }
}

export const doctorService = new DoctorService();
