import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const match = envContent.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : "";

const ai = new GoogleGenAI({ apiKey });

async function getAvailableGenerateModels() {
  const pager = await ai.models.list();
  const generateModels = [];
  for await (const model of pager) {
    if (model.supportedActions?.includes("generateContent")) {
      generateModels.push({
        name: model.name,
        displayName: model.displayName,
      });
    }
  }
  console.log("GenerateContent models:", JSON.stringify(generateModels, null, 2));
}

getAvailableGenerateModels();
