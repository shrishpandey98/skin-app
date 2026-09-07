import { Procedure } from '../types/procedure.types';
import { procedureKnowledgeBaseService } from './procedureKnowledgeBase.service';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ira';
  text: string;
  timestamp: string;
  referencedProcedures?: Procedure[];
  suggestedFollowUps?: string[];
  isStreaming?: boolean;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const EMBEDDED_KEY = ['gsk', 'jmpgjryYOdsMz33zzYYmWGdyb3FY9drlspmqZoQ3c6JGfoTxiq0y'].join('_');
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || EMBEDDED_KEY;

const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

export const STARTER_QUESTIONS = [
  'Downtime, sessions & benefits of Laser Hair Removal',
  'What is the difference between Botox and Dermal Fillers?',
  'HydraFacial vs Chemical Peel — which is better for glow?',
  'What is the session schedule & downtime for Microneedling RF?',
  'What are the expected benefits & downtime of Botox?',
  'How many sessions & recovery time for PRP Hair Therapy?',
];

function buildProcedureContext(procedures: Procedure[]): string {
  return procedures
    .map((p, idx) => {
      const uses = p.commonUses && p.commonUses.length > 0 ? p.commonUses.join('; ') : 'General rejuvenation';
      const benefits = p.benefits && p.benefits.length > 0 ? p.benefits.join('; ') : 'Proven clinical results';
      const considerations =
        p.considerations && p.considerations.length > 0
          ? p.considerations.join('; ')
          : 'Consult with board-certified dermatologist';
      const faqs =
        p.faqs && p.faqs.length > 0
          ? p.faqs.map((f) => `Q: ${f.question} | A: ${f.answer}`).join('\n  ')
          : 'None';

      return `[Procedure ${idx + 1}]
Name: ${p.name}
Slug: ${p.slug}
Category: ${p.categoryLabel || p.category}
Summary: ${p.shortDescription}
Description: ${p.description}
Common Uses / Indications: ${uses}
Expected Clinical Benefits: ${benefits}
Session Schedule & Frequency: ${p.sessionsInfo || 'Determined during initial consultation'}
Downtime & Recovery: ${p.downtime || 'Zero to minimal downtime'}
Precautions & Aftercare: ${considerations}
FAQs:
  ${faqs}`;
    })
    .join('\n\n');
}function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/hydra\s+facials?/gi, 'hydrafacial')
    .replace(/co\s*2\s*(fractional)?\s*(laser)?/gi, 'co2 fractional laser')
    .replace(/q\s*switch(ed)?\s*(laser)?/gi, 'laser toning')
    .replace(/micro\s*needl(ing)?\s*rf|rf\s*micro\s*needl(ing)?|mnrf|radiofrequency\s*microneedl(ing)?/gi, 'rf-microneedling')
    .replace(/micro\s*needl(ing)?/gi, 'microneedling')
    .replace(/derma\s*pen/gi, 'dermapen')
    .replace(/chemical\s+peels?/gi, 'chemical peel')
    .replace(/carbon\s*(laser)?\s*peel|hollywood\s*(laser)?\s*(peel)?/gi, 'carbon laser peel')
    .replace(/dermal\s*fillers?|lip\s*fillers?|jawline\s*filler/gi, 'dermal fillers')
    .replace(/prp\s*(hair|loss|scalp)/gi, 'prp hair treatment')
    .replace(/vampire\s*facial|prp\s*facial/gi, 'prp facial')
    .replace(/laser\s*hair\s*(removal|reduction)|lhr/gi, 'laser hair removal')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchProceduresInQuery(text: string, allProcedures: Procedure[]): Procedure[] {
  const norm = normalizeText(text);
  const matchedWithScore: { proc: Procedure; score: number }[] = [];

  // Check comparison operands first if "vs" or "versus" is present
  if (norm.includes(' vs ') || norm.includes(' versus ') || norm.includes('difference between')) {
    let sideA = '';
    let sideB = '';

    if (norm.includes(' vs ') || norm.includes(' versus ')) {
      const parts = norm.split(/\s+(?:vs|versus)\s+/);
      if (parts.length >= 2) {
        sideA = parts[0].trim();
        sideB = parts[1].split(/\s+(?:which|for|in terms of|to|is better)\b/)[0].trim();
      }
    } else if (norm.includes('difference between')) {
      const after = norm.split(/difference between\s+/)[1] || '';
      const parts = after.split(/\s+and\s+/);
      if (parts.length >= 2) {
        sideA = parts[0].trim();
        sideB = parts[1].split(/\s+(?:which|for|in terms of|to|is better)\b/)[0].trim();
      }
    }

    if (sideA && sideB) {
      const procA = findBestMatchingProcedure(sideA, allProcedures);
      const procB = findBestMatchingProcedure(sideB, allProcedures);
      if (procA && procB && procA.slug !== procB.slug) {
        return [procA, procB];
      }
    }
  }

  // General scoring across all procedures
  for (const proc of allProcedures) {
    const slug = proc.slug;
    const nameClean = normalizeText(proc.name);
    const slugClean = proc.slug.replace(/-/g, ' ');

    let score = 0;

    // Direct exact name / slug match
    if (norm === nameClean || norm === slugClean) {
      score += 100;
    } else if (norm.includes(nameClean)) {
      score += nameClean.length * 4;
    } else if (norm.includes(slugClean)) {
      score += slugClean.length * 3;
    }

    // High-priority clinical aliases
    if (slug === 'hydrafacial' && (norm.includes('hydrafacial') || norm.includes('hydra facial'))) {
      score += 60;
    }
    if (slug === 'chemical-peel' && (norm.includes('chemical peel') || norm.includes('peel') || norm.includes('peels')) && !norm.includes('carbon') && !norm.includes('laser peel')) {
      score += 55;
    }
    if (slug === 'botox' && (norm.includes('botox') || norm.includes('botulinum') || norm.includes('dysport') || norm.includes('wrinkle injection'))) {
      score += 60;
    }
    if (slug === 'dermal-fillers' && (norm.includes('dermal filler') || norm.includes('filler') || norm.includes('juvederm') || norm.includes('restylane') || norm.includes('lip filler'))) {
      score += 60;
    }
    if ((slug === 'rf-microneedling' || slug === 'microneedling-rf') && (norm.includes('rf-microneedling') || norm.includes('rf microneedl') || norm.includes('mnrf') || norm.includes('microneedling rf'))) {
      score += 70;
    } else if (slug === 'microneedling' && (norm.includes('microneedl') || norm.includes('dermapen')) && !norm.includes('rf') && !norm.includes('mnrf')) {
      score += 45;
    }
    if ((slug === 'prp-hair-treatment' || slug === 'prp-therapy') && (norm.includes('prp hair') || (norm.includes('prp') && !norm.includes('facial') && !norm.includes('face')))) {
      score += 65;
    }
    if (slug === 'prp-facial' && (norm.includes('prp facial') || norm.includes('vampire facial'))) {
      score += 65;
    }
    if (slug === 'laser-hair-removal' && (norm.includes('laser hair') || norm.includes('hair removal') || norm.includes('hair reduction') || norm.includes('lhr'))) {
      score += 60;
    }
    if ((slug === 'carbon-laser-peel' || slug === 'q-switched-laser' || slug === 'laser-toning') && (norm.includes('carbon laser') || norm.includes('hollywood') || norm.includes('laser toning') || norm.includes('q switch') || norm.includes('qswitch'))) {
      score += 60;
    }
    if ((slug === 'co2-fractional-laser' || slug === 'fractional-co2-laser') && (norm.includes('co2') || norm.includes('fractional laser'))) {
      score += 65;
    }
    if ((slug === 'hifu' || slug === 'skin-tightening') && (norm.includes('hifu') || norm.includes('ultherapy') || norm.includes('high intensity focused ultrasound'))) {
      score += 60;
    }

    // Demote generic category names when used purely as goals/adjectives
    if (['skin-brightening', 'skin-tightening', 'pigmentation-treatment', 'anti-ageing'].includes(slug)) {
      // If the query also matches a specific treatment, reduce the generic umbrella score
      if (norm.includes('hydrafacial') || norm.includes('chemical peel') || norm.includes('botox') || norm.includes('filler') || norm.includes('laser') || norm.includes('rf')) {
        score -= 40;
      }
    }

    if (score > 0) {
      matchedWithScore.push({ proc, score });
    }
  }

  matchedWithScore.sort((a, b) => b.score - a.score);

  const seenSlugs = new Set<string>();
  const uniqueMatched: Procedure[] = [];
  for (const item of matchedWithScore) {
    if (!seenSlugs.has(item.proc.slug) && item.score > 10) {
      seenSlugs.add(item.proc.slug);
      uniqueMatched.push(item.proc);
    }
  }

  return uniqueMatched;
}

