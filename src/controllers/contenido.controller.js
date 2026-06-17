/**
 * Controlador de Contenido CMS
 * Gestiona contenido institucional (TM_COINS) y turístico (TM_COTUR)
 */

const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound } = require('../utils/response.util');

// ============================
// CONTENIDO INSTITUCIONAL
// ============================

const getContenidoInstitucional = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { tipo } = req.query;

    const where = tipo ? { CINS_TCO: tipo } : {};
    const [total, contenidos] = await Promise.all([
      prisma.tM_COINS.count({ where }),
      prisma.tM_COINS.findMany({
        where,
        skip,
        take,
        include: { TM_USUAR: { select: { USUAR_NM: true } } },
        orderBy: { CINS_FPU: 'desc' },
      }),
    ]);

    return success(res, { contenidos, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

const createContenidoInstitucional = async (req, res, next) => {
  try {
    const { titulo, tipo, descripcion, url } = req.body;
    const contenido = await prisma.tM_COINS.create({
      data: {
        CINS_TIT: titulo,
        CINS_TCO: tipo,
        CINS_DES: descripcion,
        CINS_URL: url,
        CINS_FPU: new Date(),
        CINS_AUT: req.user.sub,
      },
    });
    return created(res, contenido, 'Contenido institucional creado exitosamente');
  } catch (err) { next(err); }
};

const updateContenidoInstitucional = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, tipo, descripcion, url } = req.body;
    const data = {};
    if (titulo) data.CINS_TIT = titulo;
    if (tipo) data.CINS_TCO = tipo;
    if (descripcion !== undefined) data.CINS_DES = descripcion;
    if (url !== undefined) data.CINS_URL = url;

    const contenido = await prisma.tM_COINS.update({ where: { CINS_COD: id }, data });
    return success(res, contenido, 'Contenido actualizado exitosamente');
  } catch (err) { next(err); }
};

const deleteContenidoInstitucional = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tM_COINS.delete({ where: { CINS_COD: id } });
    return success(res, null, 'Contenido eliminado exitosamente');
  } catch (err) { next(err); }
};

// ============================
// CONTENIDO TURÍSTICO
// ============================

const getContenidoTuristico = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { tipo, destinoId } = req.query;

    const where = {};
    if (tipo) where.CTUR_TCO = tipo;
    if (destinoId) where.CTUR_DET = parseInt(destinoId);

    const [total, contenidos] = await Promise.all([
      prisma.tM_COTUR.count({ where }),
      prisma.tM_COTUR.findMany({
        where,
        skip,
        take,
        include: {
          TM_USUAR: { select: { USUAR_NM: true } },
          TM_DESTI: { select: { DEST_NOM: true } },
        },
        orderBy: { CTUR_FPU: 'desc' },
      }),
    ]);

    return success(res, { contenidos, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

const createContenidoTuristico = async (req, res, next) => {
  try {
    const { titulo, tipo, descripcion, url, destinoId } = req.body;
    const contenido = await prisma.tM_COTUR.create({
      data: {
        CTUR_TIT: titulo,
        CTUR_TCO: tipo,
        CTUR_DES: descripcion,
        CTUR_URL: url,
        CTUR_FPU: new Date(),
        CTUR_AUT: req.user.sub,
        CTUR_DET: destinoId,
      },
    });
    return created(res, contenido, 'Contenido turístico creado exitosamente');
  } catch (err) { next(err); }
};

const updateContenidoTuristico = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, tipo, descripcion, url, destinoId } = req.body;
    const data = {};
    if (titulo) data.CTUR_TIT = titulo;
    if (tipo) data.CTUR_TCO = tipo;
    if (descripcion !== undefined) data.CTUR_DES = descripcion;
    if (url !== undefined) data.CTUR_URL = url;
    if (destinoId) data.CTUR_DET = destinoId;

    const contenido = await prisma.tM_COTUR.update({ where: { CTUR_COD: id }, data });
    return success(res, contenido, 'Contenido turístico actualizado exitosamente');
  } catch (err) { next(err); }
};

const deleteContenidoTuristico = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tM_COTUR.delete({ where: { CTUR_COD: id } });
    return success(res, null, 'Contenido eliminado exitosamente');
  } catch (err) { next(err); }
};

module.exports = {
  getContenidoInstitucional, createContenidoInstitucional,
  updateContenidoInstitucional, deleteContenidoInstitucional,
  getContenidoTuristico, createContenidoTuristico,
  updateContenidoTuristico, deleteContenidoTuristico,
};
