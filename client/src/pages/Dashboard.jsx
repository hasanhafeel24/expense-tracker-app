import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, transactionsAPI } from '../api';
import useAuthStore from '../store/authStore';
import { MonthlyAreaChart, CategoryPieChart } from '../components/charts/Charts';
import { formatCurrency, formatRelativeDate, getCategoryInfo, CHART_COLORS } from '../utils/constants';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import TransactionModal from '../components/ui/TransactionModal';
import { Link } from 'react-router-dom';

const now = new Date();

export default function Dashboard() {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => analyticsAPI.getSummary().then((r) => r.data.data),
  });

  const { data: monthly } = useQuery({
    queryKey: ['monthly', now.getFullYear()],
    queryFn: () => analyticsAPI.getMonthly({ year: now.getFullYear() }).then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => analyticsAPI.getCategories({ type: 'expense' }).then((r) => r.data.data),
  });

  const { data: recentData, refetch: refetchRecent } = useQuery({
    queryKey: ['transactions', { limit: 8 }],
    queryFn: () => transactionsAPI.getAll({ limit: 8 }).then((r) => r.data),
  });

  const handleModalSuccess = () => { refetchSummary(); refetchRecent(); };

  const stats = [
    {
      label: 'Total Balance',
      value: formatCurrency(summary?.balance ?? 0, user?.currency),
      variant: 'teal', textClass: 'teal-text',
      icon: DollarSign,
      change: `Savings rate: ${summary?.savingsRate ?? 0}%`,
    },
    {
      label: 'Total Income',
      value: formatCurrency(summary?.income?.total ?? 0, user?.currency),
      variant: 'purple', textClass: 'purple-text',
      icon: TrendingUp,
      change: `${summary?.income?.count ?? 0} transactions`,
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(summary?.expense?.total ?? 0, user?.currency),
      variant: 'coral', textClass: 'coral-text',
      icon: TrendingDown,
      change: `${summary?.expense?.count ?? 0} transactions`,
    },
    {
      label: 'Avg. Expense',
      value: formatCurrency(summary?.expense?.avg ?? 0, user?.currency),
      variant: 'gold', textClass: 'gold-text',
      icon: PiggyBank,
      change: `Max: ${formatCurrency(summary?.expense?.max ?? 0, user?.currency)}`,
    },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-20">
        {stats.map(({ label, value, variant, textClass, icon: Icon, change }) => (
          <div key={label} className={`stat-card ${variant}`}>
            <div className="stat-card-glow" />
            <div className="flex items-center justify-between mb-16">
              <span className="stat-label">{label}</span>
              <div style={{ background: `var(--${variant}-dim)`, padding: '8px', borderRadius: '8px' }}>
                <Icon size={16} color={`var(--${variant === 'gold' ? 'gold' : variant === 'teal' ? 'teal' : variant === 'purple' ? 'purple-light' : 'coral'})`} />
              </div>
            </div>
            <div className={`stat-value ${textClass}`}>{value}</div>
            <div className="stat-change">{change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2-1 mb-20">
        {/* Monthly Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px' }}>
              Monthly Overview — {now.getFullYear()}
            </h3>
          </div>
          {monthly?.months ? (
            <MonthlyAreaChart data={monthly.months} currency={user?.currency} />
          ) : (
            <div className="loading-center"><div className="spinner" /></div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            Expense Categories
          </h3>
          {categories?.categories?.length > 0 ? (
            <>
              <CategoryPieChart data={categories.categories} currency={user?.currency} />
              <div style={{ marginTop: '8px' }}>
                {categories.categories.slice(0, 5).map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-8">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '13px' }}>{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.percentage}%</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--coral)' }}>
                        {formatCurrency(cat.total, user?.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-text">No expense data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px' }}>Recent Transactions</h3>
          <Link to="/transactions" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentData?.data?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Method</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentData.data.map((t) => {
                const catInfo = getCategoryInfo(t.category, t.type);
                return (
                  <tr key={t._id}>
                    <td>
                      <div className="flex items-center gap-8">
                        <span style={{ fontSize: '18px' }}>{catInfo.icon}</span>
                        <span style={{ fontWeight: 500 }}>{t.description || t.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${catInfo.color}18`, color: catInfo.color }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatRelativeDate(t.date)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'capitalize' }}>
                      {t.paymentMethod?.replace('_', ' ')}
                    </td>
                    <td className="text-right" style={{ fontWeight: 600, color: t.type === 'income' ? 'var(--teal)' : 'var(--coral)' }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-text">Add your first transaction to get started</div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
