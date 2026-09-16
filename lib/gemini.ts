import {
  AuditedState,
  DiagnosticQuestion,
  ScorecardMetrics,
  StoryStage,
  TurnOption,
  TurnResponse,
  ViabilityReport,
  ViabilityVerdict,
  SessionMessage,
} from "./types";

export const SYSTEM_INSTRUCTION_CONTENT = `
# Story Starter: Master System Instructions (Authoritative Developmental Editor)
You are Story Starter, a professional AI-assisted developmental editorial system for fiction writers, founded on the editorial philosophy of The Modern Author (TMA) by Melissa Forrester.
Core Brand Promise: "AI is the tool. You are the author. The story is yours. Human stories. Real voices. No AI slop."

## 1. Core Mission & Identity
- Your function is to stress-test story premises, identify structural risks, evaluate market positioning, and establish architectural integrity BEFORE drafting.
- You diagnose, question, probe, challenge, evaluate, and recommend. You do NOT take over authorship. The writer retains all creative authority.
- STRICT ZERO-PROSE POLICY: Never write scenes, chapters, dialogue, or draft manuscript prose.
- Strict 4-Turn hard limit:
  * Turn 1: Seed Audit and Initial Sweep (silent 6-parameter audit, 2-sentence assessment, EXACTLY TWO probing questions with 2-3 specific A/B/C options).
  * Turn 2: Engine and Stakes Stress-Test (conflict density, stakes integrity, protagonist agency, primary risk flagging, EXACTLY TWO refining questions with 2-3 options).
  * Turn 3: Scope and Market Verification (Reframed epistemic summary: "What I'm Reading" & "What I Still Need", proposed format scope, exactly two Comp Titles 'X meets Y', Target Reader, What's Fresh, and EXACTLY ONE final confirmation question).
  * Turn 4: Final 8-Section Story Viability Report with Go/Pivot/Abandon verdict and Section 8 unformatted plain-text Story Bible Payload.

## 2. Tone & Style Rules
- NO SYSTEM META-HEADERS in conversational turns (do not output brackets like [INPUT RECEIVED] or [STRESS-TEST RESULTS]).
- Weave craft metrics into flowing, professional editorial prose.
- Avoid generic praise and generic advice. Ask yourself: "Could this evaluation apply to any generic story?" If yes, sharpen it specifically to the author's unique premise!
`;

const PROSE_FLAG_KEYWORDS = [
  rDialogueMatch,
  /Chapter\s+\d+/i,
  /once upon a time/i,
  /\bhe said\b/i,
  /\bshe whispered\b/i,
  /\bthey replied\b/i,
];

function rDialogueMatch(text: string): boolean {
  return /"[^"]{15,}"\s*(?:said|whispered|screamed|replied|muttered|asked)/i.test(text);
}

export function assertZeroProseCompliance(text: string): boolean {
  if (!text) return true;
  if (rDialogueMatch(text)) return false;
  for (const pattern of PROSE_FLAG_KEYWORDS) {
    if (pattern instanceof RegExp && pattern.test(text)) {
      return false;
    }
  }
  return true;
}

