import { procedureKnowledgeBaseService } from './procedureKnowledgeBase.service';
import { Procedure } from '../types/procedure.types';
import { CONCERN_MAPPINGS } from '../data/mockData';

export interface RecommendationParams {
  concernId: string;
  selectedOptionIds?: string[];
  concernLabel?: string;
}

export interface RecommendationResult {
  primary: Procedure[];
  complementary: Procedure[];
  allMatching: Procedure[];
}

export const recommendationService = {
  /**
   * Intelligently score and recommend treatments from the entire 67-procedure knowledge base
   */
  getRecommendations: async (params: RecommendationParams): Promise<RecommendationResult> => {
    const all = await procedureKnowledgeBaseService.getAllProcedures();
    const { concernId, selectedOptionIds = [] } = params;

    const scored = all.map((proc) => {
      let score = 0;
      const slug = proc.slug;
      const id = proc.id;
      const category = (proc.category || '').toLowerCase();
      const text = `${proc.name || ''} ${proc.shortDescription || ''} ${proc.description || ''} ${proc.categoryLabel || ''} ${proc.commonUses?.join(' ') || ''} ${proc.benefits?.join(' ') || ''}`.toLowerCase();

      // 1. Direct explicit option mapping match (Highest priority)
      for (const optId of selectedOptionIds) {
        const mappedSlugs = CONCERN_MAPPINGS[optId] || [];
        if (mappedSlugs.includes(slug) || mappedSlugs.includes(id)) {
          score += 20;
        }
      }

      // 2. Concern Category Alignment
      if (concernId === 'hair') {
        if (category === 'hair') score += 12;
        if (text.includes('hair') || text.includes('scalp') || text.includes('prp') || text.includes('follicle')) score += 8;
      } else if (concernId === 'acne') {
        if (text.includes('acne') || text.includes('comedone') || text.includes('pimple') || text.includes('breakout')) score += 12;
        if (text.includes('scar') || text.includes('subcision') || text.includes('tca cross') || text.includes('rf microneedling')) score += 10;
        if (text.includes('salicylic') || text.includes('extraction')) score += 8;
      } else if (concernId === 'pigmentation') {
        if (text.includes('pigment') || text.includes('melasma') || text.includes('dark spot') || text.includes('sun spot') || text.includes('tan')) score += 12;
        if (text.includes('laser toning') || text.includes('q-switched') || text.includes('peel')) score += 8;
      } else if (concernId === 'anti_ageing') {
        if (category === 'aesthetics') score += 8;
        if (text.includes('botox') || text.includes('toxin') || text.includes('wrinkle') || text.includes('fine line')) score += 12;
        if (text.includes('tightening') || text.includes('hifu') || text.includes('rf') || text.includes('lifting') || text.includes('thread')) score += 10;
        if (text.includes('booster') || text.includes('collagen')) score += 8;
      } else if (concernId === 'face_contour') {
        if (category === 'aesthetics') score += 8;
        if (text.includes('filler') || text.includes('volume') || text.includes('lip') || text.includes('jaw') || text.includes('cheek') || text.includes('chin')) score += 12;
        if (text.includes('contour') || text.includes('thread lift') || text.includes('hifu')) score += 10;
      } else if (concernId === 'skin') {
        if (category === 'skin') score += 8;
        if (text.includes('hydrafacial') || text.includes('glow') || text.includes('radiance') || text.includes('hydration') || text.includes('brightening')) score += 12;
        if (text.includes('texture') || text.includes('pore') || text.includes('microneedling') || text.includes('exfoliat')) score += 8;
      }

      // 3. Option specific granular keyword boosts
      for (const optId of selectedOptionIds) {
        if (optId === 'active_shedding' || optId === 'thinning_crown' || optId === 'receding_hairline') {
          if (text.includes('prp') || text.includes('hair fall') || text.includes('growth') || text.includes('thinning')) score += 6;
        }
        if (optId === 'glow' && (text.includes('glow') || text.includes('radiance') || text.includes('facial') || text.includes('brightening'))) score += 6;
        if (optId === 'texture' && (text.includes('texture') || text.includes('pore') || text.includes('microneedling') || text.includes('resurfacing'))) score += 6;
        if (optId === 'tan' && (text.includes('peel') || text.includes('toning') || text.includes('tan') || text.includes('brightening'))) score += 6;
        if (optId === 'active_acne' && (text.includes('acne') || text.includes('salicylic') || text.includes('comedone') || text.includes('breakout'))) score += 8;
        if (optId === 'pitted_scars' && (text.includes('scar') || text.includes('subcision') || text.includes('tca cross') || text.includes('rf microneedling'))) score += 8;
        if (optId === 'dynamic_lines' && (text.includes('botox') || text.includes('toxin') || text.includes('wrinkle') || text.includes('crow'))) score += 8;
        if (optId === 'sagging' && (text.includes('tightening') || text.includes('hifu') || text.includes('rf') || text.includes('thread') || text.includes('jowl'))) score += 8;
        if (optId === 'lips' && (text.includes('lip') || text.includes('filler') || text.includes('volume'))) score += 8;
        if (optId === 'cheeks_jaw' && (text.includes('jaw') || text.includes('cheek') || text.includes('contour') || text.includes('filler'))) score += 8;
        if (optId === 'melasma' && (text.includes('melasma') || text.includes('pigmentation') || text.includes('toning') || text.includes('peel'))) score += 8;
      }

      // 4. Downtime preference alignment
      if (selectedOptionIds.includes('zero_downtime')) {
        const dt = (proc.downtime || '').toLowerCase();
        if (dt.includes('zero') || dt.includes('no downtime') || dt.includes('immediate')) {
          score += 5;
        }
      }

      return { proc, score };
    });

    // Filter procedures meeting minimum clinical relevance threshold
    const filtered = scored.filter((item) => item.score >= 10).sort((a, b) => b.score - a.score);
    const rankedProcs = filtered.map((item) => item.proc);

    // If no specific scored items, provide top procedures from the matching category
    let finalProcs = rankedProcs;
    if (finalProcs.length === 0) {
      finalProcs = all.filter((p) => p.category === concernId || (concernId === 'anti_ageing' && p.category === 'aesthetics'));
      if (finalProcs.length === 0) finalProcs = all.slice(0, 6);
    }

    const primary = finalProcs.slice(0, 4);
    const complementary = finalProcs.slice(4, 8);

    return {
      primary,
      complementary,
      allMatching: finalProcs,
    };
  },
};
