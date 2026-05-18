import { jsonOk } from "@/lib/server/api";

export async function GET() {
  return jsonOk({
    service: "eye-guard-web",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}

