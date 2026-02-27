import { getToken } from "@/lib/auth";

async function readResponseBody(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return await res.json();
  const text = await res.text();
  return { message: text };
}

export async function apiRequest(path, { method = "GET", body, token, headers } = {}) {
  const authToken = token ?? getToken();
  const res = await fetch(path, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await readResponseBody(res);
  if (!res.ok) {
    const msg = data?.message || data?.error?.message || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function signup({ name, email, password }) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: { name, email, password },
  });
}

export function login({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function getProjects() {
  return apiRequest("/api/projects", { method: "GET" });
}

