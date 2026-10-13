const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets with spending progress
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const budgets = await Budget.find({
      user: userId,
      year,
      $or: [{ period: 'yearly' }, { period: 'monthly', month }],
    }).lean();

    // Get spending per category for the period
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spending = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);

    const spendingMap = {};
    spending.forEach(({ _id, spent }) => { spendingMap[_id] = spent; });

    const enrichedBudgets = budgets.map((budget) => {
      const spent = spendingMap[budget.category] || 0;
      const remaining = budget.limit - spent;
      const usagePercentage = parseFloat(((spent / budget.limit) * 100).toFixed(2));
      const isOverBudget = spent > budget.limit;
      const isNearLimit = usagePercentage >= budget.alertThreshold;

      return {
        ...budget,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        usagePercentage,
        isOverBudget,
        isNearLimit,
      };
    });

    return sendSuccess(res, { year, month, budgets: enrichedBudgets }, 'Budgets retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/budgets
 * @desc    Create a budget
 * @access  Private
 */
const createBudget = async (req, res, next) => {
  try {
    const budget = await Budget.create({ ...req.body, user: req.user._id });
    return sendSuccess(res, { budget }, 'Budget created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update a budget
 * @access  Private
 */
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) return sendError(res, 'Budget not found', 404);
    return sendSuccess(res, { budget }, 'Budget updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return sendError(res, 'Budget not found', 404);
    return sendSuccess(res, {}, 'Budget deleted');
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
  getBudgets: withFallback(getBudgets, memoryStorage.getBudgets),
  createBudget: withFallback(createBudget, memoryStorage.createBudget),
  updateBudget: withFallback(updateBudget, memoryStorage.updateBudget),
  deleteBudget: withFallback(deleteBudget, memoryStorage.deleteBudget),
};
