import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UnifiedGamePlan from './components/UnifiedGamePlan';
import CornerAssistant from './components/CornerAssistant';
import ProCoach from './components/ProCoach';
import TheCloser from './components/TheCloser';
import WeeklyMeter from './components/WeeklyMeter';
import { PlanEvent } from './types';

export type View = 'Unified Game Plan' | 'Pro-Coach' | 'The Closer';

const initialWeek3Tasks: PlanEvent[] = [
  { id: '1', title: '5 Active Interviews', start: new Date('2026-02-27T23:59:00'), end: new Date('2026-02-27T23:59:00'), source: 'pse-deadline', priority: 'Mandatory', completed: false, weight: 30 },
  { id: '2', title: '1 Hour SPEA', start: new Date('2026-02-27T23:59:00'), end: new Date('2026-02-27T23:59:00'), source: 'pse-deadline', priority: 'Mandatory', completed: false, weight: 20 },
  { id: '3', title: '1 Dinner', start: new Date('2026-03-01T23:59:00'), end: new Date('2026-03-01T23:59:00'), source: 'pse-deadline', priority: 'High', completed: false, weight: 20 },
  { id: '4', title: '1 Social', start: new Date('2026-03-01T23:59:00'), end: new Date('2026-03-01T23:59:00'), source: 'pse-deadline', priority: 'High', completed: false, weight: 20 },
  { id: '5', title: 'Module 2 Quiz', start: new Date('2026-02-25T23:59:00'), end: new Date('2026-02-25T23:59:00'), source: 'pse-deadline', priority: 'Mandatory', completed: false, weight: 0 }, // Not weighted as per instructions, but tracked
  { id: '6', title: 'Company Research Paper', start: new Date('2026-02-25T23:59:00'), end: new Date('2026-02-25T23:59:00'), source: 'pse-deadline', priority: 'High', completed: false, weight: 10 },
  { id: '7', title: 'Pay National & Local Dues', start: new Date('2026-03-01T23:59:00'), end: new Date('2026-03-01T23:59:00'), source: 'pse-deadline', priority: 'Mandatory', completed: false, weight: 20 },
];

const recurringEvents: Omit<PlanEvent, 'id'>[] = [
  // NME Sessions - Mondays and Wednesdays 7 PM - 9 PM
  // This would typically be generated for a date range, but for this implementation, we'll add a few instances
  { title: 'NME Session', start: new Date('2026-02-25T19:00:00'), end: new Date('2026-02-25T21:00:00'), source: 'pse-deadline', priority: 'Mandatory', completed: true, weight: 0 },
  { title: 'NME Session', start: new Date('2026-03-02T19:00:00'), end: new Date('2026-03-02T21:00:00'), source: 'pse-deadline', priority: 'Mandatory', completed: true, weight: 0 },
  // Chapter Meeting - Sunday 5 PM
  { title: 'Chapter Meeting', start: new Date('2026-03-01T17:00:00'), end: new Date('2026-03-01T18:00:00'), source: 'pse-deadline', priority: 'Mandatory', completed: true, weight: 0 },
];

export default function App() {
  const [schedule, setSchedule] = useState<PlanEvent[]>([]);
  const [week3Tasks, setWeek3Tasks] = useState<PlanEvent[]>(initialWeek3Tasks);
  const [activeView, setActiveView] = useState<View>('Unified Game Plan');

  useEffect(() => {
    // Combine initial tasks and recurring events into the main schedule
    const fullSchedule = [...initialWeek3Tasks, ...recurringEvents.map((e, i) => ({...e, id: `rec-${i}`}))];
    setSchedule(fullSchedule);

    // Conflict Check for the next 48 hours
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const urgentTasks = fullSchedule.filter(task => task.start > now && task.start <= twoDaysFromNow);

    if (urgentTasks.length > 0) {
      alert(`Urgent Tasks for the next 48 hours:\n${urgentTasks.map(t => `- ${t.title}`).join('\n')}`);
    }
  }, []);

  const handleScheduleUpdate = (newSchedule: PlanEvent[]) => {
    setSchedule(newSchedule);
  };

  const handleTaskCompletion = (taskId: string) => {
    setWeek3Tasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    // Also update the main schedule
    setSchedule(prevSchedule =>
      prevSchedule.map(event =>
        event.id === taskId ? { ...event, completed: !event.completed } : event
      )
    );
  };

  const handleTaskUpdate = (updatedTask: PlanEvent) => {
    setWeek3Tasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setSchedule(prevSchedule =>
      prevSchedule.map(event =>
        event.id === updatedTask.id ? updatedTask : event
      )
    );
  };

  const renderView = () => {
    switch (activeView) {
      case 'Unified Game Plan':
        return <UnifiedGamePlan initialEvents={schedule} onScheduleUpdate={handleScheduleUpdate} onTaskCompletion={handleTaskCompletion} onTaskUpdate={handleTaskUpdate} />;
      case 'Pro-Coach':
        return <ProCoach />;
      case 'The Closer':
        return <TheCloser />;
      default:
        return <UnifiedGamePlan initialEvents={schedule} onScheduleUpdate={handleScheduleUpdate} onTaskCompletion={handleTaskCompletion} onTaskUpdate={handleTaskUpdate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-8 text-slate-900 overflow-y-auto" style={{backgroundImage: 'radial-gradient(circle at top right, #f1f5f9, #e2e8f0)'}}>
        <WeeklyMeter tasks={week3Tasks} />
        <div className="mt-8">
          {renderView()}
        </div>
      </main>
      <CornerAssistant schedule={schedule} onScheduleUpdate={handleScheduleUpdate} />
    </div>
  );
}
