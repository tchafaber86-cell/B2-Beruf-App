import type { Metadata } from "next";
import AppHeader from "./ui/AppHeader";

export const metadata: Metadata = {
  title: "BerufsDeutsch – Selbstlern-App",
  description: "Prüfungsorientierte Schreibtrainings (B2-DTB) mit KI-Analyse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body style={{ margin: 0, background: "#fafafa", color: "#111" }}>
        <AppHeader />

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</div>

        <footer
          style={{
            marginTop: 24,
            padding: "18px 18px 30px",
            color: "#666",
            fontSize: 12,
            borderTop: "1px solid #eee",
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div style={{ lineHeight: 1.6 }}>
            Hinweis: DTZ und telc A2–B1 werden später freigeschaltet.
          </div>
        </footer>
      </body>
    </html>
  );
}