const { makeRequest } = require('../lib/request');
const { loadEnv, setEnv, unsetEnv } = require('../lib/env');
const { saveRequest, loadCollection } = require('../lib/collection');
const { sanitizeFilename, validateUrl, validateHeader, validateEnvKey } = require('../lib/security');
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

  // Security Tests
  console.log(chalk.yellow.bold('\n🔒 Running Security Tests\n'));

  // Test 11: Path Traversal Prevention in Collections
  await test('Path traversal should be blocked in collection names', () => {
    try {
      saveRequest('../../../etc/malicious', { method: 'GET', url: 'https://example.com' });
      throw new Error('Should have blocked path traversal');
    } catch (error) {
      assert(error.message.includes('path traversal'), 'Should detect path traversal');
    }
  });

  // Test 12: SSRF Prevention - Localhost
  await test('SSRF attack to localhost should be blocked', async () => {
    try {
      await makeRequest('GET', 'http://localhost:8080/admin');
      throw new Error('Should have blocked localhost access');
    } catch (error) {
      assert(error.message.includes('localhost') || error.message.includes('not allowed'), 'Should block localhost');
    }
  });

  // Test 13: SSRF Prevention - Private IP
  await test('SSRF attack to private IP should be blocked', async () => {
    try {
      await makeRequest('GET', 'http://192.168.1.1/admin');
      throw new Error('Should have blocked private IP access');
    } catch (error) {
      assert(error.message.includes('private IP') || error.message.includes('not allowed'), 'Should block private IPs');
    }
  });

  // Test 14: SSRF Prevention - Metadata Service
  await test('SSRF attack to AWS metadata should be blocked', async () => {
    try {
      await makeRequest('GET', 'http://169.254.169.254/latest/meta-data/');
      throw new Error('Should have blocked metadata service access');
    } catch (error) {
      assert(error.message.includes('link-local') || error.message.includes('not allowed'), 'Should block metadata service');
    }
  });

  // Test 15: Invalid Protocol Prevention
  await test('Non-HTTP(S) protocols should be blocked', async () => {
    try {
      await makeRequest('GET', 'file:///etc/passwd');
      throw new Error('Should have blocked file:// protocol');
    } catch (error) {
      assert(error.message.includes('only HTTP') || error.message.includes('Invalid URL'), 'Should block file:// protocol');
    }
  });

  // Test 16: Filename Sanitization
  await test('Malicious filenames should be sanitized', () => {
    try {
      const result = sanitizeFilename('../../etc/passwd');
      throw new Error('Should have rejected traversal filename');
    } catch (error) {
      assert(error.message.includes('path traversal'), 'Should detect path traversal in filename');
    }
  });

  // Test 17: Environment Key Validation
  await test('Invalid environment keys should be rejected', () => {
    try {
      validateEnvKey('INVALID-KEY-WITH-DASH');
      throw new Error('Should have rejected invalid key');
    } catch (error) {
      assert(error.message.includes('Invalid environment variable key'), 'Should validate env key format');
    }
  });

  // Test 18: Header Injection Prevention
  await test('CRLF injection in headers should be blocked', () => {
    try {
      validateHeader('X-Test', 'value\r\nX-Injected: malicious');
      throw new Error('Should have blocked CRLF injection');
    } catch (error) {
      assert(error.message.includes('newline'), 'Should detect CRLF injection');
    }
  });

  // Test 19: Env File Path Validation
  await test('Env files outside CWD should be rejected', () => {
    try {
      setEnv('TEST', 'value', '/etc/passwd');
      throw new Error('Should have blocked absolute path');
    } catch (error) {
      assert(error.message.includes('must be a .env file') || error.message.includes('Access denied'), 'Should validate env file path');
    }
  });

  // Test 20: Collection Name Sanitization
  await test('Collection with null bytes should be rejected', () => {
    try {
      saveRequest('test\0file', { method: 'GET', url: 'https://example.com' });
      throw new Error('Should have rejected null byte');
    } catch (error) {
      assert(error.message.includes('path traversal') || error.message.includes('Invalid'), 'Should reject null bytes');
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
