import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../api';
import useAuthStore from '../store/authStore';
import TransactionModal from '../components/ui/TransactionModal';
import { formatCurrency, formatDate, getCategoryInfo } from '../utils/constants';
import { Plus, Search, Edit2, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
];

export default function Transactions() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', category: '', search: '', sortBy: 'date', order: 'desc' });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, filters],
    queryFn: () =>
      transactionsAPI.getAll({ page, limit: 15, ...filters }).then((r) => r.data),
    keepPreviousData: true,
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination || {};

  const handleFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionsAPI.delete(id);
      toast.success('Transaction deleted');
      qc.invalidateQueries(['transactions']);
      qc.invalidateQueries(['summary']);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (tx) => { setEditTx(tx); setShowModal(true); };
  const handleModalClose = () => { setShowModal(false); setEditTx(null); };
  const handleSuccess = () => { qc.invalidateQueries(['transactions']); qc.invalidateQueries(['summary']); };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.totalItems ?? 0} total transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="form-control search-input"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilter('search', e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 'auto' }}
          value={filters.type} onChange={(e) => handleFilter('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="form-control" style={{ width: 'auto' }}
          value={filters.sortBy} onChange={(e) => handleFilter('sortBy', e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto' }}
          value={filters.order} onChange={(e) => handleFilter('order', e.target.value)}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions found</div>
            <div className="empty-text">Try adjusting your filters or add a new transaction</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th>Method</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const catInfo = getCategoryInfo(t.category, t.type);
                return (
                  <tr key={t._id}>
                    <td>
                      <div className="flex items-center gap-8">
                        <span style={{ fontSize: '18px' }}>{catInfo.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '14px' }}>{t.description || t.title}</div>
                          {t.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.notes}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${catInfo.color}18`, color: catInfo.color }}>
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${t.type}`}>
                        {t.type === 'income' ? '↑' : '↓'} {t.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(t.date)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'capitalize' }}>
                      {t.paymentMethod?.replace(/_/g, ' ')}
                    </td>
                    <td className="text-right" style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--teal)' : 'var(--coral)', fontSize: '15px' }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, user?.currency)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center gap-8" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(t)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(t._id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}>
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
            const pg = i + 1;
            return (
              <button key={pg} className={`pagination-btn ${pg === page ? 'active' : ''}`} onClick={() => setPage(pg)}>
                {pg}
              </button>
            );
          })}
          <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={showModal}
        onClose={handleModalClose}
        transaction={editTx}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
