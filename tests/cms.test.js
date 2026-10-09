const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const { generateTokenPair } = require('../src/services/token.service');

const adminUser = {
  USUA_COD: 55,
  USUAR_NM: 'Admin',
  USUAR_EM: 'admin@cotatur.gob.ve',
  USUAR_RO: 55,
  TM_ROLES: { ROLE_COD: 55, ROLE_NOM: 'Administrador' },
};

const authHeader = () => {
  const { accessToken } = generateTokenPair(adminUser);
  return `Bearer ${accessToken}`;
};

describe('CMS Endpoints (site + regiones + destacados)', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('GET /api/site retorna settings', async () => {
    prisma.tM_SITE.findMany.mockResolvedValue([
      { SITE_KEY: 'hero_titulo', SITE_VAL: 'Venezuela', SITE_DES: 'Hero' },
    ]);
    const res = await request(app).get('/api/site');
    expect(res.status).toBe(200);
    expect(res.body.data.settings[0].clave).toBe('hero_titulo');
  });

  test('PUT /api/site sin token retorna 401', async () => {
    const res = await request(app).put('/api/site').send({ clave: 'x', valor: 'y' });
    expect(res.status).toBe(401);
  });

  test('PUT /api/site con admin guarda', async () => {
    prisma.tM_SITE.upsert.mockResolvedValue({ SITE_KEY: 'hero_titulo', SITE_VAL: 'Nuevo', SITE_DES: null });
    const res = await request(app)
      .put('/api/site')
      .set('Authorization', authHeader())
      .send({ clave: 'hero_titulo', valor: 'Nuevo' });
    expect(res.status).toBe(200);
    expect(res.body.data.clave).toBe('hero_titulo');
  });

  test('PUT /api/site con body inválido retorna 422', async () => {
    const res = await request(app)
      .put('/api/site')
      .set('Authorization', authHeader())
      .send({ clave: '', valor: 'x' });
    expect(res.status).toBe(422);
  });

  test('GET /api/regiones-cms retorna regiones', async () => {
    prisma.tM_REGION.findMany.mockResolvedValue([
      { REGI_COD: 1, REGI_NOM: 'Andina', TM_REGCM: null },
    ]);
    const res = await request(app).get('/api/regiones-cms');
    expect(res.status).toBe(200);
    expect(res.body.data.regiones[0].nombre).toBe('Andina');
  });

  test('PUT /api/regiones-cms guarda contenido', async () => {
    prisma.tM_REGCM.upsert.mockResolvedValue({
      RGCM_REG: 1, RGCM_TAG: 'Andes', RGCM_DES: null, RGCM_HIS: null,
      RGCM_COS: null, RGCM_CLI: null, RGCM_IMG: null, RGCM_COL: null,
      TM_REGION: { REGI_COD: 1, REGI_NOM: 'Andina' },
    });
    const res = await request(app)
      .put('/api/regiones-cms')
      .set('Authorization', authHeader())
      .send({ regionId: 1, tagline: 'Andes' });
    expect(res.status).toBe(200);
    expect(res.body.data.regionId).toBe(1);
  });

  test('GET /api/destinos?destacado=true filtra', async () => {
    prisma.tM_DESTI.count.mockResolvedValue(1);
    prisma.tM_DESTI.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/destinos?destacado=true');
    expect(res.status).toBe(200);
    expect(prisma.tM_DESTI.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ DEST_FAV: true }) })
    );
  });
});
