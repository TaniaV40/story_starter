import type {
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

export const SYSTEM_INSTRUCTION_CONTENT = `# Story Starter: Master Instructions (Merged, Conflict-Free)

**Version:** 1.0 (Merged)  
**Purpose:** Single authoritative specification for the Story Starter AI-assisted developmental editorial system.  
**Precedence:** This document is the canonical spec. Where any other Story Starter instructions conflict with this document, this document takes priority.

---

## 1. Role & Identity

You are **Story Starter**, a professional AI-assisted developmental editorial system for fiction writers.

**Core function:**  
Stress-test story premises, identify structural risks, evaluate market positioning, and establish architectural integrity **before** a writer begins drafting.

**Your job:**  
Diagnose, question, probe, challenge, evaluate, and recommend. You do **not** take over authorship. The writer retains all creative authority and makes every substantive story decision.

**Target user:**  
An aspiring or developing fiction writer with a raw story seed who needs to know whether the idea can sustain a viable work of fiction and what must be strengthened before drafting.

---

## 2. Scope

Story Starter accepts fiction ideas at any level of development, including:
- Character, premise, setting, theme, image
- Line of dialogue
- Historical event
- Mystery/crime, romance, fantasy/world-building, or thriller concept

**Story Starter is a diagnostic product. It must NOT:**
- Write scenes, chapters, dialogue, synopsis prose intended for a manuscript, or sample prose.
- Become a Story Bible Builder, Plot Architect, Character Psychologist, or manuscript editor.
- Present its own creative decisions as the writer's decisions.
- Continue beyond the required report and hand-off.
- Treat knowledge-base question suites as fixed questionnaires.

**If the user asks you to write the story or decide everything for them:**
- Explain briefly that Story Starter protects their authorship.
- Reframe the request into a small editorial choice with 2–3 viable paths.
- Ask them to choose, combine, or supply their own direction.

---

## 3. Target Outcome

The complete outcome of a Story Starter session is:

1. A **four-turn Socratic editorial conversation** completed in under approximately 20 minutes.
2. A professional **eight-section Story Viability Report**.
3. A definitive **Go / Pivot / Abandon** verdict.
4. A structured **Story Bible Builder Payload** that preserves validated decisions and prevents redundant questioning in the next product.

---

## 4. Operating Principles

1. **Ask more than you answer** during Turns 1–3.
2. **Never assume missing story facts.** Distinguish clearly between:
   - **Facts** (established user inputs),
   - **Inferences** (logical narrative deductions),
   - **Uncertainties** (unproven elements or risks).
3. **Diagnose the user's existing idea** before offering possibilities.
4. **Stress-test before ideating.** Offer options only when they help the writer answer a diagnosed problem.
5. **Question limits:**
   - Ask **no more than two targeted questions** in any turn.
   - When useful, give **2–3 genuinely distinct options** (A/B/C), plus room for the writer's own answer.
   - **Turn 1:** Ask **exactly two** probing questions.
   - **Turn 3:** Ask **exactly one** final confirmation question.
6. **Explain briefly** why each question, critique, score, and recommendation matters to story viability.
7. **Challenge respectfully and specifically.** Avoid empty praise, cheerleading, and generic writing advice.
8. **Use professional craft terminology** naturally, but keep explanations accessible.
9. **Adapt questions** to the diagnosed seed type and the user's previous answers. Do not mechanically follow a checklist or repeat questions already answered.
10. **Preserve scope discipline** and generate **zero manuscript prose**.
11. **Avoid false precision.** Do not invent market data, certainty, or story facts.
12. **Recommendations must be concrete** and specific to this premise.

---

## 5. Turn-by-Turn Conversational Specification

Count an assistant response as one Story Starter turn. The user's initial seed precedes Turn 1. Do not add an intake turn, welcome turn, or fifth turn.

### Turn 1: Seed Audit and Initial Sweep

**Trigger:** User submits a raw story seed.

**AI actions:**

1. **Silent State Audit:**  
   Silently scan the input to identify which of the six parameters are locked:  
   - Genre, Premise, Character, Setting, Theme, Scope.

2. **Initial Assessment (exactly 2 sentences):**  
   - Validate what works in the seed.
   - Pinpoint what is missing (usually protagonist goal, central conflict, or stakes).

3. **Question Deployment (exactly two questions):**  
   - Ask **exactly two probing questions** tailored to the seed.
   - Each question must include **2–3 specific, premise-driven quick-select options (A/B/C)**.
   - Briefly explain why the answers matter.

**Style anchor:**
- Do not use meta-headers or system labels.
- Begin directly with conversational, professional prose (e.g., "You've given me strong character psychology here… but I'm spotting a gap…").

**Do NOT:**
- Produce a verdict.
- Draft story prose.

---

### Turn 2: Engine and Stakes Stress-Test

**Trigger:** User responds to Turn 1 questions.

**AI actions:**

1. **Incorporate the writer's answers** without losing or silently changing earlier decisions.

2. **Structural Stress-Test (in flowing prose):**  
   Conversationally evaluate:
   - **Conflict Density:** Can this sustain a full manuscript (e.g., ~90k words)?
   - **Stakes Integrity:** Does failure carry permanent, irreversible consequences?
   - **Protagonist Agency:** Is the protagonist driving the plot?

3. **Primary Risk Flagging:**  
   - Identify the single biggest structural danger area (e.g., passive protagonist, lack of urgency, weak opposing force).
   - Explain **why** it threatens manuscript completion (e.g., midpoint drift, sagging second act).

4. **Question Deployment (exactly two questions):**  
   Ask **exactly two refining questions** focused on:
   - (a) The active opposing force / antagonist.
   - (b) The protagonist's primary flaw or internal sacrifice.  
   Each question must include **2–3 viable options (A/B/C)**.

**Do NOT:**
- Ask questions already answered.
- Solve every weakness for the writer.

---

### Turn 3: Scope and Market Verification

**Trigger:** User responds to Turn 2 questions.

**AI actions:**

1. **Reframed Epistemic Classification (two flowing prose paragraphs):**
   - **What I'm Reading:**  
     Summarize the core theme and character arc, converting Facts and Inferences into a narrative description.
   - **What I Still Need from You:**  
     List remaining Uncertainties or gaps (allies, timeline, specific resolutions) as conversational questions.

2. **Propose Scope:**  
   - Recommend a format based on conflict density (e.g., Standalone Novel, Novella, Short Story, Series).
   - Provide a **2-sentence structural rationale**.

3. **Propose Market Positioning:**
   - Identify **exactly two** highly specific Comp Titles ("X meets Y") and explain **why** they fit.
   - Define **Genre & Sub-genre**.
   - Map the **Target Reader** (age, reader type, psychological profile).
   - State **What's Fresh** (the unique differentiation or market gap).

4. **Question Deployment (exactly one question):**  
   Ask **one final confirmation question**, such as:  
   - "Does this market positioning and scope align with your vision, or should we adjust any of these anchors?"

**Do NOT:**
- Ask more than one question in Turn 3.
- Introduce new major structural issues at this stage.

---

### Turn 4: Report Delivery and Hand-off (Hard Stop)

**Trigger:** User confirms positioning or requests a final minor adjustment.

**AI actions:**

1. **Deliver the Story Viability Report immediately** using the exact 8-section schema in Section 7.
2. **Include the Story Bible Builder Payload** as Section 8.
3. **Ask zero further questions.**
4. **End after the payload.** Do not offer a new service or continue developing the story.

---

## 6. Diagnostic Behaviour

At each stage, evaluate the idea in proportion to its maturity. Do not penalise a raw seed merely for being raw. Assess whether the missing elements can be developed and whether the emerging concept has a workable narrative engine.

**Prioritise:**
- The central dramatic question.
- The protagonist's goal, choices, and agency.
- The opposing force.
- Personal, external, and escalating stakes.
- Causal conflict and sufficient conflict density.
- The protagonist's relevant flaw, need, or internal pressure.
- Genre and reader promise.
- Premise-to-format fit.
- Setting feasibility and story function.
- Distinctiveness without novelty for novelty's sake.
- Contradictions, dependencies, and unresolved assumptions.

**When an answer is weak, vague, or contradictory:**
- Identify the precise problem.
- Explain what it prevents you from validating.
- Ask a smaller, answerable question or present viable paths.
- Never hide the weakness behind positive language.

**When the user says "I don't know":**
- Help them identify the decision criteria.
- Offer distinct directions.
- Do not choose silently.

**When the user changes a decision:**
- Acknowledge the change.
- Update the working understanding consistently.

---

## 7. Final Story Viability Report Schema (Turn 4)

Your Turn 4 response must be a highly polished, professional developmental editing document. It must follow this exact 8-section layout.

Use clear professional headings. In the **conversation turns (Turns 1–3)**, avoid robotic meta-headers, labeled metrics, and bulleted academic lists; use flowing prose instead. In the **final report**, structured lists and bullets are required as specified below.

---

### Section 1: Project Identity & Pitch

- **Working Title:** [Title]
- **One-Line Hook:** [Single-sentence premise: Protagonist + Inciting Incident + Goal + Central Obstacle]
- **Logline & Summary:** [Approximately 100-word narrative arc summary. This is an editorial summary, not manuscript prose.]
- **Comp Titles:** "X meets Y" [Exactly two comp titles, with brief market positioning rationale. Label as provisional if not verified.]
- **Genre & Sub-genre:** [Primary and secondary classifications]
- **Target Audience / Age Category:** [e.g., Young Adult Fantasy, Adult Psychological Thriller]

---

### Section 2: Viability Verdict

- **Overall Viability Score:** [High / Medium / Low]  
  Include a 1–2 sentence structural rationale.
- **Recommended Scope & Format:** [Standalone Novel / Novella / Short Story / Series]  
  Include a brief rationale tied to conflict density and engine capacity.
- **Go / Pivot / Abandon Statement:**
  - **Go (High Viability):** Concept is structurally sound; safe to draft. Include minor risk warnings if relevant.
  - **Pivot (Medium Viability):** Concept has clear merit but suffers from major structural issues (e.g., flat conflict, passive stakes). Detail specific, concrete adjustments required before drafting.
  - **Abandon (Low Viability):** Severe fatal flaws. Unflinchingly explain why the premise is highly likely to collapse mid-draft. Provide a respectful but firm recommendation to set the idea aside and begin fresh.

**Verdict logic:**
- Do not soften Pivot into Go to encourage the writer.
- Do not use Abandon merely because the seed is undeveloped.
- Base the verdict on diagnosed viability.

---

### Section 3: Market & Reader Fit

- **Target Demographic Profile:** [Specific age, reader type, psychological profile]
- **Tropes & Market Gap Analysis:**
  - Core tropes present: [List 2–3 tropes]
  - Market saturation: [Low / Medium / High]
  - Unique market gap: [The underserved angle or opportunity this concept exploits]
- **Commercial Potential:** [High / Medium / Low]  
  State cautiously and without invented data.
- **Writer Resonance Assessment:** [How this aligns with the author's creative goals, based only on what the writer has expressed]

---

### Section 4: Narrative Engine Analysis

Provide a conversational assessment under each sub-heading (avoid labeled metrics like "Conflict Density: STRONG"; instead, write in prose):

- **Hook Strength:**  
  Assessment of whether the premise creates immediate interest and why.
- **Conflict Density:**  
  Evaluation of whether the central struggle can generate cascading, distinct obstacles sufficient for the recommended scope.
- **Stakes Integrity:**  
  Verification that failure carries real, irreversible consequences (personal, external, or both).
- **Protagonist Internal Flaw:**  
  Identification of the core weakness, need, or sacrifice required for character growth.
- **Setting Feasibility:**  
  Assessment of whether the setting limits or enhances the intended narrative scope.
- **Engine Capacity:**  
  Brief statement on whether the narrative engine can sustain the recommended format.

---

### Section 5: Diagnostic Risk Analysis

List the material structural risks, contradictions, dependencies, and unresolved uncertainties. For each, state:

- The risk.
- Why it matters.
- Its likely effect if unresolved.
- The recommended correction or decision needed.

Separate established problems from uncertainties requiring later validation.

**Suggested structure:**

- **Primary Fatal Flaw / Structural Risk:**  
  [The single biggest danger area, e.g., Passive Protagonist, Lack of Midpoint Urgency, Weak Opposing Force]
- **Critical Gaps to Resolve:**  
  [Bullet points of unresolved elements. Every gap must map to an action item in Section 7.]

---

### Section 6: Visual Tone Anchor

Define the story's intended emotional and visual language in concise editorial terms.

- **Visual & Atmospheric Description:**  
  [2–3 evocative sentences detailing sensory world, mood, and color palette. Example: "Rain-soaked noir aesthetic with industrial architecture. Cold colour palette (steel blues, greys) offset by warm amber street lights. Gritty, claustrophobic intimacy."]

Do not generate an image or write a scene.

---

### Section 7: Strategic Action Items

Provide a prioritised, premise-specific list of the next decisions or development actions. Separate:

- **Required before Story Bible Builder:**  
  Tasks that must be resolved to proceed safely.
- **Important during Story Bible development:**  
  Tasks to address while building the full story bible.
- **Optional enhancement:**  
  Nice-to-have refinements that are not critical to viability.

**Format example:**

- **Task 1:** [Concrete, personalized prep task addressing Gap 1]
- **Task 2:** [Concrete, personalized prep task addressing Gap 2]
- **Task 3:** [Concrete, personalized prep task addressing Gap 3]

Do not add tasks merely to make the report look comprehensive.

---

### Section 8: Story Bible Builder Payload

End with a clean copy-and-paste block using these exact labels. This block must be **plain text** with **no markdown formatting, no asterisks, and no headers** inside the block, to ensure direct copy-paste compatibility into downstream tools.

Use only validated information. Where a field remains unresolved, write \`UNRESOLVED:\` followed by a concise statement. Do not invent an answer to make the payload look complete.

\`\`\`text
WORKING TITLE:
ONE-LINE HOOK:
GENRE & SCOPE:
TARGET READER:
COMP TITLES:
CENTRAL CONFLICT:
PROTAGONIST:
PRIMARY STAKES:
CORE THEME:
EMOTIONAL TONE:
ANTAGONIST / OPPOSING FORCE:
KEY SUPPORTING CHARACTER:
UNIQUE SELLING PROPOSITION:
STRUCTURAL RISKS TO MONITOR:
VISUAL TONE:
\`\`\`

---

## 8. Completion Criteria

The Story Starter process is complete only when:

- Exactly **four assistant turns** have been used.
- The final report contains **all eight required sections**.
- A clear **Go / Pivot / Abandon** verdict is given and justified.
- All material diagnosed pain points are addressed or explicitly recorded as unresolved.
- Recommendations are **premise-specific** and **actionable**.
- **Zero manuscript prose, scenes, or dialogue** have been generated.
- The writer's decisions remain distinguishable from editorial inference.
- The **Story Bible Builder Payload** is complete and ready for direct hand-off.

On Turn 4, stop after the payload.

---

## 9. Tone & Style Guidelines (Conversational Turns)

In **Turns 1–3**, adhere to the following style rules to avoid robotic AI markers:

- **NO system meta-headers:**  
  Do not use bracketed or uppercase headers like \`[INPUT RECEIVED & CATEGORISED]\`, \`[STRESS-TEST RESULTS]\`, \`[DIAGNOSTIC CLASSIFICATION]\`, or \`$$STRESS-TEST RESULTS$$\`.

- **Flowing prose for diagnostics:**  
  Do not display labeled metrics or rubrics such as \`Conflict Density: STRONG\` or \`Stakes Integrity: MODERATE-TO-STRONG\`.  
  Instead, weave these diagnostics directly into conversational, professional prose (e.g., "Your conflict here is strong—the tension between her values and her mentor's expectations creates genuine escalation that can sustain a full manuscript…").

- **No embedded academic outlines in conversation:**  
  Avoid bulleted academic lists for facts/inferences/uncertainties in Turns 1–3. Use flowing, narrative paragraphs to summarize your reading.

- **Vary openings:**  
  Avoid repetitive patterns. Use natural editorial transitions like:
  - "Let me stress-test what you've given me…"
  - "Stakes-wise, we're looking at…"
  - "Her agency is solid…"
  - "I'm spotting a gap…"

In the **final report (Turn 4)**, structured lists, bullets, and clear section headings are required as specified in Section 7.

---

## 10. Use of Project Knowledge (If Available)

If you have access to additional Story Starter project knowledge (e.g., Editorial Playbook, Professional Editor Questions, Complete Question Suite by Seed Type, Example Reports):

- **Editorial Playbook:** Governs diagnostic methodology.
- **Professional Editor Questions:** Model for natural editorial behaviour and Socratic questioning.
- **Complete Question Suite by Seed Type:** Adaptive reference, never a fixed questionnaire.
- **Example Reports:** Benchmark for report depth, specificity, and professional presentation, not content to copy.

**Where any examples or ancillary documents conflict with this Master Instructions document, this document takes priority.**

---

## 11. Self-Calibration Check

Before finalizing any critique or recommendation, ask yourself:

> "Could this evaluation apply to any generic story?"

If yes, refine it for specific relevance to this user's unique premise. Avoid generic, one-size-fits-all feedback.

---

**End of Master Instructions.**`;

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

function getAnthropicApiKey(): string | undefined {
  const candidates = [
    process.env.ANTHROPIC_API_KEY,
    process.env.CLAUDE_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  ]
    .map((k) => k?.trim())
    .filter((k): k is string => Boolean(k && k !== "mock-key"));

  const antKey = candidates.find((k) => k.startsWith("sk-ant-"));
  return antKey || candidates[0];
}

function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5-5";
}

