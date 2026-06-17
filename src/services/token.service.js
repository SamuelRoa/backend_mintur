/**
 * Servicio de tokens JWT
 * Genera y verifica access tokens y refresh tokens
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Genera un access token JWT
 * @param {object} payload - Datos del usuario a incluir en el token
 * @returns {string} token firmado
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Genera un refresh token JWT
 * @param {object} payload
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verifica y decodifica un access token
 * @param {string} token
 * @returns {object} payload decodificado
 * @throws {Error} si el token es inválido o expirado
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Verifica y decodifica un refresh token
 * @param {string} token
 * @returns {object} payload decodificado
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

/**
 * Genera ambos tokens (access + refresh) para un usuario
 * @param {object} user - Usuario de la BD
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (user) => {
  const payload = {
    sub: user.USUA_COD,
    email: user.USUAR_EM,
    nombre: user.USUAR_NM,
    rol: user.USUAR_RO,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ sub: user.USUA_COD }),
  };
};

/**
 * Genera un token JWT para restablecimiento de contraseña
 * @param {object} user - Usuario de la BD
 * @returns {string} token firmado con expiración corta
 */
const generateResetToken = (user) => {
  return jwt.sign(
    { sub: user.USUA_COD, email: user.USUAR_EM },
    env.RESET_TOKEN_SECRET,
    { expiresIn: env.RESET_TOKEN_EXPIRES_IN }
  );
};

/**
 * Verifica un token de restablecimiento de contraseña
 * @param {string} token
 * @returns {object} payload decodificado
 */
const verifyResetToken = (token) => {
  return jwt.verify(token, env.RESET_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  generateResetToken,
  verifyResetToken,
};
