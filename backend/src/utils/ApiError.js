/**
 * Application error with an HTTP status code and an optional list of
 * field-level details. Anything thrown as an ApiError is considered safe
 * to show to the client; everything else is treated as a 500.
 */
class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (Array.isArray(errors) && errors.length > 0) {
      this.errors = errors;
    }
  }
}

module.exports = ApiError;
