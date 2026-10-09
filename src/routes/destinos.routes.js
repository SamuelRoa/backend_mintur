const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole, ROLE_ADMIN, ROLE_GESTOR } = require('../middleware/role.middleware');
const { validate } = require('../middleware/zod.middleware');
const { destinoSchema } = require('../schemas/entidades.schema');
const {
  getDestinos, getDestinoById, createDestino,
  updateDestino, deleteDestino, exportarDestinos,
} = require('../controllers/destinos.controller');

const router = Router();

router.get('/exportar', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), exportarDestinos);
router.get('/', getDestinos);
router.get('/:id', getDestinoById);
router.post('/', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), validate(destinoSchema), createDestino);
router.put('/:id', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), validate(destinoSchema.partial()), updateDestino);
router.delete('/:id', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), deleteDestino);

module.exports = router;
