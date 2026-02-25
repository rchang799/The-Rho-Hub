import { ChevronLeft, ChevronRight } from 'lucide-react';
import { View, Navigate, ToolbarProps } from 'react-big-calendar';



const CalendarToolbar = ({ label, view, views, onNavigate, onView }: ToolbarProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onNavigate(Navigate.TODAY)}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate(Navigate.PREVIOUS)}
          className="p-2 text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => onNavigate(Navigate.NEXT)}
          className="p-2 text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="text-lg font-bold text-slate-800">
        {label}
      </div>
      <div className="flex items-center rounded-md bg-slate-200 p-0.5">
        {(views as string[]).map((viewName) => (
          <button
            key={viewName}
            onClick={() => onView(viewName as View)}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
              view === viewName
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarToolbar;