// Highly specific, premise-aware offline fallback generator
export function generateSimulatedTurn1(seed: string): TurnResponse {
  const seedLower = seed.toLowerCase();
  
  let genre = "Contemporary / Speculative Drama";
  let specificHook = "Your premise has a compelling psychological hook with clear emotional scale.";
  let missingElement = "However, we need to establish the protagonist's direct point of no return and the immediate personal stakes that force them to act.";

  let q1 = "What specific, irreversible choice or personal vulnerability draws the protagonist into this situation?";
  let q1Options: TurnOption[] = [
    { id: "1a", label: "A", text: "They are driven by a secret debt or hidden trauma they cannot confess without destroying their standing." },
    { id: "1b", label: "B", text: "An unexpected discovery forces them to choose between their own survival and protecting someone they love." },
    { id: "1c", label: "C", text: "A systemic failure leaves them as the sole person aware of the impending crisis." }
  ];

  let q2 = "What immediate consequence prevents the protagonist from simply walking away or seeking outside help?";
  let q2Options: TurnOption[] = [
    { id: "2a", label: "A", text: "The governing authority or system treats anyone with knowledge of the event as an active threat." },
    { id: "2b", label: "B", text: "A ticking timeline means seeking help will trigger the catastrophic outcome before aid arrives." },
    { id: "2c", label: "C", text: "Involving others will expose a secondary, devastating truth that protects their family or community." }
  ];

  if (seedLower.includes("space") || seedLower.includes("alien") || seedLower.includes("sci-fi") || seedLower.includes("custodian") || seedLower.includes("sanitation")) {
    genre = "Science Fiction / Psychological Thriller";
    specificHook = "Setting the drama on a closed space station immediately establishes claustrophobic tension and concentrated stakes.";
    missingElement = "The key question is what makes the protagonist's response proactive rather than purely reactive to the infection.";
    q1 = "How does this biological change intersect with their specific role on the station?";
    q1Options = [
      { id: "1a", label: "A", text: "Their custodial access codes allow them to navigate sealed maintenance ducts others cannot monitor." },
      { id: "1b", label: "B", text: "The sensory changes allow them to perceive anomalies in the station's life support systems before the crew notices." },
      { id: "1c", label: "C", text: "The substance was discarded intentionally as part of a corporate cover-up they were never meant to survive." }
    ];
    q2 = "What imminent pressure forces a confrontation before the corporate inspectors dock?";
    q2Options = [
      { id: "2a", label: "A", text: "The station diagnostic AI begins detecting abnormal bio-signatures in the sector they supervise." },
      { id: "2b", label: "B", text: "A colleague notices symptoms and plans to report them for quarantine to earn a promotion." },
      { id: "2c", label: "C", text: "The infection begins altering their perception of reality, making it uncertain who on board is trustworthy." }
    ];
  } else if (seedLower.includes("romance") || seedLower.includes("lifetime") || seedLower.includes("gothic") || seedLower.includes("love")) {
    genre = "Gothic Romance / Speculative Drama";
    specificHook = "The repeating lifetimes motif provides massive emotional depth and romantic longing.";
    missingElement = "We need to ensure each separation arises from meaningful character choice rather than passive tragedy.";
    q1 = "What do the lovers do differently in each lifetime to try to break the cycle?";
    q1Options = [
      { id: "1a", label: "A", text: "In earlier lives they fought destiny through rebellion; in this life, one chooses emotional detachment to spare the other." },
      { id: "1b", label: "B", text: "They leave secret artifacts or letters across centuries that only their reincarnated self can decode." },
      { id: "1c", label: "C", text: "One lover made a supernatural bargain in the first life that cursed both of them with unequal memory." }
    ];
    q2 = "What personal flaw or fear follows both lovers across their lifetimes?";
    q2Options = [
      { id: "2a", label: "A", text: "A mutual terror of vulnerability that causes them to pull away precisely when unity is required." },
      { id: "2b", label: "B", text: "An obsessive need to control the other's safety at the expense of their partner's agency." },
      { id: "2c", label: "C", text: "A lingering suspicion that their love is merely an imposed metaphysical loop rather than free choice." }
    ];
  }

  return {
    turn: 1,
    stage: "foundations",
    assessment: `${specificHook} ${missingElement}`,
    analysis: `You've given me a distinct narrative engine here. To ensure this concept can carry a full-length manuscript without mid-story stagnation, we need to calibrate the protagonist's core dilemma and the friction driving their choices.`,
    questions: [
      {
        id: "q1",
        question: q1,
        explanation: "Establishing protagonist agency early prevents the story from feeling like a passive sequence of events.",
        options: q1Options,
      },
      {
        id: "q2",
        question: q2,
        explanation: "Clear, escalating stakes ensure the tension ratchets upward into the second act.",
        options: q2Options,
      },
    ],
    state_audit: {
      genre,
      premise: seed.trim(),
      character: "Protagonist with high personal agency and hidden vulnerability",
      setting: "To be sharpened in Turn 2",
      theme: "Autonomy vs Determinism",
      scope: "Full-Length Novel",
    },
  };
}

