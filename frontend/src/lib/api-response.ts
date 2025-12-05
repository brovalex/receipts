import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, ValidationError } from './errors';

/**
 * Standard API response types
 */
export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    pagination?: PaginationMeta;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = { data };

  if (options?.pagination) {
    response.meta = { pagination: options.pagination };
  }

  return NextResponse.json(response, { status: options?.status ?? 200 });
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  options?: {
    status?: number;
    details?: Record<string, string[]>;
  }
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: {
      code,
      message,
      ...(options?.details && { details: options.details }),
    },
  };

  return NextResponse.json(response, { status: options?.status ?? 500 });
}

/**
 * Handle errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(err.message);
    });

    return errorResponse('VALIDATION_ERROR', 'Invalid request data', {
      status: 400,
      details,
    });
  }

  // Handle custom validation errors
  if (error instanceof ValidationError) {
    return errorResponse('VALIDATION_ERROR', error.message, {
      status: 400,
      details: error.details,
    });
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, {
      status: error.statusCode,
    });
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message;

    return errorResponse('INTERNAL_ERROR', message, { status: 500 });
  }

  return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', {
    status: 500,
  });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  notFound: (resource: string) =>
    errorResponse('NOT_FOUND', `${resource} not found`, { status: 404 }),

  unauthorized: () =>
    errorResponse('UNAUTHORIZED', 'Authentication required', { status: 401 }),

  forbidden: () =>
    errorResponse('FORBIDDEN', 'Access denied', { status: 403 }),

  badRequest: (message: string) =>
    errorResponse('BAD_REQUEST', message, { status: 400 }),

  methodNotAllowed: (method: string) =>
    errorResponse('METHOD_NOT_ALLOWED', `Method ${method} not allowed`, { status: 405 }),
};

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number = 1,
  limit: number = 20
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Parse pagination params from URL search params
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: { page: number; limit: number } = { page: 1, limit: 20 }
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? String(defaults.page)));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? String(defaults.limit))));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
