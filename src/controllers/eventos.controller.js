/**
 * Controlador de Eventos
 */

const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound } = require('../utils/response.util');

const getEventos = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { tipoEvento, destinoId, proximosOnly, regionId, destacado } = req.query;

    const where = {};
    if (tipoEvento) where.EVEN_TE = parseInt(tipoEvento);
    if (destinoId) where.EVEN_DI = parseInt(destinoId);
    if (destacado === 'true') where.EVEN_FAV = true;
    if (proximosOnly === 'true') where.EVEN_FI = { gte: new Date() };
    if (regionId) {
      where.TM_DESTI = {
        TM_MUNIC: {
          TM_ESTADO: { ESTA_REGI: parseInt(regionId) },
        },
      };
    }

    const [total, eventos] = await Promise.all([
      prisma.tM_EVENT.count({ where }),
      prisma.tM_EVENT.findMany({
        where,
        skip,
        take,
        include: {
          TM_TIEVE: { select: { TIEV_NOM: true } },
          TM_DESTI: {
            select: {
              DEST_NOM: true,
              DEST_IMG: true,
              DEST_MUN: true,
              TM_MUNIC: {
                select: {
                  MUNI_NOM: true,
                  TM_ESTADO: { select: { ESTA_NOM: true, ESTA_REGI: true } },
                },
              },
            },
          },
        },
        orderBy: { EVEN_FI: 'asc' },
      }),
    ]);

    return success(res, { eventos, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

const getEventoById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const evento = await prisma.tM_EVENT.findUnique({
      where: { EVEN_COD: id },
      include: { TM_TIEVE: true, TM_DESTI: { include: { TM_UBDES: true } } },
    });
    if (!evento) return notFound(res, 'Evento no encontrado');
    return success(res, evento);
  } catch (err) { next(err); }
};

const createEvento = async (req, res, next) => {
  try {
    const { nombre, descripcion, fechaInicio, fechaFin, tipoEventoId, destinoId, imagenUrl, destacado, orden } = req.body;
    const evento = await prisma.tM_EVENT.create({
      data: {
        EVEN_NOM: nombre,
        EVEN_DES: descripcion,
        EVEN_FI: new Date(fechaInicio),
        EVEN_FF: fechaFin ? new Date(fechaFin) : null,
        EVEN_TE: tipoEventoId,
        EVEN_DI: destinoId,
        EVEN_IMG: imagenUrl ?? undefined,
        EVEN_FAV: destacado ?? undefined,
        EVEN_ORD: orden ?? undefined,
      },
    });
    return created(res, evento, 'Evento creado exitosamente');
  } catch (err) { next(err); }
};

const updateEvento = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, fechaInicio, fechaFin, tipoEventoId, destinoId, imagenUrl, destacado, orden } = req.body;

    const data = {};
    if (nombre) data.EVEN_NOM = nombre;
    if (descripcion !== undefined) data.EVEN_DES = descripcion;
    if (fechaInicio) data.EVEN_FI = new Date(fechaInicio);
    if (fechaFin !== undefined) data.EVEN_FF = fechaFin ? new Date(fechaFin) : null;
    if (tipoEventoId) data.EVEN_TE = tipoEventoId;
    if (destinoId) data.EVEN_DI = destinoId;
    if (imagenUrl !== undefined) data.EVEN_IMG = imagenUrl;
    if (destacado !== undefined) data.EVEN_FAV = destacado;
    if (orden !== undefined) data.EVEN_ORD = orden;

    const evento = await prisma.tM_EVENT.update({ where: { EVEN_COD: id }, data });
    return success(res, evento, 'Evento actualizado exitosamente');
  } catch (err) { next(err); }
};

const deleteEvento = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tM_EVENT.delete({ where: { EVEN_COD: id } });
    return success(res, null, 'Evento eliminado exitosamente');
  } catch (err) { next(err); }
};

module.exports = { getEventos, getEventoById, createEvento, updateEvento, deleteEvento };
