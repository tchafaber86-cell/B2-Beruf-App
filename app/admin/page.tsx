"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchData();
      }
    }

    async function fetchData() {
      const { data } = await supabase
        .from("results")
        .select("*");

      if (!data) return;

      const grouped: any = {};

      data.forEach((entry) => {
        if (!grouped[entry.email]) {
          grouped[entry.email] = [];
        }
        grouped[entry.email].push(entry);
      });

      const summary = Object.entries(grouped).map(
        ([email, entries]: any) => {
          const avg =
            entries.reduce((sum: number, e: any) => sum + e.total_score, 0) /
            entries.length;

          return {
            email,
            attempts: entries.length,
            average: avg.toFixed(1),
          };
        }
      );

      setUsers(summary);
    }

    init();
  }, []);

  if (!isAdmin)
    return (
      <main style={{ padding: 40 }}>
        <h1>Zugriff verweigert</h1>
      </main>
    );

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin-Dashboard</h1>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>E-Mail</th>
            <th>Versuche</th>
            <th>Durchschnitt (%)</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>
  <a href={`/admin/user?email=${encodeURIComponent(u.email)}`}>
    {u.email}
  </a>
</td>
              <td>{u.attempts}</td>
              <td style={{ color: u.average < 60 ? "red" : "black" }}>
                {u.average}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}