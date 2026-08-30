/**
 * Single metric tile used on the dashboard and monitor detail page.
 * `tone` optionally colors the value (up / down / unknown).
 */
export default function StatCard({ label, value, tone }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={`stat-value${tone ? ` ${tone}` : ""}`}>{value}</div>
    </div>
  );
}
