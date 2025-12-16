# YAML to JSON Converter

Convert YAML content to JSON format - from a URL or paste directly.

## API Endpoint

```
POST /api/v1/yaml-to-json
GET  /api/v1/yaml-to-json?url={yaml_url}
GET  /api/v1/yaml-to-json?yaml={yaml_content}
```

## Input Options

You can provide YAML content in two ways:

| Parameter | Description |
|-----------|-------------|
| `url` | URL pointing to a YAML file |
| `yaml` | YAML content as a string |

If both are provided, `yaml` takes precedence.

## Examples

### From URL

#### cURL

```bash
# POST request with URL
curl -X POST https://tools.tomaskral.eu/api/v1/yaml-to-json \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/config.yaml"}'

# GET request with URL
curl "https://tools.tomaskral.eu/api/v1/yaml-to-json?url=https://example.com/config.yaml"
```

#### JavaScript

```javascript
const response = await fetch('/api/v1/yaml-to-json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com/config.yaml' })
});
const data = await response.json();
console.log(data);
```

### From YAML String

#### cURL

```bash
# POST request with YAML content
curl -X POST https://tools.tomaskral.eu/api/v1/yaml-to-json \
  -H "Content-Type: application/json" \
  -d '{"yaml": "name: my-project\nversion: 1.0.0\ndependencies:\n  - express\n  - cors"}'
```

#### JavaScript

```javascript
const yaml = `
name: my-project
version: 1.0.0
dependencies:
  - express
  - cors
`;

const response = await fetch('/api/v1/yaml-to-json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ yaml })
});
const data = await response.json();
console.log(data);
// { name: 'my-project', version: '1.0.0', dependencies: ['express', 'cors'] }
```

## Response

Returns the converted JSON directly (not wrapped):

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": ["express", "cors"]
}
```

## Example URLs

- Docker Compose: `https://raw.githubusercontent.com/docker/compose/v2/docs/reference/compose_spec.yaml`
- Kubernetes: `https://raw.githubusercontent.com/kubernetes/examples/master/guestbook/frontend-deployment.yaml`
- GitHub Actions: `https://raw.githubusercontent.com/actions/starter-workflows/main/ci/node.js.yml`

## Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | URL or YAML content is required | No input provided |
| 400 | Invalid URL format | Malformed URL |
| 404 | Unable to fetch URL | Host unreachable |
| 404 | HTTP 404 | Resource not found |
| 422 | Invalid YAML format | YAML parsing failed |
| 500 | Internal server error | Server error |
