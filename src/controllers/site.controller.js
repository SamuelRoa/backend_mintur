const prisma = require('../config/database');
const { success, created, notFound } = require('../utils/response.util');

const mapSite = (s) => ({ clave: s.SITE_KEY, valor: s.SITE_VAL, descripcion: s.SITE_DES });
const mapReg = (r) => ({
  regionId: r.RGCM_REG,
  tagline: r.RGCM_TAG,
  descripcion: r.RGCM_DES,
  historia: r.RGCM_HIS,
  costumbres: r.RGCM_COS,
  clima: r.RGCM_CLI,
  imagenUrl: r.RGCM_IMG,
  color: r.RGCM_COL,
  region: r.TM_REGION ? { id: r.TM_REGION.REGI_COD, nombre: r.TM_REGION.REGI_NOM } : undefined,
});

const getSite = async (req, res, next) => {
  try {
    const settings = await prisma.tM_SITE.findMany({ orderBy: { SITE_KEY: 'asc' } });
    return success(res, { settings: settings.map(mapSite) });
  } catch (err) { next(err); }
};

const upsertSite = async (req, res, next) => {
  try {
    const { clave, valor, descripcion } = req.body;
    const s = await prisma.tM_SITE.upsert({
      where: { SITE_KEY: clave },
      create: { SITE_KEY: clave, SITE_VAL: valor ?? null, SITE_DES: descripcion ?? null },
      update: { SITE_VAL: valor ?? null, ...(descripcion !== undefined && { SITE_DES: descripcion }) },
    });
    return success(res, mapSite(s), 'Configuración guardada');
  } catch (err) { next(err); }
};

const getRegionesCms = async (req, res, next) => {
  try {
    const regiones = await prisma.tM_REGION.findMany({
      include: { TM_REGCM: true },
      orderBy: { REGI_NOM: 'asc' },
    });
    return success(res, {
      regiones: regiones.map((r) => ({
        id: r.REGI_COD,
        nombre: r.REGI_NOM,
        cms: r.TM_REGCM ? mapReg({ ...r.TM_REGCM, TM_REGION: undefined }) : null,
      })),
    });
  } catch (err) { next(err); }
};

const getRegionCmsById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const r = await prisma.tM_REGCM.findUnique({ where: { RGCM_REG: id }, include: { TM_REGION: true } });
    if (!r) return notFound(res, 'Contenido de región no encontrado');
    return success(res, mapReg(r));
  } catch (err) { next(err); }
};

const upsertRegionCms = async (req, res, next) => {
  try {
    const { regionId, tagline, descripcion, historia, costumbres, clima, imagenUrl, color } = req.body;
    const r = await prisma.tM_REGCM.upsert({
      where: { RGCM_REG: regionId },
      create: {
        RGCM_REG: regionId, RGCM_TAG: tagline ?? null, RGCM_DES: descripcion ?? null,
        RGCM_HIS: historia ?? null, RGCM_COS: costumbres ?? null, RGCM_CLI: clima ?? null,
        RGCM_IMG: imagenUrl ?? null, RGCM_COL: color ?? null,
      },
      update: {
        ...(tagline !== undefined && { RGCM_TAG: tagline }),
        ...(descripcion !== undefined && { RGCM_DES: descripcion }),
        ...(historia !== undefined && { RGCM_HIS: historia }),
        ...(costumbres !== undefined && { RGCM_COS: costumbres }),
        ...(clima !== undefined && { RGCM_CLI: clima }),
        ...(imagenUrl !== undefined && { RGCM_IMG: imagenUrl }),
        ...(color !== undefined && { RGCM_COL: color }),
      },
      include: { TM_REGION: true },
    });
    return success(res, mapReg(r), 'Contenido de región guardado');
  } catch (err) { next(err); }
};

module.exports = { getSite, upsertSite, getRegionesCms, getRegionCmsById, upsertRegionCms };
