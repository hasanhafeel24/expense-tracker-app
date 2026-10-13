const { body, query, param } = require('express-validator');

const transactionValidator = [
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 100 }).withMessage('Category cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other',
           'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other',
           'UPI', 'upi'])
    .withMessage('Invalid payment method'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('isRecurring')
    .optional()
    .isBoolean().withMessage('isRecurring must be a boolean'),
  body('recurringFrequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly', null])
    .withMessage('Invalid recurring frequency'),
];

const transactionQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['income', 'expense']).withMessage('Invalid type filter'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  query('sortBy').optional().isIn(['date', 'amount', 'category', 'createdAt']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];

const idParamValidator = [
  param('id').trim().notEmpty().withMessage('Transaction ID is required'),
];

module.exports = { transactionValidator, transactionQueryValidator, idParamValidator };
