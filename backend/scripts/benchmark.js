import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const BASE_URL = process.env.BENCH_BASE_URL || process.env.RENDER_BASE_URL;
const PHASE = process.env.BENCH_PHASE || "baseline";
const TAG = process.env.BENCH_TAG || "teamops_bench_v1";
const EMAIL = process.env.BENCH_USER_EMAIL || `bench.user.${TAG}@teamops.dev`;
const PASSWORD = process.env.BENCH_USER_PASSWORD || "Benchmark@123";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const OUTPUT_DIR = path.resolve("benchmark-results");
const DURATION_SECONDS = Number(process.env.BENCH_DURATION_SECONDS || 10);

if (!BASE_URL) throw new Error("BENCH_BASE_URL or RENDER_BASE_URL is required");
if (!JWT_SECRET) throw new Error("JWT_SECRET is required for JWT timing tests");

const toMB = (bytes) => Number((bytes / 1024 / 1024).toFixed(2));
const pctDelta = (before, after) =>
  before === 0 ? 0 : Number((((before - after) / before) * 100).toFixed(2));

const endpointSpecs = [
  {
    key: "projects_list",
    name: "GET /api/projects",
    method: "GET",
    buildPath: (ctx) =>
      `${ctx.apiPrefix}/projects?sort=-createdAt&limit=20&page=1`,
    needsAuth: true,
    type: "crud",
  },
  {
    key: "tasks_by_project",
    name: "GET /api/projects/:projectId/tasks",
    method: "GET",
    buildPath: (ctx) =>
      `${ctx.apiPrefix}/projects/${ctx.projectId}/tasks?status=todo&priority=high&sort=-createdAt&limit=20&page=1`,
    needsAuth: true,
    type: "heavy_db",
  },
  {
    key: "auth_login",
    name: "POST /login",
    method: "POST",
    buildPath: (ctx) => ctx.authPath || "/login",
    bodyFactory: () => ({ email: EMAIL, password: PASSWORD }),
    needsAuth: false,
    type: "auth",
  },
];

const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");
const normalizePrefix = (value) => {
  if (!value) return "";
  const v = value.startsWith("/") ? value : `/${value}`;
  return v.endsWith("/") ? v.slice(0, -1) : v;
};
const ROOT_BASE_URL = (() => {
  const parsed = new URL(normalizeBaseUrl(BASE_URL));
  return `${parsed.protocol}//${parsed.host}`;
})();

const loadAutocannon = async () => {
  try {
    const mod = await import("autocannon");
    return mod.default || mod;
  } catch {
    throw new Error(
      "autocannon package is missing. Run `npm i -D autocannon` inside backend and retry."
    );
  }
};

const requestJson = async ({ method, pathName, body, token }) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${normalizeBaseUrl(BASE_URL)}${pathName}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text();
  let json;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    json = { raw };
  }

  return { status: res.status, json };
};

const requestJsonAgainst = async ({ baseUrl, method, pathName, body, token }) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${normalizeBaseUrl(baseUrl)}${pathName}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text();
  let json;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    json = { raw };
  }
  return { status: res.status, json };
};

const resolveAuthPath = async () => {
  if (process.env.BENCH_AUTH_PATH) return process.env.BENCH_AUTH_PATH;

  const candidates = [
    { baseUrl: BASE_URL, path: "/login" },
    { baseUrl: BASE_URL, path: "/api/login" },
    { baseUrl: BASE_URL, path: "/auth/login" },
    { baseUrl: BASE_URL, path: "/api/auth/login" },
    { baseUrl: ROOT_BASE_URL, path: "/login" },
    { baseUrl: ROOT_BASE_URL, path: "/api/login" },
  ];

  for (const c of candidates) {
    const probe = await requestJsonAgainst({
      baseUrl: c.baseUrl,
      method: "POST",
      pathName: c.path,
      body: { email: EMAIL, password: PASSWORD },
    });
    if (probe.status !== 404) {
      if (c.baseUrl !== normalizeBaseUrl(BASE_URL)) {
        console.warn(
          `Detected auth route at ${c.baseUrl}${c.path}; update BENCH_BASE_URL to service root for consistency.`
        );
      }
      return c.path;
    }
  }
  return "/login";
};

