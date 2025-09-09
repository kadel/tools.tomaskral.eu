const express = require('express');
const { yamlToJson } = require('./tools/yaml-to-json');

const router = express.Router();

// Tool routes
router.post('/yaml-to-json', yamlToJson);
router.get('/yaml-to-json', yamlToJson);

// Tools registry for documentation
const toolsRegistry = {
  '/yaml-to-json': {
    methods: ['GET', 'POST'],
    description: 'Convert YAML from URL to JSON',
    usage: {
      GET: 'Query parameter: ?url=https://example.com/file.yaml',
      POST: 'JSON body: {"url": "https://example.com/file.yaml"}'
    },
    example: {
      url: 'https://raw.githubusercontent.com/example/repo/main/config.yaml'
    }
  }
};

module.exports = { router, toolsRegistry };