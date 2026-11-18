import type {
  AuditedState,
  SessionMessage,
  StorySession,
  TurnResponse,
  ViabilityReport,
} from "./types";
import {
  callGeminiTurn1,
  callGeminiTurn,
  callGeminiTurn4Report,
} from "./gemini";

// Global in-memory storage for active sessions
const sessionsMap = new Map<string, StorySession>();

function generateId(): string {
  return "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}

export function getSession(id: string): StorySession | undefined {
  return sessionsMap.get(id);
}

function formatTurnForTranscript(turnResp: TurnResponse): string {
  const parts: string[] = [];
  if (turnResp.assessment) parts.push(turnResp.assessment);
  if (turnResp.analysis && turnResp.analysis !== turnResp.assessment) {
    parts.push(turnResp.analysis);
  }
  if (turnResp.primary_risk_flag) {
    parts.push(`Primary Structural Risk: ${turnResp.primary_risk_flag}`);
  }
  if (turnResp.what_im_reading) {
    parts.push(`What I'm Reading: ${turnResp.what_im_reading}`);
  }
  if (turnResp.what_i_need) {
    parts.push(`What I Still Need from You: ${turnResp.what_i_need}`);
  }
  if (turnResp.proposed_scope) {
    parts.push(`Proposed Scope: ${turnResp.proposed_scope}`);
  }
  if (turnResp.comp_titles) {
    parts.push(`Comp Titles: ${turnResp.comp_titles}`);
  }
  if (turnResp.target_reader) {
    parts.push(`Target Reader & Genre: ${turnResp.target_reader}`);
  }
  if (turnResp.whats_fresh) {
    parts.push(`What's Fresh: ${turnResp.whats_fresh}`);
  }
  if (turnResp.questions && turnResp.questions.length > 0) {
    const qFormatted = turnResp.questions
      .map((q, i) => {
        const opts = (q.options || [])
          .map((o) => `  (${o.label}) ${o.text}`)
          .join("\n");
        return `Question ${i + 1}: ${q.question}${q.explanation ? ` (${q.explanation})` : ""}\n${opts}`;
      })
      .join("\n\n");
    parts.push(qFormatted);
  }
  return parts.join("\n\n");
}

export async function createSession(
  initialSeed: string
): Promise<{ session: StorySession; turn1Response: TurnResponse }> {
  const sessionId = generateId();
  const now = new Date().toISOString();

  // Call Claude Turn 1 to conduct state audit & generate 2 probing questions
  const turn1Response = await callGeminiTurn1(initialSeed);

  const initialAuditedState: AuditedState = {
    genre: turn1Response.state_audit?.genre || "Fiction",
    premise: turn1Response.state_audit?.premise || initialSeed.trim(),
    character: turn1Response.state_audit?.character || "Pending Turn 2...",
    setting: turn1Response.state_audit?.setting || "Pending Turn 2...",
    theme: turn1Response.state_audit?.theme || "Pending Turn 3...",
    scope: turn1Response.state_audit?.scope || "Pending Turn 3...",
  };

  const userMessage: SessionMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "user",
    turn: 1,
    content: initialSeed,
    timestamp: now,
  };

  const modelMessage: SessionMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "model",
    turn: 1,
    content: formatTurnForTranscript(turn1Response),
    timestamp: new Date().toISOString(),
    structured_data: turn1Response,
  };

  const session: StorySession = {
    id: sessionId,
    createdAt: now,
    updatedAt: now,
    turnCount: 1,
    stage: "foundations",
    initialSeed: initialSeed.trim(),
    auditedState: initialAuditedState,
    messages: [userMessage, modelMessage],
  };

  sessionsMap.set(sessionId, session);
  return { session, turn1Response };
}

export async function processTurnAnswer(
  sessionId: string,
  userAnswer: string,
  fallbackSession?: StorySession
): Promise<{ session: StorySession; turnResponse: TurnResponse }> {
  let session = sessionsMap.get(sessionId);
  if (!session && fallbackSession) {
    session = fallbackSession;
    sessionsMap.set(sessionId, session);
  }
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const currentTurn = session.turnCount;
  const nextTurn = currentTurn + 1;

  if (nextTurn > 3) {
    throw new Error("Turn count exceeded. Use report endpoint for Turn 4.");
  }

  const now = new Date().toISOString();

  // Record user answer
  session.messages.push({
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "user",
    turn: nextTurn,
    content: userAnswer,
    timestamp: now,
  });

  // Call Claude for Turn 2 or Turn 3
  const turnResponse = await callGeminiTurn(
    nextTurn,
    session.messages,
    userAnswer,
    session.auditedState
  );

  // Merge state audit updates
  if (turnResponse.state_audit) {
    session.auditedState = {
      ...session.auditedState,
      ...turnResponse.state_audit,
    };
  }

  // Update session stage and turn count
  session.turnCount = nextTurn;
  session.stage = nextTurn === 2 ? "stress_test" : "verification";
  session.updatedAt = now;

  // Record model response
  session.messages.push({
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "model",
    turn: nextTurn,
    content: formatTurnForTranscript(turnResponse),
    timestamp: new Date().toISOString(),
    structured_data: turnResponse,
  });

  sessionsMap.set(sessionId, session);
  return { session, turnResponse };
}

export async function generateReport(
  sessionId: string,
  finalAnswer: string,
  fallbackSession?: StorySession
): Promise<{ session: StorySession; report: ViabilityReport }> {
  let session = sessionsMap.get(sessionId);
  if (!session && fallbackSession) {
    session = fallbackSession;
    sessionsMap.set(sessionId, session);
  }
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const now = new Date().toISOString();

  // Record final answer
  session.messages.push({
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "user",
    turn: 4,
    content: finalAnswer,
    timestamp: now,
  });

  // Call Claude Turn 4 Report generator
  const report = await callGeminiTurn4Report(
    session.messages,
    finalAnswer,
    session.auditedState,
    session.initialSeed
  );

  session.turnCount = 4;
  session.stage = "complete";
  session.report = report;
  session.updatedAt = now;

  // Record model report message
  session.messages.push({
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "model",
    turn: 4,
    content: report.report_markdown,
    timestamp: new Date().toISOString(),
    structured_data: report,
  });

  sessionsMap.set(sessionId, session);
  return { session, report };
}
