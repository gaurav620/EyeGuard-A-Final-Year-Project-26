"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ParticleBackground } from "@/components/shared/particle-bg";
import { LiveEyeCheck } from "@/components/dashboard/live-eye-check";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { AIChatbot } from "@/components/dashboard/ai-chatbot";
import { Zap, Settings, Clock, BarChart3 } from "lucide-react";

const EXERCISES = [
  { name: "20-20-20 Rule", desc: "Every 20 minutes, look at something 20 feet away for 20 seconds.", time: "20s" },
  { name: "Palming", desc: "Rub palms together, cup over closed eyes. Feel warmth relax muscles.", time: "60s" },
  { name: "Figure Eight", desc: "Imagine a large figure-8 on the floor, 10 feet away. Trace it with your eyes.", time: "30s" },
  { name: "Near-Far Focus", desc: "Alternate focus between thumb (near) and a distant object repeatedly.", time: "45s" },
];

const TIPS = [
  "Position your screen 20-26 inches from your eyes at a slight downward angle.",
  "Use the 20-20-20 rule: Every 20 min, look 20 feet away for 20 seconds.",
  "Blink consciously — we blink 66% less when using screens.",
  "Keep room lighting similar to screen brightness to reduce glare.",
  "Stay hydrated — dehydration worsens dry eye symptoms.",
  "Use night mode / blue light filter after sunset.",
];

export default function DashboardPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("eyeguard_sessions") || "[]");
    setStreak(s.length);
  }, []);

  useEffect(() => {
    if (activeExercise === null) return;
    const id = setInterval(() => setExerciseTimer((p) => { if (p <= 1) { setActiveExercise(null); return 0; } return p - 1; }), 1000);
    return () => clearInterval(id);
  }, [activeExercise]);

  const startExercise = (idx: number) => {
    setActiveExercise(idx);
    setExerciseTimer(parseInt(EXERCISES[idx]!.time));
  };

  const currentDate = useMemo(() => new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), []);
  const toggleSettings = useCallback(() => setSettingsOpen((p) => !p), []);
  const scrollToEyeCheck = useCallback(() => document.getElementById("live-eye-check")?.scrollIntoView({ behavior: "smooth" }), []);

  return (
    <div className="noise-overlay relative min-h-screen">
      <ParticleBackground />
      <div className="blob blob-1" /><div className="blob blob-2" />
      <div className="relative z-10">
        <Navbar />
        <main className="pt-24 pb-24 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between section-fade">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5B6CFF] mb-2">Monitoring Center</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Live Monitoring <span className="gradient-text">Dashboard</span></h1>
                <p className="mt-1 text-sm text-gray-400">{currentDate}</p>
                <p className="mt-2 text-gray-500">Real-time eye tracking, fatigue scoring, and personalized recommendations.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={scrollToEyeCheck} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"><Zap className="h-4 w-4" /> Start Session</button>
                <button onClick={toggleSettings} className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"><Settings className="h-4 w-4" /> Settings</button>
              </div>
            </div>

            {/* Live Eye Check */}
            <div className="mt-8 section-fade"><LiveEyeCheck /></div>

            {/* Quick Stats Bar */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3 section-fade">
              <Link href="/analytics" className="glass-card-static p-5 hover:border-[#5B6CFF]/30 transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Total Sessions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{streak}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-[#5B6CFF]/20 group-hover:text-[#5B6CFF]/40 transition-colors" />
                </div>
              </Link>
              <Link href="/analytics" className="glass-card-static p-5 hover:border-emerald-300 transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Smart Analytics</p>
                    <p className="text-sm font-semibold text-gray-600 mt-2">View trends & history →</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
                </div>
              </Link>
              <Link href="/docs" className="glass-card-static p-5 hover:border-amber-300 transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Documentation</p>
                    <p className="text-sm font-semibold text-gray-600 mt-2">Research & how it works →</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500/20 group-hover:text-amber-500/40 transition-colors" />
                </div>
              </Link>
            </div>

            {/* Eye Exercises + Tips */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2 section-fade">
              {/* Exercises */}
              <div className="glass-card-static p-6">
                <h2 className="text-lg font-bold text-gray-900">Eye Exercises</h2>
                <p className="text-sm text-gray-400 mt-1 mb-4">Clinically recommended exercises for screen fatigue</p>
                <div className="space-y-3">
                  {EXERCISES.map((ex, i) => (
                    <div key={ex.name} className={`rounded-xl border p-3.5 flex items-center gap-3 transition-all ${activeExercise === i ? "border-[#5B6CFF] bg-[#5B6CFF]/5" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${activeExercise === i ? "gradient-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ex.desc}</p>
                      </div>
                      {activeExercise === i ? (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#5B6CFF]">{exerciseTimer}s</p>
                          <p className="text-[10px] text-gray-400">remaining</p>
                        </div>
                      ) : (
                        <button onClick={() => startExercise(i)} className="rounded-lg bg-[#5B6CFF]/10 text-[#5B6CFF] px-3 py-1.5 text-xs font-semibold hover:bg-[#5B6CFF]/20 transition-colors whitespace-nowrap">Start {ex.time}</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card-static p-6">
                <h2 className="text-lg font-bold text-gray-900">Eye Care Tips</h2>
                <p className="text-sm text-gray-400 mt-1 mb-4">Expert-backed tips from ophthalmology research</p>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">&ldquo;{TIPS[tipIdx]}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-2">Tip {tipIdx + 1} of {TIPS.length}</p>
                </div>
                <button onClick={() => setTipIdx((p) => (p + 1) % TIPS.length)} className="w-full btn-primary py-2.5 text-sm">Next Tip →</button>

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-gray-900">20-20-20 Rule</p>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Every <strong>20 minutes</strong>, look at something <strong>20 feet</strong> away for <strong>20 seconds</strong>. This is the #1 recommendation from the American Academy of Ophthalmology.</p>
                </div>

                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-gray-900">Email Alerts Active</p>
                  <p className="text-xs text-gray-500 mt-1">You&apos;ll receive email notifications when fatigue reaches critical levels during sessions.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <AIChatbot />
        <Footer />
      </div>
    </div>
  );
}
