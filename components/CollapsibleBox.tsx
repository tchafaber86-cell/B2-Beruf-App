"use client";

import { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function CollapsibleBox({ title, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 25 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px 14px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#f5f5f5",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        {open ? "▲ " : "▼ "} {title}
      </button>

      {open && (
        <div
          style={{
            marginTop: 15,
            padding: 20,
            background: "#fafafa",
            border: "1px solid #ddd",
            borderRadius: 8
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}