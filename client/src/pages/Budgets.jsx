import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsAPI } from '../api';
import useAuthStore from '../store/authStore';
import { formatCurrency, EXPENSE_CATEGORIES, MONTHS } from '../utils/constants';
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

const now = new Date();

export default function Budgets() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [form, setForm] = useState({ category: '', limit: '', alertThreshold: 80, period: 'monthly', color: '#7C3AED' });

  const { data, isLoading } = useQuery({
    queryKey: ['budgets', year, month],
    queryFn: () => budgetsAPI.getAll({ year, month }).then((r) => r.data.data),
  });

  const budgets = data?.budgets || [];

  const handleOpen = (budget = null) => {
    if (budget) {
      setEditBudget(budget);
      setForm({ category: budget.category, limit: budget.limit, alertThreshold: budget.alertThreshold, period: budget.period, color: budget.color });
    } else {
      setEditBudget(null);
      setForm({ category: '', limit: '', alertThreshold: 80, period: 'monthly', color: '#7C3AED' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.category || !form.limit) return toast.error('Category and limit are required');
    try {
      const payload = { ...form, limit: Number(form.limit), year, month };
      if (editBudget) {
        await budgetsAPI.update(editBudget._id, payload);
        toast.success('Budget updated!');
      } else {
        await budgetsAPI.create(payload);
        toast.success('Budget created!');
      }
      qc.invalidateQueries(['budgets']);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await budgetsAPI.delete(id);
      toast.success('Budget deleted');
      qc.invalidateQueries(['budgets']);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set and track spending limits by category</p>
        </div>
        <div className="flex items-center gap-12">
          <select className="form-control" style={{ width: 'auto' }}
            value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }}
            value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => handleOpen()}>
            <Plus size={16} /> Add Budget
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <div className="empty-title">No budgets set</div>
            <div className="empty-text">Create budgets to track and control your spending by category</div>
            <button className="btn btn-primary mt-16" onClick={() => handleOpen()}><Plus size={16} /> Create Budget</button>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {budgets.map((b) => (
            <div key={b._id} className="card" style={{ borderColor: b.isOverBudget ? 'rgba(255,107,107,0.3)' : b.isNearLimit ? 'rgba(245,158,11,0.3)' : 'var(--border)' }}>
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-8">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: b.color }} />
                  <div style={{ fontWeight: 600 }}>{b.category}</div>
                  {b.isOverBudget && (
                    <span className="badge badge-expense" title="Over budget!">
                      <AlertTriangle size={10} /> Over Budget
                    </span>
                  )}
                  {!b.isOverBudget && b.isNearLimit && (
                    <span className="badge badge-warning">
                      <AlertTriangle size={10} /> Near Limit
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-8">
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleOpen(b)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(b._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {formatCurrency(b.spent, user?.currency)} spent
                </span>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>
                  {formatCurrency(b.limit, user?.currency)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(b.usagePercentage, 100)}%`,
                    background: b.isOverBudget ? 'var(--coral)' : b.isNearLimit ? 'var(--gold)' : b.color,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-8">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.usagePercentage}% used</span>
                <span style={{
                  fontSize: '12px', fontWeight: 600,
                  color: b.isOverBudget ? 'var(--coral)' : b.remaining >= 0 ? 'var(--teal)' : 'var(--coral)',
                }}>
                  {b.remaining >= 0 ? `${formatCurrency(b.remaining, user?.currency)} left` : `${formatCurrency(Math.abs(b.remaining), user?.currency)} over`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editBudget ? 'Edit Budget' : 'Create Budget'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editBudget ? 'Update' : 'Create'} Budget
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-control" value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
            <option value="">Select category</option>
            {EXPENSE_CATEGORIES.map(({ label }) => <option key={label} value={label}>{label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Budget Limit ({user?.currency})</label>
          <input className="form-control" type="number" step="0.01" placeholder="0.00"
            value={form.limit} onChange={(e) => setForm((p) => ({ ...p, limit: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Alert at (%)</label>
          <input className="form-control" type="number" min={1} max={100}
            value={form.alertThreshold} onChange={(e) => setForm((p) => ({ ...p, alertThreshold: Number(e.target.value) }))} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Color</label>
          <div className="flex items-center gap-12">
            <input type="color" value={form.color}
              onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              style={{ width: '44px', height: '44px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pick a color for this budget</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
