// The 12 items. Edit this list to change what's tracked — nothing else
// needs to know about a new item beyond its id being unique.
//
// `example` (optional) is the "small as / big as" line shown on the front
// of the card, under the question. Leave it out for items that don't have
// one (Sleep, Authenticity).
//
// `icon` is a lucide-react component, shown in a small badge on the card
// and next to the item's name in Progress.
//
// `image` is optional — drop a URL or imported asset in here later to
// give a card a background photo. Left blank for now.

import {
  BookOpen,
  Dumbbell,
  Feather,
  Fingerprint,
  HeartHandshake,
  MessageCircle,
  Moon,
  PartyPopper,
  Salad,
  Scale,
  ShieldCheck,
  Sparkle,
} from 'lucide-react'

export const SECTIONS = [
  { id: 'bedrock', name: 'Bedrock', color: '#6fa3b8' },
  { id: 'character', name: 'Character', color: '#c99a5b' },
  { id: 'balance', name: 'Balance', color: '#b98a9a' },
  { id: 'human', name: 'Human', color: '#8fae7c' },
]

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((s) => [s.id, s]))

export const ITEMS = [
  {
    id: 'sleep',
    section: 'bedrock',
    name: 'Sleep',
    icon: Moon,
    front: 'Did you get enough sleep?',
    example: 'Small as an earlier bedtime, big as fixing a long-term sleep debt.',
    back: "7 to 9 hours most nights. Almost everything else on this list gets harder without it. It's the floor the rest of the day is built on.",
    image: null,
  },
  {
    id: 'whole-foods',
    section: 'bedrock',
    name: 'Whole Foods',
    icon: Salad,
    front: 'Did you eat real food?',
    example: 'Small as swapping one snack, big as cooking from scratch.',
    back: 'Unprocessed, mostly protein, with good fats, complex carbs, and some fruit. Aim for one real meal rather than a perfect diet.',
    image: null,
  },
  {
    id: 'exercise',
    section: 'bedrock',
    name: 'Exercise',
    icon: Dumbbell,
    front: 'Did you move your body?',
    example: 'Small as a short walk, big as a 5km run.',
    back: 'Movement lifts your mood before it changes your body, often the same day. Daily is sustainable when it’s the small end.',
    image: null,
  },
  {
    id: 'authenticity',
    section: 'character',
    name: 'Authenticity',
    icon: Fingerprint,
    front: 'Were you yourself today?',
    example: 'Small as saying what you actually think, big as a life choice that’s true to you.',
    back: 'Living as who you actually are, not as others want you to be, with honesty and integrity. When your actions match what you believe, the day sits easier.',
    image: null,
  },
  {
    id: 'serve',
    section: 'character',
    name: 'Serve',
    icon: HeartHandshake,
    front: 'Did you help someone?',
    example: 'Small as offering advice, big as volunteering at a shelter.',
    back: "Move the focus off yourself and give something to someone else. Helping reliably lifts the helper too, and it works best when you're not keeping score.",
    image: null,
  },
  {
    id: 'duty',
    section: 'character',
    name: 'Duty',
    icon: ShieldCheck,
    front: 'Did you do what you ought to?',
    example: 'Small as calling someone who needs to hear from you, big as finishing the work you’re responsible for.',
    back: 'The thing you may not have wanted to do but should have.',
    image: null,
  },
  {
    id: 'play',
    section: 'balance',
    name: 'Play',
    icon: PartyPopper,
    front: 'Did you do something for the joy of it?',
    example: 'Small as a board game, big as a full-contact sport.',
    back: 'Something without a rigid framework, with freedom and flow and no point beyond itself. The moment you make it useful, it stops working.',
    image: null,
  },
  {
    id: 'rest',
    section: 'balance',
    name: 'Rest',
    icon: Feather,
    front: 'Did you let yourself slow down?',
    example: 'Small as a brief stop before the next task, big as a lie-down or meditation.',
    back: "Different from sleep. Pauses through the day to recover. It isn't the reward you earn after being productive.",
    image: null,
  },
  {
    id: 'moderation',
    section: 'balance',
    name: 'Moderation',
    icon: Scale,
    front: 'Did you keep the good things in check?',
    example: 'Small as scrolling too long, big as a full binge.',
    back: 'Enjoying temptations is fine. The overdoing is what drains you, and you usually only see it in hindsight.',
    image: null,
  },
  {
    id: 'socialise',
    section: 'human',
    name: 'Socialise',
    icon: MessageCircle,
    front: 'Did you talk with someone?',
    example: 'Small as a chat with the barista, big as a deep conversation with your partner.',
    back: "We're social creatures, introverts and extroverts alike, and connection is some of the richest fuel there is.",
    image: null,
  },
  {
    id: 'learn',
    section: 'human',
    name: 'Learn',
    icon: BookOpen,
    front: 'Did you further your understanding?',
    example: 'Small as working on your garden, big as studying for a new career.',
    back: 'Getting slightly better at something feeds a need most days ignore.',
    image: null,
  },
  {
    id: 'savour',
    section: 'human',
    name: 'Savour',
    icon: Sparkle,
    front: 'Were you present for a good moment?',
    example: 'Small as really listening to a song, big as telling someone how much they matter while you’re with them.',
    back: 'Noticing a moment as it happens instead of only remembering it later. Attention is what turns an ordinary moment into one you actually had.',
    image: null,
  },
]

export function itemColor(itemId) {
  const item = ITEMS.find((i) => i.id === itemId)
  return item ? SECTION_BY_ID[item.section].color : '#8fae7c'
}
