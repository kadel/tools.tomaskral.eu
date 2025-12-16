/**
 * Markdown to Jira Markup Converter
 * Converts GitHub-flavored Markdown to Jira wiki markup syntax
 */

/**
 * Convert Markdown text to Jira markup
 * @param {string} markdown - The Markdown text to convert
 * @returns {string} - The converted Jira markup
 */
function convertMarkdownToJira(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  let result = markdown;

  // Step 1: Extract and protect code blocks from transformation
  // Store code blocks with placeholders to restore later
  const codeBlocks = [];
  const codePlaceholder = '\u0000CODE_BLOCK_';

  // Fenced code blocks with language: ```lang ... ```
  result = result.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    if (lang) {
      codeBlocks.push(`{code:${lang}}\n${code.trimEnd()}\n{code}`);
    } else {
      codeBlocks.push(`{code}\n${code.trimEnd()}\n{code}`);
    }
    return `${codePlaceholder}${index}\u0000`;
  });

  // Inline code: `code` -> {{code}} (also protect from further transformation)
  const inlineCodes = [];
  const inlinePlaceholder = '\u0000INLINE_CODE_';
  result = result.replace(/`([^`\n]+)`/g, (match, code) => {
    const index = inlineCodes.length;
    inlineCodes.push(`{{${code}}}`);
    return `${inlinePlaceholder}${index}\u0000`;
  });

  // Headers: # Header -> h1. Header
  result = result.replace(/^######\s+(.+)$/gm, 'h6. $1');
  result = result.replace(/^#####\s+(.+)$/gm, 'h5. $1');
  result = result.replace(/^####\s+(.+)$/gm, 'h4. $1');
  result = result.replace(/^###\s+(.+)$/gm, 'h3. $1');
  result = result.replace(/^##\s+(.+)$/gm, 'h2. $1');
  result = result.replace(/^#\s+(.+)$/gm, 'h1. $1');

  // Bold and Italic handling - use placeholders to avoid conflicts
  // Step 1: Temporarily replace **text** with placeholder
  const boldPlaceholder = '\u0000JIRA_BOLD\u0000';
  result = result.replace(/\*\*(.+?)\*\*/g, `${boldPlaceholder}$1${boldPlaceholder}`);
  result = result.replace(/__(.+?)__/g, `${boldPlaceholder}$1${boldPlaceholder}`);

  // Step 2: Convert Markdown italic *text* to Jira _text_
  result = result.replace(/(?<![*\w])\*(?!\*)([^*]+?)\*(?!\*)/g, '_$1_');

  // Step 3: Replace bold placeholders with Jira bold *text*
  result = result.replace(new RegExp(boldPlaceholder, 'g'), '*');

  // Strikethrough: ~~text~~ -> -text-
  result = result.replace(/~~(.+?)~~/g, '-$1-');

  // Images: ![alt](url) -> !url!
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    if (alt) {
      return `!${url}|alt=${alt}!`;
    }
    return `!${url}!`;
  });

  // Links: [text](url) -> [text|url]
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]');

  // Blockquotes: > text -> bq. text
  result = result.replace(/^>\s+(.+)$/gm, 'bq. $1');

  // Horizontal rules: --- or *** or ___ -> ----
  result = result.replace(/^([-*_]){3,}\s*$/gm, '----');

  // Unordered lists with nesting
  // Handle up to 4 levels of nesting
  result = result.replace(/^(\s*)[-*+]\s+(.+)$/gm, (match, indent, content) => {
    const spaces = indent.length;
    const level = Math.floor(spaces / 2) + 1;
    const asterisks = '*'.repeat(Math.min(level, 4));
    return `${asterisks} ${content}`;
  });

  // Ordered lists with nesting
  result = result.replace(/^(\s*)\d+\.\s+(.+)$/gm, (match, indent, content) => {
    const spaces = indent.length;
    const level = Math.floor(spaces / 2) + 1;
    const hashes = '#'.repeat(Math.min(level, 4));
    return `${hashes} ${content}`;
  });

  // Tables
  result = convertTables(result);

  // Step 2: Restore inline code blocks
  inlineCodes.forEach((code, index) => {
    result = result.replace(`${inlinePlaceholder}${index}\u0000`, code);
  });

  // Step 3: Restore fenced code blocks
  codeBlocks.forEach((code, index) => {
    result = result.replace(`${codePlaceholder}${index}\u0000`, code);
  });

  return result;
}

/**
 * Convert Markdown tables to Jira tables
 * @param {string} text - Text containing Markdown tables
 * @returns {string} - Text with converted Jira tables
 */
function convertTables(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this is a table header row (starts with |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // Check if next line is a separator row
      if (i + 1 < lines.length && /^\|[\s:-]+\|/.test(lines[i + 1])) {
        // This is a Markdown table
        // Convert header row: | H1 | H2 | -> ||H1||H2||
        const headerCells = line.split('|').filter(cell => cell.trim() !== '');
        const jiraHeader = '||' + headerCells.map(cell => cell.trim()).join('||') + '||';
        result.push(jiraHeader);

        // Skip the separator row
        i += 2;

        // Convert data rows: | D1 | D2 | -> |D1|D2|
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          const dataCells = lines[i].split('|').filter(cell => cell.trim() !== '');
          const jiraRow = '|' + dataCells.map(cell => cell.trim()).join('|') + '|';
          result.push(jiraRow);
          i++;
        }
        continue;
      }
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

/**
 * Express handler for markdown to Jira conversion
 */
async function mdToJira(req, res) {
  try {
    // Support both POST body and GET query parameter
    const markdown = req.body?.markdown || req.body?.text || req.query.markdown || req.query.text;

    if (!markdown) {
      return res.status(400).json({
        error: 'Markdown text is required',
        message: 'Please provide markdown text as query parameter (?markdown=...) or in POST body'
      });
    }

    const jiraMarkup = convertMarkdownToJira(markdown);

    res.json({
      jira: jiraMarkup
    });

  } catch (error) {
    console.error('Markdown to Jira conversion error:', error.message);

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during conversion'
    });
  }
}

module.exports = { mdToJira, convertMarkdownToJira };
