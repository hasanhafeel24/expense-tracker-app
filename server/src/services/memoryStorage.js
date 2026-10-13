const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory state
let db = {
  users: [],
  transactions: [],
  budgets: [],
};

// Load or seed db
const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else {
      seedDemoData();
      saveDB();
    }
  } catch (err) {
    logger.error(`Error loading JSON DB: ${err.message}`);
    seedDemoData();
  }
};

const saveDB = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    logger.error(`Error saving JSON DB: ${err.message}`);
  }
};

const seedDemoData = () => {
  const demoUserId = 'demo-user-id-001';
  const hashedPassword = bcrypt.hashSync('Password123!', 10);

  const demoUser = {
    _id: demoUserId,
    name: 'Demo User',
    email: 'demo@fintrack.app',
    password: hashedPassword,
    currency: 'USD',
    monthlyBudget: 3500,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const demoTransactions = [
    {
      _id: 'tx-001',
      user: demoUserId,
      title: 'Salary Deposit',
      amount: 4500,
      type: 'income',
      category: 'Salary',
      paymentMethod: 'Bank Transfer',
      date: new Date(year, month, 1).toISOString(),
      notes: 'Monthly corporate salary',
      tags: ['job', 'income'],
      createdAt: new Date(year, month, 1).toISOString(),
    },
    {
      _id: 'tx-002',
      user: demoUserId,
      title: 'Apartment Rent',
      amount: 1200,
      type: 'expense',
      category: 'Housing',
      paymentMethod: 'Bank Transfer',
      date: new Date(year, month, 2).toISOString(),
      notes: 'Monthly apartment lease',
      tags: ['rent', 'home'],
      createdAt: new Date(year, month, 2).toISOString(),
    },
    {
      _id: 'tx-003',
      user: demoUserId,
      title: 'Supermarket Groceries',
      amount: 185.50,
      type: 'expense',
      category: 'Food & Dining',
      paymentMethod: 'Credit Card',
      date: new Date(year, month, 4).toISOString(),
      notes: 'Weekly fresh food and staples',
      tags: ['groceries'],
      createdAt: new Date(year, month, 4).toISOString(),
    },
    {
      _id: 'tx-004',
      user: demoUserId,
      title: 'Freelance Web Design',
      amount: 850,
      type: 'income',
      category: 'Freelance',
      paymentMethod: 'UPI',
      date: new Date(year, month, 6).toISOString(),
      notes: 'Client landing page development',
      tags: ['freelance', 'client'],
      createdAt: new Date(year, month, 6).toISOString(),
    },
    {
      _id: 'tx-005',
      user: demoUserId,
      title: 'Electric & Gas Bill',
      amount: 115,
      type: 'expense',
      category: 'Utilities',
      paymentMethod: 'Debit Card',
      date: new Date(year, month, 7).toISOString(),
      notes: 'Utility services',
      tags: ['bills'],
      createdAt: new Date(year, month, 7).toISOString(),
    },
    {
      _id: 'tx-006',
      user: demoUserId,
      title: 'Subway & Gas',
      amount: 65.20,
      type: 'expense',
      category: 'Transportation',
      paymentMethod: 'Credit Card',
      date: new Date(year, month, 9).toISOString(),
      notes: 'Transit cards and commute',
      tags: ['travel'],
      createdAt: new Date(year, month, 9).toISOString(),
    },
    {
      _id: 'tx-007',
      user: demoUserId,
      title: 'Stock Dividend',
      amount: 220,
      type: 'income',
      category: 'Investments',
      paymentMethod: 'Bank Transfer',
      date: new Date(year, month, 10).toISOString(),
      notes: 'Quarterly index fund dividend',
      tags: ['dividend', 'investment'],
      createdAt: new Date(year, month, 10).toISOString(),
    },
    {
      _id: 'tx-008',
      user: demoUserId,
      title: 'Weekend Dinner & Drinks',
      amount: 95.40,
      type: 'expense',
      category: 'Entertainment',
      paymentMethod: 'Credit Card',
      date: new Date(year, month, 11).toISOString(),
      notes: 'Dinner with friends',
      tags: ['dinner', 'friends'],
      createdAt: new Date(year, month, 11).toISOString(),
    },
    {
      _id: 'tx-009',
      user: demoUserId,
      title: 'Health Insurance Premium',
      amount: 180,
      type: 'expense',
      category: 'Healthcare',
      paymentMethod: 'Bank Transfer',
      date: new Date(year, month, 12).toISOString(),
      notes: 'Monthly coverage',
      tags: ['health'],
      createdAt: new Date(year, month, 12).toISOString(),
    },
  ];

  const demoBudgets = [
    {
      _id: 'bg-001',
      user: demoUserId,
      category: 'Food & Dining',
      amount: 500,
      period: 'monthly',
      month: month + 1,
      year: year,
      alertThreshold: 80,
      color: '#00D4AA',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'bg-002',
      user: demoUserId,
      category: 'Housing',
      amount: 1400,
      period: 'monthly',
      month: month + 1,
      year: year,
      alertThreshold: 90,
      color: '#7C3AED',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'bg-003',
      user: demoUserId,
      category: 'Entertainment',
      amount: 300,
      period: 'monthly',
      month: month + 1,
      year: year,
      alertThreshold: 80,
      color: '#FF6B6B',
      createdAt: new Date().toISOString(),
    },
  ];

  db.users = [demoUser];
  db.transactions = demoTransactions;
  db.budgets = demoBudgets;
};

loadDB();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, refreshToken, ...safeUser } = user;
  return safeUser;
};

