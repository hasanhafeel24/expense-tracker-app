const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. Please log in.', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid token. Please log in again.', 401);
    }

    // Attach user to request
    let user;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password -refreshToken');
    } else {
      const memoryStorage = require('../services/memoryStorage');
      user = memoryStorage.getUserById(decoded.id);
    }

    if (!user || !user.isActive) {
      return sendError(res, 'User not found or deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return sendError(res, 'Authentication failed.', 500);
  }
};

module.exports = { authenticate };