const resolveApiPrefix = async (token) => {
  if (process.env.BENCH_API_PREFIX) return normalizePrefix(process.env.BENCH_API_PREFIX);

  const candidates = ["", "/api"];
  for (const prefix of candidates) {
    const probe = await requestJson({
      method: "GET",
      pathName: `${prefix}/projects?limit=1`,
      token,
    });
    if (probe.status !== 404) return prefix;
  }
  return "/api";
};

const ensureAuthContext = async () => {
  const authPath = await resolveAuthPath();
  const login = await requestJson({
    method: "POST",
    pathName: authPath,
    body: { email: EMAIL, password: PASSWORD },
  });

  if (login.status !== 200 || !login.json.token) {
    throw new Error(
      `Login failed for benchmark user (${EMAIL}). Status ${login.status}. Check BENCH_BASE_URL, BENCH_AUTH_PATH, and benchmark credentials.`
    );
  }

  const token = login.json.token;
  const apiPrefix = await resolveApiPrefix(token);
  const projectsResp = await requestJson({
    method: "GET",
    pathName: `${apiPrefix}/projects?limit=50&sort=-createdAt`,
    token,
  });

  if (projectsResp.status !== 200) {
    throw new Error(
      `Failed to fetch projects with bench token. Status ${projectsResp.status} on path ${apiPrefix}/projects`
    );
  }

  const projects = projectsResp?.json?.data?.projects || [];
  if (!projects.length) {
    throw new Error("No projects available for benchmark user. Run seed first.");
  }

  const projectId = projects[0]._id;
  return { token, projectId, authPath, apiPrefix };
};

const runAutocannon = async ({
  method,
  url,
  headers,
  body,
  connections,
  autocannonLib,
}) => {
  const memBefore = process.memoryUsage();
  const parsed = await new Promise((resolve, reject) => {
    const instance = autocannonLib({
      url,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      connections,
      duration: DURATION_SECONDS,
      renderStatusCodes: true,
    });
    instance.on("done", resolve);
    instance.on("error", reject);
  });
  const memAfter = process.memoryUsage();
  const result = {
    connections,
    latencyMs: {
      p50: parsed.latency?.p50 ?? null,
      p95: parsed.latency?.p95 ?? null,
      p99: parsed.latency?.p99 ?? null,
    },
    requestsPerSec: parsed.requests?.average ?? null,
    throughputBytesPerSec: parsed.throughput?.average ?? null,
    totalErrors: parsed.errors ?? 0,
    non2xx: parsed["non2xx"] ?? 0,
    timeouts: parsed.timeouts ?? 0,
    durationSeconds: DURATION_SECONDS,
    heapBeforeMB: toMB(memBefore.heapUsed),
    heapAfterMB: toMB(memAfter.heapUsed),
    heapGrowthMB: Number((toMB(memAfter.heapUsed - memBefore.heapUsed)).toFixed(2)),
  };

  return result;
};

const runEndpointRamp = async (spec, ctx) => {
  const endpointPath = spec.buildPath(ctx);
  const url = `${BASE_URL}${endpointPath}`;
  const body = spec.bodyFactory ? spec.bodyFactory(ctx) : null;

  const headers = {};
  if (spec.needsAuth) headers.Authorization = `Bearer ${ctx.token}`;
  if (body) headers["Content-Type"] = "application/json";

  const byConcurrency = [];
  for (const connections of [1, 10, 50]) {
    const metrics = await runAutocannon({
      method: spec.method,
      url,
      headers,
      body,
      connections,
      autocannonLib: ctx.autocannonLib,
    });
    byConcurrency.push(metrics);
  }

  const p95At10 = byConcurrency.find((x) => x.connections === 10)?.latencyMs?.p95;
  const p95At50 = byConcurrency.find((x) => x.connections === 50)?.latencyMs?.p95;
  const degradeRatio =
    p95At10 && p95At50 ? Number((p95At50 / p95At10).toFixed(2)) : null;

  return {
    endpoint: spec.name,
    key: spec.key,
    type: spec.type,
    method: spec.method,
    path: endpointPath,
    byConcurrency,
    degradation: {
      p95_10_to_50_ratio: degradeRatio,
      significant: degradeRatio ? degradeRatio >= 2.0 : null,
    },
  };
};

