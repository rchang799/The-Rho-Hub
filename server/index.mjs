import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Gemini endpoints will return an error until this is configured.");
}

const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = "gemini-3-flash-preview";

async function generateText(prompt) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured on the backend.");
  }

  const response = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  // SDK in AI Studio exposes `.text`
  return response.text;
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/ask-the-sage", async (req, res) => {
  const { question, schedule, referenceText } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: "Missing 'question' in request body." });
  }

  const prompt = `You are The Sage, an expert assistant and teacher for the PSE Hub. Your role is to provide concise, accurate answers about schedules, deadlines, and the NME process. 

You MUST function as an expert assistant/teacher. Before you answer, take a brief moment to think like a human expert who really knows PSE. Your tone should be knowledgeable and helpful, not just a robot spitting out facts. Your answers should be direct, clear, and concise.

For context, here is the user's current schedule (JSON):
${JSON.stringify(schedule ?? [], null, 2)}

Additional reference material from the user (may include uploaded files, notes, etc.):
${referenceText || "No extra reference material provided."}

User's question: "${question}"

Your concise and direct answer:`;

  try {
    const answer = await generateText(prompt);
    res.json({ answer });
  } catch (err) {
    console.error("Error in /api/ask-the-sage:", err);
    res.status(500).json({ error: "Failed to get response from Gemini." });
  }
});

app.post("/api/extract-tasks", async (req, res) => {
  const { notes } = req.body || {};

  if (!notes) {
    return res.status(400).json({ error: "Missing 'notes' in request body." });
  }

  const prompt = `From the following meeting notes, extract any tasks or deliverables.

For each task, return a JSON array where each item has:
- "title" (string)
- "start" (string ISO 8601 date-time)
- "end" (string ISO 8601 date-time)

Return ONLY valid JSON, with no additional commentary.

Meeting Notes:
${notes}`;

  try {
    const raw = await generateText(prompt);
    let tasks = [];
    try {
      // Trim potential markdown fences or extra text
      const jsonStart = raw.indexOf("[");
      const jsonEnd = raw.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonText = raw.slice(jsonStart, jsonEnd + 1);
        tasks = JSON.parse(jsonText);
      } else {
        tasks = JSON.parse(raw);
      }
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON for /api/extract-tasks:", parseErr, raw);
      return res.status(500).json({ error: "Gemini did not return valid JSON for tasks." });
    }

    res.json({ tasks });
  } catch (err) {
    console.error("Error in /api/extract-tasks:", err);
    res.status(500).json({ error: "Failed to extract tasks from Gemini." });
  }
});

app.post("/api/generate-outreach-message", async (req, res) => {
  const { activeName, reason } = req.body || {};

  if (!activeName || !reason) {
    return res.status(400).json({ error: "Missing 'activeName' or 'reason' in request body." });
  }

  const prompt = `You are a professional development assistant for a new member of a business fraternity (PSE). Your task is to generate a professional and engaging outreach message to an active member. Here are the details:

Active Member's Name: ${activeName}
Reason for Outreach: ${reason}

Based on this information, write a short, professional, and friendly message (3-4 sentences) to this active member. The goal is to set up a short networking chat. Mention that you have availability this week and keep the tone concise, personalized to the reason, and end with a clear call to action.`;

  try {
    const message = await generateText(prompt);
    res.json({ message });
  } catch (err) {
    console.error("Error in /api/generate-outreach-message:", err);
    res.status(500).json({ error: "Failed to generate outreach message." });
  }
});

app.post("/api/evaluate-answer", async (req, res) => {
  const { question, answer } = req.body || {};

  if (!question || !answer) {
    return res.status(400).json({ error: "Missing 'question' or 'answer' in request body." });
  }

  const prompt = `As the PSE Sage Pro-Coach, evaluate the following response to the interview question based on the STAR Method (Situation, Task, Action, Result) and professional tone. Provide constructive feedback and a "Professionalism Tip" if the user's tone is unprofessional. Also, suggest how to weave in one of the 12 PSE Principles (Work, Honor, Sincerity, Belief, Skill, Knowledge, Wisdom, Confidence, Faith, Ethics, Character, Competition).

Question: ${question}

Answer: ${answer}

Your feedback:`;

  try {
    const feedback = await generateText(prompt);
    res.json({ feedback });
  } catch (err) {
    console.error("Error in /api/evaluate-answer:", err);
    res.status(500).json({ error: "Failed to evaluate answer." });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});