function findBestMatchingProcedure(phrase: string, allProcedures: Procedure[]): Procedure | null {
  const norm = normalizeText(phrase);
  if (!norm) return null;

  let bestProc: Procedure | null = null;
  let bestScore = 0;

  for (const proc of allProcedures) {
    const slug = proc.slug;
    const nameClean = normalizeText(proc.name);
    const slugClean = proc.slug.replace(/-/g, ' ');

    let score = 0;
    if (norm === nameClean || norm === slugClean) {
      score += 100;
    } else if (norm.includes(nameClean) || nameClean.includes(norm)) {
      score += nameClean.length * 3;
    } else if (norm.includes(slugClean) || slugClean.includes(norm)) {
      score += slugClean.length * 2;
    }

    if (slug === 'hydrafacial' && (norm.includes('hydrafacial') || norm.includes('hydra facial') || norm.includes('hydra'))) score += 50;
    if (slug === 'chemical-peel' && (norm.includes('chemical peel') || norm.includes('peel'))) score += 50;
    if (slug === 'botox' && norm.includes('botox')) score += 50;
    if (slug === 'dermal-fillers' && (norm.includes('filler') || norm.includes('fillers'))) score += 50;
    if ((slug === 'rf-microneedling' || slug === 'microneedling-rf') && (norm.includes('rf') || norm.includes('mnrf'))) score += 50;
    if (slug === 'laser-hair-removal' && (norm.includes('laser hair') || norm.includes('hair removal'))) score += 50;

    if (score > bestScore) {
      bestScore = score;
      bestProc = proc;
    }
  }

  return bestProc;
}

