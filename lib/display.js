const chalk = require('chalk');
const Table = require('cli-table3');

/**
 * Display HTTP response in a formatted way
 * @param {object} response - Response object
 */
function displayResponse(response) {
  console.log('\n' + chalk.bold('Response:'));
  console.log(chalk.gray('─'.repeat(80)));

  // Status
  const statusColor = response.status >= 200 && response.status < 300 ? chalk.green :
                      response.status >= 300 && response.status < 400 ? chalk.yellow :
                      chalk.red;

  console.log(`${chalk.bold('Status:')} ${statusColor(response.status + ' ' + response.statusText)}`);
  console.log(`${chalk.bold('Time:')} ${chalk.cyan(response.duration + 'ms')}`);

  // Headers
  console.log('\n' + chalk.bold('Headers:'));
  const headerTable = new Table({
    chars: {
      'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
      'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
      'right': '', 'right-mid': '', 'middle': ' '
    },
    style: { 'padding-left': 0, 'padding-right': 2 }
  });

  const importantHeaders = ['content-type', 'content-length', 'server', 'date', 'cache-control', 'set-cookie'];

  for (const [key, value] of Object.entries(response.headers)) {
    if (importantHeaders.includes(key.toLowerCase())) {
      headerTable.push([chalk.cyan(key), String(value)]);
    }
  }

  console.log(headerTable.toString());

  // Body
  console.log('\n' + chalk.bold('Body:'));

  try {
    if (typeof response.data === 'object') {
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.log(response.data);
    }
  } catch (e) {
    console.log(response.data);
  }

  console.log(chalk.gray('\n─'.repeat(80)));
}

/**
 * Format data for display
 * @param {any} data - Data to format
 * @returns {string} Formatted data
 */
function formatData(data) {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

module.exports = {
  displayResponse,
  formatData
};
