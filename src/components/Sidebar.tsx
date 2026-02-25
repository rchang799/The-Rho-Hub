import { ClipboardList, Bot, Send } from 'lucide-react';
import { View } from '../App';

const navigation: { name: View; icon: React.ElementType }[] = [
  { name: 'Unified Game Plan', icon: ClipboardList },
  { name: 'Pro-Coach', icon: Bot },
  { name: 'The Closer', icon: Send },
];

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white h-full">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-2xl font-bold">PSE Sage</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveView(item.name)}
            className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md text-left transition-colors ${
              activeView === item.name
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
