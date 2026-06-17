const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const {
  getDestinos, getDestinoById, createDestino,
  updateDestino, deleteDestino, exportarDestinos,
} = require('../controllers/destinos.controller');

const router = Router();

router.get('/exportar', authenticate, exportarDestinos);
router.get('/', getDestinos);
router.get('/:id', getDestinoById);
router.post('/', authenticate, createDestino);
router.put('/:id', authenticate, updateDestino);
router.delete('/:id', authenticate, deleteDestino);

module.exports = router;