// ─── AUTH CONTROLLER HANDLERS ────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, currency = 'USD' } = req.body;
  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return sendError(res, 'Email already in use', 409);
  }

  const userId = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  const { accessToken, refreshToken } = generateTokens(userId);

  const newUser = {
    _id: userId,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    currency,
    monthlyBudget: 0,
    isActive: true,
    refreshToken,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB();

  logger.info(`[Demo DB] User registered: ${email}`);
  return sendSuccess(res, { user: sanitizeUser(newUser), accessToken, refreshToken }, 'Registration successful', 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  saveDB();

  return sendSuccess(res, { user: sanitizeUser(user), accessToken, refreshToken }, 'Login successful');
};

const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return sendError(res, 'Refresh token is required', 400);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret');
    const user = db.users.find((u) => u._id === decoded.id);
    if (!user || user.refreshToken !== token) {
      return sendError(res, 'Invalid refresh token', 401);
    }
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    saveDB();
    return sendSuccess(res, tokens, 'Tokens refreshed successfully');
  } catch {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

const logout = async (req, res) => {
  if (req.user) {
    const user = db.users.find((u) => u._id === req.user._id);
    if (user) {
      user.refreshToken = null;
      saveDB();
    }
  }
  return sendSuccess(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  return sendSuccess(res, { user: sanitizeUser(req.user) }, 'User profile retrieved');
};

const updateProfile = async (req, res) => {
  const { name, currency, monthlyBudget, avatar } = req.body;
  const user = db.users.find((u) => u._id === req.user._id);
  if (!user) return sendError(res, 'User not found', 404);

  if (name) user.name = name;
  if (currency) user.currency = currency;
  if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
  if (avatar !== undefined) user.avatar = avatar;
  user.updatedAt = new Date().toISOString();

  saveDB();
  return sendSuccess(res, { user: sanitizeUser(user) }, 'Profile updated successfully');
};

const getUserById = (id) => {
  const user = db.users.find((u) => u._id === id);
  return sanitizeUser(user);
};

// ─── TRANSACTIONS HANDLERS ───────────────────────────────────────────────────
const getTransactions = async (req, res) => {
  const userId = req.user._id;
  const {
    type,
    category,
    startDate,
    endDate,
    search,
    minAmount,
    maxAmount,
    paymentMethod,
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  let list = db.transactions.filter((t) => t.user === userId);

  if (type) list = list.filter((t) => t.type === type);
  if (category) list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  if (paymentMethod) list = list.filter((t) => t.paymentMethod === paymentMethod);
  if (startDate) list = list.filter((t) => new Date(t.date) >= new Date(startDate));
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    list = list.filter((t) => new Date(t.date) <= end);
  }
  if (minAmount !== undefined) list = list.filter((t) => t.amount >= Number(minAmount));
  if (maxAmount !== undefined) list = list.filter((t) => t.amount <= Number(maxAmount));
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        (t.notes && t.notes.toLowerCase().includes(s)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(s)))
    );
  }

  // Sorting
  list.sort((a, b) => {
    let valA = a[sortBy] ?? a.date;
    let valB = b[sortBy] ?? b.date;
    if (sortBy === 'date' || sortBy === 'createdAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  const total = list.length;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  return sendPaginated(res, paginated, total, pageNum, limitNum, 'Transactions retrieved');
};

const getTransactionById = async (req, res) => {
  const transaction = db.transactions.find((t) => t._id === req.params.id && t.user === req.user._id);
  if (!transaction) return sendError(res, 'Transaction not found', 404);
  return sendSuccess(res, { transaction });
};

const createTransaction = async (req, res) => {
  const { title, amount, type, category, date, paymentMethod = 'Other', notes = '', tags = [] } = req.body;
  const newTx = {
    _id: crypto.randomUUID(),
    user: req.user._id,
    title,
    amount: parseFloat(amount),
    type,
    category,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    paymentMethod,
    notes,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.transactions.unshift(newTx);
  saveDB();

  return sendSuccess(res, { transaction: newTx }, 'Transaction created successfully', 201);
};

const updateTransaction = async (req, res) => {
  const idx = db.transactions.findIndex((t) => t._id === req.params.id && t.user === req.user._id);
  if (idx === -1) return sendError(res, 'Transaction not found', 404);

  const current = db.transactions[idx];
  const { title, amount, type, category, date, paymentMethod, notes, tags } = req.body;

  db.transactions[idx] = {
    ...current,
    title: title ?? current.title,
    amount: amount !== undefined ? parseFloat(amount) : current.amount,
    type: type ?? current.type,
    category: category ?? current.category,
    date: date ? new Date(date).toISOString() : current.date,
    paymentMethod: paymentMethod ?? current.paymentMethod,
    notes: notes ?? current.notes,
    tags: tags ?? current.tags,
    updatedAt: new Date().toISOString(),
  };

  saveDB();
  return sendSuccess(res, { transaction: db.transactions[idx] }, 'Transaction updated successfully');
};

const deleteTransaction = async (req, res) => {
  const idx = db.transactions.findIndex((t) => t._id === req.params.id && t.user === req.user._id);
  if (idx === -1) return sendError(res, 'Transaction not found', 404);

  db.transactions.splice(idx, 1);
  saveDB();
  return sendSuccess(res, null, 'Transaction deleted successfully');
};

const bulkDelete = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return sendError(res, 'Please provide an array of IDs', 400);

  const initialCount = db.transactions.length;
  db.transactions = db.transactions.filter((t) => !(t.user === req.user._id && ids.includes(t._id)));
  const deletedCount = initialCount - db.transactions.length;

  saveDB();
  return sendSuccess(res, { deletedCount }, `${deletedCount} transactions deleted`);
};

// ─── ANALYTICS HANDLERS ──────────────────────────────────────────────────────
const getSummary = async (req, res) => {
  const userId = req.user._id;
  const userTx = db.transactions.filter((t) => t.user === userId);

  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  let maxIncome = 0;
  let maxExpense = 0;

  userTx.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
      incomeCount++;
      if (t.amount > maxIncome) maxIncome = t.amount;
    }
    if (t.type === 'expense') {
      totalExpenses += t.amount;
      expenseCount++;
      if (t.amount > maxExpense) maxExpense = t.amount;
    }
  });

  const balance = parseFloat((totalIncome - totalExpenses).toFixed(2));
  const savingsRate = totalIncome > 0 ? parseFloat((((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(2)) : 0;

  const result = {
    income: {
      total: parseFloat(totalIncome.toFixed(2)),
      count: incomeCount,
      avg: incomeCount > 0 ? parseFloat((totalIncome / incomeCount).toFixed(2)) : 0,
      max: maxIncome,
      min: 0,
    },
    expense: {
      total: parseFloat(totalExpenses.toFixed(2)),
      count: expenseCount,
      avg: expenseCount > 0 ? parseFloat((totalExpenses / expenseCount).toFixed(2)) : 0,
      max: maxExpense,
      min: 0,
    },
    balance,
    savingsRate,
  };

  return sendSuccess(res, result, 'Summary retrieved');
};

const getMonthlySummary = async (req, res) => {
  const userId = req.user._id;
  const targetYear = parseInt(req.query.year, 10) || new Date().getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(targetYear, i, 1);
    return {
      month: i + 1,
      monthName: d.toLocaleString('default', { month: 'short' }),
      income: 0,
      expense: 0,
      savings: 0,
      savingsRate: 0,
    };
  });

  db.transactions.forEach((t) => {
    if (t.user !== userId) return;
    const tDate = new Date(t.date);
    if (tDate.getFullYear() === targetYear) {
      const mIdx = tDate.getMonth();
      if (t.type === 'income') {
        months[mIdx].income += t.amount;
      } else {
        months[mIdx].expense += t.amount;
      }
      months[mIdx].savings = months[mIdx].income - months[mIdx].expense;
      months[mIdx].savingsRate = months[mIdx].income > 0 ? Math.round((months[mIdx].savings / months[mIdx].income) * 100) : 0;
    }
  });

  return sendSuccess(res, { year: targetYear, months }, 'Monthly summary retrieved');
};

