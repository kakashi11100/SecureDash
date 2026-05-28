// server/rbac.test.js
const request = require('supertest');
const app = require('./app'); // Accesses our running configuration

describe('SecureDash RBAC Boundary Control Test Suite', () => {
  let viewerToken = '';
  let analystToken = '';

  // Before running tests, log in to retrieve valid access tokens
  beforeAll(async () => {
    const viewerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@demo.com', password: 'demo1234' });
    viewerToken = viewerLogin.body.accessToken;

    const analystLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analyst@demo.com', password: 'demo1234' });
    analystToken = analystLogin.body.accessToken;
  });

  describe('Viewer Access Rights', () => {
    it('should ALLOW Viewer to access summary metrics data', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .set('Authorization', `Bearer ${viewerToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.scope).toBe('summary_restricted'); // Confirms scoped data filtering
    });
  });

  describe('Cross-Role Privilege Boundaries', () => {
    it('should REJECT an unauthenticated request with no bearer token', async () => {
      const response = await request(app).get('/api/metrics');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Access denied');
    });

    it('should REJECT a tampered, invalid access token', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .set('Authorization', 'Bearer complete_fake_token_string');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid or expired');
    });
  });
});