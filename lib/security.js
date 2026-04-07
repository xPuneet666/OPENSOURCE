const path = require('path');
const { URL } = require('url');

/**
 * Security utilities for input validation and sanitization
 */

/**
 * Validate and sanitize a filename to prevent path traversal
 * @param {string} filename - The filename to validate
 * @returns {string} Sanitized filename
 * @throws {Error} If filename contains path traversal attempts
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename: must be a non-empty string');
  }

  // Check for path traversal attempts and null bytes BEFORE sanitization
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || filename.includes('\0')) {
    throw new Error('Invalid filename: path traversal attempt detected');
  }

  // Remove any path separators and null bytes
  const sanitized = filename.replace(/[\/\\.\0]/g, '_');

  // Check for reserved names (Windows)
  const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  if (reserved.includes(sanitized.toUpperCase())) {
    throw new Error('Invalid filename: reserved name');
  }

  // Ensure filename is not empty after sanitization
  if (sanitized.length === 0 || sanitized.length > 255) {
    throw new Error('Invalid filename: must be between 1 and 255 characters');
  }

  return sanitized;
}

/**
 * Validate that a file path is within an allowed directory
 * @param {string} filePath - The file path to validate
 * @param {string} allowedDir - The allowed base directory
 * @returns {string} Normalized safe path
 * @throws {Error} If path is outside allowed directory
 */
function validatePath(filePath, allowedDir) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path');
  }

  const normalizedPath = path.normalize(filePath);
  const normalizedAllowedDir = path.normalize(allowedDir);
  const resolvedPath = path.resolve(normalizedAllowedDir, normalizedPath);
  const resolvedAllowedDir = path.resolve(normalizedAllowedDir);

  // Ensure the resolved path starts with the allowed directory
  if (!resolvedPath.startsWith(resolvedAllowedDir + path.sep) && resolvedPath !== resolvedAllowedDir) {
    throw new Error('Access denied: path is outside allowed directory');
  }

  return resolvedPath;
}

/**
 * Validate URL to prevent SSRF attacks
 * @param {string} urlString - The URL to validate
 * @returns {URL} Parsed and validated URL object
 * @throws {Error} If URL is invalid or potentially dangerous
 */
function validateUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('Invalid URL: must be a non-empty string');
  }

  let url;
  try {
    url = new URL(urlString);
  } catch (error) {
    throw new Error('Invalid URL format');
  }

  // Only allow HTTP and HTTPS protocols
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Invalid URL: only HTTP and HTTPS protocols are allowed');
  }

  // Block internal/private IP ranges and localhost
  const hostname = url.hostname.toLowerCase();

  // Block localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    throw new Error('Invalid URL: localhost access is not allowed');
  }

  // Block private IP ranges (IPv4)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = hostname.match(ipv4Regex);

  if (ipv4Match) {
    const [, a, b, c, d] = ipv4Match.map(Number);

    // Validate IP octets
    if (a > 255 || b > 255 || c > 255 || d > 255) {
      throw new Error('Invalid URL: malformed IP address');
    }

    // Block private ranges
    // 10.0.0.0/8
    if (a === 10) {
      throw new Error('Invalid URL: private IP range not allowed');
    }
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) {
      throw new Error('Invalid URL: private IP range not allowed');
    }
    // 192.168.0.0/16
    if (a === 192 && b === 168) {
      throw new Error('Invalid URL: private IP range not allowed');
    }
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) {
      throw new Error('Invalid URL: link-local IP range not allowed');
    }
    // 127.0.0.0/8 (loopback)
    if (a === 127) {
      throw new Error('Invalid URL: loopback IP range not allowed');
    }
    // 0.0.0.0/8
    if (a === 0) {
      throw new Error('Invalid URL: invalid IP range');
    }
    // 224.0.0.0/4 (multicast)
    if (a >= 224) {
      throw new Error('Invalid URL: multicast/reserved IP range not allowed');
    }
  }

  // Block common metadata service domains
  const blockedDomains = [
    'metadata.google.internal',
    'metadata.azure.com',
    '169.254.169.254'
  ];

  if (blockedDomains.includes(hostname)) {
    throw new Error('Invalid URL: metadata service access not allowed');
  }

  return url;
}

/**
 * Validate HTTP header name and value
 * @param {string} name - Header name
 * @param {string} value - Header value
 * @throws {Error} If header contains invalid characters
 */
function validateHeader(name, value) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid header name');
  }

  if (value === undefined || value === null || typeof value !== 'string') {
    throw new Error('Invalid header value');
  }

  // Check for CRLF injection in header name
  if (/[\r\n]/.test(name)) {
    throw new Error('Invalid header name: contains newline characters');
  }

  // Check for CRLF injection in header value
  if (/[\r\n]/.test(value)) {
    throw new Error('Invalid header value: contains newline characters');
  }

  // Validate header name format (RFC 7230)
  if (!/^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/.test(name)) {
    throw new Error('Invalid header name: contains illegal characters');
  }
}

/**
 * Validate environment variable key
 * @param {string} key - Environment variable key
 * @throws {Error} If key is invalid
 */
function validateEnvKey(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Invalid environment variable key');
  }

  // Allow only alphanumeric characters and underscores
  if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
    throw new Error('Invalid environment variable key: must contain only letters, numbers, and underscores');
  }

  if (key.length > 128) {
    throw new Error('Invalid environment variable key: too long');
  }
}

/**
 * Safe JSON parse that prevents prototype pollution
 * @param {string} jsonString - JSON string to parse
 * @returns {any} Parsed object
 */
function safeJsonParse(jsonString) {
  const parsed = JSON.parse(jsonString);

  // Remove dangerous properties
  if (parsed && typeof parsed === 'object') {
    delete parsed.__proto__;
    delete parsed.constructor;
    delete parsed.prototype;
  }

  return parsed;
}

/**
 * Mask sensitive values for display
 * @param {string} value - Value to mask
 * @returns {string} Masked value
 */
function maskSensitiveValue(value) {
  if (!value || typeof value !== 'string') {
    return value;
  }

  // Always mask tokens, keys, passwords, secrets
  const sensitivePatterns = [
    /token/i,
    /key/i,
    /password/i,
    /secret/i,
    /auth/i,
    /bearer/i,
    /credential/i
  ];

  const isSensitive = sensitivePatterns.some(pattern => pattern.test(value));

  if (value.length <= 8) {
    return '***';
  } else if (isSensitive || value.length > 16) {
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  } else {
    return value.substring(0, 6) + '***';
  }
}

module.exports = {
  sanitizeFilename,
  validatePath,
  validateUrl,
  validateHeader,
  validateEnvKey,
  safeJsonParse,
  maskSensitiveValue
};
