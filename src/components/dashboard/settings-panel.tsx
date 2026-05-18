"use client";

import { useState, useEffect } from "react";
import { X, Moon, Volume2, Flame, Clock, Dumbbell, Lightbulb, History } from "lucide-react";

const eyeExercises = [
  "Look at a distant object 20 feet away for 20 seconds (20-20-20 rule)",
  "Slowly roll your eyes in a circle, 5 times clockwise and 5 counter-clockwise",
  "Close your eyes tightly for 5 seconds, then open wide. Repeat 10 times",
  "Focus on your thumb at arm's length, slowly bring it closer, then push away. Repeat 10 times",
  "Blink rapidly for 15 seconds to refresh your tear film",
  "Cover your eyes with warm palms for 30 seconds (palming exercise)",
  "Look up, down, left, right in a cross pattern. Repeat 5 times",
  "Draw a figure-8 with your eyes, tracing slowly. Repeat 5 times",
];

const eyeCareTips = [
  "Keep your screen brightness similar to your surroundings to reduce eye strain.",
  "Position your monitor 20-26 inches from your eyes.",
  "Use the 20-20-20 rule: Every 20 minutes, look 20 feet away for 20 seconds.",
  "Blink often! We blink 66% less while using computers.",
  "Adjust text size so you don't squint while reading.",
  "Use artificial tears if your eyes feel dry.",
  "Reduce overhead lighting to eliminate screen glare.",
  "Take a 15-minute break after every 2 hours of screen time.",
  "Eat foods rich in omega-3, vitamin A, and lutein for eye health.",
  "Get regular eye check-ups at least once a year.",
];

type SessionRecord = {
  id: string;
  date: string;
  duration: string;
  fatigueAvg: number;
};

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

function loadSettings() {
  if (typeof window === "undefined") return { darkMode: false, soundEffects: true, showStreak: true, breakInterval: 20 };
  try {
    const raw = localStorage.getItem("eyeguard_settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { darkMode: false, soundEffects: true, showStreak: true, breakInterval: 20 };
}

function loadSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("eyeguard_sessions");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [breakInterval, setBreakInterval] = useState(20);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [exerciseText, setExerciseText] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const s = loadSettings();
    setDarkMode(s.darkMode);
    setSoundEffects(s.soundEffects);
    setShowStreak(s.showStreak);
    setBreakInterval(s.breakInterval);
    setSessions(loadSessions());
  }, []);

  // Persist settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("eyeguard_settings", JSON.stringify({ darkMode, soundEffects, showStreak, breakInterval }));
  }, [darkMode, soundEffects, showStreak, breakInterval]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.style.filter = "invert(0.88) hue-rotate(180deg)";
      document.querySelectorAll("video, img").forEach((el) => {
        (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
      });
    } else {
      document.documentElement.style.filter = "";
      document.querySelectorAll("video, img").forEach((el) => {
        (el as HTMLElement).style.filter = "";
      });
    }
  }, [darkMode]);

  const startRandomExercise = () => {
    const exercise = eyeExercises[Math.floor(Math.random() * eyeExercises.length)];
    setExerciseText(exercise || "");
    if (soundEffects && typeof window !== "undefined") {
      try { new Audio("data:audio/wav;base64,UklGRl9vT19teleXBFAAAA").play().catch(() => {}); } catch {}
    }
    setTimeout(() => setExerciseText(""), 8000);
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % eyeCareTips.length);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99]" onClick={onClose} />
      )}

      <div className={`settings-panel ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white text-sm">⚙️</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-[#5B6CFF]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Dark Mode</p>
                <p className="text-xs text-gray-400">Reduce eye strain at night</p>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`toggle-switch ${darkMode ? "active" : ""}`} aria-label="Toggle dark mode" />
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Sound Effects</p>
                <p className="text-xs text-gray-400">Audio feedback for actions</p>
              </div>
            </div>
            <button onClick={() => setSoundEffects(!soundEffects)} className={`toggle-switch ${soundEffects ? "active" : ""}`} aria-label="Toggle sound" />
          </div>

          {/* Show Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Show Streak</p>
                <p className="text-xs text-gray-400">Display daily tracking streak</p>
              </div>
            </div>
            <button onClick={() => setShowStreak(!showStreak)} className={`toggle-switch ${showStreak ? "active" : ""}`} aria-label="Toggle streak" />
          </div>

          {/* Break Interval */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Break Interval</p>
                <p className="text-xs text-gray-400">Minutes between reminders</p>
              </div>
            </div>
            <select
              value={breakInterval}
              onChange={(e) => setBreakInterval(Number(e.target.value))}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/30 focus:border-[#5B6CFF]"
            >
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* Session History */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-[#5B6CFF]" /> Session History
            </h3>
            {sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.slice(-3).reverse().map((s) => (
                  <div key={s.id} className="rounded-xl bg-gray-50 p-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-gray-900">{s.date}</p>
                      <p className="text-xs text-gray-400">{s.duration}</p>
                    </div>
                    <span className={`badge ${s.fatigueAvg >= 60 ? "badge-danger" : s.fatigueAvg >= 35 ? "badge-warning" : "badge-success"}`}>
                      {s.fatigueAvg}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-400">No sessions yet. Start tracking!</p>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Eye Exercises */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Dumbbell className="h-4 w-4 text-emerald-600" /> Eye Exercises
            </h3>
            {exerciseText && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 mb-3 text-sm text-emerald-800 leading-relaxed animate-pulse-soft">
                🧘 {exerciseText}
              </div>
            )}
            <button onClick={startRandomExercise} className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
              🏋️ Start Random Exercise
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* Eye Care Tips */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" /> Eye Care Tips
            </h3>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-3">
              <div className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0">💡</span>
                <p className="text-sm text-amber-900 leading-relaxed">{eyeCareTips[currentTipIndex]}</p>
              </div>
            </div>
            <button onClick={nextTip} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
              Next Tip
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
