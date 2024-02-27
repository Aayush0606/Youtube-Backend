class ApiError extends Error {
  constructor(statusCode = 400, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
export { ApiError };
