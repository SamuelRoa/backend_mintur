/**
 * Controlador de Rutas Turísticas
 * CRUD para TM_RUTAT con sus destinos asociados (TR_RUTDE)
 */

const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound } = require('../utils/response.util');

const getRutas = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { tipoTurismo, nombre, regionId } = req.query;

    const where = {};
    if (tipoTurismo) where.RUTA_TTU = parseInt(tipoTurismo);
    if (nombre) where.RUTA_NOM = { contains: nombre, mode: 'insensitive' };
    if (regionId) {
      where.TR_RUTDE = {
        some: {
          TM_DESTI: {
            TM_MUNIC: {
              TM_ESTADO: { ESTA_REGI: parseInt(regionId) },
            },
          },
        },
      };
    }

    const [total, rutas] = await Promise.all([
      prisma.tM_RUTAT.count({ where }),
      prisma.tM_RUTAT.findMany({
        where,
        skip,
        take,
        include: {
          TM_TITUR: { select: { TITU_NOM: true } },
          TR_RUTDE: {
            orderBy: { RTDE_ORD: 'asc' },
            include: {
              TM_DESTI: {
                include: {
                  TM_UBDES: true,
                  TM_MUNIC: { select: { MUNI_NOM: true } },
                },
              },
            },
          },
        },
        orderBy: { RUTA_NOM: 'asc' },
      }),
    ]);

    return success(res, { rutas, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
};

const getRutaById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const ruta = await prisma.tM_RUTAT.findUnique({
      where: { RUTA_COD: id },
      include: {
        TM_TITUR: true,
        TR_RUTDE: {
          orderBy: { RTDE_ORD: 'asc' },
          include: {
            TM_DESTI: { include: { TM_UBDES: true, TM_MUNIC: true } },
          },
        },
        TR_RUTHO: { include: { TM_HOSPE: { include: { TM_PRSER: true } } } },
        TR_RUTGA: { include: { TM_GASTR: { include: { TM_PRSER: true } } } },
      },
    });

    if (!ruta) return notFound(res, 'Ruta turística no encontrada');

    return success(res, ruta);
  } catch (err) {
    next(err);
  }
};

const createRuta = async (req, res, next) => {
  try {
    const { nombre, descripcion, duracionHoras, distanciaKm, vialidad, tipoTurismoId, destinos } = req.body;

    const ruta = await prisma.tM_RUTAT.create({
      data: {
        RUTA_NOM: nombre,
        RUTA_DES: descripcion,
        RUTA_DUH: duracionHoras,
        RUTA_DIS: distanciaKm,
        RUTA_VIA: vialidad,
        RUTA_TTU: tipoTurismoId,
        TR_RUTDE: destinos?.length
          ? {
              create: destinos.map((d, i) => ({
                RTDE_DES: d.destinoId,
                RTDE_ORD: d.orden ?? i + 1,
              })),
            }
          : undefined,
      },
      include: { TR_RUTDE: { include: { TM_DESTI: true } } },
    });

    return created(res, ruta, 'Ruta turística creada exitosamente');
  } catch (err) {
    next(err);
  }
};

const updateRuta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, duracionHoras, distanciaKm, vialidad, tipoTurismoId } = req.body;

    const data = {};
    if (nombre !== undefined) data.RUTA_NOM = nombre;
    if (descripcion !== undefined) data.RUTA_DES = descripcion;
    if (duracionHoras !== undefined) data.RUTA_DUH = duracionHoras;
    if (distanciaKm !== undefined) data.RUTA_DIS = distanciaKm;
    if (vialidad !== undefined) data.RUTA_VIA = vialidad;
    if (tipoTurismoId !== undefined) data.RUTA_TTU = tipoTurismoId;

    const ruta = await prisma.tM_RUTAT.update({ where: { RUTA_COD: id }, data });
    return success(res, ruta, 'Ruta actualizada exitosamente');
  } catch (err) {
    next(err);
  }
};

const deleteRuta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tM_RUTAT.delete({ where: { RUTA_COD: id } });
    return success(res, null, 'Ruta eliminada exitosamente');
  } catch (err) {
    next(err);
  }
};

const exportarRutas = async (req, res, next) => {
  try {
    const { generateCSV, sendCSVDownload } = require('../services/file.service');
    const rutas = await prisma.tM_RUTAT.findMany({
      include: { TM_TITUR: { select: { TITU_NOM: true } }, TR_RUTDE: true },
    });
    const data = rutas.map((r) => ({
      ID: r.RUTA_COD,
      Nombre: r.RUTA_NOM,
      Descripcion: r.RUTA_DES ?? '',
      DuracionHoras: r.RUTA_DUH ?? '',
      DistanciaKm: r.RUTA_DIS ?? '',
      Vialidad: r.RUTA_VIA,
      TipoTurismo: r.TM_TITUR?.TITU_NOM ?? '',
      NumeroDestinos: r.TR_RUTDE.length,
    }));
    const csv = generateCSV(data);
    sendCSVDownload(res, csv, 'rutas_turisticas');
  } catch (err) {
    next(err);
  }
};

module.exports = { getRutas, getRutaById, createRuta, updateRuta, deleteRuta, exportarRutas };
