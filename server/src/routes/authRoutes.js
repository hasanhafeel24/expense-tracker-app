const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authenticate);
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/me', updateProfile);

module.exports = router;
