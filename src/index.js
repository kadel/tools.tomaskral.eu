const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const { router, toolsRegistry } = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root endpoint - render TOOLS.md as HTML
app.get('/', (req, res) => {
  try {
    const toolsPath = path.join(__dirname, '..', 'TOOLS.md');
    const markdownContent = fs.readFileSync(toolsPath, 'utf8');
    const htmlContent = marked(markdownContent);
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Tools API - tools.tomaskral.eu</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f8fafc;
        }
        
        .container {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #1a202c;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
        }
        
        h2 {
            color: #2d3748;
            margin-top: 2rem;
        }
        
        h3 {
            color: #4a5568;
        }
        
        code {
            background: #f7fafc;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        blockquote {
            border-left: 4px solid #4299e1;
            padding-left: 1rem;
            margin-left: 0;
            font-style: italic;
            color: #4a5568;
        }
        
        a {
            color: #4299e1;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        
        th, td {
            border: 1px solid #e2e8f0;
            padding: 0.5rem;
            text-align: left;
        }
        
        th {
            background: #f7fafc;
            font-weight: 600;
        }
        
        hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 2rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        ${htmlContent}
    </div>
</body>
</html>`;
    
    res.send(fullHtml);
  } catch (error) {
    console.error('Error reading TOOLS.md:', error);
    res.status(500).send('Error loading documentation');
  }
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

app.listen(PORT, () => {
  console.log(`Online Tools API running on port ${PORT}`);
  console.log(`Available at: http://localhost:${PORT}`);
});