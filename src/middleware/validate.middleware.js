/**
 * Middleware para manejar resultados de express-validator
 * Retorna 422 si hay errores de validación
 */

const { validationResult } = require('express-validator');
const { error } = require('../utils/response.util');

/**
 * Ejecutar después de un array de validaciones de express-validator.
 * Si hay errores, responde con 422 y el detalle de los errores.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return error(
      res,
      'Error de validación en los datos enviados',
      422,
      errors.array().map((e) => ({ campo: e.path, mensaje: e.msg }))
    );
  }

  next();
};

module.exports = { handleValidationErrors };
