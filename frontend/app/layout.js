import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "PulseCheck",
  description: "API uptime & health monitoring dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