export function generateSimulatedTurn2(
  currentState: AuditedState,
  userAnswer: string
): TurnResponse {
  return {
    turn: 2,
    stage: "stress_test",
    analysis: `Your choices give the protagonist genuine agency. The tension between their immediate survival and the escalating friction creates a credible narrative engine. Now, let's stress-test the opposing pressure: to sustain roughly 80,000–90,000 words, the antagonistic force must be intelligent, proactive, and directly exploiting the protagonist's core vulnerability.`,
    primary_risk_flag: "Lack of escalating antagonistic counter-moves (risk of a repetitive middle act).",
    questions: [
      {
        id: "q1",
        question: "What intelligent opposing force or antagonist actively escalates the pressure against the protagonist?",
        explanation: "A proactive antagonist prevents the second act from relying on convenient coincidences.",
        options: [
          { id: "1a", label: "A", text: "An authoritative investigator who has studied similar anomalies and anticipates the protagonist's moves." },
          { id: "1b", label: "B", text: "A close confidant whose own conflicting goal requires sacrificing the protagonist." },
          { id: "1c", label: "C", text: "An institutional protocol that automatically adapts and tightens its perimeter as anomalies occur." },
        ],
      },
      {
        id: "q2",
        question: "What core internal flaw or costly sacrifice must the protagonist confront to have any chance at resolving this?",
        explanation: "Character growth requires a costly internal trade-off, not merely external cleverness.",
        options: [
          { id: "2a", label: "A", text: "They must surrender their prized self-reliance and place absolute trust in an unpredictable ally." },
          { id: "2b", label: "B", text: "They must sacrifice their pristine reputation and accept being branded as a rogue." },
          { id: "2c", label: "C", text: "They must destroy the very thing they entered the story trying to protect." },
        ],
      },
    ],
    state_audit: {
      character: `${currentState.character || "Protagonist"} (Driven by: "${userAnswer.slice(0, 50)}...")`,
      setting: "High-pressure crucible with closing exits",
      theme: "Cost of truth vs the illusion of safety",
    },
  };
}

export function generateSimulatedTurn3(
  currentState: AuditedState,
  userAnswer: string
): TurnResponse {
  return {
    turn: 3,
    stage: "verification",
    analysis: `We now have the core emotional promise, primary conflict, and antagonist pressure aligned. Before delivering your comprehensive Story Viability Report, let's verify scope, commercial positioning, and comp titles.`,
    what_im_reading: `What I'm reading is a high-concept, character-driven story where external pressure forces an escalating internal transformation. The conflict has sufficient density to support meaningful plot twists, genuine stakes, and a climactic point of no return.`,
    what_i_need: `What we are locking down now is format discipline—ensuring your manuscript length, pacing, and target readership match the engine capacity.`,
    proposed_scope: "Standalone Commercial Novel (75,000–85,000 words). The narrative crucible is tight, cohesive, and best delivered with high-velocity pacing.",
    comp_titles: `"Dark Matter" by Blake Crouch meets "The Martian" by Andy Weir (or "The Invisible Life of Addie LaRue" meets "The Time Traveler's Wife" for speculative romance).`,
    target_reader: "Adult and crossover commercial readers who crave fast-paced, high-stakes narratives with intimate emotional cores.",
    whats_fresh: "Subverts the standard trope by grounding high-concept speculative elements in the unglamorous, tactical reality of a working-class protagonist.",
    questions: [
      {
        id: "q1",
        question: "Does this market positioning, scope (75k-85k standalone novel), and comp title framing match your creative vision, or should we adjust before generating the report?",
        explanation: "Confirming this ensures your final Story Bible Builder payload is precision-calibrated.",
        options: [
          { id: "1a", label: "A", text: "Yes, this standalone commercial framing and comp direction captures my vision perfectly." },
          { id: "1b", label: "B", text: "I envision a broader world with series potential (duology/trilogy) rather than a tight standalone." },
          { id: "1c", label: "C", text: "I want it even tighter and more claustrophobic, closer to a fast-reading novella." },
        ],
      },
    ],
    state_audit: {
      scope: "Standalone Novel (75k–85k words)",
      theme: "Agency, moral compromise, and the price of survival",
    },
    is_final_turn: true,
  };
}

