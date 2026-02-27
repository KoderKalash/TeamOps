import { proxyJson } from "@/app/api/_utils/proxy";

export async function GET(request) {
  return proxyJson(request, "/api/projects");
}

export async function POST(request) {
  return proxyJson(request, "/api/projects");
}

