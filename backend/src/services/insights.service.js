const { fn, col, literal } = require("sequelize");
const { HealthCheck, Incident, Monitor } = require("../models");

/**
 * Read-only queries that power the frontend dashboard and monitor
 * detail page: health-check history, incidents, aggregate stats and a
 * cross-monitor activity feed.
 *
 * Nothing here triggers a check or writes data.
 */

const clampLimit = (value, fallback, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
};

const listChecks = (monitorId, limit) =>
  HealthCheck.findAll({
    where: { monitorId },
    order: [["checkedAt", "DESC"], ["id", "DESC"]],
    limit: clampLimit(limit, 50, 200),
  });

const listIncidents = (monitorId) =>
  Incident.findAll({
    where: { monitorId },
    order: [["startedAt", "DESC"], ["id", "DESC"]],
  });

const getStats = async (monitorId) => {
  const row = await HealthCheck.findOne({
    where: { monitorId },
    attributes: [
      [fn("COUNT", col("id")), "total"],
      [fn("SUM", literal("CASE WHEN status = 'UP' THEN 1 ELSE 0 END")), "up"],
      [fn("AVG", col("response_time")), "avgResponseTime"],
    ],
    raw: true,
  });

  const total = Number(row.total) || 0;
  const successful = Number(row.up) || 0;
  const failed = total - successful;

  return {
    total_checks: total,
    successful_checks: successful,
    failed_checks: failed,
    uptime_percentage:
      total === 0 ? null : Math.round((successful / total) * 10000) / 100,
    average_response_time:
      row.avgResponseTime == null ? null : Math.round(Number(row.avgResponseTime)),
  };
};

const listRecentActivity = (limit) =>
  HealthCheck.findAll({
    order: [["checkedAt", "DESC"], ["id", "DESC"]],
    limit: clampLimit(limit, 20, 100),
    include: [{ model: Monitor, as: "monitor", attributes: ["id", "name"] }],
  });

module.exports = {
  listChecks,
  listIncidents,
  getStats,
  listRecentActivity,
};
