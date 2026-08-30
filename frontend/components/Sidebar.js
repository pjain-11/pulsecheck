"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/monitors", label: "Monitors" },
  { href: "/monitors/new", label: "Add Monitor" },
];

function matchActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href === "/monitors/new") return pathname === "/monitors/new";
  // "Monitors" covers the list and every detail/edit page, but not "new".
  return (
    pathname === "/monitors" ||
    (pathname.startsWith("/monitors/") && pathname !== "/monitors/new")
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-dot" />
        PulseCheck
      </Link>

      <nav className="nav">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${
              matchActive(pathname, link.href) ? " active" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-foot">
        Manual health checks only — no background scheduler.
      </div>
    </aside>
  );
}
