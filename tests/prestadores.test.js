const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

describe('Prestadores Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/prestadores', () => {
    test('lista prestadores con paginación', async () => {
      prisma.tM_PRSER.count.mockResolvedValue(1);
      prisma.tM_PRSER.findMany.mockResolvedValue([{
        PROV_COD: 1, PROV_NOM: 'Hotel Test', PROV_TSE: 'hosped', PROV_ESV: 'pend',
        PROV_MUN: 1, TM_MUNIC: { MUNI_NOM: 'Libertador' }, TM_UBSER: null,
      }]);
      const res = await request(app).get('/api/prestadores');
      expect(res.status).toBe(200);
      expect(res.body.data.prestadores).toHaveLength(1);
    });

    test('filtra por tipo', async () => {
      prisma.tM_PRSER.count.mockResolvedValue(0);
      prisma.tM_PRSER.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/prestadores?tipo=hosped');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/prestadores/:id', () => {
    test('retorna prestador por ID', async () => {
      prisma.tM_PRSER.findUnique.mockResolvedValue({
        PROV_COD: 1, PROV_NOM: 'Hotel Test', PROV_TSE: 'hosped', PROV_ESV: 'validado',
        PROV_MUN: 1, TM_MUNIC: {}, TM_UBSER: null, TM_HOSPE: null,
        TM_GASTR: null, TM_TRANS: null,
      });
      const res = await request(app).get('/api/prestadores/1');
      expect(res.status).toBe(200);
    });

    test('ID inexistente retorna 404', async () => {
      prisma.tM_PRSER.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/prestadores/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/prestadores', () => {
    test('crea prestador público sin auth', async () => {
      prisma.tM_PRSER.create.mockResolvedValue({ PROV_COD: 1, PROV_ESV: 'pend' });
      const res = await request(app)
        .post('/api/prestadores')
        .send({ nombre: 'Nuevo Hotel', tipo: 'hosped', municipioId: 1, lat: 10.5, lon: -66.9 });
      expect(res.status).toBe(201);
    });
  });
});
