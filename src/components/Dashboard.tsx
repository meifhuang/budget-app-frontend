import type { Income, NetWorth, Transaction } from '../../App';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  incomes: Income[];
  netWorthData: NetWorth[];
  transactions: Transaction[];
}

export default function Dashboard({ incomes, netWorthData, transactions }: DashboardProps) {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const currentNetWorth = netWorthData.length > 0 ? netWorthData[netWorthData.length - 1].totalAmount : 0;
  const previousNetWorth = netWorthData.length > 1 ? netWorthData[netWorthData.length - 2].totalAmount : 0;
  const netWorthChange = currentNetWorth - previousNetWorth;
  const netWorthChangePercent = previousNetWorth > 0 ? ((netWorthChange / previousNetWorth) * 100).toFixed(1) : '0';

  const recentTransactions = transactions.slice(0, 5);
  
  const chartData = netWorthData.map(snapshot => ({
    date: snapshot.date,
    amount: snapshot.totalAmount
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-sm text-gray-500">Total Income</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">${totalIncome.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">{incomes.length} income sources</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <span className="text-sm text-gray-500">Net Worth</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">${currentNetWorth.toLocaleString()}</h3>
          <div className="flex items-center gap-1 mt-1">
            {netWorthChange >= 0 ? (
              <>
                <ArrowUpRight className="text-green-600" size={16} />
                <p className="text-sm text-green-600">+{netWorthChangePercent}% from last month</p>
              </>
            ) : (
              <>
                <ArrowDownRight className="text-red-600" size={16} />
                <p className="text-sm text-red-600">{netWorthChangePercent}% from last month</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <CreditCard className="text-red-600" size={24} />
            </div>
            <span className="text-sm text-gray-500">Total Expenses</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">{transactions.length} transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Net Worth Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })} />
              <YAxis />
              <Tooltip formatter={(value) => `$${value?.toLocaleString()}`} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaction.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{transaction.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{transaction.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${transaction.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{transaction.paymentType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
