import React, { useState, useEffect } from 'react';
import { PlanEvent } from '../types';

interface EventEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<PlanEvent, 'id' | 'source' | 'priority' | 'completed' | 'weight'>) => void;
  eventInfo: Partial<PlanEvent> | null;
}

export default function EventEditorModal({ isOpen, onClose, onSave, eventInfo }: EventEditorModalProps) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  useEffect(() => {
    setTitle(eventInfo?.title || '');
    setStart(eventInfo?.start || null);
    setEnd(eventInfo?.end || null);
  }, [eventInfo]);

  const handleSave = () => {
    if (title && start && end) {
      onSave({ title, start, end });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{eventInfo?.id ? 'Edit Event' : 'Create Event'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Start Time</label>
            <input 
              type="datetime-local" 
              value={start ? new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().substring(0, 16) : ''}
              onChange={(e) => setStart(new Date(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">End Time</label>
            <input 
              type="datetime-local" 
              value={end ? new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().substring(0, 16) : ''}
              onChange={(e) => setEnd(new Date(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </div>
  );
}
