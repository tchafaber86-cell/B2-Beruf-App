"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function MeineErgebnisse() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setResults(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <main style={{ padding: 40 }}>Lade…</main>;

  return (
    <main style={{ padding: 40 }}>
      <h1>Meine Ergebnisse</h1>

      {results.length === 0 ? (
        <p>Noch keine Ergebnisse vorhanden.</p>
      ) : (
        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th>Modul</th>
              <th>Score</th>
              <th>Wörter</th>
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  (window.location.href = `/meine-ergebnisse/${r.id}`)
                }
              >
                <td>{r.module}</td>
                <td>{r.total_score}%</td>
                <td>{r.word_count}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}