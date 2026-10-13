export const EXPENSE_CATEGORIES = [
  { label: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
  { label: 'Transportation', icon: '🚗', color: '#4ECDC4' },
  { label: 'Shopping', icon: '🛍️', color: '#45B7D1' },
  { label: 'Entertainment', icon: '🎬', color: '#96CEB4' },
  { label: 'Health & Fitness', icon: '💊', color: '#FFEAA7' },
  { label: 'Bills & Utilities', icon: '💡', color: '#DDA0DD' },
  { label: 'Education', icon: '📚', color: '#98D8C8' },
  { label: 'Travel', icon: '✈️', color: '#F7DC6F' },
  { label: 'Personal Care', icon: '💄', color: '#F0B27A' },
  { label: 'Housing', icon: '🏠', color: '#85C1E9' },
  { label: 'Insurance', icon: '🛡️', color: '#82E0AA' },
  { label: 'Investments', icon: '📈', color: '#00D4AA' },
  { label: 'Gifts & Donations', icon: '🎁', color: '#BB8FCE' },
  { label: 'Business', icon: '💼', color: '#7D9EC0' },
  { label: 'Other', icon: '📦', color: '#AEB6BF' },
];

export const INCOME_CATEGORIES = [
  { label: 'Salary', icon: '💰', color: '#00D4AA' },
  { label: 'Freelance', icon: '💻', color: '#7C3AED' },
  { label: 'Business', icon: '🏢', color: '#F59E0B' },
  { label: 'Investment Returns', icon: '📈', color: '#10B981' },
  { label: 'Rental Income', icon: '🏘️', color: '#3B82F6' },
  { label: 'Bonus', icon: '🎉', color: '#EC4899' },
  { label: 'Gift', icon: '🎁', color: '#8B5CF6' },
  { label: 'Tax Refund', icon: '🔄', color: '#6366F1' },
  { label: 'Other', icon: '➕', color: '#AEB6BF' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'debit_card', label: 'Debit Card', icon: '🏧' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: '📱' },
  { value: 'other', label: 'Other', icon: '🔧' },
];

export const CHART_COLORS = [
  '#00D4AA', '#7C3AED', '#FF6B6B', '#45B7D1',
  '#FFEAA7', '#96CEB4', '#DDA0DD', '#F0B27A',
  '#85C1E9', '#82E0AA', '#BB8FCE', '#F7DC6F',
];

export const getCategoryInfo = (label, type = 'expense') => {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.label === label) || { label, icon: '📦', color: '#AEB6BF' };
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatRelativeDate = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