function extractJsonFromText<T>(rawText: string): T {
  const trimmed = rawText.trim();
  // Strip ```json ... ``` fences if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Fallback: locate first '{' and last '}'
    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slice = candidate.slice(firstBrace, lastBrace + 1);
      return JSON.parse(slice) as T;
    }
    throw new Error("Could not parse JSON from Claude response.");
  }
}

async function callClaudeMessages<T>(
  userPrompt: string,
  maxTokens = 4096
): Promise<T> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Missing Anthropic Claude API key.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2026-10-21",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: getAnthropicModel(),
      max_tokens: maxTokens,
      system: SYSTEM_INSTRUCTION_CONTENT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const textBlock = data.content?.find((c) => c.type === "text")?.text || "";
  if (!textBlock) {
    throw new Error("Claude API returned an empty text block.");
  }

  return extractJsonFromText<T>(textBlock);
}

// Clean Section 8 payload so it never contains markdown symbols or asterisks
function sanitizePlainTextPayload(rawPayload: string): string {
  return rawPayload
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "")
    .trim();
}

// Offline fallback generators (only used if no API key is configured or in unit tests with mock-key)
export function generateSimulatedTurn1(seed: string): TurnResponse {
  const seedLower = seed.toLowerCase();
  let genre = "Commercial Fiction";
  if (seedLower.includes("gothic") || seedLower.includes("lifetime") || seedLower.includes("romance")) {
    genre = "Gothic Paranormal Romance / Reincarnation";
  } else if (seedLower.includes("space") || seedLower.includes("alien") || seedLower.includes("telepathy")) {
    genre = "Sci-Fi Conspiracy Thriller";
  } else if (seedLower.includes("fantasy") || seedLower.includes("kingdom") || seedLower.includes("executioner")) {
    genre = "Dark Epic Fantasy";
  } else if (seedLower.includes("murder") || seedLower.includes("detective") || seedLower.includes("crime") || seedLower.includes("blueprint")) {
    genre = "Psychological Mystery / Thriller";
  }

  const assessment =
    "You've given me an evocative high-concept hook with immediate thematic intrigue, but right now it's operating as a situation rather than an engine-driven plot—I'm spotting a gap around the protagonist's concrete goal, the active opposing force, and what irreversible penalty happens if they fail.";

  const questions: DiagnosticQuestion[] = [
    {
      id: "q1",
      question: "What immediate, concrete objective forces your protagonist to take action right now rather than walking away?",
      explanation:
        "Without a time-bound external goal, a compelling premise can stall in Act II into passive observation.",
      options: [
        {
          id: "1a",
          label: "A",
          text: "A ticking-clock survival threat: an institutional or antagonistic force will erase or destroy what they value most unless they expose the truth first.",
        },
        {
          id: "1b",
          label: "B",
          text: "A personal debt or rescue mission: someone they are bound to is directly endangered by the central mystery, forcing an active investigation.",
        },
        {
          id: "1c",
          label: "C",
          text: "An irreversible moral complicity: they discover they are unknowingly the instrument of the crisis and must dismantle it from the inside.",
        },
      ],
    },
    {
      id: "q2",
      question: "What is the specific personal cost to the protagonist every time they push closer to their goal?",
      explanation:
        "Stakes integrity depends on making progress itself costly, ensuring every choice carries permanent consequences.",
      options: [
        {
          id: "2a",
          label: "A",
          text: "Each step forward strips away their identity, reputation, or safe life, leaving no path back to who they were.",
        },
        {
          id: "2b",
          label: "B",
          text: "Pursuing the objective directly endangers the relationship or person they are trying to protect.",
        },
        {
          id: "2c",
          label: "C",
          text: "Using the very advantage or secret at the heart of the premise inflicts an escalating psychological or physical toll.",
        },
      ],
    },
  ];

  return {
    turn: 1,
    stage: "foundations",
    assessment,
    analysis: "",
    questions,
    state_audit: {
      genre,
      premise: seed.trim(),
      character: "Protagonist established in seed; agency & goal under audit",
      setting: "Implied by premise; crucible rules pending",
      theme: "Emerging from central tension",
      scope: "Pending conflict density stress-test",
    },
  };
}

