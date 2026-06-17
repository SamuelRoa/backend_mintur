/**
 * Rutas de Autenticación
 * POST /api/auth/login
 * POST /api/auth/register
 * POST /api/auth/refresh
 * GET  /api/auth/me
 */

const { Router } = require('express');
const { body } = require('express-validator');
const {
  login, register, refreshToken, getMe,
  forgotPassword, resetPassword,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');

const router = Router();

// Validaciones
const loginValidations = [
  body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  handleValidationErrors,
];

const registerValidations = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('rolId').optional().isInt({ min: 1 }).withMessage('Rol inválido'),
  handleValidationErrors,
];

const forgotPasswordValidations = [
  body('email').isEmail().withMessage('Correo electrónico inválido').normalizeEmail(),
  handleValidationErrors,
];

const resetPasswordValidations = [
  body('token').notEmpty().withMessage('Token requerido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  handleValidationErrors,
];

router.post('/login', loginValidations, login);
router.post('/register', registerValidations, register);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPasswordValidations, forgotPassword);
router.post('/reset-password', resetPasswordValidations, resetPassword);

module.exports = router;