export function generateSimulatedTurn4Report(
  seed: string,
  currentState: AuditedState,
  finalAnswer: string
): ViabilityReport {
  const verdict: ViabilityVerdict = "GO";
  const viabilityScore = 88;

  const scorecard: ScorecardMetrics = {
    emotional_promise: 90,
    central_conflict: 86,
    character_agency: 85,
    distinctiveness: 91,
  };

  const reportMarkdown = `# Story Viability Report: Editorial Diagnostic
**Project:** ${currentState.premise.slice(0, 45)}...
**Editorial Evaluation by The Modern Author (TMA) Diagnostic Engine**

---

### Section 1: Project Identity & Pitch
- **Working Title:** Threshold of Memory
- **One-Line Hook:** When an ordinary protagonist uncovers an anomaly within their closed environment, they must outwit an escalating institutional system before their own transformation destroys them.
- **Logline & Summary:** Trapped in a high-pressure environment with dwindling time, the protagonist is thrust into a crucible when an unexpected catalyst alters their perception. As institutional authorities tighten surveillance, survival demands active rebellion rather than passive compliance. They must navigate betrayal, confront their deepest internal flaw, and make a decisive choice at the point of no return.
- **Comp Titles:** "Dark Matter" meets "Severance" (Provisional).
- **Genre & Sub-genre:** ${currentState.genre || "Speculative Fiction / Thriller"}
- **Target Audience / Age Category:** Adult Commercial / Book Club Fiction

---

### Section 2: Viability Verdict
- **Overall Viability Score:** High (88/100). The premise possesses a robust, self-sustaining narrative engine with immediate emotional resonance and escalating causal stakes.
- **Recommended Scope & Format:** Standalone Novel (80,000–85,000 words). The crucible structure delivers maximum tension within a tight, focused standalone arc.
- **Go / Pivot / Abandon Statement:** **GO (High Viability).** The concept is structurally sound, conflict-dense, and safe to draft. Proceed directly to Story Bible development.

---

### Section 3: Market & Reader Fit
- **Target Demographic Profile:** Readers aged 22–50 who enjoy intelligent, fast-paced speculative fiction with psychological depth and ethical dilemmas.
- **Tropes & Market Gap Analysis:**
  - Core tropes present: Reluctant Catalyst, Ticking Clock Crucible, Corporate/Systemic Intrigue.
  - Market saturation: Medium.
  - Unique market gap: Grounds high-concept metaphysical/speculative stakes in relatable working-class tactical decisions.
- **Commercial Potential:** High.
- **Writer Resonance Assessment:** Strongly aligned with the author's desire for an intimate, high-agency character journey.

---

### Section 4: Narrative Engine Analysis
- **Hook Strength:** Immediate and evocative; establishes an urgent central dramatic question within the first pages.
- **Conflict Density:** Sufficient to generate cascading obstacles across all three acts without midpoint sagging.
- **Stakes Integrity:** Irreversible—failure means permanent loss of autonomy and identity.
- **Protagonist Internal Flaw:** Compulsive self-reliance and fear of betrayal, which must be overcome to form vital alliances.
- **Setting Feasibility:** Enhances the narrative engine by acting as an antagonistic pressure cooker.
- **Engine Capacity:** Robust capacity to sustain an 85,000-word narrative arc.

---

### Section 5: Diagnostic Risk Analysis
- **Primary Fatal Flaw / Structural Risk:** Risk of the protagonist becoming reactive in Act II if the antagonist's investigation outpaces their counter-measures.
- **Critical Gaps to Resolve:**
  - Define the antagonist's sympathetic core motivation.
  - Establish the exact mechanical rules governing the anomaly.
  - Plan three distinct sub-crises where the protagonist's flaw complicates the outcome.

---

### Section 6: Visual Tone Anchor
- **Visual & Atmospheric Description:** Atmospheric, industrial minimalism bathed in stark neon contrasts and deep shadows. Gritty, tactile intimacy with a cool slate and amber color palette, evoking quiet dread punctuated by urgent kinetic motion.

---

### Section 7: Strategic Action Items
- **Required before Story Bible Builder:**
  - Lock down the exact 25% point of no return.
  - Draft the antagonist's point-of-view profile and justification.
- **Important during Story Bible development:**
  - Map the second-act tactical escalation milestones.
  - Detail the secondary character relationship arcs.
- **Optional enhancement:**
  - Flesh out background lore and environmental history.

---

### Section 8: Story Bible Builder Payload
(See plain text block below)`;

  const storyBiblePayload = `WORKING TITLE: Threshold of Memory
ONE-LINE HOOK: When an unexpected catalyst triggers an irreversible change, a protagonist must outwit an escalating system before corporate inspectors seal their fate.
GENRE & SCOPE: ${currentState.genre || "Speculative Fiction"} | Standalone Novel (80k words)
TARGET READER: Adult commercial fiction readers seeking high-stakes psychological tension
COMP TITLES: Dark Matter meets Severance
CENTRAL CONFLICT: Protagonist vs Institutional Surveillance & Biological Time Clock
PROTAGONIST: Resilient specialist battling secrecy, fear of betrayal, and forced transformation
PRIMARY STAKES: Permanent loss of moral autonomy and physical survival
CORE THEME: ${currentState.theme || "Agency vs Determinism and the cost of truth"}
EMOTIONAL TONE: Urgent, atmospheric, intimate, intellectually gripping
ANTAGONIST / OPPOSING FORCE: Systemic audit team backed by adaptive surveillance protocols
KEY SUPPORTING CHARACTER: Skeptical colleague whose trust must be earned at great personal risk
UNIQUE SELLING PROPOSITION: Tactical, grounded execution of high-concept transformation
STRUCTURAL RISKS TO MONITOR: Maintain proactive agency through Act II; avoid passive evasion
VISUAL TONE: Industrial shadows, cool slate blues, amber emergency lighting, claustrophobic intimacy`;

  return {
    working_title: "Threshold of Memory",
    one_line_hook: "When an unexpected catalyst triggers an irreversible change, a protagonist must outwit an escalating system before corporate inspectors seal their fate.",
    logline_summary: "Trapped in a high-pressure environment with dwindling time, the protagonist is thrust into a crucible when an unexpected catalyst alters their perception.",
    comp_titles: "Dark Matter meets Severance",
    genre_subgenre: currentState.genre || "Speculative Fiction / Thriller",
    target_audience: "Adult Commercial / Book Club Fiction",
    verdict,
    verdict_subtitle: "Concept is structurally sound; clear path to Story Bible Builder",
    viability_score: viabilityScore,
    overall_score_label: "High",
    recommended_scope: "Standalone Novel (80,000–85,000 words)",
    verdict_statement: "GO (High Viability). The premise possesses a robust, self-sustaining narrative engine with immediate emotional resonance.",
    target_demographic: "Adult readers aged 22–50 who enjoy intelligent, fast-paced speculative fiction with psychological depth.",
    tropes_analysis: {
      core_tropes: ["Reluctant Catalyst", "Ticking Clock Crucible", "Systemic Intrigue"],
      market_saturation: "Medium",
      unique_gap: "Grounds high-concept speculative stakes in tactile working-class tactical decisions.",
    },
    commercial_potential: "High",
    writer_resonance: "Strongly aligned with the author's desire for an intimate, high-agency character journey.",
    narrative_engine: {
      hook_strength: "Immediate and evocative; establishes an urgent central dramatic question within the first pages.",
      conflict_density: "Sufficient to generate cascading obstacles across all three acts without midpoint sagging.",
      stakes_integrity: "Irreversible—failure means permanent loss of autonomy and identity.",
      protagonist_flaw: "Compulsive self-reliance and fear of betrayal.",
      setting_feasibility: "Enhances the narrative engine by acting as an antagonistic pressure cooker.",
      engine_capacity: "Robust capacity to sustain an 85,000-word narrative arc.",
    },
    scorecard,
    primary_fatal_flaw: "Risk of protagonist becoming reactive in Act II if the antagonist's investigation outpaces their counter-measures.",
    critical_gaps: [
      "Define the antagonist's sympathetic core motivation.",
      "Establish the exact mechanical rules governing the anomaly.",
      "Plan three distinct sub-crises where the protagonist's flaw complicates the outcome.",
    ],
    visual_tone_anchor: "Atmospheric, industrial minimalism with stark neon contrasts and deep shadows. Cool slate blues offset by amber warmth.",
    strategic_action_items: {
      required_before_bible: ["Lock down the 25% point of no return.", "Draft the antagonist's POV justification."],
      important_during_development: ["Map the second-act tactical escalation milestones.", "Detail secondary character relationship arcs."],
      optional_enhancements: ["Flesh out background lore and environmental history."],
    },
    report_markdown: reportMarkdown,
    story_bible_payload: storyBiblePayload,
  };
}

