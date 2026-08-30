const monitorService = require("../services/monitor.service");
const insightsService = require("../services/insights.service");
const asyncHandler = require("../utils/asyncHandler");
const { serializeHealthCheck, serializeIncident } = require("../utils/insightMapper");

/**
 * Read-only endpoints for the dashboard / monitor detail page.
 */

const listChecks = asyncHandler(async (req, res) => {
  await monitorService.getMonitor(req.params.id); // 404s if the monitor is gone
  const checks = await insightsService.listChecks(req.params.id, req.query.limit);
  res.json({ success: true, data: checks.map(serializeHealthCheck) });
});

const listIncidents = asyncHandler(async (req, res) => {
  await monitorService.getMonitor(req.params.id);
  const incidents = await insightsService.listIncidents(req.params.id);
  res.json({ success: true, data: incidents.map(serializeIncident) });
});

const getStats = asyncHandler(async (req, res) => {
  const monitor = await monitorService.getMonitor(req.params.id);
  const stats = await insightsService.getStats(req.params.id);
  const checks = await insightsService.listChecks(req.params.id, 1);

  res.json({
    success: true,
    data: {
      monitor_id: monitor.id,
      current_status: monitor.status,
      ...stats,
      last_check: checks[0] ? serializeHealthCheck(checks[0]) : null,
    },
  });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const checks = await insightsService.listRecentActivity(req.query.limit);
  res.json({
    success: true,
    data: checks.map((check) => ({
      ...serializeHealthCheck(check),
      monitor_name: check.monitor ? check.monitor.name : null,
    })),
  });
});

module.exports = { listChecks, listIncidents, getStats, getRecentActivity };
