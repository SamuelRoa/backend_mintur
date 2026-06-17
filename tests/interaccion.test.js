const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');

describe('Eventos Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('GET /api/eventos lista eventos', async () => {
    prisma.tM_EVENT.count.mockResolvedValue(1);
    prisma.tM_EVENT.findMany.mockResolvedValue([{
      EVEN_COD: 1, EVEN_NOM: 'Festival', EVEN_FI: new Date(), EVEN_TE: 1, EVEN_DI: 1,
      TM_TIEVE: { TIEV_NOM: 'Cultural' },
      TM_DESTI: { DEST_NOM: 'Destino' },
    }]);
    const res = await request(app).get('/api/eventos');
    expect(res.status).toBe(200);
  });

  test('GET /api/eventos/:id retorna evento', async () => {
    prisma.tM_EVENT.findUnique.mockResolvedValue({
      EVEN_COD: 1, EVEN_NOM: 'Festival', EVEN_FI: new Date(),
      EVEN_TE: 1, EVEN_DI: 1,
      TM_TIEVE: {}, TM_DESTI: { TM_UBDES: null },
    });
    const res = await request(app).get('/api/eventos/1');
    expect(res.status).toBe(200);
  });
});

describe('Consultas Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('POST /api/consultas pública', async () => {
    prisma.tM_CONSU.create.mockResolvedValue({ CONS_COD: 1, CONS_EST: 'pendiente' });
    const res = await request(app)
      .post('/api/consultas')
      .send({ contenido: 'Consulta de prueba', canal: 'web' });
    expect(res.status).toBe(201);
  });
});

describe('Opiniones Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('GET /api/opiniones lista', async () => {
    prisma.tM_OPINI.count.mockResolvedValue(1);
    prisma.tM_OPINI.findMany.mockResolvedValue([{
      RECO_COD: 1, RECO_CAL: 5, RECO_COM: 'Excelente', RECO_FEO: new Date(),
      RECO_USU: 1, RECO_DES: 1,
      TM_USUAR: { USUAR_NM: 'Usuario' },
      TM_DESTI: { DEST_NOM: 'Destino' },
    }]);
    const res = await request(app).get('/api/opiniones');
    expect(res.status).toBe(200);
  });
});

describe('CMS Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('GET /api/contenido/institucional público', async () => {
    prisma.tM_COINS.count.mockResolvedValue(1);
    prisma.tM_COINS.findMany.mockResolvedValue([{
      CINS_COD: 1, CINS_TIT: 'Quiénes Somos', CINS_TCO: 'institucional',
      CINS_FPU: new Date(), CINS_AUT: 1,
      TM_USUAR: { USUAR_NM: 'Admin' },
    }]);
    const res = await request(app).get('/api/contenido/institucional');
    expect(res.status).toBe(200);
  });

  test('GET /api/contenido/turistico público', async () => {
    prisma.tM_COTUR.count.mockResolvedValue(1);
    prisma.tM_COTUR.findMany.mockResolvedValue([{
      CTUR_COD: 1, CTUR_TIT: 'Guía del Parque', CTUR_TCO: 'guia',
      CTUR_FPU: new Date(), CTUR_AUT: 1, CTUR_DET: 1,
      TM_USUAR: { USUAR_NM: 'Admin' },
      TM_DESTI: { DEST_NOM: 'Parque' },
    }]);
    const res = await request(app).get('/api/contenido/turistico');
    expect(res.status).toBe(200);
  });
});
