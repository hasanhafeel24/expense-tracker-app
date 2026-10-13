const express = require('express');
const router = express.Router();
const {
  getSummary,
  getMonthlySummary,
  getYearlySummary,
  getCategoryBreakdown,
  getSpendingTrends,
  getTopTransactions,
  getPaymentMethodBreakdown,
} = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/monthly', getMonthlySummary);
router.get('/yearly', getYearlySummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trends', getSpendingTrends);
router.get('/top-transactions', getTopTransactions);
router.get('/payment-methods', getPaymentMethodBreakdown);

module.exports = router;