export function generateSimulatedTurn2(currentState: AuditedState, turn1Answer: string): TurnResponse {
  const analysis = `Your choices in Turn 1 give our protagonist a clear forward engine. Looking at conflict density, the clash you've established has enough causal friction to sustain a full-length manuscript (~85,000–95,000 words) provided each discovery triggers a harder counter-move. Stakes-wise, we're moving into irreversible territory—failure no longer resets the status quo. Your protagonist's agency is taking shape, though we need to make sure the opposing force actively hunts or corners them rather than waiting to be uncovered.`;

  const primaryRisk =
    "Midpoint Urgency & Antagonistic Counter-Pressure: If the opposing force remains an abstract system or distant mystery rather than a personified adversary applying direct counter-force, the second act risks stalling into repetitive investigation beats.";

  const questions: DiagnosticQuestion[] = [
    {
      id: "q3",
      question: "Who or what serves as the active opposing force fighting back against your protagonist's every move?",
      explanation:
        "A personified antagonist or adaptive opposing force with its own urgent agenda prevents second-act sag.",
      options: [
        {
          id: "3a",
          label: "A",
          text: "An intimate rival or former ally whose survival depends on keeping the central truth buried.",
        },
        {
          id: "3b",
          label: "B",
          text: "A ruthless institutional enforcer who anticipates the protagonist's moves and systematically closes every exit.",
        },
        {
          id: "3c",
          label: "C",
          text: "A dual opposition: an external hunter paired with someone the protagonist loves whose goals directly collide with theirs.",
        },
      ],
    },
    {
      id: "q4",
      question: "What internal flaw, blind spot, or painful sacrifice must the protagonist confront at the climax to succeed?",
      explanation:
        "Connecting external plot pressure to an internal character flaw locks the thematic arc to the structural climax.",
      options: [
        {
          id: "4a",
          label: "A",
          text: "Their compulsive need for control or certainty—they must surrender their status and certainty to save what matters.",
        },
        {
          id: "4b",
          label: "B",
          text: "Guilt and complicity in past harm—they must publicly own their worst mistake to break the antagonist's leverage.",
        },
        {
          id: "4c",
          label: "C",
          text: "Fear of vulnerability or betrayal—they must place fatal trust in the one person they have spent the story guarding against.",
        },
      ],
    },
  ];

  return {
    turn: 2,
    stage: "stress_test",
    analysis,
    primary_risk_flag: primaryRisk,
    questions,
    state_audit: {
      ...currentState,
      character: `Active protagonist (${turn1Answer.slice(0, 90)}${turn1Answer.length > 90 ? "..." : ""})`,
      setting: "High-pressure narrative crucible with escalating constraints",
    },
  };
}

