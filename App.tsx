import React, { useState } from 'react';
import Login from './src/components/Login';
import Dashboard from './src/components/Dashboard';
import Sidebar from './src/components/Sidebar';
import IncomeTracker from './src/components/IncomeTracker';

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

export interface NetWorth {
  id: string;
  date: string;
  accounts: {
    name: string;
    amount: number;
  }[];
  totalAmount: number;
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'income' | 'networth' | 'transactions' | 'analytics'>('dashboard');

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
    setCurrentView('dashboard');
  };

  const [incomes] = useState<Income[]>([
    { id: '1', date: '2025-01-01', source: 'Salary - Tech Corp', amount: 5000 },
    { id: '2', date: '2024-12-01', source: 'Salary - Tech Corp', amount: 5000 },
    { id: '3', date: '2024-12-15', source: 'Freelance Project', amount: 1200 },
  ]);

  const [netWorthData] = useState<NetWorth[]>([
    { id: '1', date: '2024-12-01', accounts: [{ name: 'Savings', amount: 55000 }], totalAmount: 55000 },
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: '1', company: 'Amazon', category: 'Shopping', item: 'Electronics', amount: 299.99, paymentType: 'Credit Card', date: '2025-01-03' },
    { id: '2', company: 'Whole Foods', category: 'Groceries', item: 'Weekly Shopping', amount: 125.5, paymentType: 'Debit Card', date: '2025-01-02' },
  ]);

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
        {currentView === 'dashboard' && (
          <Dashboard
            incomes={incomes}
            netWorthData={netWorthData}
            transactions={transactions}
          />
        )}
        {currentView === 'income' && <IncomeTracker />}

        {currentView === 'networth' && (
          <div className="text-center text-gray-500 py-12">NetWorth Tracker - Coming Soon</div>
        )}
        {currentView === 'transactions' && (
          <div className="text-center text-gray-500 py-12">Transactions Tracker - Coming Soon</div>
        )}
        {currentView === 'analytics' && (
          <div className="text-center text-gray-500 py-12">Analytics - Coming Soon</div>
        )} 
      </main>
    </div>
  );
}
