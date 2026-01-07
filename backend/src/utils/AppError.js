class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; //to mark expected errors (operational errors)

    Error.captureStackTrace(this, this.constructor); //excluding constructor from stack trace
  }
}

export default AppError;
