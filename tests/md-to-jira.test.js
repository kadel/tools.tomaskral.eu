const request = require('supertest');
const express = require('express');
const cors = require('cors');
const apiRouter = require('../src/routes/api');
const { convertMarkdownToJira } = require('../src/tools/md-to-jira');

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1', apiRouter);

describe('Markdown to Jira Converter', () => {
  describe('convertMarkdownToJira function', () => {
    describe('Text formatting', () => {
      test('should convert bold with double asterisks', () => {
        expect(convertMarkdownToJira('**bold text**')).toBe('*bold text*');
      });

      test('should convert bold with double underscores', () => {
        expect(convertMarkdownToJira('__bold text__')).toBe('*bold text*');
      });

      test('should convert italic with single asterisks', () => {
        expect(convertMarkdownToJira('*italic text*')).toBe('_italic text_');
      });

      test('should convert italic with single underscores', () => {
        expect(convertMarkdownToJira('_italic text_')).toBe('_italic text_');
      });

      test('should convert strikethrough', () => {
        expect(convertMarkdownToJira('~~strikethrough~~')).toBe('-strikethrough-');
      });

      test('should convert inline code', () => {
        expect(convertMarkdownToJira('`inline code`')).toBe('{{inline code}}');
      });

      test('should handle mixed bold and italic', () => {
        expect(convertMarkdownToJira('**bold** and *italic*')).toBe('*bold* and _italic_');
      });
    });

    describe('Headers', () => {
      test('should convert h1', () => {
        expect(convertMarkdownToJira('# Heading 1')).toBe('h1. Heading 1');
      });

      test('should convert h2', () => {
        expect(convertMarkdownToJira('## Heading 2')).toBe('h2. Heading 2');
      });

      test('should convert h3', () => {
        expect(convertMarkdownToJira('### Heading 3')).toBe('h3. Heading 3');
      });

      test('should convert h4', () => {
        expect(convertMarkdownToJira('#### Heading 4')).toBe('h4. Heading 4');
      });

      test('should convert h5', () => {
        expect(convertMarkdownToJira('##### Heading 5')).toBe('h5. Heading 5');
      });

      test('should convert h6', () => {
        expect(convertMarkdownToJira('###### Heading 6')).toBe('h6. Heading 6');
      });
    });

    describe('Links and Images', () => {
      test('should convert links', () => {
        expect(convertMarkdownToJira('[link text](https://example.com)'))
          .toBe('[link text|https://example.com]');
      });

      test('should convert images', () => {
        expect(convertMarkdownToJira('![alt text](https://example.com/img.png)'))
          .toBe('!https://example.com/img.png|alt=alt text!');
      });

      test('should convert images without alt text', () => {
        expect(convertMarkdownToJira('![](https://example.com/img.png)'))
          .toBe('!https://example.com/img.png!');
      });
    });

    describe('Lists', () => {
      test('should convert unordered list with dash', () => {
        expect(convertMarkdownToJira('- list item')).toBe('* list item');
      });

      test('should convert unordered list with asterisk', () => {
        expect(convertMarkdownToJira('* list item')).toBe('* list item');
      });

      test('should convert unordered list with plus', () => {
        expect(convertMarkdownToJira('+ list item')).toBe('* list item');
      });

      test('should convert ordered list', () => {
        expect(convertMarkdownToJira('1. numbered item')).toBe('# numbered item');
      });

      test('should convert nested unordered list', () => {
        const input = '- item 1\n  - nested item';
        const expected = '* item 1\n** nested item';
        expect(convertMarkdownToJira(input)).toBe(expected);
      });

      test('should convert nested ordered list', () => {
        const input = '1. item 1\n  1. nested item';
        const expected = '# item 1\n## nested item';
        expect(convertMarkdownToJira(input)).toBe(expected);
      });
    });

    describe('Code blocks', () => {
      test('should convert fenced code block with language', () => {
        const input = '```javascript\nconst x = 1;\n```';
        const expected = '{code:javascript}\nconst x = 1;\n{code}';
        expect(convertMarkdownToJira(input)).toBe(expected);
      });

      test('should convert fenced code block without language', () => {
        const input = '```\nconst x = 1;\n```';
        const expected = '{code}\nconst x = 1;\n{code}';
        expect(convertMarkdownToJira(input)).toBe(expected);
      });

      test('should not modify markdown syntax inside code blocks', () => {
        const input = '```\n# Not a heading\n**not bold**\n- not a list\n```';
        const expected = '{code}\n# Not a heading\n**not bold**\n- not a list\n{code}';
        expect(convertMarkdownToJira(input)).toBe(expected);
      });

      test('should not modify markdown syntax inside inline code', () => {
        const input = 'Use `**bold**` for bold';
        const result = convertMarkdownToJira(input);
        expect(result).toBe('Use {{**bold**}} for bold');
      });
    });

    describe('Other elements', () => {
      test('should convert blockquote', () => {
        expect(convertMarkdownToJira('> blockquote text')).toBe('bq. blockquote text');
      });

      test('should convert horizontal rule with dashes', () => {
        expect(convertMarkdownToJira('---')).toBe('----');
      });

      test('should convert horizontal rule with asterisks', () => {
        expect(convertMarkdownToJira('***')).toBe('----');
      });

      test('should convert horizontal rule with underscores', () => {
        expect(convertMarkdownToJira('___')).toBe('----');
      });
    });

    describe('Tables', () => {
      test('should convert simple table', () => {
        const input = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell A | Cell B |';
        const expected = '||Header 1||Header 2||\n|Cell A|Cell B|';
        expect(convertMarkdownToJira(input)).toBe(expected);
      });

      test('should convert table with multiple rows', () => {
        const input = '| H1 | H2 |\n|---|---|\n| A | B |\n| C | D |';
        const expected = '||H1||H2||\n|A|B|\n|C|D|';
        expect(convertMarkdownToJira(input)).toBe(expected);
      });
    });

    describe('Edge cases', () => {
      test('should handle empty string', () => {
        expect(convertMarkdownToJira('')).toBe('');
      });

      test('should handle null input', () => {
        expect(convertMarkdownToJira(null)).toBe('');
      });

      test('should handle undefined input', () => {
        expect(convertMarkdownToJira(undefined)).toBe('');
      });

      test('should handle plain text without markdown', () => {
        expect(convertMarkdownToJira('plain text')).toBe('plain text');
      });
    });

    describe('Complex documents', () => {
      test('should convert a complete markdown document', () => {
        const input = `# Title

This is **bold** and *italic* text.

## Features
- Feature 1
- Feature 2

\`\`\`javascript
const x = 1;
\`\`\`

> A quote

[Link](https://example.com)`;

        const expected = `h1. Title

This is *bold* and _italic_ text.

h2. Features
* Feature 1
* Feature 2

{code:javascript}
const x = 1;
{code}

bq. A quote

[Link|https://example.com]`;

        expect(convertMarkdownToJira(input)).toBe(expected);
      });
    });
  });

  describe('GET /api/v1/md-to-jira', () => {
    test('should convert markdown via query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/md-to-jira?markdown=**bold**')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ jira: '*bold*' });
    });

    test('should accept text as query parameter alias', async () => {
      const response = await request(app)
        .get('/api/v1/md-to-jira?text=**bold**')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ jira: '*bold*' });
    });

    test('should return 400 when markdown is missing', async () => {
      const response = await request(app)
        .get('/api/v1/md-to-jira')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Markdown text is required');
    });
  });

  describe('POST /api/v1/md-to-jira', () => {
    test('should convert markdown via POST body', async () => {
      const response = await request(app)
        .post('/api/v1/md-to-jira')
        .send({ markdown: '# Hello\n\n**Bold** text' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ jira: 'h1. Hello\n\n*Bold* text' });
    });

    test('should accept text as POST body alias', async () => {
      const response = await request(app)
        .post('/api/v1/md-to-jira')
        .send({ text: '**bold**' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ jira: '*bold*' });
    });

    test('should return 400 when markdown is missing in POST body', async () => {
      const response = await request(app)
        .post('/api/v1/md-to-jira')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Markdown text is required');
    });

    test('should handle complex markdown document', async () => {
      const markdown = `## Summary
- Item 1
- Item 2

\`\`\`python
print("hello")
\`\`\``;

      const expectedJira = `h2. Summary
* Item 1
* Item 2

{code:python}
print("hello")
{code}`;

      const response = await request(app)
        .post('/api/v1/md-to-jira')
        .send({ markdown })
        .expect(200);

      expect(response.body.jira).toBe(expectedJira);
    });
  });
});
