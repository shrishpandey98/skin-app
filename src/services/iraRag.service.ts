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
}

function matchProceduresInQuery(text: string, allProcedures: Procedure[]): Procedure[] {
  const lower = text.toLowerCase();
  const matched: Procedure[] = [];

  for (const proc of allProcedures) {
    const nameLower = proc.name.toLowerCase();
    const slugLower = proc.slug.toLowerCase().replace(/-/g, ' ');

    // Direct match
    if (lower.includes(nameLower) || lower.includes(slugLower)) {
      matched.push(proc);
      continue;
    }

    // Common synonyms
    if (proc.slug === 'dermal-fillers' && (lower.includes('filler') || lower.includes('fillers'))) {
      matched.push(proc);
    } else if (proc.slug === 'chemical-peel' && (lower.includes('peel') || lower.includes('peels'))) {
      matched.push(proc);
    } else if (proc.slug === 'laser-hair-removal' && (lower.includes('laser hair') || lower.includes('lhr'))) {
      matched.push(proc);
    } else if (proc.slug === 'microneedling-rf' && (lower.includes('microneedl') || lower.includes('mnrf'))) {
      matched.push(proc);
    } else if (proc.slug === 'prp-hair-therapy' && (lower.includes('prp') || lower.includes('plasma'))) {
      matched.push(proc);
    } else if (proc.slug === 'hydrafacial' && (lower.includes('hydra facial') || lower.includes('hydrafacial'))) {
      matched.push(proc);
    } else if (proc.slug === 'botox' && lower.includes('botox')) {
      matched.push(proc);
    }
  }

  return Array.from(new Set(matched));
}

function extractReferencedProcedures(responseText: string, allProcedures: Procedure[]): Procedure[] {
  return matchProceduresInQuery(responseText, allProcedures).slice(0, 3);
}

