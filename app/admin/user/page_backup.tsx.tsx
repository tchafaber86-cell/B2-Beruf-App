"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function UserDetail() {
  const params = useSearchParams();
  const email = params.get("email");

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!email) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setResults(data);
      }

      setLoading(false);
    }

    fetchData();
  }, [email]);

  if (!email) return <p style={{ padding: 40 }}>Keine E-Mail angegeben.</p>;
  if (loading) return <p style={{ padding: 40 }}>Lade Daten...</p>;
  if (!results.length) return <p style={{ padding: 40 }}>Keine Daten</p>;

  const avg =
    results.reduce((sum, r) => sum + (r.total_score || 0), 0) /
    results.length;

  const weakest = ["structure", "cohesion", "grammar", "vocabulary"]
    .map((cat) => ({
      cat,
      avg:
        results.reduce((sum, r) => sum + (r[cat] || 0), 0) /
        results.length,
    }))
    .sort((a, b) => a.avg - b.avg)[0];

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Teilnehmer: {email}</h1>

      <h2>Übersicht</h2>
      <p>Versuche: {results.length}</p>
      <p>Durchschnitt: {avg.toFixed(1)} %</p>
      <p>Größter Förderbedarf: {weakest.cat}</p>

      <h2>Alle Versuche</h2>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Gesamt</th>
            <th>Struktur</th>
            <th>Kohäsion</th>
            <th>Grammatik</th>
            <th>Wortschatz</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.total_score}%</td>
              <td>{r.structure}</td>
              <td>{r.cohesion}</td>
              <td>{r.grammar}</td>
              <td>{r.vocabulary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}