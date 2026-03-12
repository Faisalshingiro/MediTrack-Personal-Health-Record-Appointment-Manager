import { ref } from 'vue'

/**
 * useValidation Composable
 * A reusable logic block for handling form validation across different components.
 * It provides reactive error state and specialized validation methods for common inputs.
 */
export function useValidation() {
    /**
     * errors - Reactive object that maps field names to their specific error messages.
     * Use this in templates to conditionally display feedback to the user.
     */
    const errors = ref({})

    /**
     * validateEmail - Enforces strict email formatting.
     * @param {string} email - The raw input string to verify.
     * @returns {string|null} - An error message if invalid, or null if the input is valid.
     */
    const validateEmail = (email) => {
        // Standard Regex pattern for RFC-compliant email verification.
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        // 1. Mandatory presence check.
        if (!email) return 'Email is required'

        // 2. Structural pattern match.
        if (!re.test(email)) return 'Invalid email format'

        // 3. Success state.
        return null
    }

    /**
     * validatePassword - Enforces a minimum security threshold for account credentials.
     * @param {string} password - The raw password string to verify.
     * @returns {string|null} - An error message or null.
     */
    const validatePassword = (password) => {
        // 1. Mandatory presence check.
        if (!password) return 'Password is required'

        // 2. Length threshold (Minimum 6 characters to prevent brittle security).
        if (password.length < 6) return 'Password must be at least 6 characters'

        // 3. Success state.
        return null
    }

    // Export the reactive error registry and the validation behaviors.
    return { errors, validateEmail, validatePassword }
}