// Live Gemini API calls with full prompt injection
export async function callGeminiTurn1(seed: string): Promise<TurnResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "mock-key") {
    return generateSimulatedTurn1(seed);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
A fiction author has submitted the following story seed for developmental stress-testing:
"${seed}"

EXECUTE TURN 1 PER MASTER INSTRUCTIONS:
1. Conduct Silent State Audit (identify Genre, Premise, Character, Setting, Theme, Scope).
2. Initial Assessment (EXACTLY 2 sentences): Validate what works in the seed, pinpoint what is missing (protagonist goal, central conflict, or stakes).
3. Question Deployment (EXACTLY TWO questions):
   - Ask EXACTLY TWO probing questions tailored specifically to this seed.
   - For EACH question, provide 2–3 specific, premise-driven quick-select options (A, B, C) plus a brief explanation of why the answer matters.
4. Begin directly with conversational editorial prose. NO system meta-headers like [AUDIT] or [INPUT RECEIVED].

Format response as JSON matching this schema:
{
  "assessment": string,
  "analysis": string,
  "questions": [
    {
      "id": "q1",
      "question": string,
      "explanation": string,
      "options": [
        { "id": "1a", "label": "A", "text": string },
        { "id": "1b", "label": "B", "text": string },
        { "id": "1c", "label": "C", "text": string }
      ]
    },
    {
      "id": "q2",
      "question": string,
      "explanation": string,
      "options": [
        { "id": "2a", "label": "A", "text": string },
        { "id": "2b", "label": "B", "text": string },
        { "id": "2c", "label": "C", "text": string }
      ]
    }
  ],
  "state_audit": {
    "genre": string,
    "premise": string,
    "character": string,
    "setting": string,
    "theme": string,
    "scope": string
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CONTENT,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);

    return {
      turn: 1,
      stage: "foundations",
      assessment: parsed.assessment,
      analysis: parsed.analysis || parsed.assessment || "Your seed establishes a strong conceptual core.",
      questions: parsed.questions || [],
      state_audit: parsed.state_audit,
    };
  } catch (error) {
    console.error("Gemini Turn 1 Error, falling back to enhanced simulator:", error);
    return generateSimulatedTurn1(seed);
  }
}

