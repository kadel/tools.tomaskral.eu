const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
  describe('GET /', () => {
    test('should return HTML homepage', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Online Tools');
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Tool pages', () => {
    test('should return md-to-jira tool page', async () => {
      const response = await request(app)
        .get('/md-to-jira')
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Markdown to Jira');
    });

    test('should return yaml-to-json tool page', async () => {
      const response = await request(app)
        .get('/yaml-to-json')
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('YAML to JSON');
    });

    test('should return 404 for nonexistent tool', async () => {
      const response = await request(app)
        .get('/nonexistent-tool')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });

  describe('GET /nonexistent', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/some/random/path')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('availableEndpoints');
      expect(response.body.availableEndpoints).toContain('/');
      expect(response.body.availableEndpoints).toContain('/health');
      expect(response.body.availableEndpoints).toContain('/api/v1/yaml-to-json');
      expect(response.body.availableEndpoints).toContain('/api/v1/md-to-jira');
    });
  });

  describe('CORS', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/v1/yaml-to-json')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });
});
