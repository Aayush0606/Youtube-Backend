class ApiError {
  constructor(statusCode = 400, message = "Something went wrong", errors = []) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
  }
}

class ApiResponse {
  constructor(statusCode = 200, message = "Success", data = []) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = true;
  }
}

export { ApiError, ApiResponse };
