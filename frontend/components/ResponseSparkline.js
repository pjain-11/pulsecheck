/**
 * Tiny inline-SVG sparkline of response times. No chart library.
 * `points` is an array of numbers (ms), oldest-to-newest.
 */
export default function ResponseSparkline({ points }) {
  const values = (points || []).filter(
    (v) => typeof v === "number" && !Number.isNaN(v)
  );

  if (values.length < 2) {
    return <div className="sparkline-empty">Not enough data for a trend yet.</div>;
  }

  const width = 600;
  const height = 48;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / span) * (height - 6) - 3;
    return [x, y];
  });

  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Response time trend, latest ${values[values.length - 1]} ms`}
    >
      <polygon points={area} fill="var(--accent-soft)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
