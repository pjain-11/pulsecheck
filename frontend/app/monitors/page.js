"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getMonitors,
  deleteMonitor,
  updateMonitorStatus,
  ApiError,
} from "@/services/api";
import { useAsync } from "@/lib/useAsync";
import { LoadingState, ErrorState, EmptyState } from "@/components/States";
import StatusBadge from "@/components/StatusBadge";
import CheckNowButton from "@/components/CheckNowButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatMs, formatRelativeTime } from "@/lib/format";

export default function MonitorsPage() {
  const { loading, error, data, reload, setData } = useAsync(getMonitors);
  const [banner, setBanner] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyRow, setBusyRow] = useState(null);

  const flash = (type, text) => {
    setBanner({ type, text });
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setBanner(null), 4000);
  };

  const patchRow = (id, changes) =>
    setData((rows) =>
      rows.map((m) => (m.id === id ? { ...m, ...changes } : m))
    );

  const toggleActive = async (monitor) => {
    setBusyRow(monitor.id);
    try {
      const next = !monitor.is_active;
      await updateMonitorStatus(monitor.id, next);
      patchRow(monitor.id, { is_active: next });
      flash("success", `${monitor.name} ${next ? "activated" : "deactivated"}.`);
    } catch (err) {
      flash("error", err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setBusyRow(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteMonitor(pendingDelete.id);
      setData((rows) => rows.filter((m) => m.id !== pendingDelete.id));
      flash("success", `${pendingDelete.name} deleted.`);
      setPendingDelete(null);
    } catch (err) {
      flash("error", err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Monitors</h1>
          <p className="page-subtitle">
            Manage endpoints and run manual health checks.
          </p>
        </div>
        <Link className="btn btn-primary" href="/monitors/new">
          Add Monitor
        </Link>
      </div>

      {banner ? (
        <div
          className={`banner banner-${banner.type}`}
          style={{ marginBottom: 16 }}
        >
          {banner.text}
        </div>
      ) : null}

      {loading ? (
        <LoadingState label="Loading monitors…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
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
                <th>Method</th>
                <th>Status</th>
                <th>Response time</th>
                <th>Last checked</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/monitors/${m.id}`} className="cell-name">
                      {m.name}
                    </Link>
                    <div className="cell-url">{m.url}</div>
                  </td>
                  <td>
                    <span className="pill">{m.method}</span>
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>{formatMs(m.last_check?.response_time)}</td>
                  <td className="muted">
                    {m.last_check
                      ? formatRelativeTime(m.last_check.checked_at)
                      : "Never"}
                  </td>
                  <td>
                    <button
                      className="switch"
                      onClick={() => toggleActive(m)}
                      disabled={busyRow === m.id}
                      title={m.is_active ? "Deactivate" : "Activate"}
                    >
                      <span
                        className={`switch-track${m.is_active ? " on" : ""}`}
                      >
                        <span className="switch-thumb" />
                      </span>
                      {m.is_active ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="row-actions">
                    <CheckNowButton
                      monitorId={m.id}
                      variant="ghost"
                      size="sm"
                      onResult={(r) =>
                        patchRow(m.id, {
                          status: r.status,
                          last_check: {
                            status: r.status,
                            status_code: r.status_code,
                            response_time: r.response_time,
                            error_message: r.error_message,
                            checked_at: r.checked_at,
                          },
                        })
                      }
                      onError={(msg) => flash("error", msg)}
                    />
                    <Link className="btn btn-sm" href={`/monitors/${m.id}`}>
                      View
                    </Link>
                    <Link
                      className="btn btn-sm"
                      href={`/monitors/${m.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setPendingDelete(m)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete monitor?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" and its health-check history will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
