/**
 * Controlador de Consultas Ciudadanas
 */

const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound } = require('../utils/response.util');
const { sendConsultaResponse } = require('../services/mail.service');

const getConsultas = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { estado, canal } = req.query;

    const where = {};
    if (estado) where.CONS_EST = estado;
    if (canal) where.CONS_CAN = canal;

    const [total, consultas] = await Promise.all([
      prisma.tM_CONSU.count({ where }),
      prisma.tM_CONSU.findMany({
        where,
        skip,
        take,
        include: {
          TM_USUAR_CONS_USU: { select: { USUAR_NM: true, USUAR_EM: true } },
          TM_USUAR_CONS_ATE: { select: { USUAR_NM: true } },
        },
        orderBy: { CONS_FYH: 'desc' },
      }),
    ]);

    return success(res, { consultas, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) { next(err); }
};

const getConsultaById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const consulta = await prisma.tM_CONSU.findUnique({ where: { CONS_COD: id } });
    if (!consulta) return notFound(res, 'Consulta no encontrada');
    return success(res, consulta);
  } catch (err) { next(err); }
};

const createConsulta = async (req, res, next) => {
  try {
    const { contenido, canal, usuarioId } = req.body;
    const consulta = await prisma.tM_CONSU.create({
      data: {
        CONS_CON: contenido,
        CONS_CAN: canal ?? 'web',
        CONS_EST: 'pendiente',
        CONS_USU: usuarioId ?? null,
      },
    });
    return created(res, consulta, 'Consulta registrada exitosamente');
  } catch (err) { next(err); }
};

const responderConsulta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { respuesta, emailDestinatario } = req.body;

    const consulta = await prisma.tM_CONSU.update({
      where: { CONS_COD: id },
      data: {
        CONS_RES: respuesta,
        CONS_EST: 'respondida',
        CONS_ATE: req.user.sub,
      },
    });

    // Enviar por correo si se proporcionó email
    if (emailDestinatario) {
      sendConsultaResponse({
        destinatario: emailDestinatario,
        consulta: consulta.CONS_CON,
        respuesta,
      }).catch((e) => console.warn('No se pudo enviar respuesta por correo:', e.message));
    }

    return success(res, consulta, 'Consulta respondida exitosamente');
  } catch (err) { next(err); }
};

module.exports = { getConsultas, getConsultaById, createConsulta, responderConsulta };
