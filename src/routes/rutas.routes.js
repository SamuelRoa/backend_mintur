const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getRutas, getRutaById, createRuta, updateRuta, deleteRuta, exportarRutas } = require('../controllers/rutas.controller');

const router = Router();

router.get('/exportar', authenticate, exportarRutas);
router.get('/', getRutas);
router.get('/:id', getRutaById);
router.post('/', authenticate, createRuta);
router.put('/:id', authenticate, updateRuta);
router.delete('/:id', authenticate, deleteRuta);

module.exports = router;
