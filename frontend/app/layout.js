import "./globals.css";

export const metadata = {
  title: "PulseCheck",
  description: "API Uptime & Health Monitoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
