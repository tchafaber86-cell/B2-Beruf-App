"use client";

type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: Props) {
  const percentage = Math.min(
    100,
    Math.round((current / total) * 100)
  );

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>
        Situation {current} von {total} ({percentage}%)
      </div>

      <div
        style={{
          width: "100%",
          height: 14,
          background: "#e5e5e5",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid #ddd"
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "black",
            transition: "width 0.4s ease"
          }}
        />
      </div>
    </div>
  );
}