const Transaction = require('../models/Transaction');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const memoryStorage = require('../services/memoryStorage');
const mongoose = require('mongoose');

/**
 * Build filter object from query params
 */
const buildFilter = (userId, query) => {
  const filter = { user: userId };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = { $regex: query.category, $options: 'i' };
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = Number(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = Number(query.maxAmount);
  }
  if (query.tags) {
    filter.tags = { $in: query.tags.split(',') };
  }
  if (query.search) {
    filter.$or = [
      { description: { $regex: query.search, $options: 'i' } },
      { notes: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
};

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filtering, sorting, pagination
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.getTransactions(req, res);
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'date';
    const order = req.query.order === 'asc' ? 1 : -1;

    const filter = buildFilter(req.user._id, req.query);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return sendPaginated(
      res,
      transactions,
      { currentPage: page, totalPages, totalItems: total, limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
      'Transactions retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a single transaction by ID
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.getTransactionById(req, res);
  }
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) return sendError(res, 'Transaction not found', 404);
    return sendSuccess(res, { transaction }, 'Transaction retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.createTransaction(req, res);
  }
  try {
    const { type, amount, category, description, title, date, paymentMethod, tags, notes, isRecurring, recurringFrequency } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      description: description || title,
      date,
      paymentMethod,
      tags,
      notes,
      isRecurring,
      recurringFrequency,
    });

    logger.info(`Transaction created: ${transaction._id} by user ${req.user._id}`);
    return sendSuccess(res, { transaction }, 'Transaction created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a transaction
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.updateTransaction(req, res);
  }
  try {
    const allowedFields = ['type', 'amount', 'category', 'description', 'title', 'date', 'paymentMethod', 'tags', 'notes', 'isRecurring', 'recurringFrequency'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) return sendError(res, 'Transaction not found', 404);
    logger.info(`Transaction updated: ${transaction._id}`);
    return sendSuccess(res, { transaction }, 'Transaction updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.deleteTransaction(req, res);
  }
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) return sendError(res, 'Transaction not found', 404);
    logger.info(`Transaction deleted: ${req.params.id}`);
    return sendSuccess(res, {}, 'Transaction deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/transactions/bulk
 * @desc    Bulk delete transactions
 * @access  Private
 */
const bulkDeleteTransactions = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.bulkDelete(req, res);
  }
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Please provide an array of transaction IDs', 400);
    }

    const result = await Transaction.deleteMany({
      _id: { $in: ids },
      user: req.user._id,
    });

    return sendSuccess(res, { deletedCount: result.deletedCount }, `${result.deletedCount} transactions deleted`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
};
