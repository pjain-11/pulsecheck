const net = require("node:net");

/**
 * Basic SSRF protection for outbound health-check requests.
 *
 * This is an MVP guard, NOT a production SSRF firewall. It only inspects
 * the literal URL:
 *   - allows http/https only
 *   - blocks localhost and obvious loopback / private / link-local hosts
 *
 * It does NOT resolve DNS, so a public hostname that resolves to a
 * private address still passes. A production implementation should
 * resolve the host, re-check every resolved address, pin the connection
 * to a vetted IP, and enforce egress rules at the network layer. We also
 * disable HTTP redirect following in the health-check service so a
 * redirect cannot bounce the request to an internal target.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "0.0.0.0",
  "::",
  "::1",
  "ip6-localhost",
  "ip6-loopback",
]);

const BLOCKED_SUFFIXES = [".local", ".internal", ".localhost"];

const isPrivateIPv4 = (ip) => {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  return (
    a === 0 || // "this" network
    a === 10 || // private
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local incl. cloud metadata 169.254.169.254
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) // private
  );
};

const isPrivateIPv6 = (ip) => {
  const x = ip.toLowerCase();
  if (x === "::1" || x === "::") return true;
  if (x.startsWith("fe80")) return true; // link-local
  if (x.startsWith("fc") || x.startsWith("fd")) return true; // unique local
  // IPv4-mapped (::ffff:127.0.0.1) -> check the embedded IPv4
  const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
};

/**
 * @param {string} rawUrl
 * @returns {{ allowed: boolean, reason?: string }}
 */
const inspectUrl = (rawUrl) => {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: "URL is not valid" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { allowed: false, reason: `Protocol "${url.protocol}" is not allowed` };
  }

  const host = url.hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");

  if (BLOCKED_HOSTNAMES.has(host)) {
    return { allowed: false, reason: "Loopback / localhost targets are not allowed" };
  }
  if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return { allowed: false, reason: "Internal hostnames are not allowed" };
  }

  const ipVersion = net.isIP(host);
  if (ipVersion === 4 && isPrivateIPv4(host)) {
    return { allowed: false, reason: "Private or loopback IP addresses are not allowed" };
  }
  if (ipVersion === 6 && isPrivateIPv6(host)) {
    return { allowed: false, reason: "Private or loopback IP addresses are not allowed" };
  }

  return { allowed: true };
};

module.exports = { inspectUrl };
