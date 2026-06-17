/**
 * Respuestas JSON estandarizadas para toda la API
 * Formato: { success, data?, message?, errors? }
 */

/**
 * Respuesta exitosa
 * @param {import('express').Response} res
 * @param {*} data - Datos a retornar
 * @param {string} message - Mensaje opcional
 * @param {number} statusCode - Código HTTP (default 200)
 */
const success = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Respuesta de creación exitosa
 */
const created = (res, data = null, message = 'Recurso creado exitosamente') => {
  return success(res, data, message, 201);
};

/**
 * Respuesta de error
 * @param {import('express').Response} res
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código HTTP (default 400)
 * @param {*} errors - Detalles adicionales de error
 */
const error = (res, message = 'Error en la operación', statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

/**
 * Respuesta 404 Not Found
 */
const notFound = (res, message = 'Recurso no encontrado') => {
  return error(res, message, 404);
};

/**
 * Respuesta 401 Unauthorized
 */
const unauthorized = (res, message = 'No autorizado') => {
  return error(res, message, 401);
};

/**
 * Respuesta 403 Forbidden
 */
const forbidden = (res, message = 'Acceso denegado') => {
  return error(res, message, 403);
};

/**
 * Respuesta 500 Internal Server Error
 */
const serverError = (res, message = 'Error interno del servidor') => {
  return error(res, message, 500);
};

module.exports = { success, created, error, notFound, unauthorized, forbidden, serverError };
