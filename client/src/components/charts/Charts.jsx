import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/constants';

const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontWeight: 600 }}>
          {entry.name}: {formatCurrency(entry.value, currency)}
        </p>
      ))}
    </div>
  );
};

export function MonthlyAreaChart({ data, currency = 'USD' }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="monthName" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => v.slice(0, 3)} />
        <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
        <Area type="monotone" dataKey="income" stroke="#00D4AA" strokeWidth={2} fill="url(#incomeGrad)" name="Income" dot={false} />
        <Area type="monotone" dataKey="expense" stroke="#FF6B6B" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data, currency = 'USD' }) {
  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="50%"
          innerRadius={60} outerRadius={100}
          dataKey="total" nameKey="category"
          labelLine={false} label={renderLabel}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [formatCurrency(value, currency), name]}
          contentStyle={{ background: '#1E2432', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' }}
          labelStyle={{ color: '#94A3B8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SpendingBarChart({ data, currency = 'USD' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${v}`} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Bar dataKey="total" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Spending" maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function YearlyBarChart({ data, currency = 'USD' }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="year" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
        <Bar dataKey="income" fill="#00D4AA" radius={[4, 4, 0, 0]} name="Income" maxBarSize={40} />
        <Bar dataKey="expense" fill="#FF6B6B" radius={[4, 4, 0, 0]} name="Expense" maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
