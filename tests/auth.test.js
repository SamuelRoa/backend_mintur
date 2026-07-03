const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/config/database');

const mockUser = {
  USUA_COD: 1,
  USUAR_NM: 'Admin Test',
  USUAR_EM: 'admin@cotatur.gob.ve',
  USUAR_PA: bcrypt.hashSync('password123', 12),
  USUAR_PO: 1,
  USUAR_FR: new Date(),
  USUAR_AC: true,
  USUAR_RO: 1,
  TM_ROLES: { ROLE_COD: 1, ROLE_NOM: 'Administrador' },
  TM_PAISE: { PAIS_NOM: 'Venezuela' },
};

describe('Auth Endpoints', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('POST /api/auth/login', () => {
    test('login exitoso retorna tokens', async () => {
      prisma.tM_USUAR.findUnique.mockResolvedValue(mockUser);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@cotatur.gob.ve', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.usuario.email).toBe('admin@cotatur.gob.ve');
    });

    test('credenciales inválidas retornan 401', async () => {
      prisma.tM_USUAR.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@email.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('email inválido retorna 422', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notanemail', password: 'password123' });
      expect(res.status).toBe(422);
    });

    test('usuario desactivado retorna 401', async () => {
      prisma.tM_USUAR.findUnique.mockResolvedValue({ ...mockUser, USUAR_AC: false });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@cotatur.gob.ve', password: 'password123' });
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('desactivada');
    });
  });

  describe('POST /api/auth/register', () => {
    test('registro exitoso desde panel retorna 201', async () => {
      prisma.tM_USUAR.findUnique.mockResolvedValue(null);
      prisma.tM_ROLES.findUnique.mockResolvedValue({ ROLE_COD: 59, ROLE_NOM: 'Gestor Turístico' });
      prisma.tM_USUAR.create.mockResolvedValue({
        USUA_COD: 2, USUAR_NM: 'Nuevo', USUAR_EM: 'nuevo@test.com',
        USUAR_RO: 59, USUAR_AC: true, USUAR_FR: new Date(),
      });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nombre: 'Nuevo Usuario', email: 'nuevo@test.com', password: 'password123', desdePanel: true });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.USUAR_RO).toBe(59);
    });

    test('email duplicado retorna 409', async () => {
      prisma.tM_USUAR.findUnique.mockResolvedValue(mockUser);
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nombre: 'Test', email: 'admin@cotatur.gob.ve', password: 'password123' });
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('refresh exitoso con token válido', async () => {
      const { generateTokenPair } = require('../src/services/token.service');
      const tokens = generateTokenPair(mockUser);
      prisma.tM_USUAR.findUnique.mockResolvedValue(mockUser);
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: tokens.refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    test('refresh sin token retorna 401', async () => {
      const res = await request(app).post('/api/auth/refresh').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    test('retorna perfil con token válido', async () => {
      const { generateTokenPair } = require('../src/services/token.service');
      const tokens = generateTokenPair(mockUser);
      prisma.tM_USUAR.findUnique.mockResolvedValue(mockUser);
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.USUAR_NM).toBe('Admin Test');
    });

    test('sin token retorna 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
