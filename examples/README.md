# DevAPI Examples

This directory contains practical examples of using DevAPI CLI.

## Basic Examples

### 1. Simple GET Request

```bash
devapi request GET https://jsonplaceholder.typicode.com/posts/1
```

### 2. POST Request with JSON Data

```bash
devapi request POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "foo", "body": "bar", "userId": 1}'
```

### 3. Using Environment Variables

Create `.env` file:
```env
API_URL=https://jsonplaceholder.typicode.com
USER_ID=1
```

Make request:
```bash
devapi request GET {{API_URL}}/users/{{USER_ID}} -e .env
```

## Complete API Testing Workflow

### Step 1: Setup Environment

```bash
# Create development environment
devapi env set BASE_URL https://jsonplaceholder.typicode.com
devapi env set USER_ID 1

# Verify environment
devapi env list
```

### Step 2: Test CRUD Operations

```bash
# CREATE - Add a new post
devapi request POST {{BASE_URL}}/posts \
  -d '{"title": "My New Post", "body": "This is the content", "userId": {{USER_ID}}}' \
  --save create-post

# READ - Get all posts
devapi request GET {{BASE_URL}}/posts --save get-all-posts

# READ - Get single post
devapi request GET {{BASE_URL}}/posts/1 --save get-post

# UPDATE - Update a post
devapi request PUT {{BASE_URL}}/posts/1 \
  -d '{"id": 1, "title": "Updated Title", "body": "Updated content", "userId": 1}' \
  --save update-post

# DELETE - Remove a post
devapi request DELETE {{BASE_URL}}/posts/1 --save delete-post
```

### Step 3: View Saved Collections

```bash
devapi collection list
```

### Step 4: Rerun Requests

```bash
devapi collection run get-all-posts
devapi collection run create-post
```

### Step 5: Generate Documentation

```bash
devapi docs -o API_DOCUMENTATION.md
devapi docs -f html -o api-docs.html
```

## Advanced Examples

### Testing Authentication API

```bash
# 1. Login
devapi request POST https://api.example.com/auth/login \
  -d '{"username": "admin", "password": "password"}' \
  --save login

# 2. After getting token, add to environment
devapi env set AUTH_TOKEN your-jwt-token-here

# 3. Make authenticated requests
devapi request GET https://api.example.com/protected \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  --save protected-endpoint
```

### Working with Complex JSON

Create `user-data.json`:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "preferences": {
    "notifications": true,
    "newsletter": false
  }
}
```

Use the file:
```bash
devapi request POST https://api.example.com/users -d @user-data.json --save create-user
```

### Multiple Environments

```bash
# Development
echo "API_URL=http://localhost:3000" > .env.dev
echo "API_KEY=dev-key" >> .env.dev

# Staging
echo "API_URL=https://staging.api.example.com" > .env.staging
echo "API_KEY=staging-key" >> .env.staging

# Production
echo "API_URL=https://api.example.com" > .env.prod
echo "API_KEY=prod-key" >> .env.prod

# Use different environments
devapi request GET {{API_URL}}/health -e .env.dev
devapi request GET {{API_URL}}/health -e .env.staging
devapi request GET {{API_URL}}/health -e .env.prod
```

## Testing Public APIs

### JSONPlaceholder (Free Testing API)

```bash
# Setup
devapi env set JSON_API https://jsonplaceholder.typicode.com

# Get posts
devapi request GET {{JSON_API}}/posts --save json-posts

# Get users
devapi request GET {{JSON_API}}/users --save json-users

# Get comments
devapi request GET {{JSON_API}}/comments?postId=1 --save json-comments
```

### GitHub API (No Auth Required for Public Data)

```bash
# Setup
devapi env set GITHUB_API https://api.github.com

# Get user info
devapi request GET {{GITHUB_API}}/users/octocat --save github-user

# Get repositories
devapi request GET {{GITHUB_API}}/users/octocat/repos --save github-repos
```

### HTTP Testing Service (httpbin.org)

```bash
# Test GET with query params
devapi request GET https://httpbin.org/get?param1=value1&param2=value2

# Test POST
devapi request POST https://httpbin.org/post \
  -d '{"key": "value"}'

# Test headers
devapi request GET https://httpbin.org/headers \
  -H "X-Custom-Header: test-value"

# Test status codes
devapi request GET https://httpbin.org/status/200
devapi request GET https://httpbin.org/status/404
```

## Automation Script Examples

### Bash Script for CI/CD

```bash
#!/bin/bash

# test-api.sh
# Automated API testing script

echo "Starting API tests..."

# Load environment
export $(cat .env.test | xargs)

# Run tests
devapi collection run health-check
devapi collection run get-users
devapi collection run create-user
devapi collection run update-user
devapi collection run delete-user

echo "API tests completed!"
```

### Node.js Integration

```javascript
// test-api.js
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runTests() {
  try {
    console.log('Running API tests...');

    // Run saved collections
    const tests = ['get-users', 'create-user', 'update-user'];

    for (const test of tests) {
      const { stdout, stderr } = await execPromise(`devapi collection run ${test}`);
      console.log(stdout);
      if (stderr) console.error(stderr);
    }

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();
```

## Tips & Tricks

### 1. Quick Testing

Use aliases to speed up testing:
```bash
alias dapi="devapi request"
dapi GET https://api.example.com/users
```

### 2. Verbose Mode for Debugging

```bash
devapi request GET https://api.example.com/data -v
```

### 3. Pretty Print JSON Responses

The responses are automatically formatted with syntax highlighting!

### 4. Export & Share Collections

```bash
# Export your collections
devapi collection export -o team-api-tests.json

# Share with team (commit to git)
git add team-api-tests.json
git commit -m "Add API test collections"
```

### 5. Environment-Specific Testing

```bash
# Test across all environments
for env in dev staging prod; do
  echo "Testing $env environment..."
  devapi collection run health-check -e .env.$env
done
```

## Common Use Cases

1. **Quick API Exploration**: Test new APIs quickly without setting up GUI tools
2. **CI/CD Integration**: Automated API testing in pipelines
3. **Documentation**: Generate docs from actual working requests
4. **Team Sharing**: Export collections and share via git
5. **Environment Management**: Easy switching between dev/staging/prod
6. **Learning**: Great for learning HTTP and REST APIs

## More Resources

- [Full Documentation](../README.md)
- [GitHub Issues](https://github.com/xPuneet666/OPENSOURCE/issues)
- [Contributing Guide](../CONTRIBUTING.md)
