"use client";

import { useState } from "react";
import { checkMonitor, ApiError } from "@/services/api";

/**
 * Triggers a single manual health check (POST /api/monitors/:id/check).
 * Calls `onResult(data)` on success and `onError(message)` on failure so
 * the parent can refresh / display the outcome. No polling.
 */
export default function CheckNowButton({
  monitorId,
  onResult,
  onError,
  variant = "primary",
  size,
}) {
  const [checking, setChecking] = useState(false);

  const run = async () => {
    setChecking(true);
    try {
      const result = await checkMonitor(monitorId);
      if (onResult) onResult(result);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Health check failed";
      if (onError) onError(message);
    } finally {
      setChecking(false);
    }
  };

  const cls = [
    "btn",
    variant === "primary" ? "btn-primary" : "",
    size === "sm" ? "btn-sm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} onClick={run} disabled={checking}>
      {checking ? (
        <>
          <span className="spinner" /> Checking…
        </>
      ) : (
        "Check Now"
      )}
    </button>
  );
}
