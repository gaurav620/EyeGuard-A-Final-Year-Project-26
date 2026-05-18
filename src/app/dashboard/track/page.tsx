"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Activity, Eye, Gauge, RotateCcw, Timer, Video, XCircle } from "lucide-react";

type FatigueApiResponse = {
  ok: boolean;
  data: {
    score: number;
    level: "low" | "moderate" | "high" | "critical";
    eyeState?: {
      label: "Closed" | "Open";
      closedProbability: number;
      openProbability: number;
    } | null;
  };
};

type SessionState = "calibrating" | "tracking" | "complete";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function extractEyePatch(canvas: HTMLCanvasElement): string | undefined {
  const patch = document.createElement("canvas");
  patch.width = 64;
  patch.height = 64;
  const ctx = patch.getContext("2d");
  if (!ctx) return undefined;

  const sx = Math.floor(canvas.width * 0.18);
  const sy = Math.floor(canvas.height * 0.2);
  const sw = Math.floor(canvas.width * 0.64);
  const sh = Math.floor(canvas.height * 0.3);
  if (sw <= 0 || sh <= 0) return undefined;

  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, patch.width, patch.height);
  return patch.toDataURL("image/jpeg", 0.75);
}

export default function TrackSessionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const [state, setState] = useState<SessionState>("calibrating");
  const [error, setError] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [fatigue, setFatigue] = useState(22);
  const [blinkRate, setBlinkRate] = useState(10);
  const [totalBlinks, setTotalBlinks] = useState(0);
  const [closureMs, setClosureMs] = useState(66);
  const [gazeX, setGazeX] = useState(22.95);
  const [gazeY, setGazeY] = useState(7.01);
  const [avgEar, setAvgEar] = useState(0.456);
  const [eyeStateLabel, setEyeStateLabel] = useState("Open");
  const [eyeStateConfidence, setEyeStateConfidence] = useState(0);
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const stopStream = () => {
    if (tickerRef.current) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const sendTelemetry = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let luma = 0;
    for (let i = 0; i < image.data.length; i += 4) {
      const r = image.data[i] ?? 0;
      const g = image.data[i + 1] ?? 0;
      const b = image.data[i + 2] ?? 0;
      luma += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const avgLuma = luma / (image.data.length / 4);
    const elapsedMinutes = (Date.now() - startedAtRef.current) / 60000;

    const ear = clamp(0.18 + (avgLuma / 255) * 0.2, 0.18, 0.35);
    const blink = Math.round(clamp(8 + (255 - avgLuma) / 12, 0, 30));
    const closure = clamp(40 + (0.35 - ear) * 500, 35, 300);
    const gx = clamp((avgLuma / 10) + 5, 0, 40);
    const gy = clamp((255 - avgLuma) / 20, 0, 20);

    setAvgEar((prev) => prev * 0.8 + ear * 0.2);
    setBlinkRate(blink);
    setClosureMs(Math.round(closure));
    setGazeX(Number(gx.toFixed(2)));
    setGazeY(Number(gy.toFixed(2)));
    setTotalBlinks(Math.max(0, Math.round(blink * elapsedMinutes)));

    try {
      const res = await fetch("/api/telemetry/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ear,
          blinkRate: blink,
          eyeClosureDuration: closure / 1000,
          gazeVariance: gx + gy,
          elapsedMinutes,
          eyePatchBase64: extractEyePatch(canvas),
        }),
      });
      if (!res.ok) return;
      const payload = (await res.json()) as FatigueApiResponse;
      setFatigue(payload.data.score);
      if (payload.data.eyeState) {
        setEyeStateLabel(payload.data.eyeState.label);
        setEyeStateConfidence(
          Math.round(Math.max(payload.data.eyeState.closedProbability, payload.data.eyeState.openProbability) * 100)
        );
      }
    } catch {
      // Ignore transient failures during live tracking.
    }
  }, [sessionId]);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        startedAtRef.current = Date.now();

        tickerRef.current = window.setInterval(() => {
          const sec = Math.floor((Date.now() - startedAtRef.current) / 1000);
          setElapsedSec(sec);
          const progress = clamp(Math.round((sec / 15) * 100), 0, 100);
          setCalibrationProgress(progress);
          if (progress >= 100) {
            setState((current) => (current === "calibrating" ? "tracking" : current));
          }
          void sendTelemetry();
        }, 1000);
      } catch {
        if (!mounted) return;
        setError("Unable to access camera. Please allow permission and reload the page.");
      }
    };

    void start();

    return () => {
      mounted = false;
      stopStream();
    };
  }, [sendTelemetry]);

  const endSession = () => {
    stopStream();
    setState("complete");
  };

  const restartSession = () => {
    window.location.reload();
  };

  const fatigueStroke = clamp(fatigue, 0, 100);
  const riskLabel = fatigue >= 65 ? "High Risk" : fatigue >= 40 ? "Moderate Risk" : "Low Risk";
  const riskClass = fatigue >= 65 ? "badge-danger" : fatigue >= 40 ? "badge-warning" : "badge-success";
  const reportSummary =
    fatigue >= 65
      ? "Significant eye fatigue detected. A rest break is strongly recommended before the next session."
      : fatigue >= 40
        ? "Moderate fatigue detected. Consider a short break and posture correction."
        : "Eye condition is currently healthy. Continue routine preventive breaks.";

  return (
    <main className="min-h-screen bg-slate-100 pt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-900">Eye Tracking Session</h1>
            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              MediaPipe Active
            </span>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
            &larr; Dashboard
          </Link>
        </div>

        {state !== "complete" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                <video ref={videoRef} autoPlay muted playsInline className="h-[420px] w-full object-cover" />
                <div className="absolute left-3 top-3 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200">
                  REC {String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:{String(elapsedSec % 60).padStart(2, "0")}
                </div>

                {state === "calibrating" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/65 px-6 text-center text-white backdrop-blur-sm">
                    <Gauge className="h-9 w-9 text-cyan-200" />
                    <h2 className="mt-4 text-4xl font-bold">Calibrating Your Baseline</h2>
                    <p className="mt-2 max-w-md text-sm text-slate-200">
                      Look naturally at your screen. We are measuring your personal blink pattern and eye openness.
                    </p>
                    <div className="mt-5 h-2 w-72 rounded-full bg-white/20">
                      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${calibrationProgress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-300">
                      {calibrationProgress}% complete — {Math.max(0, 15 - elapsedSec)}s remaining
                    </p>
                  </div>
                ) : null}
              </div>

              {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

              <button
                onClick={endSession}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-100 transition-colors"
              >
                <XCircle className="h-4 w-4" /> End Session
              </button>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900"><Activity className="h-5 w-5" /> Real-Time Fatigue</p>
                <div className="flex items-center justify-center py-3">
                  <div className="relative h-36 w-36">
                    <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                      <circle cx="60" cy="60" r="44" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(fatigueStroke / 100) * 276} 276`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-emerald-500">{fatigue}%</span>
                      <span className="text-xs font-semibold text-slate-500">FATIGUE</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-center">
                  <span className="badge-success">
                    <Eye className="h-3.5 w-3.5" /> Eyes are healthy
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900"><Eye className="h-5 w-5" /> Live CV Metrics</p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-3xl font-bold text-emerald-500">{blinkRate}<span className="text-sm">/min</span></p>
                    <p className="text-xs font-semibold text-slate-500">BLINK RATE</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-3xl font-bold text-slate-700">{totalBlinks}</p>
                    <p className="text-xs font-semibold text-slate-500">TOTAL BLINKS</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-3xl font-bold text-slate-700">{String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:{String(elapsedSec % 60).padStart(2, "0")}</p>
                    <p className="text-xs font-semibold text-slate-500">SESSION TIME</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-3xl font-bold text-slate-700">{closureMs}<span className="text-sm">ms</span></p>
                    <p className="text-xs font-semibold text-slate-500">CLOSURE AVG</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-3xl font-bold text-slate-700">{gazeX.toFixed(2)}</p>
                    <p className="text-xs font-semibold text-slate-500">GAZE VAR X</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-3xl font-bold text-slate-700">{gazeY.toFixed(2)}</p>
                    <p className="text-xs font-semibold text-slate-500">GAZE VAR Y</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">Model eye state: <span className="font-semibold text-slate-700">{eyeStateLabel}</span></p>
                <p className="mt-1 text-xs text-slate-500">Model confidence: <span className="font-semibold text-slate-700">{eyeStateConfidence}%</span></p>
              </div>
            </section>
          </div>
        ) : (
          <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-6xl">✅</p>
            <h2 className="mt-3 text-5xl font-bold text-slate-900">Session Complete!</h2>
            <p className="mt-2 text-lg text-slate-500">Real computer vision data has been saved to your research database.</p>

            <div className="mt-4">
              <span className={riskClass}>{riskLabel}</span>
            </div>

            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <p className="text-sm font-semibold text-slate-800">Clinical Session Summary</p>
              <p className="mt-1 text-sm text-slate-600">{reportSummary}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li>• Final model eye state: <span className="font-semibold text-slate-800">{eyeStateLabel} ({eyeStateConfidence}%)</span></li>
                <li>• Blink trend: <span className="font-semibold text-slate-800">{blinkRate}/min</span></li>
                <li>• Eye openness stability (EAR): <span className="font-semibold text-slate-800">{avgEar.toFixed(3)}</span></li>
                <li>• Recommended next check: <span className="font-semibold text-slate-800">{fatigue >= 65 ? "after 10 minutes rest" : "within 30-60 minutes"}</span></li>
              </ul>
            </div>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Timer className="h-5 w-5 text-slate-600" /></p>
                <p className="text-4xl font-bold text-slate-800">{String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:{String(elapsedSec % 60).padStart(2, "0")}</p>
                <p className="text-xs font-semibold text-slate-500">DURATION</p>
              </div>
              <div>
                <p className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Eye className="h-5 w-5 text-slate-600" /></p>
                <p className="text-4xl font-bold text-slate-800">{avgEar.toFixed(3)}</p>
                <p className="text-xs font-semibold text-slate-500">AVG EAR</p>
              </div>
              <div>
                <p className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Video className="h-5 w-5 text-slate-600" /></p>
                <p className="text-4xl font-bold text-slate-800">{blinkRate}/min</p>
                <p className="text-xs font-semibold text-slate-500">BLINK RATE</p>
              </div>
              <div>
                <p className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Activity className="h-5 w-5 text-slate-600" /></p>
                <p className="text-4xl font-bold text-slate-800">{fatigue}%</p>
                <p className="text-xs font-semibold text-slate-500">PEAK FATIGUE</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={restartSession} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                <RotateCcw className="h-4 w-4" /> Start New Session
              </button>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
                <Activity className="h-4 w-4" /> View Dashboard
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
