"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { m1Situations } from "../../../lib/m1Situations";

export default function M1Page() {
  const [level, setLevel] = useState(1);
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProgress() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module", "m1")
        .single();

      if (data) setLevel(data.current_level);
    }
    loadProgress();
  }, []);

  const situation = m1Situations[level - 1];

  async function submit() {
    setLoading(true);

    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, module: "m1" }),
    });

    const data = await response.json();
    setResult(data);

    if (data.totalScore >= 60) {
      await unlockNext();
    }

    setLoading(false);
  }

  async function unlockNext() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    await supabase.from("progress").upsert({
      user_id: user.id,
      module: "m1",
      current_level: level + 1,
    });

    setLevel((prev) => Math.min(prev + 1, 4));
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>M1 – Beschwerdeantwort</h1>
      <h2>{situation.title}</h2>

      <div style={box}>
        <h3>Beschwerdemail</h3>
        <pre>{situation.complaint}</pre>
      </div>

      <div style={box}>
        <h3>Interne Anweisung</h3>
        <pre>{situation.instructions}</pre>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        style={{ width: "100%", marginTop: 20 }}
      />

      <button onClick={submit} disabled={loading} style={btn}>
        Abgeben
      </button>

      {result && (
        <div style={box}>
          <h3>Score: {result.totalScore}%</h3>
          {result.totalScore >= 60
            ? "Nächste Situation freigeschaltet."
            : "Mindestens 60 % erforderlich."}
        </div>
      )}
    </main>
  );
}

const box = {
  border: "1px solid #ddd",
  padding: 16,
  marginTop: 20,
  borderRadius: 8,
  background: "#f6f6f6"
};

const btn = {
  marginTop: 20,
  padding: "10px 16px",
  borderRadius: 8,
  background: "black",
  color: "white",
  fontWeight: 700
};