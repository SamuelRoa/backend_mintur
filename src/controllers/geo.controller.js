/**
 * Controlador de Catálogos Geográficos
 * Endpoints de solo lectura para países, regiones, estados, municipios y parroquias
 * Usados para poblar selectores en el frontend
 */

const prisma = require('../config/database');
const { success } = require('../utils/response.util');

const getPaises = async (req, res, next) => {
  try {
    const paises = await prisma.tM_PAISE.findMany({ orderBy: { PAIS_NOM: 'asc' } });
    return success(res, paises);
  } catch (err) { next(err); }
};

const getRegiones = async (req, res, next) => {
  try {
    const regiones = await prisma.tM_REGION.findMany({ orderBy: { REGI_NOM: 'asc' } });
    return success(res, regiones);
  } catch (err) { next(err); }
};

const getCorporaciones = async (req, res, next) => {
  try {
    const { regionId } = req.query;
    const where = regionId ? { CORP_REG: parseInt(regionId) } : {};
    const corps = await prisma.tM_CORPO.findMany({
      where,
      include: { TM_REGION: { select: { REGI_NOM: true } } },
      orderBy: { CORP_NOM: 'asc' },
    });
    return success(res, corps);
  } catch (err) { next(err); }
};

const getEstados = async (req, res, next) => {
  try {
    const { regionId } = req.query;
    const where = regionId ? { ESTA_REGI: parseInt(regionId) } : {};
    const estados = await prisma.tM_ESTADO.findMany({
      where,
      include: { TM_REGION: { select: { REGI_NOM: true } } },
      orderBy: { ESTA_NOM: 'asc' },
    });
    return success(res, estados);
  } catch (err) { next(err); }
};

const getMunicipios = async (req, res, next) => {
  try {
    const { estadoId } = req.query;
    const where = estadoId ? { MUNI_EST: parseInt(estadoId) } : {};
    const municipios = await prisma.tM_MUNIC.findMany({
      where,
      include: { TM_ESTADO: { select: { ESTA_NOM: true } } },
      orderBy: { MUNI_NOM: 'asc' },
    });
    return success(res, municipios);
  } catch (err) { next(err); }
};

const getParroquias = async (req, res, next) => {
  try {
    const { municipioId } = req.query;
    const where = municipioId ? { PARR_MUN: parseInt(municipioId) } : {};
    const parroquias = await prisma.tM_PARRO.findMany({
      where,
      include: { TM_MUNIC: { select: { MUNI_NOM: true } } },
      orderBy: { PARR_NOM: 'asc' },
    });
    return success(res, parroquias);
  } catch (err) { next(err); }
};

const getTiposTurismo = async (req, res, next) => {
  try {
    const tipos = await prisma.tM_TITUR.findMany({ orderBy: { TITU_NOM: 'asc' } });
    return success(res, tipos);
  } catch (err) { next(err); }
};

const getTiposEvento = async (req, res, next) => {
  try {
    const tipos = await prisma.tM_TIEVE.findMany({ orderBy: { TIEV_NOM: 'asc' } });
    return success(res, tipos);
  } catch (err) { next(err); }
};

module.exports = {
  getPaises, getRegiones, getCorporaciones, getEstados,
  getMunicipios, getParroquias, getTiposTurismo, getTiposEvento,
};
