const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/analytics/summary
 * @desc    Get overall financial summary (balance, income, expenses)
 * @access  Private
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = { user: userId };
    if (Object.keys(dateFilter).length) matchStage.date = dateFilter;

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
          max: { $max: '$amount' },
          min: { $min: '$amount' },
        },
      },
    ]);

    const result = {
      income: { total: 0, count: 0, avg: 0, max: 0, min: 0 },
      expense: { total: 0, count: 0, avg: 0, max: 0, min: 0 },
    };

    summary.forEach(({ _id, total, count, avg, max, min }) => {
      result[_id] = { total: parseFloat(total.toFixed(2)), count, avg: parseFloat(avg.toFixed(2)), max, min };
    });

    result.balance = parseFloat((result.income.total - result.expense.total).toFixed(2));
    result.savingsRate = result.income.total > 0
      ? parseFloat(((result.income.total - result.expense.total) / result.income.total * 100).toFixed(2))
      : 0;

    return sendSuccess(res, result, 'Summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/monthly
 * @desc    Get monthly income/expense breakdown for a given year
 * @access  Private
 */
const getMonthlySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const monthly = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          data: {
            $push: {
              type: '$_id.type',
              total: '$total',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build full 12-month array
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
      income: 0,
      expense: 0,
      balance: 0,
    }));

    monthly.forEach(({ _id: month, data }) => {
      const idx = month - 1;
      data.forEach(({ type, total }) => {
        months[idx][type] = parseFloat(total.toFixed(2));
      });
      months[idx].balance = parseFloat((months[idx].income - months[idx].expense).toFixed(2));
    });

    return sendSuccess(res, { year, months }, 'Monthly summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/yearly
 * @desc    Get yearly summaries across all years
 * @access  Private
 */
const getYearlySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const yearly = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year',
          data: {
            $push: {
              type: '$_id.type',
              total: '$total',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = yearly.map(({ _id: year, data }) => {
      const entry = { year, income: 0, expense: 0, balance: 0 };
      data.forEach(({ type, total }) => {
        entry[type] = parseFloat(total.toFixed(2));
      });
      entry.balance = parseFloat((entry.income - entry.expense).toFixed(2));
      return entry;
    });

    return sendSuccess(res, { yearly: result }, 'Yearly summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/categories
 * @desc    Get spending breakdown by category
 * @access  Private
 */
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type = 'expense', startDate, endDate, year, month } = req.query;

    const matchStage = { user: userId, type };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    } else if (year) {
      const y = parseInt(year);
      const m = month ? parseInt(month) : null;
      if (m) {
        matchStage.date = {
          $gte: new Date(y, m - 1, 1),
          $lte: new Date(y, m, 0, 23, 59, 59),
        };
      } else {
        matchStage.date = {
          $gte: new Date(`${y}-01-01`),
          $lte: new Date(`${y}-12-31T23:59:59.999Z`),
        };
      }
    }

    const categories = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          avg: { $round: ['$avg', 2] },
        },
      },
    ]);

    const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);
    const enriched = categories.map((c) => ({
      ...c,
      percentage: grandTotal > 0 ? parseFloat(((c.total / grandTotal) * 100).toFixed(2)) : 0,
    }));

    return sendSuccess(res, { type, categories: enriched, grandTotal: parseFloat(grandTotal.toFixed(2)) }, 'Category breakdown retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/trends
 * @desc    Get daily/weekly spending trends for a month
 * @access  Private
 */
const getSpendingTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const type = req.query.type || 'expense';

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          day: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    return sendSuccess(res, { year, month, type, trends }, 'Spending trends retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/top-transactions
 * @desc    Get top N transactions by amount
 * @access  Private
 */
const getTopTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    const type = req.query.type || 'expense';
    const { startDate, endDate } = req.query;

    const matchStage = { user: userId, type };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(matchStage)
      .sort({ amount: -1 })
      .limit(limit)
      .lean();

    return sendSuccess(res, { type, transactions }, 'Top transactions retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/payment-methods
 * @desc    Breakdown by payment method
 * @access  Private
 */
const getPaymentMethodBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const matchStage = { user: userId };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const breakdown = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          method: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    return sendSuccess(res, { breakdown }, 'Payment method breakdown retrieved');
  } catch (error) {
    next(error);
  }
};

const memoryStorage = require('../services/memoryStorage');
const mongoose = require('mongoose');

const withFallback = (fn, fallbackFn) => (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return fallbackFn(req, res, next);
  }
  return fn(req, res, next);
};

module.exports = {
  getSummary: withFallback(getSummary, memoryStorage.getSummary),
  getMonthlySummary: withFallback(getMonthlySummary, memoryStorage.getMonthlySummary),
  getYearlySummary: withFallback(getYearlySummary, memoryStorage.getYearlySummary),
  getCategoryBreakdown: withFallback(getCategoryBreakdown, memoryStorage.getCategoryBreakdown),
  getSpendingTrends: withFallback(getSpendingTrends, memoryStorage.getSpendingTrends),
  getTopTransactions: withFallback(getTopTransactions, memoryStorage.getTopTransactions),
  getPaymentMethodBreakdown: withFallback(getPaymentMethodBreakdown, memoryStorage.getPaymentMethodBreakdown),
};
