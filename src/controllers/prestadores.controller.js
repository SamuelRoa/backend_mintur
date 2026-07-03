/**
 * Controlador de Prestadores de Servicios
 * CRUD para TM_PRSER con sus subtablas (hospedaje, gastronomía, transporte)
 */

const prisma = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination.util');
const { success, created, notFound } = require('../utils/response.util');
const { sendEstadoPrestadorEmail } = require('../services/mail.service');

const getPrestadores = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = getPaginationParams(req.query);
    const { tipo, estado, municipio, regionId, email } = req.query;

    const where = {};
    if (tipo) where.PROV_TSE = tipo;
    if (estado) where.PROV_ESV = estado;
    if (email) where.PROV_EMA = email;
    if (municipio) where.PROV_MUN = parseInt(municipio);
    if (regionId) {
      where.TM_MUNIC = {
        TM_ESTADO: { ESTA_REGI: parseInt(regionId) },
      };
    }

    const [total, prestadores] = await Promise.all([
      prisma.tM_PRSER.count({ where }),
      prisma.tM_PRSER.findMany({
        where,
        skip,
        take,
        include: {
          TM_MUNIC: {
            select: {
              MUNI_NOM: true,
              MUNI_EST: true,
              TM_ESTADO: { select: { ESTA_NOM: true, ESTA_REGI: true } },
            },
          },
          TM_UBSER: true,
          TM_HOSPE: true,
          TM_GASTR: true,
          TM_TRANS: true,
        },
        orderBy: { PROV_NOM: 'asc' },
      }),
    ]);
    
    // Incluir subtablas según tipo en el listado
    prestadores.forEach((p) => {
      p.subtipo = p.PROV_TSE === 'hosped' ? p.TM_HOSPE
        : p.PROV_TSE === 'rest' ? p.TM_GASTR
        : p.PROV_TSE === 'transp' ? p.TM_TRANS
        : null;
    });

    return success(res, { prestadores, meta: buildPaginationMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
};

const getPrestadorById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const prestador = await prisma.tM_PRSER.findUnique({
      where: { PROV_COD: id },
      include: {
        TM_MUNIC: true,
        TM_UBSER: true,
        TM_HOSPE: true,
        TM_GASTR: true,
        TM_TRANS: true,
      },
    });

    if (!prestador) return notFound(res, 'Prestador de servicios no encontrado');
    return success(res, prestador);
  } catch (err) {
    next(err);
  }
};

const createPrestador = async (req, res, next) => {
  try {
    const {
      nombre, tipo, email, telefono, web, municipioId, lat, lon, direccion,
      hospe, gastr, trans,
    } = req.body;

    const prestador = await prisma.tM_PRSER.create({
      data: {
        PROV_NOM: nombre,
        PROV_TSE: tipo,
        PROV_EMA: email,
        PROV_TEL: telefono,
        PROV_WEB: web,
        PROV_ESV: 'pend',
        PROV_MUN: municipioId,
        PROV_USU: req.user?.sub ?? null,
        TM_UBSER: { create: { UBSR_LAT: lat, UBSR_LON: lon, UBSR_DIR: direccion } },
        ...(tipo === 'hosped' && hospe ? {
          TM_HOSPE: { create: { HOSP_CAT: hospe.categoria, HOSP_NDH: hospe.numHabitaciones, HOSP_HOR: hospe.horario } },
        } : {}),
        ...(tipo === 'rest' && gastr ? {
          TM_GASTR: { create: { GAST_TIG: gastr.tipoGastronomia, GAST_HOR: gastr.horario } },
        } : {}),
        ...(tipo === 'transp' && trans ? {
          TM_TRANS: { create: { TRAN_TVE: trans.tipoVehiculo, TRAN_CPA: trans.capacidad, TRAN_RUC: trans.ruc } },
        } : {}),
      },
      include: { TM_UBSER: true },
    });

    return created(res, prestador, 'Prestador registrado exitosamente. Pendiente de validación.');
  } catch (err) {
    next(err);
  }
};

const updateEstadoPrestador = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { estado } = req.body; // 'validado' | 'rechazado' | 'pend'

    const prestador = await prisma.tM_PRSER.update({
      where: { PROV_COD: id },
      data: { PROV_ESV: estado },
    });

    // Notificar por correo si tiene email
    if (prestador.PROV_EMA && ['validado', 'rechazado'].includes(estado)) {
      sendEstadoPrestadorEmail({
        email: prestador.PROV_EMA,
        nombre: prestador.PROV_NOM,
        estado,
      }).catch((e) => console.warn('No se pudo enviar correo al prestador:', e.message));
    }

    return success(res, prestador, `Estado actualizado a "${estado}" exitosamente`);
  } catch (err) {
    next(err);
  }
};

