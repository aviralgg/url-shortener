export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export class ApiResponse {
  static success(data = {}, message = '') {
    return { success: true, data, message };
  }

  static error(message = '', errors = []) {
    return { success: false, message, errors };
  }
}
