"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createMonitor, ApiError } from "@/services/api";
import MonitorForm, { EMPTY_MONITOR } from "@/components/MonitorForm";

export default function NewMonitorPage() {
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState([]);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (payload) => {
    setServerErrors([]);
    setFormError(null);
    try {
      const monitor = await createMonitor(payload);
      router.push(`/monitors/${monitor.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        setServerErrors(err.errors);
        setFormError("Please fix the highlighted fields.");
      } else {
        setFormError(
          err instanceof ApiError ? err.message : "Could not create the monitor."
        );
      }
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <Link href="/monitors">Monitors</Link> / New
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Add Monitor</h1>
          <p className="page-subtitle">
            New monitors start as <strong>Unknown</strong> until the first
            manual check.
          </p>
        </div>
      </div>

      <MonitorForm
        initialValues={EMPTY_MONITOR}
        submitLabel="Create monitor"
        onSubmit={handleSubmit}
        serverErrors={serverErrors}
        formError={formError}
      />
    </>
  );
}
