import {  TrendingUp, DollarSign, CreditCard, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ViewType = 'income' | 'networth' | 'transactions';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  userName: string;
  onLogout: () => void;
}

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  view: ViewType;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const NavButton = ({ icon: Icon, label, view, currentView, setCurrentView }: NavButtonProps) => (
  <button
    onClick={() => setCurrentView(view)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      currentView === view
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function Sidebar({ currentView, setCurrentView, userName, onLogout }: SidebarProps) {

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-6 flex flex-col sticky top-0">
      <div className="flex items-center gap-2 mb-8">
        <TrendingUp className="text-blue-600" size={32} />
        <h1 className="text-xl font-semibold">Finance Tracker</h1>
      </div>

      <nav className="flex flex-col gap-2">
        <NavButton icon={DollarSign} label="Income" view="income" currentView={currentView} setCurrentView={setCurrentView} />
        <NavButton icon={TrendingUp} label="Net Worth" view="networth" currentView={currentView} setCurrentView={setCurrentView} />
        <NavButton icon={CreditCard} label="Transactions" view="transactions" currentView={currentView} setCurrentView={setCurrentView} />
      </nav>

      <div className="mt-auto border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{userName.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">Personal Account</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
