"use client";

import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ParticleBackground } from "@/components/shared/particle-bg";
import { AIChatbot } from "@/components/dashboard/ai-chatbot";
import { BarChart3, Calendar, Clock, Eye, Flame, TrendingUp, Trash2, ArrowLeft, Cpu, Database, Target, CalendarDays } from "lucide-react";
import Link from "next/link";

type Session = { id: string; date: string; duration: string; fatigueAvg: number };

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("eyeguard_sessions") || "[]");
      setSessions(s.reverse());
    } catch { setSessions([]); }
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return sessions;
    const now = Date.now();
    const cutoff = filter === "week" ? 7 * 86400000 : 30 * 86400000;
    return sessions.filter((s) => {
      try { return now - new Date(s.date).getTime() < cutoff; } catch { return true; }
    });
  }, [sessions, filter]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return { total: 0, avgFatigue: 0, best: 0, worst: 0, grade: "N/A", condition: "" };
    const fatigues = filtered.map((s) => s.fatigueAvg);
    const avg = Math.round(fatigues.reduce((a, b) => a + b, 0) / fatigues.length);
    const best = Math.min(...fatigues);
    const worst = Math.max(...fatigues);
    let grade = "A+", condition = "Excellent eye health! Keep maintaining your habits.";
    if (avg > 20) { grade = "A"; condition = "Very good. Minor strain detected occasionally."; }
    if (avg > 35) { grade = "B"; condition = "Good but some strain building up. Take more breaks."; }
    if (avg > 50) { grade = "C"; condition = "Moderate strain. Follow 20-20-20 rule strictly."; }
    if (avg > 65) { grade = "D"; condition = "High strain detected. Reduce screen time and do eye exercises."; }
    if (avg > 80) { grade = "F"; condition = "Critical strain levels. See an ophthalmologist."; }
    return { total: filtered.length, avgFatigue: avg, best, worst, grade, condition };
  }, [filtered]);

  /* Daily breakdown for the last 7 days */
  const dailyBreakdown = useMemo(() => {
    const days: { label: string; sessions: number; avgFatigue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const dayKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const daySessions = sessions.filter((s) => {
        try {
          const sd = new Date(s.date);
          return sd.toDateString() === d.toDateString();
        } catch { return false; }
      });
      const avg = daySessions.length > 0 ? Math.round(daySessions.reduce((a, b) => a + b.fatigueAvg, 0) / daySessions.length) : 0;
      days.push({ label: dayKey, sessions: daySessions.length, avgFatigue: avg });
    }
    return days;
  }, [sessions]);

  const activeDays = useMemo(() => {
    const days = new Set(sessions.map((s) => { try { return new Date(s.date).toDateString(); } catch { return ""; } }).filter(Boolean));
    return days.size;
  }, [sessions]);

  const clearHistory = () => {
    if (confirm("Clear all session history?")) {
      localStorage.removeItem("eyeguard_sessions");
      setSessions([]);
    }
  };

  const gradeColor = stats.grade === "A+" || stats.grade === "A" ? "text-emerald-500" : stats.grade === "B" ? "text-blue-500" : stats.grade === "C" ? "text-yellow-500" : "text-red-500";

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
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#5B6CFF] hover:underline mb-3">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-500">Smart Analytics</p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Eye Health <span className="gradient-text">Analytics</span></h1>
                <p className="mt-2 text-gray-500">Track your eye health trends over time with detailed session history.</p>
              </div>
              <div className="flex items-center gap-2">
                {(["all", "week", "month"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? "gradient-primary text-white shadow-lg shadow-[#5B6CFF]/20" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    {f === "all" ? "All Time" : f === "week" ? "This Week" : "This Month"}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Cards — now 6 cards */}
            <div className="mt-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 section-fade">
              <div className="glass-card-static p-5">
                <p className="text-xs text-gray-400 font-medium">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="glass-card-static p-5">
                <p className="text-xs text-gray-400 font-medium">Active Days</p>
                <p className="text-3xl font-bold text-[#5B6CFF] mt-1">{activeDays}</p>
              </div>
              <div className="glass-card-static p-5">
                <p className="text-xs text-gray-400 font-medium">Avg Fatigue</p>
                <p className={`text-3xl font-bold mt-1 ${stats.avgFatigue > 50 ? "text-red-500" : stats.avgFatigue > 30 ? "text-yellow-500" : "text-emerald-500"}`}>{stats.avgFatigue}/100</p>
              </div>
              <div className="glass-card-static p-5">
                <p className="text-xs text-gray-400 font-medium">Best Session</p>
                <p className="text-3xl font-bold text-emerald-500 mt-1">{stats.total > 0 ? stats.best : "—"}</p>
              </div>
              <div className="glass-card-static p-5">
                <p className="text-xs text-gray-400 font-medium">Worst Session</p>
                <p className="text-3xl font-bold text-red-500 mt-1">{stats.total > 0 ? stats.worst : "—"}</p>
              </div>
              <div className="glass-card-static p-5">
                <p className="text-xs text-gray-400 font-medium">Eye Grade</p>
                <p className={`text-3xl font-bold mt-1 ${gradeColor}`}>{stats.grade}</p>
              </div>
            </div>

            {/* Daily Activity (last 7 days) */}
            <div className="mt-6 glass-card-static p-6 section-fade">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-[#5B6CFF]" /> Daily Activity — Last 7 Days</h2>
              <div className="mt-4 overflow-x-auto -mx-2 px-2">
                <div className="grid grid-cols-7 gap-2 min-w-[420px]">
                {dailyBreakdown.map((day) => (
                  <div key={day.label} className="text-center">
                    <div className={`mx-auto w-full rounded-xl p-3 transition-all ${day.sessions > 0 ? "bg-gradient-to-b from-[#5B6CFF]/10 to-[#8B5CF6]/10 border border-[#5B6CFF]/20" : "bg-gray-50 border border-gray-100"}`}>
                      <p className={`text-2xl font-bold ${day.sessions > 0 ? "text-[#5B6CFF]" : "text-gray-300"}`}>{day.sessions}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">sessions</p>
                      {day.sessions > 0 && (
                        <p className={`text-[10px] font-semibold mt-1 ${day.avgFatigue > 50 ? "text-red-500" : day.avgFatigue > 30 ? "text-yellow-500" : "text-emerald-500"}`}>
                          Fatigue: {day.avgFatigue}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{day.label}</p>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* Eye Condition Assessment */}
            <div className="mt-6 glass-card-static p-6 section-fade">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Eye className="h-5 w-5 text-[#5B6CFF]" /> Eye Condition Assessment</h2>
              <div className="mt-4 rounded-xl bg-gradient-to-r from-[#5B6CFF]/5 to-[#8B5CF6]/5 border border-[#5B6CFF]/10 p-5">
                <div className="flex items-center gap-4">
                  <div className={`text-5xl font-extrabold ${gradeColor}`}>{stats.grade}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{stats.condition || "Start tracking to see your assessment."}</p>
                    <p className="text-xs text-gray-400 mt-1">Based on {stats.total} sessions analyzed</p>
                  </div>
                </div>
              </div>

              {/* Fatigue Chart */}
              {filtered.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Fatigue Trend</p>
                  <div className="flex items-end gap-1 h-32 rounded-xl bg-gray-50 p-3">
                    {filtered.slice(-30).map((s, i) => (
                      <div key={s.id || i} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full" title={`${s.date}: Fatigue ${s.fatigueAvg}`}>
                        <div className={`w-full rounded-t transition-all ${s.fatigueAvg > 60 ? "bg-red-400" : s.fatigueAvg > 30 ? "bg-yellow-400" : "bg-emerald-400"}`} style={{ height: `${Math.max(4, s.fatigueAvg)}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                    <span>Oldest</span><span>Recent</span>
                  </div>
                </div>
              )}
            </div>

            {/* Session History Table */}
            <div className="mt-6 glass-card-static p-6 section-fade">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calendar className="h-5 w-5 text-[#5B6CFF]" /> Session History</h2>
                {sessions.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Clear</button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-400 font-medium">No sessions yet</p>
                  <p className="text-sm text-gray-300 mt-1">Start a session from the Dashboard to begin tracking.</p>
                  <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm px-5 py-2.5">
                    <Flame className="h-4 w-4" /> Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 pr-4">#</th>
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Duration</th>
                        <th className="pb-3 pr-4">Fatigue</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s, i) => (
                        <tr key={s.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 pr-4 text-gray-400">{filtered.length - i}</td>
                          <td className="py-3 pr-4 font-medium text-gray-900">{s.date}</td>
                          <td className="py-3 pr-4 text-gray-600">{s.duration}</td>
                          <td className="py-3 pr-4">
                            <span className={`font-bold ${s.fatigueAvg > 60 ? "text-red-500" : s.fatigueAvg > 30 ? "text-yellow-500" : "text-emerald-500"}`}>{s.fatigueAvg}/100</span>
                          </td>
                          <td className="py-3">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                              s.fatigueAvg > 60 ? "bg-red-100 text-red-700" : s.fatigueAvg > 30 ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {s.fatigueAvg > 60 ? "High Strain" : s.fatigueAvg > 30 ? "Moderate" : "Healthy"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Grid: Insights + ML Model + Streak */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3 section-fade">
              {/* Health Insights */}
              <div className="glass-card-static p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /> Health Insights</h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <p className="text-sm font-semibold text-gray-900">💡 Recommendation</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {stats.avgFatigue > 50 ? "Your average fatigue is high. Try reducing screen time by 20% and do the 20-20-20 exercise every session." :
                       stats.avgFatigue > 25 ? "You're doing well but there's room for improvement. Blink exercises before sessions can help." :
                       stats.total > 0 ? "Excellent! Your eye health is in great shape. Keep maintaining these habits!" :
                       "Start your first session to get personalized recommendations."}
                    </p>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                    <p className="text-sm font-semibold text-gray-900">📊 Did You Know?</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">The average person blinks 15-20 times per minute, but only 3-4 times when using a screen. This is the #1 cause of digital eye strain.</p>
                  </div>
                </div>
              </div>

              {/* ML Model Info */}
              <div className="glass-card-static p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Cpu className="h-5 w-5 text-purple-500" /> ML Model Info</h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">🧠 EyeNet CNN</p>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">100% Acc</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between"><span>Architecture</span><span className="font-medium text-gray-800">3-Layer CNN + FC</span></div>
                      <div className="flex justify-between"><span>Parameters</span><span className="font-medium text-gray-800">~200K</span></div>
                      <div className="flex justify-between"><span>Input Size</span><span className="font-medium text-gray-800">64×64 RGB</span></div>
                      <div className="flex justify-between"><span>Training Epochs</span><span className="font-medium text-gray-800">25</span></div>
                      <div className="flex justify-between"><span>Optimizer</span><span className="font-medium text-gray-800">AdamW + Cosine LR</span></div>
                      <div className="flex justify-between"><span>Val Accuracy</span><span className="font-bold text-emerald-600">100.0%</span></div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Database className="h-4 w-4 text-amber-600" /> Dataset</p>
                    <div className="space-y-1.5 mt-2 text-xs text-gray-600">
                      <div className="flex justify-between"><span>Source</span><span className="font-medium text-gray-800">MRL Eye Dataset</span></div>
                      <div className="flex justify-between"><span>Samples</span><span className="font-medium text-gray-800">3,000 (1500+1500)</span></div>
                      <div className="flex justify-between"><span>Classes</span><span className="font-medium text-gray-800">Open / Closed</span></div>
                      <div className="flex justify-between"><span>Augmentation</span><span className="font-medium text-gray-800">Flip, Rotate, Color</span></div>
                      <div className="flex justify-between"><span>Split</span><span className="font-medium text-gray-800">80/20 Train/Val</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="glass-card-static p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" /> Your Streak</h2>
                <div className="mt-4 text-center py-4">
                  <p className="text-6xl font-extrabold gradient-text">{sessions.length}</p>
                  <p className="text-gray-400 mt-2 text-sm">Total sessions completed</p>
                  <div className="mt-3 flex justify-center gap-1">
                    {Array.from({ length: Math.min(sessions.length, 14) }).map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-sm gradient-primary opacity-80" />
                    ))}
                    {sessions.length === 0 && <p className="text-xs text-gray-300">No sessions yet</p>}
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-orange-50 border border-orange-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">📅 Active Days</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activeDays} unique days tracked</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-500">{activeDays}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-[#5B6CFF]/5 border border-[#5B6CFF]/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900"><Target className="inline h-4 w-4 text-[#5B6CFF] mr-1" />Fallback Chain</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">6 providers for 99.9% uptime</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <AIChatbot />
        <Footer />
      </div>
    </div>
  );
}
