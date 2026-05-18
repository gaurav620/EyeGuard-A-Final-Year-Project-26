"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Eye, Flame, BarChart3, Download } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { user, isSignedIn } = useUser();
  const [streak, setStreak] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    try {
      const sessions = JSON.parse(localStorage.getItem("eyeguard_sessions") || "[]");
      // Calculate unique days with sessions
      const days = new Set(sessions.map((s: any) => s.date?.split(",")[0]));
      setStreak(days.size);
    } catch { setStreak(0); }

    // Listen for storage changes
    const handler = () => {
      try {
        const s = JSON.parse(localStorage.getItem("eyeguard_sessions") || "[]");
        setStreak(new Set(s.map((x: any) => x.date?.split(",")[0])).size);
      } catch {}
    };
    window.addEventListener("storage", handler);

    // PWA install prompt
    const pwaHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", pwaHandler);

    // Hide install if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstall(false);
    }

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("beforeinstallprompt", pwaHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[#5B6CFF]/20 group-hover:shadow-[#5B6CFF]/40 transition-shadow">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 tracking-tight">EyeGuard</span>
              <span className="hidden sm:block text-[10px] text-gray-400 -mt-0.5 tracking-wide">AI Eye Health Monitor</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            {showInstall && (
              <button onClick={handleInstall} className="pwa-install-btn text-xs px-3 py-2 hidden sm:inline-flex items-center gap-1.5" title="Install EyeGuard App">
                <Download className="h-3.5 w-3.5" /> Install App
              </button>
            )}

            {isSignedIn && (
              <>
                <div className="streak-badge text-xs">
                  <Flame className="h-3.5 w-3.5" />
                  {streak} {streak === 1 ? "day" : "days"}
                </div>
                <span className="hidden md:block text-sm text-gray-600">
                  👋 Hi, {user?.firstName || "User"}
                </span>
                <Link href="/analytics" className="btn-secondary text-xs px-3 py-2 hidden sm:inline-flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" /> Analytics
                </Link>
                <Link href="/dashboard" className="btn-primary text-xs px-4 py-2">Dashboard</Link>
                <UserButton />
              </>
            )}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="btn-primary text-xs px-4 py-2">Sign In</button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
