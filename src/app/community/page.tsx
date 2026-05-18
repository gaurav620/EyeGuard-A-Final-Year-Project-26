"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { motion } from "framer-motion";
import { QrCode, Trophy, Users, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Leader = { rank: number; participant: string; points: number };
type StatsPayload = { participants: number; sessions: number; telemetryPoints: number; avgFatigueScore: number };

export default function CommunityPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [stats, setStats] = useState<StatsPayload>({
    participants: 0,
    sessions: 0,
    telemetryPoints: 0,
    avgFatigueScore: 0,
  });
  const [joinState, setJoinState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [joinMessage, setJoinMessage] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const [leaderboardRes, statsRes] = await Promise.all([
        fetch("/api/community/leaderboard", { cache: "no-store" }),
        fetch("/api/stats", { cache: "no-store" }),
      ]);
      if (leaderboardRes.ok) {
        const leaderData = (await leaderboardRes.json()) as { ok: boolean; data: { leaderboard: Leader[] } };
        setLeaders(leaderData.data.leaderboard);
      }
      if (statsRes.ok) {
        const statsData = (await statsRes.json()) as { ok: boolean; data: StatsPayload };
        setStats(statsData.data);
      }
    };
    void load();
  }, []);

  const sessionCount = useMemo(() => stats.sessions.toLocaleString(), [stats.sessions]);

  const joinResearch = async () => {
    setJoinState("loading");
    setJoinMessage("");
    const payload = {
      clerkId: `guest-${crypto.randomUUID()}`,
      name: "Community Participant",
      screenTimeHours: 6,
      deviceType: "laptop",
      eyeCondition: "none",
    };
    const response = await fetch("/api/community/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setJoinState("error");
      setJoinMessage("Could not join right now. Please try again.");
      return;
    }

    const data = (await response.json()) as {
      ok: boolean;
      data: { participantCode: string };
    };
    setJoinState("done");
    setJoinMessage(`You're in! Participant code: ${data.data.participantCode}`);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
                  <Users className="h-4 w-4" />
                  Community Research Program
                </span>
                <h1 className="mt-5 text-4xl font-bold sm:text-5xl">
                  Help us build the future of <span className="gradient-text">eye health</span>
                </h1>
                <p className="mt-4 max-w-xl text-muted">
                  Join our 30-minute study and contribute real-world telemetry for personalized fatigue prediction.
                  Your contribution advances conference-grade research and better digital wellness products.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => void joinResearch()}
                    disabled={joinState === "loading"}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-background transition hover:bg-accent/90"
                  >
                    {joinState === "loading" ? "Joining..." : "Join Research"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 rounded-xl border border-card-border px-6 py-3 font-semibold text-foreground transition hover:border-accent/40 hover:bg-card"
                  >
                    Read Methodology
                  </Link>
                </div>
                {joinMessage ? (
                  <p
                    className={`mt-4 text-sm ${
                      joinState === "error" ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {joinMessage}
                  </p>
                ) : null}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-card-border bg-card/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Scan to open on phone</h2>
                  <QrCode className="h-5 w-5 text-accent" />
                </div>
                <div className="mt-6 flex justify-center rounded-xl border border-card-border bg-background/40 p-6">
                  <QRCodeSVG value="https://eye-guard.app/community" size={200} bgColor="transparent" fgColor="#06b6d4" />
                </div>
                <p className="mt-4 text-center text-sm text-muted">
                  Quick mobile onboarding for participants during lab sessions.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg border border-card-border bg-background/40 p-4">
                    <div className="text-2xl font-bold text-accent">{stats.participants}</div>
                    <div className="text-xs text-muted">Active Participants</div>
                  </div>
                  <div className="rounded-lg border border-card-border bg-background/40 p-4">
                    <div className="text-2xl font-bold text-accent-2">{sessionCount}</div>
                    <div className="text-xs text-muted">Sessions Logged</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-card-border bg-card/40 p-6">
              <div className="mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="text-2xl font-semibold">Top Contributors</h2>
              </div>
              <div className="space-y-3">
                {(leaders.length ? leaders : [{ rank: 1, participant: "No contributors yet", points: 0 }]).map(
                  (leader, index) => (
                  <div
                    key={`${leader.participant}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-card-border bg-background/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                        {leader.rank ?? index + 1}
                      </span>
                      <span className="font-medium">{leader.participant}</span>
                    </div>
                    <span className="text-sm text-muted">{leader.points} pts</span>
                  </div>
                )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