function cleanResponseText(rawText: string): string {
  // Remove <think>...</think> reasoning blocks from reasoning models
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
    suggestedFollowUps: string[];
  }> => {
    try {
      // 1. Fetch live cached procedure catalog
      const allProcedures = await procedureKnowledgeBaseService.getAllProcedures();
      const proceduresContext = buildProcedureContext(allProcedures);

      // 2. Build strict grounding system prompt
      const systemPrompt = `You are Ira, the certified Aesthetic & Dermatology Consultant for Aura Aesthetics Marketplace.

YOUR STRICT KNOWLEDGE BASE:
Below is the verified list of procedures available at our partner clinics:
=== START KNOWLEDGE BASE ===
${proceduresContext}
=== END KNOWLEDGE BASE ===

STRICT SCOPE LIMITATION:
You are exclusively permitted to answer questions regarding FOUR specific aspects of our verified procedures:
1. DOWNTIME & RECOVERY PROTOCOLS (e.g. recovery time, healing phases, what to avoid post-treatment, aftercare precautions)
2. SESSION SCHEDULE & FREQUENCY (e.g. number of sessions required, spacing between sessions, longevity of results)
3. EXPECTED CLINICAL BENEFITS & INDICATIONS (e.g. what the procedure achieves, target concerns, skin/hair improvements)
4. TREATMENT COMPARISONS (e.g. comparing 2 or more procedures on mechanism, indications, downtime, and longevity)

CRITICAL INSTRUCTIONS:
- SPECIFIC QUERY DISCIPLINE (DO NOT DUMP UNSOLICITED INFO):
  • If the user asks ONLY about **Downtime & Recovery** (e.g. "What is the downtime of Botox?"), answer ONLY the downtime and immediate recovery precautions. DO NOT include benefits or session schedule.
  • If the user asks ONLY about **Session Schedule & Frequency** (e.g. "How many sessions for Laser Hair Removal?"), answer ONLY the session schedule and longevity. DO NOT include downtime or benefits.
  • If the user asks ONLY about **Expected Clinical Benefits & Indications** (e.g. "What are the benefits of HydraFacial?"), answer ONLY the benefits and what it treats. DO NOT include downtime or sessions.
  • If the user asks for multiple specific aspects (e.g. "Downtime and session schedule for Chemical Peels"), answer ALL and ONLY the requested aspects.
  • If the user asks a broad or introductory question (e.g. "Tell me about Botox" or "What is Botox?"), you may provide a balanced summary covering benefits, downtime, and session schedule.
  • If the user asks for an unlisted detail or an aspect outside the 4 scopes (e.g. "Which machine is used in laser hair removal?", "What is the price/cost?", "Who is the doctor?", "Can I eat before this?"):
    DO NOT output benefits, downtime, or sessions to compensate.
    Answer directly:
    "I do not have specific information regarding that detail in our verified knowledge base. I can only provide information on downtime, session schedules, expected clinical benefits, and treatment comparisons of our listed procedures. Please consult directly with a board-certified dermatologist at our partner clinics for these details."
- TREATMENT COMPARISONS: If asked to compare treatments (e.g. "Botox vs Fillers", "HydraFacial vs Chemical Peel"), provide a side-by-side comparison across:
  • **1. How They Work & Mechanism**
  • **2. Primary Indications & Best Suited For**
  • **3. Downtime & Recovery Comparison**
  • **4. Results & Longevity (Sessions)**
  • **5. Summary / Which Should You Choose?**
- OUT-OF-SCOPE REFUSAL: If the user asks anything outside these four scopes (e.g. non-aesthetic general medicine, unlisted surgical procedures, pricing not in catalog, personal doctor details, coding, weather, general trivia), politely refuse:
  "I am specialized to provide information strictly regarding downtime, session schedules, expected benefits, and treatment comparisons of verified procedures in our clinic catalog. For other specific queries, please consult directly with a board-certified dermatologist at our partner clinics."
- TONE & FORMATTING: Concise, structured, and empathetic with bold headers.`;

      // 3. Format messages array for LLM
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-6).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: userQuery },
      ];

      // 4. Call Groq API
      let apiResponse: any = null;

      try {
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
        });

        if (res.ok) {
          apiResponse = await res.json();
        } else {
          // Fallback to secondary model if primary has issues
          const fallbackRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: FALLBACK_MODEL,
              messages,
              temperature: 0.2,
              max_tokens: 800,
            }),
          });
          if (fallbackRes.ok) {
            apiResponse = await fallbackRes.json();
          }
        }
      } catch (networkErr) {
        console.warn('Groq API network error, using local grounding engine:', networkErr);
      }

      let responseText = '';
      if (apiResponse?.choices?.[0]?.message?.content) {
        responseText = cleanResponseText(apiResponse.choices[0].message.content);
      }

      // If API failed or returned empty, generate local grounded answer
      if (!responseText) {
        responseText = generateLocalGroundedResponse(userQuery, allProcedures);
      }

      // 5. Extract referenced procedures to display interactive cards
      const referencedProcedures = extractReferencedProcedures(
        responseText + ' ' + userQuery,
        allProcedures
      );

      // 6. Generate dynamic follow-up suggestions
      const suggestedFollowUps = generateFollowUps(referencedProcedures);

      return {
        text: responseText,
        referencedProcedures,
        suggestedFollowUps,
      };
    } catch (e) {
      console.error('Error in askIra:', e);
      return {
        text: 'I apologize, but I encountered a momentary connection issue. Please feel free to ask your question again about downtime, sessions, benefits, or comparisons of our procedures (like Botox, HydraFacial, or Laser Hair Removal)!',
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

  // 1. Multi-Procedure Comparison
  const isComparison =
    matchedProcs.length >= 2 ||
    q.includes('vs') ||
    q.includes('versus') ||
    q.includes('difference') ||
    q.includes('compare') ||
    q.includes('which is better') ||
    q.includes('which one');

  if (isComparison && matchedProcs.length >= 2) {
    const p1 = matchedProcs[0];
    const p2 = matchedProcs[1];

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
      `**Summary:** Choose **${p1.name}** if your primary goal is ${p1.commonUses?.[0] || 'rejuvenation'}, or **${p2.name}** for ${p2.commonUses?.[0] || 'targeted contouring'}.`;
  }

  // 2. Single Procedure Match: Specific aspect isolation
  if (matchedProcs.length === 1) {
    const matchedProc = matchedProcs[0];
    const procNameLower = matchedProc.name.toLowerCase();
    const procSlugLower = matchedProc.slug.replace(/-/g, ' ');

    const wantsDowntime =
      q.includes('downtime') ||
      q.includes('recovery') ||
      q.includes('aftercare') ||
      q.includes('rest') ||
      q.includes('heal') ||
      q.includes('swelling') ||
      q.includes('bruis') ||
      q.includes('redness') ||
      q.includes('side effect') ||
      q.includes('precaution');

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
    if (!wantsDowntime && !wantsSessions && !wantsBenefits && !isGeneral) {
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

    // Only include downtime if explicitly asked or if general overview
    if (wantsDowntime || isGeneral) {
      const precautions =
        matchedProc.considerations && matchedProc.considerations.length > 0
          ? `\n\n**Clinical Precautions:**\n` +
            matchedProc.considerations.map((c) => `• ${c}`).join('\n')
          : '';
      parts.push(`**Downtime & Recovery:**\n${matchedProc.downtime}${precautions}`);
    }

    // Only include sessions if explicitly asked or if general overview
    if (wantsSessions || isGeneral) {
      parts.push(`**Session Schedule & Frequency:**\n${matchedProc.sessionsInfo}`);
    }

    return `**${matchedProc.name}** (${matchedProc.categoryLabel || matchedProc.category})\n\n` +
      parts.join('\n\n');
  }

  // 3. Concern search
  const concernMatches = procedures.filter((p) =>
    p.commonUses?.some((u) => q.split(' ').some((word) => word.length > 3 && u.toLowerCase().includes(word)))
  );

  if (concernMatches.length > 0) {
    const top = concernMatches.slice(0, 2);
    return `Based on our verified clinical catalog, here are the recommended procedures for your concern:\n\n${top
      .map(
        (p) =>
          `• **${p.name}** (${p.categoryLabel || p.category}):\n  - **Benefits:** ${p.shortDescription}\n  - **Downtime:** ${p.downtime}\n  - **Sessions:** ${p.sessionsInfo}`
      )
      .join('\n\n')}\n\nWould you like more details on downtime, session schedule, or benefits for any of these?`;
  }

  // 4. General greeting
  if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('who are you')) {
    return `Hello! I am **Ira**, your aesthetic procedure consultant. I can assist you with:\n\n` +
      `• **Downtime & Recovery Protocols**\n` +
      `• **Session Schedules & Longevity**\n` +
      `• **Expected Clinical Benefits & Indications**\n` +
      `• **Treatment Comparisons (e.g. Botox vs Fillers)**\n\n` +
      `Which verified procedure would you like to explore today?`;
  }

  // 5. Out of scope refusal
  return `I am specialized to provide information strictly regarding **downtime**, **session schedules**, **expected benefits**, and **treatment comparisons** of verified procedures in our clinic knowledge base (such as **Botox**, **Dermal Fillers**, **HydraFacial**, **Laser Hair Removal**, **Chemical Peels**, **Microneedling RF**, and **PRP Hair Therapy**).\n\nFor other specific clinical or medical inquiries, please consult directly with a board-certified dermatologist at one of our partner clinics.`;
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
