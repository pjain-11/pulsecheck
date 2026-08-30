/**
 * Public JSON shapes for health-check and incident records.
 */

const serializeHealthCheck = (check) => ({
  id: check.id,
  monitor_id: check.monitorId,
  status: check.status,
  status_code: check.statusCode,
  response_time: check.responseTime,
  error_message: check.errorMessage,
  checked_at: check.checkedAt,
});

const serializeIncident = (incident) => ({
  id: incident.id,
  monitor_id: incident.monitorId,
  status: incident.status,
  reason: incident.reason,
  started_at: incident.startedAt,
  resolved_at: incident.resolvedAt,
});

module.exports = { serializeHealthCheck, serializeIncident };
