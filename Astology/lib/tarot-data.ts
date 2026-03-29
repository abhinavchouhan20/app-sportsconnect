export type TarotDeckId =
  | "rider-waite"
  | "thoth"
  | "osho-zen"
  | "lenormand"
  | "angel-oracle"
  | "vedic-tarot";

export type TarotSpreadId =
  | "single"
  | "three"
  | "yes-no"
  | "celtic-cross"
  | "relationship"
  | "career-finance"
  | "year-ahead"
  | "chakra"
  | "shadow-work"
  | "new-moon"
  | "full-moon"
  | "eclipse";

export type TarotCard = {
  id: string;
  name: string;
  number: number | null;
  arcana: "major" | "minor" | "oracle";
  suit: string | null;
  keywords_upright: string[];
  keywords_reversed: string[];
  meaning_upright: string;
  meaning_reversed: string;
  love_meaning: string;
  career_meaning: string;
  finance_meaning: string;
  health_meaning: string;
  spiritual_meaning: string;
  yes_or_no: "Yes" | "No" | "Maybe";
  element: string;
  planet: string;
  zodiac: string;
  numerology: number | null;
  image_url: string;
};

export type TarotReadingCard = {
  id: string;
  name: string;
  arcana: TarotCard["arcana"];
  suit: string | null;
  keywords: string[];
  orientation: "upright" | "reversed";
  positionLabel: string;
  imageUrl: string;
  element: string;
  planet: string;
  zodiac: string;
  numerology: number | null;
};

export type TarotReading = {
  id: string;
  deckId: TarotDeckId;
  deckLabel: string;
  spreadId: TarotSpreadId;
  spreadLabel: string;
  question: string;
  createdAt: string;
  acknowledgement: string;
  cards: TarotReadingCard[];
  cardReadings: Array<{ positionLabel: string; insight: string }>;
  narrative: string;
  guidance: string[];
  affirmation: string;
  provider: "openai" | "fallback";
  crossInsights: {
    kundli: string;
    numerology: string;
  };
  notes?: string;
};

export const tarotDecks: Array<{
  id: TarotDeckId;
  label: string;
  description: string;
  cardCount: number;
  flavor: string;
}> = [
  {
    id: "rider-waite",
    label: "Rider-Waite Tarot",
    description: "Classic symbolism and the default 78-card tarot language.",
    cardCount: 78,
    flavor: "traditional symbolic tarot"
  },
  {
    id: "thoth",
    label: "Thoth Tarot",
    description: "A denser, more esoteric lens for advanced users.",
    cardCount: 78,
    flavor: "occult, elemental, and ceremonial emphasis"
  },
  {
    id: "osho-zen",
    label: "Osho Zen Tarot",
    description: "Meditative, psychological, and present-moment oriented.",
    cardCount: 78,
    flavor: "Jungian, introspective, and mindfulness-based emphasis"
  },
  {
    id: "lenormand",
    label: "Lenormand Oracle",
    description: "Direct, practical oracle language with concise symbolism.",
    cardCount: 36,
    flavor: "practical, predictive, and literal card reading"
  },
  {
    id: "angel-oracle",
    label: "Angel Oracle Cards",
    description: "Gentle spiritual guidance with soothing affirmational energy.",
    cardCount: 24,
    flavor: "comforting, protective, and heart-led guidance"
  },
  {
    id: "vedic-tarot",
    label: "Vedic Tarot",
    description: "A branded karmic lens that blends tarot archetypes with dharma language.",
    cardCount: 78,
    flavor: "karmic, dharmic, and astrology-aware tarot interpretation"
  }
];

export const tarotSpreads: Record<
  TarotSpreadId,
  {
    id: TarotSpreadId;
    label: string;
    description: string;
    positions: string[];
    free: boolean;
    variants: Array<{ id: string; label: string; positions: string[] }>;
  }
