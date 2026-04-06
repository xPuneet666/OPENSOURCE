const axios = require('axios');
const ora = require('ora');
const chalk = require('chalk');

/**
 * Make an HTTP request
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} url - Request URL
 * @param {object} options - Request options (headers, data, verbose)
 * @returns {Promise<object>} Response object
 */
async function makeRequest(method, url, options = {}) {
  const { headers = {}, data = null, verbose = false } = options;

  const spinner = ora(`Making ${method} request to ${url}`).start();

  try {
    const startTime = Date.now();

    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      validateStatus: () => true // Don't throw on any status code
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.data = data;
    }

    if (verbose) {
      spinner.info('Request configuration:');
      console.log(JSON.stringify(config, null, 2));
      spinner.start();
    }

    const response = await axios(config);
    const endTime = Date.now();
    const duration = endTime - startTime;

    spinner.succeed(chalk.green(`Request completed in ${duration}ms`));

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration,
      config: {
        method,
        url,
        headers,
        data
      }
    };

  } catch (error) {
    spinner.fail(chalk.red('Request failed'));

    if (error.code === 'ENOTFOUND') {
      throw new Error(`Could not resolve host: ${url}`);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error(`Connection refused: ${url}`);
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error(`Request timeout: ${url}`);
    } else if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error(`No response received from ${url}`);
    } else {
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
}

module.exports = {
  makeRequest
};