const runAuthMicroBench = async () => {
  const roundsMatch = PASSWORD.startsWith("$2") ? 10 : 10;
  const hashIterations = 30;
  const jwtIterations = 1000;

  const hashStart = performance.now();
  for (let i = 0; i < hashIterations; i += 1) {
    await bcrypt.hash(`bench-pass-${i}`, roundsMatch);
  }
  const hashEnd = performance.now();

  const token = jwt.sign({ userId: "bench-user" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });

  const signStart = performance.now();
  for (let i = 0; i < jwtIterations; i += 1) {
    jwt.sign({ userId: `bench-${i}` }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }
  const signEnd = performance.now();

  const verifyStart = performance.now();
  for (let i = 0; i < jwtIterations; i += 1) {
    jwt.verify(token, JWT_SECRET);
  }
  const verifyEnd = performance.now();

  return {
    bcrypt: {
      rounds: roundsMatch,
      iterations: hashIterations,
      avgMsPerHash: Number(((hashEnd - hashStart) / hashIterations).toFixed(2)),
    },
    jwt: {
      iterations: jwtIterations,
      avgMsPerSign: Number(((signEnd - signStart) / jwtIterations).toFixed(4)),
      avgMsPerVerify: Number(((verifyEnd - verifyStart) / jwtIterations).toFixed(4)),
    },
  };
};

const loadPhaseFile = async (phase) => {
  const fp = path.join(OUTPUT_DIR, `${phase}.json`);
  const raw = await fs.readFile(fp, "utf8");
  return JSON.parse(raw);
};

const buildComparison = (baseline, optimized) => {
  const rows = [];
  for (const optEndpoint of optimized.endpoints) {
    const baseEndpoint = baseline.endpoints.find((x) => x.key === optEndpoint.key);
    if (!baseEndpoint) continue;
    for (const optRun of optEndpoint.byConcurrency) {
      const baseRun = baseEndpoint.byConcurrency.find(
        (x) => x.connections === optRun.connections
      );
      if (!baseRun) continue;
      rows.push({
        endpoint: optEndpoint.endpoint,
        connections: optRun.connections,
        p50Before: baseRun.latencyMs.p50,
        p50After: optRun.latencyMs.p50,
        p50ImprovementPct: pctDelta(baseRun.latencyMs.p50, optRun.latencyMs.p50),
        p95Before: baseRun.latencyMs.p95,
        p95After: optRun.latencyMs.p95,
        p95ImprovementPct: pctDelta(baseRun.latencyMs.p95, optRun.latencyMs.p95),
        p99Before: baseRun.latencyMs.p99,
        p99After: optRun.latencyMs.p99,
        p99ImprovementPct: pctDelta(baseRun.latencyMs.p99, optRun.latencyMs.p99),
        rpsBefore: Number(baseRun.requestsPerSec?.toFixed(2)),
        rpsAfter: Number(optRun.requestsPerSec?.toFixed(2)),
        rpsGainPct: Number(
          (((optRun.requestsPerSec - baseRun.requestsPerSec) / baseRun.requestsPerSec) * 100).toFixed(2)
        ),
      });
    }
  }
  return rows;
};

const makeMarkdownReport = async (current, comparisonRows) => {
  const now = new Date().toISOString();
  const lines = [];
  lines.push("# TeamOps Metrics Report");
  lines.push("");
  lines.push(`Generated: ${now}`);
  lines.push(`Benchmark phase: ${current.phase}`);
  lines.push(`Base URL: ${current.baseUrl}`);
  lines.push(`Dataset tag: ${current.tag}`);
  lines.push(`Auth path used: ${current.authPathUsed}`);
  lines.push(`API prefix used: ${current.apiPrefixUsed}`);
  lines.push("");
  lines.push("## Raw Results");
  lines.push("");
  lines.push(
    "| Endpoint | Conn | p50 ms | p95 ms | p99 ms | Req/sec | non2xx | Errors | Heap +MB |"
  );
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const e of current.endpoints) {
    for (const r of e.byConcurrency) {
      lines.push(
        `| ${e.endpoint} | ${r.connections} | ${r.latencyMs.p50} | ${r.latencyMs.p95} | ${r.latencyMs.p99} | ${Number(
          r.requestsPerSec?.toFixed(2)
        )} | ${r.non2xx} | ${r.totalErrors} | ${r.heapGrowthMB} |`
      );
    }
  }
  lines.push("");
  lines.push("## Auth Microbench");
  lines.push("");
  lines.push(
    `- bcrypt (${current.authMicro.bcrypt.rounds} rounds): ${current.authMicro.bcrypt.avgMsPerHash} ms/hash`
  );
  lines.push(
    `- JWT sign (${current.authMicro.jwt.iterations} iterations): ${current.authMicro.jwt.avgMsPerSign} ms/op`
  );
  lines.push(
    `- JWT verify (${current.authMicro.jwt.iterations} iterations): ${current.authMicro.jwt.avgMsPerVerify} ms/op`
  );
  lines.push("");
  lines.push("## Concurrency Degradation");
  lines.push("");
  for (const e of current.endpoints) {
    lines.push(
      `- ${e.endpoint}: p95 ratio (50/10 conns) = ${e.degradation.p95_10_to_50_ratio} (${e.degradation.significant ? "significant degradation" : "stable"})`
    );
  }
  lines.push("");

  if (comparisonRows.length > 0) {
    lines.push("## Baseline vs Optimized");
    lines.push("");
    lines.push(
      "| Endpoint | Conn | p99 Before | p99 After | p99 Improve % | RPS Before | RPS After | RPS Gain % |"
    );
    lines.push("|---|---:|---:|---:|---:|---:|---:|---:|");
    for (const row of comparisonRows) {
      lines.push(
        `| ${row.endpoint} | ${row.connections} | ${row.p99Before} | ${row.p99After} | ${row.p99ImprovementPct} | ${row.rpsBefore} | ${row.rpsAfter} | ${row.rpsGainPct} |`
      );
    }
    lines.push("");
  }

  lines.push("## Resume Bullets");
  lines.push("");
  lines.push(
    "- Replace placeholders only with measured values from this report. Do not estimate or backfill."
  );
  lines.push(
    "- Optimized query access patterns with compound indexes, cutting p99 latency from X ms to Y ms (Z% improvement) for `GET /api/projects/:projectId/tasks` under 50 concurrent connections on a 10K-task dataset."
  );
  lines.push(
    "- Improved API throughput from X req/sec to Y req/sec (Z% gain) for `GET /api/projects` by aligning indexes with role-aware filter and sort patterns on live Render infrastructure."
  );
  lines.push(
    "- Balanced auth security and performance by validating bcrypt (10 rounds at X ms/hash) and JWT overhead (sign: X ms, verify: Y ms over 1,000 iterations) in production-like conditions."
  );
  lines.push(
    "- Stress-tested TeamOps from 1 to 50 concurrent connections and identified p95 degradation threshold at X concurrency, enabling explicit capacity limits for predictable latency."
  );
  lines.push(
    "- Verified runtime stability during sustained 10-second load windows, constraining heap growth to X MB while serving Y req/sec on live deployment."
  );
  lines.push("");
  lines.push("## Flags");
  lines.push("");
  lines.push(
    "- If `non2xx` or `Errors` are non-zero, investigate rate limiting (429), auth failures, or Render cold-start impact before using numbers publicly."
  );

  return `${lines.join("\n")}\n`;
};

