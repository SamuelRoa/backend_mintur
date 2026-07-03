const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getDestinos, getDestinoById, createDestino,
  updateDestino, deleteDestino, exportarDestinos,
} = require('../controllers/destinos.controller');

const router = Router();

router.get('/exportar', authenticate, requireRole(55, 59), exportarDestinos);
router.get('/', getDestinos);
router.get('/:id', getDestinoById);
router.post('/', authenticate, requireRole(55, 59), createDestino);
router.put('/:id', authenticate, requireRole(55, 59), updateDestino);
router.delete('/:id', authenticate, requireRole(55, 59), deleteDestino);

module.exports = router;
