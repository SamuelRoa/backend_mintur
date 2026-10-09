const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/database');
const { generateTokenPair } = require('../src/services/token.service');

const adminUser = {
  USUA_COD: 55, USUAR_NM: 'Admin', USUAR_EM: 'admin@cotatur.gob.ve',
  USUAR_RO: 55, TM_ROLES: { ROLE_COD: 55, ROLE_NOM: 'Administrador' },
};
const gestorUser = {
  USUA_COD: 59, USUAR_NM: 'Gestor', USUAR_EM: 'gestor@cotatur.gob.ve',
  USUAR_RO: 59, TM_ROLES: { ROLE_COD: 59, ROLE_NOM: 'Gestor Turístico' },
};
const prestadorUser = {
  USUA_COD: 60, USUAR_NM: 'Prest', USUAR_EM: 'prest@cotatur.gob.ve',
  USUAR_RO: 60, TM_ROLES: { ROLE_COD: 60, ROLE_NOM: 'Prestador Servicio' },
};

const headerFor = (u) => `Bearer ${generateTokenPair(u).accessToken}`;

describe('Validaciones Zod (422) + Roles (403)', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  test('POST /api/destinos sin campos retorna 422', async () => {
    const res = await request(app).post('/api/destinos').set('Authorization', headerFor(adminUser)).send({});
    expect(res.status).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('POST /api/destinos con prestador retorna 403', async () => {
    const res = await request(app).post('/api/destinos').set('Authorization', headerFor(prestadorUser)).send({
      nombre: 'X', tipoTurismoId: 1, municipioId: 1,
    });
    expect(res.status).toBe(403);
  });

  test('POST /api/destinos con gestor válido crea 201', async () => {
    prisma.tM_DESTI.create.mockResolvedValue({ DEST_COD: 1, DEST_NOM: 'Test' });
    const res = await request(app).post('/api/destinos').set('Authorization', headerFor(gestorUser)).send({
      nombre: 'Test', tipoTurismoId: 1, municipioId: 1,
    });
    expect(res.status).toBe(201);
  });

  test('POST /api/eventos fecha vacía retorna 422', async () => {
    const res = await request(app).post('/api/eventos').set('Authorization', headerFor(adminUser)).send({
      nombre: 'E', tipoEventoId: 1, destinoId: 1, fechaInicio: '',
    });
    expect(res.status).toBe(422);
  });

  test('POST /api/opiniones calificación 6 retorna 422', async () => {
    const res = await request(app).post('/api/opiniones').set('Authorization', headerFor(prestadorUser)).send({
      calificacion: 6, destinoId: 1,
    });
    expect(res.status).toBe(422);
  });

  test('POST /api/consultas vacía retorna 422', async () => {
    const res = await request(app).post('/api/consultas').send({ contenido: '' });
    expect(res.status).toBe(422);
  });

  test('PUT /api/usuarios con email inválido retorna 422', async () => {
    const res = await request(app).put('/api/usuarios/1').set('Authorization', headerFor(adminUser)).send({ email: 'no-es-email' });
    expect(res.status).toBe(422);
  });

  test('GET /api/usuarios con gestor retorna 403', async () => {
    const res = await request(app).get('/api/usuarios').set('Authorization', headerFor(gestorUser));
    expect(res.status).toBe(403);
  });

  test('POST /api/auth/login email malformado 422 (Zod)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x', password: 'y' });
    expect(res.status).toBe(422);
  });

  test('POST /api/auth/register password corta 422 (Zod)', async () => {
    const res = await request(app).post('/api/auth/register').send({ nombre: 'N', email: 'n@n.com', password: '123' });
    expect(res.status).toBe(422);
  });
});
