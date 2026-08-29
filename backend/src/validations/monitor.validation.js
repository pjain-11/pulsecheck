const Joi = require("joi");

/**
 * Joi schemas for the monitor endpoints.
 *
 * The API contract uses snake_case, so these schemas validate snake_case
 * input. src/utils/monitorMapper.js converts the result to model
 * attributes before it reaches the service layer.
 */

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const name = Joi.string().trim().min(1).max(150);

const url = Joi.string()
  .trim()
  .max(2048)
  .uri({ scheme: ["http", "https"] })
  .messages({
    "string.uri": "url must be a valid HTTP or HTTPS URL",
    "string.uriCustomScheme": "url must be a valid HTTP or HTTPS URL",
  });

// `.uppercase()` normalises the value before `.valid()` runs.
const method = Joi.string().trim().uppercase().valid(...HTTP_METHODS);

const expectedStatusCode = Joi.number().integer().min(100).max(599).messages({
  "number.min": "expected_status_code must be between 100 and 599",
  "number.max": "expected_status_code must be between 100 and 599",
});

// check_interval is in minutes; cap at 24 hours.
const checkInterval = Joi.number().integer().min(1).max(1440);

// timeout is in milliseconds; cap at 120 seconds.
const timeout = Joi.number().integer().min(1).max(120000);

const createMonitorSchema = Joi.object({
  name: name.required(),
  url: url.required(),
  method: method.default("GET"),
  expected_status_code: expectedStatusCode.default(200),
  check_interval: checkInterval.default(5),
  timeout: timeout.default(10000),
});

/**
 * PUT replaces the full editable configuration, so every editable field
 * is required. status, is_active and the timestamps are never accepted
 * here; they are managed by the backend.
 */
const updateMonitorSchema = Joi.object({
  name: name.required(),
  url: url.required(),
  method: method.required(),
  expected_status_code: expectedStatusCode.required(),
  check_interval: checkInterval.required(),
  timeout: timeout.required(),
});

const updateMonitorStatusSchema = Joi.object({
  is_active: Joi.boolean().required(),
});

const monitorIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "id must be a positive integer",
    "number.integer": "id must be a positive integer",
    "number.positive": "id must be a positive integer",
  }),
});

module.exports = {
  createMonitorSchema,
  updateMonitorSchema,
  updateMonitorStatusSchema,
  monitorIdParamSchema,
};
