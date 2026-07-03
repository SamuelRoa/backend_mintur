const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  getPrestadores, getPrestadorById, createPrestador,
  updatePrestador, updateEstadoPrestador, deletePrestador, exportarPrestadores,
  getMiPerfil, updateMiPerfil,
} = require('../controllers/prestadores.controller');

const router = Router();

// Rutas específicas deben ir antes de /:id
router.get('/exportar', authenticate, requireRole(55, 59), exportarPrestadores);
router.get('/mi-perfil', authenticate, getMiPerfil);
router.put('/mi-perfil', authenticate, updateMiPerfil);
router.get('/', getPrestadores);
router.get('/:id', getPrestadorById);
router.post('/', authenticate, createPrestador);
router.put('/:id/estado', authenticate, requireRole(55, 59), updateEstadoPrestador);
router.put('/:id', authenticate, requireRole(55, 59), updatePrestador);
router.delete('/:id', authenticate, requireRole(55, 59), deletePrestador);

module.exports = router;
