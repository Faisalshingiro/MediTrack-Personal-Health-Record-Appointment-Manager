/**
 * SECURITY UTILITIES
 * Centralized logic for input sanitization and validation.
 * These utilities protect the application from Cross-Site Scripting (XSS) 
 * and ensure data integrity before persistence.
 */

/**
 * sanitize - Escapes HTML characters to prevent XSS attacks.
 * Converts characters like < or > into their HTML entity equivalents 
 * so they are rendered as text rather than executed as scripts by the browser.
 */
export function sanitize(str) {
    // If the input is null, undefined, or not a string, return it as-is.
    if (!str || typeof str !== 'string') return str

    // Replace sensitive characters with their safe HTML entity counterparts.
    return str
        .replace(/&/g, '&amp;')   // Escape ampersands
        .replace(/</g, '&lt;')    // Escape opening tags
        .replace(/>/g, '&gt;')    // Escape closing tags
        .replace(/"/g, '&quot;')  // Escape double quotes
        .replace(/'/g, '&#039;')  // Escape single quotes (apostrophes)
}

/**
 * validateEmail - Checks if a string follows a standard email format.
 * Uses a Regular Expression to verify the presence of an @ symbol and a valid domain.
 */
export function validateEmail(email) {
    // Regex pattern for basic RFC-compliant email validation.
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    // Returns true if the email matches the pattern, false otherwise.
    return re.test(email)
}

/**
 * validatePassword - Enforces a minimum security threshold for passwords.
 * Currently requires at least 6 characters to prevent brittle credential sets.
 */
export function validatePassword(password) {
    // Returns true if password exists and meets the length requirement.
    return password && password.length >= 6
}

/**
 * validateRequired - Generic check for mandatory inputs.
 * Ensures that a value is neither null nor just empty whitespace.
 */
export function validateRequired(val) {
    // Convert to string and trim whitespace to verify actual character presence.
    return val && val.toString().trim().length > 0
}
