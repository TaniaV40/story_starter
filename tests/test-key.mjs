import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const match = envContent.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : "";

console.log("Testing API Key starting with:", apiKey.slice(0, 8) + "...");

const ai = new GoogleGenAI({ apiKey });

async function test() {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  for (const model of models) {
    try {
      console.log(`Trying ${model}...`);
      const res = await ai.models.generateContent({
        model,
        contents: "Give an editorial observation in one sentence.",
      });
      console.log(`SUCCESS with ${model}:`, res.text);
      break;
    } catch (e) {
      console.log(`Failed with ${model}:`, e.message || e);
    }
  }
}

test();
