/**
 * Centralized PulseCheck API client.
 *
 * Every network call to the Express backend goes through here so
 * components never touch `fetch` directly and error handling stays
 * consistent. The backend base URL comes from NEXT_PUBLIC_API_URL.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, { status = null, errors = [] } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const options = { method };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
    options.headers = { "Content-Type": "application/json" };
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    throw new ApiError(
      `Cannot reach the PulseCheck API at ${BASE_URL}. Make sure the backend is running.`
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Some responses (or failures) have no JSON body.
  }

  if (!response.ok || !payload || payload.success === false) {
    throw new ApiError(
      (payload && payload.message) || `Request failed (${response.status})`,
      {
        status: response.status,
        errors: (payload && payload.errors) || [],
      }
    );
  }

  return payload.data;
}

// Monitors ------------------------------------------------------------

export const getMonitors = () => request("/monitors");

export const getMonitor = (id) => request(`/monitors/${id}`);

export const createMonitor = (data) =>
  request("/monitors", { method: "POST", body: data });

export const updateMonitor = (id, data) =>
  request(`/monitors/${id}`, { method: "PUT", body: data });

export const deleteMonitor = (id) =>
  request(`/monitors/${id}`, { method: "DELETE" });

export const updateMonitorStatus = (id, isActive) =>
  request(`/monitors/${id}/status`, {
    method: "PATCH",
    body: { is_active: isActive },
  });

// Health checks -----------------------------------------------------

export const checkMonitor = (id) =>
  request(`/monitors/${id}/check`, { method: "POST" });

export const getMonitorChecks = (id) => request(`/monitors/${id}/checks`);

export const getMonitorIncidents = (id) =>
  request(`/monitors/${id}/incidents`);

export const getMonitorStats = (id) => request(`/monitors/${id}/stats`);

// Dashboard -------------------------------------------------------

export const getRecentActivity = () => request("/activity");
