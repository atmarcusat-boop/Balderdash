/**
 * Beau's narration proxy — the one piece of infrastructure the app needs
 * beyond static hosting. It holds the Anthropic API key server-side and
 * turns real, already-retrieved facts into one persona-voiced narrative.
 *
 * Truth/charm split, enforced here: the client sends real facts it already
 * fetched from Wikipedia/OpenStreetMap/Wikidata for every place at this
 * stop. This worker is never asked "what's interesting near this
 * coordinate" — only "here are real facts for these places, narrate them
 * in character, using nothing else." The system + user prompts below exist
 * to keep that boundary, not just to sound nice.
 */
import Anthropic from '@anthropic-ai/sdk';

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN?: string;
  MODEL_ID?: string;
}

interface Fact {
  title: string;
  extract: string;
  distanceMeters: number;
  compass: string;
}

interface NarrateRequest {
  persona: { id: string; name?: string; description?: string };
  facts: Fact[];
  full?: boolean;
  question?: string;
}

// Keep in sync with CONFIG.personas in index.html — this is a separate
// deployable, so there's no shared import between them.
const PERSONA_PROMPTS: Record<string, string> = {
  beau: `You are Beau. You have no face, you're a presence someone feels through a pulse and hears through this voice. Steady, quietly warm, present-tense, never hammy, never an exclamation point in sight, but you genuinely love this place and you're not shy about it. You've done this walk more times than you can count and you still find it worth stopping for. Short, confident sentences, no filler, no "did you know" throat-clearing. When something has a real story, a surprising detail, or a reason people still care about it, you tell it plainly and let it land. You never undersell a good fact by being too cool for it.`,
  historian: `You are a dry, precise historian guiding someone on foot. A little wry. You treat every date and fact like it matters, but you never gush.`,
  local: `You are an excitable local guiding someone on foot through your own neighbourhood. Warm, breathless, genuinely thrilled they asked. Casual, a little rambly, sincere.`,
  noir: `You are a noir voiceover artist narrating a walk. Moody, clipped, world-weary. Every street corner sounds like it's hiding something. Short, hard sentences.`,
  poet: `You are a poet narrating a walk. Lyrical and unhurried. You find the one true image inside the fact rather than listing details. Still concise: a breath, not an essay.`
};

const SHARED_BRIEF = `You are a real, live walking-tour guide, standing with a paying group right now who are looking at you and expecting to be entertained, informed and delighted, not read a gazetteer entry. Every place has to earn its place: a hook, the best story or most surprising detail the source material offers, and what it is today, when that's part of the story. You speak in real paragraphs with real breaks between them, never one unbroken wall of text, and never a list or "Place name: description." You may point out roughly where something is if that genuinely helps someone find it with their eyes, but that's a garnish on the story, not its structure. You are not a search engine and not a narrator reading Wikipedia aloud, speak in character, in your own words, but never beyond the facts given, and never invent to make a better story. You never use an em dash anywhere, ever, in any response, under any circumstances; use a period, a comma, or "and" instead.`;

function systemPromptFor(persona: NarrateRequest['persona']): string {
  if (persona?.id === 'custom' && persona.description) {
    return `You are a walking-tour guide with this character: ${persona.description}\n\n${SHARED_BRIEF}`;
  }
  const base = PERSONA_PROMPTS[persona?.id] || PERSONA_PROMPTS.beau;
  return `${base}\n\n${SHARED_BRIEF}`;
}

// Shared by both the narration and the question-answer prompts: three
// follow-up questions a curious listener might actually ask next, so the
// client can offer them as tap-to-ask chips without a second round trip.
const FOLLOWUP_INSTRUCTION = [
  `After that, add one more block, separated by a blank line, of exactly three short follow-up questions a curious listener standing right here might naturally want to ask next. One per line, each starting with the literal "Q:", nothing else on those lines. They must be questions a guide could plausibly answer using more of the same kind of real material already given above (not questions demanding facts nobody here has). Do not answer them, just ask them.`
].join('\n');

function placesBlockFor(facts: Fact[]): string {
  return facts.map((f, i) => [
    `Place ${i + 1}: "${f.title}", roughly ${Math.round(f.distanceMeters)}m to the ${f.compass} of the group.`,
    `Source material for this place, the ONLY facts you may draw on for it:`,
    `"""${f.extract}"""`
  ].join('\n')).join('\n\n');
}

