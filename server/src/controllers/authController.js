const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const memoryStorage = require('../services/memoryStorage');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.register(req, res);
  }
  try {
    const { name, email, password, currency } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already in use', 409);
    }

    const user = await User.create({ name, email, password, currency });
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${email}`);
    return sendSuccess(
      res,
      { user, accessToken, refreshToken },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.login(req, res);
  }
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Please contact support.', 403);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);
    return sendSuccess(
      res,
      { user, accessToken, refreshToken },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.refreshToken(req, res);
  }
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, 'Refresh token required', 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return sendError(res, 'Invalid refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.logout(req, res);
  }
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    logger.info(`User logged out: ${req.user.email}`);
    return sendSuccess(res, {}, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.getMe(req, res);
  }
  return sendSuccess(res, { user: req.user }, 'User profile retrieved');
};

/**
 * @route   PATCH /api/auth/me
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return memoryStorage.updateProfile(req, res);
  }
  try {
    const allowedFields = ['name', 'currency', 'monthlyBudget'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, updateProfile };
