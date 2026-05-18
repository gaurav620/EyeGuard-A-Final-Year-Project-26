import { computeFatigueScore } from "@/lib/fatigue";
import { bufferTelemetry, incrementStat } from "@/lib/redis";
import { jsonError, jsonOk } from "@/lib/server/api";

type IngestPayload = {
  sessionId: string;
  ear: number;
  blinkRate: number;
  eyeClosureDuration: number;
  gazeVariance: number;
  elapsedMinutes: number;
  eyePatchBase64?: string;
  leftEAR?: number;
  rightEAR?: number;
  gazeX?: number;
  gazeY?: number;
};

type EyeInferenceData = {
  label: "Closed" | "Open";
  closedProbability: number;
  openProbability: number;
};

function toFatigueLevel(score: number) {
  if (score < 25) return "normal";
  if (score < 50) return "mild";
  if (score < 75) return "moderate";
  return "severe";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function inferEyeState(imageBase64?: string): Promise<EyeInferenceData | null> {
  const inferenceUrl = process.env.EYE_GUARD_INFERENCE_URL;
  if (!inferenceUrl || !imageBase64) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(inferenceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { ok: boolean; data?: EyeInferenceData };
    if (!payload.ok || !payload.data) return null;
    return payload.data;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<IngestPayload>;
  if (
    !body.sessionId ||
    body.ear === undefined ||
    body.blinkRate === undefined ||
    body.eyeClosureDuration === undefined ||
    body.gazeVariance === undefined ||
    body.elapsedMinutes === undefined
  ) {
    return jsonError("Missing required telemetry fields.", 422);
  }

  const inference = await inferEyeState(body.eyePatchBase64);
  const inferredEar = inference
    ? clamp(0.18 + inference.openProbability * 0.16, 0.18, 0.34)
    : body.ear;

  const fusedEar = clamp(body.ear * 0.45 + inferredEar * 0.55, 0.18, 0.34);
  const fusedClosure = inference
    ? clamp(body.eyeClosureDuration * 0.5 + (0.15 + inference.closedProbability * 0.45) * 0.5, 0.12, 0.8)
    : body.eyeClosureDuration;
  const fusedBlinkRate = inference
    ? Math.round(clamp(body.blinkRate * 0.6 + (8 + inference.closedProbability * 20) * 0.4, 0, 60))
    : body.blinkRate;

  const result = computeFatigueScore({
    ear: fusedEar,
    blinkRate: fusedBlinkRate,
    eyeClosureDuration: fusedClosure,
    gazeVariance: body.gazeVariance,
    elapsedMinutes: body.elapsedMinutes,
  });

  await bufferTelemetry({
    sessionId: body.sessionId,
    timestamp: new Date().toISOString(),
    ear: fusedEar,
    blinkRate: fusedBlinkRate,
    eyeClosureDuration: fusedClosure,
    gazeVariance: body.gazeVariance,
    fatigueScore: result.score,
    fatigueLevel: toFatigueLevel(result.score),
    isBlinking: inference ? inference.closedProbability >= 0.55 : fusedEar <= 0.21,
    eyeStateLabel: inference?.label ?? null,
    eyeStateClosedProbability: inference?.closedProbability ?? null,
    eyeStateOpenProbability: inference?.openProbability ?? null,
    leftEAR: body.leftEAR ?? null,
    rightEAR: body.rightEAR ?? null,
    gazeX: body.gazeX ?? null,
    gazeY: body.gazeY ?? null,
  });

  await incrementStat("telemetryPoints", 1);
  return jsonOk(
    {
      ...result,
      eyeState: inference
        ? {
            label: inference.label,
            closedProbability: inference.closedProbability,
            openProbability: inference.openProbability,
          }
        : null,
    },
    { status: 202 }
  );
}

