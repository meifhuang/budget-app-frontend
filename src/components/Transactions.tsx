import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, TrendingUp, DollarSign, ShoppingCart, Trash2, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CreatableSelect from './CreateableSelect';


export interface Transaction {
  id: string;
  company: { name: string };  // ← Object, not string
  category: { name: string };
  item: string;
  amount: number;
  paymentType: string;
  date: string;
}

export default function TransactionTracker() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
  const categoryColorMap: Record<string, string> = {};
    const getCategoryColor = (category: string): string => {
    if (!categoryColorMap[category]) {
        categoryColorMap[category] = COLORS[Object.keys(categoryColorMap).length % COLORS.length];
    }
    return categoryColorMap[category];
    };

  
  // Analytics filters - default to current year, no "all years" option
  const currentYear = new Date().getFullYear().toString();
  const [analyticsFilterYear, setAnalyticsFilterYear] = useState(currentYear);
  
  // Transaction table filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterYear, setFilterYear] = useState(currentYear);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    company: '',
    category: '',
    item: '',
    amount: '',
    paymentType: '',
    date: '',
  });

  const [existingCompanies, setExistingCompanies] = useState<string[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

   useEffect(() => {
  // Fetch companies with search
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${apiBase}/companies?query=${formData.company}`, {
        credentials: 'include',
      });
      const data = await res.json() as Array<{ name: string; id: string }>;
      setExistingCompanies(data.map(c => c.name));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch categories with search
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiBase}/categories?query=${formData.category}`, {
        credentials: 'include',
      });
      const data = await res.json() as Array<{ name: string; id: string }>;
      setExistingCategories(data.map(c => c.name));
    } catch (err) {
      console.error(err);
    }
  };

  if (formData.company.length > 0) {
    fetchCompanies();
  }
  if (formData.category.length > 0) {
    fetchCategories();
  }
}, [formData.company, formData.category, apiBase]);

useEffect(() => {
  // Fetch companies
  fetch(`${apiBase}/companies`, { credentials: 'include' })
    .then(r => r.json())
    .then((data: Array<{ name: string; id: string }>) => setExistingCompanies(data.map(c => c.name)))
    .catch(err => console.error('Failed to fetch companies:', err));

  // Fetch categories
  fetch(`${apiBase}/categories`, { credentials: 'include' })
    .then(r => r.json())
    .then((data: Array<{ name: string; id: string }>) => setExistingCategories(data.map(c => c.name)))
    .catch(err => console.error('Failed to fetch categories:', err));
}, [apiBase]);

  // Fetch transactions
useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${apiBase}/transactions?year=${analyticsFilterYear}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
    //   console.log(data)

      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchTransactions();
}, [analyticsFilterYear, apiBase]);

// Handle submit (create or update)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log(formData)
  
  if (!formData.company || !formData.category || !formData.item || !formData.amount || !formData.paymentType || !formData.date) {
    return;
  }

  try {
    const url = editingId 
      ? `${apiBase}/transactions/${editingId}` 
      : `${apiBase}/transactions`;
    
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        company: formData.company,
        category: formData.category,
        item: formData.item,
        amount: parseFloat(formData.amount),
        paymentType: formData.paymentType,
        date: formData.date,
      }),
    });

    if (!res.ok) throw new Error('Failed to save');

    // Refresh transactions
    const refreshRes = await fetch(`${apiBase}/transactions?year=${filterYear}`, {
      credentials: 'include',
    });
    setTransactions(await refreshRes.json());

    // Reset form
    setFormData({ company: '', category: '', item: '', amount: '', paymentType: '', date: '' });
    setEditingId(null);
    setShowForm(false);
  } catch (err) {
    console.log(err)
    console.error(err);
  }
};

