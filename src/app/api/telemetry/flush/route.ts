import { db } from "@/lib/db";
import { telemetry } from "@/lib/schema";
import { flushTelemetryBuffer } from "@/lib/redis";
import { jsonOk } from "@/lib/server/api";

type BufferedTelemetry = {
  sessionId: string;
  timestamp: string;
  ear: number;
  blinkRate: number;
  eyeClosureDuration: number;
  gazeVariance: number;
  fatigueScore: number;
  fatigueLevel: "normal" | "mild" | "moderate" | "severe";
  isBlinking: boolean;
  leftEAR?: number | null;
  rightEAR?: number | null;
  gazeX?: number | null;
  gazeY?: number | null;
};

export async function POST() {
  const items = (await flushTelemetryBuffer()) as BufferedTelemetry[];
  if (!items.length) {
    return jsonOk({ inserted: 0, message: "No buffered telemetry." });
  }

  await db.insert(telemetry).values(
    items.map((item) => ({
      sessionId: item.sessionId,
      timestamp: new Date(item.timestamp),
      ear: item.ear,
      blinkRate: item.blinkRate,
      eyeClosureDuration: item.eyeClosureDuration,
      gazeVariance: item.gazeVariance,
      fatigueScore: item.fatigueScore,
      fatigueLevel: item.fatigueLevel,
      isBlinking: item.isBlinking,
      leftEAR: item.leftEAR ?? null,
      rightEAR: item.rightEAR ?? null,
      gazeX: item.gazeX ?? null,
      gazeY: item.gazeY ?? null,
    }))
  );

  return jsonOk({ inserted: items.length });
}

