import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS,
} from '../../utils/constants';
import { transactionsAPI } from '../../api';
import { useState } from 'react';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(1, 'Description is required').max(200),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().optional(),
  notes: z.string().max(500).optional(),
  isRecurring: z.boolean().optional(),
});

// Helper to get display title from transaction (supports both 'title' and 'description' fields)
export const getTransactionTitle = (t) => t?.description || t?.title || '';

export default function TransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const isEdit = Boolean(transaction);
  const [type, setType] = useState(transaction?.type || 'expense');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount || '',
      category: transaction?.category || '',
      description: transaction?.description || transaction?.title || '',
      date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: transaction?.paymentMethod || 'other',
      notes: transaction?.notes || '',
      isRecurring: transaction?.isRecurring || false,
    },
  });

  const selectedCategory = watch('category');

  const handleTypeChange = (t) => {
    setType(t);
    setValue('type', t);
    setValue('category', '');
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await transactionsAPI.update(transaction._id, data);
        toast.success('Transaction updated!');
      } else {
        await transactionsAPI.create(data);
        toast.success('Transaction added!');
      }
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Transaction' : 'Add Transaction'}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} type="button">Cancel</button>
          <button
            className={`btn ${type === 'income' ? 'btn-primary' : 'btn-purple'}`}
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add Transaction'}
          </button>
        </>
      }
    >
      {/* Type Toggle */}
      <div className="type-toggle">
        <button
          type="button"
          className={`type-toggle-btn ${type === 'income' ? 'active-income' : ''}`}
          onClick={() => handleTypeChange('income')}
        >
          💰 Income
        </button>
        <button
          type="button"
          className={`type-toggle-btn ${type === 'expense' ? 'active-expense' : ''}`}
          onClick={() => handleTypeChange('expense')}
        >
          💸 Expense
        </button>
      </div>
      <input type="hidden" {...register('type')} />

      {/* Amount + Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Amount</label>
          <input
            className={`form-control ${errors.amount ? 'error' : ''}`}
            type="number" step="0.01" placeholder="0.00"
            {...register('amount')}
          />
          {errors.amount && <span className="form-error">{errors.amount.message}</span>}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date</label>
          <input
            className={`form-control ${errors.date ? 'error' : ''}`}
            type="date" {...register('date')}
          />
          {errors.date && <span className="form-error">{errors.date.message}</span>}
        </div>
      </div>

      {/* Description */}
      <div className="form-group mt-16">
        <label className="form-label">Description</label>
        <input
          className={`form-control ${errors.description ? 'error' : ''}`}
          placeholder="What was this for?"
          {...register('description')}
        />
        {errors.description && <span className="form-error">{errors.description.message}</span>}
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label">Category</label>
        <div className="category-grid">
          {categories.map(({ label, icon, color }) => (
            <button
              key={label} type="button"
              className={`category-chip ${selectedCategory === label ? 'selected' : ''}`}
              onClick={() => setValue('category', label)}
              style={selectedCategory === label ? { borderColor: color, color, background: `${color}18` } : {}}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('category')} />
        {errors.category && <span className="form-error">{errors.category.message}</span>}
      </div>

      {/* Payment Method */}
      <div className="form-group">
        <label className="form-label">Payment Method</label>
        <select className="form-control" {...register('paymentMethod')}>
          {PAYMENT_METHODS.map(({ value, label, icon }) => (
            <option key={value} value={value}>{icon} {label}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Notes (optional)</label>
        <textarea
          className="form-control" rows={2}
          placeholder="Add any additional notes..."
          {...register('notes')}
          style={{ resize: 'vertical' }}
        />
      </div>
    </Modal>
  );
}
