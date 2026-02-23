"use client";

import Link from "next/link";

function Card({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 14,
          padding: 18,
          background: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          cursor: "pointer",
          transition: "transform 0.08s ease",
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(0.99)";
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          {badge ? (
            <span
              style={{
                border: "1px solid #ddd",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                background: "#f8f8f8",
                whiteSpace: "nowrap",
                height: "fit-content",
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>

        <p style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>{desc}</p>

        <div style={{ marginTop: 14 }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 14px",
              background: "black",
              color: "white",
              borderRadius: 10,
              fontSize: 14,
            }}
          >
            Öffnen →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function B2DTBHome() {
  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 1100 }}>
      <h1 style={{ marginTop: 0 }}>B2 Beruf · DTB</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 14,
          padding: 18,
          background: "#f3f3f3",
        }}
      >
        <h2 style={{ marginTop: 0 }}>So funktioniert die Bewertung</h2>
        <ul style={{ marginTop: 10, lineHeight: 1.6 }}>
          <li>
            Übersicht: <strong>Gesamtpunktzahl</strong> + Kategorien (Struktur, Kohäsion, Register, Grammatik,
            Wortschatz, <strong>Ausdruck</strong>, <strong>Tiefe</strong>, <strong>Umfang</strong>).
          </li>
          <li>
            Pflichtpunkte werden <strong>mit Beleg-Zitat</strong> aus dem Text angezeigt (transparent & fair).
          </li>
          <li>
            Redemittel erscheinen <strong>erst nach dem Versuch</strong>.
          </li>
          <li>
            Im Prüfungsmodus: <strong>20 Minuten</strong>, Auto-Abgabe bei 00:00, Warnung bei 05:00,
            Anti-Refresh aktiv, Paste/Cut gesperrt.
          </li>
        </ul>
      </div>

      <h2 style={{ marginTop: 24 }}>Modul wählen</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginTop: 12,
        }}
      >
        <Card
          title="M1 · Beschwerdeantwort"
          badge="Training"
          href="/b2-dtb/m1"
          desc="Halbformelle Antwort: Entschuldigung → Problem → Grund → Lösung → Wiedergutmachung. Mit KI-Analyse, Beleg-Zitaten und Redemitteln nach dem Versuch."
        />

        <Card
          title="M2 · Forumsbeitrag argumentativ"
          badge="Training"
          href="/b2-dtb/m2"
          desc="Einleitung → Meinung → Vorteil(+Begründung) → Nachteil(+Begründung) → Vorschlag → Schluss+Gruß. Mit prüfungsnaher KI-Bewertung und Redemitteln nach dem Versuch."
        />

        <Card
          title="Simulation · Prüfungsmodus"
          badge="20 Minuten"
          href="/b2-dtb/simulation"
          desc="Prüfungsnah: Timer, Warnung bei 05:00, Auto-Abgabe bei 00:00, Anti-Refresh, 1 Abgabe, danach Sperre + vollständige Auswertung."
        />
      </div>

      <div style={{ marginTop: 26, borderTop: "1px solid #eee", paddingTop: 16 }}>
        <small style={{ color: "#444", lineHeight: 1.6 }}>
          Tipp: Für stabile Ergebnisse empfehlen wir ca. <strong>140–200 Wörter</strong> (je nach Aufgabe).
          Zu kurze Texte werden beim Kriterium <strong>Umfang</strong> sichtbar sanktioniert.
        </small>
      </div>
    </main>
  );
}