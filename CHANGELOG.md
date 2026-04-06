# Changelog

All notable changes to DevAPI CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-06

### Added
- Initial release of DevAPI CLI
- HTTP request functionality (GET, POST, PUT, DELETE, PATCH)
- Environment variable management system
  - Set, list, and unset environment variables
  - Support for multiple environment files (.env, .env.production, etc.)
  - Variable interpolation in requests using {{VAR_NAME}} syntax
- Request collection system
  - Save requests for later use
  - List all saved collections
  - Run saved requests
  - Export collections to JSON
- Response formatting and display
  - Colored output for better readability
  - Status code highlighting (green for success, red for errors)
  - Formatted JSON responses
  - Response time tracking
  - Important headers display
- Auto-documentation generation
  - Generate Markdown documentation from collections
  - Generate HTML documentation with styling
  - Automatic table of contents
  - Timestamp tracking
- Comprehensive test suite
  - 10 core functionality tests
  - HTTP method tests
  - Environment variable tests
  - Collection management tests
  - Error handling tests
- Complete documentation
  - Detailed README with examples
  - Contributing guidelines
  - Example configurations
  - Quick start guide
- CLI features
  - Command aliases (req for request, col for collection)
  - Verbose mode for debugging
  - Load request data from files
  - Custom headers support
  - Version display
  - Help system

### Features
- Free and open source (MIT License)
- No external accounts required
- Works offline (after installation)
- Cross-platform support (Linux, macOS, Windows)
- Zero configuration required
- Lightweight and fast
- Terminal-friendly interface

### Dependencies
- Node.js >= 14.0.0
- axios: HTTP client
- commander: CLI framework
- chalk: Terminal styling
- ora: Loading spinners
- cli-table3: Table formatting
- dotenv: Environment variable management
- js-yaml: YAML support
- inquirer: Interactive prompts

## [Unreleased]

### Planned Features
- Request history tracking
- Performance benchmarking
- Mock server support
- Request chaining
- Template support
- GraphQL support
- WebSocket testing
- Import from Postman/Insomnia
- Configuration file support
- Team collaboration features
- CI/CD integration examples
- Plugin system

---

## Version History

### Version 1.0.0 - Initial Release
The first stable release of DevAPI CLI, providing a complete API testing and documentation solution for developers who prefer working in the terminal.