const updatePrestador = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, email, telefono, web, municipioId } = req.body;

    const data = {};
    if (nombre) data.PROV_NOM = nombre;
    if (email) data.PROV_EMA = email;
    if (telefono) data.PROV_TEL = telefono;
    if (web) data.PROV_WEB = web;
    if (municipioId) data.PROV_MUN = municipioId;

    const prestador = await prisma.tM_PRSER.update({ where: { PROV_COD: id }, data });
    return success(res, prestador, 'Prestador actualizado exitosamente');
  } catch (err) {
    next(err);
  }
};

const deletePrestador = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.tM_PRSER.delete({ where: { PROV_COD: id } });
    return success(res, null, 'Prestador eliminado exitosamente');
  } catch (err) {
    next(err);
  }
};

const getMiPerfil = async (req, res, next) => {
  try {
    const prestador = await prisma.tM_PRSER.findFirst({
      where: { PROV_USU: req.user.sub },
      include: {
        TM_MUNIC: true,
        TM_UBSER: true,
        TM_HOSPE: true,
        TM_GASTR: true,
        TM_TRANS: true,
      },
    });

    if (!prestador) return notFound(res, 'No tienes un prestador registrado');
    return success(res, prestador);
  } catch (err) {
    next(err);
  }
};

const updateMiPerfil = async (req, res, next) => {
  try {
    const prestador = await prisma.tM_PRSER.findFirst({
      where: { PROV_USU: req.user.sub },
    });

    if (!prestador) return notFound(res, 'No tienes un prestador registrado');
    if (prestador.PROV_ESV !== 'validado') {
      return error(res, 'Tu prestador debe estar validado para poder editar la información', 400);
    }

    const { nombre, email, telefono, web, direccion, lat, lon } = req.body;
    const data = {};
    if (nombre) data.PROV_NOM = nombre;
    if (email) data.PROV_EMA = email;
    if (telefono) data.PROV_TEL = telefono;
    if (web) data.PROV_WEB = web;

    const updated = await prisma.tM_PRSER.update({
      where: { PROV_COD: prestador.PROV_COD },
      data,
    });

    // Actualizar ubicación si se proporcionó
    if (lat !== undefined || lon !== undefined || direccion !== undefined) {
      await prisma.tM_UBSER.upsert({
        where: { UBSR_PRO: prestador.PROV_COD },
        create: { UBSR_PRO: prestador.PROV_COD, UBSR_LAT: lat, UBSR_LON: lon, UBSR_DIR: direccion },
        update: {
          ...(lat !== undefined && { UBSR_LAT: lat }),
          ...(lon !== undefined && { UBSR_LON: lon }),
          ...(direccion !== undefined && { UBSR_DIR: direccion }),
        },
      });
    }

    return success(res, updated, 'Perfil actualizado exitosamente');
  } catch (err) {
    next(err);
  }
};

const exportarPrestadores = async (req, res, next) => {
  try {
    const { generateCSV, sendCSVDownload } = require('../services/file.service');
    const prestadores = await prisma.tM_PRSER.findMany({
      include: { TM_MUNIC: { select: { MUNI_NOM: true } }, TM_UBSER: true },
      orderBy: { PROV_NOM: 'asc' },
    });
    const data = prestadores.map((p) => ({
      ID: p.PROV_COD,
      Nombre: p.PROV_NOM,
      Tipo: p.PROV_TSE,
      Email: p.PROV_EMA ?? '',
      Telefono: p.PROV_TEL ?? '',
      Estado: p.PROV_ESV,
      Municipio: p.TM_MUNIC?.MUNI_NOM ?? '',
      Latitud: p.TM_UBSER?.UBSR_LAT ?? '',
      Longitud: p.TM_UBSER?.UBSR_LON ?? '',
    }));
    sendCSVDownload(res, generateCSV(data), 'prestadores_servicios');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPrestadores, getPrestadorById, createPrestador,
  updatePrestador, updateEstadoPrestador, deletePrestador, exportarPrestadores,
  getMiPerfil, updateMiPerfil,
};
