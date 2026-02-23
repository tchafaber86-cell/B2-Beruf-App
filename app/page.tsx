"use client";

import Link from "next/link";

function Tile({
  title,
  subtitle,
  href,
  status,
  enabled,
  bullets,
}: {
  title: string;
  subtitle: string;
  href?: string;
  status: "LIVE" | "COMING SOON";
  enabled: boolean;
  bullets: string[];
}) {
  const content = (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 16,
        padding: 18,
        background: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        opacity: enabled ? 1 : 0.75,
        cursor: enabled ? "pointer" : "default",
        transition: "transform 0.08s ease",
      }}
      onMouseDown={(e) => {
        if (!enabled) return;
        (e.currentTarget as HTMLDivElement).style.transform = "scale(0.99)";
      }}
      onMouseUp={(e) => {
        if (!enabled) return;
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <p style={{ margin: "6px 0 0 0", color: "#444" }}>{subtitle}</p>
        </div>

        <span
          style={{
            border: "1px solid #ddd",
            borderRadius: 999,
            padding: "4px 10px",
            fontSize: 12,
            background: status === "LIVE" ? "#f8f8f8" : "#f3f3f3",
            whiteSpace: "nowrap",
            height: "fit-content",
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      </div>

      <ul style={{ marginTop: 12, lineHeight: 1.6, color: "#222" }}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <div style={{ marginTop: 14 }}>
        <span
          style={{
            display: "inline-block",
            padding: "10px 14px",
            background: enabled ? "black" : "#aaa",
            color: "white",
            borderRadius: 10,
            fontSize: 14,
          }}
        >
          {enabled ? "Öffnen →" : "Bald verfügbar"}
        </span>
      </div>
    </div>
  );

  if (enabled && href) {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  }
  return content;
}

export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 1100 }}>
      <h1 style={{ marginTop: 0 }}>BerufsDeutsch – Selbstlern-App</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: 18,
          background: "#f3f3f3",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Übersicht</h2>
        <p style={{ marginBottom: 0, lineHeight: 1.6 }}>
          Diese App bündelt prüfungsorientierte Schreibtrainings. Der Fokus liegt auf transparenter KI-Analyse
          (Pflichtpunkte mit Beleg-Zitaten) sowie auf Kriterien wie <strong>Ausdruck</strong>, <strong>Tiefe</strong>{" "}
          und <strong>Umfang</strong>.
        </p>
      </div>

      <h2 style={{ marginTop: 24 }}>Prüfung auswählen</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginTop: 12,
        }}
      >
        <Tile
          title="B2-DTB"
          subtitle="Schreiben (M1 + M2) + Simulation"
          href="/b2-dtb"
          status="LIVE"
          enabled={true}
          bullets={[
            "Training: M1 Beschwerdeantwort, M2 Forumsbeitrag",
            "Simulation: 20 Minuten, Auto-Abgabe, Anti-Refresh",
            "Bewertung inkl. Ausdruck, Tiefe, Umfang",
          ]}
        />

        <Tile
          title="DTZ"
          subtitle="A2/B1 – Prüfungsvorbereitung (später)"
          status="COMING SOON"
          enabled={false}
          bullets={[
            "Struktur wird vorbereitet (Navigation + Module)",
            "Später: Schreiben/Sprachbausteine/Redemittel",
            "Freischaltung nach M1/M2-Feinschliff",
          ]}
        />

        <Tile
          title="telc A2–B1"
          subtitle="Schrittweise Erweiterung (später)"
          status="COMING SOON"
          enabled={false}
          bullets={[
            "Geplant: Textsorten + Standard-Redemittel",
            "Aufgaben sehr konkret & prüfungsnah",
            "Gleiche Bewertungslogik (transparent + fair)",
          ]}
        />
      </div>

      <div style={{ marginTop: 26, borderTop: "1px solid #eee", paddingTop: 16 }}>
        <small style={{ color: "#444", lineHeight: 1.6 }}>
          Hinweis: Die App ist so aufgebaut, dass neue Prüfungen als eigene Bereiche ergänzt werden können,
          ohne die bestehende Architektur zu verändern.
        </small>
      </div>
    </main>
  );
}