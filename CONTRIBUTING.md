# Contributing to DevAPI CLI

Thank you for your interest in contributing to DevAPI CLI! This document provides guidelines and information for contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment (OS, Node.js version, etc.)
- Any relevant error messages or logs

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you might have

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OPENSOURCE.git
cd OPENSOURCE

# Install dependencies
npm install

# Link for local testing
npm link

# Run tests
npm test
```

## Coding Standards

- Use clear, descriptive variable and function names
- Add comments for complex logic
- Follow the existing code style
- Keep functions small and focused
- Handle errors gracefully

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test with real APIs when possible
- Include both success and failure cases

## Commit Messages

Write clear commit messages:
- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issues when applicable

Example:
```
Add support for PATCH requests

- Implement PATCH method in request handler
- Add tests for PATCH requests
- Update documentation

Fixes #123
```

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

Feel free to open an issue for any questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
