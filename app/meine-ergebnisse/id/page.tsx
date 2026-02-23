"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";

export default function ResultDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("results")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setData(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <main style={{ padding: 40 }}>Lade Analyse…</main>;
  if (!data) return <main style={{ padding: 40 }}>Nicht gefunden</main>;

  const evalData = data.evaluation || {};

  return (
    <main style={{ padding: 40, maxWidth: 900, fontFamily: "sans-serif" }}>
      <h1>Versuchsanalyse</h1>

      <section style={box}>
        <h2>Übersicht</h2>
        <p><strong>Modul:</strong> {data.module}</p>
        <p><strong>Score:</strong> {data.total_score}%</p>
        <p><strong>Wörter:</strong> {data.word_count}</p>
        <p><strong>Datum:</strong> {new Date(data.created_at).toLocaleString()}</p>
      </section>

      <section style={box}>
        <h2>Dein Text</h2>
        <div style={textBox}>{data.text_content}</div>
      </section>

      <section style={box}>
        <h2>Kategorienbewertung</h2>
        <ul>
          <li>Struktur: {evalData.structure}%</li>
          <li>Kohäsion: {evalData.cohesion}%</li>
          <li>Register: {evalData.register}%</li>
          <li>Grammatik: {evalData.grammar}%</li>
          <li>Wortschatz: {evalData.vocabulary}%</li>
          <li>Ausdruck: {evalData.expression}%</li>
          <li>Tiefe: {evalData.depth}%</li>
          <li>Umfang: {evalData.lengthScore}%</li>
        </ul>
      </section>

      {evalData.checklist && (
        <section style={box}>
          <h2>Pflichtpunkte</h2>
          <ul>
            {evalData.checklist.map((c: any, i: number) => (
              <li key={i}>
                <strong>{c.label}</strong> — {c.present ? "✔" : "✘"}
                {c.evidence && <div style={evidence}>„{c.evidence}“</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {evalData.feedback && (
        <section style={box}>
          <h2>Kommentar</h2>
          <ul>
            {evalData.feedback.map((f: string, i: number) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

const box = {
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: 16,
  marginTop: 20,
  background: "white"
};

const textBox = {
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
  background: "#f6f6f6",
  padding: 14,
  borderRadius: 8,
  border: "1px solid #eee"
};

const evidence = {
  fontSize: 13,
  color: "#444",
  marginTop: 4
};