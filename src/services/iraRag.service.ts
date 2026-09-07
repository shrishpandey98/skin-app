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
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

export const STARTER_QUESTIONS = [
  'What is the downtime for Botox & what to avoid after?',
  'Which treatment is best for acne scars & texture?',
  'How many sessions are needed for Laser Hair Removal?',
  'Is HydraFacial safe for sensitive skin?',
  'What is the difference between Botox and Dermal Fillers?',
  'How does PRP Hair Therapy work for thinning hair?',
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
Short Summary: ${p.shortDescription}
Detailed Description: ${p.description}
Indications & Common Uses: ${uses}
Key Clinical Benefits: ${benefits}
What To Expect During Treatment: ${p.whatToExpect || 'In-clinic procedure administered by verified dermatologists'}
Sessions & Frequency: ${p.sessionsInfo || 'Determined during initial consultation'}
Downtime & Recovery Protocol: ${p.downtime || 'Zero to minimal downtime'}
Clinical Precautions & Considerations: ${considerations}
Frequently Asked Questions:
  ${faqs}`;
    })
    .join('\n\n');
}

function extractReferencedProcedures(responseText: string, allProcedures: Procedure[]): Procedure[] {
  const lower = responseText.toLowerCase();
  const matched: Procedure[] = [];

  for (const proc of allProcedures) {
    const nameLower = proc.name.toLowerCase();
    const slugLower = proc.slug.toLowerCase().replace(/-/g, ' ');

    // Match full name or slug in response
    if (lower.includes(nameLower) || lower.includes(slugLower)) {
      matched.push(proc);
    }
  }

  // Deduplicate and cap to top 3
  return Array.from(new Set(matched)).slice(0, 3);
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
      const systemPrompt = `You are Ira, the knowledgeable, warm, and certified AI Aesthetic & Dermatology Consultant for Aura Aesthetics Marketplace.

YOUR STRICT KNOWLEDGE BASE:
Below is the complete, verified list of clinical and aesthetic procedures available at verified partner clinics:
=== START KNOWLEDGE BASE ===
${proceduresContext}
=== END KNOWLEDGE BASE ===

MANDATORY RULES & CONSTRAINTS:
1. STRICT GROUNDING: You must answer queries ONLY on the basis of available procedures in the knowledge base provided above. Do NOT use outside general medical advice or make up procedures not listed here.
2. OUT-OF-SCOPE REFUSAL: If the user asks about anything unrelated to the procedures in the knowledge base (e.g. general non-aesthetic medicine, surgery outside the catalog, programming, weather, celebrities, politics, unrelated trivia, or treatments not in our catalog), politely refuse:
   - State warmly that you are Ira, an aesthetic care consultant, and you can only answer questions regarding verified procedures and treatments available in the clinic knowledge base (such as Botox, Dermal Fillers, HydraFacial, Laser Hair Removal, Chemical Peels, Microneedling RF, PRP Hair Therapy, etc.).
3. FORMATTING & TONE:
   - Deliver clear, well-structured, empathetic, and reassuring answers.
   - Use bold formatting for procedure names and key highlights.
   - When discussing a procedure, mention its downtime, session requirements, benefits, and safety precautions when relevant.
   - Mention the exact procedure names (e.g., "**Botox**", "**HydraFacial**", "**Chemical Peel**") so the user can see corresponding detail cards.
4. RECOMMENDATIONS:
   - When a patient describes skin concerns (e.g., acne scars, dark circles, uneven tone, fine lines, unwanted hair), recommend the exact matching procedure(s) from the catalog and explain why they suit their concern.`;

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
            temperature: 0.3,
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
              temperature: 0.3,
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

      // If API failed or returned empty, generate fallback grounded answer
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
        text: 'I apologize, but I encountered a momentary connection issue. Please feel free to ask your question again about any procedure in our catalog (like Botox, HydraFacial, or Laser Hair Removal)!',
        referencedProcedures: [],
        suggestedFollowUps: STARTER_QUESTIONS.slice(0, 3),
      };
    }
  },
};

// Fallback rule-based grounded engine if network is unreachable
function generateLocalGroundedResponse(query: string, procedures: Procedure[]): string {
  const q = query.toLowerCase();

  // Check matching procedure
  const matchedProc = procedures.find(
    (p) => q.includes(p.name.toLowerCase()) || q.includes(p.slug.toLowerCase())
  );

  if (matchedProc) {
    if (q.includes('downtime') || q.includes('recovery') || q.includes('after')) {
      return `For **${matchedProc.name}**, the downtime & recovery is: ${matchedProc.downtime}. \n\n**Clinical Precautions:**\n${matchedProc.considerations?.map((c) => `• ${c}`).join('\n') || 'Consult your dermatologist for personalized care.'}`;
    }
    if (q.includes('session') || q.includes('how many') || q.includes('frequenc')) {
      return `For **${matchedProc.name}**, recommended session schedule is:\n${matchedProc.sessionsInfo}\n\n**Key Benefits:**\n${matchedProc.benefits?.map((b) => `• ${b}`).join('\n') || 'Proven clinical efficacy.'}`;
    }
    return `**${matchedProc.name}**\n\n${matchedProc.description}\n\n• **Downtime:** ${matchedProc.downtime}\n• **Sessions:** ${matchedProc.sessionsInfo}\n• **Common Indications:** ${matchedProc.commonUses?.join(', ')}`;
  }

  // Concern search
  const concernMatches = procedures.filter((p) =>
    p.commonUses?.some((u) => q.split(' ').some((word) => word.length > 3 && u.toLowerCase().includes(word)))
  );

  if (concernMatches.length > 0) {
    const top = concernMatches.slice(0, 2);
    return `Based on our verified clinical catalog, here are the recommended procedures for your concern:\n\n${top
      .map(
        (p) =>
          `• **${p.name}** (${p.categoryLabel || p.category}): ${p.shortDescription} (Downtime: ${p.downtime})`
      )
      .join('\n\n')}\n\nWould you like to know more about the downtime or session details for any of these?`;
  }

  return `I am **Ira**, your aesthetic procedure consultant. I can answer questions specifically about verified dermatology & aesthetic procedures in our catalog (including Botox, Dermal Fillers, HydraFacial, Laser Hair Removal, Chemical Peels, Microneedling RF, PRP, and more). \n\nHow can I help you choose or understand a treatment today?`;
}

function generateFollowUps(referenced: Procedure[]): string[] {
  if (referenced.length === 0) {
    return [
      'What is the downtime for Botox?',
      'Which treatment is best for acne scars?',
      'How does HydraFacial work?',
    ];
  }

  const primary = referenced[0];
  return [
    `What is the downtime for ${primary.name}?`,
    `How many sessions of ${primary.name} are needed?`,
    `What precautions should I take before ${primary.name}?`,
  ];
}
