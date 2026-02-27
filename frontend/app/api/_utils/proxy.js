export function getBackendUrl() {
  return process.env.BACKEND_URL || "http://localhost:8000";
}

export async function proxyJson(request, backendPath) {
  const backendUrl = getBackendUrl();
  const target = new URL(backendPath, backendUrl);

  const contentType = request.headers.get("content-type") || "";
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : contentType.includes("application/json")
        ? JSON.stringify(await request.json())
        : await request.text();

  const res = await fetch(target, {
    method: request.method,
    headers: {
      ...(contentType ? { "content-type": contentType } : {}),
      ...(request.headers.get("authorization")
        ? { authorization: request.headers.get("authorization") }
        : {}),
    },
    body,
    cache: "no-store",
  });

  const resType = res.headers.get("content-type") || "";
  const payload = resType.includes("application/json") ? await res.json() : await res.text();

  return new Response(
    resType.includes("application/json") ? JSON.stringify(payload) : payload,
    {
      status: res.status,
      headers: {
        "content-type": resType.includes("application/json")
          ? "application/json"
          : "text/plain; charset=utf-8",
      },
    }
  );
}

