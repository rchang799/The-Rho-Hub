import React from 'react';
import { PlanEvent } from '../types';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: PlanEvent | null;
  onSave: (updatedTask: PlanEvent) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onSave }) => {
  const [editedTask, setEditedTask] = React.useState<PlanEvent | null>(task);

  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Task</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Title</label>
            <input 
              type="text" 
              value={editedTask.title}
              onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Due Date</label>
            <input 
              type="datetime-local" 
              value={editedTask.start.toISOString().substring(0, 16)}
              onChange={(e) => setEditedTask({...editedTask, start: new Date(e.target.value), end: new Date(e.target.value)})}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Priority</label>
            <select 
              value={editedTask.priority}
              onChange={(e) => setEditedTask({...editedTask, priority: e.target.value as PlanEvent['priority']})}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Mandatory</option>
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
