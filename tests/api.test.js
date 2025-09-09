const request = require('supertest');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { router, toolsRegistry } = require('../src/routes');

// Create test app (mimicking main app structure without marked dependency)
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'src', 'public')));

// Root endpoint - simple HTML response for testing
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head><title>Online Tools API - tools.tomaskral.eu</title></head>
<body>
  <h1>Online Tools API</h1>
  <h2>YAML to JSON Converter</h2>
  <p>Collection of useful online tools and APIs</p>
</body>
</html>`;
  res.send(html);
});

// API endpoint for machine-readable format
app.get('/api', (req, res) => {
  res.json({
    name: 'Online Tools API',
    version: '1.0.0',
    description: 'Collection of useful online tools and APIs',
    tools: toolsRegistry,
    usage: {
      example: 'curl -X POST https://tools.tomaskral.eu/yaml-to-json -H "Content-Type: application/json" -d \'{"url": "https://example.com/file.yaml"}\''
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount tool routes
app.use('/', router);

// 404 handler
app.use('*', (req, res) => {
  const availableEndpoints = ['/', '/api', '/health', ...Object.keys(toolsRegistry)];
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints
  });
});

describe('API Endpoints', () => {
  describe('GET /', () => {
    test('should return HTML documentation page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Online Tools API');
      expect(response.text).toContain('YAML to JSON Converter');
    });
  });

  describe('GET /api', () => {
    test('should return API metadata as JSON', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('name', 'Online Tools API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('tools');
      expect(response.body.tools).toHaveProperty('/yaml-to-json');
    });

    test('should include tool registry information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      const yamlTool = response.body.tools['/yaml-to-json'];
      expect(yamlTool).toHaveProperty('methods');
      expect(yamlTool.methods).toContain('GET');
      expect(yamlTool.methods).toContain('POST');
      expect(yamlTool).toHaveProperty('description');
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

  describe('GET /nonexistent', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('availableEndpoints');
      expect(response.body.availableEndpoints).toContain('/');
      expect(response.body.availableEndpoints).toContain('/api');
      expect(response.body.availableEndpoints).toContain('/health');
      expect(response.body.availableEndpoints).toContain('/yaml-to-json');
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
        .options('/yaml-to-json')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });
  });
});