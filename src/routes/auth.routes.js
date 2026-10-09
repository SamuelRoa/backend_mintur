/**
 * Rutas de Autenticación
 * POST /api/auth/login
 * POST /api/auth/register
 * POST /api/auth/refresh
 * GET  /api/auth/me
 */

const { Router } = require('express');
const {
  login, register, refreshToken, getMe,
  forgotPassword, resetPassword,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/zod.middleware');
const {
  loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema,
} = require('../schemas/auth.schema');

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
