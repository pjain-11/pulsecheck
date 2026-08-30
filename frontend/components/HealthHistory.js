import StatusBadge from "./StatusBadge";
import ResponseSparkline from "./ResponseSparkline";
import { formatDateTime, formatMs, formatStatusCode } from "@/lib/format";

/**
 * Response-time trend + a table of recent health checks.
 * `checks` is newest-first (as returned by the API).
 */
export default function HealthHistory({ checks }) {
  if (!checks || checks.length === 0) {
    return (
      <div className="state">
        <h3>No checks yet</h3>
        <p>Run a health check to start building history.</p>
      </div>
    );
  }

  const trend = [...checks]
    .reverse()
    .map((c) => c.response_time)
    .filter((v) => v !== null && v !== undefined);

  return (
    <div>
      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="section-title">Response time (last {trend.length})</div>
        <ResponseSparkline points={trend} />
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Result</th>
              <th>HTTP</th>
              <th>Response time</th>
              <th>Error</th>
              <th>Checked at</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.id}>
                <td>
                  <StatusBadge status={check.status} />
                </td>
                <td className="mono">{formatStatusCode(check.status_code)}</td>
                <td>{formatMs(check.response_time)}</td>
                <td className="muted">{check.error_message || "—"}</td>
                <td className="muted">{formatDateTime(check.checked_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
