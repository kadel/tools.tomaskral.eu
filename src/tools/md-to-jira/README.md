# Markdown to Jira Converter

Convert Markdown text to Jira wiki markup syntax.

## API Endpoint

```
POST /api/v1/md-to-jira
GET  /api/v1/md-to-jira?markdown={text}
```

## Supported Conversions

| Element | Markdown | Jira |
|---------|----------|------|
| Bold | `**text**` | `*text*` |
| Italic | `_text_` | `_text_` |
| Strikethrough | `~~text~~` | `-text-` |
| Inline code | `` `code` `` | `{{code}}` |
| Headers | `# H1` ... `###### H6` | `h1. H1` ... `h6. H6` |
| Links | `[text](url)` | `[text\|url]` |
| Images | `![alt](url)` | `!url\|alt=text!` |
| Blockquotes | `> text` | `bq. text` |
| Bullet lists | `- item` | `* item` |
| Numbered lists | `1. item` | `# item` |
| Code blocks | ` ```lang ` | `{code:lang}` |
| Horizontal rule | `---` | `----` |
| Tables | Markdown tables | Jira tables |

## Examples

### cURL

```bash
# POST request
curl -X POST https://tools.tomaskral.eu/api/v1/md-to-jira \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello\n\n**Bold** and _italic_ text"}'

# GET request
curl "https://tools.tomaskral.eu/api/v1/md-to-jira?markdown=**bold**"
```

### JavaScript

```javascript
const response = await fetch('/api/v1/md-to-jira', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markdown: '# Hello World' })
});
const data = await response.json();
console.log(data.jira); // "h1. Hello World"
```

## Request Body

```json
{
  "markdown": "# Your markdown here"
}
```

## Response

```json
{
  "jira": "h1. Your markdown here"
}
```

## Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Markdown text is required | No markdown provided |
| 500 | Internal server error | Server error |
