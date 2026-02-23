import { Suspense } from "react";
import UserDetailClient from "./UserDetailClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Lade...</p>}>
      <UserDetailClient />
    </Suspense>
  );
}