const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { router } = require('../src/routes');

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

// Mock HTTP server for serving test YAML files
const http = require('http');
const url = require('url');

let mockServer;
let mockServerPort = 0;

// Test YAML content
const validYaml = `
name: test-project
version: 1.0.0
description: A test YAML file
dependencies:
  - express
  - cors
config:
  port: 3000
  debug: true
`;

const invalidYaml = `
name: test
invalid: [
  - missing bracket
`;

beforeAll((done) => {
  // Start mock HTTP server
  mockServer = http.createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    
    res.setHeader('Content-Type', 'text/yaml');
    
    if (pathname === '/valid.yaml') {
      res.writeHead(200);
      res.end(validYaml);
    } else if (pathname === '/invalid.yaml') {
      res.writeHead(200);
      res.end(invalidYaml);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  mockServer.listen(0, () => {
    mockServerPort = mockServer.address().port;
    done();
  });
});

afterAll((done) => {
  mockServer.close(done);
});

describe('YAML to JSON Converter', () => {
  describe('GET /yaml-to-json', () => {
    test('should convert valid YAML to JSON', async () => {
      const response = await request(app)
        .get(`/yaml-to-json?url=http://localhost:${mockServerPort}/valid.yaml`)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        name: 'test-project',
        version: '1.0.0',
        description: 'A test YAML file',
        dependencies: ['express', 'cors'],
        config: {
          port: 3000,
          debug: true
        }
      });
    });

    test('should return 400 when URL parameter is missing', async () => {
      const response = await request(app)
        .get('/yaml-to-json')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('URL is required');
    });

    test('should return 400 when URL is invalid', async () => {
      const response = await request(app)
        .get('/yaml-to-json?url=invalid-url')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid URL format');
    });

    test('should return 404 when URL returns 404', async () => {
      const response = await request(app)
        .get(`/yaml-to-json?url=http://localhost:${mockServerPort}/nonexistent.yaml`)
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('HTTP 404');
    });

    test('should return 422 when YAML is invalid', async () => {
      const response = await request(app)
        .get(`/yaml-to-json?url=http://localhost:${mockServerPort}/invalid.yaml`)
        .expect(422)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid YAML format');
    });

    test('should return 404 when host is unreachable', async () => {
      const response = await request(app)
        .get('/yaml-to-json?url=http://nonexistent-host-12345.com/test.yaml')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Unable to fetch URL');
    });
  });

  describe('POST /yaml-to-json', () => {
    test('should convert valid YAML to JSON via POST', async () => {
      const response = await request(app)
        .post('/yaml-to-json')
        .send({ url: `http://localhost:${mockServerPort}/valid.yaml` })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        name: 'test-project',
        version: '1.0.0',
        description: 'A test YAML file',
        dependencies: ['express', 'cors'],
        config: {
          port: 3000,
          debug: true
        }
      });
    });

    test('should return 400 when URL is missing in POST body', async () => {
      const response = await request(app)
        .post('/yaml-to-json')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('URL is required');
    });

    test('should return 400 when URL is invalid in POST body', async () => {
      const response = await request(app)
        .post('/yaml-to-json')
        .send({ url: 'invalid-url' })
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid URL format');
    });
  });
});