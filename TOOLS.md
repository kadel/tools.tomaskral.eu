# Online Tools API

Collection of useful online tools and APIs running at [tools.tomaskral.eu](https://tools.tomaskral.eu)

## Available Tools

### 🔄 YAML to JSON Converter

Convert YAML content from any URL to JSON format.

**Endpoints:**
- `GET https://tools.tomaskral.eu/yaml-to-json?url={yaml_url}`
- `POST https://tools.tomaskral.eu/yaml-to-json`

**GET Request Example:**
```bash
curl "https://tools.tomaskral.eu/yaml-to-json?url=https://example.com/config.yaml"
```

**POST Request Example:**
```bash
curl -X POST https://tools.tomaskral.eu/yaml-to-json \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/config.yaml"}'
```

**Success Response:**
Returns the converted JSON directly without wrapping:
```json
{
  "name": "example",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing or invalid URL
- **404 Not Found:** URL could not be reached
- **422 Unprocessable Entity:** Invalid YAML content
- **500 Internal Server Error:** Server error

Error format:
```json
{
  "error": "Invalid YAML format",
  "message": "The content at the provided URL is not valid YAML"
}
```

## API Information

**Base URL:** `https://tools.tomaskral.eu`

**Available Endpoints:**
- `/` - This documentation page
- `/api` - JSON API metadata
- `/health` - Health check endpoint
- `/yaml-to-json` - YAML to JSON converter

**Health Check:**
```bash
curl https://tools.tomaskral.eu/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-09T12:00:00.000Z"
}
```

## Usage Examples

### Test with Docker Compose YAML
```bash
curl "https://tools.tomaskral.eu/yaml-to-json?url=https://raw.githubusercontent.com/docker/compose/v2/docs/reference/compose_spec.yaml"
```

### Test with Kubernetes YAML
```bash
curl "https://tools.tomaskral.eu/yaml-to-json?url=https://raw.githubusercontent.com/kubernetes/examples/master/guestbook/frontend-deployment.yaml"
```

### Test with GitHub Actions YAML
```bash
curl "https://tools.tomaskral.eu/yaml-to-json?url=https://raw.githubusercontent.com/actions/starter-workflows/main/ci/node.js.yml"
```

## HTTP Status Codes

The API uses proper HTTP status codes:

- **200 OK:** Successful conversion, returns clean JSON
- **400 Bad Request:** Invalid URL format or missing URL parameter
- **404 Not Found:** URL could not be reached
- **422 Unprocessable Entity:** Invalid YAML content
- **500 Internal Server Error:** Unexpected server errors

All errors return JSON with `error` and `message` fields for debugging.

## Rate Limiting

Currently no rate limiting is implemented. Please use responsibly.

## Contributing

This is an open-source project. To add new tools:

1. Create a new tool file in `src/tools/`
2. Export the handler function
3. Add the route to `src/routes.js`
4. Update this documentation

---

*API by Tomas Kral* • [Health Check](https://tools.tomaskral.eu/health) • [JSON API Info](https://tools.tomaskral.eu/api)