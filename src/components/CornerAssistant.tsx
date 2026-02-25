import { useState } from 'react';
import { MessageSquare, X, Send, Maximize, Minimize, GripVertical } from 'lucide-react';
import Draggable from 'react-draggable';
import { askTheSage, extractTasksFromNotes } from '../services/geminiService';
import { PlanEvent } from '../types';

interface CornerAssistantProps {
  schedule: PlanEvent[];
  onScheduleUpdate: (events: PlanEvent[]) => void;
}

export default function CornerAssistant({ schedule, onScheduleUpdate }: CornerAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to the PSE Hub! How can I help you plan your week?', sender: 'sage' },
  ]);
  const [inputText, setInputText] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<PlanEvent[]>([]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    if (inputText.length > 100 && inputText.includes('\n')) {
      const tasks = await extractTasksFromNotes(inputText);
      if (tasks.length > 0) {
        const planEvents: PlanEvent[] = tasks.map(task => ({ ...task, id: `task-${Date.now()}`, source: 'generated-task', priority: 'Medium' }));
        setExtractedTasks(planEvents);
        setMessages(prev => [...prev, { id: Date.now() + 1, text: `I've extracted ${tasks.length} task(s) from your notes. Should I add them to your Unified Game Plan?`, sender: 'sage' }]);
        return;
      }
    }

    const sageResponse = await askTheSage(inputText, schedule);
    setMessages(prev => [...prev, { id: Date.now() + 1, text: sageResponse, sender: 'sage' }]);
  };

  const handleConfirmAddTask = () => {
    onScheduleUpdate([...schedule, ...extractedTasks]);
    setMessages(prev => [...prev, { id: Date.now(), text: 'Tasks have been added to your schedule.', sender: 'sage' }]);
    setExtractedTasks([]);
  };

  const handleCancelAddTask = () => {
    setMessages(prev => [...prev, { id: Date.now(), text: 'No problem. I will not add the tasks.', sender: 'sage' }]);
    setExtractedTasks([]);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-transform hover:scale-110"
        aria-label="Open Sage Assistant"
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  const chatWindowClass = isFullScreen
    ? 'fixed top-0 left-0 w-full h-full rounded-none z-50'
    : 'fixed bottom-8 right-8 w-96 h-[60vh] rounded-2xl';

  return (
    <Draggable handle=".handle" disabled={isFullScreen}>
      <div className={`${chatWindowClass} bg-white shadow-2xl flex flex-col font-sans`}>
        <div className="handle flex justify-between items-center p-4 bg-slate-900 text-white rounded-t-2xl cursor-move">
          <div className="flex items-center">
            <GripVertical size={20} className="mr-2 text-slate-500" />
            <h3 className="font-bold text-lg">The Sage</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="hover:bg-slate-700 p-1 rounded-full">
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                <p className="text-sm">{msg.text}</p>
                {msg.text.includes('Should I add them to your Unified Game Plan?') && (
                  <div className="flex space-x-2 mt-2">
                    <button onClick={handleConfirmAddTask} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600">Yes, add them</button>
                    <button onClick={handleCancelAddTask} className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600">No, cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask The Sage..."
              className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
            />
            <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
