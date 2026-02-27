"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const loginUrl = useMemo(() => {
    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    return `/login${next}`;
  }, [pathname]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(loginUrl);
      return;
    }
    setReady(true);
  }, [router, loginUrl]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
      </div>
    );
  }

  return children;
}

