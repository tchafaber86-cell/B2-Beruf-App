"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/write/m2",
      },
    });

    if (error) {
      setMessage("Fehler beim Login.");
    } else {
      setMessage("Bitte E-Mail prüfen. Login-Link wurde gesendet.");
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Ihre E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, width: 300 }}
      />

      <br /><br />

      <button
        onClick={handleLogin}
        style={{
          padding: "8px 16px",
          background: "black",
          color: "white",
          border: "none",
        }}
      >
        Login-Link senden
      </button>

      {message && <p>{message}</p>}
    </main>
  );
}