// Handle delete
const handleDelete = async (id: string) => {
  if (!confirm('Delete this transaction?')) return;

  try {
    const res = await fetch(`${apiBase}/transactions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Failed to delete');

    // Refresh
    const refreshRes = await fetch(`${apiBase}/transactions?year=${filterYear}`, {
      credentials: 'include',
    });
    setTransactions(await refreshRes.json());
  } catch (err) {
    console.error(err);
  }
};

// Handle edit (populate form)
const handleEdit = (transaction: Transaction) => {
  setEditingId(transaction.id);
  setFormData({
    company: transaction.company.name,
    category: transaction.category.name,
    item: transaction.item,
    amount: transaction.amount.toString(),
    paymentType: transaction.paymentType,
    date: transaction.date,
  });
  setShowForm(true);
};

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ company: '', category: '', item: '', amount: '', paymentType: '', date: '' });
    setShowForm(false);
  };

  const categories = Array.from(new Set(transactions.map(t => t.category.name)));
  
  // Analytics filtered transactions
  const analyticsFilteredTransactions = transactions.filter(transaction => {
    return new Date(transaction.date).getFullYear().toString() === analyticsFilterYear;
  });
  // Transaction table filtered transactions
    const tableFilteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
        transaction.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.item.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
        transaction.category.name === filterCategory;
    
    return matchesSearch && matchesCategory;
    });


  const totalSpent = analyticsFilteredTransactions.reduce((sum, transaction) => {
  return sum + Number(transaction.amount);
}, 0);

  const categoryData = categories.map(category => ({
    name: category,
    value: analyticsFilteredTransactions.filter(t => t.category.name === category).reduce((sum, t) => sum + t.amount, 0),
  }));

  // Month-by-month categorical spending
  const monthlyCategoricalData = analyticsFilteredTransactions.reduce((acc, transaction) => {
    const month = transaction.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month };
    }
    acc[month][transaction.category.name] = (acc[month][transaction.category.name] || 0) + Number(transaction.amount);
    return acc;
  }, {} as Record<string, any>);

  const monthlyCategoricalChartData = Object.values(monthlyCategoricalData)
  .map((monthData: any) => {
    const [year, month] = monthData.month.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
      .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    return {
      ...monthData,
      month: monthName,
      monthKey: monthData.month, // Keep original for sorting
      total: categories.reduce((sum, cat) => sum + (monthData[cat] || 0), 0),
    };
  })
  .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Category breakdown table data
  const months = Array.from(new Set(
    analyticsFilteredTransactions.map(t => t.date.substring(0, 7))
  )).sort();

  const categoryBreakdownData = categories.map(category => {
    const row: any = { category };
    let total = 0;
    months.forEach(month => {
      const amount = analyticsFilteredTransactions
        .filter(t => t.category.name === category && t.date.substring(0, 7) === month)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      row[month] = amount;
      total += amount;
    });
    row.total = total;
    return row;
  });

  // Analytics stats
  const avgTransactionAmount = analyticsFilteredTransactions.length > 0 
    ? analyticsFilteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / analyticsFilteredTransactions.length 
    : 0;

  const topCategory = categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, { name: 'N/A', value: 0 });

  const totalPages = Math.ceil(tableFilteredTransactions.length / itemsPerPage);
  const currentTransactions = tableFilteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const availableYears = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear().toString()))).sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track and manage all your expenses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CreatableSelect
                value={formData.company}
                onChange={(value) => setFormData({ ...formData, company: value })}
                options={existingCompanies}
                placeholder="e.g., Amazon, Starbucks"
                label="Company Name"
                required
              />
              <CreatableSelect
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value })}
                options={existingCategories}
                placeholder="e.g., Shopping, Food & Dining"
                label="Category"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item/Description</label>
                <input
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="What did you buy?"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select payment type</option>
                  <option value="Chase Sapphire">Chase Sapphire</option>
                  <option value="Chase Freedom Flex">Chase Freedom Flex</option>
                  <option value="Cash">Cash</option>
                  <option value="Venmo">Venmo</option>
                  <option value="Paypal">Paypal</option>
                  <option value="Discover"> Discover</option>
                  <option value="Amex"> Amex</option>
                </select>
              </div>
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
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Update Transaction' : 'Add Transaction'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Total Spending</h2>
            <p className="text-5xl font-bold">${totalSpent.toLocaleString()}</p>
            <p className="text-red-100 mt-2">{analyticsFilteredTransactions.length} transactions</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <Filter className="text-white" size={20} />
            <select
              value={analyticsFilterYear}
              onChange={(e) => setAnalyticsFilterYear(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year} className="text-gray-900">{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full p-3">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900">${avgTransactionAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 rounded-full p-3">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Category</p>
                <p className="text-lg font-bold text-gray-900">{topCategory.name}</p>
                <p className="text-sm text-gray-600">${Number(topCategory.value).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 rounded-full p-3">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsFilteredTransactions.length}</p>
              </div>
            </div>
          </div>
        </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
        {months.length > 0 && categoryBreakdownData.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 sticky left-0 bg-gray-50">Category</th>
                {months.map(month => (
                  <th key={month} className="px-4 py-3 text-right font-medium text-gray-700">
                    {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categoryBreakdownData.map((row, index) => (
                <tr key={row.category} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, color: COLORS[index % COLORS.length] }}>
                      {row.category}
                    </span>
                  </td>
                  {months.map(month => (
                    <td key={month} className="px-4 py-3 text-right text-gray-900">
                      {row[month] > 0 ? `$${Number(row[month]).toFixed(2)}` : '-'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${Number(row.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-gray-400">
            No category breakdown data available
          </div>
        )}
      </div>
        </div> 
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Month-to-Month Categorical Spending</h3>
        {monthlyCategoricalChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyCategoricalChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
              <Legend />
              {categories.map((category, index) => (
                <Bar 
                  key={category} 
                  dataKey={category} 
                  stackId="a"
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-400">
            No monthly categorical spending data available
          </div>
        )}
      </div>

     

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search & Filter Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear().toString()))).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.company.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full" style={{ 
                        backgroundColor: `${getCategoryColor(transaction.category.name)}20`, 
                        color: `${getCategoryColor(transaction.category.name)}`
                        }}>
                      {transaction.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.paymentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                    ${Number(transaction.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <p className="text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </p>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div> 
      </div>
    </div>
  );
}

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
  '#3498DB', // Bright blue
  '#E67E22', // Dark orange
  '#16A085', // Dark teal
  '#8E44AD', // Dark purple
  '#C0392B', // Dark red
];