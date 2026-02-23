"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function UserDetailClient() {
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

      if (!error && data) setResults(data);
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
    </main>
  );
}