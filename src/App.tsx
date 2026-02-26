import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UnifiedGamePlan from './components/UnifiedGamePlan';
import CornerAssistant from './components/CornerAssistant';
import ProCoach from './components/ProCoach';
import TheCloser from './components/TheCloser';
import WeeklyMeter from './components/WeeklyMeter';
import { PlanEvent } from './types';
import { supabase } from './services/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { loadUserSchedule, saveUserSchedule } from './services/userScheduleStore';

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [schedule, setSchedule] = useState<PlanEvent[]>([]);
  const [week3Tasks, setWeek3Tasks] = useState<PlanEvent[]>(initialWeek3Tasks);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [activeView, setActiveView] = useState<View>('Unified Game Plan');

  const buildDefaultSchedule = (): PlanEvent[] => {
    return [
      ...initialWeek3Tasks,
      ...recurringEvents.map((e, i) => ({ ...e, id: `rec-${i}` })),
    ];
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setAuthLoading(false);
    };

    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setSchedule([]);
      setWeek3Tasks(initialWeek3Tasks);
      return;
    }

    const loadSchedule = async () => {
      setScheduleLoading(true);
      const stored = await loadUserSchedule(user.id);

      if (stored && stored.length > 0) {
        setSchedule(stored);
        setWeek3Tasks(stored.filter((event) => event.weight > 0));
      } else {
        const fullSchedule = buildDefaultSchedule();
        setSchedule(fullSchedule);
        setWeek3Tasks(initialWeek3Tasks);
        await saveUserSchedule(user.id, fullSchedule);
      }

      // Conflict check for the next 48 hours based on the loaded schedule
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const urgentTasks = schedule.filter(
        (task) => task.start > now && task.start <= twoDaysFromNow && !task.completed,
      );
      if (urgentTasks.length > 0) {
        alert(
          `Urgent Tasks for the next 48 hours:\n${urgentTasks
            .map((t) => `- ${t.title}`)
            .join('\n')}`,
        );
      }

      setScheduleLoading(false);
    };

    void loadSchedule();
  }, [user]);

  const handleScheduleUpdate = (newSchedule: PlanEvent[]) => {
    setSchedule(newSchedule);
    if (user) {
      void saveUserSchedule(user.id, newSchedule);
    }
  };

  const handleTaskCompletion = (taskId: string) => {
    setWeek3Tasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    // Also update the main schedule
    setSchedule(prevSchedule => {
      const next = prevSchedule.map(event =>
        event.id === taskId ? { ...event, completed: !event.completed } : event
      );
      if (user) {
        void saveUserSchedule(user.id, next);
      }
      return next;
    });
  };

  const handleTaskUpdate = (updatedTask: PlanEvent) => {
    setWeek3Tasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setSchedule(prevSchedule => {
      const next = prevSchedule.map(event =>
        event.id === updatedTask.id ? updatedTask : event
      );
      if (user) {
        void saveUserSchedule(user.id, next);
      }
      return next;
    });
  };

  const handleTaskDelete = (taskId: string) => {
    setWeek3Tasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setSchedule(prevSchedule => {
      const next = prevSchedule.filter(event => event.id !== taskId);
      if (user) {
        void saveUserSchedule(user.id, next);
      }
      return next;
    });
  };

  const renderView = () => {
    switch (activeView) {
      case 'Unified Game Plan':
        return (
          <UnifiedGamePlan
            initialEvents={schedule}
            onScheduleUpdate={handleScheduleUpdate}
            onTaskCompletion={handleTaskCompletion}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        );
      case 'Pro-Coach':
        return <ProCoach />;
      case 'The Closer':
        return <TheCloser />;
      default:
        return <UnifiedGamePlan initialEvents={schedule} onScheduleUpdate={handleScheduleUpdate} onTaskCompletion={handleTaskCompletion} onTaskUpdate={handleTaskUpdate} />;
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthError(null);

    try {
      if (authMode === 'signIn') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user ?? null);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user ?? null);
      }
    } catch (err: any) {
      setAuthError(err.message ?? 'Unable to authenticate.');
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSchedule([]);
    setWeek3Tasks(initialWeek3Tasks);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-200">
        <p className="text-slate-700 text-sm">Loading...</p>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="max-w-md p-6 bg-slate-800 rounded-xl shadow-lg">
          <h1 className="text-xl font-bold mb-2">Supabase not configured</h1>
          <p className="text-sm text-slate-200">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your
            environment to enable per-user calendars and authentication.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-200">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-4 text-center">PSE Sage Hub</h1>
          <p className="text-sm text-slate-600 mb-6 text-center">
            Create an account or sign in to keep your Unified Game Plan and calendar synced to your
            profile.
          </p>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {authMode === 'signIn' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signIn' ? 'signUp' : 'signIn')}
              className="text-xs text-indigo-600 hover:underline"
            >
              {authMode === 'signIn'
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main
        className="flex-1 p-8 text-slate-900 overflow-y-auto"
        style={{ backgroundImage: 'radial-gradient(circle at top right, #f1f5f9, #e2e8f0)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <WeeklyMeter tasks={week3Tasks} />
          <button
            onClick={handleSignOut}
            className="px-3 py-1 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
        <div className="mt-8">
          {scheduleLoading ? <p className="text-slate-600 text-sm">Loading your schedule...</p> : renderView()}
        </div>
      </main>
      <CornerAssistant schedule={schedule} onScheduleUpdate={handleScheduleUpdate} />
    </div>
  );
}
