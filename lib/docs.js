const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { safeJsonParse } = require('./security');

const COLLECTION_DIR = path.join(process.cwd(), '.devapi');

/**
 * Generate API documentation from collections
 * @param {string} outputFile - Output file path
 * @param {string} format - Documentation format (markdown or html)
 */
function generateDocs(outputFile, format = 'markdown') {
  // Validate output file path - only allow writing to current directory
  const resolvedPath = path.resolve(process.cwd(), outputFile);
  const cwd = path.resolve(process.cwd());

  // Security check: ensure file is within current working directory
  if (!resolvedPath.startsWith(cwd + path.sep) && resolvedPath !== cwd) {
    throw new Error('Access denied: output file must be in current directory');
  }

  // Validate file extension
  const allowedExtensions = ['.md', '.html', '.txt'];
  const ext = path.extname(outputFile).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Invalid output file extension: only .md, .html, and .txt are allowed');
  }

  if (!fs.existsSync(COLLECTION_DIR)) {
    throw new Error('No collections found. Save some requests first.');
  }

  const files = fs.readdirSync(COLLECTION_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    throw new Error('No collections found. Save some requests first.');
  }

  const collections = [];
  files.forEach(file => {
    const filePath = path.join(COLLECTION_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const request = safeJsonParse(content);
    const name = path.basename(file, '.json');
    collections.push({ name, ...request });
  });

  let documentation;
  if (format === 'html') {
    documentation = generateHTMLDocs(collections);
  } else {
    documentation = generateMarkdownDocs(collections);
  }

  fs.writeFileSync(resolvedPath, documentation);
}

/**
 * Generate Markdown documentation
 * @param {array} collections - Array of collection objects
 * @returns {string} Markdown documentation
 */
function generateMarkdownDocs(collections) {
  let md = '# API Documentation\n\n';
  md += `Generated on: ${new Date().toLocaleString()}\n\n`;
  md += '## Table of Contents\n\n';

  collections.forEach((col, idx) => {
    md += `${idx + 1}. [${col.name}](#${col.name.toLowerCase().replace(/\s+/g, '-')})\n`;
  });

  md += '\n---\n\n';

  collections.forEach(col => {
    md += `## ${col.name}\n\n`;
    md += `**Method:** \`${col.method}\`\n\n`;
    md += `**URL:** \`${col.url}\`\n\n`;

    if (col.headers && Object.keys(col.headers).length > 0) {
      md += '**Headers:**\n\n';
      md += '```json\n';
      md += JSON.stringify(col.headers, null, 2);
      md += '\n```\n\n';
    }

    if (col.data) {
      md += '**Request Body:**\n\n';
      md += '```json\n';
      md += typeof col.data === 'string' ? col.data : JSON.stringify(col.data, null, 2);
      md += '\n```\n\n';
    }

    if (col.timestamp) {
      md += `**Last Updated:** ${new Date(col.timestamp).toLocaleString()}\n\n`;
    }

    md += '---\n\n';
  });

  return md;
}

/**
 * Generate HTML documentation
 * @param {array} collections - Array of collection objects
 * @returns {string} HTML documentation
 */
function generateHTMLDocs(collections) {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #007acc;
            padding-bottom: 10px;
        }
        h2 {
            color: #007acc;
            margin-top: 30px;
        }
        .endpoint {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .method {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            color: white;
            font-size: 14px;
        }
        .get { background-color: #61affe; }
        .post { background-color: #49cc90; }
        .put { background-color: #fca130; }
        .delete { background-color: #f93e3e; }
        .patch { background-color: #50e3c2; }
        .url {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            margin: 10px 0;
            word-break: break-all;
        }
        pre {
            background-color: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <h1>API Documentation</h1>
    <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
`;

  collections.forEach(col => {
    const methodClass = col.method.toLowerCase();
    html += `
    <div class="endpoint">
        <h2>${col.name}</h2>
        <div>
            <span class="method ${methodClass}">${col.method}</span>
        </div>
        <div class="url">${col.url}</div>
`;

    if (col.headers && Object.keys(col.headers).length > 0) {
      html += `
        <h3>Headers</h3>
        <pre>${JSON.stringify(col.headers, null, 2)}</pre>
`;
    }

    if (col.data) {
      html += `
        <h3>Request Body</h3>
        <pre>${typeof col.data === 'string' ? col.data : JSON.stringify(col.data, null, 2)}</pre>
`;
    }

    if (col.timestamp) {
      html += `
        <p class="timestamp">Last Updated: ${new Date(col.timestamp).toLocaleString()}</p>
`;
    }

    html += `
    </div>
`;
  });

  html += `
</body>
</html>
`;

  return html;
}

module.exports = {
  generateDocs
};
