const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

describe('Rutas Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('GET /api/rutas', () => {
    test('lista rutas con paginación', async () => {
      prisma.tM_RUTAT.count.mockResolvedValue(1);
      prisma.tM_RUTAT.findMany.mockResolvedValue([{
        RUTA_COD: 1, RUTA_NOM: 'Ruta Test', RUTA_VIA: 'bueno', RUTA_TTU: 1,
        TM_TITUR: { TITU_NOM: 'Aventura' },
        TR_RUTDE: [{ RTDE_ORD: 1, TM_DESTI: { DEST_NOM: 'Destino 1', TM_UBDES: null } }],
      }]);
      const res = await request(app).get('/api/rutas');
      expect(res.status).toBe(200);
      expect(res.body.data.rutas).toHaveLength(1);
    });
  });

  describe('GET /api/rutas/:id', () => {
    test('retorna ruta con detalles', async () => {
      prisma.tM_RUTAT.findUnique.mockResolvedValue({
        RUTA_COD: 1, RUTA_NOM: 'Ruta Test', RUTA_VIA: 'bueno', RUTA_TTU: 1,
        TM_TITUR: {}, TR_RUTDE: [], TR_RUTHO: [], TR_RUTGA: [],
      });
      const res = await request(app).get('/api/rutas/1');
      expect(res.status).toBe(200);
    });

    test('ID inexistente retorna 404', async () => {
      prisma.tM_RUTAT.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/rutas/999');
      expect(res.status).toBe(404);
    });
  });
});