export function generateSimulatedTurn3(currentState: AuditedState, turn2Answer: string): TurnResponse {
  const whatImReading = `What I'm reading now is a tightly wound story where your protagonist's external struggle against an active adversary mirrors their internal confrontation with their own flaw. Because every tactical move carries a permanent personal cost, the narrative arc naturally bridges the opening hook, an escalating second-act crucible, and a high-stakes climactic sacrifice.`;

  const whatINeed = `What I still need from you before locking the diagnostic report is confirmation on our final scope and market anchors—specifically whether you envision the resolution closing cleanly within a single volume or leaving structural threads open, and how tightly the timeline compresses the final confrontation.`;

  const proposedScope =
    "Standalone Novel (80,000–95,000 words). The causal conflict density and dual internal/external stakes have the structural capacity to sustain a full three-act novel without padding, while reaching a decisive thematic resolution.";

  const compTitles =
    '"The Seven Deaths of Evelyn Hardcastle" by Stuart Turton meets "The Invisible Life of Addie LaRue" by V.E. Schwab (Provisional) — combining high-concept structural tension and relentless causal momentum with deeply personal emotional stakes.';

  const targetReader =
    "Adult commercial and upmarket genre readers (ages 25–50) drawn to high-concept hooks grounded in moral complexity, psychological tension, and relentless narrative pacing.";

  const whatsFresh =
    "Subverts familiar genre tropes by binding the high-concept premise directly to the protagonist's moral complicity and internal sacrifice, making the external mystery inseparable from the character arc.";

  const questions: DiagnosticQuestion[] = [
    {
      id: "q5",
      question: "Does this market positioning and scope align with your vision, or should we adjust any of these anchors before I generate your Story Viability Report?",
      explanation:
        "Final confirmation locks your validated parameters for the 8-section Story Viability Report and Story Bible Builder Payload.",
      options: [
        {
          id: "5a",
          label: "A",
          text: "Yes, this scope and market positioning align with my vision—proceed to the full 8-section Story Viability Report.",
        },
        {
          id: "5b",
          label: "B",
          text: "Keep the standalone novel scope, but shift the tonal and market positioning darker and more atmospheric.",
        },
        {
          id: "5c",
          label: "C",
          text: "Adjust the scope toward a multi-book series or tighter novella format while keeping the character and conflict anchors.",
        },
      ],
    },
  ];

  return {
    turn: 3,
    stage: "verification",
    analysis: `${whatImReading}\n\n${whatINeed}`,
    what_im_reading: whatImReading,
    what_i_need: whatINeed,
    proposed_scope: proposedScope,
    comp_titles: compTitles,
    target_reader: targetReader,
    whats_fresh: whatsFresh,
    questions,
    state_audit: {
      ...currentState,
      theme: `Internal flaw vs. external opposition (${turn2Answer.slice(0, 80)}${turn2Answer.length > 80 ? "..." : ""})`,
      scope: "Standalone Novel (80k–95k words)",
    },
    is_final_turn: true,
  };
}

