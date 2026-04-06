const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table3');
const { sanitizeFilename, validatePath, safeJsonParse } = require('./security');

const COLLECTION_DIR = path.join(process.cwd(), '.devapi');

/**
 * Ensure collection directory exists
 */
function ensureCollectionDir() {
  if (!fs.existsSync(COLLECTION_DIR)) {
    fs.mkdirSync(COLLECTION_DIR, { recursive: true });
  }
}

/**
 * Save a request to collection
 * @param {string} name - Request name
 * @param {object} request - Request object
 */
function saveRequest(name, request) {
  ensureCollectionDir();

  // Sanitize filename to prevent path traversal
  const safeName = sanitizeFilename(name);
  const fileName = `${safeName}.json`;
  const filePath = validatePath(fileName, COLLECTION_DIR);

  fs.writeFileSync(filePath, JSON.stringify(request, null, 2));
}

/**
 * Load a request from collection
 * @param {string} name - Request name
 * @returns {object|null} Request object or null if not found
 */
function loadCollection(name) {
  // Sanitize filename to prevent path traversal
  const safeName = sanitizeFilename(name);
  const fileName = `${safeName}.json`;
  const filePath = validatePath(fileName, COLLECTION_DIR);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return safeJsonParse(content);
}

/**
 * List all collections
 */
function listCollections() {
  ensureCollectionDir();

  const files = fs.readdirSync(COLLECTION_DIR).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(chalk.yellow('No collections found'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan('Name'), chalk.cyan('Method'), chalk.cyan('URL'), chalk.cyan('Saved')],
    colWidths: [20, 10, 40, 20]
  });

  files.forEach(file => {
    const filePath = path.join(COLLECTION_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const request = safeJsonParse(content);

    const name = path.basename(file, '.json');
    const method = request.method || 'N/A';
    const url = request.url || 'N/A';
    const timestamp = request.timestamp ? new Date(request.timestamp).toLocaleString() : 'N/A';

    // Truncate URL if too long
    const truncatedUrl = url.length > 35 ? url.substring(0, 35) + '...' : url;

    table.push([name, method, truncatedUrl, timestamp]);
  });

  console.log(table.toString());
  console.log(chalk.gray(`\nTotal: ${files.length} collection(s)`));
}

/**
 * Export collection(s) to a file
 * @param {string|null} name - Collection name or null for all
 * @param {string} outputFile - Output file path
 */
function exportCollection(name, outputFile) {
  ensureCollectionDir();

  let collections = {};

  if (name) {
    const request = loadCollection(name);
    if (!request) {
      throw new Error(`Collection "${name}" not found`);
    }
    collections[name] = request;
  } else {
    const files = fs.readdirSync(COLLECTION_DIR).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const collectionName = path.basename(file, '.json');
      const filePath = path.join(COLLECTION_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      collections[collectionName] = safeJsonParse(content);
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(collections, null, 2));
}

/**
 * Import collections from a file
 * @param {string} inputFile - Input file path
 */
function importCollection(inputFile) {
  // Validate the input file path is within current working directory or absolute safe path
  const resolvedPath = path.resolve(process.cwd(), inputFile);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${inputFile}`);
  }

  const content = fs.readFileSync(resolvedPath, 'utf8');
  const collections = safeJsonParse(content);

  ensureCollectionDir();

  let count = 0;
  for (const [name, request] of Object.entries(collections)) {
    saveRequest(name, request);
    count++;
  }

  return count;
}

module.exports = {
  saveRequest,
  loadCollection,
  listCollections,
  exportCollection,
  importCollection
};
