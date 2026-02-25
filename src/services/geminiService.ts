import { PlanEvent } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:4000';

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Request to ${path} failed with ${res.status}: ${text || res.statusText}`,
    );
  }

  return res.json() as Promise<T>;
}

export async function askTheSage(
  question: string,
  schedule: PlanEvent[],
): Promise<string> {
  try {
    const data = await postJson<{ answer: string }>('/api/ask-the-sage', {
      question,
      schedule,
    });
    return data.answer;
  } catch (error) {
    console.error('Error asking The Sage (frontend):', error);
    return 'I am sorry, but I am having trouble processing your request right now.';
  }
}

export async function extractTasksFromNotes(
  notes: string,
): Promise<Omit<PlanEvent, 'id' | 'source' | 'priority'>[]> {
  try {
    const data = await postJson<{ tasks: { title: string; start: string; end: string }[] }>(
      '/api/extract-tasks',
      { notes },
    );

    return (data.tasks || []).map((task) => ({
      title: task.title,
      start: new Date(task.start),
      end: new Date(task.end),
    }));
  } catch (error) {
    console.error('Error extracting tasks from notes (frontend):', error);
    return [];
  }
}

export async function generateOutreachMessage(
  activeName: string,
  reason: string,
): Promise<string> {
  try {
    const data = await postJson<{ message: string }>('/api/generate-outreach-message', {
      activeName,
      reason,
    });
    return data.message;
  } catch (error) {
    console.error('Error generating outreach message (frontend):', error);
    return 'Error: Could not generate an outreach message. Please try again later.';
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
): Promise<string> {
  try {
    const data = await postJson<{ feedback: string }>('/api/evaluate-answer', {
      question,
      answer,
    });
    return data.feedback;
  } catch (error) {
    console.error('Error evaluating answer (frontend):', error);
    return 'Error: Could not evaluate the answer. Please try again later.';
  }
}
