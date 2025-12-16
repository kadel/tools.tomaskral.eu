const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from public directory (homepage)
app.use(express.static(path.join(__dirname, 'public')));

// API routes under /api/v1
app.use('/api/v1', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Serve tool README files (for dynamic loading in UI)
app.get('/:tool/readme', (req, res) => {
  const toolName = req.params.tool;
  const readmePath = path.join(__dirname, 'tools', toolName, 'README.md');

  if (fs.existsSync(readmePath)) {
    res.type('text/markdown').sendFile(readmePath);
  } else {
    res.status(404).json({
      error: 'Not found',
      message: `README for "${toolName}" does not exist`
    });
  }
});

// Serve tool pages
app.get('/:tool', (req, res) => {
  const toolName = req.params.tool;
  const toolPath = path.join(__dirname, 'tools', toolName, 'index.html');

  if (fs.existsSync(toolPath)) {
    res.sendFile(toolPath);
  } else {
    res.status(404).json({
      error: 'Not found',
      message: `Tool "${toolName}" does not exist`
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      '/',
      '/health',
      '/yaml-to-json',
      '/md-to-jira',
      '/api/v1/yaml-to-json',
      '/api/v1/md-to-jira'
    ]
  });
});

// Only start server if this file is run directly (not imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Online Tools API running on port ${PORT}`);
    console.log(`Available at: http://localhost:${PORT}`);
  });
}

module.exports = app;
