const ApiError = require("../utils/ApiError");

/**
 * Builds middleware that validates one part of the request ("body" or
 * "params") against a Joi schema. On success the parsed/coerced value
 * replaces the original; on failure it forwards a 400 ApiError carrying
 * every field error.
 */
const validate = (schema, property = "body") => (req, res, next) => {
  const data = req[property] == null ? {} : req[property];

  const { value, error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context && detail.context.key
        ? detail.context.key
        : detail.path.join("."),
      message: detail.message.replace(/"/g, ""),
    }));
    return next(new ApiError(400, "Validation failed", errors));
  }

  if (property === "params") {
    // req.params is not reassignable on some Express versions.
    Object.assign(req.params, value);
  } else {
    req[property] = value;
  }

  return next();
};

module.exports = validate;
