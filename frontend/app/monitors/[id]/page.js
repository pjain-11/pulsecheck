"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getMonitor,
  getMonitorStats,
  getMonitorChecks,
  getMonitorIncidents,
  deleteMonitor,
  updateMonitorStatus,
  ApiError,
} from "@/services/api";
import { useAsync } from "@/lib/useAsync";
import { LoadingState, ErrorState } from "@/components/States";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import CheckNowButton from "@/components/CheckNowButton";
import HealthHistory from "@/components/HealthHistory";
import IncidentList from "@/components/IncidentList";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  formatDateTime,
  formatMs,
  formatStatusCode,
  formatUptime,
} from "@/lib/format";

export default function MonitorDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { loading, error, data, reload, setData } = useAsync(async () => {
    const [monitor, stats, checks, incidents] = await Promise.all([
      getMonitor(id),
      getMonitorStats(id),
      getMonitorChecks(id),
      getMonitorIncidents(id),
    ]);
    return { monitor, stats, checks, incidents };
  }, id);

  const [lastResult, setLastResult] = useState(null);
  const [banner, setBanner] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const flash = (type, text) => setBanner({ type, text });

  if (loading) return <LoadingState label="Loading monitor…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { monitor, stats, checks, incidents } = data;

  const onCheckResult = (result) => {
    setLastResult(result);
    setBanner(null);
    // Refresh stats + history without a full-page spinner.
    Promise.all([getMonitor(id), getMonitorStats(id), getMonitorChecks(id)])
      .then(([m, s, c]) => setData({ monitor: m, stats: s, checks: c, incidents }))
      .catch(() => {});
  };

  const toggleActive = async () => {
    setTogglingActive(true);
    try {
      const next = !monitor.is_active;
      await updateMonitorStatus(id, next);
      setData((d) => ({ ...d, monitor: { ...d.monitor, is_active: next } }));
      flash("success", next ? "Monitor activated." : "Monitor deactivated.");
    } catch (err) {
      flash("error", err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setTogglingActive(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteMonitor(id);
      router.push("/monitors");
    } catch (err) {
      setDeleting(false);
      setConfirmOpen(false);
      flash("error", err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <Link href="/monitors">Monitors</Link> / {monitor.name}
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">
            {monitor.name} <StatusBadge status={monitor.status} />
          </h1>
          <p className="page-subtitle mono">{monitor.url}</p>
        </div>
        <div className="toolbar">
          <CheckNowButton
            monitorId={monitor.id}
            onResult={onCheckResult}
            onError={(msg) => flash("error", msg)}
          />
          <Link className="btn" href={`/monitors/${monitor.id}/edit`}>
            Edit
          </Link>
          <button
            className="btn"
            onClick={toggleActive}
            disabled={togglingActive}
          >
            {monitor.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {banner ? (
        <div
          className={`banner banner-${banner.type}`}
          style={{ marginBottom: 16 }}
        >
          {banner.text}
        </div>
      ) : null}

      {lastResult ? (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head">
            Latest check result <StatusBadge status={lastResult.status} />
          </div>
          <div className="check-result">
            <div>
              <div className="k">Result</div>
              <div className="v">{lastResult.status}</div>
            </div>
            <div>
              <div className="k">HTTP status</div>
              <div className="v">
                {formatStatusCode(lastResult.status_code)}
              </div>
            </div>
            <div>
              <div className="k">Response time</div>
              <div className="v">{formatMs(lastResult.response_time)}</div>
            </div>
            <div>
              <div className="k">Checked at</div>
              <div className="v">{formatDateTime(lastResult.checked_at)}</div>
            </div>
            {lastResult.error_message ? (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="k">Error</div>
                <div className="v" style={{ color: "var(--down)" }}>
                  {lastResult.error_message}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="detail-grid">
        <div className="detail-item">
          <div className="k">Current status</div>
          <div className="v">
            <StatusBadge status={monitor.status} />
          </div>
        </div>
        <div className="detail-item">
          <div className="k">Method</div>
          <div className="v">
            <span className="pill">{monitor.method}</span>
          </div>
        </div>
        <div className="detail-item">
          <div className="k">Expected status</div>
          <div className="v">{monitor.expected_status_code}</div>
        </div>
        <div className="detail-item">
          <div className="k">Active</div>
          <div className="v">{monitor.is_active ? "Yes" : "No"}</div>
        </div>
        <div className="detail-item">
          <div className="k">Check interval</div>
          <div className="v">{monitor.check_interval} min</div>
        </div>
        <div className="detail-item">
          <div className="k">Timeout</div>
          <div className="v">{formatMs(monitor.timeout)}</div>
        </div>
        <div className="detail-item">
          <div className="k">Last check</div>
          <div className="v">
            {stats.last_check
              ? formatDateTime(stats.last_check.checked_at)
              : "Never"}
          </div>
        </div>
        <div className="detail-item">
          <div className="k">Last response time</div>
          <div className="v">
            {formatMs(stats.last_check?.response_time)}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Statistics</div>
        <div className="stat-grid">
          <StatCard
            label="Uptime"
            value={formatUptime(stats.uptime_percentage)}
          />
          <StatCard label="Total checks" value={stats.total_checks} />
          <StatCard
            label="Successful"
            value={stats.successful_checks}
            tone="up"
          />
          <StatCard label="Failed" value={stats.failed_checks} tone="down" />
          <StatCard
            label="Avg response time"
            value={formatMs(stats.average_response_time)}
          />
        </div>
      </div>

      <div className="section">
        <div className="section-title">Health-check history</div>
        <HealthHistory checks={checks} />
      </div>

      <div className="section">
        <div className="section-title">Incidents</div>
        <IncidentList incidents={incidents} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete monitor?"
        message={`"${monitor.name}" and its health-check history will be permanently removed.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