const main = async () => {
  const autocannonLib = await loadAutocannon();
  const ctx = await ensureAuthContext();

  const endpoints = [];
  for (const spec of endpointSpecs) {
    endpoints.push(await runEndpointRamp(spec, { ...ctx, autocannonLib }));
  }

  const authMicro = await runAuthMicroBench();
  const current = {
    phase: PHASE,
    baseUrl: BASE_URL,
    tag: TAG,
    timestamp: new Date().toISOString(),
    authUserEmail: EMAIL,
    authPathUsed: ctx.authPath,
    apiPrefixUsed: ctx.apiPrefix,
    projectIdUsed: ctx.projectId,
    endpoints,
    authMicro,
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(OUTPUT_DIR, `${PHASE}.json`),
    JSON.stringify(current, null, 2),
    "utf8"
  );

  let comparisonRows = [];
  try {
    const baseline = await loadPhaseFile("baseline");
    const optimized = await loadPhaseFile("optimized");
    comparisonRows = buildComparison(baseline, optimized);
  } catch {
    comparisonRows = [];
  }

  const md = await makeMarkdownReport(current, comparisonRows);
  await fs.writeFile(path.resolve("METRICS.md"), md, "utf8");

  console.log(
    JSON.stringify(
      {
        wrote: {
          phaseJson: path.join(OUTPUT_DIR, `${PHASE}.json`),
          metrics: path.resolve("METRICS.md"),
        },
        phase: PHASE,
      },
      null,
      2
    )
  );
};

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
