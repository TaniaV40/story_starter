import { callGeminiTurn1, callGeminiTurn, callGeminiTurn4Report } from "../lib/gemini.ts";
import fs from "fs";

// Load .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const [k, v] = line.split("=");
  if (k && v) process.env[k.trim()] = v.trim();
}

async function runFullPipeline() {
  console.log("Testing Full 4-Turn Live Pipeline...");
  const seed = "A disgraced architect is hired to rebuild a cathedral that burned down under mysterious circumstances, only to find the original cornerstone was sealed from the inside.";

  console.log("\n--- Executing Turn 1 ---");
  const t1 = await callGeminiTurn1(seed);
  console.log("T1 Questions:", t1.questions.length);

  const history = [
    { id: "1", role: "user", turn: 1, content: seed, timestamp: "" },
    { id: "2", role: "model", turn: 1, content: t1.analysis, timestamp: "" },
  ];

  console.log("\n--- Executing Turn 2 ---");
  const t2Answer = "Q1: Option A (Catastrophic collapse from hubris). Q2: Option C (The fire was set deliberately to access the cornerstone).";
  const t2 = await callGeminiTurn(2, history, t2Answer, t1.state_audit);
  console.log("T2 Primary Risk:", t2.primary_risk_flag);
  console.log("T2 Questions:", t2.questions.length);

  history.push({ id: "3", role: "user", turn: 2, content: t2Answer, timestamp: "" });
  history.push({ id: "4", role: "model", turn: 2, content: t2.analysis, timestamp: "" });

  console.log("\n--- Executing Turn 3 ---");
  const t3Answer = "Q1: Option A (Corrupt church elder). Q2: Option B (Must sacrifice professional standing to expose the truth).";
  const t3 = await callGeminiTurn(3, history, t3Answer, { ...t1.state_audit, ...t2.state_audit });
  console.log("T3 Comp Titles:", t3.comp_titles);
  console.log("T3 Scope:", t3.proposed_scope);
  console.log("T3 Questions:", t3.questions.length);

  history.push({ id: "5", role: "user", turn: 3, content: t3Answer, timestamp: "" });
  history.push({ id: "6", role: "model", turn: 3, content: t3.analysis, timestamp: "" });

  console.log("\n--- Executing Turn 4 Report ---");
  const t4Answer = "Yes, standalone gothic historical thriller format fits my vision perfectly.";
  const report = await callGeminiTurn4Report(history, t4Answer, { ...t1.state_audit, ...t2.state_audit, ...t3.state_audit }, seed);
  
  console.log("\n=== FINAL REPORT DELIVERED ===");
  console.log("Working Title:", report.working_title);
  console.log("Verdict:", report.verdict, `(${report.viability_score}/100 - ${report.overall_score_label})`);
  console.log("Scorecard:", report.scorecard);
  console.log("Payload Preview:\n" + report.story_bible_payload.slice(0, 300) + "...\n");
}

runFullPipeline();
