const { performance } = require("node:perf_hooks");

const { sequelize, HealthCheck } = require("../models");
const ApiError = require("../utils/ApiError");
const { inspectUrl } = require("../utils/urlGuard");
const logger = require("../utils/logger");

const USER_AGENT = "PulseCheck/1.0";

/**
 * Turns a low-level fetch error into a short, safe message. The full
 * error is logged separately; only this string reaches the database and
 * the API response.
 */
const describeRequestError = (error) => {
  if (error.name === "AbortError") {
    return "Request timed out";
  }
  const code = error.cause && error.cause.code;
  switch (code) {
    case "ENOTFOUND":
    case "EAI_AGAIN":
      return "DNS lookup failed";
    case "ECONNREFUSED":
      return "Connection refused";
    case "ECONNRESET":
      return "Connection reset";
    case "ETIMEDOUT":
      return "Connection timed out";
    case "DEPTH_ZERO_SELF_SIGNED_CERT":
    case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
    case "CERT_HAS_EXPIRED":
      return "TLS certificate error";
    default:
      return "Network request failed";
  }
};

/**
 * Performs the outbound HTTP request with a hard timeout via
 * AbortController. Never throws for HTTP-level failures (4xx/5xx); it
 * only throws for transport errors and timeouts.
 *
 * @returns {Promise<{ statusCode: number, responseTime: number }>}
 */
const performRequest = async (monitor) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), monitor.timeout);

  const startedAt = performance.now();
  try {
    const response = await fetch(monitor.url, {
      method: monitor.method,
      redirect: "manual", // do not follow redirects (see urlGuard.js)
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    return {
      statusCode: response.status,
      responseTime: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    error.responseTime = Math.round(performance.now() - startedAt);
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Runs one manual health check for a monitor:
 *   request -> evaluate -> persist (health_checks row + monitor.status).
 *
 * The HTTP request happens outside the DB transaction; only the two
 * writes are wrapped so they succeed or fail together.
 *
 * @param {import("sequelize").Model} monitor  a Monitor instance
 * @returns {Promise<object>} the persisted result
 */
const checkMonitor = async (monitor) => {
  if (!monitor.isActive) {
    throw new ApiError(400, "Monitor is inactive");
  }

  const guard = inspectUrl(monitor.url);
  if (!guard.allowed) {
    throw new ApiError(400, `Monitor URL is not allowed: ${guard.reason}`);
  }

  let status;
  let statusCode = null;
  let responseTime = 0;
  let errorMessage = null;

  try {
    const result = await performRequest(monitor);
    statusCode = result.statusCode;
    responseTime = result.responseTime;

    if (statusCode === monitor.expectedStatusCode) {
      status = "UP";
    } else {
      status = "DOWN";
      errorMessage = "Unexpected HTTP status code";
    }
  } catch (error) {
    logger.error(
      `Health check request failed for monitor ${monitor.id} (${monitor.url}):`,
      error
    );
    status = "DOWN";
    statusCode = null;
    responseTime = error.responseTime || 0;
    errorMessage = describeRequestError(error);
  }

  const checkedAt = new Date();

  const transaction = await sequelize.transaction();
  try {
    await HealthCheck.create(
      { monitorId: monitor.id, status, statusCode, responseTime, errorMessage, checkedAt },
      { transaction }
    );
    // Health status only; is_active is never touched here.
    await monitor.update({ status }, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return {
    monitor_id: monitor.id,
    status,
    status_code: statusCode,
    response_time: responseTime,
    checked_at: checkedAt.toISOString(),
    error_message: errorMessage,
  };
};

module.exports = { checkMonitor };
