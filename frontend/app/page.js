import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">TeamOps</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Minimal Next.js frontend demo for the TeamOps API.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/login"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Signup
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Dashboard
          </Link>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="font-medium">Backend note</div>
          <div className="mt-2 text-zinc-600 dark:text-zinc-400">
            This frontend proxies requests through Next.js to avoid CORS. Configure{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">
              BACKEND_URL
            </code>{" "}
            in <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">frontend/.env.local</code>.
          </div>
        </section>
      </main>
    </div>
  );
}
