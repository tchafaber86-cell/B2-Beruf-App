import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const connectors = [
  "weil", "obwohl", "denn", "deshalb", "daher",
  "außerdem", "zudem", "hingegen", "einerseits",
  "andererseits", "somit", "folglich", "trotzdem"
];

export async function POST(req: Request) {
  try {
    const { text, module } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Kein Text übermittelt" },
        { status: 400 }
      );
    }

    /* =========================
       ENV VAR CHECK (wichtig)
    ========================== */

    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY fehlt" },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase ENV fehlt" },
        { status: 500 }
      );
    }

    /* =========================
       LAZY INITIALIZATION
    ========================== */

    const openai = new OpenAI({ apiKey: openaiKey });

    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    /* =========================
       TEXT ANALYSE
    ========================== */

    const wordCount = text.trim().split(/\s+/).length;

    const connectorHits = connectors.filter(c =>
      text.toLowerCase().includes(c)
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "Du bist Prüfer für B2 Beruf. Antworte nur in JSON."
        },
        {
          role: "user",
          content: `
Bewerte diesen Text ganzheitlich.

TEXT:
${text}

Bewerte (0-20 Punkte):
- Struktur
- Kohäsion
- Grammatik
- Wortschatz
- Ausdruck
- Umfang

Prüfe Funktionen:
- apology
- problem
- cause
- solution
- compensation (optional)

Gib JSON:

{
  structure:number,
  cohesion:number,
  grammar:number,
  vocabulary:number,
  expression:number,
  lengthScore:number,
  functions:{
    apology:boolean,
    problem:boolean,
    cause:boolean,
    solution:boolean,
    compensation:boolean
  },
  feedback:string[]
}
`
        }
      ]
    });

    const result = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    const categoryScore =
      (result.structure || 0) +
      (result.cohesion || 0) +
      (result.grammar || 0) +
      (result.vocabulary || 0) +
      (result.expression || 0) +
      (result.lengthScore || 0);

    const functionBonus =
      (result.functions?.apology ? 5 : 0) +
      (result.functions?.problem ? 5 : 0) +
      (result.functions?.cause ? 5 : 0) +
      (result.functions?.solution ? 5 : 0);

    const connectorBonus = connectorHits.length >= 3 ? 5 : 0;

    const totalScore = Math.min(
      100,
      Math.round(categoryScore / 6 + functionBonus + connectorBonus)
    );

    /* =========================
       SUPABASE SAVE
    ========================== */

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (user) {
      await supabase.from("results").insert({
        user_id: user.id,
        module,
        total_score: totalScore,
        word_count: wordCount,
        text_content: text,
        evaluation: {
          ...result,
          connectorHits
        }
      });
    }

    return NextResponse.json({
      totalScore,
      ...result,
      connectorHits
    });

  } catch (error) {
    console.error("Evaluate API Fehler:", error);

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}