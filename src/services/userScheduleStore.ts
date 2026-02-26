import type { PlanEvent } from '../types';
import { supabase } from './supabaseClient';

type SerializableEvent = Omit<PlanEvent, 'start' | 'end'> & {
  start: string;
  end: string;
};

function serializeEvents(events: PlanEvent[]): SerializableEvent[] {
  return events.map((event) => ({
    ...event,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
  }));
}

function deserializeEvents(raw: SerializableEvent[]): PlanEvent[] {
  return raw.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));
}

export async function loadUserSchedule(userId: string): Promise<PlanEvent[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('schedules')
    .select('events')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading schedule from Supabase:', error);
    return null;
  }

  if (!data || !data.events) return null;

  try {
    return deserializeEvents(data.events as SerializableEvent[]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deserializing schedule events:', err);
    return null;
  }
}

export async function saveUserSchedule(userId: string, events: PlanEvent[]): Promise<void> {
  if (!supabase) return;

  const payload = serializeEvents(events);

  const { error } = await supabase
    .from('schedules')
    .upsert({ user_id: userId, events: payload });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving schedule to Supabase:', error);
  }
}

