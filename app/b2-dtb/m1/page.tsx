"use client";

import { useEffect, useMemo, useState } from "react";
import { m1Situations } from "../../../lib/m1Situations";
import { m1Redemittel } from "../../../lib/redemittel";
import ProgressBar from "../../../components/ProgressBar";
import ScoreBar from "../../../components/ScoreBar";
import CollapsibleBox from "../../../components/CollapsibleBox";

export default function M1Page() {
  const [level] = useState(1);
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);

  const [simulation, setSimulation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [randomIndex, setRandomIndex] = useState<number | null>(null);

  const trainingSituation = m1Situations[level - 1];
  const simulationSituation =
    randomIndex !== null ? m1Situations[randomIndex] : null;

  const situation = simulation ? simulationSituation : trainingSituation;

  useEffect(() => {
    if (!simulation) return;

    const random = Math.floor(Math.random() * m1Situations.length);
    setRandomIndex(random);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    window.onbeforeunload = () => "Simulation läuft!";

    return () => {
      clearInterval(timer);
      window.onbeforeunload = null;
    };
  }, [simulation]);

  async function submit() {
    if (!text.trim()) return;

    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, module: "m1" })
    });

    const data = await response.json();
    setResult(data);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const mindest =
    result &&
    result.structure >= 12 &&
    result.grammar >= 12 &&
    result.functions?.apology &&
    result.functions?.problem &&
    result.functions?.cause &&
    result.functions?.solution;

  const ampelfarbe =
    result && result.totalScore >= 75 && mindest
      ? "green"
      : result && result.totalScore >= 60
      ? "orange"
      : "red";

  const ampellabel =
    ampelfarbe === "green"
      ? "Prüfungsreif"
      : ampelfarbe === "orange"
      ? "Grenzbereich – verbessern"
      : "Risiko – deutlich überarbeiten";

  const structureHints = useMemo(() => {
    if (!result) return null;

    return (
      <>
        <h4>Strukturbezogene Alternativ-Redemittel</h4>

        {!result.functions?.apology && (
          <>
            <h5>Entschuldigung</h5>
            <ul>
              {m1Redemittel.structure.apology.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {!result.functions?.cause && (
          <>
            <h5>Ursache</h5>
            <ul>
              {m1Redemittel.structure.cause.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {!result.functions?.solution && (
          <>
            <h5>Lösung</h5>
            <ul>
              {m1Redemittel.structure.solution.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  }, [result]);

  if (!situation) return null;

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "auto" }}>
      <h1>M1 – Beschwerdeantwort</h1>

      {!simulation && (
        <button onClick={() => setSimulation(true)} style={simBtn}>
          Simulation starten (20 Minuten)
        </button>
      )}

      {simulation && (
        <div style={timerBox}>
          ⏳ {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      )}

      {!simulation && <ProgressBar current={level} total={4} />}

      <h2 style={{ marginTop: 30 }}>{situation.title}</h2>

      <div style={mailBox}>
        <h3>Beschwerdemail</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {situation.complaint}
        </pre>
      </div>

      <div style={postIt}>
        <h4>Interne Anweisung</h4>
        <ul>
          <li>Bedauern ausdrücken</li>
          <li>Problem benennen</li>
          <li>Ursache erläutern</li>
          <li>Lösung anbieten</li>
          <li>ggf. Wiedergutmachung</li>
        </ul>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        style={{ width: "100%", marginTop: 30 }}
      />

      <button onClick={submit} style={submitBtn}>
        Abgeben
      </button>

      {result && (
        <div style={resultBox}>
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: ampelfarbe,
            color: "white",
            fontWeight: 700,
            marginBottom: 20
          }}>
            {ampellabel} – {result.totalScore}%
          </div>

          <ScoreBar label="Gesamt" value={result.totalScore} />
          <ScoreBar label="Struktur" value={result.structure} max={20} />
          <ScoreBar label="Kohäsion" value={result.cohesion} max={20} />
          <ScoreBar label="Grammatik" value={result.grammar} max={20} />
          <ScoreBar label="Wortschatz" value={result.vocabulary} max={20} />
          <ScoreBar label="Ausdruck" value={result.expression} max={20} />
          <ScoreBar label="Umfang" value={result.lengthScore} max={20} />

          <h4 style={{ marginTop: 20 }}>Funktionsprüfung</h4>
          <ul>
            <li>Entschuldigung: {result.functions?.apology ? "✔" : "✘"}</li>
            <li>Problem: {result.functions?.problem ? "✔" : "✘"}</li>
            <li>Ursache: {result.functions?.cause ? "✔" : "✘"}</li>
            <li>Lösung: {result.functions?.solution ? "✔" : "✘"}</li>
          </ul>

          <CollapsibleBox title="KI-Feedback anzeigen">
            <p>{result.feedback?.join(" ")}</p>
          </CollapsibleBox>

          <CollapsibleBox title="Struktur-Alternativen anzeigen">
            {structureHints}
          </CollapsibleBox>

          <CollapsibleBox title="Verbesserte KI-Version anzeigen">
            <div style={{
              marginTop: 10,
              padding: 15,
              background: "#ffffff",
              border: "1px solid #ccc",
              borderRadius: 6,
              whiteSpace: "pre-wrap"
            }}>
              {result.improvedVersion}
            </div>
          </CollapsibleBox>
        </div>
      )}
    </main>
  );
}

const simBtn = { padding: "8px 16px", borderRadius: 8, background: "#222", color: "white", fontWeight: 600 };
const timerBox = { marginTop: 10, fontWeight: 700, fontSize: 18, color: "#b30000" };
const mailBox = { marginTop: 20, border: "1px solid #ccc", padding: 20, borderRadius: 8, background: "#f9f9f9" };
const postIt = { marginTop: 20, padding: 16, borderRadius: 8, background: "#fff7b2", border: "1px solid #e6d96b" };
const submitBtn = { marginTop: 20, padding: "10px 18px", borderRadius: 8, background: "black", color: "white", fontWeight: 700 };
const resultBox = { marginTop: 30, padding: 20, borderRadius: 10, background: "#f3f3f3", border: "1px solid #ddd" };