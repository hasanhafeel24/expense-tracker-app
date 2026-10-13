const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Bills & Utilities',
  'Education',
  'Travel',
  'Personal Care',
  'Housing',
  'Insurance',
  'Investments',
  'Gifts & Donations',
  'Business',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment Returns',
  'Rental Income',
  'Bonus',
  'Gift',
  'Tax Refund',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    tags: {
      type: [String],
      default: [],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other',
                 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other',
                 'UPI', 'upi'],
        message: 'Invalid payment method',
      },
      default: 'other',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient user-specific queries with date sorting
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });

// Virtual: month (for aggregation reference)
transactionSchema.virtual('month').get(function () {
  return this.date ? this.date.getMonth() + 1 : null;
});

transactionSchema.virtual('year').get(function () {
  return this.date ? this.date.getFullYear() : null;
});

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
