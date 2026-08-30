"use client";

import { useState } from "react";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export const EMPTY_MONITOR = {
  name: "",
  url: "",
  method: "GET",
  expected_status_code: 200,
  check_interval: 5,
  timeout: 10000,
};

/**
 * Client-side validation that mirrors the backend Joi rules. Returns a
 * { field: message } map; empty means valid.
 */
function validate(values) {
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Name is required.";
  else if (name.length > 150) errors.name = "Name must be 150 characters or fewer.";

  const url = values.url.trim();
  if (!url) {
    errors.url = "URL is required.";
  } else if (url.length > 2048) {
    errors.url = "URL must be 2048 characters or fewer.";
  } else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.url = "URL must start with http:// or https://";
      }
    } catch {
      errors.url = "Enter a valid http(s) URL.";
    }
  }

  if (!METHODS.includes(values.method)) errors.method = "Choose a valid method.";

  const code = Number(values.expected_status_code);
  if (!Number.isInteger(code) || code < 100 || code > 599)
    errors.expected_status_code = "Must be an integer between 100 and 599.";

  const interval = Number(values.check_interval);
  if (!Number.isInteger(interval) || interval < 1 || interval > 1440)
    errors.check_interval = "Must be an integer between 1 and 1440 minutes.";

  const timeout = Number(values.timeout);
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 120000)
    errors.timeout = "Must be an integer between 1 and 120000 ms.";

  return errors;
}

function Field({ id, label, hint, error, children }) {
  return (
    <div className={`field${error ? " invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <span className="hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

export default function MonitorForm({
  initialValues = EMPTY_MONITOR,
  submitLabel = "Save monitor",
  onSubmit,
  serverErrors = [],
  formError,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Map backend field errors ({ field, message }) onto inputs.
  const merged = { ...errors };
  for (const e of serverErrors) {
    if (e.field && !merged[e.field]) merged[e.field] = e.message;
  }

  const setField = (key) => (event) => {
    const raw = event.target.value;
    const numeric = ["expected_status_code", "check_interval", "timeout"];
    setValues((v) => ({
      ...v,
      [key]: numeric.includes(key) ? (raw === "" ? "" : Number(raw)) : raw,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        url: values.url.trim(),
        method: values.method,
        expected_status_code: Number(values.expected_status_code),
        check_interval: Number(values.check_interval),
        timeout: Number(values.timeout),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div className="banner banner-error">{formError}</div>
      ) : null}

      <Field id="name" label="Name" error={merged.name}>
        <input
          id="name"
          className="input"
          value={values.name}
          onChange={setField("name")}
          placeholder="GitHub API"
          maxLength={150}
        />
      </Field>

      <Field
        id="url"
        label="URL"
        hint="Public http(s) endpoint to monitor."
        error={merged.url}
      >
        <input
          id="url"
          className="input"
          value={values.url}
          onChange={setField("url")}
          placeholder="https://api.github.com"
        />
      </Field>

      <div className="form-row">
        <Field id="method" label="Method" error={merged.method}>
          <select
            id="method"
            className="select"
            value={values.method}
            onChange={setField("method")}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="expected_status_code"
          label="Expected status code"
          error={merged.expected_status_code}
        >
          <input
            id="expected_status_code"
            className="input"
            type="number"
            value={values.expected_status_code}
            onChange={setField("expected_status_code")}
            min={100}
            max={599}
          />
        </Field>
      </div>

      <div className="form-row">
        <Field
          id="check_interval"
          label="Check interval (minutes)"
          hint="Stored with the monitor; used when scheduling arrives later."
          error={merged.check_interval}
        >
          <input
            id="check_interval"
            className="input"
            type="number"
            value={values.check_interval}
            onChange={setField("check_interval")}
            min={1}
            max={1440}
          />
        </Field>

        <Field
          id="timeout"
          label="Timeout (ms)"
          error={merged.timeout}
        >
          <input
            id="timeout"
            className="input"
            type="number"
            value={values.timeout}
            onChange={setField("timeout")}
            min={1}
            max={120000}
          />
        </Field>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
