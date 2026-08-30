import StatusBadge from "./StatusBadge";
import { formatDateTime } from "@/lib/format";

/**
 * Incident history for a monitor. Incident records are created by a
 * later phase, so this is usually empty for now.
 */
export default function IncidentList({ incidents }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="state">
        <h3>No incidents recorded</h3>
        <p>
          Downtime incidents will appear here once incident tracking is enabled
          in a later phase.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>Status</th>
            <th>Reason</th>
            <th>Started</th>
            <th>Resolved</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>
                <StatusBadge status={incident.status} />
              </td>
              <td className="muted">{incident.reason || "—"}</td>
              <td className="muted">{formatDateTime(incident.started_at)}</td>
              <td className="muted">
                {incident.resolved_at
                  ? formatDateTime(incident.resolved_at)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
