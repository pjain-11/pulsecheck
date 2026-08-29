const { BaseError, ValidationError } = require("sequelize");
const logger = require("../utils/logger");

/**
 * Central error handler. Produces a consistent failure shape and never
 * leaks database internals or stack traces to the client.
 *
 *   { success: false, message: "...", errors?: [...] }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors;

  // Malformed JSON body from express.json().
  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
    errors = undefined;
  } else if (err instanceof ValidationError) {
    // Sequelize validation / constraint violations -> 400 with field detail.
    status = 400;
    message = "Validation failed";
    errors = err.errors.map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (err instanceof BaseError) {
    // Any other Sequelize/database error: log it, hide the details.
    status = 500;
  }

  if (status >= 500) {
    logger.error(err);
    message = "Internal server error";
    errors = undefined;
  }

  const body = { success: false, message };
  if (Array.isArray(errors) && errors.length > 0) {
    body.errors = errors;
  }

  res.status(status).json(body);
};

module.exports = errorHandler;
