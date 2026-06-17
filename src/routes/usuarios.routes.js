const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getUsuarios, getUsuarioById, updateUsuario, deleteUsuario, getRoles } = require('../controllers/usuarios.controller');

const router = Router();

// Todos los endpoints de usuarios requieren autenticación
router.use(authenticate);

router.get('/', getUsuarios);
router.get('/roles', getRoles);
router.get('/:id', getUsuarioById);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

module.exports = router;
