#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { makeRequest } = require('../lib/request');
const { loadEnv, listEnv, setEnv, unsetEnv } = require('../lib/env');
const { saveRequest, loadCollection, listCollections, exportCollection } = require('../lib/collection');
const { generateDocs } = require('../lib/docs');
const { displayResponse } = require('../lib/display');
const { validateHeader, safeJsonParse } = require('../lib/security');
const package = require('../package.json');

const program = new Command();

program
  .name('devapi')
  .description('A modern CLI tool for API testing, documentation, and environment management')
  .version(package.version);

// Request command
program
  .command('request <method> <url>')
  .alias('req')
  .description('Make an HTTP request')
  .option('-H, --header <header...>', 'Add headers (format: "Key: Value")')
  .option('-d, --data <data>', 'Request body (JSON string or @file.json)')
  .option('-e, --env <file>', 'Load environment file', '.env')
  .option('-s, --save <name>', 'Save request to collection')
  .option('-v, --verbose', 'Show verbose output')
  .action(async (method, url, options) => {
    try {
      // Load environment variables
      if (options.env) {
        loadEnv(options.env);
      }

      // Replace environment variables in URL
      url = replaceEnvVars(url);

      // Parse headers
      const headers = {};
      if (options.header) {
        options.header.forEach(header => {
          const [key, ...values] = header.split(':');
          const headerName = key.trim();
          const headerValue = replaceEnvVars(values.join(':').trim());

          // Validate header to prevent injection attacks
          try {
            validateHeader(headerName, headerValue);
            headers[headerName] = headerValue;
          } catch (error) {
            throw new Error(`Invalid header "${header}": ${error.message}`);
          }
        });
      }

      // Parse data
      let data = null;
      if (options.data) {
        if (options.data.startsWith('@')) {
          const fs = require('fs');
          const path = require('path');
          const filePath = options.data.substring(1);

          // Resolve and validate file path - only allow reading from current directory or subdirectories
          const resolvedPath = path.resolve(process.cwd(), filePath);
          const cwd = path.resolve(process.cwd());

          // Security check: ensure file is within current working directory
          if (!resolvedPath.startsWith(cwd + path.sep) && resolvedPath !== cwd) {
            throw new Error('Access denied: cannot read files outside current directory');
          }

          if (!fs.existsSync(resolvedPath)) {
            throw new Error(`File not found: ${filePath}`);
          }

          const fileContent = fs.readFileSync(resolvedPath, 'utf8');
          data = safeJsonParse(fileContent);
        } else {
          data = replaceEnvVars(options.data);
          try {
            data = safeJsonParse(data);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
      }

      // Make request
      const response = await makeRequest(method.toUpperCase(), url, { headers, data, verbose: options.verbose });

      // Display response
      displayResponse(response);

      // Save request if requested
      if (options.save) {
        saveRequest(options.save, {
          method: method.toUpperCase(),
          url,
          headers,
          data,
          timestamp: new Date().toISOString()
        });
        console.log(chalk.green(`\n✓ Request saved as "${options.save}"`));
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

// Environment commands
const envCmd = program.command('env').description('Manage environment variables');

envCmd
  .command('list')
  .description('List environment variables')
  .option('-f, --file <file>', 'Environment file', '.env')
  .action((options) => {
    try {
      listEnv(options.file);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

envCmd
  .command('set <key> <value>')
  .description('Set environment variable')
  .option('-f, --file <file>', 'Environment file', '.env')
  .action((key, value, options) => {
    try {
      setEnv(key, value, options.file);
      console.log(chalk.green(`✓ Set ${key}=${value} in ${options.file}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

envCmd
  .command('unset <key>')
  .description('Unset environment variable')
  .option('-f, --file <file>', 'Environment file', '.env')
  .action((key, options) => {
    try {
      unsetEnv(key, options.file);
      console.log(chalk.green(`✓ Removed ${key} from ${options.file}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Collection commands
const collectionCmd = program.command('collection').alias('col').description('Manage request collections');

collectionCmd
  .command('list')
  .description('List all saved collections')
  .action(() => {
    try {
      listCollections();
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

collectionCmd
  .command('run <name>')
  .description('Run a saved request from collection')
  .option('-e, --env <file>', 'Load environment file', '.env')
  .option('-v, --verbose', 'Show verbose output')
  .action(async (name, options) => {
    try {
      if (options.env) {
        loadEnv(options.env);
      }

      const request = loadCollection(name);
      if (!request) {
        console.error(chalk.red(`Collection "${name}" not found`));
        process.exit(1);
      }

      console.log(chalk.blue(`Running request: ${name}`));
      console.log(chalk.gray(`${request.method} ${request.url}\n`));

      // Replace env vars in URL
      let url = replaceEnvVars(request.url);

      // Replace env vars in headers
      const headers = {};
      if (request.headers) {
        for (const [key, value] of Object.entries(request.headers)) {
          headers[key] = replaceEnvVars(value);
        }
      }

      // Replace env vars in data
      let data = request.data;
      if (typeof data === 'string') {
        data = replaceEnvVars(data);
      } else if (typeof data === 'object') {
        data = JSON.parse(replaceEnvVars(JSON.stringify(data)));
      }

      const response = await makeRequest(request.method, url, { headers, data, verbose: options.verbose });
      displayResponse(response);

    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

collectionCmd
  .command('export [name]')
  .description('Export collection(s) to file')
  .option('-o, --output <file>', 'Output file', 'devapi-collection.json')
  .action((name, options) => {
    try {
      exportCollection(name, options.output);
      console.log(chalk.green(`✓ Exported to ${options.output}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Documentation command
program
  .command('docs')
  .description('Generate API documentation from collections')
  .option('-o, --output <file>', 'Output file', 'API_DOCS.md')
  .option('-f, --format <format>', 'Format (markdown|html)', 'markdown')
  .action((options) => {
    try {
      generateDocs(options.output, options.format);
      console.log(chalk.green(`✓ Documentation generated: ${options.output}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Helper function to replace environment variables
function replaceEnvVars(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return process.env[key] || match;
  });
}

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
