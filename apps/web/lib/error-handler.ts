import { NextResponse } from 'next/server';

/**
 * Custom application error class
 * Used for standardized error handling across the app
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public isPublic: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Predefined error types for common scenarios
 */
export const AppErrors = {
  // Authentication errors
  Unauthorized: (message = 'Unauthorized') => 
    new AppError(message, 401, 'UNAUTHORIZED', true),
  
  Forbidden: (message = 'Access denied') => 
    new AppError(message, 403, 'FORBIDDEN', true),
  
  // Client errors
  BadRequest: (message = 'Invalid request') => 
    new AppError(message, 400, 'BAD_REQUEST', true),
  
  NotFound: (message = 'Resource not found') => 
    new AppError(message, 404, 'NOT_FOUND', true),
  
  Conflict: (message = 'Resource conflict') => 
    new AppError(message, 409, 'CONFLICT', true),
  
  UnprocessableEntity: (message = 'Validation failed') => 
    new AppError(message, 422, 'UNPROCESSABLE_ENTITY', true),
  
  // Server errors
  InternalServerError: (message = 'Internal server error') => 
    new AppError(message, 500, 'INTERNAL_SERVER_ERROR', false),
  
  ServiceUnavailable: (message = 'Service temporarily unavailable') => 
    new AppError(message, 503, 'SERVICE_UNAVAILABLE', false),
  
  // Business logic errors
  InsufficientCredits: (required: number, available: number) => 
    new AppError(
      `Insufficient credits. Required: ${required}, Available: ${available}`,
      402,
      'INSUFFICIENT_CREDITS',
      true
    ),
  
  OperationTimeout: (operation: string) => 
    new AppError(
      `${operation} timed out. Please try again.`,
      408,
      'OPERATION_TIMEOUT',
      true
    ),
  
  DuplicateEntity: (entity: string) => 
    new AppError(
      `${entity} already exists`,
      409,
      'DUPLICATE_ENTITY',
      true
    ),
};

/**
 * Standardized API error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * Handle API errors and return standardized responses
 * @param error - The error to handle
 * @param isDevelopment - Include error details in development
 */
export function handleApiError(error: unknown, isDevelopment = false): NextResponse<ApiErrorResponse> {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    // Try to detect common error types
    if (error.message.includes('Timeout') || error.message.includes('timed out')) {
      appError = AppErrors.OperationTimeout('Operation');
    } else if (error.message.includes('not found')) {
      appError = AppErrors.NotFound();
    } else if (error.message.includes('validation')) {
      appError = AppErrors.UnprocessableEntity(error.message);
    } else {
      appError = AppErrors.InternalServerError(isDevelopment ? error.message : undefined);
    }
  } else {
    appError = AppErrors.InternalServerError();
  }

  // Log error details in development
  if (isDevelopment && error instanceof Error) {
    console.error('[API Error]', {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      originalError: error.message,
      stack: error.stack,
    });
  }

  // Construct response
  const response: ApiErrorResponse = {
    success: false,
    error: appError.isPublic ? appError.message : 'An error occurred. Please try again.',
    code: appError.code,
  };

  // Include details in development mode only
  if (isDevelopment && !appError.isPublic && error instanceof Error) {
    response.details = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5), // First 5 stack frames
    };
  }

  return NextResponse.json(response, { status: appError.statusCode });
}

/**
 * Wrap async route handlers with automatic error handling
 * @param handler - The route handler function
 */
export function withErrorHandling(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error, process.env.NODE_ENV === 'development');
    }
  };
}

/**
 * Validate that required fields are present
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 */
export function validateRequiredFields(obj: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      return `${field} is required`;
    }
  }
  return null;
}

/**
 * Safe JSON parsing with error handling
 */
export function safeJsonParse(json: string, fallback: any = null): any {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('JSON parse error:', e);
    return fallback;
  }
}