const getYearlySummary = async (req, res) => {
  const userId = req.user._id;
  const yearMap = {};

  db.transactions.forEach((t) => {
    if (t.user !== userId) return;
    const y = new Date(t.date).getFullYear();
    if (!yearMap[y]) yearMap[y] = { year: y, income: 0, expense: 0, balance: 0 };
    if (t.type === 'income') yearMap[y].income += t.amount;
    else yearMap[y].expense += t.amount;
    yearMap[y].balance = yearMap[y].income - yearMap[y].expense;
  });

  const yearly = Object.values(yearMap).sort((a, b) => a.year - b.year);
  return sendSuccess(res, { yearly }, 'Yearly summary retrieved');
};

const getCategoryBreakdown = async (req, res) => {
  const userId = req.user._id;
  const type = req.query.type || 'expense';
  const targetYear = req.query.year ? parseInt(req.query.year, 10) : null;
  const targetMonth = req.query.month ? parseInt(req.query.month, 10) : null;

  const catMap = {};
  let totalAmount = 0;

  db.transactions.forEach((t) => {
    if (t.user !== userId || t.type !== type) return;
    const tDate = new Date(t.date);
    if (targetYear && tDate.getFullYear() !== targetYear) return;
    if (targetMonth && tDate.getMonth() + 1 !== targetMonth) return;

    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    totalAmount += t.amount;
  });

  const categories = Object.entries(catMap)
    .map(([category, total]) => ({
      category,
      total: parseFloat(total.toFixed(2)),
      percentage: totalAmount > 0 ? parseFloat(((total / totalAmount) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return sendSuccess(res, { categories, totalAmount }, 'Category breakdown retrieved');
};

const getSpendingTrends = async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const daysMap = {};

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    daysMap[key] = { date: key, amount: 0, count: 0 };
  }

  db.transactions.forEach((t) => {
    if (t.user !== userId || t.type !== 'expense') return;
    const key = new Date(t.date).toISOString().split('T')[0];
    if (daysMap[key]) {
      daysMap[key].amount += t.amount;
      daysMap[key].count += 1;
    }
  });

  return sendSuccess(res, { trends: Object.values(daysMap) }, 'Spending trends retrieved');
};

const getTopTransactions = async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit, 10) || 5;
  const type = req.query.type || 'expense';

  const top = db.transactions
    .filter((t) => t.user === userId && t.type === type)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  return sendSuccess(res, { transactions: top }, 'Top transactions retrieved');
};

const getPaymentMethodBreakdown = async (req, res) => {
  const userId = req.user._id;
  const methodMap = {};
  let total = 0;

  db.transactions.forEach((t) => {
    if (t.user !== userId || t.type !== 'expense') return;
    const m = t.paymentMethod || 'Other';
    methodMap[m] = (methodMap[m] || 0) + t.amount;
    total += t.amount;
  });

  const breakdown = Object.entries(methodMap).map(([method, amount]) => ({
    method,
    total: parseFloat(amount.toFixed(2)),
    percentage: total > 0 ? parseFloat(((amount / total) * 100).toFixed(2)) : 0,
  }));

  return sendSuccess(res, { breakdown }, 'Payment method breakdown retrieved');
};

// ─── BUDGETS HANDLERS ────────────────────────────────────────────────────────
const getBudgets = async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const userBudgets = db.budgets.filter((b) => b.user === userId);

  const budgetsWithProgress = userBudgets.map((b) => {
    const budgetLimit = b.limit !== undefined ? b.limit : (b.amount || 0);
    let spent = 0;
    db.transactions.forEach((t) => {
      if (t.user !== userId || t.type !== 'expense' || t.category !== b.category) return;
      const tDate = new Date(t.date);
      if (tDate.getMonth() + 1 === currentMonth && tDate.getFullYear() === currentYear) {
        spent += t.amount;
      }
    });

    const percentage = budgetLimit > 0 ? parseFloat(((spent / budgetLimit) * 100).toFixed(2)) : 0;
    return {
      ...b,
      limit: budgetLimit,
      amount: budgetLimit,
      spent: parseFloat(spent.toFixed(2)),
      remaining: parseFloat(Math.max(0, budgetLimit - spent).toFixed(2)),
      percentage,
      usagePercentage: percentage,
      isOverBudget: spent > budgetLimit,
      isNearLimit: percentage >= (b.alertThreshold || 80),
    };
  });

  return sendSuccess(res, { year: currentYear, month: currentMonth, budgets: budgetsWithProgress });
};

