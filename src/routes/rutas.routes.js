const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { getRutas, getRutaById, createRuta, updateRuta, deleteRuta, exportarRutas } = require('../controllers/rutas.controller');

const router = Router();

router.get('/exportar', authenticate, requireRole(55, 59), exportarRutas);
router.get('/', getRutas);
router.get('/:id', getRutaById);
router.post('/', authenticate, requireRole(55, 59), createRuta);
router.put('/:id', authenticate, requireRole(55, 59), updateRuta);
router.delete('/:id', authenticate, requireRole(55, 59), deleteRuta);

module.exports = router;
