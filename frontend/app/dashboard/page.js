"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjects } from "@/lib/api";
import { clearToken, getToken, parseJwt } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);

  const tokenInfo = useMemo(() => {
    const token = getToken();
    if (!token) return null;
    return { token, payload: parseJwt(token) };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await getProjects();
        const list = res?.data?.projects ?? [];
        if (mounted) setProjects(list);
      } catch (err) {
        if (mounted) setError(err?.message || "Failed to load projects");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, []);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Protected route (requires a JWT in localStorage).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              Home
            </Link>
            <button
              onClick={logout}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="font-medium">Token</div>
          <div className="mt-2 grid gap-2 text-zinc-600 dark:text-zinc-400">
            <div>
              <span className="text-zinc-800 dark:text-zinc-200">Stored:</span>{" "}
              {tokenInfo?.token ? "yes" : "no"}
            </div>
            {tokenInfo?.payload?.userId ? (
              <div>
                <span className="text-zinc-800 dark:text-zinc-200">userId:</span>{" "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">
                  {tokenInfo.payload.userId}
                </code>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-4">
            <div className="font-medium">Projects</div>
            {loading ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="mt-4">
              {projects.length === 0 ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  No projects returned for this user.
                </div>
              ) : (
                <ul className="grid gap-2">
                  {projects.map((p) => (
                    <li
                      key={p._id || p.id || p.name}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                    >
                      <div className="font-medium">{p.name ?? "(unnamed project)"}</div>
                      {p._id ? (
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          id: {p._id}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

