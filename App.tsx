import React, { useState } from 'react';
import Login from './src/components/Login';
import Sidebar from './src/components/Sidebar';
import IncomeTracker from './src/components/IncomeTracker';
import NetWorthTracker from './src/components/NetWorth';
import TransactionTracker from './src/components/Transactions';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Income {
  id: string;
  date: string;
  source: string;
  amount: string;
}


export interface Transaction {
  id: string;
  company: string;
  category: string;
  item: string;
  amount: number;
  paymentType: string;
  date: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'income' | 'networth' | 'transactions' | 'analytics'>('transactions');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setCurrentView('transactions');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        userName={user.name}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-8">
        {currentView === 'income' && <IncomeTracker />}
        {currentView === 'networth' && <NetWorthTracker /> }
        {currentView === 'transactions' && <TransactionTracker /> }
        {currentView === 'analytics' && (
          <div className="text-center text-gray-500 py-12">Analytics - Coming Soon</div>
        )} 
      </main>
    </div>
  );
}
