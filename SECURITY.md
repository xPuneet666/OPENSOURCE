# Security Policy

## Supported Versions

We take security seriously. The following versions of DevAPI CLI are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in DevAPI CLI, please follow these steps:

### 1. Do Not Open a Public Issue

Please do not create a public GitHub issue for security vulnerabilities. This helps protect users while the vulnerability is being addressed.

### 2. Report Privately

Report security vulnerabilities by:
- Opening a security advisory on GitHub (preferred)
- Emailing the maintainers directly through the repository

### 3. Include Details

When reporting a vulnerability, please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if you have them)
- Your contact information

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity and complexity

## Security Best Practices

When using DevAPI CLI:

### Environment Variables

- **Never commit `.env` files** to version control
- Use `.env.example` templates without real credentials
- Rotate credentials regularly
- Use different credentials for different environments

### API Keys and Tokens

- Store sensitive data in environment variables
- Don't hardcode credentials in collections
- Use short-lived tokens when possible
- Review exported collections before sharing

### Request Collections

- Review collections before importing from untrusted sources
- Don't share collections with production credentials
- Clean sensitive data from collections before committing

### Network Security

- Use HTTPS for API endpoints when possible
- Verify SSL certificates (don't disable validation)
- Be cautious with verbose mode in production
- Don't log sensitive data

## Known Security Considerations

### 1. Environment File Storage

Environment files (`.env`) are stored in plain text. Ensure proper file permissions:

```bash
chmod 600 .env
```

### 2. Collection Storage

Request collections are stored locally in `.devapi/` directory. This directory should be added to `.gitignore` if it contains sensitive data.

### 3. Verbose Mode

Verbose mode may log sensitive information. Avoid using it with production credentials or in public CI/CD logs.

## Dependencies

We regularly update dependencies to patch security vulnerabilities. Run:

```bash
npm audit
```

to check for known vulnerabilities in dependencies.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Credit the reporter (if desired)

## Comments

We appreciate the security research community's efforts in keeping DevAPI CLI and its users safe!

---

**Last Updated**: 2026-04-06
