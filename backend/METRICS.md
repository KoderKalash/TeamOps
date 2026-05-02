# TeamOps Metrics Report

Generated: 2026-05-02T12:24:20.633Z
Benchmark phase: baseline
Base URL: https://teamops.onrender.com
Dataset tag: teamops_bench_v1
Auth path used: /login
API prefix used: /api

## Raw Results

| Endpoint | Conn | p50 ms | p95 ms | p99 ms | Req/sec | non2xx | Errors | Heap +MB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| GET /api/projects | 1 | 895 | null | 1200 | 1.11 | 0 | 0 | 1.27 |
| GET /api/projects | 10 | 1121 | null | 4570 | 5.8 | 0 | 0 | -0.64 |
| GET /api/projects | 50 | 2178 | null | 4386 | 18.4 | 0 | 0 | 0.35 |
| GET /api/projects/:projectId/tasks | 1 | 980 | null | 1689 | 0.9 | 0 | 0 | 0.33 |
| GET /api/projects/:projectId/tasks | 10 | 427 | null | 1168 | 15.2 | 79 | 0 | 0.07 |
| GET /api/projects/:projectId/tasks | 50 | 326 | null | 1026 | 124.4 | 1244 | 0 | 1.57 |
| POST /login | 1 | 856 | null | 1001 | 1.2 | 1 | 0 | -3.48 |
| POST /login | 10 | 315 | null | 2360 | 26.7 | 262 | 0 | 0.47 |
| POST /login | 50 | 330 | null | 2132 | 92.4 | 924 | 0 | 1.66 |

## Auth Microbench

- bcrypt (10 rounds): 94.7 ms/hash
- JWT sign (1000 iterations): 0.8408 ms/op
- JWT verify (1000 iterations): 0.7982 ms/op

## Concurrency Degradation

- GET /api/projects: p95 ratio (50/10 conns) = null (stable)
- GET /api/projects/:projectId/tasks: p95 ratio (50/10 conns) = null (stable)
- POST /login: p95 ratio (50/10 conns) = null (stable)

## Resume Bullets

- Replace placeholders only with measured values from this report. Do not estimate or backfill.
- Optimized query access patterns with compound indexes, cutting p99 latency from X ms to Y ms (Z% improvement) for `GET /api/projects/:projectId/tasks` under 50 concurrent connections on a 10K-task dataset.
- Improved API throughput from X req/sec to Y req/sec (Z% gain) for `GET /api/projects` by aligning indexes with role-aware filter and sort patterns on live Render infrastructure.
- Balanced auth security and performance by validating bcrypt (10 rounds at X ms/hash) and JWT overhead (sign: X ms, verify: Y ms over 1,000 iterations) in production-like conditions.
- Stress-tested TeamOps from 1 to 50 concurrent connections and identified p95 degradation threshold at X concurrency, enabling explicit capacity limits for predictable latency.
- Verified runtime stability during sustained 10-second load windows, constraining heap growth to X MB while serving Y req/sec on live deployment.

## Flags

- If `non2xx` or `Errors` are non-zero, investigate rate limiting (429), auth failures, or Render cold-start impact before using numbers publicly.