export function generateSimulatedTurn4Report(
  initialSeed: string,
  currentState: AuditedState,
  finalAnswer: string
): ViabilityReport {
  const workingTitle = "The Reckoning Engine";
  const oneLineHook = `When ${initialSeed.trim().replace(/\.$/, "")}, the protagonist must outmaneuver a relentless opposing force before the truth permanently costs them everything they are trying to protect.`;
  const compTitles =
    '"The Seven Deaths of Evelyn Hardcastle" by Stuart Turton meets "The Invisible Life of Addie LaRue" by V.E. Schwab (Provisional)';

  const storyBiblePayload = `WORKING TITLE: ${workingTitle}
ONE-LINE HOOK: ${oneLineHook}
GENRE & SCOPE: ${currentState.genre} | ${currentState.scope || "Standalone Novel (80,000-95,000 words)"}
TARGET READER: Adult commercial and upmarket genre readers seeking high-concept tension grounded in psychological depth.
COMP TITLES: ${compTitles}
CENTRAL CONFLICT: The protagonist must resolve the crisis sparked by the initial premise while countered at every step by an active adversary with direct leverage.
PROTAGONIST: ${currentState.character}
PRIMARY STAKES: Permanent loss of identity, autonomy, or the person they are fighting to protect if the opposing force prevails.
CORE THEME: ${currentState.theme}
EMOTIONAL TONE: Urgent, atmospheric, psychologically taut, and emotionally resonant.
ANTAGONIST / OPPOSING FORCE: Active personified opposition enforcing institutional and personal counter-pressure.
KEY SUPPORTING CHARACTER: UNRESOLVED: Supporting ally/foil relationship dynamics to be defined in Story Bible Builder.
UNIQUE SELLING PROPOSITION: High-concept hook directly fused with personal moral stakes and escalating irreversible consequences.
STRUCTURAL RISKS TO MONITOR: Prevent second-act investigative drift by ensuring every discovery triggers an immediate antagonistic counter-move.
VISUAL TONE: High-contrast atmospheric world combining intimate claustrophobic tension with sharp sensory details.`;

  const reportMarkdown = `# Story Viability Report

## Section 1: Project Identity & Pitch
- **Working Title:** ${workingTitle}
- **One-Line Hook:** ${oneLineHook}
- **Logline & Summary:** Built from your initial seed ("${initialSeed.trim()}"), this narrative centers on a protagonist forced out of equilibrium into a high-stakes confrontation. Across three acts, what begins as an urgent personal mystery escalates into a direct clash against an active adversary. Each choice strips away safety nets until the climax forces a definitive sacrifice tying the external conflict to the protagonist's deepest internal flaw.
- **Comp Titles:** ${compTitles}
- **Genre & Sub-genre:** ${currentState.genre}
- **Target Audience / Age Category:** Adult Commercial / Upmarket Genre Fiction

## Section 2: Viability Verdict
- **Overall Viability Score:** High — The premise possesses a clear dramatic question, active protagonist agency, and escalating causal stakes.
- **Recommended Scope & Format:** ${currentState.scope || "Standalone Novel (80,000–95,000 words)"} — Conflict density and antagonistic counter-pressure can sustain a full-length novel arc.
- **Go / Pivot / Abandon Statement:** **Go (High Viability):** The concept is structurally sound and safe to move into Story Bible development, provided you maintain relentless antagonistic pressure through the midpoint.

## Section 3: Market & Reader Fit
- **Target Demographic Profile:** Adult readers (25–50) who gravitate toward high-concept hooks paired with character-driven moral stakes.
- **Tropes & Market Gap Analysis:**
  - Core tropes present: High-Stakes Crucible, Complicit Protagonist, Relentless Adversary
  - Market saturation: Medium
  - Unique market gap: Combines an immediate high-concept hook with intimate psychological consequences rather than purely external spectacle.
- **Commercial Potential:** High (stated cautiously based on enduring reader demand for hook-driven genre fiction).
- **Writer Resonance Assessment:** Aligns with your confirmed direction (${finalAnswer.slice(0, 100)}).

## Section 4: Narrative Engine Analysis
- **Hook Strength:** The premise establishes immediate curiosity and clear dramatic irony from the opening setup.
- **Conflict Density:** Strong causal escalation allows each obstacle to generate new complications across a full manuscript.
- **Stakes Integrity:** Failure carries permanent personal and external consequences with no easy reset.
- **Protagonist Internal Flaw:** The protagonist's core blind spot directly complicates their external objective, forcing genuine growth at the climax.
- **Setting Feasibility:** The setting functions as a pressure cooker that limits easy escapes and sharpens conflict.
- **Engine Capacity:** Fully capable of sustaining the recommended standalone novel format.

## Section 5: Diagnostic Risk Analysis
- **Primary Fatal Flaw / Structural Risk:** Midpoint Drift — If the protagonist spends Act II passively gathering clues without the antagonist actively constricting their options, narrative momentum will stall.
- **Critical Gaps to Resolve:**
  - Lock the exact midpoint reversal where the antagonist seizes the offensive.
  - Define the key supporting character or foil who challenges the protagonist's internal flaw.
  - Establish the concrete timeline deadline governing Act III.

## Section 6: Visual Tone Anchor
- **Visual & Atmospheric Description:** Shadowed, high-contrast atmosphere where intimate, claustrophobic spaces collide with sharp sensory textures. Cool steel and slate tones are punctured by urgent flashes of warmth and danger, reinforcing a mood of taut psychological immediacy.

## Section 7: Strategic Action Items
- **Required before Story Bible Builder:**
  - Task 1: Define the exact midpoint turning point that shifts the protagonist from defense to high-risk offense.
  - Task 2: Specify the concrete deadline or ticking clock that forces the Act III climax.
- **Important during Story Bible development:**
  - Task 3: Design a primary supporting character or foil who embodies the opposite side of the core thematic conflict.
- **Optional enhancement:**
  - Task 4: Map the sensory rules and environmental constraints of the primary setting crucible.

## Section 8: Story Bible Builder Payload
\`\`\`text
${storyBiblePayload}
\`\`\``;

  return {
    working_title: workingTitle,
    one_line_hook: oneLineHook,
    logline_summary: `Built from your initial seed ("${initialSeed.trim()}"), this story follows an active protagonist forced into an escalating confrontation against a formidable opposing force, culminating in an irreversible climactic choice.`,
    comp_titles: compTitles,
    genre_subgenre: currentState.genre,
    target_audience: "Adult Commercial / Upmarket Genre Readers",
    verdict: "GO",
    verdict_subtitle: "Concept is structurally sound; safe to proceed to Story Bible Builder",
    viability_score: 88,
    overall_score_label: "High",
    recommended_scope: currentState.scope || "Standalone Novel (80,000–95,000 words)",
    verdict_statement:
      "Go (High Viability): Concept is structurally sound with clear agency, causal conflict density, and irreversible stakes. Proceed to Story Bible Builder while monitoring second-act antagonistic pressure.",
    target_demographic: "Adult fiction readers (25–50) seeking high-concept hooks paired with deep character stakes",
    tropes_analysis: {
      core_tropes: ["High-Stakes Crucible", "Moral Complicity", "Intimate Antagonist"],
      market_saturation: "Medium",
      unique_gap: "Fuses a sharp high-concept hook directly with personal moral cost and irreversible character stakes.",
    },
    commercial_potential: "High",
    writer_resonance: "Directly reflects the writer's chosen structural and market anchors across Turns 1–3.",
    narrative_engine: {
      hook_strength: "Creates immediate intrigue with a clear central dramatic question.",
      conflict_density: "Generates cascading obstacles sufficient for a full-length manuscript.",
      stakes_integrity: "Failure carries permanent personal and external consequences.",
      protagonist_flaw: "Internal flaw directly collides with the external goal at the climax.",
      setting_feasibility: "Setting actively constrains choices and amplifies tension.",
      engine_capacity: "Capable of sustaining a standalone novel of 80,000–95,000 words.",
    },
    scorecard: {
      emotional_promise: 90,
      central_conflict: 88,
      character_agency: 86,
      distinctiveness: 89,
    },
    primary_fatal_flaw: "Midpoint Urgency & Antagonistic Counter-Pressure",
    critical_gaps: [
      "Lock the exact midpoint reversal where the opposing force seizes the initiative.",
      "Define the concrete ticking-clock deadline governing Act III.",
      "Establish the key supporting character/foil relationship.",
    ],
    visual_tone_anchor:
      "Shadowed, high-contrast atmosphere where intimate, claustrophobic spaces collide with sharp sensory textures. Cool steel and slate tones are punctured by urgent flashes of amber and danger, reinforcing taut psychological immediacy.",
    strategic_action_items: {
      required_before_bible: [
        "Task 1: Define the exact midpoint reversal that forces the protagonist to risk everything.",
        "Task 2: Lock the concrete ticking-clock deadline driving the third act.",
      ],
      important_during_development: [
        "Task 3: Develop the primary supporting character or foil who challenges the protagonist's flaw.",
      ],
      optional_enhancements: [
        "Task 4: Map the sensory and institutional rules of the primary setting crucible.",
      ],
    },
    report_markdown: reportMarkdown,
    story_bible_payload: storyBiblePayload,
  };
}

// ============================================================================
// LIVE CLAUDE API CALLS FOLLOWING CANONICAL MASTER INSTRUCTIONS (MERGED V1.0)
// ============================================================================

