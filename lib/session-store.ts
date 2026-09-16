import {
  AuditedState,
  SessionMessage,
  StorySession,
  StoryStage,
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

export async function createSession(initialSeed: string): Promise<{ session: StorySession; turn1Response: TurnResponse }> {
  const sessionId = generateId();
  const now = new Date().toISOString();

  // Call Gemini Turn 1 to conduct state audit & generate probing questions
  const turn1Response = await callGeminiTurn1(initialSeed);

  const initialAuditedState: AuditedState = {
    genre: turn1Response.state_audit?.genre || "Fiction",
    premise: initialSeed.trim(),
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

  const qFormatted = (turn1Response.questions || []).map((q, i) => `Question ${i + 1}: ${q.question}`).join("\n");
  const modelMessage: SessionMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "model",
    turn: 1,
    content: `${turn1Response.analysis}\n\n${qFormatted}`,
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
  userAnswer: string
): Promise<{ session: StorySession; turnResponse: TurnResponse }> {
  const session = sessionsMap.get(sessionId);
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

  // Call Gemini for next turn
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
  const qTurnFormatted = (turnResponse.questions || []).map((q, i) => `Question ${i + 1}: ${q.question}`).join("\n");
  session.messages.push({
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    role: "model",
    turn: nextTurn,
    content: `${turnResponse.analysis}\n\n${qTurnFormatted}`,
    timestamp: new Date().toISOString(),
    structured_data: turnResponse,
  });

  sessionsMap.set(sessionId, session);
  return { session, turnResponse };
}

export async function generateReport(
  sessionId: string,
  finalAnswer: string
): Promise<{ session: StorySession; report: ViabilityReport }> {
  const session = sessionsMap.get(sessionId);
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

  // Call Gemini Turn 4 Report generator
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
