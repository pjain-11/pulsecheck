"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getMonitor, updateMonitor, ApiError } from "@/services/api";
import { useAsync } from "@/lib/useAsync";
import { LoadingState, ErrorState } from "@/components/States";
import MonitorForm from "@/components/MonitorForm";

export default function EditMonitorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading, error, data, reload } = useAsync(() => getMonitor(id), id);
  const [serverErrors, setServerErrors] = useState([]);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (payload) => {
    setServerErrors([]);
    setFormError(null);
    try {
      await updateMonitor(id, payload);
      router.push(`/monitors/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.errors.length > 0) {
        setServerErrors(err.errors);
        setFormError("Please fix the highlighted fields.");
      } else {
        setFormError(
          err instanceof ApiError ? err.message : "Could not update the monitor."
        );
      }
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <Link href="/monitors">Monitors</Link> /{" "}
        {data ? (
          <Link href={`/monitors/${id}`}>{data.name}</Link>
        ) : (
          `#${id}`
        )}{" "}
        / Edit
      </div>
      <div className="page-head">
        <h1 className="page-title">Edit Monitor</h1>
      </div>

      {loading ? (
        <LoadingState label="Loading monitor…" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <MonitorForm
          initialValues={{
            name: data.name,
            url: data.url,
            method: data.method,
            expected_status_code: data.expected_status_code,
            check_interval: data.check_interval,
            timeout: data.timeout,
          }}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          serverErrors={serverErrors}
          formError={formError}
        />
      )}
    </>
  );
}
