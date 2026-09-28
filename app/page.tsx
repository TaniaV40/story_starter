"use client";

import { useState } from "react";
import {
  AuditedState,
  DiagnosticQuestion,
  ScorecardMetrics,
  StorySession,
  StoryStage,
  TurnOption,
  TurnResponse,
  ViabilityReport,
} from "@/lib/types";

type View = "start" | "session" | "report";

const SAMPLE_IDEAS = [
  {
    title: "Gothic Romance",
    text: "I have an idea for a Gothic romance about two people who keep finding and losing each other across different lifetimes, but in this life, one of them remembers everything.",
  },
  {
    title: "Sci-Fi Thriller",
    text: "A space station sanitation specialist accidentally drinks experimental alien biological liquid, gaining sensory telepathy hours before corporate inspectors arrive.",
  },
  {
    title: "Dark Fantasy",
    text: "An executioner in a high-fantasy kingdom discovers that every criminal he has executed for treason was actually framed by the immortal guild of memory-weavers.",
  },
  {
    title: "Psychological Mystery",
    text: "A retired structural engineer receives blueprints for a missing skyscraper that disappeared from city records twenty years ago—drawn in his own handwriting.",
  },
];

export default function Home() {
  const [view, setView] = useState<View>("start");
  const [idea, setIdea] = useState("");
  const [answer, setAnswer] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turn, setTurn] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active session data
  const [auditedState, setAuditedState] = useState<AuditedState>({
    genre: "Analyzing seed...",
    premise: "",
    character: "Pending Turn 2...",
    setting: "Pending Turn 2...",
    theme: "Pending Turn 3...",
    scope: "Pending Turn 3...",
  });

  const [currentTurnData, setCurrentTurnData] = useState<TurnResponse | null>(null);
  const [reportData, setReportData] = useState<ViabilityReport | null>(null);
  const [showFullMarkdown, setShowFullMarkdown] = useState(false);

  // Step 1: Start Story Test & Initialize Session
  const beginStoryTest = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story_seed: idea.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = (await res.json()) as any;
      setSessionId(data.sessionId);
      setCurrentTurnData(data.turn);
      setTurn(1);

      if (data.turn?.state_audit) {
        setAuditedState((prev) => ({
          ...prev,
          ...data.turn.state_audit,
          premise: idea.trim(),
        }));
      }

      setView("session");
    } catch (err: any) {
      console.error("Failed to initialize session:", err);
      setErrorMessage("Could not start session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 & 3: Submit answer for Turn 2 or Turn 3
  const submitTurn = async () => {
    if (!answer.trim() || !sessionId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (turn === 3) {
        // Generate Report on Turn 4
        const res = await fetch(`/api/session/${sessionId}/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_answer: answer.trim() }),
        });

        if (!res.ok) throw new Error(`Report generation returned ${res.status}`);

        const data = (await res.json()) as any;
        setReportData(data.report);
        setTurn(4);
        setView("report");
      } else {
        // Advance to Turn 2 or 3
        const res = await fetch(`/api/session/${sessionId}/turn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_answer: answer.trim() }),
        });

        if (!res.ok) throw new Error(`Turn returned ${res.status}`);

        const data = (await res.json()) as any;
        setCurrentTurnData(data.turn);
        setTurn(data.turn.turn);

        if (data.turn?.state_audit) {
          setAuditedState((prev) => ({
            ...prev,
            ...data.turn.state_audit,
          }));
        }

        setAnswer("");
      }
    } catch (err: any) {
      console.error("Failed to submit turn:", err);
      setErrorMessage("Could not process answer. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick select an option into the answer box
  const handleSelectOption = (questionIndex: number, option: TurnOption) => {
    const prefix = currentTurnData?.questions && currentTurnData.questions.length > 1
      ? `For Question ${questionIndex + 1} (${option.label}): ${option.text}\n`
      : `Option ${option.label}: ${option.text}`;

    setAnswer((prev) => {
      if (prev.includes(`Question ${questionIndex + 1}`)) {
        // Replace existing question answer
        const regex = new RegExp(`For Question ${questionIndex + 1}[^\\n]*\\n?`, "g");
        return prev.replace(regex, prefix);
      }
      return prev ? `${prev.trim()}\n\n${prefix}` : prefix;
    });
  };

  // Copy Story Bible Builder payload to clipboard
  const copyStoryBiblePayload = () => {
    if (!reportData?.story_bible_payload) return;
    navigator.clipboard.writeText(reportData.story_bible_payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  // Download Story Bible Builder payload
  const downloadPayloadTxt = () => {
    if (!reportData?.story_bible_payload) return;
    const blob = new Blob([reportData.story_bible_payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(reportData.working_title || "story-bible-payload").toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to new idea
  const resetApp = () => {
    setIdea("");
    setAnswer("");
    setSessionId(null);
    setTurn(1);
    setCurrentTurnData(null);
    setReportData(null);
    setAuditedState({
      genre: "Analyzing seed...",
      premise: "",
      character: "Pending Turn 2...",
      setting: "Pending Turn 2...",
      theme: "Pending Turn 3...",
      scope: "Pending Turn 3...",
    });
    setView("start");
  };

  const wordCount = idea.trim() ? idea.trim().split(/\s+/).length : 0;

  return (
    <main className="app-shell min-h-screen flex flex-col justify-between">
      {/* Global Brand Topbar */}
      <header className="topbar">
        <button className="brand" onClick={resetApp} aria-label="Story Starter home">
          <img
            src="/TMA_main_LOGO.png"
            alt="The Modern Author Logo"
            className="brand-logo-img"
          />
          <div className="brand-text-block">
            <strong>THE MODERN AUTHOR</strong>
            <small>Story Starter • Developmental Diagnostic</small>
          </div>
        </button>
        <div className="header-actions">
          <span className="secure">Socratic Mode Active</span>
          <button className="ghost" onClick={resetApp}>New Idea</button>
          <div className="avatar" title="The Modern Author">TMA</div>
        </div>
      </header>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-red-900/90 text-white text-xs px-6 py-2.5 text-center flex justify-between items-center shadow-xs">
          <span>{errorMessage}</span>
          <button className="underline ml-4 cursor-pointer" onClick={() => setErrorMessage(null)}>Dismiss</button>
        </div>
      )}

      {/* VIEW 1: START SCREEN */}
      {view === "start" && (
        <section className="start-grid">
          <div className="intro">
            <p className="eyebrow">Developmental Diagnostic Engine</p>
            <h1>Find out if your idea can carry a whole manuscript.</h1>
            <p className="lede">
              Bring the spark. Guided by the editorial methodology of <strong>The Modern Author</strong>, Story Starter runs a rigorous 4-turn Socratic developmental audit—stress-testing stakes, conflict density, and character agency while protecting your authentic voice.
            </p>
            
            <div className="promise-list">
              <p>
                <span>01</span>
                <b>Audit</b>
                <span>Six-Parameter real-time diagnostic state audit</span>
              </p>
              <p>
                <span>02</span>
                <b>Stress-Test</b>
                <span>Escalating conflict, antagonistic friction, & agency</span>
              </p>
              <p>
                <span>03</span>
                <b>Verify</b>
                <span>Comp titles, target reader profile, & format scope</span>
              </p>
              <p>
                <span>04</span>
                <b>Export</b>
                <span>Eight-section Viability Report & Story Bible Builder payload</span>
              </p>
            </div>

            <div className="mt-8 pt-4 flex items-center gap-3 text-xs text-slate-500">
              <span className="text-[#C9A66B] font-bold">TMA PROMISE:</span>
              <span>"AI is the tool. You are the author. The story is yours. No AI slop."</span>
            </div>
          </div>

          <div className="idea-card">
            <div className="card-heading">
              <span className="step-chip">STEP 1 OF 4</span>
              <span className="word-count">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
            </div>

            <label htmlFor="story-idea">What is the story idea you cannot stop thinking about?</label>
            <p className="hint">One or two sentences is enough. It does not need to be polished.</p>

            <textarea
              id="story-idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="I have an idea about…"
              disabled={isLoading}
            />

            {/* Quick Sample Selector */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Or load a sample premise:</p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IDEAS.map((sample) => (
                  <button
                    key={sample.title}
                    type="button"
                    className="text-xs px-2.5 py-1 rounded bg-slate-200/90 hover:bg-slate-300 text-slate-800 transition cursor-pointer font-medium"
                    onClick={() => setIdea(sample.text)}
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="idea-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => setIdea(SAMPLE_IDEAS[0].text)}
              >
                Use sample
              </button>
              <button
                className="primary"
                disabled={!idea.trim() || isLoading}
                onClick={beginStoryTest}
              >
                {isLoading ? "Auditing Idea..." : "Begin Story Test"}
                <span>→</span>
              </button>
            </div>
            <p className="privacy-note">Zero-prose editorial safety enforced • Authorship protected</p>
          </div>
        </section>
      )}

      {/* VIEW 2: 4-TURN WORKSPACE (SPLIT SCREEN) */}
      {view === "session" && (
        <section className="workspace">
          {/* Left Panel: Audited Narrative State Board */}
          <aside className="progress-panel">
            <div className="mb-6">
              <p className="eyebrow">Audited Narrative State</p>
              <h2 className="text-2xl font-serif mt-1">Diagnostic Board</h2>
            </div>

            <div className="space-y-3 mb-6">
              {/* Parameter 1: Genre */}
              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0D1B2A]">Locked Genre</span>
                <p className="text-sm font-serif font-bold text-[#0D1B2A] mt-0.5">{auditedState.genre || "Analyzing..."}</p>
              </div>

              {/* Parameter 2: Premise */}
              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0D1B2A]">Starting Premise</span>
                <p className="text-xs text-slate-700 line-clamp-2 mt-0.5 italic">"{auditedState.premise || idea}"</p>
              </div>

              {/* Parameter 3: Character Agency */}
              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0D1B2A]">Protagonist & Agency</span>
                <p className="text-xs text-slate-700 mt-0.5">{auditedState.character}</p>
              </div>

              {/* Parameter 4: Setting / Crucible */}
              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0D1B2A]">Setting / Crucible</span>
                <p className="text-xs text-slate-700 mt-0.5">{auditedState.setting}</p>
              </div>

              {/* Parameter 5: Core Theme */}
              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0D1B2A]">Thematic Conflict</span>
                <p className="text-xs text-slate-700 mt-0.5">{auditedState.theme}</p>
              </div>

              {/* Parameter 6: Target Scope */}
              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#0D1B2A]">Target Scope</span>
                <p className="text-xs text-slate-700 mt-0.5">{auditedState.scope}</p>
              </div>
            </div>

            {/* 4-Step Progress Rows */}
            <div className="border-t border-line pt-4 space-y-3">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Diagnostic Milestones</span>
              {[
                { round: 1, title: "Turn 1: Seed Audit", desc: "Initial sweep & 2 probing questions" },
                { round: 2, title: "Turn 2: Engine & Stakes", desc: "Conflict density & risk analysis" },
                { round: 3, title: "Turn 3: Scope & Market", desc: "Comp titles & reader verification" },
                { round: 4, title: "Turn 4: Viability Report", desc: "8-Section report & Story Bible payload" },
              ].map((step) => {
                const isDone = turn > step.round;
                const isActive = turn === step.round;
                return (
                  <div
                    key={step.round}
                    className={`progress-row ${isDone ? "done" : isActive ? "active" : ""}`}
                  >
                    <span>{isDone ? "✓" : step.round}</span>
                    <div>
                      <b>{step.title}</b>
                      <small>{isDone ? "Completed" : isActive ? "Active Round" : "Pending"}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Panel: Socratic Dialogue Area */}
          <div className="conversation">
            <div className="turn-label">
              ROUND {turn} OF 4 • {turn === 1 ? "SEED AUDIT & INITIAL SWEEP" : turn === 2 ? "ENGINE & STAKES STRESS-TEST" : "SCOPE & MARKET VERIFICATION"}
            </div>

            {/* Editorial Assessment Card */}
            <div className="assistant-card flex-col sm:flex-row">
              <span className="assistant-icon">TMA</span>
              <div className="space-y-3 flex-1">
                {currentTurnData?.assessment && (
                  <p className="font-semibold text-slate-900 leading-relaxed text-sm">
                    {currentTurnData.assessment}
                  </p>
                )}

                <p className="analysis-line">
                  {currentTurnData?.analysis || "Analyzing your narrative seed..."}
                </p>

                {currentTurnData?.primary_risk_flag && (
                  <div className="p-3 bg-red-50 border-l-3 border-[#9E2A2B] rounded text-xs text-red-950">
                    <strong>PRIMARY RISK FLAGGED:</strong> {currentTurnData.primary_risk_flag}
                  </div>
                )}

                {/* Turn 3 Reframed Epistemic Display */}
                {turn === 3 && (
                  <div className="space-y-2.5 pt-2 border-t border-line/60">
                    {currentTurnData?.what_im_reading && (
                      <div className="p-2.5 bg-white/70 rounded border border-line text-xs">
                        <strong className="text-[#0D1B2A] block uppercase font-mono mb-1">What I'm Reading (Theme & Arc):</strong>
                        <p className="text-slate-700">{currentTurnData.what_im_reading}</p>
                      </div>
                    )}
                    {currentTurnData?.comp_titles && (
                      <div className="p-2.5 bg-white/70 rounded border border-line text-xs">
                        <strong className="text-[#0D1B2A] block uppercase font-mono mb-1">Proposed Comp Titles:</strong>
                        <p className="text-slate-800 font-serif italic">{currentTurnData.comp_titles}</p>
                      </div>
                    )}
                    {currentTurnData?.proposed_scope && (
                      <div className="p-2.5 bg-white/70 rounded border border-line text-xs">
                        <strong className="text-[#0D1B2A] block uppercase font-mono mb-1">Recommended Scope:</strong>
                        <p className="text-slate-700">{currentTurnData.proposed_scope}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Targeted Socratic Questions (Exact 2 in Turn 1 & 2, 1 in Turn 3) */}
            <div className="my-6 space-y-6">
              {currentTurnData?.questions && currentTurnData.questions.map((qItem, qIdx) => (
                <div key={qItem.id || qIdx} className="p-5 bg-cream/90 rounded border border-line shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#0D1B2A] text-[#C9A66B] font-mono text-xs font-bold">
                      QUESTION {qIdx + 1} OF {currentTurnData.questions.length}
                    </span>
                    {qItem.explanation && (
                      <span className="text-xs text-slate-500 italic">— {qItem.explanation}</span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#0D1B2A] mb-3">
                    {qItem.question}
                  </h3>

                  {qItem.options && qItem.options.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {qItem.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, opt)}
                          className="text-left p-3 rounded bg-white hover:bg-slate-100 border border-line transition shadow-2xs group flex items-start gap-3 cursor-pointer"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#0D1B2A]/10 text-[#0D1B2A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#0D1B2A] group-hover:text-[#C9A66B] transition">
                            {opt.label}
                          </span>
                          <span className="text-xs text-slate-800 leading-relaxed">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User Response Area */}
            <label className="answer-label" htmlFor="answer">
              Your Answer / Strategic Direction (Answer both questions together or write freely)
            </label>
            <textarea
              id="answer"
              className="answer-box"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Click options above to populate your choices, or write your own custom direction..."
              disabled={isLoading}
            />

            <div className="conversation-actions">
              <span className="text-xs text-slate-500">
                You retain complete creative authority. Story Starter will not ghostwrite your prose.
              </span>
              <button
                className="primary"
                disabled={!answer.trim() || isLoading}
                onClick={submitTurn}
              >
                {isLoading
                  ? turn === 3
                    ? "Generating 8-Section Viability Report..."
                    : "Analyzing Response..."
                  : turn === 3
                  ? "Generate Viability Report"
                  : "Submit Turn"}
                <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 3: REPORT VIEW (TURN 4) */}
      {view === "report" && reportData && (
        <section className="report-wrap">
          {/* Report Header & Editorial Verdict Badge */}
          <div className="report-header">
            <div>
              <p className="eyebrow">The Modern Author • Viability Report</p>
              <h1 className="font-serif">{reportData.working_title || "Story Viability Assessment"}</h1>
              <p className="text-base text-slate-700 max-w-2xl mt-1">{reportData.one_line_hook}</p>
            </div>

            <div className="verdict text-center">
              <small className="tracking-widest uppercase font-bold text-slate-500">Editorial Verdict</small>
              <strong className={`verdict-stamp ${reportData.verdict === "GO" ? "text-emerald-800" : reportData.verdict === "PIVOT" ? "text-amber-800" : "text-rose-800"}`}>
                {reportData.verdict}
              </strong>
              <span className="text-xs font-bold text-slate-600">{reportData.viability_score}/100 Viability ({reportData.overall_score_label})</span>
            </div>
          </div>

          {/* Section 1 & 2 Highlights */}
          <div className="my-6 p-4 bg-cream rounded border border-line">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Genre & Subgenre:</span>
                <p className="font-bold text-[#0D1B2A] text-sm">{reportData.genre_subgenre}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Comp Titles:</span>
                <p className="font-serif italic text-slate-800 text-sm">{reportData.comp_titles}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Recommended Scope:</span>
                <p className="font-bold text-[#0D1B2A] text-sm">{reportData.recommended_scope}</p>
              </div>
            </div>
          </div>

          {/* 8-Section Comprehensive Grid */}
          <div className="report-grid">
            {/* Scorecard */}
            <article className="score-card">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-serif text-2xl font-bold">Diagnostic Scorecard</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0D1B2A] text-[#C9A66B]">
                  {reportData.viability_score}% Viable
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Core structural dimensions audited:</p>

              <div className="space-y-4">
                {[
                  { label: "Emotional Promise & Hook", score: reportData.scorecard.emotional_promise },
                  { label: "Central Conflict & Density", score: reportData.scorecard.central_conflict },
                  { label: "Protagonist Agency & Stakes", score: reportData.scorecard.character_agency },
                  { label: "Concept Distinctiveness", score: reportData.scorecard.distinctiveness },
                ].map((item) => (
                  <div className="metric" key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{item.label}</span>
                      <span className="font-mono text-[#0D1B2A]">{item.score}/100</span>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-line text-xs space-y-2">
                <p><strong>Verdict Statement:</strong> {reportData.verdict_statement}</p>
              </div>
            </article>

            {/* Section 4: Narrative Engine Analysis */}
            <article className="finding-card">
              <small className="text-[#C9A66B] font-bold">SECTION 4 • NARRATIVE ENGINE</small>
              <h3 className="font-serif text-xl font-bold text-slate-900 mt-1 mb-2">
                Structural Capacity Analysis
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <p><strong>Hook Strength:</strong> {reportData.narrative_engine.hook_strength}</p>
                <p><strong>Conflict Density:</strong> {reportData.narrative_engine.conflict_density}</p>
                <p><strong>Stakes Integrity:</strong> {reportData.narrative_engine.stakes_integrity}</p>
                <p><strong>Protagonist Flaw:</strong> {reportData.narrative_engine.protagonist_flaw}</p>
              </div>
            </article>

            {/* Section 5: Risk Analysis */}
            <article className="finding-card risk">
              <small className="text-[#9E2A2B] font-bold">SECTION 5 • PRIMARY STRUCTURAL RISK</small>
              <h3 className="font-serif text-xl font-bold text-slate-900 mt-1 mb-2">
                {reportData.primary_fatal_flaw}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                Identified during developmental audit to prevent midpoint stalling.
              </p>
              <strong className="text-[11px] font-mono uppercase block text-slate-600">Critical Gaps to Resolve:</strong>
              <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 mt-1">
                {reportData.critical_gaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </article>

            {/* Section 6 & 7: Visual Tone & Action Items */}
            <article className="next-card md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <small className="text-[#C9A66B] font-bold">SECTION 6 • VISUAL TONE ANCHOR</small>
                  <h4 className="font-serif font-bold text-slate-900 text-lg mt-1 mb-2">Atmospheric Description</h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{reportData.visual_tone_anchor}"
                  </p>
                </div>

                <div>
                  <small className="text-[#0D1B2A] font-bold">SECTION 7 • STRATEGIC ACTION ITEMS</small>
                  <h4 className="font-serif font-bold text-slate-900 text-lg mt-1 mb-2">Required Before Story Bible:</h4>
                  <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-700">
                    {reportData.strategic_action_items.required_before_bible.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>
          </div>

          {/* Section 8: Story Bible Builder Payload Drawer */}
          <div className="my-8 p-6 bg-[#0D1B2A] text-slate-100 rounded border border-[#1F2E3D] shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-slate-700">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A66B] font-bold">
                  Section 8 • Canonical Payload
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                  Story Bible Builder Ingestion Block
                </h3>
                <p className="text-xs text-slate-300">
                  Unformatted plain-text structural specification formatted for direct ingestion into Story Bible Builder.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyStoryBiblePayload}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-[#C9A66B] text-xs font-mono font-bold border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPayload ? "✓ Copied to Clipboard" : "Copy Payload"}
                </button>
                <button
                  type="button"
                  onClick={downloadPayloadTxt}
                  className="px-4 py-2 rounded bg-[#C9A66B] hover:bg-[#E6D2B0] text-[#0D1B2A] text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  Download .txt
                </button>
              </div>
            </div>

            <pre className="text-xs font-mono bg-slate-950 p-4 rounded border border-slate-800 overflow-x-auto text-slate-200 max-h-64 leading-relaxed whitespace-pre-wrap select-all">
              {reportData.story_bible_payload}
            </pre>
          </div>

          {/* Optional Full Markdown Report Collapse */}
          <div className="my-6 border border-line rounded p-4 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Full 8-Section Diagnostic Report (Markdown)
              </span>
              <button
                className="text-xs text-[#0D1B2A] underline font-bold cursor-pointer"
                onClick={() => setShowFullMarkdown(!showFullMarkdown)}
              >
                {showFullMarkdown ? "Hide Full Report" : "View Complete Report"}
              </button>
            </div>

            {showFullMarkdown && (
              <div className="mt-4 pt-4 border-t border-line text-sm text-slate-800 space-y-4 whitespace-pre-line font-serif leading-relaxed">
                {reportData.report_markdown}
              </div>
            )}
          </div>

          {/* Report Footer Actions */}
          <div className="report-actions">
            <button className="ghost" onClick={resetApp}>Test Another Idea</button>
            <button className="secondary" onClick={downloadPayloadTxt}>Download Spec (.txt)</button>
            <button className="primary" onClick={copyStoryBiblePayload}>
              {copiedPayload ? "✓ Copied Payload" : "Send to Story Bible Builder"} <span>→</span>
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
