import { callGeminiTurn1 } from "../lib/gemini.ts";
import fs from "fs";

// Load .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const [k, v] = line.split("=");
  if (k && v) process.env[k.trim()] = v.trim();
}

async function runLiveTest() {
  console.log("Running live Turn 1 test with Gemini 3.6 Flash...");
  const seed = "A disgraced architect is hired to rebuild a cathedral that burned down under mysterious circumstances, only to find the original cornerstone was sealed from the inside.";
  const res = await callGeminiTurn1(seed);
  console.log("\n=== LIVE EDITORIAL RESPONSE ===");
  console.log("Assessment:", res.assessment);
  console.log("Analysis:", res.analysis);
  console.log("\n=== QUESTIONS (Count: " + res.questions.length + ") ===");
  res.questions.forEach((q, i) => {
    console.log(`\nQ${i+1}: ${q.question}`);
    console.log(`Explanation: ${q.explanation}`);
    q.options.forEach(opt => console.log(`  [${opt.label}] ${opt.text}`));
  });
  console.log("\n=== AUDITED STATE ===");
  console.log(res.state_audit);
}

runLiveTest();
