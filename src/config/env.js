/**
 * Configuración y validación de variables de entorno
 * Centraliza el acceso a process.env con valores por defecto
 */

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable de entorno requerida no definida: ${key}`);
  }
  return value;
};

const optional = (key, defaultValue = '') => {
  return process.env[key] ?? defaultValue;
};

const env = {
  // Servidor
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '8000'), 10),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',

  // Base de datos
  DATABASE_URL: required('DATABASE_URL'),

  // JWT
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '30d'),

  // Correo
  MAIL_HOST: optional('MAIL_HOST', 'smtp.gmail.com'),
  MAIL_PORT: parseInt(optional('MAIL_PORT', '587'), 10),
  MAIL_SECURE: optional('MAIL_SECURE', 'false') === 'true',
  MAIL_USER: required('MAIL_USER'),
  MAIL_PASS: required('MAIL_PASS'),
  MAIL_FROM: optional('MAIL_FROM', 'COTATUR <no-reply@cotatur.gob.ve>'),

  // Reset de contraseña
  RESET_TOKEN_SECRET: optional('RESET_TOKEN_SECRET', 'cotatur_reset_secret_key'),
  RESET_TOKEN_EXPIRES_IN: optional('RESET_TOKEN_EXPIRES_IN', '1h'),

  // Frontend URLs
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:8001'),
  WEBSITE_URL: optional('WEBSITE_URL', 'http://localhost:8002'),

  // CORS
  CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:8001').split(',').map((o) => o.trim()),
};

module.exports = env;
