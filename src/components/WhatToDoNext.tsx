import { useMemo, useState } from 'react';
import { PlanEvent } from '../types';
import { prioritizeTasks } from '../services/scheduleService';
import { ChevronDown, Edit } from 'lucide-react';
import EditTaskModal from './EditTaskModal';

interface WhatToDoNextProps {
  events: PlanEvent[];
  onTaskCompletion: (taskId: string) => void;
  onTaskUpdate: (updatedTask: PlanEvent) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function WhatToDoNext({
  events,
  onTaskCompletion,
  onTaskUpdate,
  onTaskDelete,
}: WhatToDoNextProps) {
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlanEvent | null>(null);

  const { activeTasks, completedTasks } = useMemo(() => {
    const prioritized = prioritizeTasks(events);
    return {
      activeTasks: prioritized.filter(task => !task.completed).slice(0, 5),
      completedTasks: prioritized.filter(task => task.completed),
    };
  }, [events]);

  const handleEditClick = (task: PlanEvent) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = (updatedTask: PlanEvent) => {
    onTaskUpdate(updatedTask);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-4">What to do next?</h3>
      {activeTasks.length > 0 ? (
        <ul className="space-y-3">
          {activeTasks.map((task, index) => (
            <li
              key={task.id}
              className="p-3 rounded-md transition-all bg-indigo-50 border-l-4 border-indigo-500"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onTaskCompletion(task.id)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                  />
                  <span className={`font-bold text-indigo-800`}>{task.title}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      index === 0
                        ? 'bg-red-100 text-red-800'
                        : index === 1
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-1 text-slate-500 hover:text-indigo-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onTaskDelete(task.id)}
                    className="text-[11px] text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className={`text-sm ml-8 text-indigo-600`}>Due: {task.start.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500">No active tasks. Great job!</p>
      )}

      {completedTasks.length > 0 && (
        <div className="mt-6">
          <button 
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="w-full flex justify-between items-center p-2 bg-gray-100 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200"
          >
            <span>Completed ({completedTasks.length})</span>
            <ChevronDown className={`h-5 w-5 transition-transform ${completedExpanded ? 'rotate-180' : ''}`} />
          </button>
          {completedExpanded && (
            <ul className="mt-2 space-y-2">
              {completedTasks.map(task => (
                <li key={task.id} className="p-3 rounded-md bg-gray-200 border-l-4 border-gray-400">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onTaskCompletion(task.id)}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                    />
                    <span className="text-gray-500 line-through">{task.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <EditTaskModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        task={selectedTask} 
        onSave={handleSaveTask} 
      />
    </div>
  );
}
