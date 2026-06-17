/**
 * Controlador de Usuarios
 * Gestión de usuarios del sistema (solo admin)
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound, error } = require('../utils/response.util');

const getUsuarios = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { activo, rolId } = req.query;

    const where = {};
    if (activo !== undefined) where.USUAR_AC = activo === 'true';
    if (rolId) where.USUAR_RO = parseInt(rolId);

    const [total, usuarios] = await Promise.all([
      prisma.tM_USUAR.count({ where }),
      prisma.tM_USUAR.findMany({
        where,
        skip,
        take,
        select: {
          USUA_COD: true,
          USUAR_NM: true,
          USUAR_EM: true,
          USUAR_AC: true,
          USUAR_FR: true,
          TM_ROLES: { select: { ROLE_NOM: true } },
          TM_PAISE: { select: { PAIS_NOM: true } },
        },
        orderBy: { USUAR_FR: 'desc' },
      }),
    ]);

    return success(res, { usuarios, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
};

const getUsuarioById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const usuario = await prisma.tM_USUAR.findUnique({
      where: { USUA_COD: id },
      select: {
        USUA_COD: true,
        USUAR_NM: true,
        USUAR_EM: true,
        USUAR_AC: true,
        USUAR_FR: true,
        TM_ROLES: true,
        TM_PAISE: true,
        TR_USU_REGI: { include: { TM_REGION: true } },
      },
    });

    if (!usuario) return notFound(res, 'Usuario no encontrado');
    return success(res, usuario);
  } catch (err) {
    next(err);
  }
};

const updateUsuario = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, email, rolId, activo, password } = req.body;

    const data = {};
    if (nombre) data.USUAR_NM = nombre;
    if (email) data.USUAR_EM = email;
    if (rolId) data.USUAR_RO = parseInt(rolId);
    if (activo !== undefined) data.USUAR_AC = activo;
    if (password) data.USUAR_PA = await bcrypt.hash(password, 12);

    const usuario = await prisma.tM_USUAR.update({
      where: { USUA_COD: id },
      data,
      select: { USUA_COD: true, USUAR_NM: true, USUAR_EM: true, USUAR_AC: true, USUAR_RO: true },
    });

    return success(res, usuario, 'Usuario actualizado exitosamente');
  } catch (err) {
    next(err);
  }
};

const deleteUsuario = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // No eliminar al usuario autenticado
    if (id === req.user.sub) {
      return error(res, 'No puedes eliminar tu propio usuario', 400);
    }

    await prisma.tM_USUAR.delete({ where: { USUA_COD: id } });
    return success(res, null, 'Usuario eliminado exitosamente');
  } catch (err) {
    next(err);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await prisma.tM_ROLES.findMany({ orderBy: { ROLE_NOM: 'asc' } });
    return success(res, roles);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsuarios, getUsuarioById, updateUsuario, deleteUsuario, getRoles };
