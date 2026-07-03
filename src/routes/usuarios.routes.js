const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { getUsuarios, getUsuarioById, updateUsuario, deleteUsuario, getRoles } = require('../controllers/usuarios.controller');

const router = Router();

// Solo Administrador puede gestionar usuarios
router.use(authenticate);
router.use(requireRole(55));

router.get('/', getUsuarios);
router.get('/roles', getRoles);
router.get('/:id', getUsuarioById);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

module.exports = router;
