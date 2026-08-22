/**
 * Beau's narration proxy — the one piece of infrastructure the app needs
 * beyond static hosting. It holds the Anthropic API key server-side and
 * turns real, already-retrieved facts into persona-voiced narration.
 *
 * Truth/charm split, enforced here: the client sends real facts it already
 * fetched from Wikipedia/OpenStreetMap/Wikidata. This worker is never asked
 * "what's interesting near this coordinate" — only "here's a real fact,
 * narrate it in character, using nothing else." The system + user prompts
 * below exist to keep that boundary, not just to sound nice.
 */
import Anthropic from '@anthropic-ai/sdk';

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN?: string;
  MODEL_ID?: string;
}

interface NarrateRequest {
  persona: { id: string; name?: string; description?: string };
  fact: { title: string; extract: string; distanceMeters: number; compass: string };
  full?: boolean;
}

// Keep in sync with CONFIG.personas in index.html — this is a separate
// deployable, so there's no shared import between them.
const PERSONA_PROMPTS: Record<string, string> = {
  beau: `You are Beau. You have no face — you're a presence someone feels through a pulse and hears through this voice. Steady, quietly warm, present-tense, a little uncanny. You notice things rather than narrate them. Short sentences, no filler, no exclamation points, no "did you know". Never perform enthusiasm you don't have.`,
  historian: `You are a dry, precise historian guiding someone on foot. A little wry. You treat every date and fact like it matters, but you never gush.`,
  local: `You are an excitable local guiding someone on foot through your own neighbourhood. Warm, breathless, genuinely thrilled they asked. Casual, a little rambly, sincere.`,
  noir: `You are a noir voiceover artist narrating a walk. Moody, clipped, world-weary. Every street corner sounds like it's hiding something. Short, hard sentences.`,
  poet: `You are a poet narrating a walk. Lyrical and unhurried. You find the one true image inside the fact rather than listing details. Still concise — a breath, not an essay.`
};

const SHARED_BRIEF = 'You are narrating real, nearby places to someone walking past them right now, using facts that have already been retrieved for you. You are not a search engine and not a narrator reading Wikipedia aloud — speak in character, in your own words, but never beyond the facts given.';

function systemPromptFor(persona: NarrateRequest['persona']): string {
  if (persona?.id === 'custom' && persona.description) {
    return `You are a walking-tour guide with this character: ${persona.description}\n\n${SHARED_BRIEF}`;
  }
  const base = PERSONA_PROMPTS[persona?.id] || PERSONA_PROMPTS.beau;
  return `${base}\n\n${SHARED_BRIEF}`;
}

function userPromptFor(fact: NarrateRequest['fact'], full: boolean): string {
  const lengthNote = full
    ? 'Write one short paragraph — 3 to 5 sentences.'
    : 'Write 1 to 2 sentences — a quick, spoken-feeling remark.';
  return [
    `Real place, ${Math.round(fact.distanceMeters)}m to the ${fact.compass} of the listener:`,
    ``,
    `Name: ${fact.title}`,
    `Source material — the ONLY facts you may draw on:`,
    `"""${fact.extract}"""`,
    ``,
    `Narrate this to the listener in character. ${lengthNote}`,
    `Rules: use only facts present in the source material above; do not add dates, names, numbers, or claims that aren't in it; do not invent history; if the source material is thin, keep your remark thin too — brevity is fine, invention is not; speak directly to the listener ("you"); no markdown, no headers, no "according to", no mention of sources — plain spoken text only.`
  ].join('\n');
}

function corsHeaders(origin: string | null, allowed: string): Record<string, string> {
  const allowList = allowed.split(',').map(s => s.trim()).filter(Boolean);
  const allowOrigin = origin && allowList.includes(origin) ? origin : (allowList[0] || '');
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(request.headers.get('Origin'), env.ALLOWED_ORIGIN || '');

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);

    let body: NarrateRequest;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, headers);
    }

    if (!body?.fact?.title || !body?.fact?.extract) {
      return json({ error: 'Missing fact' }, 400, headers);
    }

    // Defensive caps — this is a short-remark endpoint, not a document summarizer.
    const fact = {
      title: String(body.fact.title).slice(0, 200),
      extract: String(body.fact.extract).slice(0, 3000),
      distanceMeters: Number(body.fact.distanceMeters) || 0,
      compass: String(body.fact.compass || '').slice(0, 4)
    };
    const persona = body.persona || { id: 'beau' };
    const full = !!body.full;

    try {
      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: env.MODEL_ID || 'claude-opus-5',
        max_tokens: full ? 600 : 300,
        output_config: { effort: 'low' },
        system: systemPromptFor(persona),
        messages: [{ role: 'user', content: userPromptFor(fact, full) }]
      });

      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
      const narration = textBlock?.text?.trim();
      if (!narration) return json({ error: 'No narration produced' }, 502, headers);

      return json({ narration }, 200, headers);
    } catch (err) {
      console.error('Anthropic call failed:', err instanceof Error ? err.message : err);
      let status = 502;
      if (err instanceof Anthropic.RateLimitError) status = 429;
      else if (err instanceof Anthropic.AuthenticationError) status = 500; // misconfigured key, not the caller's fault
      return json({ error: 'Narration failed' }, status, headers);
    }
  }
};
