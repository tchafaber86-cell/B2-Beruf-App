"use client";

interface Props {
  label: string;
  value: number;
  max?: number;
}

export default function ScoreBar({ label, value, max = 100 }: Props) {
  const percent = Math.round((value / max) * 100);

  let color = "#b30000";
  if (percent >= 75) color = "green";
  else if (percent >= 60) color = "orange";

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>

      <div
        style={{
          height: 10,
          background: "#ddd",
          borderRadius: 6,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: color,
            transition: "width 0.6s ease"
          }}
        />
      </div>
    </div>
  );
}