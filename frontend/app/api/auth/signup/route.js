import { proxyJson } from "@/app/api/_utils/proxy";

export async function POST(request) {
  return proxyJson(request, "/signup");
}

