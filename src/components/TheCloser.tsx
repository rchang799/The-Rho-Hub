import { useState } from 'react';
import { generateOutreachMessage } from '../services/geminiService';

export default function TheCloser() {
  const [activeName, setActiveName] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!activeName.trim() || !reason.trim()) return;
    setIsLoading(true);
    const result = await generateOutreachMessage(activeName, reason);
    setMessage(result);
    setIsLoading(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">The Closer</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-slate-600 mb-4">Generate a personalized outreach message for an active member.</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="activeName" className="block text-sm font-medium text-slate-700">Active's Name</label>
            <input
              type="text"
              id="activeName"
              value={activeName}
              onChange={(e) => setActiveName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Outreach</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., To discuss their experience in marketing..."
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !activeName.trim() || !reason.trim()}
          className="mt-6 w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Personalized Message'}
        </button>

        {message && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">Generated Message:</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
