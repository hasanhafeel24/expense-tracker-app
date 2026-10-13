require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const logger = require('./logger');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding...');

    // Demo user
    const email = 'demo@fintrack.app';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Alex Johnson',
        email,
        password: 'Password123!',
        currency: 'USD',
        monthlyBudget: 3500,
      });
      logger.info('Demo user created: demo@fintrack.app');
    }

    // Check if transactions already exist
    const txCount = await Transaction.countDocuments({ user: user._id });
    if (txCount === 0) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const demoTransactions = [
        // Incomes
        { user: user._id, type: 'income', amount: 5200, category: 'Salary', description: 'Tech Corp Monthly Salary', date: new Date(year, month, 1), paymentMethod: 'bank_transfer' },
        { user: user._id, type: 'income', amount: 850, category: 'Freelance', description: 'UI/UX Design Contract', date: new Date(year, month, 12), paymentMethod: 'digital_wallet' },
        { user: user._id, type: 'income', amount: 320, category: 'Investment Returns', description: 'Dividend Payout', date: new Date(year, month, 18), paymentMethod: 'bank_transfer' },

        // Expenses
        { user: user._id, type: 'expense', amount: 1450, category: 'Housing', description: 'Apartment Monthly Rent', date: new Date(year, month, 2), paymentMethod: 'bank_transfer' },
        { user: user._id, type: 'expense', amount: 340, category: 'Food & Dining', description: 'Whole Foods Grocery Run', date: new Date(year, month, 4), paymentMethod: 'credit_card' },
        { user: user._id, type: 'expense', amount: 65, category: 'Food & Dining', description: 'Sushi Dinner with friends', date: new Date(year, month, 8), paymentMethod: 'credit_card' },
        { user: user._id, type: 'expense', amount: 120, category: 'Transportation', description: 'Metro Pass & Fuel', date: new Date(year, month, 6), paymentMethod: 'debit_card' },
        { user: user._id, type: 'expense', amount: 85, category: 'Bills & Utilities', description: 'High-speed Internet bill', date: new Date(year, month, 10), paymentMethod: 'credit_card' },
        { user: user._id, type: 'expense', amount: 45, category: 'Bills & Utilities', description: 'Electricity & Water', date: new Date(year, month, 11), paymentMethod: 'bank_transfer' },
        { user: user._id, type: 'expense', amount: 180, category: 'Shopping', description: 'Running Shoes & Apparel', date: new Date(year, month, 14), paymentMethod: 'credit_card' },
        { user: user._id, type: 'expense', amount: 40, category: 'Entertainment', description: 'Cinema & Streaming subs', date: new Date(year, month, 15), paymentMethod: 'credit_card' },
        { user: user._id, type: 'expense', amount: 75, category: 'Health & Fitness', description: 'Gym Membership', date: new Date(year, month, 5), paymentMethod: 'credit_card' },
      ];

      await Transaction.insertMany(demoTransactions);
      logger.info(`Inserted ${demoTransactions.length} seed transactions`);
    }

    // Seed budgets
    const budgetCount = await Budget.countDocuments({ user: user._id });
    if (budgetCount === 0) {
      const now = new Date();
      const demoBudgets = [
        { user: user._id, category: 'Food & Dining', limit: 600, alertThreshold: 80, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), color: '#FF6B6B' },
        { user: user._id, category: 'Housing', limit: 1500, alertThreshold: 90, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), color: '#85C1E9' },
        { user: user._id, category: 'Transportation', limit: 250, alertThreshold: 80, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), color: '#4ECDC4' },
        { user: user._id, category: 'Shopping', limit: 300, alertThreshold: 75, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), color: '#45B7D1' },
      ];

      await Budget.insertMany(demoBudgets);
      logger.info(`Inserted ${demoBudgets.length} seed budgets`);
    }

    logger.info('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
