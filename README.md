# DevAPI CLI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

> **A secure, zero-config API testing CLI that replaces Postman/Insomnia - no account, no bloat, complete offline functionality for privacy-focused developers.**

A modern, powerful CLI tool for API testing, documentation, and environment management. Think of it as a free, lightweight, and terminal-friendly alternative to Postman.

## 🎯 Why DevAPI?

Developers need a fast, secure way to test APIs without:
- Creating accounts or logging in
- Installing heavy Electron apps (500MB+)
- Sharing data with cloud services
- Switching between terminal and GUI

**Alternatives:** Postman (GUI, account required), Insomnia (heavy), curl (no collections), httpie (limited features)

## 🚀 Features

- **HTTP Request Testing**: Make GET, POST, PUT, DELETE, and PATCH requests directly from your terminal
- **Environment Variables**: Manage and use environment variables with ease
- **Request Collections**: Save, organize, and reuse API requests
- **Auto-Documentation**: Generate beautiful API documentation from your saved requests
- **Response Formatting**: Clean, colored output with detailed response information
- **Free & Open Source**: No accounts, no limits, no tracking

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g devapi-cli
```

### Local Installation

```bash
npm install devapi-cli
```

### From Source

```bash
git clone https://github.com/xPuneet666/OPENSOURCE.git
cd OPENSOURCE
npm install
npm link
```

## 🎯 Quick Start

### Make Your First Request

```bash
devapi request GET https://jsonplaceholder.typicode.com/posts/1
```

### With Custom Headers

```bash
devapi request POST https://api.example.com/users \
  -H "Authorization: Bearer {{TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Save a Request

```bash
devapi request GET https://api.example.com/users \
  -H "Authorization: Bearer {{TOKEN}}" \
  --save get-users
```

### Run a Saved Request

```bash
devapi collection run get-users
```

## 📚 Usage Guide

### Making Requests

The basic syntax for making requests:

```bash
devapi request <METHOD> <URL> [OPTIONS]
```

**Supported Methods**: GET, POST, PUT, DELETE, PATCH

**Options**:
- `-H, --header <header>`: Add headers (can be used multiple times)
- `-d, --data <data>`: Request body (JSON string or @file.json)
- `-e, --env <file>`: Load environment file (default: .env)
- `-s, --save <name>`: Save request to collection
- `-v, --verbose`: Show verbose output

**Examples**:

```bash
# Simple GET request
devapi request GET https://api.github.com/users/octocat

# POST with JSON data
devapi request POST https://api.example.com/users \
  -d '{"name": "Alice", "age": 30}'

# POST with data from file
devapi request POST https://api.example.com/users \
  -d @user-data.json

# With multiple headers
devapi request GET https://api.example.com/protected \
  -H "Authorization: Bearer token123" \
  -H "X-Custom-Header: value"

# Save for later use
devapi request GET https://api.example.com/users \
  --save list-users
```

### Environment Variables

DevAPI supports environment variables for managing different configurations (dev, staging, production).

#### List Environment Variables

```bash
devapi env list
devapi env list -f .env.production
```

#### Set Environment Variable

```bash
devapi env set API_URL https://api.example.com
devapi env set TOKEN abc123xyz
```

#### Remove Environment Variable

```bash
devapi env unset TOKEN
```

#### Using Environment Variables in Requests

Use `{{VARIABLE_NAME}}` syntax in your requests:

```bash
devapi request GET {{API_URL}}/users \
  -H "Authorization: Bearer {{TOKEN}}"
```

**Example .env file**:

```env
API_URL=https://api.example.com
TOKEN=your-secret-token
DB_HOST=localhost
DB_PORT=5432
```

### Request Collections

Collections allow you to save and organize API requests.

#### List All Collections

```bash
devapi collection list
```

#### Run a Saved Request

```bash
devapi collection run get-users
devapi collection run create-user -e .env.production
```

#### Export Collections

