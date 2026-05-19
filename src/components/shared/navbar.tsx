"use client";

import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Eye, Flame, BarChart3, Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const { user, isSignedIn } = useUser();
  const [streak, setStreak] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Close mobile menu on route change / resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 640) setMobileOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[#5B6CFF]/20 group-hover:shadow-[#5B6CFF]/40 transition-shadow">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">EyeGuard</span>
                <span className="hidden sm:block text-[10px] text-gray-400 -mt-0.5 tracking-wide">AI Eye Health Monitor</span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              {/* PWA Install Button */}
              {showInstall && (
                <button onClick={handleInstall} className="pwa-install-btn text-xs px-3 py-2 inline-flex items-center gap-1.5" title="Install EyeGuard App">
                  <Download className="h-3.5 w-3.5" /> Install App
                </button>
              )}
              
              <Link href="/presentation" className="text-xs px-3 py-2 font-medium text-gray-600 hover:text-[#5B6CFF] transition-colors inline-flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> Presentation
              </Link>

              {isSignedIn && (
                <>
                  <div className="streak-badge text-xs">
                    <Flame className="h-3.5 w-3.5" />
                    {streak} {streak === 1 ? "day" : "days"}
                  </div>
                  <span className="hidden md:block text-sm text-gray-600">
                    👋 Hi, {user?.firstName || "User"}
                  </span>
                  <Link href="/analytics" className="btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1.5">
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

            {/* Mobile: minimal items + hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              {isSignedIn && (
                <div className="streak-badge text-[10px] px-2 py-1">
                  <Flame className="h-3 w-3" />
                  {streak}d
                </div>
              )}
              {isSignedIn && <UserButton />}
              {!isSignedIn && (
                <SignInButton mode="modal">
                  <button className="btn-primary text-[10px] px-3 py-1.5">Sign In</button>
                </SignInButton>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-9 h-9 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden" onClick={closeMobile} />
          <div className="fixed top-14 left-0 right-0 z-45 sm:hidden animate-slide-down">
            <div className="mx-3 mt-1 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl p-4 space-y-2">
              {isSignedIn && (
                <p className="text-sm text-gray-500 px-3 pb-2 border-b border-gray-100">
                  👋 Hi, {user?.firstName || "User"}
                </p>
              )}
              <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:bg-[#5B6CFF]/10 transition-colors">
                <Eye className="h-4 w-4 text-[#5B6CFF]" /> Dashboard
              </Link>
              <Link href="/analytics" onClick={closeMobile} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:bg-[#5B6CFF]/10 transition-colors">
                <BarChart3 className="h-4 w-4 text-[#5B6CFF]" /> Analytics
              </Link>
              <Link href="/docs" onClick={closeMobile} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:bg-[#5B6CFF]/10 transition-colors">
                <Flame className="h-4 w-4 text-[#5B6CFF]" /> Documentation
              </Link>
              <Link href="/presentation" onClick={closeMobile} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:bg-[#5B6CFF]/10 transition-colors">
                <BarChart3 className="h-4 w-4 text-[#5B6CFF]" /> Presentation
              </Link>
              {showInstall && (
                <button onClick={() => { handleInstall(); closeMobile(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#5B6CFF] hover:bg-[#5B6CFF]/10 transition-colors w-full text-left">
                  <Download className="h-4 w-4" /> Install App
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
