/**
 * Middleware de autorización por roles
 * Se usa después de authenticate para verificar permisos
 */

const { forbidden } = require('../utils/response.util');

/**
 * Permite el acceso solo a usuarios con los roles especificados
 * Los roles se definen por su ID numérico (ROLE_COD) o nombre (ROLE_NOM)
 *
 * @param {...number|string} roles - IDs o nombres de roles permitidos
 * @returns {Function} middleware de Express
 *
 * @example
 * // Usando IDs de rol
 * router.get('/admin', authenticate, requireRole(1), handler)
 *
 * @example
 * // Usando nombres de rol
 * router.get('/admin', authenticate, requireRoleName('Administrador', 'SuperAdmin'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'No se encontró información de usuario en el token');
    }

    const userRol = req.user.rol;
    const hasPermission = roles.includes(userRol);

    if (!hasPermission) {
      return forbidden(res, 'No tienes permisos para acceder a este recurso');
    }

    next();
  };
};

module.exports = { requireRole };
