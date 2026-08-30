import Link from "next/link";

export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="state">
      <span className="spinner" />
      <p style={{ marginTop: 12 }}>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state">
      <h3>Something went wrong</h3>
      <p>{message || "Unable to load data."}</p>
      {onRetry ? (
        <button className="btn" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, message, actionHref, actionLabel }) {
  return (
    <div className="state">
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {actionHref ? (
        <Link className="btn btn-primary" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
