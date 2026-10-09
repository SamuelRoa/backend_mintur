const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole, ROLE_ADMIN } = require('../middleware/role.middleware');
const { validate } = require('../middleware/zod.middleware');
const { usuarioUpdateSchema } = require('../schemas/entidades.schema');
const { getUsuarios, getUsuarioById, updateUsuario, deleteUsuario, getRoles } = require('../controllers/usuarios.controller');

const router = Router();

// Solo Administrador puede gestionar usuarios
router.use(authenticate);
router.use(requireRole(ROLE_ADMIN));

router.get('/', getUsuarios);
router.get('/roles', getRoles);
router.get('/:id', getUsuarioById);
router.put('/:id', validate(usuarioUpdateSchema), updateUsuario);
router.delete('/:id', deleteUsuario);

module.exports = router;
