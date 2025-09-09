const express = require('express');
const cors = require('cors');
const { router, toolsRegistry } = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Online Tools API',
    version: '1.0.0',
    description: 'Collection of useful online tools and APIs',
    tools: toolsRegistry,
    usage: {
      example: 'curl -X POST http://localhost:3000/yaml-to-json -H "Content-Type: application/json" -d \'{"url": "https://example.com/file.yaml"}\''
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
  const availableEndpoints = ['/', '/health', ...Object.keys(toolsRegistry)];
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints
  });
});

app.listen(PORT, () => {
  console.log(`Online Tools API running on port ${PORT}`);
  console.log(`Available at: http://localhost:${PORT}`);
});