export async function callGeminiTurn1(seed: string): Promise<TurnResponse> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return generateSimulatedTurn1(seed);
  }

  try {
    const prompt = `The writer has submitted the following raw story seed (this precedes Turn 1):

"""
${seed.trim()}
"""

Execute **Turn 1: Seed Audit and Initial Sweep** strictly according to the Master Instructions:

1. **Silent State Audit:**
   Scan the input to identify which of the six parameters (Genre, Premise, Character, Setting, Theme, Scope) are locked in the writer's seed and which are still open/unlocked. Never invent missing story facts.

2. **Initial Assessment (exactly 2 sentences):**
   - Begin directly with conversational, professional editorial prose (NO meta-headers or system labels).
   - Validate specifically what works in THIS seed, and pinpoint what is missing (such as protagonist goal, central conflict, causal engine, or stakes).
   - Apply the Section 11 Self-Calibration Check: "Could this evaluation apply to any generic story?" Make every word unmistakably specific to the writer's seed.

3. **Question Deployment (exactly two probing questions):**
   - Ask **exactly two probing questions** tailored specifically to the diagnosed gaps in this seed.
   - Each question MUST include:
     * A brief explanation of **why** the answer matters to story viability.
     * **2–3 specific, genuinely distinct, premise-driven quick-select options (A, B, C)** that directly use the characters, concepts, or world of the writer's seed (never generic filler).
   - If the user asked you to write the story or decide everything for them, briefly explain that Story Starter protects their authorship, and frame the questions/options so they retain creative authority.
   - Strictly enforce the Zero-Prose Policy (zero scenes, zero dialogue, zero manuscript prose).

Return ONLY a valid JSON object matching this exact schema (no markdown code fences around the JSON):
{
  "assessment": "Exactly 2 sentences of conversational, premise-specific editorial prose validating what works in the seed and pinpointing what is missing.",
  "analysis": "1-2 sentences of natural editorial transition setting up why the two questions below are the critical levers to lock next (do not repeat the assessment verbatim).",
  "questions": [
    {
      "id": "q1",
      "question": "First specific probing question tailored to this seed",
      "explanation": "Brief explanation of why this question matters to story viability",
      "options": [
        { "id": "1a", "label": "A", "text": "Specific, premise-driven option A" },
        { "id": "1b", "label": "B", "text": "Specific, premise-driven option B" },
        { "id": "1c", "label": "C", "text": "Specific, premise-driven option C" }
      ]
    },
    {
      "id": "q2",
      "question": "Second specific probing question tailored to this seed",
      "explanation": "Brief explanation of why this question matters to story viability",
      "options": [
        { "id": "2a", "label": "A", "text": "Specific, premise-driven option A" },
        { "id": "2b", "label": "B", "text": "Specific, premise-driven option B" },
        { "id": "2c", "label": "C", "text": "Specific, premise-driven option C" }
      ]
    }
  ],
  "state_audit": {
    "genre": "Identified genre/subgenre from seed (or provisional inference)",
    "premise": "Concise summary of the established seed premise",
    "character": "Locked character details or what remains unlocked",
    "setting": "Locked setting details or what remains unlocked",
    "theme": "Emerging thematic core or what remains unlocked",
    "scope": "Implied scope or 'Pending conflict density check'"
  }
}`;

    const parsed = await callClaudeMessages<any>(prompt, 4096);

    return {
      turn: 1,
      stage: "foundations",
      assessment: parsed.assessment || "",
      analysis: parsed.analysis || "",
      questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 2) : [],
      state_audit: parsed.state_audit,
    };
  } catch (error) {
    console.error("Claude Turn 1 Error:", error);
    throw error;
  }
}

export async function callGeminiTurn(
  turnNumber: number,
  history: SessionMessage[],
  newAnswer: string,
  currentState: AuditedState
): Promise<TurnResponse> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    if (turnNumber === 2) return generateSimulatedTurn2(currentState, newAnswer);
    return generateSimulatedTurn3(currentState, newAnswer);
  }

  try {
    const stage: StoryStage = turnNumber === 2 ? "stress_test" : "verification";
    const transcript = history
      .map((m) => `${m.role === "user" ? "WRITER" : "STORY STARTER (EDITOR)"} (Turn ${m.turn}):\n${m.content}`)
      .join("\n\n---\n\n");

    const prompt =
      turnNumber === 2
        ? `Here is the full Story Starter session history so far:

${transcript}

---

Current Working State Audit:
${JSON.stringify(currentState, null, 2)}

The writer just responded to Turn 1 with:
"""
${newAnswer.trim()}
"""

Execute **Turn 2: Engine and Stakes Stress-Test** strictly according to the Master Instructions:

1. **Incorporate the writer's answers** without losing or silently changing earlier decisions. If the writer's answer was vague, contradictory, or "I don't know", address it candidly per Section 6.
2. **Structural Stress-Test (in flowing prose):**
   - Write in natural, conversational editorial prose (NO meta-headers like [STRESS-TEST RESULTS] and NO labeled rubric metrics like "Conflict Density: STRONG").
   - Weave your evaluation of **Conflict Density** (can this sustain a full manuscript, e.g., ~90k words?), **Stakes Integrity** (does failure carry permanent, irreversible consequences?), and **Protagonist Agency** (is the protagonist actively driving the plot?) into flowing paragraphs specific to this premise.
3. **Primary Risk Flagging:**
   - Identify the single biggest structural danger area in this concept right now (e.g., passive protagonist, lack of urgency, weak opposing force, second-act stall).
   - Explain clearly **why** it threatens manuscript completion (e.g., midpoint drift, sagging second act, episodic repetition).
4. **Question Deployment (exactly two refining questions):**
   - Ask **exactly two refining questions** tailored to this story:
     * Question 1 focused on: **(a) The active opposing force / antagonist.**
     * Question 2 focused on: **(b) The protagonist's primary flaw or internal sacrifice.**
   - Do NOT repeat questions already answered in Turn 1.
   - Each question must include a brief explanation of why it matters to story viability and **2–3 genuinely distinct, premise-specific viable options (A, B, C)**.
5. Apply the Section 11 Self-Calibration Check ("Could this evaluation apply to any generic story?") and enforce Zero Manuscript Prose.

Return ONLY a valid JSON object matching this exact schema (no markdown code fences around the JSON):
{
  "analysis": "Flowing, multi-paragraph conversational editorial prose evaluating Conflict Density, Stakes Integrity, and Protagonist Agency specifically for this story (no meta-headers, no rubric labels).",
  "primary_risk_flag": "The single biggest structural danger area and why it threatens manuscript completion.",
  "questions": [
    {
      "id": "q3",
      "question": "Refining question (a) focused on the active opposing force / antagonist",
      "explanation": "Brief explanation of why this matters to story viability",
      "options": [
        { "id": "3a", "label": "A", "text": "Specific, premise-driven option A" },
        { "id": "3b", "label": "B", "text": "Specific, premise-driven option B" },
        { "id": "3c", "label": "C", "text": "Specific, premise-driven option C" }
      ]
    },
    {
      "id": "q4",
      "question": "Refining question (b) focused on the protagonist's primary flaw or internal sacrifice",
      "explanation": "Brief explanation of why this matters to story viability",
      "options": [
        { "id": "4a", "label": "A", "text": "Specific, premise-driven option A" },
        { "id": "4b", "label": "B", "text": "Specific, premise-driven option B" },
        { "id": "4c", "label": "C", "text": "Specific, premise-driven option C" }
      ]
    }
  ],
  "state_audit": {
    "genre": "Updated genre/subgenre",
    "premise": "Updated core premise incorporating Turn 1 decisions",
    "character": "Updated protagonist goal, agency, and stakes",
    "setting": "Updated setting/crucible details",
    "theme": "Updated thematic tension",
    "scope": "Preliminary format/word-count assessment based on conflict density"
  },
  "is_final_turn": false
}`
        : `Here is the full Story Starter session history across Turns 1 and 2:

${transcript}

---

Current Working State Audit:
${JSON.stringify(currentState, null, 2)}

The writer just responded to Turn 2 with:
"""
${newAnswer.trim()}
"""

Execute **Turn 3: Scope and Market Verification** strictly according to the Master Instructions:

1. **Reframed Epistemic Classification (two flowing prose paragraphs):**
   - **What I'm Reading:** Summarize the core theme and character arc, converting established Facts and logical narrative Inferences into a rich narrative description of the story's engine.
   - **What I Still Need from You:** Frame remaining Uncertainties or open structural gaps (allies, timeline, specific resolutions) in flowing conversational prose.
2. **Propose Scope:**
   - Recommend a specific format based on the diagnosed conflict density (e.g., Standalone Novel, Novella, Short Story, Series with approximate word-count range).
   - Provide a **2-sentence structural rationale** tied directly to conflict density and engine capacity.
3. **Propose Market Positioning:**
   - **Comp Titles:** Identify **exactly two** highly specific Comp Titles ("X meets Y") and explain **why** they fit this premise (label as provisional if appropriate).
   - **Genre & Sub-genre:** Define primary and secondary genre classifications.
   - **Target Reader:** Map the specific target reader (age, reader type, psychological profile).
   - **What's Fresh:** State the unique differentiation or market gap this premise exploits.
4. **Question Deployment (exactly ONE question):**
   - Ask **exactly ONE final confirmation question** (e.g., "Does this market positioning and scope align with your vision, or should we adjust any of these anchors?").
   - Provide **2–3 specific options (A, B, C)** allowing the writer to confirm as-is or specify targeted adjustments to scope, tone, or market positioning before Turn 4 report generation.
   - Do NOT ask more than one question in Turn 3, and do NOT introduce new major structural issues at this stage.

Return ONLY a valid JSON object matching this exact schema (no markdown code fences around the JSON):
{
  "analysis": "Brief conversational opening connecting the writer's Turn 2 answers into the Scope & Market Verification below.",
  "what_im_reading": "Flowing prose paragraph summarizing the core theme and character arc, converting Facts and Inferences into a cohesive editorial reading.",
  "what_i_need": "Flowing prose paragraph noting remaining Uncertainties or gaps (allies, timeline, specific resolutions) that will be tracked into the Story Bible Builder.",
  "proposed_scope": "Recommended format (e.g., Standalone Novel, Novella, Short Story, Series) plus your 2-sentence structural rationale.",
  "comp_titles": "Exactly two specific Comp Titles ('X meets Y') with a clear explanation of why each fits.",
  "target_reader": "Genre & Sub-genre plus the specific Target Reader profile (age, reader type, psychological profile).",
  "whats_fresh": "What's Fresh: the unique differentiation or market gap this story exploits.",
  "questions": [
    {
      "id": "q5",
      "question": "Exactly ONE final confirmation question verifying scope and market positioning",
      "explanation": "Final confirmation before generating the 8-section Story Viability Report and Story Bible Builder Payload.",
      "options": [
        { "id": "5a", "label": "A", "text": "Option A: Confirm scope, comp titles, and market positioning as proposed and generate the Viability Report" },
        { "id": "5b", "label": "B", "text": "Option B: Specific adjustment to tone, comp positioning, or reader angle tailored to this premise" },
        { "id": "5c", "label": "C", "text": "Option C: Specific adjustment to format scope or ending trajectory tailored to this premise" }
      ]
    }
  ],
  "state_audit": {
    "genre": "Locked Genre & Sub-genre",
    "premise": "Locked premise summary",
    "character": "Locked protagonist, agency, flaw, and antagonist opposition",
    "setting": "Locked setting & narrative crucible",
    "theme": "Locked core theme",
    "scope": "Recommended format & scope"
  },
  "is_final_turn": true
}`;

    const parsed = await callClaudeMessages<any>(prompt, 4096);

    const questionsList = Array.isArray(parsed.questions)
      ? parsed.questions.slice(0, turnNumber === 3 ? 1 : 2)
      : [];

    return {
      turn: turnNumber,
      stage,
      analysis: parsed.analysis || parsed.what_im_reading || "",
      primary_risk_flag: parsed.primary_risk_flag,
      what_im_reading: parsed.what_im_reading,
      what_i_need: parsed.what_i_need,
      proposed_scope: parsed.proposed_scope,
      comp_titles: parsed.comp_titles,
      target_reader: parsed.target_reader,
      whats_fresh: parsed.whats_fresh,
      questions: questionsList,
      state_audit: parsed.state_audit,
      is_final_turn: turnNumber === 3,
    };
  } catch (error) {
    console.error(`Claude Turn ${turnNumber} Error:`, error);
    throw error;
  }
}

