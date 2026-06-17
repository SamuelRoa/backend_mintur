/**
 * Controlador de Opiniones y Calificaciones
 */

const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound } = require('../utils/response.util');

const getOpiniones = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { destinoId, calificacionMin } = req.query;

    const where = {};
    if (destinoId) where.RECO_DES = parseInt(destinoId);
    if (calificacionMin) where.RECO_CAL = { gte: parseInt(calificacionMin) };

    const [total, opiniones] = await Promise.all([
      prisma.tM_OPINI.count({ where }),
      prisma.tM_OPINI.findMany({
        where,
        skip,
        take,
        include: {
          TM_USUAR: { select: { USUAR_NM: true } },
          TM_DESTI: { select: { DEST_NOM: true } },
        },
        orderBy: { RECO_FEO: 'desc' },
      }),
    ]);

    return success(res, { opiniones, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

const createOpinion = async (req, res, next) => {
  try {
    const { calificacion, comentario, destinoId } = req.body;
    const opinion = await prisma.tM_OPINI.create({
      data: {
        RECO_CAL: calificacion,
        RECO_COM: comentario,
        RECO_FEO: new Date(),
        RECO_USU: req.user.sub,
        RECO_DES: destinoId,
      },
    });
    return created(res, opinion, 'Opinión registrada exitosamente');
  } catch (err) { next(err); }
};

const deleteOpinion = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tM_OPINI.delete({ where: { RECO_COD: id } });
    return success(res, null, 'Opinión eliminada exitosamente');
  } catch (err) { next(err); }
};

module.exports = { getOpiniones, createOpinion, deleteOpinion };
