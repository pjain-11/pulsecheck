const { Monitor, HealthCheck } = require("../models");
const ApiError = require("../utils/ApiError");

// Pulls in only the single most recent health check for each monitor so
// the list / detail responses can show "last checked" and "response
// time" without an extra round-trip. `separate: true` keeps this to one
// additional query rather than one per row.
const LAST_CHECK_INCLUDE = {
  model: HealthCheck,
  as: "healthChecks",
  separate: true,
  limit: 1,
  order: [
    ["checkedAt", "DESC"],
    ["id", "DESC"],
  ],
};

/**
 * Monitor persistence / business operations. Controllers call into here
 * and never touch the model directly.
 *
 * `status` is intentionally not writable through any of these functions;
 * it will be owned by the monitoring engine in a later phase.
 */

const findByIdOrFail = async (id, options = {}) => {
  const monitor = await Monitor.findByPk(id, options);
  if (!monitor) {
    throw new ApiError(404, "Monitor not found");
  }
  return monitor;
};

const createMonitor = (attributes) => Monitor.create(attributes);

const listMonitors = () =>
  // id is the tie-breaker: created_at has second precision, so monitors
  // created within the same second would otherwise order unpredictably.
  Monitor.findAll({
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    include: [LAST_CHECK_INCLUDE],
  });

const getMonitor = (id) => findByIdOrFail(id, { include: [LAST_CHECK_INCLUDE] });

const updateMonitor = async (id, attributes) => {
  const monitor = await findByIdOrFail(id);
  return monitor.update(attributes);
};

const deleteMonitor = async (id) => {
  const monitor = await findByIdOrFail(id);
  // health_checks / incidents are removed by the ON DELETE CASCADE
  // foreign keys defined in the Phase 2 migrations.
  await monitor.destroy();
};

const setMonitorActive = async (id, isActive) => {
  const monitor = await findByIdOrFail(id);
  return monitor.update({ isActive });
};

module.exports = {
  createMonitor,
  listMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  setMonitorActive,
};
