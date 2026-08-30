/**
 * Translates between the snake_case API contract and the camelCase
 * Sequelize model attributes, and shapes the outgoing JSON so we never
 * leak internal fields.
 */

// API field -> model attribute, for fields a client is allowed to set.
const WRITABLE_FIELDS = {
  name: "name",
  url: "url",
  method: "method",
  expected_status_code: "expectedStatusCode",
  check_interval: "checkInterval",
  timeout: "timeout",
  is_active: "isActive",
};

/**
 * Picks the writable fields out of a validated request body and returns
 * them keyed by model attribute name.
 */
const toModelAttributes = (body) => {
  const attributes = {};
  for (const [apiKey, modelKey] of Object.entries(WRITABLE_FIELDS)) {
    if (body[apiKey] !== undefined) {
      attributes[modelKey] = body[apiKey];
    }
  }
  return attributes;
};

/**
 * Public representation of a monitor returned by the API.
 *
 * When the caller loaded the `healthChecks` association (list / detail
 * endpoints), a `last_check` summary is attached — `null` if the monitor
 * has never been checked. Endpoints that don't load it (create / update
 * / status) simply omit the field.
 */
const serializeMonitor = (monitor) => {
  const data = {
    id: monitor.id,
    name: monitor.name,
    url: monitor.url,
    method: monitor.method,
    expected_status_code: monitor.expectedStatusCode,
    status: monitor.status,
    is_active: monitor.isActive,
    check_interval: monitor.checkInterval,
    timeout: monitor.timeout,
  };

  if (Array.isArray(monitor.healthChecks)) {
    const last = monitor.healthChecks[0];
    data.last_check = last
      ? {
          status: last.status,
          status_code: last.statusCode,
          response_time: last.responseTime,
          error_message: last.errorMessage,
          checked_at: last.checkedAt,
        }
      : null;
  }

  return data;
};

module.exports = { toModelAttributes, serializeMonitor };
