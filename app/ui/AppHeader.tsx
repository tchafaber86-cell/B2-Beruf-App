"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "white",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {label}
    </Link>
  );
}

function NavDisabled({ label }: { label: string }) {
  return (
    <span
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #eee",
        background: "#f3f3f3",
        fontSize: 14,
        fontWeight: 600,
        color: "#666",
        cursor: "not-allowed",
      }}
    >
      {label}
    </span>
  );
}

export default function AppHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [working, setWorking] = useState(false);

  const shortEmail = useMemo(() => {
    if (!email) return null;
    if (email.length <= 24) return email;
    return email.slice(0, 12) + "…" + email.slice(-8);
  }, [email]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      setLoadingAuth(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoadingAuth(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loginWithOtp() {
    const input = window.prompt("Bitte E-Mail eingeben:");
    if (!input) return;

    const emailInput = input.trim();
    if (!emailInput.includes("@")) {
      alert("Ungültige E-Mail.");
      return;
    }

    setWorking(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailInput,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        alert("Login fehlgeschlagen: " + error.message);
        return;
      }

      alert("Login-Link wurde per E-Mail gesendet.");
    } finally {
      setWorking(false);
    }
  }

  async function logout() {
    setWorking(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert("Logout fehlgeschlagen: " + error.message);
        return;
      }
    } finally {
      setWorking(false);
    }
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(250,250,250,0.95)",
        backdropFilter: "blur(6px)",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>
            BerufsDeutsch
          </div>
        </Link>

        {/* Navigation */}
        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <NavItem href="/" label="Home" />
          <NavItem href="/b2-dtb" label="B2-DTB" />
          <NavItem href="/meine-ergebnisse" label="Meine Ergebnisse" />
          <NavDisabled label="DTZ (bald)" />
          <NavDisabled label="telc A2–B1 (bald)" />
        </nav>

        {/* Auth */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span
            style={{
              fontSize: 13,
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: "white",
            }}
          >
            {loadingAuth
              ? "Konto: …"
              : email
              ? `Konto: ${shortEmail}`
              : "Konto: Gast"}
          </span>

          {email ? (
            <button
              onClick={logout}
              disabled={working}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "black",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={loginWithOtp}
              disabled={working}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "black",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}