/**
 * Small display helpers shared across the UI. All of them tolerate
 * null/undefined and return an em dash so components stay simple.
 */

const DASH = "—";

export function formatDateTime(value) {
  if (!value) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DASH;
  return date.toLocaleString();
}

export function formatRelativeTime(value) {
  if (!value) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DASH;

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString();
}

export function formatMs(value) {
  if (value === null || value === undefined) return DASH;
  const ms = Number(value);
  if (Number.isNaN(ms)) return DASH;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatUptime(value) {
  if (value === null || value === undefined) return DASH;
  const pct = Number(value);
  if (Number.isNaN(pct)) return DASH;
  return `${pct.toFixed(pct % 1 === 0 ? 0 : 2)}%`;
}

export function formatStatusCode(value) {
  if (value === null || value === undefined) return DASH;
  return String(value);
}
