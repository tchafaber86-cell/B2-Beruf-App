"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";

type ChecklistItem = {
  key: string;
  label: string;
  present: boolean;
  evidence: string;
};

type EvalResult = {
  totalScore: number;
  structure: number;
  cohesion: number;
  register: number;
  grammar: number;
  vocabulary: number;
  expression?: number;
  depth?: number;
  lengthScore?: number;

  checklist?: ChecklistItem[];
  missingElements?: string[];
  notes?: {
    expression?: string[];
    depth?: string[];
    length?: string[];
  };
  feedback?: string[];
  error?: string;
};

function clamp(n: number | undefined) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function Bar({ value }: { value: number | undefined }) {
  const v = clamp(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ background: "#ddd", height: 12, borderRadius: 6 }}>
        <div
          style={{
            width: `${v}%`,
            background: "black",
            height: 12,
            borderRadius: 6,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

const REDEMITTEL_M1 = {
  "Entschuldigung/Bedauern": [
    "Wir bedauern sehr, dass es zu dieser Unannehmlichkeit gekommen ist.",
    "Bitte entschuldigen Sie die entstandenen Schwierigkeiten.",
    "Wir möchten uns aufrichtig für den Vorfall entschuldigen.",
  ],
  "Problem benennen": [
    "Sie haben uns darauf hingewiesen, dass …",
    "In Ihrer Nachricht erwähnen Sie, dass …",
    "Wir haben verstanden, dass es bei … zu Problemen gekommen ist.",
  ],
  "Grund/Begründung": [
    "Der Grund dafür war …",
    "Dies ist darauf zurückzuführen, dass …",
    "Aufgrund von … kam es leider zu …",
  ],
  Lösung: [
    "Wir werden den Vorgang umgehend prüfen und veranlassen, dass …",
    "Wir kümmern uns sofort darum, dass …",
    "Als Lösung bieten wir an, dass …",
  ],
  Wiedergutmachung: [
    "Als Entschädigung erhalten Sie einen Gutschein in Höhe von …",
    "Selbstverständlich erstatten wir Ihnen den Betrag in Höhe von …",
    "Als Wiedergutmachung bieten wir Ihnen … an.",
  ],
  Schluss: [
    "Vielen Dank für Ihren Hinweis. Wir hoffen auf Ihr Verständnis.",
    "Gern stehen wir für Rückfragen zur Verfügung.",
  ],
};

const REDEMITTEL_M2 = {
  Einleitung: [
    "Haben Sie schon gehört, dass …?",
    "In letzter Zeit wird häufig darüber diskutiert, ob …",
    "Ich möchte heute das Thema … ansprechen.",
  ],
  Meinung: [
    "Ich bin der Meinung, dass …",
    "Aus meiner Sicht ist … sinnvoll / problematisch.",
    "Ich halte … grundsätzlich für eine gute Idee.",
  ],
  Vorteil: [
    "Ein großer Vorteil ist, dass …",
    "Positiv finde ich vor allem, dass …",
    "Das hat den Nutzen, dass …",
  ],
  Nachteil: [
    "Ein Nachteil ist jedoch, dass …",
    "Problematisch ist, dass …",
    "Dagegen spricht, dass …",
  ],
  Vorschlag: [
    "Ich würde vorschlagen, dass …",
    "Man könnte eine Lösung darin sehen, dass …",
    "Eine Alternative wäre, …",
  ],
  Konnektoren: [
    "einerseits … andererseits …",
    "außerdem, darüber hinaus",
    "allerdings, dennoch",
    "deshalb, daher, aus diesem Grund",
  ],
  Schluss: ["Was meinen Sie dazu?", "Wie sehen Sie das?", "Viele Grüße / Herzliche Grüße"],
};

type ModuleType = "m1" | "m2";

type PersistedSimState = {
  version: 1;
  module: ModuleType;
  endAt: number | null; // epoch ms
  isRunning: boolean;
  submitted: boolean;
  warned5min: boolean;
  text: string;
  result: EvalResult | null;
};

const STORAGE_KEY = "b2dtb_simulation_v1";

export default function B2DTBSimulation() {
  const TOTAL_SECONDS = 20 * 60;
  const WARN_AT_SECONDS = 5 * 60;

  const [module, setModule] = useState<ModuleType>("m1");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);

  const [showRedemittel, setShowRedemittel] = useState(false);
  const [warned5min, setWarned5min] = useState(false);

  const endAtRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const wordCount = useMemo(() => {
    const t = text.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [text]);

  const checklistPresent = useMemo(
    () => (result?.checklist || []).filter((c) => c.present),
    [result]
  );
  const checklistMissing = useMemo(
    () => (result?.checklist || []).filter((c) => !c.present),
    [result]
  );

  function persistState(partial?: Partial<PersistedSimState>) {
    try {
      const current: PersistedSimState = {
        version: 1,
        module,
        endAt: endAtRef.current,
        isRunning,
        submitted,
        warned5min,
        text,
        result,
      };
      const next = { ...current, ...(partial || {}) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function clearPersistedState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedSimState;

      if (!parsed || parsed.version !== 1) return;

      setModule(parsed.module || "m1");
      setText(parsed.text || "");
      setSubmitted(!!parsed.submitted);
      setWarned5min(!!parsed.warned5min);
      setResult(parsed.result || null);
      setShowRedemittel(!!parsed.submitted);

      endAtRef.current = parsed.endAt ?? null;
      setIsRunning(!!parsed.isRunning && !parsed.submitted);

      if (parsed.endAt && !parsed.submitted) {
        const delta = Math.ceil((parsed.endAt - Date.now()) / 1000);
        setSecondsLeft(Math.max(0, delta));
      } else {
        setSecondsLeft(TOTAL_SECONDS);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    persistState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, isRunning, submitted, warned5min, text, result]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isRunning && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning, submitted]);

  useEffect(() => {
    if (!isRunning || submitted) return;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      const endAt = endAtRef.current;
      if (!endAt) return;

      const delta = Math.ceil((endAt - Date.now()) / 1000);
      const nextSeconds = Math.max(0, delta);
      setSecondsLeft(nextSeconds);

      if (!warned5min && nextSeconds <= WARN_AT_SECONDS && nextSeconds > 0) {
        setWarned5min(true);
      }

      if (nextSeconds <= 0) {
        setSecondsLeft(0);
        setIsRunning(false);

        if (!submitted && !loading) {
          submitOnce(true);
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, submitted, warned5min]);

  function startNewSimulation() {
    setSecondsLeft(TOTAL_SECONDS);
    setIsRunning(true);
    setSubmitted(false);
    setLoading(false);
    setResult(null);
    setShowRedemittel(false);
    setWarned5min(false);
    setText("");

    const endAt = Date.now() + TOTAL_SECONDS * 1000;
    endAtRef.current = endAt;

    persistState({
      endAt,
      isRunning: true,
      submitted: false,
      warned5min: false,
      text: "",
      result: null,
      module,
    });
  }

  function pauseSimulation() {
    setIsRunning(false);
    endAtRef.current = null;
    persistState({ isRunning: false, endAt: null });
  }

  function resumeSimulation() {
    if (submitted || secondsLeft === 0) return;
    const endAt = Date.now() + secondsLeft * 1000;
    endAtRef.current = endAt;
    setIsRunning(true);
    persistState({ isRunning: true, endAt });
  }

  function resetAll() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;

    endAtRef.current = null;
    setModule("m1");
    setSecondsLeft(TOTAL_SECONDS);
    setIsRunning(false);
    setSubmitted(false);
    setLoading(false);
    setResult(null);
    setShowRedemittel(false);
    setWarned5min(false);
    setText("");
    clearPersistedState();
  }

  async function submitOnce(isAuto = false) {
    if (submitted || loading) return;

    if (text.trim().length < 10) {
      setSubmitted(true);
      setIsRunning(false);
      setShowRedemittel(true);
      endAtRef.current = null;
      persistState({ submitted: true, isRunning: false, endAt: null });
      return;
    }

    setLoading(true);
    setShowRedemittel(false);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, examType: "b2-dtb", module }),
      });

      const data: EvalResult = await res.json();
      setResult(data);

      setSubmitted(true);
      setIsRunning(false);
      setShowRedemittel(true);
      endAtRef.current = null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !data.error) {
        await supabase.from("results").insert({
          user_id: user.id,
          email: user.email,
          total_score: data.totalScore,
          structure: data.structure,
          cohesion: data.cohesion,
          register: data.register,
          grammar: data.grammar,
          vocabulary: data.vocabulary,
        });
      }

      persistState({
        submitted: true,
        isRunning: false,
        endAt: null,
        result: data,
      });
    } catch {
      setResult({ error: "Bewertung fehlgeschlagen." } as EvalResult);
      setSubmitted(true);
      setIsRunning(false);
      setShowRedemittel(true);
      endAtRef.current = null;
      persistState({ submitted: true, isRunning: false, endAt: null });
    } finally {
      setLoading(false);
    }
  }

  const taskBox =
    module === "m1" ? (
      <>
        <h2 style={{ marginTop: 0 }}>Prüfungsaufgabe (M1) – Beschwerdeantwort</h2>
        <p>
          Schreiben Sie eine <strong>halbformelle Beschwerdeantwort</strong>.
          Achten Sie auf: <strong>Entschuldigung</strong> → <strong>Problem</strong> → <strong>Grund</strong> →{" "}
          <strong>Lösung</strong> → <strong>Wiedergutmachung</strong>.
        </p>
        <p>Empfehlung: 140–190 Wörter.</p>
      </>
    ) : (
      <>
        <h2 style={{ marginTop: 0 }}>Prüfungsaufgabe (M2) – Forumsbeitrag (argumentativ)</h2>
        <p>
          In einem Online-Forum wird diskutiert, ob Unternehmen verpflichtend{" "}
          <strong>zwei Tage Homeoffice pro Woche</strong> einführen sollten.
        </p>
        <p>
          Pflichtpunkte: Einleitung → Meinung → Vorteil(+Begründung) → Nachteil(+Begründung) → Vorschlag → Schluss+Gruß.
        </p>
        <p>Empfehlung: 140–200 Wörter.</p>
      </>
    );

  const redemittel = module === "m1" ? REDEMITTEL_M1 : REDEMITTEL_M2;

  const isTimeCritical = secondsLeft <= WARN_AT_SECONDS && secondsLeft > 0;

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 1100 }}>
      <h1>B2-DTB · Simulationsmodus (20 Minuten)</h1>

      {isTimeCritical && isRunning && !submitted && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#f8f8f8",
          }}
        >
          <strong>⚠️ Achtung: noch {formatTime(secondsLeft)}!</strong>{" "}
          Bitte Schluss / Gruß planen und dann abgeben.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <strong>Modul</strong>
          <div style={{ marginTop: 8 }}>
            <label style={{ marginRight: 12 }}>
              <input
                type="radio"
                name="module"
                value="m1"
                checked={module === "m1"}
                disabled={isRunning || submitted}
                onChange={() => setModule("m1")}
              />{" "}
              M1
            </label>
            <label>
              <input
                type="radio"
                name="module"
                value="m2"
                checked={module === "m2"}
                disabled={isRunning || submitted}
                onChange={() => setModule("m2")}
              />{" "}
              M2
            </label>
          </div>
          <small style={{ display: "block", marginTop: 8 }}>(Während der Simulation gesperrt.)</small>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <strong>Timer</strong>
          <div style={{ fontSize: 28, marginTop: 8, fontWeight: 700 }}>{formatTime(secondsLeft)}</div>
          <small>
            {secondsLeft === 0
              ? "Zeit abgelaufen → Auto-Abgabe wurde ausgelöst."
              : isRunning
              ? "Läuft…"
              : "Gestoppt / pausiert"}
          </small>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <strong>Aktionen</strong>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button
              onClick={startNewSimulation}
              style={{ padding: "10px 14px", background: "black", color: "white", border: "none" }}
            >
              Neu starten (20:00)
            </button>

            <button
              onClick={resumeSimulation}
              disabled={submitted || isRunning || secondsLeft === 0}
              style={{ padding: "10px 14px" }}
            >
              Start / Weiter
            </button>

            <button onClick={pauseSimulation} disabled={!isRunning} style={{ padding: "10px 14px" }}>
              Pause
            </button>

            <button
              onClick={() => submitOnce(false)}
              disabled={submitted || loading}
              style={{
                padding: "10px 14px",
                background: submitted ? "#aaa" : "black",
                color: "white",
                border: "none",
              }}
            >
              {loading ? "Bewerte…" : submitted ? "Abgegeben" : "Abgeben (1×)"}
            </button>

            <button onClick={resetAll} style={{ padding: "10px 14px" }}>
              Reset (alles)
            </button>
          </div>
          <small style={{ display: "block", marginTop: 8 }}>
            Paste/Cut sind im Prüfungsmodus deaktiviert. Anti-Refresh aktiv.
          </small>
        </div>
      </div>

      <div style={{ background: "#f3f3f3", padding: 16, borderRadius: 10, marginTop: 16 }}>{taskBox}</div>

      {/* ✅ Paste/Cut Sperre */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        onPaste={(e) => {
          if (!submitted) {
            e.preventDefault();
            alert("Einfügen (Paste) ist im Prüfungsmodus deaktiviert.");
          }
        }}
        onCut={(e) => {
          if (!submitted) {
            e.preventDefault();
            alert("Ausschneiden (Cut) ist im Prüfungsmodus deaktiviert.");
          }
        }}
        placeholder="Schreiben Sie hier Ihren Text…"
        style={{
          width: "100%",
          height: 280,
          marginTop: 16,
          padding: 10,
          opacity: submitted ? 0.7 : 1,
        }}
      />

      <div style={{ marginTop: 8 }}>
        Wörter: <strong>{wordCount}</strong> {submitted ? <span style={{ marginLeft: 10 }}>(gesperrt)</span> : null}
      </div>

      {result && (
        <section style={{ marginTop: 26 }}>
          {result.error ? (
            <p style={{ color: "red" }}>{result.error}</p>
          ) : (
            <>
              <h2>Ergebnis: {clamp(result.totalScore)}%</h2>

              <div style={{ marginTop: 10 }}>
                <h3>Struktur</h3>
                <Bar value={result.structure} />
                <h3>Kohäsion</h3>
                <Bar value={result.cohesion} />
                <h3>Register</h3>
                <Bar value={result.register} />
                <h3>Grammatik</h3>
                <Bar value={result.grammar} />
                <h3>Wortschatz</h3>
                <Bar value={result.vocabulary} />

                <h3>Ausdrucksfähigkeit</h3>
                <Bar value={result.expression} />
                <h3>Intensität/Tiefe</h3>
                <Bar value={result.depth} />
                <h3>Umfang</h3>
                <Bar value={result.lengthScore} />
              </div>

              {(result.notes?.expression?.length ||
                result.notes?.depth?.length ||
                result.notes?.length?.length) && (
                <div style={{ marginTop: 18 }}>
                  <h3>Kommentar zu Ausdruck/Tiefe/Umfang</h3>

                  {result.notes?.expression?.length ? (
                    <>
                      <strong>Ausdrucksfähigkeit:</strong>
                      <ul>
                        {result.notes.expression.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {result.notes?.depth?.length ? (
                    <>
                      <strong>Intensität/Tiefe:</strong>
                      <ul>
                        {result.notes.depth.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {result.notes?.length?.length ? (
                    <>
                      <strong>Umfang:</strong>
                      <ul>
                        {result.notes.length.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              )}

              {result.checklist && result.checklist.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <h3>Pflichtpunkte – Nachweis im Text</h3>

                  {checklistPresent.length > 0 && (
                    <>
                      <strong>Erkannt (mit Beleg):</strong>
                      <ul style={{ marginTop: 8 }}>
                        {checklistPresent.map((c, i) => (
                          <li key={i}>
                            <strong>{c.label}:</strong>{" "}
                            <span style={{ background: "#fff", padding: "2px 6px", borderRadius: 6 }}>
                              „{c.evidence}“
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {checklistMissing.length > 0 && (
                    <>
                      <strong>Fehlt noch:</strong>
                      <ul style={{ marginTop: 8 }}>
                        {checklistMissing.map((c, i) => (
                          <li key={i}>{c.label}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {showRedemittel && (
                <div style={{ marginTop: 18 }}>
                  <h3>Redemittel (nach dem Versuch)</h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {Object.entries(redemittel).map(([k, arr]) => (
                      <div key={k} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
                        <strong>{k}</strong>
                        <ul style={{ marginTop: 8 }}>
                          {arr.map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}