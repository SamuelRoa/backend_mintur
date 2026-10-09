const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole, ROLE_ADMIN, ROLE_GESTOR } = require('../middleware/role.middleware');
const { validate } = require('../middleware/zod.middleware');
const { prestadorSchema, prestadorEstadoSchema } = require('../schemas/entidades.schema');
const {
  getPrestadores, getPrestadorById, createPrestador,
  updatePrestador, updateEstadoPrestador, deletePrestador, exportarPrestadores,
  getMiPerfil, updateMiPerfil,
} = require('../controllers/prestadores.controller');

const router = Router();

// Rutas específicas deben ir antes de /:id
router.get('/exportar', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), exportarPrestadores);
router.get('/mi-perfil', authenticate, getMiPerfil);
router.put('/mi-perfil', authenticate, updateMiPerfil);
router.get('/', getPrestadores);
router.get('/:id', getPrestadorById);
router.post('/', authenticate, validate(prestadorSchema), createPrestador);
router.put('/:id/estado', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), validate(prestadorEstadoSchema), updateEstadoPrestador);
router.put('/:id', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), validate(prestadorSchema.partial()), updatePrestador);
router.delete('/:id', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), deletePrestador);

module.exports = router;
