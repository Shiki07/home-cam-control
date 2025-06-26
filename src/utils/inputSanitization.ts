
export const sanitizeInput = (input: string, maxLength?: number): string => {
  if (!input) return '';
  
  // Remove potential XSS patterns
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();

  // Apply length limit if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const sanitizeDeviceName = (name: string): string => {
  return sanitizeInput(name, 50).replace(/[^a-zA-Z0-9\s\-_]/g, '');
};

export const sanitizeLogMessage = (message: string): string => {
  return sanitizeInput(message, 500);
};