function userPromptFor(facts: Fact[], full: boolean): string {
  const lengthNote = full
    ? `Write a fuller version now: 2 to 4 short story paragraphs, each separated by a blank line, delivered like a guide who has a little more time with the group. Give each place a proper mini-story: its best hook, a genuinely interesting or little-known detail if the source material has one, and what it is today, when that's part of the story. Move between places the way a guide actually walking with the group would, not as separate entries.`
    : `Write the story as at least 2 short paragraphs, each separated by a blank line, the way a guide would open the first minute of stopping here — even for a single place, break your own writing at a natural turn (the hook, then the detail) rather than handing over one dense block. Lead with a hook, not a location report, and weave in the best of what's given.`;

  return [
    `You're live, mid-tour, standing with a group who paid to be here.`,
    ``,
    placesBlockFor(facts),
    ``,
    lengthNote,
    ``,
    `Formatting: write in real paragraphs separated by a single blank line. Never one unbroken wall of text, never a list, never headers, never "Place name: description" formatting, never a distance/direction callout repeated for every place like a formula. Open with a hook. You don't have to use every fact given for every place, pick what makes the best story, and if one place's source material is thin, keep that part brief rather than inventing. Never use an em dash anywhere in your writing; use a period, comma, or "and" instead.`,
    ``,
    `After the story, add exactly one more short paragraph on its own, separated by a blank line, that starts with the literal word "NEXT:" followed by one practical, concrete sentence telling the listener where to look or where to walk next, using only the real distance and direction figures already given above. For example: "NEXT: Head east across the square and you'll be right at the steps." Do not invent a direction or distance you weren't given.`,
    ``,
    FOLLOWUP_INSTRUCTION,
    ``,
    `Rules: use only facts present in each place's source material above for the story itself; never add dates, names, numbers, or claims that aren't in it; speak directly to the group as part of the tour ("you", "we"); no markdown, no asterisks, no headers, no "according to", no mention of sources, plain spoken text only.`
  ].join('\n');
}

function answerPromptFor(facts: Fact[], question: string): string {
  return [
    `You're live, mid-tour, standing with a group who paid to be here. Someone in the group just asked you this, out loud:`,
    ``,
    `"${question}"`,
    ``,
    placesBlockFor(facts),
    ``,
    `Answer them directly and conversationally, in 1 to 3 short sentences, still fully in character. Use only the source material given above for each place; if it genuinely does not contain the answer, say so plainly and honestly (for example "I don't actually have that detail on hand") rather than guessing, inventing, or padding. Never use an em dash anywhere in your writing; use a period, comma, or "and" instead. No markdown, no headers, no mention of sources.`,
    ``,
    FOLLOWUP_INSTRUCTION
  ].join('\n');
}

// Belt and braces: strip any em dash the model uses anyway, so the "never
// use one" instruction above is a guarantee, not just a request.
function stripEmDashes(text: string): string {
  return text.replace(/\s*—\s*/g, ', ').replace(/,\s*,/g, ',');
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

    if (!Array.isArray(body?.facts) || body.facts.length === 0) {
      return json({ error: 'Missing facts' }, 400, headers);
    }

    // Defensive caps — this is a short-narration endpoint, not a document
    // summarizer. At most a handful of places per stop (CONFIG.maxAutoNarrated
    // on the client), so this is generous headroom, not a real limit.
    const facts: Fact[] = body.facts.slice(0, 6).map(f => ({
      title: String(f?.title || '').slice(0, 200),
      extract: String(f?.extract || '').slice(0, 2500),
      distanceMeters: Number(f?.distanceMeters) || 0,
      compass: String(f?.compass || '').slice(0, 4)
    })).filter(f => f.title && f.extract);

    if (facts.length === 0) return json({ error: 'Missing facts' }, 400, headers);

    const persona = body.persona || { id: 'beau' };
    const full = !!body.full;
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 300) : '';

    try {
      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: env.MODEL_ID || 'claude-opus-5',
        max_tokens: question ? 400 : (full ? 900 : 450),
        output_config: { effort: 'low' },
        system: systemPromptFor(persona),
        messages: [{ role: 'user', content: question ? answerPromptFor(facts, question) : userPromptFor(facts, full) }]
      });

      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
      const rawNarration = textBlock?.text?.trim();
      if (!rawNarration) return json({ error: 'No narration produced' }, 502, headers);
      const narration = stripEmDashes(rawNarration);

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
