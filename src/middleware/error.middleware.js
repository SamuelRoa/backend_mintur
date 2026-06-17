/**
 * Manejador centralizado de errores
 * Captura cualquier error lanzado con next(error) en Express
 */

const env = require('../config/env');
const { serverError } = require('../utils/response.util');

/**
 * Middleware de error de Express (4 parámetros obligatorios)
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log del error
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (env.isDev) {
    console.error(err.stack);
  }

  // Errores conocidos de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con ese valor único',
      campo: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
    });
  }

  // Error genérico
  const message = env.isProd ? 'Error interno del servidor' : err.message;
  return serverError(res, message);
};

module.exports = { errorHandler };
