import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;

  if (!email) {
    return <p style={{ padding: 40 }}>Keine E-Mail angegeben.</p>;
  }

  const { data } = await supabase
    .from("results")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: true });

  if (!data || !data.length) {
    return <p style={{ padding: 40 }}>Keine Daten</p>;
  }

  const avg =
    data.reduce((sum, r) => sum + (r.total_score || 0), 0) /
    data.length;

  const weakest = ["structure", "cohesion", "grammar", "vocabulary"]
    .map((cat) => ({
      cat,
      avg:
        data.reduce((sum, r) => sum + (r[cat] || 0), 0) /
        data.length,
    }))
    .sort((a, b) => a.avg - b.avg)[0];

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Teilnehmer: {email}</h1>
      <h2>Übersicht</h2>
      <p>Versuche: {data.length}</p>
      <p>Durchschnitt: {avg.toFixed(1)} %</p>
      <p>Größter Förderbedarf: {weakest.cat}</p>
    </main>
  );
}