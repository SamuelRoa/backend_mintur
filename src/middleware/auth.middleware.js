/**
 * Middleware de autenticación JWT
 * Verifica el token Bearer en el header Authorization
 */

const { verifyAccessToken } = require('../services/token.service');
const { unauthorized } = require('../utils/response.util');

/**
 * Middleware que protege rutas requiriendo un token JWT válido
 * Adjunta el payload decodificado a req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token de autenticación requerido');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'El token ha expirado');
    }
    return unauthorized(res, 'Token inválido');
  }
};

module.exports = { authenticate };
