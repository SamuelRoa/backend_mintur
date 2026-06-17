const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

describe('Destinos Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/destinos', () => {
    test('lista destinos con paginación', async () => {
      prisma.tM_DESTI.count.mockResolvedValue(1);
      prisma.tM_DESTI.findMany.mockResolvedValue([{
        DEST_COD: 1, DEST_NOM: 'Parque Nacional', DEST_DES: 'Test', DEST_VIA: 'bueno',
        DEST_TTU: 1, DEST_MUN: 1,
        TM_TITUR: { TITU_NOM: 'Ecoturismo' },
        TM_MUNIC: { MUNI_NOM: 'Libertador' },
        TM_UBDES: { UBDE_LAT: '10.5', UBDE_LON: '-66.9', UBDE_DIR: 'Dirección' },
      }]);
      const res = await request(app).get('/api/destinos');
      expect(res.status).toBe(200);
      expect(res.body.data.destinos).toHaveLength(1);
      expect(res.body.data.meta.total).toBe(1);
    });

    test('filtra por nombre', async () => {
      prisma.tM_DESTI.count.mockResolvedValue(0);
      prisma.tM_DESTI.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/destinos?nombre=Parque');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/destinos/:id', () => {
    test('retorna destino por ID', async () => {
      prisma.tM_DESTI.findUnique.mockResolvedValue({
        DEST_COD: 1, DEST_NOM: 'Test', DEST_VIA: 'bueno',
        DEST_TTU: 1, DEST_MUN: 1,
        TM_TITUR: {}, TM_MUNIC: {}, TM_UBDES: null,
        TM_OPINI: [], TM_EVENT: [], TM_COTUR: [],
      });
      const res = await request(app).get('/api/destinos/1');
      expect(res.status).toBe(200);
      expect(res.body.data.DEST_NOM).toBe('Test');
    });

    test('ID inexistente retorna 404', async () => {
      prisma.tM_DESTI.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/destinos/999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/geo', () => {
    test('retorna países', async () => {
      prisma.tM_PAISE.findMany.mockResolvedValue([{ PAIS_COD: 1, PAIS_NOM: 'Venezuela' }]);
      const res = await request(app).get('/api/geo/paises');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    test('retorna regiones', async () => {
      prisma.tM_REGION.findMany.mockResolvedValue([{ REGI_COD: 1, REGI_NOM: 'Capital' }]);
      const res = await request(app).get('/api/geo/regiones');
      expect(res.status).toBe(200);
    });

    test('retorna tipos de turismo', async () => {
      prisma.tM_TITUR.findMany.mockResolvedValue([{ TITU_COD: 1, TITU_NOM: 'Ecoturismo' }]);
      const res = await request(app).get('/api/geo/tipos-turismo');
      expect(res.status).toBe(200);
    });
  });
});
