# Adding New Tools

## Steps

1. Create a new directory `src/tools/<tool-name>/`
2. Add `index.js` with the API handler
3. Add `index.html` with the tool UI (form + JavaScript)
4. Add `README.md` documenting the tool
5. Register the route in `src/routes/api.js`
6. Add tool card to `src/public/index.html`

## Directory Structure

```
src/tools/
└── my-tool/
    ├── index.js      # API handler
    ├── index.html    # Tool UI page with form
    └── README.md     # Documentation
```

## Example API Handler

```javascript
// src/tools/my-tool/index.js
async function myTool(req, res) {
  try {
    const input = req.body?.input || req.query.input;

    if (!input) {
      return res.status(400).json({
        error: 'Input is required',
        message: 'Please provide input as query parameter or in POST body'
      });
    }

    // Process input
    const result = processInput(input);

    res.json({ result });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

module.exports = { myTool };
```

## Registering the Route

```javascript
// src/routes/api.js
const { myTool } = require('../tools/my-tool');

router.post('/my-tool', myTool);
router.get('/my-tool', myTool);
```

## Tool UI Template

Create `src/tools/my-tool/index.html` with:
- Tool name and description
- HTML form with inputs
- JavaScript to submit via fetch to `/api/v1/my-tool`
- Result display area
- Copy button for results
- Link back to homepage

See existing tools for reference:
- `src/tools/md-to-jira/index.html`
- `src/tools/yaml-to-json/index.html`

## Adding to Homepage

Add a tool card to `src/public/index.html`:

```html
<div class="tool-card">
    <h2><a href="/my-tool">My Tool Name</a></h2>
    <p>Short description of what the tool does.</p>
    <span class="api-path">API: /api/v1/my-tool</span>
</div>
```
