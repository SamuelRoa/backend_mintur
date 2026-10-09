const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole, ROLE_ADMIN, ROLE_GESTOR } = require('../middleware/role.middleware');
const { validate } = require('../middleware/zod.middleware');
const { rutaSchema } = require('../schemas/entidades.schema');
const { getRutas, getRutaById, createRuta, updateRuta, deleteRuta, exportarRutas } = require('../controllers/rutas.controller');

const router = Router();

router.get('/exportar', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), exportarRutas);
router.get('/', getRutas);
router.get('/:id', getRutaById);
router.post('/', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), validate(rutaSchema), createRuta);
router.put('/:id', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), validate(rutaSchema.partial()), updateRuta);
router.delete('/:id', authenticate, requireRole(ROLE_ADMIN, ROLE_GESTOR), deleteRuta);

module.exports = router;