export async function callGeminiTurn4Report(
  history: SessionMessage[],
  finalAnswer: string,
  currentState: AuditedState,
  initialSeed: string
): Promise<ViabilityReport> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    return generateSimulatedTurn4Report(initialSeed, currentState, finalAnswer);
  }

  try {
    const transcript = history
      .map((m) => `${m.role === "user" ? "WRITER" : "STORY STARTER (EDITOR)"} (Turn ${m.turn}):\n${m.content}`)
      .join("\n\n---\n\n");

    const prompt = `Here is the complete 3-turn Story Starter editorial conversation:

Initial Story Seed:
"""
${initialSeed}
"""

Full Session Transcript:
${transcript}

---

Audited Narrative State:
${JSON.stringify(currentState, null, 2)}

Writer's Turn 3 Confirmation / Final Adjustments:
"""
${finalAnswer.trim()}
"""

Execute **Turn 4: Report Delivery and Hand-off (Hard Stop)** strictly according to **Section 7 (Final Story Viability Report Schema)** and **Section 8 (Completion Criteria)** of the Master Instructions:

1. Deliver the complete, deeply specific **8-Section Story Viability Report**:
   - **Section 1: Project Identity & Pitch** (Working Title, One-Line Hook [Protagonist + Inciting Incident + Goal + Central Obstacle], Logline & Summary [~100-word editorial narrative arc summary, zero manuscript prose], Comp Titles ["X meets Y" with market positioning rationale], Genre & Sub-genre, Target Audience / Age Category)
   - **Section 2: Viability Verdict** (Overall Viability Score [High / Medium / Low] with 1–2 sentence structural rationale, Recommended Scope & Format with rationale tied to conflict density and engine capacity, and Go / Pivot / Abandon Statement adhering strictly to the Verdict Logic—do not soften Pivot into Go, and do not use Abandon merely because a seed was initially raw)
   - **Section 3: Market & Reader Fit** (Target Demographic Profile, Tropes & Market Gap Analysis [Core tropes present (2–3), Market saturation (Low/Medium/High), Unique market gap], Commercial Potential [High/Medium/Low stated cautiously without invented data], Writer Resonance Assessment based only on what the writer has expressed)
   - **Section 4: Narrative Engine Analysis** (Conversational prose assessment under each sub-heading—avoid labeled rubric metrics like "Conflict Density: STRONG"; write in flowing prose for: Hook Strength, Conflict Density, Stakes Integrity, Protagonist Internal Flaw, Setting Feasibility, Engine Capacity)
   - **Section 5: Diagnostic Risk Analysis** (Material structural risks, contradictions, dependencies, and unresolved uncertainties—stating the risk, why it matters, its likely effect if unresolved, and recommended correction. Include Primary Fatal Flaw / Structural Risk and Critical Gaps to Resolve where every gap maps to an action item in Section 7)
   - **Section 6: Visual Tone Anchor** (Visual & Atmospheric Description: 2–3 evocative sentences detailing sensory world, mood, and color palette)
   - **Section 7: Strategic Action Items** (Prioritised, premise-specific tasks separated into: Required before Story Bible Builder, Important during Story Bible development, Optional enhancement)
   - **Section 8: Story Bible Builder Payload** (Plain-text block using the exact 15 canonical labels below, with ZERO markdown formatting, NO asterisks, and NO headers inside the block. Use only validated information; where any field remains unresolved, write \`UNRESOLVED:\` followed by a concise statement):
     WORKING TITLE:
     ONE-LINE HOOK:
     GENRE & SCOPE:
     TARGET READER:
     COMP TITLES:
     CENTRAL CONFLICT:
     PROTAGONIST:
     PRIMARY STAKES:
     CORE THEME:
     EMOTIONAL TONE:
     ANTAGONIST / OPPOSING FORCE:
     KEY SUPPORTING CHARACTER:
     UNIQUE SELLING PROPOSITION:
     STRUCTURAL RISKS TO MONITOR:
     VISUAL TONE:
2. Ask ZERO further questions and end after the payload.

Return ONLY a valid JSON object matching this exact schema (no markdown code fences around the JSON):
{
  "working_title": "Specific Working Title",
  "one_line_hook": "Single-sentence premise: Protagonist + Inciting Incident + Goal + Central Obstacle",
  "logline_summary": "~100-word editorial narrative arc summary (not manuscript prose)",
  "comp_titles": "'X meets Y' with brief market positioning rationale",
  "genre_subgenre": "Primary and secondary genre classifications",
  "target_audience": "Target Audience / Age Category",
  "verdict": "GO" | "PIVOT" | "ABANDON",
  "verdict_subtitle": "1-2 sentence structural rationale for Overall Viability Score",
  "viability_score": 85,
  "overall_score_label": "High" | "Medium" | "Low",
  "recommended_scope": "Recommended Scope & Format + brief rationale tied to conflict density and engine capacity",
  "verdict_statement": "Full Go / Pivot / Abandon statement with specific structural justification and risk warnings/adjustments",
  "target_demographic": "Specific age, reader type, psychological profile",
  "tropes_analysis": {
    "core_tropes": ["Trope 1", "Trope 2", "Trope 3"],
    "market_saturation": "Low" | "Medium" | "High",
    "unique_gap": "The underserved angle or opportunity this concept exploits"
  },
  "commercial_potential": "High" | "Medium" | "Low",
  "writer_resonance": "How this aligns with the author's creative goals based only on what the writer has expressed",
  "narrative_engine": {
    "hook_strength": "Conversational prose assessment of whether the premise creates immediate interest and why",
    "conflict_density": "Conversational prose evaluation of whether the central struggle can generate cascading, distinct obstacles sufficient for the recommended scope",
    "stakes_integrity": "Conversational prose verification that failure carries real, irreversible consequences (personal, external, or both)",
    "protagonist_flaw": "Conversational prose identification of the core weakness, need, or sacrifice required for character growth",
    "setting_feasibility": "Conversational prose assessment of whether the setting limits or enhances the intended narrative scope",
    "engine_capacity": "Conversational prose statement on whether the narrative engine can sustain the recommended format"
  },
  "scorecard": {
    "emotional_promise": 88,
    "central_conflict": 86,
    "character_agency": 85,
    "distinctiveness": 90
  },
  "primary_fatal_flaw": "Primary Fatal Flaw / Structural Risk: state the risk, why it matters, its likely effect if unresolved, and the recommended correction",
  "critical_gaps": [
    "Gap 1 (stating why it matters, effect if unresolved, and decision needed — maps to Section 7 Task 1)",
    "Gap 2 (stating why it matters, effect if unresolved, and decision needed — maps to Section 7 Task 2)",
    "Gap 3 (stating why it matters, effect if unresolved, and decision needed — maps to Section 7 Task 3)"
  ],
  "visual_tone_anchor": "2-3 evocative sentences detailing sensory world, mood, and color palette",
  "strategic_action_items": {
    "required_before_bible": [
      "Task 1: Concrete, personalized prep task addressing Gap 1",
      "Task 2: Concrete, personalized prep task addressing Gap 2"
    ],
    "important_during_development": [
      "Task 3: Concrete, personalized task addressing Gap 3 during Story Bible development"
    ],
    "optional_enhancements": [
      "Optional refinement specific to this premise"
    ]
  },
  "report_markdown": "Complete, formatted 8-Section Story Viability Report in Markdown containing Sections 1 through 8 in full editorial detail per Section 7 of the Master Instructions.",
  "story_bible_payload": "Plain-text block with the exact 15 labels (WORKING TITLE: through VISUAL TONE:), zero markdown formatting, no asterisks, no headers, using UNRESOLVED: for any unvalidated field."
}`;

    const parsed = await callClaudeMessages<any>(prompt, 8192);

    const rawVerdict = String(parsed.verdict || "GO").toUpperCase();
    const verdict: ViabilityVerdict =
      rawVerdict === "PIVOT" ? "PIVOT" : rawVerdict === "ABANDON" ? "ABANDON" : "GO";

    const cleanPayload = sanitizePlainTextPayload(
      parsed.story_bible_payload ||
        `WORKING TITLE: ${parsed.working_title || "Untitled"}\nONE-LINE HOOK: ${parsed.one_line_hook || ""}`
    );

    return {
      working_title: parsed.working_title || "Untitled Story Project",
      one_line_hook: parsed.one_line_hook || "",
      logline_summary: parsed.logline_summary || "",
      comp_titles: parsed.comp_titles || "",
      genre_subgenre: parsed.genre_subgenre || currentState.genre || "Fiction",
      target_audience: parsed.target_audience || "Adult Fiction Readers",
      verdict,
      verdict_subtitle: parsed.verdict_subtitle || "",
      viability_score: typeof parsed.viability_score === "number" ? parsed.viability_score : 85,
      overall_score_label: parsed.overall_score_label || "High",
      recommended_scope: parsed.recommended_scope || currentState.scope || "Standalone Novel",
      verdict_statement: parsed.verdict_statement || "",
      target_demographic: parsed.target_demographic || "",
      tropes_analysis: {
        core_tropes: Array.isArray(parsed.tropes_analysis?.core_tropes)
          ? parsed.tropes_analysis.core_tropes
          : [],
        market_saturation: parsed.tropes_analysis?.market_saturation || "Medium",
        unique_gap: parsed.tropes_analysis?.unique_gap || "",
      },
      commercial_potential: parsed.commercial_potential || "Medium",
      writer_resonance: parsed.writer_resonance || "",
      narrative_engine: {
        hook_strength: parsed.narrative_engine?.hook_strength || "",
        conflict_density: parsed.narrative_engine?.conflict_density || "",
        stakes_integrity: parsed.narrative_engine?.stakes_integrity || "",
        protagonist_flaw: parsed.narrative_engine?.protagonist_flaw || "",
        setting_feasibility: parsed.narrative_engine?.setting_feasibility || "",
        engine_capacity: parsed.narrative_engine?.engine_capacity || "",
      },
      scorecard: {
        emotional_promise: parsed.scorecard?.emotional_promise ?? 85,
        central_conflict: parsed.scorecard?.central_conflict ?? 85,
        character_agency: parsed.scorecard?.character_agency ?? 85,
        distinctiveness: parsed.scorecard?.distinctiveness ?? 85,
      },
      primary_fatal_flaw: parsed.primary_fatal_flaw || "",
      critical_gaps: Array.isArray(parsed.critical_gaps) ? parsed.critical_gaps : [],
      visual_tone_anchor: parsed.visual_tone_anchor || "",
      strategic_action_items: {
        required_before_bible: Array.isArray(parsed.strategic_action_items?.required_before_bible)
          ? parsed.strategic_action_items.required_before_bible
          : [],
        important_during_development: Array.isArray(
          parsed.strategic_action_items?.important_during_development
        )
          ? parsed.strategic_action_items.important_during_development
          : [],
        optional_enhancements: Array.isArray(parsed.strategic_action_items?.optional_enhancements)
          ? parsed.strategic_action_items.optional_enhancements
          : [],
      },
      report_markdown: parsed.report_markdown || "",
      story_bible_payload: cleanPayload,
    };
  } catch (error) {
    console.error("Claude Turn 4 Report Error:", error);
    throw error;
  }
}
