const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0.01, 'Budget limit must be greater than 0'],
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert at 80% usage
      min: 1,
      max: 100,
    },
    color: {
      type: String,
      default: '#7C3AED',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate budget for same user/category/period/month/year
budgetSchema.index({ user: 1, category: 1, period: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
