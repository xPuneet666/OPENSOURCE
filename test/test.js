const { makeRequest } = require('../lib/request');
const { loadEnv, setEnv, unsetEnv } = require('../lib/env');
const { saveRequest, loadCollection } = require('../lib/collection');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Test counter
let passed = 0;
let failed = 0;

// Helper function to run tests
async function test(name, fn) {
  try {
    await fn();
    console.log(chalk.green('✓'), name);
    passed++;
  } catch (error) {
    console.log(chalk.red('✗'), name);
    console.error(chalk.red('  Error:'), error.message);
    failed++;
  }
}

// Helper to assert
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runTests() {
  console.log(chalk.blue.bold('\n🧪 Running DevAPI Tests\n'));

  // Test 1: HTTP GET Request
  await test('HTTP GET request should work', async () => {
    const response = await makeRequest('GET', 'https://jsonplaceholder.typicode.com/posts/1');
    assert(response.status === 200, 'Status should be 200');
    assert(response.data, 'Response should have data');
    assert(response.data.id === 1, 'Post ID should be 1');
  });

  // Test 2: HTTP POST Request
  await test('HTTP POST request should work', async () => {
    const data = { title: 'Test', body: 'Test body', userId: 1 };
    const response = await makeRequest('POST', 'https://jsonplaceholder.typicode.com/posts', { data });
    assert(response.status === 201, 'Status should be 201');
    assert(response.data.title === 'Test', 'Title should match');
  });

  // Test 3: HTTP PUT Request
  await test('HTTP PUT request should work', async () => {
    const data = { id: 1, title: 'Updated', body: 'Updated body', userId: 1 };
    const response = await makeRequest('PUT', 'https://jsonplaceholder.typicode.com/posts/1', { data });
    assert(response.status === 200, 'Status should be 200');
  });

  // Test 4: HTTP DELETE Request
  await test('HTTP DELETE request should work', async () => {
    const response = await makeRequest('DELETE', 'https://jsonplaceholder.typicode.com/posts/1');
    assert(response.status === 200, 'Status should be 200');
  });

  // Test 5: Custom Headers
  await test('Custom headers should be sent', async () => {
    const headers = { 'X-Custom-Header': 'test-value' };
    const response = await makeRequest('GET', 'https://httpbin.org/headers', { headers });
    assert(response.status === 200, 'Status should be 200');
    assert(response.data.headers['X-Custom-Header'] === 'test-value', 'Custom header should be present');
  });

  // Test 6: Environment Variable Management
  await test('Environment variables should be set and unset', () => {
    const testFile = '.env.test';
    const testFilePath = path.resolve(process.cwd(), testFile);

    // Clean up if exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    // Set variable
    setEnv('TEST_VAR', 'test_value', testFile);
    assert(fs.existsSync(testFilePath), 'Env file should be created');

    const content = fs.readFileSync(testFilePath, 'utf8');
    assert(content.includes('TEST_VAR=test_value'), 'Variable should be in file');

    // Unset variable
    unsetEnv('TEST_VAR', testFile);
    const updatedContent = fs.readFileSync(testFilePath, 'utf8');
    assert(!updatedContent.includes('TEST_VAR=test_value'), 'Variable should be removed');

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  // Test 7: Collection Management
  await test('Requests should be saved to collection', () => {
    const testRequest = {
      method: 'GET',
      url: 'https://api.example.com/test',
      headers: { 'Authorization': 'Bearer token' },
      timestamp: new Date().toISOString()
    };

    saveRequest('test-request', testRequest);

    const loaded = loadCollection('test-request');
    assert(loaded !== null, 'Request should be loaded');
    assert(loaded.method === 'GET', 'Method should match');
    assert(loaded.url === testRequest.url, 'URL should match');

    // Clean up
    const collectionFile = path.join(process.cwd(), '.devapi', 'test-request.json');
    if (fs.existsSync(collectionFile)) {
      fs.unlinkSync(collectionFile);
    }
  });

  // Test 8: Invalid URL Handling
  await test('Invalid URLs should be handled gracefully', async () => {
    try {
      await makeRequest('GET', 'https://this-domain-does-not-exist-12345.com');
      throw new Error('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('Could not resolve host'), 'Should throw DNS error');
    }
  });

  // Test 9: Response Duration Tracking
  await test('Response duration should be tracked', async () => {
    const response = await makeRequest('GET', 'https://jsonplaceholder.typicode.com/posts/1');
    assert(response.duration !== undefined, 'Duration should be defined');
    assert(response.duration > 0, 'Duration should be positive');
  });

  // Test 10: HTTP Methods
  await test('All HTTP methods should be supported', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
      const response = await makeRequest(method, `https://httpbin.org/${method.toLowerCase()}`);
      assert(response.status === 200, `${method} should return 200`);
    }
  });

  // Print results
  console.log(chalk.blue('\n─'.repeat(50)));
  console.log(chalk.bold('\n📊 Test Results:\n'));
  console.log(chalk.green(`✓ Passed: ${passed}`));
  console.log(chalk.red(`✗ Failed: ${failed}`));
  console.log(chalk.blue(`\nTotal: ${passed + failed} tests\n`));

  if (failed > 0) {
    console.log(chalk.red('Some tests failed!'));
    process.exit(1);
  } else {
    console.log(chalk.green('All tests passed! 🎉'));
  }
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red('Test suite failed:'), error);
  process.exit(1);
});
