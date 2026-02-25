import { useState } from 'react';
import { PlanEvent } from '../types';
import { extractTasksFromNotes } from '../services/geminiService';
import { X } from 'lucide-react';

interface MyGamePlanProps {
  onTasksGenerated: (tasks: PlanEvent[]) => void;
}

export default function MyGamePlan({ onTasksGenerated }: MyGamePlanProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<PlanEvent[]>([]);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    const tasks = await extractTasksFromNotes(notes);
    const newEvents: PlanEvent[] = tasks.map((task, index) => ({
      ...task,
      id: `game-plan-${Date.now()}-${index}`,
      start: new Date(task.start),
      end: new Date(task.end),
      source: 'generated-task',
      priority: 'Medium',
    }));
    setExtractedTasks(newEvents);
    setIsLoading(false);
  };

  const handleTaskUpdate = (index: number, field: 'title' | 'start' | 'end', value: string) => {
    const updatedTasks = [...extractedTasks];
    if (field === 'title') {
      updatedTasks[index].title = value;
    } else {
      updatedTasks[index][field] = new Date(value);
    }
    setExtractedTasks(updatedTasks);
  };

  const handleRemoveTask = (index: number) => {
    setExtractedTasks(extractedTasks.filter((_, i) => i !== index));
  };

  const handleAddToSchedule = () => {
    onTasksGenerated(extractedTasks);
    setExtractedTasks([]);
    setNotes('');
  };

  const formatDateForInput = (date: Date) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-4">My Game Plan</h3>
      
      {extractedTasks.length === 0 ? (
        <>
          <p className="text-slate-600 mb-4">Paste your meeting notes below to automatically extract tasks and add them to your schedule.</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Paste meeting notes here..."
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="mt-4 px-6 py-2 w-full bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {isLoading ? 'Generating...' : 'Generate & Review Tasks'}
          </button>
        </>
      ) : (
        <div>
          <h4 className="font-semibold text-slate-700 mb-2">Review and Edit Tasks:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {extractedTasks.map((task, index) => (
              <div key={task.id} className="p-2 bg-slate-50 rounded-lg flex items-center space-x-2">
                <input 
                  type="text" 
                  value={task.title} 
                  onChange={(e) => handleTaskUpdate(index, 'title', e.target.value)}
                  className="flex-grow p-1 border border-slate-300 rounded-md text-sm"
                />
                <input 
                  type="datetime-local" 
                  value={formatDateForInput(task.start)} 
                  onChange={(e) => handleTaskUpdate(index, 'start', e.target.value)}
                  className="p-1 border border-slate-300 rounded-md text-sm"
                />
                <button onClick={() => handleRemoveTask(index)} className="text-slate-400 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAddToSchedule}
              className="px-6 py-2 flex-1 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Add to Schedule
            </button>
            <button
              onClick={() => setExtractedTasks([])}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
