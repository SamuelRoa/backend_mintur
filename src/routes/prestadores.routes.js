const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const {
  getPrestadores, getPrestadorById, createPrestador,
  updatePrestador, updateEstadoPrestador, deletePrestador, exportarPrestadores,
} = require('../controllers/prestadores.controller');

const router = Router();

router.get('/exportar', authenticate, exportarPrestadores);
router.get('/', getPrestadores);
router.get('/:id', getPrestadorById);
router.post('/', createPrestador); // Público: prestadores se auto-registran
router.put('/:id/estado', authenticate, updateEstadoPrestador);
router.put('/:id', authenticate, updatePrestador);
router.delete('/:id', authenticate, deletePrestador);

module.exports = router;
