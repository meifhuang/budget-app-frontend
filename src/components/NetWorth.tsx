import { useState, useEffect} from 'react';
import { Plus, TrendingUp, Trash2, Edit2} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface AccountInput {
  id: string;
  name: string;
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


export default function NetWorthTracker() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountInput[]>([{ id: '1', name: '', amount: '' }]);
  const [netWorthData, setNetWorthData] = useState<NetWorth[]>([]);
  const [newAccountNames, setNewAccountNames] = useState<Record<string, string>>({});

    const handleAccountChange = (id: string, field: 'name' | 'amount', value: string) => {
    setAccounts(accounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc));
    };

    const handleNewAccountInput = (id: string, value: string) => {
    setNewAccountNames({ ...newAccountNames, [id]: value });
    };


  const handleAddAccount = () => {
    setAccounts([...accounts, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const handleRemoveAccount = (id: string) => {
    if (accounts.length > 1) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleDelete = async (snapshotDate: string) => {
  if (!confirm('Delete this entire snapshot?')) return;

  try {
    const res = await fetch(`${apiBase}/networth/${snapshotDate}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to delete');

    // Refresh data
    const refreshRes = await fetch(`${apiBase}/networth/all`, {
      credentials: 'include',
    });
    setNetWorthData(await refreshRes.json());
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error deleting snapshot');
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!date || !accounts.every(acc => acc.name && acc.amount)) {
    setError('Please fill in all fields');
    return;
  }

  try {
    const url = editingId 
      ? `${apiBase}/networth/${editingId}` 
      : `${apiBase}/networth`;
    
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        date,
        accounts: accounts.map(acc => ({
          accountName: acc.name === '_new' ? newAccountNames[acc.id] : acc.name,
          amount: parseFloat(acc.amount),
        })),
      }),
    });

    if (!res.ok) throw new Error('Failed to save');

    // Refresh
    const refreshRes = await fetch(`${apiBase}/networth/all`, {
      credentials: 'include',
    });
    setNetWorthData(await refreshRes.json());

    // Reset
    setEditingId(null);
    setDate('');
    setAccounts([{ id: '1', name: '', amount: '' }]);
    setShowForm(false);
    setNewAccountNames({});
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error saving');
  }
};

  const currentTotal = accounts.reduce((sum, acc) => sum + (parseFloat(acc.amount) || 0), 0);
  const currentNetWorth = netWorthData.length > 0 ? netWorthData[netWorthData.length - 1].totalAmount : 0;
  const firstNetWorth = netWorthData.length > 0 ? netWorthData[0].totalAmount : 0;
  const totalGrowth = currentNetWorth - firstNetWorth;
  const growthPercent = firstNetWorth > 0 ? ((totalGrowth / firstNetWorth) * 100).toFixed(1) : '0';

  const mostRecentSnapshot = netWorthData[netWorthData.length-1];
  const allAccountNames = Array.from(new Set(netWorthData.flatMap(snapshot => snapshot.accounts.map(acc => acc.name))));

  const totalNetWorthChartData = netWorthData.map(snapshot => ({
    date: snapshot.date,
    total: snapshot.totalAmount
  }));

  const accountBreakdownData = netWorthData.map(snapshot => {
    const data: any = { date: snapshot.date };
    snapshot.accounts.forEach(acc => { data[acc.name] = acc.amount; });
    return data;
  });

  const COLORS = [
  '#5DADE2', // Bold blue
  '#AF7AC5', // Bold purple
  '#EC7063', // Bold pink/red
  '#F8B88B', // Bold orange
  '#52BE80', // Bold green
  '#E74C3C', // Bold red
  '#9B59B6', // Bold indigo
  '#17A589', // Bold teal
  '#F39C12', // Bold amber
  '#76D7C4', // Bold mint
];
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
  
    useEffect(() => {
    const fetchNetworth = async () => {
      const res = await fetch(`${apiBase}/networth/all`, {
        credentials: 'include',
      });
      const data = await res.json();
      setNetWorthData(data)
    };
    fetchNetworth();
  }, [apiBase])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Net Worth Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor your net worth across all accounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Snapshot
        </button>
      </div>
<div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg p-8 text-white">
    <div className="flex items-center gap-3 mb-2">
    <TrendingUp size={32} />
    <h2 className="text-2xl font-semibold">Current Net Worth</h2>
    </div>
        <p className="text-5xl font-bold">${currentNetWorth.toLocaleString()}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-blue-100">Total Growth:</span>
          <span className="font-semibold">
            ${totalGrowth.toLocaleString()} ({Number(growthPercent) >= 0 ? '+' : ''}{growthPercent}%)
          </span>
        </div>
        {mostRecentSnapshot && (
          <p className="text-blue-100 mt-2 text-sm">
            Last updated: {new Date(mostRecentSnapshot.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>


      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Net Worth Snapshot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Snapshot Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Accounts</h3>
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Add Account
                </button>
              </div>

              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex gap-3 items-start">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">Account Name</label>
                            <select
                            value={account.name}
                            onChange={(e) => handleAccountChange(account.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            >
                            <option value="">Select account...</option>
                            {allAccountNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                            <option value="_new">+ Add new account</option>
                            </select>
                            
                         {account.name === '_new' && (
                            <input
                                type="text"
                                placeholder="New account name"
                                value={newAccountNames[account.id] || ''}
                                onChange={(e) => handleNewAccountInput(account.id, e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mt-2"
                            />
                            )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                        <input
                          type="number"
                          value={account.amount}
                          onChange={(e) => handleAccountChange(account.id, 'amount', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAccount(account.id)}
                        className="mt-6 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {currentTotal > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Net Worth:</span>
                    <span className="text-xl font-bold text-blue-600">${currentTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Snapshot
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setDate('');
                  setAccounts([{ id: '1', name: '', amount: '' }]);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {mostRecentSnapshot && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Recent Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mostRecentSnapshot.accounts.map((account, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{account.name}</p>
                <p className="text-2xl font-bold text-gray-900">${account.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Total Net Worth Over Time</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={totalNetWorthChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => `$${value?.toLocaleString()}`}
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Breakdown Over Time</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={accountBreakdownData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => `$${value?.toLocaleString()}`}
              labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
            <Legend />
            {allAccountNames.map((accountName, index) => (
              <Bar 
                key={accountName} 
                dataKey={accountName} 
                stackId="a" 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Net Worth Snapshots</h2>
        <div className="space-y-4">
          {netWorthData.slice().reverse().map((snapshot) => (
            <div key={snapshot.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(snapshot.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">${snapshot.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                <button
                    onClick={() => {
                        setEditingId(snapshot.date);
                        setDate(snapshot.date);
                        setAccounts(snapshot.accounts.map((acc, i) => ({ 
                        id: i.toString(), 
                        name: acc.name, 
                        amount: acc.amount.toString() 
                        })));
                        setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-2"
                    >
                    <Edit2 size={20} />
                    </button>
                  <button
                    onClick={() => handleDelete(snapshot.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Delete snapshot"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {snapshot.accounts.map((account, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs text-gray-500 mb-1">{account.name}</p>
                    <p className="text-lg font-semibold text-gray-900">${account.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