const createBudget = async (req, res) => {
  const { category, amount, limit, period = 'monthly', month, year, alertThreshold = 80, color = '#00D4AA' } = req.body;
  const budgetLimit = parseFloat(limit !== undefined ? limit : (amount || 0));
  const now = new Date();
  const bMonth = month || now.getMonth() + 1;
  const bYear = year || now.getFullYear();

  const existing = db.budgets.find(
    (b) => b.user === req.user._id && b.category === category && b.period === period && b.month === bMonth && b.year === bYear
  );
  if (existing) return sendError(res, 'A budget already exists for this category and period', 409);

  const newBudget = {
    _id: crypto.randomUUID(),
    user: req.user._id,
    category,
    limit: budgetLimit,
    amount: budgetLimit,
    period,
    month: bMonth,
    year: bYear,
    alertThreshold: parseInt(alertThreshold, 10),
    color,
    createdAt: new Date().toISOString(),
  };

  db.budgets.push(newBudget);
  saveDB();

  return sendSuccess(res, { budget: newBudget }, 'Budget created successfully', 201);
};

const updateBudget = async (req, res) => {
  const idx = db.budgets.findIndex((b) => b._id === req.params.id && b.user === req.user._id);
  if (idx === -1) return sendError(res, 'Budget not found', 404);

  const current = db.budgets[idx];
  const { amount, limit, alertThreshold, color } = req.body;
  const budgetLimit = limit !== undefined ? parseFloat(limit) : (amount !== undefined ? parseFloat(amount) : current.limit || current.amount);

  db.budgets[idx] = {
    ...current,
    limit: budgetLimit,
    amount: budgetLimit,
    alertThreshold: alertThreshold !== undefined ? parseInt(alertThreshold, 10) : current.alertThreshold,
    color: color ?? current.color,
  };

  saveDB();
  return sendSuccess(res, { budget: db.budgets[idx] }, 'Budget updated successfully');
};

const deleteBudget = async (req, res) => {
  const idx = db.budgets.findIndex((b) => b._id === req.params.id && b.user === req.user._id);
  if (idx === -1) return sendError(res, 'Budget not found', 404);

  db.budgets.splice(idx, 1);
  saveDB();
  return sendSuccess(res, null, 'Budget deleted successfully');
};

module.exports = {
  // Auth
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  getUserById,
  // Transactions
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDelete,
  // Analytics
  getSummary,
  getMonthlySummary,
  getYearlySummary,
  getCategoryBreakdown,
  getSpendingTrends,
  getTopTransactions,
  getPaymentMethodBreakdown,
  // Budgets
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
