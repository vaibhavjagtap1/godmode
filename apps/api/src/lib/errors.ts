export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(error: string, code: string, statusCode: number) {
    super(error);
    this.code = code;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode
    };
  }
}

export const asAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError('Internal server error', 'INTERNAL_SERVER_ERROR', 500);
};
