/**
 * Controlador de Destinos Turísticos
 * CRUD completo para TM_DESTI con su ubicación TM_UBDES
 */

const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound } = require('../utils/response.util');

/**
 * GET /api/destinos
 * Lista destinos con paginación y filtros opcionales
 */
const getDestinos = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { municipio, tipoTurismo, nombre, regionId } = req.query;

    const where = {};
    if (municipio) where.DEST_MUN = parseInt(municipio);
    if (tipoTurismo) where.DEST_TTU = parseInt(tipoTurismo);
    if (nombre) where.DEST_NOM = { contains: nombre, mode: 'insensitive' };
    if (regionId) {
      where.TM_MUNIC = {
        TM_ESTADO: { ESTA_REGI: parseInt(regionId) },
      };
    }

    const [total, destinos] = await Promise.all([
      prisma.tM_DESTI.count({ where }),
      prisma.tM_DESTI.findMany({
        where,
        skip,
        take,
        include: {
          TM_TITUR: { select: { TITU_NOM: true } },
          TM_MUNIC: {
            select: {
              MUNI_NOM: true,
              MUNI_EST: true,
              TM_ESTADO: { select: { ESTA_NOM: true, ESTA_REGI: true } },
            },
          },
          TM_UBDES: true,
        },
        orderBy: { DEST_NOM: 'asc' },
      }),
    ]);

    return success(res, {
      destinos,
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/destinos/:id
 * Obtiene un destino por ID con todos sus datos relacionados
 */
const getDestinoById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const destino = await prisma.tM_DESTI.findUnique({
      where: { DEST_COD: id },
      include: {
        TM_TITUR: true,
        TM_MUNIC: {
          include: { TM_ESTADO: { include: { TM_REGION: true } } },
        },
        TM_UBDES: true,
        TM_OPINI: { include: { TM_USUAR: { select: { USUAR_NM: true } } } },
        TM_EVENT: { where: { EVEN_FF: { gte: new Date() } } },
        TM_COTUR: true,
      },
    });

    if (!destino) return notFound(res, 'Destino no encontrado');

    return success(res, destino);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/destinos
 * Crea un nuevo destino turístico con su ubicación
 */
const createDestino = async (req, res, next) => {
  try {
    const { nombre, descripcion, vialidad, tipoTurismoId, municipioId, lat, lon, direccion } = req.body;

    const destino = await prisma.tM_DESTI.create({
      data: {
        DEST_NOM: nombre,
        DEST_DES: descripcion,
        DEST_VIA: vialidad,
        DEST_TTU: tipoTurismoId,
        DEST_MUN: municipioId,
        TM_UBDES: {
          create: {
            UBDE_LAT: lat,
            UBDE_LON: lon,
            UBDE_DIR: direccion,
          },
        },
      },
      include: { TM_UBDES: true },
    });

    return created(res, destino, 'Destino creado exitosamente');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/destinos/:id
 * Actualiza un destino existente
 */
const updateDestino = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, vialidad, tipoTurismoId, municipioId, lat, lon, direccion } = req.body;

    const data = {};
    if (nombre !== undefined) data.DEST_NOM = nombre;
    if (descripcion !== undefined) data.DEST_DES = descripcion;
    if (vialidad !== undefined) data.DEST_VIA = vialidad;
    if (tipoTurismoId !== undefined) data.DEST_TTU = tipoTurismoId;
    if (municipioId !== undefined) data.DEST_MUN = municipioId;

    // Actualizar ubicación si se proporcionan coordenadas
    if (lat !== undefined || lon !== undefined || direccion !== undefined) {
      data.TM_UBDES = {
        upsert: {
          create: { UBDE_LAT: lat, UBDE_LON: lon, UBDE_DIR: direccion, UBDE_DES: id },
          update: {
            ...(lat !== undefined && { UBDE_LAT: lat }),
            ...(lon !== undefined && { UBDE_LON: lon }),
            ...(direccion !== undefined && { UBDE_DIR: direccion }),
          },
        },
      };
    }

    const destino = await prisma.tM_DESTI.update({
      where: { DEST_COD: id },
      data,
      include: { TM_UBDES: true },
    });

    return success(res, destino, 'Destino actualizado exitosamente');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/destinos/:id
 * Elimina un destino turístico
 */
const deleteDestino = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tM_DESTI.delete({ where: { DEST_COD: id } });
    return success(res, null, 'Destino eliminado exitosamente');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/destinos/exportar
 * Descarga listado completo de destinos en CSV
 */
const exportarDestinos = async (req, res, next) => {
  try {
    const { generateCSV, sendCSVDownload } = require('../services/file.service');

    const destinos = await prisma.tM_DESTI.findMany({
      include: {
        TM_TITUR: { select: { TITU_NOM: true } },
        TM_MUNIC: { select: { MUNI_NOM: true } },
        TM_UBDES: true,
      },
      orderBy: { DEST_NOM: 'asc' },
    });

    const data = destinos.map((d) => ({
      ID: d.DEST_COD,
      Nombre: d.DEST_NOM,
      Descripcion: d.DEST_DES ?? '',
      Vialidad: d.DEST_VIA,
      TipoTurismo: d.TM_TITUR?.TITU_NOM ?? '',
      Municipio: d.TM_MUNIC?.MUNI_NOM ?? '',
      Latitud: d.TM_UBDES?.UBDE_LAT ?? '',
      Longitud: d.TM_UBDES?.UBDE_LON ?? '',
      Direccion: d.TM_UBDES?.UBDE_DIR ?? '',
    }));

    const csv = generateCSV(data);
    sendCSVDownload(res, csv, 'destinos_turisticos');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDestinos, getDestinoById, createDestino, updateDestino, deleteDestino, exportarDestinos };
