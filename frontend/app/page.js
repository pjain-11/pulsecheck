"use client";

import Link from "next/link";
import { getMonitors, getRecentActivity } from "@/services/api";
import { useAsync } from "@/lib/useAsync";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { formatMs, formatRelativeTime, formatStatusCode } from "@/lib/format";

export default function DashboardPage() {
  const { loading, error, data, reload } = useAsync(async () => {
    const [monitors, activity] = await Promise.all([
      getMonitors(),
      getRecentActivity(),
    ]);
    return { monitors, activity };
  });

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { monitors, activity } = data;
  const count = (s) => monitors.filter((m) => m.status === s).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Overview of your monitors and recent manual checks.
          </p>
        </div>
        <Link className="btn btn-primary" href="/monitors/new">
          Add Monitor
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard label="Total monitors" value={monitors.length} />
        <StatCard label="Up" value={count("UP")} tone="up" />
        <StatCard label="Down" value={count("DOWN")} tone="down" />
        <StatCard label="Unknown" value={count("UNKNOWN")} tone="unknown" />
      </div>

      <div className="section">
        <div className="section-title">Monitors</div>
        {monitors.length === 0 ? (
          <EmptyState
            title="No monitors yet"
            message="Add your first API endpoint to start monitoring."
            actionHref="/monitors/new"
            actionLabel="Add Monitor"
          />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Response time</th>
                  <th>Last checked</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {monitors.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/monitors/${m.id}`} className="cell-name">
                        {m.name}
                      </Link>
                      <div className="cell-url">{m.url}</div>
                    </td>
                    <td>
                      <StatusBadge status={m.status} />
                      {!m.is_active ? (
                        <span className="muted"> · inactive</span>
                      ) : null}
                    </td>
                    <td>{formatMs(m.last_check?.response_time)}</td>
                    <td className="muted">
                      {m.last_check
                        ? formatRelativeTime(m.last_check.checked_at)
                        : "Never"}
                    </td>
                    <td className="row-actions">
                      <Link className="btn btn-sm" href={`/monitors/${m.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title">Recent monitoring activity</div>
        {activity.length === 0 ? (
          <div className="state">
            <h3>No activity yet</h3>
            <p>Health-check results will show up here as you run checks.</p>
          </div>
        ) : (
          <div className="card feed">
            {activity.map((a) => (
              <div className="feed-item" key={a.id}>
                <StatusBadge status={a.status} />
                <div className="feed-main">
                  <Link
                    href={`/monitors/${a.monitor_id}`}
                    className="feed-name"
                  >
                    {a.monitor_name || `Monitor #${a.monitor_id}`}
                  </Link>
                  <div className="feed-meta">
                    HTTP {formatStatusCode(a.status_code)} ·{" "}
                    {formatMs(a.response_time)}
                    {a.error_message ? ` · ${a.error_message}` : ""}
                  </div>
                </div>
                <div className="feed-time">
                  {formatRelativeTime(a.checked_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
