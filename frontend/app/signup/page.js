"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signup } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signup({ name, email, password });
      if (!res?.token) throw new Error("No token returned from server");
      setToken(res.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Signup returns a JWT and logs you in automatically.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="Your name"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="you@mail.com"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="At least 6 characters"
              />
            </label>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link className="font-medium text-zinc-900 dark:text-zinc-50" href="/login">
            Login
          </Link>
          .
        </div>
      </main>
    </div>
  );
}

