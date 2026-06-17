const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /api/health returns 200 with API info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('COTATUR');
    expect(res.body.environment).toBe('test');
  });

  test('GET /api/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
