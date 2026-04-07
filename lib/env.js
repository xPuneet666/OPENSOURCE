const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table3');
const { validateEnvKey, maskSensitiveValue } = require('./security');

/**
 * Load environment variables from a file
 * @param {string} filePath - Path to environment file
 */
function loadEnv(filePath) {
  // Only allow .env files in current directory
  const basename = path.basename(filePath);
  if (!basename.startsWith('.env')) {
    throw new Error('Invalid environment file: must be a .env file');
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  const cwd = path.resolve(process.cwd());

  // Security check: ensure file is within current working directory
  if (!fullPath.startsWith(cwd + path.sep) && fullPath !== cwd) {
    throw new Error('Access denied: environment file must be in current directory');
  }

  if (!fs.existsSync(fullPath)) {
    console.warn(chalk.yellow(`Warning: Environment file not found: ${filePath}`));
    return;
  }

  const result = dotenv.config({ path: fullPath });

  if (result.error) {
    throw new Error(`Failed to load environment file: ${result.error.message}`);
  }
}

/**
 * List environment variables from a file
 * @param {string} filePath - Path to environment file
 */
function listEnv(filePath) {
  // Only allow .env files in current directory
  const basename = path.basename(filePath);
  if (!basename.startsWith('.env')) {
    throw new Error('Invalid environment file: must be a .env file');
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  const cwd = path.resolve(process.cwd());

  // Security check: ensure file is within current working directory
  if (!fullPath.startsWith(cwd + path.sep) && fullPath !== cwd) {
    throw new Error('Access denied: environment file must be in current directory');
  }

  if (!fs.existsSync(fullPath)) {
    console.log(chalk.yellow(`No environment file found: ${filePath}`));
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  if (lines.length === 0) {
    console.log(chalk.yellow('No environment variables found'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan('Key'), chalk.cyan('Value')],
    colWidths: [30, 50]
  });

  lines.forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      const value = values.join('=').trim();
      // Use improved masking for sensitive values
      const maskedValue = maskSensitiveValue(value);
      table.push([key.trim(), maskedValue]);
    }
  });

  console.log(table.toString());
  console.log(chalk.gray(`\nLoaded from: ${filePath}`));
}

/**
 * Set an environment variable in a file
 * @param {string} key - Variable key
 * @param {string} value - Variable value
 * @param {string} filePath - Path to environment file
 */
function setEnv(key, value, filePath) {
  // Validate environment variable key
  validateEnvKey(key);

  // Only allow .env files in current directory
  const basename = path.basename(filePath);
  if (!basename.startsWith('.env')) {
    throw new Error('Invalid environment file: must be a .env file');
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  const cwd = path.resolve(process.cwd());

  // Security check: ensure file is within current working directory
  if (!fullPath.startsWith(cwd + path.sep) && fullPath !== cwd) {
    throw new Error('Access denied: environment file must be in current directory');
  }

  let content = '';
  if (fs.existsSync(fullPath)) {
    content = fs.readFileSync(fullPath, 'utf8');
  }

  const lines = content.split('\n');
  let found = false;

  const newLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    newLines.push(`${key}=${value}`);
  }

  fs.writeFileSync(fullPath, newLines.join('\n'));
}

/**
 * Unset an environment variable from a file
 * @param {string} key - Variable key
 * @param {string} filePath - Path to environment file
 */
function unsetEnv(key, filePath) {
  // Validate environment variable key
  validateEnvKey(key);

  // Only allow .env files in current directory
  const basename = path.basename(filePath);
  if (!basename.startsWith('.env')) {
    throw new Error('Invalid environment file: must be a .env file');
  }

  const fullPath = path.resolve(process.cwd(), filePath);
  const cwd = path.resolve(process.cwd());

  // Security check: ensure file is within current working directory
  if (!fullPath.startsWith(cwd + path.sep) && fullPath !== cwd) {
    throw new Error('Access denied: environment file must be in current directory');
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Environment file not found: ${filePath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  const newLines = lines.filter(line => {
    const trimmedLine = line.trim();
    return !trimmedLine.startsWith(`${key}=`);
  });

  fs.writeFileSync(fullPath, newLines.join('\n'));
}

module.exports = {
  loadEnv,
  listEnv,
  setEnv,
  unsetEnv
};
