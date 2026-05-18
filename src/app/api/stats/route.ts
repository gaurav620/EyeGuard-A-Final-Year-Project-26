import { getStats } from "@/lib/redis";
import { jsonOk } from "@/lib/server/api";

export async function GET() {
  const stats = await getStats();
  return jsonOk({
    participants: stats.participants ?? 0,
    sessions: stats.sessions ?? 0,
    telemetryPoints: stats.telemetryPoints ?? 0,
    avgFatigueScore: stats.avgFatigueScore ?? 0,
  });
}

