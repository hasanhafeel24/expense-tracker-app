const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
} = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  transactionValidator,
  transactionQueryValidator,
  idParamValidator,
} = require('../validators/transactionValidator');

// All routes require authentication
router.use(authenticate);

router.get('/', transactionQueryValidator, validate, getTransactions);
router.post('/', transactionValidator, validate, createTransaction);
router.delete('/bulk', bulkDeleteTransactions);
router.get('/:id', idParamValidator, validate, getTransactionById);
router.put('/:id', idParamValidator, transactionValidator, validate, updateTransaction);
router.patch('/:id', idParamValidator, validate, updateTransaction);
router.delete('/:id', idParamValidator, validate, deleteTransaction);

module.exports = router;
