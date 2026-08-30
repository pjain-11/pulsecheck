const LABELS = {
  UP: "Up",
  DOWN: "Down",
  UNKNOWN: "Unknown",
  OPEN: "Open",
  RESOLVED: "Resolved",
};

/**
 * Colored pill for a monitor / health-check / incident status.
 */
export default function StatusBadge({ status }) {
  const key = String(status || "UNKNOWN").toUpperCase();
  const cls = key.toLowerCase();
  return (
    <span className={`badge badge-${cls}`}>{LABELS[key] || key}</span>
  );
}
