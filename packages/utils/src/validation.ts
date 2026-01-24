// Define local types to avoid dependency issues
interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
    required: boolean;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate a form field based on its configuration
 */
export function validateField(value: string, field: FormField): string | null {
    // Required validation
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return `${field.label} is required`;
    }

    // Skip other validations if field is not required and empty
    if (!field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return null;
    }

    // Type-specific validations
    switch (field.type) {
        case 'email':
            if (!isValidEmail(value)) {
                return 'Please enter a valid email address';
            }
            break;

        case 'password':
            const passwordValidation = validatePassword(value);
            if (!passwordValidation.isValid) {
                return passwordValidation.errors[0] || 'Password is invalid'; // Return first error with fallback
            }
            break;

        case 'number':
            if (isNaN(Number(value))) {
                return `${field.label} must be a valid number`;
            }
            break;
    }

    // Custom validation rules
    if (field.validation) {
        const { min, max, pattern, message } = field.validation;

        if (min !== undefined && value.length < min) {
            return message || `${field.label} must be at least ${min} characters`;
        }

        if (max !== undefined && value.length > max) {
            return message || `${field.label} must be no more than ${max} characters`;
        }

        if (pattern && !new RegExp(pattern).test(value)) {
            return message || `${field.label} format is invalid`;
        }
    }

    return null;
}

/**
 * Validate an entire form
 */
export function validateForm<T extends Record<string, unknown>>(
    data: T,
    fields: FormField[]
): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    fields.forEach(field => {
        const error = validateField(data[field.name], field);
        if (error) {
            errors[field.name] = error;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Extract and validate JSON from string
 */
export function parseJSON<T = unknown>(jsonString: string): T | null {
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate phone number (basic format)
 */
export function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
}