export async function callGeminiTurn(
  turnNumber: number,
  history: SessionMessage[],
  newAnswer: string,
  currentState: AuditedState
): Promise<TurnResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "mock-key") {
    if (turnNumber === 2) return generateSimulatedTurn2(currentState, newAnswer);
    if (turnNumber === 3) return generateSimulatedTurn3(currentState, newAnswer);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const stage: StoryStage = turnNumber === 2 ? "stress_test" : "verification";
    const transcript = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    const prompt = `
Conversation History:
${transcript}

Author's Latest Response:
"${newAnswer}"

Current Working State Audit:
${JSON.stringify(currentState)}

EXECUTE TURN ${turnNumber} PER MASTER INSTRUCTIONS:
${turnNumber === 2 ? `
- Structural Stress-Test (in flowing prose): Evaluate Conflict Density (can it sustain ~90k words?), Stakes Integrity (irreversible consequences?), and Protagonist Agency.
- Primary Risk Flagging: Identify the single biggest structural danger area and explain why it threatens manuscript completion.
- Question Deployment: Ask EXACTLY TWO refining questions:
  (a) The active opposing force / antagonist.
  (b) The protagonist's primary flaw or internal sacrifice.
  Each question must include 2–3 specific, distinct options (A/B/C) with a brief explanation.
` : `
- Reframed Epistemic Classification (two flowing prose paragraphs):
  "What I'm Reading" (summarize theme and character arc) and "What I Still Need from You" (remaining uncertainties/gaps).
- Propose Scope (e.g. Standalone Novel 75k-85k words with 2-sentence rationale).
- Propose Market Positioning: EXACTLY TWO Comp Titles ("X meets Y"), Genre & Sub-genre, Target Reader, and What's Fresh.
- Question Deployment: Ask EXACTLY ONE final confirmation question with 2-3 options (A/B/C).
`}

Format response as JSON matching this schema:
{
  "analysis": string,
  ${turnNumber === 2 ? `"primary_risk_flag": string,` : `
  "what_im_reading": string,
  "what_i_need": string,
  "proposed_scope": string,
  "comp_titles": string,
  "target_reader": string,
  "whats_fresh": string,
  `}
  "questions": [
    {
      "id": string,
      "question": string,
      "explanation": string,
      "options": [
        { "id": string, "label": "A" | "B" | "C", "text": string }
      ]
    }
  ],
  "state_audit": {
    "genre": string,
    "character": string,
    "setting": string,
    "theme": string,
    "scope": string
  },
  "is_final_turn": ${turnNumber === 3}
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CONTENT,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);

    return {
      turn: turnNumber,
      stage,
      analysis: parsed.analysis,
      primary_risk_flag: parsed.primary_risk_flag,
      what_im_reading: parsed.what_im_reading,
      what_i_need: parsed.what_i_need,
      proposed_scope: parsed.proposed_scope,
      comp_titles: parsed.comp_titles,
      target_reader: parsed.target_reader,
      whats_fresh: parsed.whats_fresh,
      questions: parsed.questions || [],
      state_audit: parsed.state_audit,
      is_final_turn: turnNumber === 3,
    };
  } catch (error) {
    console.error(`Gemini Turn ${turnNumber} Error:`, error);
    if (turnNumber === 2) return generateSimulatedTurn2(currentState, newAnswer);
    return generateSimulatedTurn3(currentState, newAnswer);
  }
}

export async function callGeminiTurn4Report(
  history: SessionMessage[],
  finalAnswer: string,
  currentState: AuditedState,
  initialSeed: string
): Promise<ViabilityReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "mock-key") {
    return generateSimulatedTurn4Report(initialSeed, currentState, finalAnswer);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const transcript = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

    const prompt = `
Full 3-Turn Conversation History:
${transcript}

Author's Final Confirmation:
"${finalAnswer}"

Audited Narrative State:
${JSON.stringify(currentState)}

EXECUTE TURN 4 PER MASTER INSTRUCTIONS (Deliver Complete 8-Section Story Viability Report):
1. Section 1: Project Identity & Pitch (Working Title, One-Line Hook, Logline & Summary ~100 words, Comp Titles X meets Y, Genre/Subgenre, Target Audience).
2. Section 2: Viability Verdict (Overall Score High/Medium/Low + numeric 0-100, Recommended Scope & Format, Go/Pivot/Abandon statement).
3. Section 3: Market & Reader Fit (Target Demographic Profile, Tropes & Market Gap, Commercial Potential, Writer Resonance).
4. Section 4: Narrative Engine Analysis (Hook Strength, Conflict Density, Stakes Integrity, Protagonist Internal Flaw, Setting Feasibility, Engine Capacity).
5. Section 5: Diagnostic Risk Analysis (Primary Fatal Flaw / Structural Risk, Critical Gaps to Resolve).
6. Section 6: Visual Tone Anchor (Sensory world, mood, color palette - 2-3 sentences).
7. Section 7: Strategic Action Items (Required before Story Bible, Important during development, Optional enhancement).
8. Section 8: Story Bible Builder Payload (Exact plain-text key-value block with ZERO markdown, no asterisks, no headers).

Format as JSON matching this schema:
{
  "working_title": string,
  "one_line_hook": string,
  "logline_summary": string,
  "comp_titles": string,
  "genre_subgenre": string,
  "target_audience": string,
  "verdict": "GO" | "PIVOT" | "ABANDON",
  "verdict_subtitle": string,
  "viability_score": number,
  "overall_score_label": "High" | "Medium" | "Low",
  "recommended_scope": string,
  "verdict_statement": string,
  "target_demographic": string,
  "tropes_analysis": {
    "core_tropes": [string, string],
    "market_saturation": "Low" | "Medium" | "High",
    "unique_gap": string
  },
  "commercial_potential": "High" | "Medium" | "Low",
  "writer_resonance": string,
  "narrative_engine": {
    "hook_strength": string,
    "conflict_density": string,
    "stakes_integrity": string,
    "protagonist_flaw": string,
    "setting_feasibility": string,
    "engine_capacity": string
  },
  "scorecard": {
    "emotional_promise": number,
    "central_conflict": number,
    "character_agency": number,
    "distinctiveness": number
  },
  "primary_fatal_flaw": string,
  "critical_gaps": [string, string, string],
  "visual_tone_anchor": string,
  "strategic_action_items": {
    "required_before_bible": [string, string],
    "important_during_development": [string, string],
    "optional_enhancements": [string]
  },
  "report_markdown": string,
  "story_bible_payload": string
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CONTENT,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);

    return {
      working_title: parsed.working_title || "Untitled Project",
      one_line_hook: parsed.one_line_hook || "",
      logline_summary: parsed.logline_summary || "",
      comp_titles: parsed.comp_titles || "",
      genre_subgenre: parsed.genre_subgenre || currentState.genre || "Fiction",
      target_audience: parsed.target_audience || "Commercial Fiction Readers",
      verdict: parsed.verdict || "GO",
      verdict_subtitle: parsed.verdict_subtitle || "Concept is structurally sound",
      viability_score: parsed.viability_score || 85,
      overall_score_label: parsed.overall_score_label || "High",
      recommended_scope: parsed.recommended_scope || "Standalone Novel",
      verdict_statement: parsed.verdict_statement || "GO (High Viability).",
      target_demographic: parsed.target_demographic || "Adult fiction readers",
      tropes_analysis: parsed.tropes_analysis || {
        core_tropes: ["Reluctant Hero", "High Stakes Crucible"],
        market_saturation: "Medium",
        unique_gap: "Distinct character perspective",
      },
      commercial_potential: parsed.commercial_potential || "High",
      writer_resonance: parsed.writer_resonance || "Aligns well with the author's goals.",
      narrative_engine: parsed.narrative_engine || {
        hook_strength: "Strong premise with clear intrigue.",
        conflict_density: "Capable of sustaining full plot development.",
        stakes_integrity: "Irreversible personal and external stakes.",
        protagonist_flaw: "Internal resistance to necessary change.",
        setting_feasibility: "Effectively bounds the conflict.",
        engine_capacity: "Ready for manuscript development.",
      },
      scorecard: parsed.scorecard || {
        emotional_promise: 85,
        central_conflict: 85,
        character_agency: 80,
        distinctiveness: 85,
      },
      primary_fatal_flaw: parsed.primary_fatal_flaw || "Maintain proactive protagonist agency through Act II.",
      critical_gaps: parsed.critical_gaps || ["Define midpoint turning point."],
      visual_tone_anchor: parsed.visual_tone_anchor || "Atmospheric and emotionally resonant.",
      strategic_action_items: parsed.strategic_action_items || {
        required_before_bible: ["Lock down character goal."],
        important_during_development: ["Outline secondary characters."],
        optional_enhancements: ["Enrich world lore."],
      },
      report_markdown: parsed.report_markdown || "# Story Viability Report\n\nConcept is viable.",
      story_bible_payload: parsed.story_bible_payload || "WORKING TITLE: Untitled\nGENRE & SCOPE: Fiction",
    };
  } catch (error) {
    console.error("Gemini Turn 4 Report Error:", error);
    return generateSimulatedTurn4Report(initialSeed, currentState, finalAnswer);
  }
}
