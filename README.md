# Online Tools API

A simple REST API providing useful online tools. Single Node.js container for easy deployment.

## Available Tools

### YAML to JSON Converter
- **Endpoints**: `GET /yaml-to-json?url=...` or `POST /yaml-to-json`
- **Input**: Query parameter `url` or JSON body `{"url": "https://example.com/file.yaml"}`
- **Output**: JSON equivalent of the YAML content

## Usage

### Local Development
```bash
npm install
npm run dev
```

### Docker
```bash
# Build the image
docker build -t tools-api .

# Run the container
docker run -p 3000:3000 tools-api

# Run in background
docker run -d -p 3000:3000 --name tools-api tools-api

# Stop the container
docker stop tools-api
docker rm tools-api
```

### API Examples
```bash
# Get API documentation
curl http://localhost:3000/

# Convert YAML to JSON (GET with query parameter)
curl "http://localhost:3000/yaml-to-json?url=https://raw.githubusercontent.com/example/repo/main/config.yaml"

# Convert YAML to JSON (POST with JSON body)
curl -X POST http://localhost:3000/yaml-to-json \
  -H "Content-Type: application/json" \
  -d '{"url": "https://raw.githubusercontent.com/example/repo/main/config.yaml"}'

# Health check
curl http://localhost:3000/health
```

## Adding New Tools

1. Create a new tool file in `src/tools/`
2. Export the handler function
3. Add the route to `src/routes.js`
4. Update the toolsRegistry for documentation

Example tool (`src/tools/my-tool.js`):

```javascript
async function myTool(req, res) {
  // Tool implementation
  res.json({ result: 'success' });
}

module.exports = { myTool };
```

Add to routes (`src/routes.js`):

```javascript
const { myTool } = require('./tools/my-tool');

router.post('/my-tool', myTool);

// Add to toolsRegistry
const toolsRegistry = {
  // ... existing tools
  '/my-tool': {
    method: 'POST',
    description: 'Description of my tool',
    payload: { input: 'string' }
  }
};
```

## Project Structure

```
.
├── README.md
├── package.json
├── Dockerfile
└── src/
    ├── index.js            # Main application
    ├── routes.js           # Route definitions
    └── tools/
        └── yaml-to-json.js # Tool implementations
```