```bash
# Export all collections
devapi collection export

# Export specific collection
devapi collection export get-users -o my-collection.json
```

### Generate Documentation

Automatically generate API documentation from your saved requests:

```bash
# Generate Markdown documentation
devapi docs

# Generate HTML documentation
devapi docs -f html -o api-docs.html
```

This creates beautiful, shareable documentation from your API collections.

## 🎨 Real-World Examples

### Example 1: Testing a REST API

```bash
# Set up environment
devapi env set BASE_URL https://jsonplaceholder.typicode.com

# Get all posts
devapi request GET {{BASE_URL}}/posts --save get-posts

# Get specific post
devapi request GET {{BASE_URL}}/posts/1 --save get-post

# Create a post
devapi request POST {{BASE_URL}}/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "My Post", "body": "Content here", "userId": 1}' \
  --save create-post

# Update a post
devapi request PUT {{BASE_URL}}/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Updated", "body": "New content", "userId": 1}' \
  --save update-post

# Delete a post
devapi request DELETE {{BASE_URL}}/posts/1 --save delete-post
```

### Example 2: Authentication Flow

```bash
# Login and get token
devapi request POST https://api.example.com/auth/login \
  -d '{"email": "user@example.com", "password": "secret"}' \
  --save login

# Use the token (after manually adding it to .env)
devapi env set AUTH_TOKEN eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Make authenticated requests
devapi request GET https://api.example.com/profile \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  --save get-profile

devapi request GET https://api.example.com/dashboard \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  --save get-dashboard
```

### Example 3: Multiple Environments

```bash
# Development environment
echo "API_URL=http://localhost:3000" > .env.dev
echo "API_KEY=dev-key-123" >> .env.dev

# Production environment
echo "API_URL=https://api.production.com" > .env.prod
echo "API_KEY=prod-key-xyz" >> .env.prod

# Use different environments
devapi request GET {{API_URL}}/status -e .env.dev
devapi request GET {{API_URL}}/status -e .env.prod
```

## 🔧 Advanced Features

### Verbose Mode

Get detailed information about your requests:

```bash
devapi request GET https://api.example.com/data -v
```

### Loading Request Data from Files

For complex requests, store your JSON data in files:

```bash
# user.json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York"
  }
}

# Use the file
devapi request POST https://api.example.com/users -d @user.json
```

## 🤝 Use Cases

DevAPI is perfect for:

- **API Development**: Quick testing during development
- **API Documentation**: Auto-generate docs from your tests
- **CI/CD Pipelines**: Automated API testing in scripts
- **Learning**: Great for learning about APIs and HTTP
- **Team Collaboration**: Share collections with your team
- **Environment Management**: Easily switch between dev/staging/prod

## 📖 API Reference

### Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `devapi request <method> <url>` | `req` | Make an HTTP request |
| `devapi env list` | - | List environment variables |
| `devapi env set <key> <value>` | - | Set environment variable |
| `devapi env unset <key>` | - | Remove environment variable |
| `devapi collection list` | `col list` | List all collections |
| `devapi collection run <name>` | `col run` | Run saved request |
| `devapi collection export [name]` | `col export` | Export collections |
| `devapi docs` | - | Generate API documentation |

## 🛠️ Development

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Setup

```bash
git clone https://github.com/xPuneet666/OPENSOURCE.git
cd OPENSOURCE
npm install
```

### Testing

```bash
npm test
```

### Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js/)
- HTTP requests powered by [Axios](https://github.com/axios/axios)
- Beautiful terminal output with [Chalk](https://github.com/chalk/chalk)

## 📧 Support

- Issues: [GitHub Issues](https://github.com/xPuneet666/OPENSOURCE/issues)
- Discussions: [GitHub Discussions](https://github.com/xPuneet666/OPENSOURCE/discussions)

## 🌟 Show Your Support

If you find this project useful, please consider giving it a ⭐️ on GitHub!

---

Made with ❤️ by developers, for developers.
