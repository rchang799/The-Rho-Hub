import { PlanEvent } from '../types';
import * as ICAL from 'ical.js';
import Papa from 'papaparse';
import * as pdf from 'pdf-parse';
import { Buffer } from 'buffer';

const pseDeadlines: Omit<PlanEvent, 'id' | 'start' | 'end'>[] = [
  { title: 'NME Meeting', source: 'pse-deadline', priority: 'Mandatory' },
  { title: 'Outreach Emails Deadline', source: 'pse-deadline', priority: 'High' },
  { title: 'SPEA Hour & 5 Active Chats Deadline', source: 'pse-deadline', priority: 'High' },
  { title: 'Social & Group Dinner Deadline', source: 'pse-deadline', priority: 'Medium' },
];

export const parseFile = async (file: File): Promise<PlanEvent[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ics':
      return parseIcs(file);
    case 'csv':
      return parseCsv(file);
    case 'pdf':
      return parsePdf(file);
    default:
      return [];
  }
};

const parseIcs = async (file: File): Promise<PlanEvent[]> => {
  const text = await file.text();
  // @ts-ignore
  const jcalData = ICAL.parse(text);
  // @ts-ignore
  const vcalendar = new ICAL.Component(jcalData);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  return vevents.map((vevent: any) => {
    // @ts-ignore
    const event = new ICAL.Event(vevent);
    return {
      id: event.uid,
      title: event.summary,
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate(),
      source: 'user',
      priority: 'Medium',
    };
  });
};

const parseCsv = (file: File): Promise<PlanEvent[]> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const events = results.data.map((row: any) => {
          const title = row.Subject || row.Title || row.Event;
          const start = new Date(row['Start Date'] || row.Start);
          const end = new Date(row['End Date'] || row.End);

          if (title && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
            return {
              id: `${title}-${start.toISOString()}`,
              title,
              start,
              end,
              source: 'user',
              priority: 'Medium',
            } as PlanEvent;
          }
          return null;
        }).filter(Boolean) as PlanEvent[];
        resolve(events);
      }
    });
  });
};

const parsePdf = async (file: File): Promise<PlanEvent[]> => {
    const arrayBuffer = await file.arrayBuffer();
        const data = await (pdf as any)(Buffer.from(arrayBuffer));
    // Basic heuristic for now. This can be improved with more advanced logic or AI.
    console.log("PDF Text:", data.text);
    return [];
};

const getNextDayOfWeek = (dayOfWeek: number, hour: number, minute: number) => {
  const now = new Date();
  const result = new Date();
  result.setDate(now.getDate() + (dayOfWeek + 7 - now.getDay()) % 7);
  result.setHours(hour, minute, 0, 0);
  return result;
};

const generatePseEvents = (): PlanEvent[] => {
  const events: PlanEvent[] = [];

  // NME Meetings (Mon/Wed @ 7 PM)
  const mondayMeeting = getNextDayOfWeek(1, 19, 0);
  const wednesdayMeeting = getNextDayOfWeek(3, 19, 0);
  events.push({
    id: `pse-nme-mon-${mondayMeeting.toISOString()}`,
    title: 'NME Meeting',
    start: mondayMeeting,
    end: new Date(mondayMeeting.getTime() + 60 * 60 * 1000),
    source: 'pse-deadline',
    priority: 'Mandatory',
  });
  events.push({
    id: `pse-nme-wed-${wednesdayMeeting.toISOString()}`,
    title: 'NME Meeting',
    start: wednesdayMeeting,
    end: new Date(wednesdayMeeting.getTime() + 60 * 60 * 1000),
    source: 'pse-deadline',
    priority: 'Mandatory',
  });

  // Other Deadlines
  const thursdayDeadline = getNextDayOfWeek(4, 17, 0);
  events.push({
    id: `pse-outreach-${thursdayDeadline.toISOString()}`,
    title: 'Outreach Emails Deadline',
    start: thursdayDeadline,
    end: thursdayDeadline,
    source: 'pse-deadline',
    priority: 'High',
  });

  const fridayDeadline = getNextDayOfWeek(5, 23, 59);
  events.push({
    id: `pse-spea-${fridayDeadline.toISOString()}`,
    title: 'SPEA Hour & 5 Active Chats Deadline',
    start: fridayDeadline,
    end: fridayDeadline,
    source: 'pse-deadline',
    priority: 'High',
  });

  const sundayDeadline = getNextDayOfWeek(0, 20, 0); // Assuming Sunday night is 8 PM
  events.push({
    id: `pse-social-${sundayDeadline.toISOString()}`,
    title: 'Social & Group Dinner Deadline',
    start: sundayDeadline,
    end: sundayDeadline,
    source: 'pse-deadline',
    priority: 'Medium',
  });

  return events;
};

export const mergeSchedules = (userEvents: PlanEvent[]): PlanEvent[] => {
  const pseEvents = generatePseEvents();
  const allEvents = [...userEvents, ...pseEvents].sort((a, b) => a.start.getTime() - b.start.getTime());

  // Conflict Detection
  for (let i = 0; i < allEvents.length; i++) {
    for (let j = i + 1; j < allEvents.length; j++) {
      const eventA = allEvents[i];
      const eventB = allEvents[j];

      if (eventA.end > eventB.start && eventA.start < eventB.end) {
        if (eventA.priority === 'Mandatory' || eventB.priority === 'Mandatory') {
          eventA.isConflict = true;
          eventB.isConflict = true;
        }
      }
    }
  }

  return allEvents;
};

export const prioritizeTasks = (events: PlanEvent[]): PlanEvent[] => {
  const now = new Date().getTime();

  const scoredEvents = events.map(event => {
    const hoursUntilDue = (event.start.getTime() - now) / (1000 * 60 * 60);
    const durationHours = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);

    // Urgency score (higher for closer deadlines)
    const urgencyScore = 1 / (Math.max(hoursUntilDue, 0.1) + 1); // Max with 0.1 to avoid division by zero for past events

    // Commitment score (higher for longer tasks)
    const commitmentScore = Math.log1p(durationHours); // Use log to prevent very long tasks from dominating

    // Priority score
    let priorityScore = 0;
    switch (event.priority) {
      case 'Mandatory': priorityScore = 4; break;
      case 'High': priorityScore = 3; break;
      case 'Medium': priorityScore = 2; break;
      case 'Low': priorityScore = 1; break;
      default: priorityScore = 0;
    }

    // Weighted final score
    const finalScore = (urgencyScore * 0.5) + (commitmentScore * 0.2) + (priorityScore * 0.3);

    return { ...event, score: finalScore };
  });

  return scoredEvents
    .filter(event => event.start.getTime() > now) // Only include future tasks
    .sort((a, b) => b.score - a.score);
};

export const suggestWorkBlocks = (events: PlanEvent[]): PlanEvent[] => {
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const workBlocks: PlanEvent[] = [];
  const twoHours = 2 * 60 * 60 * 1000;

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const gapStart = sortedEvents[i].end;
    const gapEnd = sortedEvents[i + 1].start;
    const gap = gapEnd.getTime() - gapStart.getTime();

    if (gap >= twoHours) {
      workBlocks.push({
        id: `work-block-${gapStart.toISOString()}`,
        title: 'Suggested Work Block',
        start: gapStart,
        end: new Date(gapStart.getTime() + twoHours),
        source: 'generated-task',
        priority: 'Low',
      });
    }
  }

  return workBlocks;
};
