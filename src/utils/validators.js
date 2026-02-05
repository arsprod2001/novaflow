// src/utils/validators.js

export function isNotEmpty(value) {
  return value && value.trim().length > 0;
}

export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export function isInteger(value) {
  return Number.isInteger(Number(value));
}

export function isPositive(value) {
  return Number(value) > 0;
}

export function isInRange(value, min, max) {
  const num = Number(value);
  return num >= min && num <= max;
}

export function isValidPort(port) {
  return isInteger(port) && isInRange(port, 1, 65535);
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

export function isValidPath(path) {
  return typeof path === 'string' && path.length > 0;
}

export function validateInput(value, validators) {
  for (const validator of validators) {
    if (!validator.fn(value)) {
      return { isValid: false, message: validator.message };
    }
  }
  return { isValid: true };
}

export const commonValidators = {
  required: {
    fn: isNotEmpty,
    message: 'This field is required'
  },
  number: {
    fn: isNumber,
    message: 'Must be a number'
  },
  integer: {
    fn: isInteger,
    message: 'Must be an integer'
  },
  positive: {
    fn: isPositive,
    message: 'Must be positive'
  },
  email: {
    fn: isValidEmail,
    message: 'Invalid email'
  },
  url: {
    fn: isValidUrl,
    message: 'Invalid URL'
  },
  port: {
    fn: isValidPort,
    message: 'Invalid port (1–65535)'
  }
};
