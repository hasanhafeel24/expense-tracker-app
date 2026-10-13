import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../api';
import useAuthStore from '../store/authStore';
import {
  MonthlyAreaChart, CategoryPieChart, SpendingBarChart, YearlyBarChart,
} from '../components/charts/Charts';
import { formatCurrency, CHART_COLORS, MONTHS } from '../utils/constants';

const now = new Date();

export default function Analytics() {
  const { user } = useAuthStore();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: monthly } = useQuery({
    queryKey: ['monthly', year],
    queryFn: () => analyticsAPI.getMonthly({ year }).then((r) => r.data.data),
  });

  const { data: yearly } = useQuery({
    queryKey: ['yearly'],
    queryFn: () => analyticsAPI.getYearly().then((r) => r.data.data),
  });

  const { data: expenseCategories } = useQuery({
    queryKey: ['categories-expense', year, month],
    queryFn: () => analyticsAPI.getCategories({ type: 'expense', year, month }).then((r) => r.data.data),
  });

  const { data: incomeCategories } = useQuery({
    queryKey: ['categories-income', year, month],
    queryFn: () => analyticsAPI.getCategories({ type: 'income', year, month }).then((r) => r.data.data),
  });

  const { data: trends } = useQuery({
    queryKey: ['trends', year, month],
    queryFn: () => analyticsAPI.getTrends({ year, month }).then((r) => r.data.data),
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => analyticsAPI.getPaymentMethods().then((r) => r.data.data),
  });

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep insights into your financial patterns</p>
        </div>
        <div className="flex items-center gap-12">
          <select className="form-control" style={{ width: 'auto' }}
            value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }}
            value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Monthly Income vs Expense */}
      <div className="card mb-20">
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>
          Income vs Expenses — {year}
        </h3>
        {monthly?.months ? (
          <MonthlyAreaChart data={monthly.months} currency={user?.currency} />
        ) : <div className="loading-center"><div className="spinner" /></div>}
      </div>

      {/* Category Breakdown */}
      <div className="grid-2 mb-20">
        <div className="card">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            💸 Expense Categories — {MONTHS[month - 1]}
          </h3>
          {expenseCategories?.categories?.length > 0 ? (
            <>
              <CategoryPieChart data={expenseCategories.categories} currency={user?.currency} />
              <div style={{ marginTop: '12px' }}>
                {expenseCategories.categories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-8">
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '13px' }}>{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.percentage}%</span>
                      <span style={{ fontWeight: 600, color: 'var(--coral)', fontSize: '13px' }}>
                        {formatCurrency(cat.total, user?.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No expense data</div></div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            💰 Income Sources — {MONTHS[month - 1]}
          </h3>
          {incomeCategories?.categories?.length > 0 ? (
            <>
              <CategoryPieChart data={incomeCategories.categories} currency={user?.currency} />
              <div style={{ marginTop: '12px' }}>
                {incomeCategories.categories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-8">
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '13px' }}>{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.percentage}%</span>
                      <span style={{ fontWeight: 600, color: 'var(--teal)', fontSize: '13px' }}>
                        {formatCurrency(cat.total, user?.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-icon">💰</div><div className="empty-text">No income data</div></div>
          )}
        </div>
      </div>

      {/* Daily Trends + Yearly */}
      <div className="grid-2 mb-20">
        <div className="card">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>
            Daily Spending — {MONTHS[month - 1]} {year}
          </h3>
          {trends?.trends?.length > 0 ? (
            <SpendingBarChart data={trends.trends} currency={user?.currency} />
          ) : (
            <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-text">No data for this period</div></div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>
            Yearly Comparison
          </h3>
          {yearly?.yearly?.length > 0 ? (
            <YearlyBarChart data={yearly.yearly} currency={user?.currency} />
          ) : (
            <div className="empty-state"><div className="empty-icon">📆</div><div className="empty-text">No yearly data</div></div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      {paymentMethods?.breakdown?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>
            Payment Methods Breakdown
          </h3>
          <div className="grid-3">
            {paymentMethods.breakdown.map(({ method, total, count }) => (
              <div key={method} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '4px' }}>
                  {method.replace(/_/g, ' ')}
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(total, user?.currency)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{count} transactions</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
