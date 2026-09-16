import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const match = envContent.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : "";

const ai = new GoogleGenAI({ apiKey });

async function testGeneration() {
  const modelsToTest = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-pro-preview", "gemini-pro-latest"];
  for (const m of modelsToTest) {
    try {
      console.log(`Testing model: ${m}...`);
      const res = await ai.models.generateContent({
        model: m,
        contents: "As an expert editor, give one sharp sentence evaluating a story premise about a haunted grandfather clock.",
      });
      console.log(`SUCCESS with ${m}:`, res.text);
    } catch (e) {
      console.log(`Failed with ${m}:`, e.message || e);
    }
  }
}

testGeneration();
