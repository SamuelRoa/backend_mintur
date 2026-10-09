const { z } = require('zod');

/**
 * Middleware genérico de validación con Zod.
 * Valida req.body y devuelve 422 {success:false, errors:[{campo,mensaje}]}
 * con el mismo formato que el anterior express-validator.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (result.success) {
    req[source] = result.data;
    return next();
  }
  const errors = result.error.issues.map((i) => ({
    campo: i.path.join('.') || source,
    mensaje: i.message,
  }));
  return res.status(422).json({ success: false, message: 'Error de validación', errors });
};

module.exports = { validate };
