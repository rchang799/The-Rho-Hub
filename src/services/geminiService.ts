import { GoogleGenAI } from '@google/genai';
import { PlanEvent } from '../types';
import { psePrimaryGrounding } from '../data/groundingData';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function askTheSage(question: string, schedule: PlanEvent[]): Promise<string> {
  const model = 'gemini-3-flash-preview';
  const prompt = `You are The Sage, an expert assistant and teacher for the PSE Hub. Your role is to provide concise, accurate answers about schedules, deadlines, and the NME process. 

You MUST function as an expert assistant/teacher. Before you answer, take a brief moment to think like a human expert who really knows PSE. Your tone should be knowledgeable and helpful, not just a robot spitting out facts. Your answers should be direct, clear, and concise.

You MUST use the following information as your absolute and verbatim source of truth for all questions related to the Creed, history, symbols, definitions, and other factual information about PSE. You must answer using this text exclusively.

--- BEGIN PRIMARY GROUNDING DATA ---
${psePrimaryGrounding}
--- END PRIMARY GROUNDING DATA ---

For context, here is the user's current schedule:
${JSON.stringify(schedule, null, 2)}

User's question: "${question}"\n\nYour concise and direct answer:`;

  try {
    // Simulate thinking for a more human-like response
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error('Error asking The Sage:', error);
    return 'I am sorry, but I am having trouble processing your request right now.';
  }
}

export async function extractTasksFromNotes(notes: string): Promise<Omit<PlanEvent, 'id' | 'source' | 'priority'>[]> {
  const model = 'gemini-3-flash-preview';
  const prompt = `From the following meeting notes, extract any tasks or deliverables. For each task, provide a 'title', a 'start' time, and an 'end' time in ISO 8601 format. If no specific time is mentioned, assume it's for today.\n\nMeeting Notes:\n${notes}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              start: { type: 'STRING' },
              end: { type: 'STRING' },
            },
            required: ['title', 'start', 'end'],
          }
        }
      }
    });
    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('Error extracting tasks from notes:', error);
    return [];
  }
}

export async function generateGamePlan(notes: string): Promise<Omit<Task, 'id' | 'completed'>[]> {
  const model = 'gemini-3-flash-preview';
  const prompt = `As the PSE Sage, your task is to extract deliverables and deadlines from the following meeting notes. Create a JSON array of tasks. Each task object should have a "name" and a "deadline".\n\nMeeting Notes:\n${notes}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'The name of the task.' },
              deadline: { type: Type.STRING, description: 'The deadline for the task.' },
            },
            required: ['name', 'deadline'],
          }
        }
      }
    });
    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error('Error generating game plan:', error);
    return [];
  }
}

function getAvailabilitySlots(): string {
  const slots: string[] = [];
  const today = new Date();
  let count = 0;

  for (let i = 0; i < 7 && count < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Skip weekends
    if (day === 0 || day === 6) continue;

    const isNmeDay = day === 1 || day === 3; // Monday or Wednesday

    for (let hour = 8; hour < 18; hour += 2) {
      if (isNmeDay && hour >= 18 && hour < 21) continue; // Skip NME meeting times (7pm-9pm)
      if (count < 5) {
        const startTime = `${hour}:00`;
        const endTime = `${hour + 2}:00`;
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        slots.push(`${formattedDate}, ${startTime} - ${endTime}`);
        count++;
      }
    }
  }
  return slots.map(slot => `* ${slot}`).join('\n');
}

export async function generateOutreachMessage(activeName: string, reason: string): Promise<string> {
  const model = 'gemini-3-flash-preview';
  const availability = getAvailabilitySlots();

  const prompt = `You are a professional development assistant for a new member of a business fraternity (PSE). Your task is to generate a professional and engaging outreach message to an active member. Here are the details:\n\nActive Member's Name: ${activeName}\nReason for Outreach: ${reason}\n\nBased on this information, write a short, professional, and friendly message (3-4 sentences) to this active member. The goal is to set up a short networking chat. Mention that you have availability this week and include these specific slots:\n\n${availability}\n\nKeep the message concise, personalized to the reason, and end with a clear call to action.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating outreach message:', error);
    return 'Error: Could not generate an outreach message. Please check the console for details.';
  }
}

export async function evaluateAnswer(question: string, answer: string): Promise<string> {
  const model = 'gemini-3-flash-preview';
  const prompt = `As the PSE Sage Pro-Coach, evaluate the following response to the interview question based on the STAR Method (Situation, Task, Action, Result) and professional tone. Provide constructive feedback and a "Professionalism Tip" if the user's tone is unprofessional. Also, suggest how to weave in one of the 12 PSE Principles (Work, Honor, Sincerity, Belief, Skill, Knowledge, Wisdom, Confidence, Faith, Ethics, Character, Competition).\n\nQuestion: ${question}\n\nAnswer: ${answer}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return 'Error: Could not evaluate the answer. Please check the console for details.';
  }
}