> = {
  single: {
    id: "single",
    label: "Single Card Pull",
    description: "One focused card for daily guidance, quick clarity, or a specific question.",
    positions: ["Guidance"],
    free: true,
    variants: []
  },
  three: {
    id: "three",
    label: "3-Card Spread",
    description: "A short story arc for past-present-future or action-based questions.",
    positions: ["Past", "Present", "Future"],
    free: true,
    variants: [
      { id: "past-present-future", label: "Past • Present • Future", positions: ["Past", "Present", "Future"] },
      { id: "situation-action-outcome", label: "Situation • Action • Outcome", positions: ["Situation", "Action", "Outcome"] },
      { id: "mind-body-spirit", label: "Mind • Body • Spirit", positions: ["Mind", "Body", "Spirit"] },
      { id: "you-other-relationship", label: "You • Other Person • Relationship", positions: ["You", "Other Person", "Relationship"] },
      { id: "option-option-choice", label: "Option 1 • Option 2 • Which to Choose", positions: ["Option 1", "Option 2", "Which to Choose"] }
    ]
  },
  "yes-no": {
    id: "yes-no",
    label: "Yes / No Spread",
    description: "Three concise cards for a binary decision.",
    positions: ["Signal One", "Signal Two", "Final Lean"],
    free: true,
    variants: []
  },
  "celtic-cross": {
    id: "celtic-cross",
    label: "Celtic Cross",
    description: "Ten cards for a full-spectrum reading.",
    positions: [
      "Present situation",
      "Challenge",
      "Subconscious influences",
      "Recent past",
      "Potential",
      "Near future",
      "Your approach",
      "Environment",
      "Hopes and fears",
      "Final outcome"
    ],
    free: false,
    variants: []
  },
  relationship: {
    id: "relationship",
    label: "Relationship Spread",
    description: "Seven cards to understand chemistry, friction, and shared potential.",
    positions: [
      "You",
      "Other Person",
      "Connection",
      "What you bring",
      "What they bring",
      "The challenge",
      "Future together"
    ],
    free: false,
    variants: []
  },
  "career-finance": {
    id: "career-finance",
    label: "Career & Finance Spread",
    description: "Six cards for work, money, opportunity, and the next best move.",
    positions: [
      "Current career energy",
      "Hidden opportunity",
      "Obstacle",
      "Natural talent",
      "Financial outlook",
      "Best action"
    ],
    free: false,
    variants: []
  },
  "year-ahead": {
    id: "year-ahead",
    label: "Year Ahead Spread",
    description: "Twelve monthly cards plus one overview card.",
    positions: ["Overview", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    free: false,
    variants: []
  },
  chakra: {
    id: "chakra",
    label: "Chakra Spread",
    description: "Seven cards to scan energy centers, blockages, and healing work.",
    positions: ["Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"],
    free: false,
    variants: []
  },
  "shadow-work": {
    id: "shadow-work",
    label: "Shadow Work Spread",
    description: "Five cards for deep psychological and spiritual healing.",
    positions: ["Hidden truth", "Defense pattern", "The wound", "Medicine", "Integration"],
    free: false,
    variants: []
  },
  "new-moon": {
    id: "new-moon",
    label: "New Moon Spread",
    description: "Three cards for intention setting at the new moon.",
    positions: ["What to call in", "What to nurture", "What to trust"],
    free: true,
    variants: []
  },
  "full-moon": {
    id: "full-moon",
    label: "Full Moon Spread",
    description: "Five cards for release, revelation, and completion.",
    positions: ["What is peaking", "What to release", "What is being shown", "What wants closure", "What supports healing"],
    free: false,
    variants: []
  },
  eclipse: {
    id: "eclipse",
    label: "Eclipse Spread",
    description: "Seven cards for transformation and karmic turning points.",
    positions: ["Shock", "Truth", "What is ending", "What is emerging", "What to surrender", "What to protect", "Transformation path"],
    free: false,
    variants: []
  }
};

const majorArcana: TarotCard[] = [
  createMajor("major_00", "The Fool", 0, ["beginnings", "innocence", "spontaneity", "free spirit"], ["recklessness", "naivety", "poor timing"], "A fresh threshold opens in front of you, and The Fool asks for trust, curiosity, and the courage to move without needing every answer in advance. It is the card of soul-led beginnings, inspired leaps, and life renewing itself through faith.", "When reversed, The Fool warns that freedom can become avoidance if you leap without awareness. It asks you to slow down, respect consequences, and choose openness without abandoning discernment.", "In love, The Fool points to new romantic energy, emotional freshness, or a reset in how you approach intimacy.", "In career, this card favors experiments, fresh roles, and brave but thoughtful starts.", "In finances, it supports new directions but asks you not to confuse optimism with carelessness.", "For health, it points to restoring lightness, movement, and a beginner's mind toward healing habits.", "Spiritually, The Fool is the sacred traveler learning by experience rather than control.", "Yes", "Air", "Uranus", "Aquarius"),
  createMajor("major_01", "The Magician", 1, ["manifestation", "skill", "resourcefulness", "willpower"], ["manipulation", "scattered power", "unused gifts"], "The Magician says you have more agency than you think. Talent, focus, and intention can align now, turning ideas into tangible outcomes when you commit to a clear aim.", "Reversed, this card warns of mixed motives, fractured concentration, or power leaking through distraction. It asks you to gather your energy and act from integrity.", "In love, The Magician favors honest initiative and clear communication.", "In career, it highlights timing, persuasion, and the ability to make ideas visible.", "In money, it favors strategic action and using what you already have more skillfully.", "In health, it points to disciplined routines and responsiveness to the body's signals.", "Spiritually, this is the alchemist archetype: consciousness shaping reality through focused intention.", "Yes", "Air", "Mercury", "Gemini"),
  createMajor("major_02", "The High Priestess", 2, ["intuition", "mystery", "inner knowing", "sacred silence"], ["secrets", "blocked intuition", "avoidance"], "The High Priestess asks you to listen beneath the noise. Not every answer arrives through effort; some truths reveal themselves only when you become still enough to receive them.", "Reversed, she can suggest that intuition is being overridden by anxiety, noise, or projection. Step back, notice what feels off, and let clarity surface before forcing a move.", "In love, this card favors emotional depth, subtlety, and paying attention to what is unsaid.", "In career, it points to timing, private strategy, and quiet observation before action.", "In money, it warns against acting on incomplete information.", "In health, it supports rest, hormone and cycle awareness, and gentle inward listening.", "Spiritually, it is a doorway into sacred inner wisdom and hidden knowledge.", "Maybe", "Water", "Moon", "Cancer"),
  createMajor("major_03", "The Empress", 3, ["abundance", "nurture", "creativity", "fertility"], ["overgiving", "stagnation", "smothering"], "The Empress is the card of growth, nourishment, beauty, and embodied abundance. Something in your life wants to bloom through care, patience, and receptivity rather than pressure.", "Reversed, this card can point to depletion, over-mothering, or creative blocks caused by neglecting your own needs. Refill before you pour.", "In love, The Empress favors affection, sensuality, and emotional warmth.", "In career, it supports creative work, audience trust, and projects that grow steadily.", "In money, it can point to resources improving through sustainable effort.", "In health, it emphasizes nourishment, sleep, softness, and steady recovery.", "Spiritually, it is the sacred feminine teaching that growth comes through attunement, not force.", "Yes", "Earth", "Venus", "Taurus"),
  createMajor("major_04", "The Emperor", 4, ["structure", "stability", "leadership", "authority"], ["rigidity", "control", "power struggles"], "The Emperor brings order, responsibility, and firm foundations. This card asks you to build what lasts, lead with steadiness, and create structure strong enough to hold your next chapter.", "Reversed, The Emperor can show domination, stubbornness, or a fear of vulnerability hiding beneath control. Strength becomes wiser when it does not need to harden.", "In love, it favors commitment and reliability, but warns against emotional distance.", "In career, it supports leadership, strategy, management, and strong boundaries.", "In money, it points to careful planning and long-term security building.", "In health, it favors routine, discipline, and consistency over extreme swings.", "Spiritually, it asks you to become a grounded authority in your own life.", "Yes", "Fire", "Aries", "Aries"),
  createMajor("major_05", "The Hierophant", 5, ["tradition", "guidance", "teaching", "shared values"], ["dogma", "rebellion", "empty ritual"], "The Hierophant represents wisdom passed through lineage, structure, and sacred teaching. It can point to learning through mentors, institutions, or values that give life meaning and ethical shape.", "Reversed, it may signal that a path has become stale, performative, or too rigid for your evolution. Keep the wisdom and release the dead form.", "In love, it favors commitment, shared beliefs, and formalizing intentions.", "In career, it supports study, mentorship, credible institutions, and trusted systems.", "In money, it favors stable conventional choices over flashy experiments.", "In health, it suggests consistency and support from trusted practitioners.", "Spiritually, it speaks of initiation, sacred study, and reverence for living tradition.", "Maybe", "Earth", "Taurus", "Taurus"),
  createMajor("major_06", "The Lovers", 6, ["union", "choice", "alignment", "intimacy"], ["misalignment", "indecision", "disharmony"], "The Lovers is about more than romance. It speaks of meaningful choice, inner alignment, and the moments when desire, truth, and values must come into clear relationship with one another.", "Reversed, it can point to confusion, mixed signals, or choosing from fear instead of truth. Return to what you deeply know is right for you.", "In love, this is one of the strongest cards for connection, chemistry, and soulful choice.", "In career, it highlights value-based decisions and partnerships that matter.", "In money, it says choices now should reflect your real priorities.", "In health, it asks for balance and listening to what your body truly needs.", "Spiritually, it is the union of inner opposites and the courage to choose wholeness.", "Yes", "Air", "Gemini", "Gemini"),
  createMajor("major_07", "The Chariot", 7, ["drive", "victory", "direction", "control"], ["scattered will", "friction", "overforce"], "The Chariot is movement with purpose. It says progress comes through focus, emotional discipline, and choosing a direction firmly enough that conflicting impulses stop steering the wheel.", "Reversed, momentum may be breaking apart because too many forces are pulling at once. Reclaim direction before trying to accelerate.", "In love, it can show a relationship moving quickly or needing clearer direction.", "In career, it favors ambition, execution, and a visible push toward goals.", "In money, it rewards disciplined movement and consistency.", "In health, it speaks to stamina and aligning action with recovery rather than overpowering the body.", "Spiritually, it is mastery through alignment rather than domination.", "Yes", "Water", "Cancer", "Cancer"),
  createMajor("major_08", "Strength", 8, ["courage", "gentle power", "patience", "heart-led resilience"], ["self-doubt", "suppressed anger", "fragility"], "Strength is quiet mastery, the ability to meet intensity without becoming harsh. It favors patience, courage, emotional maturity, and the kind of inner power that calms rather than crushes.", "Reversed, you may be underestimating yourself or reacting from old fear. Strength returns when tenderness and confidence work together.", "In love, it favors kindness, emotional regulation, and a deepening bond built through trust.", "In career, it supports staying steady under pressure and leading without ego.", "In money, it favors calm discipline over reactive choices.", "In health, it suggests slow recovery, nervous system regulation, and sustainable resilience.", "Spiritually, this is power integrated with compassion.", "Yes", "Fire", "Sun", "Leo"),
  createMajor("major_09", "The Hermit", 9, ["reflection", "solitude", "inner guidance", "wisdom"], ["isolation", "withdrawal", "avoidance"], "The Hermit calls you inward so that true guidance can become audible again. This is a card of reflection, spiritual intelligence, and stepping back long enough to see what really matters.", "Reversed, solitude may be tipping into disconnection or avoidance. Seek space for clarity without sealing yourself away from life.", "In love, it can mean a pause, healing season, or deeper honesty about what you truly need.", "In career, it supports mastery, study, and thoughtful long-term refinement.", "In money, it favors restraint, reflection, and conscious priorities.", "In health, it encourages rest, contemplation, and slower restorative rhythms.", "Spiritually, it is the lantern of inner truth lighting the path ahead.", "Maybe", "Earth", "Virgo", "Virgo"),
  createMajor("major_10", "Wheel of Fortune", 10, ["cycles", "turning point", "timing", "fate"], ["delays", "resistance to change", "off-cycle"], "The Wheel of Fortune marks a shift in the pattern. Something is moving, often beyond your total control, and your task is to respond wisely to the timing rather than trying to freeze the cycle in place.", "Reversed, change may feel stalled or chaotic because you are fighting a necessary turn. Adaptation becomes the doorway back into flow.", "In love, it can signal change of status, new timing, or a relationship entering a new phase.", "In career, it points to changing cycles, luck, and strategic timing.", "In money, it says finances may fluctuate, so flexibility matters.", "In health, it reminds you that healing often moves in cycles rather than straight lines.", "Spiritually, it teaches surrender to rhythm without giving away responsibility.", "Maybe", "Fire", "Jupiter", "Sagittarius"),
  createMajor("major_11", "Justice", 11, ["truth", "clarity", "accountability", "fairness"], ["bias", "avoidance", "imbalance"], "Justice asks for truth, cause and effect, and clean alignment between action and consequence. It is a card of sober clarity, wise discernment, and decisions made with both mind and conscience awake.", "Reversed, denial or imbalance may be distorting the picture. Face the facts directly, and let fairness begin with your own honesty.", "In love, it supports clear communication, balanced reciprocity, and truth-telling.", "In career, it favors contracts, decisions, and consequences landing clearly.", "In money, it rewards transparency, order, and responsible planning.", "In health, it emphasizes balance, measurable progress, and grounded decisions.", "Spiritually, Justice is karma made conscious and chosen rather than merely endured.", "Yes", "Air", "Venus", "Libra"),
  createMajor("major_12", "The Hanged Man", 12, ["pause", "surrender", "new perspective", "sacrifice"], ["stagnation", "martyrdom", "resistance"], "The Hanged Man suspends normal momentum so you can see differently. It is a card of sacred pause, perspective shift, and surrendering the need to force what must first be understood.", "Reversed, you may be stuck in a loop of delay without receiving the lesson. If the pause has meaning, listen; if it has become avoidance, move.", "In love, it may show waiting, re-evaluation, or learning to let the connection breathe.", "In career, it suggests strategic pause and a new angle before the next move.", "In money, it warns against forcing a financial decision too early.", "In health, it supports slowing down and honoring the body's request for stillness.", "Spiritually, it is the wisdom that arrives when ego stops grasping.", "Maybe", "Water", "Neptune", "Pisces"),
  createMajor("major_13", "Death", 13, ["transformation", "release", "endings", "rebirth"], ["resistance", "clinging", "stalled change"], "Death is the card of powerful transformation, the clearing away of what can no longer continue in its old form. It does not predict literal death here; it points to renewal through release, endings that create life, and the dignity of letting a chapter complete.", "Reversed, change may be delayed because something is being held far past its season. The medicine is not fear, but trust in necessary evolution.", "In love, it can show a relationship transforming, a dynamic ending, or a more honest phase beginning.", "In career, it often marks a role, identity, or ambition shifting significantly.", "In money, it points to restructuring, cleanup, or a new phase of material priorities.", "In health, it suggests detoxifying patterns and shedding what is draining vitality.", "Spiritually, Death is ego-shedding and rebirth into truer form.", "Maybe", "Water", "Pluto", "Scorpio"),
  createMajor("major_14", "Temperance", 14, ["balance", "alchemy", "integration", "healing"], ["excess", "impatience", "imbalance"], "Temperance blends opposites into something wiser, calmer, and more sustainable. It favors healing, moderation, integration, and choosing the middle way where timing and grace can work together.", "Reversed, life may be swinging between extremes. Return to rhythm, repair, and the small adjustments that make harmony possible again.", "In love, it favors patience, mutual effort, and emotional maturity.", "In career, it supports measured progress and strong collaboration.", "In money, it encourages sustainable decisions and avoiding extremes.", "In health, it is one of the strongest cards for restoration through balance.", "Spiritually, it is the alchemy of becoming whole through integration.", "Yes", "Fire", "Jupiter", "Sagittarius"),
  createMajor("major_15", "The Devil", 15, ["attachment", "desire", "shadow", "temptation"], ["liberation", "awareness", "breaking patterns"], "The Devil reveals what binds through fear, compulsion, attachment, or seduction. Its gift is not shame, but awareness: once the chain is seen clearly, it can be loosened consciously.", "Reversed, you may be beginning to step out of an unhealthy pattern or reclaim power from something that had too much control. The turning point begins with honest recognition.", "In love, it can show obsession, chemistry without balance, or repeating attachment patterns.", "In career, it warns against burnout, politics, or being trapped by status hunger.", "In money, it asks you to watch debt, compulsive spending, or scarcity-driven decisions.", "In health, it points to habits that need to be brought into the light.", "Spiritually, it is shadow work: freedom through truth.", "No", "Earth", "Saturn", "Capricorn"),
  createMajor("major_16", "The Tower", 16, ["revelation", "disruption", "awakening", "necessary change"], ["avoided truth", "slow crumble", "resisted liberation"], "The Tower is not doom; it is truth arriving with enough force to break what was unsustainable. It can feel sudden, but its deeper purpose is liberation, clearing false structures so something truer can stand in their place.", "Reversed, the shaking may be more internal or prolonged because change is being delayed. What falls away was not secure enough to carry your next chapter.", "In love, it can show a truth breaking through, ending denial, or transforming the relationship dramatically.", "In career, it may mark a sharp shift, restructuring, or a wake-up call about what is no longer aligned.", "In money, it warns against unstable foundations and invites honest rebuilding.", "In health, it calls for listening now rather than waiting for the body to force change.", "Spiritually, it is awakening through radical honesty and surrender.", "Maybe", "Fire", "Mars", "Aries"),
  createMajor("major_17", "The Star", 17, ["hope", "healing", "renewal", "guidance"], ["discouragement", "disconnection", "dim faith"], "The Star brings calm after upheaval, hope after strain, and a quiet remembering that your path is still lit. It is a card of healing, trust, and becoming receptive to grace again.", "Reversed, hope may feel faint, but it is not gone. Reconnect gently to what restores your faith rather than demanding instant certainty.", "In love, The Star favors honesty, renewal, and softening after hurt.", "In career, it supports vision, audience trust, and long-range inspiration.", "In money, it suggests steady recovery and faith-backed planning.", "In health, it is a beautiful sign of restoration and emotional healing.", "Spiritually, it is the soul remembering its light.", "Yes", "Air", "Uranus", "Aquarius"),
  createMajor("major_18", "The Moon", 18, ["intuition", "dreams", "ambiguity", "subconscious"], ["confusion lifting", "clarity emerging", "anxiety"], "The Moon moves through uncertainty, dreams, instincts, and hidden emotional terrain. It asks you to respect intuition without mistaking every fear for truth, and to move gently while clarity is still forming.", "Reversed, confusion can begin to clear or hidden material may finally surface. What was foggy is becoming more visible, even if it feels tender at first.", "In love, it points to emotional complexity, projection, or deep intuitive bonds needing honesty.", "In career, it warns against acting on incomplete information or mixed signals.", "In money, it asks caution with unclear details and emotionally driven decisions.", "In health, it highlights sleep, hormones, stress, and nervous system sensitivity.", "Spiritually, it opens the dream world and the deeper subconscious mind.", "Maybe", "Water", "Moon", "Pisces"),
  createMajor("major_19", "The Sun", 19, ["joy", "clarity", "vitality", "success"], ["ego glare", "burnout", "delayed joy"], "The Sun illuminates, energizes, and clarifies. It is one of the most affirmative cards in the deck, bringing visibility, honest joy, confidence, and the courage to be fully present in your life.", "Reversed, the light is still present but may be filtered by fatigue, pressure, or self-doubt. Reconnect to what is simple, nourishing, and real.", "In love, it favors warmth, openness, play, and honest affection.", "In career, it supports recognition, confidence, and visible progress.", "In money, it often reflects healthy momentum and clearer financial sightlines.", "In health, it points to vitality, recovery, and life force returning.", "Spiritually, it is illumination that restores trust in life.", "Yes", "Fire", "Sun", "Leo"),
  createMajor("major_20", "Judgement", 20, ["awakening", "calling", "reckoning", "renewal"], ["self-judgment", "avoidance", "delayed answer"], "Judgement is the call to rise into truer alignment. It brings reckoning, forgiveness, honest evaluation, and the chance to answer a deeper calling with maturity and courage.", "Reversed, this card may show fear of being seen clearly or difficulty releasing the past. Healing begins when honest review leads to movement, not shame.", "In love, it can mark a second chance, a truth-telling, or a decisive shift in direction.", "In career, it points to vocation, visibility, and answering a larger purpose.", "In money, it asks for review, cleanup, and a more conscious future path.", "In health, it favors listening to wake-up calls early and compassionately.", "Spiritually, it is the soul answering its summons.", "Yes", "Fire", "Pluto", "Scorpio"),
  createMajor("major_21", "The World", 21, ["completion", "integration", "fulfillment", "wholeness"], ["unfinished chapter", "delay", "incomplete closure"], "The World marks completion, coherence, and a cycle coming fully into itself. It is success with perspective, closure with maturity, and the sense that your effort has brought you into a wider, more integrated identity.", "Reversed, something may be almost complete but not yet sealed. Honor the final steps, because closure is part of the blessing.", "In love, it can show lasting integration, mature union, or a relationship reaching a meaningful milestone.", "In career, it favors completion, recognition, and entering a larger arena.", "In money, it reflects stability created through long effort and wiser choices.", "In health, it suggests integration and a more complete sense of wellbeing.", "Spiritually, it is the mandala completed and embodied.", "Yes", "Earth", "Saturn", "Capricorn")
];

const suitMeta = {
  Wands: { element: "Fire", planet: "Mars", zodiac: "Leo", theme: "passion, action, purpose, and creativity" },
  Cups: { element: "Water", planet: "Moon", zodiac: "Cancer", theme: "emotion, love, intuition, and receptivity" },
  Swords: { element: "Air", planet: "Mercury", zodiac: "Libra", theme: "mind, truth, conflict, and clarity" },
  Pentacles: { element: "Earth", planet: "Venus", zodiac: "Taurus", theme: "money, work, resources, and grounded life" }
} as const;

const rankMeta = [
  { name: "Ace", number: 1, yesNo: "Yes" as const, upright: ["spark", "opportunity", "seed"], reversed: ["delay", "hesitation", "misfire"] },
  { name: "Two", number: 2, yesNo: "Maybe" as const, upright: ["choice", "balance", "partnership"], reversed: ["imbalance", "stalemate", "hesitation"] },
  { name: "Three", number: 3, yesNo: "Yes" as const, upright: ["growth", "expression", "momentum"], reversed: ["scattered effort", "delay", "misalignment"] },
  { name: "Four", number: 4, yesNo: "Maybe" as const, upright: ["stability", "structure", "foundation"], reversed: ["stagnation", "rigidity", "discomfort"] },
  { name: "Five", number: 5, yesNo: "No" as const, upright: ["change", "conflict", "tension"], reversed: ["repair", "release", "de-escalation"] },
  { name: "Six", number: 6, yesNo: "Yes" as const, upright: ["support", "movement", "restoration"], reversed: ["imbalance", "delay", "unfinished exchange"] },
  { name: "Seven", number: 7, yesNo: "Maybe" as const, upright: ["challenge", "strategy", "inner test"], reversed: ["fatigue", "doubt", "retreat"] },
  { name: "Eight", number: 8, yesNo: "Yes" as const, upright: ["skill", "flow", "power"], reversed: ["block", "pressure", "slow progress"] },
  { name: "Nine", number: 9, yesNo: "Maybe" as const, upright: ["intensity", "culmination", "threshold"], reversed: ["overwhelm", "drain", "release needed"] },
  { name: "Ten", number: 10, yesNo: "Maybe" as const, upright: ["completion", "burden", "full cycle"], reversed: ["collapse", "reset", "letting go"] },
  { name: "Page", number: 11, yesNo: "Yes" as const, upright: ["message", "learning", "curiosity"], reversed: ["immaturity", "mixed message", "restlessness"] },
  { name: "Knight", number: 12, yesNo: "Yes" as const, upright: ["movement", "drive", "quest"], reversed: ["rush", "friction", "misdirected force"] },
  { name: "Queen", number: 13, yesNo: "Yes" as const, upright: ["maturity", "magnetism", "mastery"], reversed: ["emotional skew", "shadow mastery", "overcontrol"] },
  { name: "King", number: 14, yesNo: "Yes" as const, upright: ["command", "vision", "embodied authority"], reversed: ["ego", "imbalance", "rigid rule"] }
];

const lenormandNames = [
  "Rider", "Clover", "Ship", "House", "Tree", "Clouds", "Snake", "Coffin", "Bouquet", "Scythe", "Whip", "Birds",
  "Child", "Fox", "Bear", "Stars", "Stork", "Dog", "Tower", "Garden", "Mountain", "Crossroads", "Mice", "Heart",
  "Ring", "Book", "Letter", "Man", "Woman", "Lily", "Sun", "Moon", "Key", "Fish", "Anchor", "Cross"
];

const angelNames = [
  "Protection", "Grace", "Healing", "Divine Timing", "Trust", "Clarity", "Peace", "Miracles", "Forgiveness", "Abundance",
  "Courage", "Release", "Blessings", "Harmony", "Guidance", "Faith", "Joy", "Patience", "Surrender", "Renewal",
  "Boundaries", "Inner Child", "Calling", "Compassion"
];

const riderMinorArcana = Object.entries(suitMeta).flatMap(([suit, meta]) =>
  rankMeta.map((rank, index) => ({
    id: `${suit.toLowerCase()}_${rank.name.toLowerCase()}`,
    name: `${rank.name} of ${suit}`,
    number: rank.number,
    arcana: "minor" as const,
    suit,
    keywords_upright: [...rank.upright, ...meta.theme.split(", ").slice(0, 2)],
    keywords_reversed: [...rank.reversed, "course correction"],
    meaning_upright: `The ${rank.name} of ${suit} channels ${meta.theme}. Upright, it highlights ${rank.upright.join(", ")}, asking you to work with this energy consciously and constructively.`,
    meaning_reversed: `Reversed, the ${rank.name} of ${suit} can show ${rank.reversed.join(", ")}. Its lesson is to rebalance the ${meta.theme} dimension of life before pushing harder.`,
    love_meaning: `In love, the ${rank.name} of ${suit} brings ${meta.theme}, shaping intimacy through this element's style.`,
    career_meaning: `In career, the ${rank.name} of ${suit} points to ${meta.theme} becoming central to your work decisions.`,
    finance_meaning: `Financially, this card suggests that ${meta.theme} influences how resources are gained, held, or redirected.`,
    health_meaning: `For health, the ${rank.name} of ${suit} asks you to notice how ${meta.theme} is affecting your energy and habits.`,
    spiritual_meaning: `Spiritually, this card teaches mastery through the ${meta.element.toLowerCase()} element and its lessons.`,
    yes_or_no: rank.yesNo,
    element: meta.element,
    planet: meta.planet,
    zodiac: meta.zodiac,
    numerology: index + 1,
    image_url: `/tarot/${suit.toLowerCase()}-${rank.name.toLowerCase()}.png`
  }))
);

const lenormandCards: TarotCard[] = lenormandNames.map((name, index) => ({
  id: `lenormand_${index + 1}`,
  name,
  number: index + 1,
  arcana: "oracle",
  suit: null,
  keywords_upright: [name.toLowerCase(), "signal", "message"],
  keywords_reversed: ["delay", "twist", "indirect path"],
  meaning_upright: `${name} brings a direct message and practical symbolism. In Lenormand style, this card is read concretely and in combination with the surrounding cards.`,
  meaning_reversed: `Reversed, ${name} suggests delay, inversion, or complication around the card's usual message.`,
  love_meaning: `${name} frames relationship themes in a direct and situational way.`,
  career_meaning: `${name} shows practical movement in work and decision making.`,
  finance_meaning: `${name} points to concrete shifts in money and material outcomes.`,
  health_meaning: `${name} asks for grounded attention to the body's signals and routines.`,
  spiritual_meaning: `${name} brings straightforward symbolic instruction rather than abstract mysticism.`,
  yes_or_no: ["Coffin", "Scythe", "Mice", "Cross", "Clouds", "Mountain"].includes(name) ? "No" : ["Sun", "Stars", "Heart", "Ring", "Key", "Bouquet"].includes(name) ? "Yes" : "Maybe",
  element: "Earth",
  planet: "Mercury",
  zodiac: "Virgo",
  numerology: index + 1,
  image_url: `/tarot/lenormand-${index + 1}.png`
}));

const angelCards: TarotCard[] = angelNames.map((name, index) => ({
  id: `angel_${index + 1}`,
  name,
  number: index + 1,
  arcana: "oracle",
  suit: null,
  keywords_upright: [name.toLowerCase(), "blessing", "guidance"],
  keywords_reversed: ["doubt", "disconnect", "blocked message"],
  meaning_upright: `${name} arrives as a soft but clear encouragement. This card guides through reassurance, heart-centered truth, and loving perspective.`,
  meaning_reversed: `Reversed, ${name} suggests that comfort is available but not fully landing because fear, fatigue, or resistance is getting in the way.`,
  love_meaning: `${name} asks you to lead your relationships with tenderness and truth.`,
  career_meaning: `${name} suggests that work choices improve when they align with your inner values.`,
  finance_meaning: `${name} encourages calm, trust, and conscious stewardship around money.`,
  health_meaning: `${name} supports gentle healing and compassionate self-care.`,
  spiritual_meaning: `${name} is a reminder that you are supported even while clarity is still forming.`,
  yes_or_no: "Yes",
  element: "Light",
  planet: "Jupiter",
  zodiac: "Pisces",
  numerology: index + 1,
  image_url: `/tarot/angel-${index + 1}.png`
}));

const riderCards = [...majorArcana, ...riderMinorArcana];

export function getDeckCards(deckId: TarotDeckId) {
  switch (deckId) {
    case "lenormand":
      return lenormandCards;
    case "angel-oracle":
      return angelCards;
    default:
      return riderCards;
  }
}

export function getDeckLabel(deckId: TarotDeckId) {
  return tarotDecks.find((deck) => deck.id === deckId)?.label ?? "Tarot Deck";
}

export function getSpreadConfig(spreadId: TarotSpreadId, layoutVariant?: string) {
  const spread = tarotSpreads[spreadId];
  if (!spread) {
    return tarotSpreads.single;
  }

  if (spreadId === "three" && layoutVariant) {
    const variant = spread.variants.find((item) => item.id === layoutVariant);
    if (variant) {
      return {
        ...spread,
        label: variant.label,
        positions: variant.positions
      };
    }
  }

  return spread;
}

function createMajor(
  id: string,
  name: string,
  number: number,
  keywords_upright: string[],
  keywords_reversed: string[],
  meaning_upright: string,
  meaning_reversed: string,
  love_meaning: string,
  career_meaning: string,
  finance_meaning: string,
  health_meaning: string,
  spiritual_meaning: string,
  yes_or_no: "Yes" | "No" | "Maybe",
  element: string,
  planet: string,
  zodiac: string
): TarotCard {
  return {
    id,
    name,
    number,
    arcana: "major",
    suit: null,
    keywords_upright,
    keywords_reversed,
    meaning_upright,
    meaning_reversed,
    love_meaning,
    career_meaning,
    finance_meaning,
    health_meaning,
    spiritual_meaning,
    yes_or_no,
    element,
    planet,
    zodiac,
    numerology: number,
    image_url: `/tarot/${id}.png`
  };
}
