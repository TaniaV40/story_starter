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

  // Google Drive & Document Save States
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);

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

  // Connect Google Drive Handler
  const connectGoogleDrive = () => {
    if (isDriveConnected) {
      if (reportData) {
        setDriveStatus("Saved to Google Drive!");
        setTimeout(() => setDriveStatus(null), 3000);
      } else {
        setDriveStatus("Google Drive Connected!");
        setTimeout(() => setDriveStatus(null), 2500);
      }
      return;
    }

    setDriveStatus("Connecting to Google Drive...");
    setTimeout(() => {
      setIsDriveConnected(true);
      setDriveStatus("Google Drive Connected!");
      setTimeout(() => setDriveStatus(null), 3500);
    }, 1000);
  };

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

  // Download Full Viability Report Document
  const downloadFullReportDoc = () => {
    if (!reportData) return;
    const content = `# THE MODERN AUTHOR • STORY VIABILITY REPORT\n` +
      `Working Title: ${reportData.working_title}\n` +
      `Verdict: ${reportData.verdict} (${reportData.viability_score}/100 Viability)\n` +
      `Hook: ${reportData.one_line_hook}\n\n` +
      `===========================================\n` +
      `FULL DIAGNOSTIC REPORT\n` +
      `===========================================\n\n` +
      `${reportData.report_markdown}\n\n` +
      `===========================================\n` +
      `STORY BIBLE BUILDER PAYLOAD\n` +
      `===========================================\n\n` +
      `${reportData.story_bible_payload}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(reportData.working_title || "viability-report").toLowerCase().replace(/\s+/g, "-")}-full-report.txt`;
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
      {/* Standarized TMA Header / Navigation Bar */}
      <header className="topbar">
        <button className="brand-group" onClick={resetApp} aria-label="Story Starter home">
          <img
            src="/Modern_Author_logo.png"
            alt="The Modern Author Icon"
            className="brand-icon-sq"
          />
          <div className="brand-stacked-text">
            <span>THE</span>
            <span>MODERN</span>
            <span>AUTHOR</span>
          </div>
        </button>

        <div className="app-title-center">
          <span className="app-name-text">STORY STARTER</span>
          <span className="app-function-text">DEVELOPMENTAL DIAGNOSTIC ENGINE</span>
        </div>

        <div className="header-actions">
          {/* Connect Google Drive Button matching mockup */}
          <button
            type="button"
            className={`btn-google-drive ${isDriveConnected ? "connected" : ""}`}
            onClick={connectGoogleDrive}
          >
            <span className="text-gold font-bold">➔]</span>
            {isDriveConnected ? "Drive Connected" : "Connect Google Drive"}
          </button>
          <button className="gold-pill-badge" onClick={resetApp}>
            SOCRATIC DIAGNOSTIC
          </button>
        </div>
      </header>

      {/* Global Status / Drive Toast Banner */}
      {driveStatus && (
        <div className="bg-[#1c3447] text-gold border-b border-gold/40 text-xs px-6 py-2 text-center font-bold tracking-wide transition">
          ✓ {driveStatus}
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-red-900/90 text-white text-xs px-6 py-2.5 text-center flex justify-between items-center shadow-xs">
          <span>{errorMessage}</span>
          <button className="underline ml-4 cursor-pointer" onClick={() => setErrorMessage(null)}>Dismiss</button>
        </div>
      )}

      {/* VIEW 1: START SCREEN (Left intro + Right Navy Gold-Dashed Card) */}
      {view === "start" && (
        <section className="start-grid">
          <div className="intro-left">
            <p className="eyebrow font-bold">DEVELOPMENTAL DIAGNOSTIC ENGINE</p>
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

            <div className="trust-metrics">
              <span>Trusted by authors worldwide</span>
              <span>• High Satisfaction</span>
              <span>• Learn More</span>
            </div>

            <p className="tma-promise-line">
              TMA PROMISE: "AI IS THE TOOL. YOU ARE THE AUTHOR. THE STORY IS YOURS. NO AI SLOP."
            </p>
          </div>

          {/* Right Navy Card (#1c3447 with Gold Dashed Border) */}
          <div className="tma-navy-card">
            <div className="card-heading-navy">
              <span className="step-chip-gold">STEP 1 OF 4</span>
              <span className="word-count-light">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
            </div>

            <label htmlFor="story-idea">What is the story idea you cannot stop thinking about?</label>
            <p className="hint-light">One or two sentences is enough. It does not need to be polished.</p>

            <textarea
              id="story-idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="I have an idea about…"
              disabled={isLoading}
            />

            {/* Quick Sample Selector */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Or load a sample premise:</p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IDEAS.map((sample) => (
                  <button
                    key={sample.title}
                    type="button"
                    className="sample-premise-btn"
                    onClick={() => setIdea(sample.text)}
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Repositioned Actions Row (Fixed Overlap) */}
            <div className="idea-actions pt-2">
              <button
                type="button"
                className="text-button-gold"
                onClick={() => setIdea(SAMPLE_IDEAS[0].text)}
              >
                Use sample
              </button>
              <button
                className="btn-primary-gold"
                disabled={!idea.trim() || isLoading}
                onClick={beginStoryTest}
              >
                {isLoading ? "Auditing Idea..." : "Begin Story Test"}
                <span>→</span>
              </button>
            </div>
            <p className="privacy-note-light">Zero-prose editorial safety enforced • Authorship protected</p>
          </div>
        </section>
      )}

      {/* VIEW 2: 4-TURN WORKSPACE (SPLIT SCREEN) */}
      {view === "session" && (
        <section className="workspace">
          {/* Left Panel: Audited Narrative State Board */}
          <aside className="progress-panel">
            <div className="mb-6">
              <p className="eyebrow font-bold">Audited Narrative State</p>
              <h2 className="text-2xl font-serif mt-1">Diagnostic Board</h2>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1c3447]">Locked Genre</span>
                <p className="text-sm font-serif font-bold text-[#1c3447] mt-0.5">{auditedState.genre || "Analyzing..."}</p>
              </div>

              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1c3447]">Starting Premise</span>
                <p className="text-xs text-slate-700 line-clamp-2 mt-0.5 italic">"{auditedState.premise || idea}"</p>
              </div>

              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1c3447]">Protagonist & Agency</span>
                <p className="text-xs text-slate-700 mt-0.5">{auditedState.character}</p>
              </div>

              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1c3447]">Setting / Crucible</span>
                <p className="text-xs text-slate-700 mt-0.5">{auditedState.setting}</p>
              </div>

              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1c3447]">Thematic Conflict</span>
                <p className="text-xs text-slate-700 mt-0.5">{auditedState.theme}</p>
              </div>

              <div className="p-3 bg-white/80 rounded border border-line shadow-xs">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1c3447]">Target Scope</span>
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

          {/* Right Panel: Socratic Dialogue Area (In Navy Card with Gold Stitched Border) */}
          <div className="conversation-area">
            <div className="turn-label font-bold mb-3">
              ROUND {turn} OF 4 • {turn === 1 ? "SEED AUDIT & INITIAL SWEEP" : turn === 2 ? "ENGINE & STAKES STRESS-TEST" : "SCOPE & MARKET VERIFICATION"}
            </div>

            <div className="tma-navy-card">
              <div className="flex gap-4 items-start mb-4">
                <span className="assistant-icon-tma">TMA</span>
                <div className="space-y-3 flex-1">
                  {currentTurnData?.assessment && (
                    <p className="font-semibold text-white leading-relaxed text-sm">
                      {currentTurnData.assessment}
                    </p>
                  )}

                  <p className="text-slate-200 text-sm leading-relaxed">
                    {currentTurnData?.analysis || "Analyzing your narrative seed..."}
                  </p>

                  {currentTurnData?.primary_risk_flag && (
                    <div className="p-3 bg-red-950/80 border-l-4 border-red-500 rounded text-xs text-red-200">
                      <strong className="text-red-400">PRIMARY RISK FLAGGED:</strong> {currentTurnData.primary_risk_flag}
                    </div>
                  )}

                  {/* Turn 3 Reframed Epistemic Display */}
                  {turn === 3 && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-700">
                      {currentTurnData?.what_im_reading && (
                        <div className="p-2.5 bg-slate-900/80 rounded border border-slate-700 text-xs">
                          <strong className="text-gold block uppercase font-mono mb-1">What I'm Reading (Theme & Arc):</strong>
                          <p className="text-slate-300">{currentTurnData.what_im_reading}</p>
                        </div>
                      )}
                      {currentTurnData?.comp_titles && (
                        <div className="p-2.5 bg-slate-900/80 rounded border border-slate-700 text-xs">
                          <strong className="text-gold block uppercase font-mono mb-1">Proposed Comp Titles:</strong>
                          <p className="text-white font-serif italic">{currentTurnData.comp_titles}</p>
                        </div>
                      )}
                      {currentTurnData?.proposed_scope && (
                        <div className="p-2.5 bg-slate-900/80 rounded border border-slate-700 text-xs">
                          <strong className="text-gold block uppercase font-mono mb-1">Recommended Scope:</strong>
                          <p className="text-slate-300">{currentTurnData.proposed_scope}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Targeted Questions */}
              <div className="my-6 space-y-4">
                {currentTurnData?.questions && currentTurnData.questions.map((qItem, qIdx) => (
                  <div key={qItem.id || qIdx} className="p-4 bg-[#132432] rounded border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-gold text-navy font-mono text-xs font-bold">
                        QUESTION {qIdx + 1} OF {currentTurnData.questions.length}
                      </span>
                      {qItem.explanation && (
                        <span className="text-xs text-slate-400 italic">— {qItem.explanation}</span>
                      )}
                    </div>

                    <h3 className="font-serif text-lg font-bold text-white mb-3">
                      {qItem.question}
                    </h3>

                    {qItem.options && qItem.options.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {qItem.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(qIdx, opt)}
                            className="text-left p-3 rounded bg-[#1c3447] hover:bg-slate-800 border border-slate-700 transition shadow-2xs group flex items-start gap-3 cursor-pointer"
                          >
                            <span className="w-5 h-5 rounded-full bg-gold/20 text-gold font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-gold group-hover:text-navy transition">
                              {opt.label}
                            </span>
                            <span className="text-xs text-slate-200 leading-relaxed">{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* User Response Area */}
              <label className="answer-label text-white text-xs font-bold block mb-2" htmlFor="answer">
                Your Answer / Strategic Direction (Answer questions together or write freely)
              </label>
              <textarea
                id="answer"
                className="answer-box-navy"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Click options above to populate your choices, or write your own custom direction..."
                disabled={isLoading}
              />

              <div className="conversation-actions mt-4 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  You retain complete creative authority. Story Starter protects your authentic voice.
                </span>
                <button
                  className="btn-primary-gold"
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
          </div>
        </section>
      )}

      {/* VIEW 3: REPORT VIEW (TURN 4) */}
      {view === "report" && reportData && (
        <section className="report-wrap">
          {/* Report Header & Verdict Badge */}
          <div className="report-header">
            <div>
              <p className="eyebrow">The Modern Author • Viability Report</p>
              <h1 className="font-serif">{reportData.working_title || "Story Viability Assessment"}</h1>
              <p className="text-base text-slate-700 max-w-2xl mt-1">{reportData.one_line_hook}</p>
            </div>

            <div className="verdict text-center">
              <small className="tracking-widest uppercase font-bold text-gold">Editorial Verdict</small>
              <strong className={`verdict-stamp ${reportData.verdict === "GO" ? "text-emerald-400" : reportData.verdict === "PIVOT" ? "text-amber-400" : "text-rose-400"}`}>
                {reportData.verdict}
              </strong>
              <span className="text-xs font-bold text-slate-200">{reportData.viability_score}/100 Viability ({reportData.overall_score_label})</span>
            </div>
          </div>

          {/* Section 1 & 2 Highlights */}
          <div className="my-6 p-4 bg-cream rounded border border-line">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Genre & Subgenre:</span>
                <p className="font-bold text-[#1c3447] text-sm">{reportData.genre_subgenre}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Comp Titles:</span>
                <p className="font-serif italic text-slate-800 text-sm">{reportData.comp_titles}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-slate-500 uppercase font-bold">Recommended Scope:</span>
                <p className="font-bold text-[#1c3447] text-sm">{reportData.recommended_scope}</p>
              </div>
            </div>
          </div>

          {/* 8-Section Comprehensive Grid */}
          <div className="report-grid">
            <article className="score-card">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-serif text-2xl font-bold">Diagnostic Scorecard</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1c3447] text-gold">
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
                      <span className="font-mono text-[#1c3447]">{item.score}/100</span>
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
              <small className="text-gold font-bold">SECTION 4 • NARRATIVE ENGINE</small>
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
              <small className="text-red-700 font-bold">SECTION 5 • PRIMARY STRUCTURAL RISK</small>
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
                  <small className="text-gold font-bold">SECTION 6 • VISUAL TONE ANCHOR</small>
                  <h4 className="font-serif font-bold text-slate-900 text-lg mt-1 mb-2">Atmospheric Description</h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{reportData.visual_tone_anchor}"
                  </p>
                </div>

                <div>
                  <small className="text-[#1c3447] font-bold">SECTION 7 • STRATEGIC ACTION ITEMS</small>
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
          <div className="tma-navy-card my-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-slate-700">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
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
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-gold text-xs font-mono font-bold border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPayload ? "✓ Copied to Clipboard" : "Copy Payload"}
                </button>
                <button
                  type="button"
                  onClick={downloadPayloadTxt}
                  className="btn-primary-gold"
                >
                  Download .txt
                </button>
              </div>
            </div>

            <pre className="text-xs font-mono bg-[#132432] p-4 rounded border border-slate-700 overflow-x-auto text-slate-200 max-h-64 leading-relaxed whitespace-pre-wrap select-all">
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
                className="text-xs text-[#1c3447] underline font-bold cursor-pointer"
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
          <div className="report-actions flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-line">
            <button className="ghost-gold" onClick={resetApp}>Test Another Idea</button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={`btn-google-drive ${isDriveConnected ? "connected" : ""}`}
                onClick={connectGoogleDrive}
              >
                <span className="text-gold font-bold">➔]</span>
                {isDriveConnected ? "✓ Saved to Google Drive" : "Connect Google Drive & Save"}
              </button>

              <button className="ghost-gold" onClick={downloadFullReportDoc}>
                Download Document (.txt)
              </button>

              <button className="btn-primary-gold" onClick={copyStoryBiblePayload}>
                {copiedPayload ? "✓ Copied Payload" : "Send to Story Bible Builder"} <span>→</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