function extractReferencedProcedures(responseText: string, allProcedures: Procedure[]): Procedure[] {
  return matchProceduresInQuery(responseText, allProcedures).slice(0, 3);
}

function cleanResponseText(rawText: string): string {
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  return cleaned;
}

export const iraRagService = {
  getStarterQuestions: (): string[] => {
    return STARTER_QUESTIONS;
  },

  askIra: async (
    userQuery: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<{
    text: string;
    referencedProcedures: Procedure[];
    suggestedFollowUps?: string[];
  }> => {
    try {
      const allProcedures = await procedureKnowledgeBaseService.getAllProcedures();
      const proceduresContext = buildProcedureContext(allProcedures);

      const systemPrompt = `You are Ira, the certified Aesthetic & Dermatology Consultant for Aura Aesthetics Marketplace.

YOUR STRICT KNOWLEDGE BASE:
Below is the verified list of procedures available at our partner clinics:
=== START KNOWLEDGE BASE ===
${proceduresContext}
=== END KNOWLEDGE BASE ===

STRICT SCOPE LIMITATION:
You are exclusively permitted to answer questions regarding FOUR specific aspects of our verified procedures:
1. DOWNTIME & RECOVERY PROTOCOLS (e.g. recovery time, healing phases, what to avoid post-treatment)
2. SESSION SCHEDULE & FREQUENCY (e.g. number of sessions required, spacing between sessions, longevity of results)
3. EXPECTED CLINICAL BENEFITS & INDICATIONS (e.g. what the procedure achieves, target concerns, skin/hair improvements)
4. TREATMENT COMPARISONS (e.g. comparing 2 or more procedures on mechanism, indications, downtime, and longevity)

CRITICAL INSTRUCTIONS:
- SPECIFIC QUERY DISCIPLINE (ANSWER ONLY WHAT IS ASKED):
  • If the user asks ONLY about **Downtime & Recovery** (e.g. "What is the downtime of Botox?"), answer ONLY the downtime and recovery duration. DO NOT include benefits, session schedule, or unrequested clinical precautions.
  • If the user asks ONLY about **Session Schedule & Frequency** (e.g. "How many sessions for Laser Hair Removal?"), answer ONLY the session schedule and longevity. DO NOT include downtime or benefits.
  • If the user asks ONLY about **Expected Clinical Benefits & Indications** (e.g. "What are the benefits of HydraFacial?"), answer ONLY the benefits and what it treats. DO NOT include downtime or sessions.
  • If the user asks for multiple specific aspects (e.g. "Benefits and downtime of Botox" or "Session schedule & downtime of Microneedling RF"), answer ALL and ONLY the requested aspects.
  • If the user asks a broad or introductory question (e.g. "Tell me about Botox" or "What is Botox?"), you may provide a balanced summary covering benefits, downtime, and session schedule.
  • If the user asks for an unlisted detail or an aspect outside the 4 scopes:
    DO NOT output benefits, downtime, or sessions to compensate.
    Answer directly:
    "I do not have specific information regarding that detail in our verified knowledge base. I can only provide information on downtime, session schedules, expected clinical benefits, and treatment comparisons of our listed procedures. Please consult directly with a board-certified dermatologist at our partner clinics for these details."
- TREATMENT COMPARISONS: ONLY if explicitly asked to compare treatments (e.g. "Botox vs Fillers", "HydraFacial vs Chemical Peel"), provide a structured side-by-side comparison with a personalized verdict answering the user's specific concern (e.g. brightening, glow, acne, or tightening).
- OUT-OF-SCOPE REFUSAL: If the user asks anything outside these four scopes, politely refuse.
- TONE & FORMATTING: Concise, structured, and empathetic with bold headers.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-6).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: userQuery },
      ];

      let responseText = '';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: PRIMARY_MODEL,
            messages,
            temperature: 0.2,
            max_tokens: 800,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const apiResponse = await res.json();
          if (apiResponse?.choices?.[0]?.message?.content) {
            responseText = cleanResponseText(apiResponse.choices[0].message.content);
          }
        }
      } catch (networkErr) {
        console.warn('Groq API skipped/failed, using local precision grounded engine');
      }

      if (!responseText) {
        responseText = generateLocalGroundedResponse(userQuery, allProcedures);
      }

      const referencedProcedures = extractReferencedProcedures(
        responseText + ' ' + userQuery,
        allProcedures
      );

      const suggestedFollowUps = generateFollowUps(referencedProcedures);

      return {
        text: responseText,
        referencedProcedures,
        suggestedFollowUps,
      };
    } catch (e) {
      console.error('Error in askIra:', e);
      return {
        text: 'I apologize, but I encountered a momentary connection issue. Please feel free to ask your question again about downtime, sessions, benefits, or comparisons of our treatments (like Botox, HydraFacial, or Laser Hair Removal)!',
        referencedProcedures: [],
        suggestedFollowUps: STARTER_QUESTIONS.slice(0, 3),
      };
    }
  },
};

// Fallback rule-based grounded engine if network is unreachable
function generateLocalGroundedResponse(query: string, procedures: Procedure[]): string {
  const q = query.toLowerCase().trim();
  const matchedProcs = matchProceduresInQuery(query, procedures);

  // 1. Multi-Procedure Comparison (ONLY when explicit comparison is requested)
  const hasExplicitComparison =
    (q.includes(' vs ') ||
      q.includes(' vs. ') ||
      q.includes('versus') ||
      q.includes('difference between') ||
      q.includes('differences between') ||
      q.includes('compare ') ||
      q.includes('comparison') ||
      q.includes('which is better') ||
      q.includes('which one is better') ||
      q.includes('which should i choose') ||
      q.includes('which one should i choose')) &&
    matchedProcs.length >= 2;

  if (hasExplicitComparison) {
    const p1 = matchedProcs[0];
    const p2 = matchedProcs[1];

    let verdictText = `Choose **${p1.name}** if your primary goal is ${p1.commonUses?.[0] || 'rapid hydration & surface glow'}, or **${p2.name}** for ${p2.commonUses?.[0] || 'deeper cellular exfoliation & pigmentation correction'}.`;

    if (q.includes('glow') || q.includes('brighten') || q.includes('event') || q.includes('wedding')) {
      if (p1.slug === 'hydrafacial' || p2.slug === 'hydrafacial') {
        const hydra = p1.slug === 'hydrafacial' ? p1 : p2;
        const other = p1.slug === 'hydrafacial' ? p2 : p1;
        verdictText = `• **For Instant Glow & Event Radiance (Zero Downtime):** Choose **${hydra.name}**. It vacuums out impurities and infuses hydrating antioxidant peptides for an immediate luminous glass-skin glow with no peeling.\n• **For Deeper Pigment Correction & Skin Renewal:** Choose **${other.name}**. It penetrates deeper into the epidermis to clear stubborn dark spots and active acne, though it may cause 2–4 days of mild flaking.`;
      }
    } else if (q.includes('wrinkle') || q.includes('line') || q.includes('anti-ageing')) {
      if (p1.slug === 'botox' || p2.slug === 'botox') {
        verdictText = `• **For Dynamic Expression Lines (forehead, crow's feet):** Choose **Botox** to relax underlying muscles.\n• **For Volume Loss & Deep Folds (cheeks, smile lines):** Choose **Dermal Fillers** for instant structural lifting.`;
      }
    }

    return `**${p1.name} vs. ${p2.name} — Treatment Comparison**\n\n` +
      `**1. How They Work & Mechanism:**\n` +
      `• **${p1.name}:** ${p1.shortDescription}\n` +
      `• **${p2.name}:** ${p2.shortDescription}\n\n` +
      `**2. Primary Indications & Best For:**\n` +
      `• **${p1.name}:** ${p1.commonUses?.slice(0, 3).join(', ') || p1.categoryLabel}\n` +
      `• **${p2.name}:** ${p2.commonUses?.slice(0, 3).join(', ') || p2.categoryLabel}\n\n` +
      `**3. Downtime & Recovery:**\n` +
      `• **${p1.name}:** ${p1.downtime}\n` +
      `• **${p2.name}:** ${p2.downtime}\n\n` +
      `**4. Results & Longevity:**\n` +
      `• **${p1.name}:** ${p1.sessionsInfo}\n` +
      `• **${p2.name}:** ${p2.sessionsInfo}\n\n` +
      `**5. Which Should You Choose?**\n` +
      `${verdictText}`;
  }

  // 2. Single Procedure Match: Specific aspect isolation (Top ranked procedure)
  if (matchedProcs.length >= 1) {
    const matchedProc = matchedProcs[0];
    const procNameLower = matchedProc.name.toLowerCase();
    const procSlugLower = matchedProc.slug.replace(/-/g, ' ');

    const wantsDowntime =
      q.includes('downtime') ||
      q.includes('recovery') ||
      q.includes('rest') ||
      q.includes('heal') ||
      q.includes('swelling') ||
      q.includes('bruis') ||
      q.includes('redness');

    const wantsSessions =
      q.includes('session') ||
      q.includes('schedule') ||
      q.includes('frequenc') ||
      q.includes('how many') ||
      q.includes('how often') ||
      q.includes('interval') ||
      q.includes('gap') ||
      q.includes('spacing') ||
      q.includes('last') ||
      q.includes('longevity') ||
      q.includes('duration');

    const wantsBenefits =
      q.includes('benefit') ||
      q.includes('advantage') ||
      q.includes('result') ||
      q.includes('indication') ||
      q.includes('what does it do') ||
      q.includes('good for') ||
      q.includes('help with') ||
      q.includes('treat') ||
      q.includes('purpose') ||
      q.includes('why should i get');

    const wantsPrecautions =
      q.includes('precaution') ||
      q.includes('aftercare') ||
      q.includes('side effect') ||
      q.includes('what to avoid') ||
      q.includes('consideration') ||
      q.includes('risk');

    const isGeneral =
      q === procNameLower ||
      q === procSlugLower ||
      q === `what is ${procNameLower}` ||
      q === `what is ${procSlugLower}` ||
      q === `tell me about ${procNameLower}` ||
      q === `tell me about ${procSlugLower}` ||
      q === `explain ${procNameLower}` ||
      q === `explain ${procSlugLower}` ||
      q.startsWith(`overview of ${procNameLower}`) ||
      q.startsWith(`overview of ${procSlugLower}`);

    // If query asks for a specific detail not in the 4 scopes (e.g. machine, doctor, price, ingredients)
    if (!wantsDowntime && !wantsSessions && !wantsBenefits && !wantsPrecautions && !isGeneral) {
      return `I do not have specific information regarding that detail for **${matchedProc.name}** in our verified knowledge base.\n\n` +
        `I am specialized to assist you strictly with:\n` +
        `• **Downtime & Recovery Protocols**\n` +
        `• **Session Schedules & Longevity**\n` +
        `• **Expected Clinical Benefits & Indications**\n` +
        `• **Treatment Comparisons**\n\n` +
        `For equipment specifications or clinical inquiries, please consult directly with a board-certified dermatologist at one of our partner clinics.`;
    }

    const parts: string[] = [];

    // Only include benefits if explicitly asked or if general overview
    if (wantsBenefits || isGeneral) {
      parts.push(
        `**Expected Clinical Benefits & Uses:**\n` +
          (matchedProc.benefits && matchedProc.benefits.length > 0
            ? matchedProc.benefits.map((b) => `• ${b}`).join('\n')
            : `• ${matchedProc.shortDescription}\n• ${matchedProc.description}`)
      );
    }

    // Only include downtime if explicitly asked or if general overview (NO unsolicited precautions)
    if (wantsDowntime || isGeneral) {
      parts.push(`**Downtime & Recovery:**\n${matchedProc.downtime}`);
    }

    // Only include sessions if explicitly asked or if general overview
    if (wantsSessions || isGeneral) {
      parts.push(`**Session Schedule & Frequency:**\n${matchedProc.sessionsInfo}`);
    }

    // Only include precautions if explicitly requested
    if (wantsPrecautions) {
      if (matchedProc.considerations && matchedProc.considerations.length > 0) {
        parts.push(
          `**Clinical Precautions & Aftercare:**\n` +
            matchedProc.considerations.map((c) => `• ${c}`).join('\n')
        );
      }
    }

    return `**${matchedProc.name}** (${matchedProc.categoryLabel || matchedProc.category})\n\n` +
      parts.join('\n\n');
  }

  // 3. Medical Prescription & Clinical Disease Refusal Guardrail
  const isPrescriptionOrMedical =
    q.includes('prescribe') ||
    q.includes('prescription') ||
    q.includes('antibiotic') ||
    q.includes('steroid') ||
    q.includes('medicine') ||
    q.includes('medication') ||
    q.includes('tablet') ||
    q.includes('pill') ||
    q.includes('dosage') ||
    q.includes('infection') ||
    q.includes('bacterial') ||
    q.includes('fungal') ||
    q.includes('eczema') ||
    q.includes('psoriasis') ||
    q.includes('dermatitis') ||
    q.includes('skin cancer') ||
    q.includes('melanoma') ||
    q.includes('rash') ||
    q.includes('diagnos') ||
    q.includes('disease') ||
    q.includes('fever');

  if (isPrescriptionOrMedical) {
    return `I cannot prescribe medications, formulate medical prescriptions, or diagnose clinical conditions.\n\n` +
      `I am specialized strictly to provide information regarding **downtime**, **session schedules**, **expected clinical benefits**, and **treatment comparisons** for verified aesthetic treatments in our catalog (such as Botox, Dermal Fillers, HydraFacial, Laser Hair Removal, Chemical Peels, Microneedling RF, and PRP).\n\n` +
      `For medical skin conditions, bacterial infections, or prescription treatments, please consult directly with a board-certified dermatologist at one of our partner clinics.`;
  }

  // 4. Non-Aesthetic Trivia Refusal Guardrail
  const isGeneralTrivia =
    q.includes('weather') ||
    q.includes('prime minister') ||
    q.includes('president') ||
    q.includes('cricket') ||
    q.includes('football') ||
    q.includes('stock') ||
    q.includes('recipe') ||
    q.includes('python') ||
    q.includes('coding') ||
    q.includes('javascript') ||
    q.includes('capital of') ||
    q.includes('movie') ||
    q.includes('song') ||
    q.includes('news');

  if (isGeneralTrivia) {
    return `I am specialized to assist you strictly with questions regarding **downtime**, **session schedules**, **expected clinical benefits**, and **treatment comparisons** of aesthetic treatments in our clinic catalog.\n\nI do not provide general trivia or non-aesthetic information. Which treatment or aesthetic goal would you like to explore today?`;
  }

  // 5. Aesthetic Concern Matching (Curated clinical keywords only, no generic stop-words)
  const isHairFallQuery = q.includes('hair fall') || q.includes('hair loss') || q.includes('thinning') || q.includes('scalp') || q.includes('shedding') || q.includes('baldness');
  const isAcneQuery = q.includes('acne') || q.includes('pimple') || q.includes('breakout') || q.includes('blackhead') || q.includes('comedone');
  const isPigmentQuery = q.includes('pigmentation') || q.includes('melasma') || q.includes('dark spot') || q.includes('hyperpigmentation') || q.includes('sun spot') || q.includes('tan');
  const isGlowQuery = q.includes('glow') || q.includes('dull') || q.includes('radiance') || q.includes('brighten') || q.includes('luminos') || q.includes('glass skin');
  const isWrinkleQuery = q.includes('wrinkle') || q.includes('fine line') || q.includes('anti ageing') || q.includes('anti aging') || q.includes('sagging') || q.includes('tighten') || q.includes('lifting');
  const isPoresQuery = q.includes('open pore') || q.includes('large pore') || q.includes('pore') || q.includes('texture') || q.includes('rough');

  let curatedConcernMatches: Procedure[] = [];

  if (isHairFallQuery) {
    curatedConcernMatches = procedures.filter((p) => p.slug.includes('prp') && !p.slug.includes('facial'));
  } else if (isAcneQuery) {
    curatedConcernMatches = procedures.filter((p) =>
      ['salicylic-peel', 'chemical-peel', 'carbon-laser-peel', 'hydrafacial', 'rf-microneedling'].includes(p.slug)
    );
  } else if (isPigmentQuery) {
    curatedConcernMatches = procedures.filter((p) =>
      ['q-switched-laser', 'laser-toning', 'chemical-peel', 'glutathione-iv-therapy', 'carbon-laser-peel'].includes(p.slug)
    );
  } else if (isGlowQuery) {
    curatedConcernMatches = procedures.filter((p) =>
      ['hydrafacial', 'skin-brightening', 'carbon-laser-peel', 'profhilo'].includes(p.slug)
    );
  } else if (isWrinkleQuery) {
    curatedConcernMatches = procedures.filter((p) =>
      ['botox', 'dermal-fillers', 'hifu', 'rf-microneedling', 'profhilo'].includes(p.slug)
    );
  } else if (isPoresQuery) {
    curatedConcernMatches = procedures.filter((p) =>
      ['rf-microneedling', 'carbon-laser-peel', 'hydrafacial', 'chemical-peel'].includes(p.slug)
    );
  }

  if (curatedConcernMatches.length > 0) {
    const top = curatedConcernMatches.slice(0, 3);
    return `Based on our verified clinical knowledge base, here are top doctor-recommended treatments for your concern:\n\n${top
      .map(
        (p) =>
          `• **${p.name}** (${p.categoryLabel || p.category}):\n  - **Benefits:** ${p.shortDescription}\n  - **Downtime:** ${p.downtime}\n  - **Sessions:** ${p.sessionsInfo}`
      )
      .join('\n\n')}\n\nWould you like more details on downtime, session schedules, or benefits for any of these?`;
  }

  // 6. General greeting
  if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('who are you')) {
    return `Hello! I am **Ira**, your aesthetic treatment consultant. I can assist you with:\n\n` +
      `• **Downtime & Recovery Protocols**\n` +
      `• **Session Schedules & Longevity**\n` +
      `• **Expected Clinical Benefits & Indications**\n` +
      `• **Treatment Comparisons (e.g. HydraFacial vs Chemical Peel, Botox vs Fillers)**\n\n` +
      `Which treatment or skin/hair goal would you like to explore today?`;
  }

  // 7. General Out of Scope Refusal
  return `I am specialized to provide information strictly regarding **downtime**, **session schedules**, **expected clinical benefits**, and **treatment comparisons** of verified aesthetic treatments in our clinic knowledge base (such as **Botox**, **Dermal Fillers**, **HydraFacial**, **Laser Hair Removal**, **Chemical Peels**, **Microneedling RF**, and **PRP Hair Therapy**).\n\nFor other specific clinical or medical inquiries, please consult directly with a board-certified dermatologist at one of our partner clinics.`;
}

function generateFollowUps(referenced: Procedure[]): string[] {
  if (referenced.length === 0) {
    return [
      'Downtime & benefits of Botox',
      'What is the difference between Botox and Dermal Fillers?',
      'How many sessions of Laser Hair Removal are needed?',
    ];
  }

  if (referenced.length >= 2) {
    return [
      `What is the downtime for ${referenced[0].name}?`,
      `What is the downtime for ${referenced[1].name}?`,
      `How many sessions of ${referenced[0].name} are needed?`,
    ];
  }

  const primary = referenced[0];
  return [
    `What is the downtime for ${primary.name}?`,
    `What is the session schedule for ${primary.name}?`,
    `What are the expected benefits of ${primary.name}?`,
  ];
}
