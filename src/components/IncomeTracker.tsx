import { useState, useEffect } from 'react';
import type { Income } from '../../App';
import { Plus, Calendar, Filter, Loader, Trash2} from 'lucide-react';

export default function IncomeTracker() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [totalIncome, setTotalIncome] = useState(0);
  const [formData, setFormData] = useState({
    date: '',
    source: '',
    amount: '',
  });

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  useEffect(() => {
  const fetchYears = async () => {
    const res = await fetch(`${apiBase}/income/years`, {
      credentials: 'include',
    });
    const data = await res.json();
    setAvailableYears(data.years);
  };
  fetchYears();
}, []);

  // Fetch incomes from backend

  useEffect(() => {
  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const queryParam = yearFilter === 'all' ? '' : `?year=${yearFilter}`;
      const res = await fetch(`${apiBase}/income${queryParam}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch incomes');
      const data = await res.json();
      setIncomes(data.yearIncomes);
      setTotalIncome(yearFilter === 'all' ? data.allTimeTotal : data.yearTotal)
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading incomes');
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  fetchIncomes();
}, [yearFilter, apiBase]); 

const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`${apiBase}/income/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to delete income');

    // Remove from UI
    setIncomes(incomes.filter(income => income.id !== id));
    setError('');
  } catch (err) {
    console.log(err);
    setError(err instanceof Error ? err.message : 'Error deleting income');
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.source || !formData.amount) return;

    try {
      const res = await fetch(`${apiBase}/income`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: formData.date,
          source: formData.source,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!res.ok) throw new Error('Failed to add income');

      const newIncome = await res.json();
      setIncomes([newIncome, ...incomes]);
      setFormData({ date: '', source: '', amount: '' });
      setShowForm(false);
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : 'Error adding income');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Tracker</h1>
          <p className="text-gray-600 mt-1">Track all your income sources</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Income
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold">Total Income</h2>
        </div>
        <p className="text-5xl font-bold">${totalIncome.toFixed(2)}</p>
        <p className="text-green-100 mt-2">{incomes.length} income entries</p>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Income</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Salary, Freelance, Investment"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Income
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" size={20} />
          <label className="text-sm font-medium text-gray-700">Filter by Year:</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-gray-600">Loading incomes...</p>
            </div>
          </div>
        ) : incomes.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-gray-600">No income entries yet. Add one to get started!</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {incomes.map((income) => (
              <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-sm text-gray-900">
                      {new Date(income.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{income.source}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-green-600">
                    +${income.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
