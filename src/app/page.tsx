"use client";

import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ParticleBackground } from "@/components/shared/particle-bg";
import { AIChatbot } from "@/components/dashboard/ai-chatbot";
import { Eye, Activity, BarChart3, Clock, Shield, Cpu, Bell, Smartphone, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

/* Inline SVG icons for social (lucide doesn't ship brand icons) */
const LinkedinIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const GithubIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);

const features = [
  { icon: Eye, title: "Blink Detection", desc: "Real-time tracking using MediaPipe 468-point face landmarks with EAR + blendshape dual detection" },
  { icon: Activity, title: "Fatigue Scoring", desc: "AI-powered health scoring based on blink rate, eye openness, and session duration" },
  { icon: Clock, title: "20-20-20 Rule", desc: "Built-in exercise timers and smart break reminders based on research guidelines" },
  { icon: BarChart3, title: "Smart Analytics", desc: "Session history, fatigue trends, weekly charts, and eye health grading (A+ to F)" },
  { icon: Shield, title: "100% Private", desc: "All camera processing runs locally — zero frames leave your device. Ever." },
  { icon: Cpu, title: "ML Pipeline", desc: "EyeNet CNN + 6-layer LLM fallback chain (Groq → OpenAI → Gemini → OpenRouter)" },
  { icon: Bell, title: "Smart Alerts", desc: "Sound beeps on blinks, audio alerts on fatigue, email notifications at critical levels" },
  { icon: Smartphone, title: "PWA Ready", desc: "Install as native app on mobile & desktop with offline support via Service Worker" },
];

const teamMembers = [
  {
    name: "Ayan Biswas",
    id: "JISCE/CSE/22-26/G21/123221103043",
    role: "ML Engineer & Backend",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    initials: "AB",
  },
  {
    name: "Gaurav Kumar Mehta",
    id: "JISCE/CSE/22-26/G21/123221103064",
    role: "Full Stack Lead & Architecture",
    linkedin: "https://www.linkedin.com/in/gaurav-kumar-mehta/",
    github: "https://github.com/gaurav620",
    gradient: "from-[#5B6CFF] to-[#8B5CF6]",
    shadow: "shadow-[#5B6CFF]/20",
    initials: "GK",
  },
  {
    name: "Arpan Misra",
    id: "JISCE/CSE/22-26/G21/123221103035",
    role: "Frontend & UI/UX Design",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    gradient: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
    initials: "AM",
  },
  {
    name: "Arka Bhattacharya",
    id: "JISCE/CSE/23-26/G21/123231103205",
    role: "Research & Testing",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
    initials: "AB",
  },
];

export default function HomePage() {
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("eyeguard_sessions") || "[]");
      setSessionCount(s.length);
    } catch {}
  }, []);

  return (
    <div className="noise-overlay relative min-h-screen">
      <ParticleBackground />
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="pt-32 pb-20 px-4">
          <div className="mx-auto max-w-4xl text-center section-fade">
            <div className="landing-icon mb-8">
              <Eye className="h-16 w-16 text-white" strokeWidth={1.5} />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#5B6CFF]/10 border border-[#5B6CFF]/20 px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-[#5B6CFF]">Powered by MediaPipe & Deep Learning</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Protect Your<br /><span className="gradient-text">Eye Health</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Medical-grade AI eye strain detection with real-time blink tracking, fatigue analysis, and personalized care — all running locally in your browser.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
                <Eye className="h-5 w-5" /> Start Eye Tracking
              </Link>
              <Link href="/docs" className="btn-secondary text-base px-8 py-3.5 inline-flex items-center gap-2">
                View Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="pb-16 px-4">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 section-fade">
            {[
              { label: "Face Landmarks", value: "468" },
              { label: "Your Sessions", value: sessionCount.toString() },
              { label: "LLM Providers", value: "6" },
              { label: "Privacy Score", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="pb-24 px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-4 section-fade">
              Powered by <span className="gradient-text">Intelligence</span>
            </h2>
            <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto section-fade">
              Advanced computer vision and adaptive ML models working together to protect your eyes.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title} className="feature-card section-fade">
                  <div className="icon-glow">
                    <f.icon className="h-6 w-6 text-[#5B6CFF]" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="pb-24 px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-12 section-fade">
              How <span className="gradient-text">It Works</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-3 section-fade">
              {[
                { step: "1", title: "Start Session", desc: "Click Start to activate your camera. MediaPipe loads in seconds." },
                { step: "2", title: "AI Tracks Eyes", desc: "468 face landmarks detect every blink in real-time with sound feedback." },
                { step: "3", title: "Get Your Report", desc: "Stop to see detailed health assessment, score, and personalized tips." },
              ].map((s) => (
                <div key={s.step} className="glass-card-static p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg shadow-[#5B6CFF]/20">{s.step}</div>
                  <h3 className="font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="pb-24 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12 section-fade">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 mb-4">
                <GraduationCap className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-600">JISCE — CSE Department</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Meet Our <span className="gradient-text">Team</span>
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Built by passionate CSE students from JIS College of Engineering, driven by the mission to protect digital eye health.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 section-fade">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-card group">
                  {/* Avatar */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg ${member.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl font-bold text-white">{member.initials}</span>
                  </div>

                  {/* Info */}
                  <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
                  <p className="text-xs font-medium text-[#5B6CFF] mt-1">{member.role}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-mono leading-relaxed">{member.id}</p>

                  {/* Social Icons */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors text-[#0A66C2]" aria-label={`${member.name} LinkedIn`}>
                      <LinkedinIcon />
                    </a>
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700" aria-label={`${member.name} GitHub`}>
                      <GithubIcon />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24 px-4">
          <div className="mx-auto max-w-3xl glass-card p-10 sm:p-14 text-center section-fade">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to protect your <span className="gradient-text">vision</span>?
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Start monitoring your eye health for free. No downloads — works right in your browser.
            </p>
            <Link href="/dashboard" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
              <Eye className="h-5 w-5" /> Launch Dashboard
            </Link>
          </div>
        </section>

        <AIChatbot />
        <Footer />
      </div>
    </div>
  );
}
