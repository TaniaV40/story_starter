import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  processTurnAnswer,
  generateReport,
  getSession,
} from "../lib/session-store.ts";
import { assertZeroProseCompliance } from "../lib/gemini.ts";

test("Story Starter 4-Turn State Machine (Master Instructions Compliance)", async (t) => {
  const storySeed =
    "A space station sanitation specialist accidentally drinks experimental alien liquid, gaining sensory telepathy hours before corporate inspectors arrive.";

  await t.test("Turn 1: Seed Audit and Exactly 2 Probing Questions", async () => {
    const { session, turn1Response } = await createSession(storySeed);

    assert.ok(session.id);
    assert.equal(session.turnCount, 1);
    assert.equal(session.stage, "foundations");

    // Verify exactly 2 questions in Turn 1
    assert.equal(turn1Response.questions.length, 2, "Turn 1 must ask exactly 2 questions");
    assert.ok(turn1Response.questions[0].options.length >= 2, "Question 1 must have options");
    assert.ok(turn1Response.questions[1].options.length >= 2, "Question 2 must have options");

    // Verify 6-parameter state audit
    assert.ok(session.auditedState.genre);
    assert.equal(session.auditedState.premise, storySeed);

    // Verify zero-prose compliance
    assert.ok(assertZeroProseCompliance(turn1Response.analysis));
  });

  await t.test("Turn 2: Engine & Stakes Stress-Test with Exactly 2 Refining Questions", async () => {
    const { session } = await createSession(storySeed);
    const userAnswerTurn2 = "Option 1A: Custodial codes. Option 2A: Diagnostic AI flags bio-signatures.";

    const { session: updatedSession, turnResponse } = await processTurnAnswer(
      session.id,
      userAnswerTurn2
    );

    assert.equal(updatedSession.turnCount, 2);
    assert.equal(updatedSession.stage, "stress_test");
    assert.equal(turnResponse.questions.length, 2, "Turn 2 must ask exactly 2 questions");
    assert.ok(turnResponse.primary_risk_flag, "Turn 2 must flag primary risk");
  });

  await t.test("Turn 3: Scope & Market Verification with Exactly 1 Question", async () => {
    const { session } = await createSession(storySeed);
    await processTurnAnswer(session.id, "Answer 2");

    const { session: verifiedSession, turnResponse } = await processTurnAnswer(
      session.id,
      "Option 1A: Authoritative investigator. Option 2A: Surrender self-reliance."
    );

    assert.equal(verifiedSession.turnCount, 3);
    assert.equal(verifiedSession.stage, "verification");
    assert.equal(turnResponse.questions.length, 1, "Turn 3 must ask exactly 1 question");
    assert.ok(turnResponse.proposed_scope);
    assert.ok(turnResponse.comp_titles);
    assert.equal(turnResponse.is_final_turn, true);
  });

  await t.test("Turn 4: Comprehensive 8-Section Report & Story Bible Payload", async () => {
    const { session } = await createSession(storySeed);
    await processTurnAnswer(session.id, "Answer 2");
    await processTurnAnswer(session.id, "Answer 3");

    const { session: finalSession, report } = await generateReport(
      session.id,
      "Option 1A: Standalone commercial novel framing confirmed."
    );

    assert.equal(finalSession.turnCount, 4);
    assert.equal(finalSession.stage, "complete");

    // Verdict & score
    assert.ok(["GO", "PIVOT", "ABANDON"].includes(report.verdict));
    assert.ok(report.viability_score >= 0 && report.viability_score <= 100);

    // Section 8 Payload check
    assert.ok(report.story_bible_payload.includes("WORKING TITLE:"));
    assert.ok(report.story_bible_payload.includes("GENRE & SCOPE:"));
    assert.ok(report.story_bible_payload.includes("CENTRAL CONFLICT:"));
    assert.ok(report.story_bible_payload.includes("PROTAGONIST:"));
    assert.ok(report.story_bible_payload.includes("PRIMARY STAKES:"));
    assert.ok(report.story_bible_payload.includes("CORE THEME:"));
    assert.ok(report.story_bible_payload.includes("VISUAL TONE:"));

    // Ensure session retrievable
    const retrieved = getSession(session.id);
    assert.ok(retrieved);
    assert.equal(retrieved.id, session.id);
  });
});
