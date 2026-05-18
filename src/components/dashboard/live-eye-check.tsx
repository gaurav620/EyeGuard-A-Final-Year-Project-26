"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Eye, Video, VideoOff, FileText, X, Timer, Activity } from "lucide-react";

// MediaPipe FaceMesh eye landmark indices (468 landmark model)
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_IRIS = [474, 475, 476, 477];
const RIGHT_IRIS = [469, 470, 471, 472];
const EAR_BLINK_THRESHOLD = 0.22;

type SessionReport = {
  date: string; duration: string; blinks: number; blinkRate: number;
  avgFatigue: number; level: string; ear: number;
};

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calcEAR(landmarks: { x: number; y: number }[], indices: number[]) {
  const p = indices.map((i) => landmarks[i]!);
  const v1 = dist(p[1], p[5]);
  const v2 = dist(p[2], p[4]);
  const h = dist(p[0], p[3]);
  return h > 0 ? (v1 + v2) / (2 * h) : 0.3;
}

export function LiveEyeCheck() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const faceLandmarkerRef = useRef<any>(null);
  const blinkCountRef = useRef(0);
  const wasClosedRef = useRef(false);
  const startTimeRef = useRef(0);
  const earHistoryRef = useRef<number[]>([]);
  const fatigueScoresRef = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastAlertRef = useRef(0);

  const playBeep = useCallback((freq: number, dur: number, vol: number) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.value = vol;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }, []);

  const [running, setRunning] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState("");

  const [totalBlinks, setTotalBlinks] = useState(0);
  const [blinkRate, setBlinkRate] = useState(0);
  const [ear, setEar] = useState(0);
  const [eyeState, setEyeState] = useState<"Open" | "Closed">("Open");
  const [elapsed, setElapsed] = useState("00:00");
  const [healthScore, setHealthScore] = useState(100);
  const [fatigueLevel, setFatigueLevel] = useState("Low Fatigue");
  const [report, setReport] = useState<SessionReport | null>(null);

  // Load MediaPipe FaceLandmarker
  const loadModel = useCallback(async () => {
    setModelLoading(true);
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { FaceLandmarker, FilesetResolver } = vision;
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const fl = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFacialTransformationMatrixes: false,
        outputFaceBlendshapes: true,
      });
      faceLandmarkerRef.current = fl;
      setModelReady(true);
    } catch (e: any) {
      console.error("MediaPipe load error:", e);
      setError("Failed to load AI model. Please refresh.");
    } finally {
      setModelLoading(false);
    }
  }, []);

  // Draw eye landmarks on canvas
  const drawLandmarks = useCallback(
    (landmarks: { x: number; y: number }[], w: number, h: number) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const drawPoints = (indices: number[], color: string, size: number) => {
        ctx.fillStyle = color;
        for (const idx of indices) {
          const p = landmarks[idx];
          if (!p) continue;
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, size, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      const drawConnections = (indices: number[], color: string) => {
        if (indices.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const first = landmarks[indices[0]!];
        if (!first) return;
        ctx.moveTo(first.x * w, first.y * h);
        for (let i = 1; i < indices.length; i++) {
          const p = landmarks[indices[i]!];
          if (p) ctx.lineTo(p.x * w, p.y * h);
        }
        ctx.closePath();
        ctx.stroke();
      };

      // Draw eye outlines
      drawConnections(LEFT_EYE, "rgba(0, 255, 200, 0.7)");
      drawConnections(RIGHT_EYE, "rgba(0, 255, 200, 0.7)");
      // Draw eye points
      drawPoints(LEFT_EYE, "#00ffc8", 2);
      drawPoints(RIGHT_EYE, "#00ffc8", 2);
      // Draw iris
      drawPoints(LEFT_IRIS, "#00aaff", 2.5);
      drawPoints(RIGHT_IRIS, "#00aaff", 2.5);
    },
    []
  );

  // Detection loop
  const detect = useCallback(() => {
    const video = videoRef.current;
    const fl = faceLandmarkerRef.current;
    if (!video || !fl || video.readyState < 2) {
      animRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    const results = fl.detectForVideo(video, now);

    if (results?.faceLandmarks?.length > 0) {
      const lm = results.faceLandmarks[0];
      const w = video.videoWidth;
      const h = video.videoHeight;

      // Draw landmarks
      drawLandmarks(lm, w, h);

      // Calculate EAR
      const leftEar = calcEAR(lm, LEFT_EYE);
      const rightEar = calcEAR(lm, RIGHT_EYE);
      const avgEar = (leftEar + rightEar) / 2;
      setEar(avgEar);
      earHistoryRef.current.push(avgEar);
      if (earHistoryRef.current.length > 300) earHistoryRef.current.shift();

      // Also use blendshapes if available for more accuracy
      let blendBlink = false;
      if (results.faceBlendshapes?.[0]?.categories) {
        const cats = results.faceBlendshapes[0].categories;
        const eyeBlinkL = cats.find((c: any) => c.categoryName === "eyeBlinkLeft");
        const eyeBlinkR = cats.find((c: any) => c.categoryName === "eyeBlinkRight");
        if (eyeBlinkL && eyeBlinkR) {
          const blendScore = (eyeBlinkL.score + eyeBlinkR.score) / 2;
          if (blendScore > 0.4) blendBlink = true;
        }
      }

      // Blink detection: EAR-based OR blendshape-based
      const isClosed = avgEar < EAR_BLINK_THRESHOLD || blendBlink;
      setEyeState(isClosed ? "Closed" : "Open");

      if (isClosed && !wasClosedRef.current) {
        // Eye just closed — blink started
        wasClosedRef.current = true;
      } else if (!isClosed && wasClosedRef.current) {
        // Eye just opened — blink completed
        wasClosedRef.current = false;
        blinkCountRef.current++;
        setTotalBlinks(blinkCountRef.current);
        playBeep(800, 0.08, 0.15); // soft blink beep
      }

      // Update timer & blink rate
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      const mins = Math.floor(elapsedSec / 60);
      const secs = Math.floor(elapsedSec % 60);
      setElapsed(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);

      const elapsedMin = elapsedSec / 60;
      const rate = elapsedMin > 0.1 ? blinkCountRef.current / elapsedMin : 0;
      setBlinkRate(Math.round(rate * 10) / 10);

      // Health score (based on blink rate deviation from ideal 15-20 bpm)
      const idealRate = 17;
      const rateDeviation = Math.abs(rate - idealRate) / idealRate;
      const earBaseline = 0.27;
      const earDeviation = Math.abs(avgEar - earBaseline) / earBaseline;
      const timeDecay = Math.min(elapsedMin / 60, 0.3);
      const score = Math.max(0, Math.round(100 - rateDeviation * 30 - earDeviation * 20 - timeDecay * 50));
      setHealthScore(score);
      fatigueScoresRef.current.push(100 - score);

      if (score >= 80) setFatigueLevel("Low Fatigue");
      else if (score >= 50) setFatigueLevel("Moderate");
      else if (score >= 25) setFatigueLevel("High Fatigue");
      else setFatigueLevel("Critical");

      // Alert sound for high fatigue (max once per 30s)
      if (score < 30 && Date.now() - lastAlertRef.current > 30000) {
        playBeep(440, 0.3, 0.25);
        setTimeout(() => playBeep(520, 0.3, 0.25), 350);
        lastAlertRef.current = Date.now();
      }
    }

    animRef.current = requestAnimationFrame(detect);
  }, [drawLandmarks]);

  const startSession = async () => {
    setError("");
    try {
      if (!modelReady) await loadModel();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      blinkCountRef.current = 0;
      wasClosedRef.current = false;
      earHistoryRef.current = [];
      fatigueScoresRef.current = [];
      startTimeRef.current = Date.now();
      setTotalBlinks(0);
      setBlinkRate(0);
      setEar(0);
      setElapsed("00:00");
      setHealthScore(100);
      setFatigueLevel("Low Fatigue");
      setEyeState("Open");
      setRunning(true);
      animRef.current = requestAnimationFrame(detect);
    } catch {
      setError("Camera access denied. Please allow camera permission.");
    }
  };

  const stopSession = () => {
    cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Build report
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    const elapsedMin = elapsedSec / 60;
    const avgFat = fatigueScoresRef.current.length > 0
      ? Math.round(fatigueScoresRef.current.reduce((a, b) => a + b, 0) / fatigueScoresRef.current.length)
      : 0;
    const lvl = avgFat >= 75 ? "Critical" : avgFat >= 50 ? "High" : avgFat >= 25 ? "Moderate" : "Low";
    const sess: SessionReport = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      duration: elapsedMin < 1 ? `${Math.round(elapsedSec)}s` : `${elapsedMin.toFixed(1)} min`,
      blinks: blinkCountRef.current, blinkRate,
      avgFatigue: avgFat, level: lvl,
      ear: earHistoryRef.current.length > 0
        ? earHistoryRef.current.reduce((a, b) => a + b, 0) / earHistoryRef.current.length : 0,
    };
    setReport(sess);

    // Save to localStorage
    try {
      const prev = JSON.parse(localStorage.getItem("eyeguard_sessions") || "[]");
      prev.push({ id: crypto.randomUUID(), date: sess.date, duration: sess.duration, fatigueAvg: avgFat });
      localStorage.setItem("eyeguard_sessions", JSON.stringify(prev.slice(-20)));
    } catch {}

    setRunning(false);
  };

  useEffect(() => {
    loadModel();
    return () => {
      cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [loadModel]);

  const fatigueColor = healthScore >= 80 ? "text-emerald-500" : healthScore >= 50 ? "text-yellow-500" : healthScore >= 25 ? "text-orange-500" : "text-red-500";
  const barColor = healthScore >= 80 ? "bg-emerald-500" : healthScore >= 50 ? "bg-yellow-500" : healthScore >= 25 ? "bg-orange-500" : "bg-red-500";

  return (
    <div id="live-eye-check" className="space-y-6">
      {/* Main tracking card */}
      <section className="glass-card-static p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#5B6CFF]" /> Live Eye Tracking
          </h2>
          {!running ? (
            <button onClick={() => void startSession()} disabled={modelLoading} className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5">
              <Video className="h-4 w-4" />
              {modelLoading ? "Loading AI..." : modelReady ? "Start Session" : "Loading..."}
            </button>
          ) : (
            <button onClick={stopSession} className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20">
              <VideoOff className="h-4 w-4" /> Stop Session
            </button>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Camera feed with landmark overlay */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 aspect-[4/3]">
            <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
            <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full" style={{ transform: "scaleX(-1)" }} />
            {!running && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center">
                  <Eye className="mx-auto h-12 w-12 text-[#5B6CFF] mb-3" />
                  <p className="text-white font-medium">Click Start Session</p>
                  <p className="text-gray-400 text-sm mt-1">Camera will activate for eye tracking</p>
                </div>
              </div>
            )}
            {running && (
              <>
                <div className="absolute left-3 top-3 rounded-full bg-red-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE
                </div>
                <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-lg ${eyeState === "Closed" ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"}`}>
                  {eyeState === "Closed" ? "Eyes Closed" : "Eyes Open"}
                </div>
              </>
            )}
          </div>

          {/* Stats panel */}
          <div className="space-y-3">
            {/* Session Duration */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400 font-medium">Session Duration</p>
              <p className="text-3xl font-bold text-gray-900 mt-1 font-mono">{elapsed}</p>
            </div>

            {/* Total Blinks */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400 font-medium">Total Blinks</p>
              <p className="text-3xl font-bold text-[#5B6CFF] mt-1">{totalBlinks}</p>
            </div>

            {/* Blink Rate */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400 font-medium">Blink Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{blinkRate} <span className="text-sm font-normal text-gray-400">/min</span></p>
              <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full gradient-primary transition-all duration-300" style={{ width: `${Math.min(100, (blinkRate / 30) * 100)}%` }} />
              </div>
            </div>

            {/* EAR */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-400 font-medium">Eye Aspect Ratio</p>
              <p className={`text-2xl font-bold mt-1 ${ear < EAR_BLINK_THRESHOLD ? "text-orange-500" : "text-[#8B5CF6]"}`}>
                {ear.toFixed(3)}
              </p>
            </div>

            {/* Health Score */}
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-gray-500 font-medium">Eye Health Score</p>
              <p className={`text-3xl font-bold mt-1 ${fatigueColor}`}>
                {healthScore} <span className="text-sm font-normal text-gray-400">/100</span>
              </p>
              <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${healthScore}%` }} />
              </div>
            </div>

            {/* Fatigue Level */}
            <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
              <p className="text-xs text-gray-500 font-medium">Fatigue Level</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{fatigueLevel}</p>
            </div>

            {/* Blink Rate Alert */}
            {running && blinkRate > 0 && (
              <div className={`rounded-xl p-3 text-center text-sm font-semibold ${
                blinkRate > 25 ? "bg-red-100 text-red-700 border border-red-200" :
                blinkRate < 10 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}>
                {blinkRate > 25 ? "High Blink Rate — May indicate dry eyes" : blinkRate < 10 ? "Low Blink Rate — Blink more consciously" : "Normal Blink Rate"}
              </div>
            )}
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </section>

      {/* Session Report Modal */}
      {report && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setReport(null)}>
          <div className="glass-card-static w-full max-w-lg mx-4 p-6 sm:p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#5B6CFF]" />
                <h2 className="text-xl font-bold text-gray-900">Session Report</h2>
              </div>
              <button onClick={() => setReport(null)} className="btn-icon"><X className="h-4 w-4" /></button>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#5B6CFF]/10 to-[#8B5CF6]/10 p-5 mb-5 text-center">
              <p className="text-5xl font-extrabold gradient-text">{report.avgFatigue}</p>
              <p className="text-sm text-gray-500 mt-1">Average Fatigue Score</p>
              <span className={`mt-2 inline-block badge ${report.avgFatigue >= 60 ? "badge-danger" : report.avgFatigue >= 35 ? "badge-warning" : "badge-success"}`}>
                {report.level.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Duration</p><p className="text-lg font-bold">{report.duration}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Total Blinks</p><p className="text-lg font-bold">{report.blinks}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Blink Rate</p><p className="text-lg font-bold">{report.blinkRate}/min</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">Avg EAR</p><p className="text-lg font-bold">{report.ear.toFixed(3)}</p></div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
              <p className="text-sm font-bold text-gray-900 mb-2">Eye Health Assessment</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {report.avgFatigue >= 60
                  ? "Your eyes show significant strain. You blinked less than normal and your eye openness dropped. Take a 10-15 minute screen break."
                  : report.avgFatigue >= 35
                    ? "Mild strain detected. Follow the 20-20-20 rule and keep your screen at arm's length."
                    : "Your eyes are in great shape! Blink rate and openness are healthy. Keep taking regular breaks."}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-5">
              <p className="text-sm font-bold text-gray-900 mb-2">Recommendations</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                {report.blinkRate < 12 && <li>• Blink rate is low — try blinking consciously more.</li>}
                {report.blinkRate > 25 && <li>• High blink rate may indicate dry eyes — use eye drops.</li>}
                {report.avgFatigue >= 50 && <li>• Use warm eye compresses for 5 mins to relax muscles.</li>}
                <li>• Keep screen 20-26 inches from your face.</li>
                <li>• Drink water — dehydration worsens dry eyes.</li>
                {report.avgFatigue < 30 && <li>• Great session! You have healthy eye habits. 🎉</li>}
              </ul>
            </div>

            <button onClick={() => setReport(null)} className="w-full btn-primary py-3 text-sm">Close Report</button>
          </div>
        </div>
      )}
    </div>
  );
}
