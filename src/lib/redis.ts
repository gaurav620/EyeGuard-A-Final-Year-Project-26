/**
 * In-memory telemetry buffer (replaces Upstash Redis)
 * This allows the app to work without Redis while keeping the same API surface.
 */

const telemetryBuffer: string[] = [];
const stats: Record<string, number> = {};
const leaderboard: Map<string, number> = new Map();

export async function bufferTelemetry(data: Record<string, unknown>) {
  telemetryBuffer.push(JSON.stringify(data));
}

export async function flushTelemetryBuffer(): Promise<Record<string, unknown>[]> {
  if (telemetryBuffer.length === 0) return [];
  const items = telemetryBuffer.splice(0, telemetryBuffer.length);
  return items.map((item) => JSON.parse(item) as Record<string, unknown>);
}

export async function incrementStat(field: string, amount = 1) {
  stats[field] = (stats[field] ?? 0) + amount;
}

export async function getLeaderboard(limit = 10) {
  const entries = Array.from(leaderboard.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  return entries.map(([key, score]) => ({ key, score }));
}

export async function incrementLeaderboard(member: string, points: number) {
  leaderboard.set(member, (leaderboard.get(member) ?? 0) + points);
}

export async function getStats(): Promise<Record<string, number>> {
  return { ...stats };
}
