export type ErrorCode = 
  | 'UNAUTHORIZED'    // Not logged in
  | 'FORBIDDEN'       // Logged in, but trying to touch someone else's ward
  | 'NOT_FOUND'       // Item doesn't exist
  | 'VALIDATION'      // Zod caught bad data
  | 'CONFLICT'        // e.g., Double-booking a shift
  | 'INTERNAL_ERROR'; // Something exploded

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: ErrorCode, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const throwUnauthorized = (msg = "Session expired. Please log in.") => {
  throw new AppError(msg, 'UNAUTHORIZED', 401);
};

export const throwForbidden = (msg = "You do not have permission for this ward.") => {
  throw new AppError(msg, 'FORBIDDEN', 403);
};

export const throwNotFound = (msg = "The requested record was not found.") => {
  throw new AppError(msg, 'NOT_FOUND', 404);
};

export const throwConflict = (msg: string) => {
  throw new AppError(msg, 'CONFLICT', 409);
};