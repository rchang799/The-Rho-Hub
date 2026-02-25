import { useState, useMemo, useEffect } from 'react';
import TheVault from './TheVault';
import WhatToDoNext from './WhatToDoNext';
import MyGamePlan from './MyGamePlan';
import ScheduleCalendar from './ScheduleCalendar';
import { PlanEvent } from '../types';
import { parseFile, mergeSchedules, suggestWorkBlocks } from '../services/scheduleService';

interface UnifiedGamePlanProps {
  initialEvents: PlanEvent[];
  onScheduleUpdate: (events: PlanEvent[]) => void;
  onTaskCompletion: (taskId: string) => void;
  onTaskUpdate: (updatedTask: PlanEvent) => void;
}

export default function UnifiedGamePlan({ initialEvents, onScheduleUpdate, onTaskCompletion, onTaskUpdate }: UnifiedGamePlanProps) {
  const [events, setEvents] = useState<PlanEvent[]>(initialEvents);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const handleIntegrate = (newEvents: PlanEvent[]) => {
    const updatedEvents = mergeSchedules([...events, ...newEvents]);
    setEvents(updatedEvents);
    onScheduleUpdate(updatedEvents);
  };

  const handleTasksGenerated = (tasks: PlanEvent[]) => {
    const updatedEvents = mergeSchedules([...events, ...tasks]);
    setEvents(updatedEvents);
    onScheduleUpdate(updatedEvents);
  };

  const handleTaskUpdate = (updatedTask: PlanEvent) => {
    const updatedEvents = events.map(event => event.id === updatedTask.id ? updatedTask : event);
    setEvents(updatedEvents);
    onScheduleUpdate(updatedEvents);
  };

  const handleEventsChange = (updatedEvents: PlanEvent[]) => {
    setEvents(updatedEvents);
    onScheduleUpdate(updatedEvents);
  };

  const allEventsWithWorkBlocks = useMemo(() => {
    const workBlocks = suggestWorkBlocks(events);
    return [...events, ...workBlocks].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Unified Game Plan</h2>
      <WhatToDoNext events={allEventsWithWorkBlocks} onTaskCompletion={onTaskCompletion} onTaskUpdate={handleTaskUpdate} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <MyGamePlan onTasksGenerated={handleTasksGenerated} />
          <TheVault onIntegrate={handleIntegrate} />
        </div>
        <div className="lg:col-span-2">
          <ScheduleCalendar events={allEventsWithWorkBlocks} onEventsChange={handleEventsChange} />
        </div>
      </div>
    </div>
  );
}
