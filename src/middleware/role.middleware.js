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
/**
 * Roles canónicos del sistema (por nombre — estable frente a autoincrement).
 * IDs legacy 55/59 se siguen aceptando por compatibilidad con tokens viejos.
 */
const ROLE_ADMIN = 'Administrador';
const ROLE_GESTOR = 'Gestor Turístico';
const LEGACY_IDS = { 55: ROLE_ADMIN, 59: ROLE_GESTOR };

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'No se encontró información de usuario en el token');
    }

    const userRolId = req.user.rol;
    const userRolNombre = req.user.rolNombre ?? LEGACY_IDS[userRolId] ?? null;
    const hasPermission =
      roles.includes(userRolId) ||
      (userRolNombre && roles.includes(userRolNombre));

    if (!hasPermission) {
      return forbidden(res, 'No tienes permisos para acceder a este recurso');
    }

    next();
  };
};

module.exports = { requireRole, ROLE_ADMIN, ROLE_GESTOR };
