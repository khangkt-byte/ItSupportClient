/**
 * Password validation utilities
 * Pattern: OWASP secure password requirements
 * Reference: https://owasp.org/www-community/
 */

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    checks: {
        minLength: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        specialChar: boolean;
    };
}

/**
 * Validate password complexity
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
    const errors: string[] = [];
    const checks = {
        minLength: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    if (!checks.minLength) {
        errors.push('Password must be at least 8 characters long.');
    }
    if (!checks.uppercase) {
        errors.push('Password must contain at least one uppercase letter.');
    }
    if (!checks.lowercase) {
        errors.push('Password must contain at least one lowercase letter.');
    }
    if (!checks.number) {
        errors.push('Password must contain at least one number.');
    }
    if (!checks.specialChar) {
        errors.push('Password must contain at least one special character (!@#$%^&*, etc).');
    }

    return {
        isValid: errors.length === 0,
        errors,
        checks,
    };
}

/**
 * Validate that two passwords match
 */
export function validatePasswordsMatch(
    password: string,
    confirmPassword: string
): { isValid: boolean; error?: string } {
    if (!password || !confirmPassword) {
        return {
            isValid: false,
            error: 'Both passwords are required.',
        };
    }

    if (password !== confirmPassword) {
        return {
            isValid: false,
            error: 'Passwords do not match.',
        };
    }

    return { isValid: true };
}

/**
 * Comprehensive password validation
 * Checks complexity AND matching
 */
export function validatePassword(
    password: string,
    confirmPassword: string
): {
    isValid: boolean;
    passwordErrors: string[];
    confirmPasswordErrors: string[];
} {
    const complexityResult = validatePasswordComplexity(password);
    const matchResult = validatePasswordsMatch(password, confirmPassword);

    return {
        isValid: complexityResult.isValid && matchResult.isValid,
        passwordErrors: complexityResult.errors,
        confirmPasswordErrors: matchResult.error ? [matchResult.error] : [],
    };
}

/**
 * Check if password meets minimum requirements for visibility feedback
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    const result = validatePasswordComplexity(password);
    const checksPassed = Object.values(result.checks).filter(Boolean).length;

    if (checksPassed <= 2) return 'weak';
    if (checksPassed <= 4) return 'medium';
    return 'strong';
}
