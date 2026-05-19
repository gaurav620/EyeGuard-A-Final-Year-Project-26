"use client";
import Link from "next/link";
import { Eye, Mail, Heart, Monitor, Smartphone, Download } from "lucide-react";
import { useEffect, useState } from "react";

/* Inline SVG brand icons */
const LinkedinIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const GithubIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
);

type FooterLink = { label: string; href: string; external?: boolean };

const LINKS: Record<string, FooterLink[]> = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
    { label: "Documentation", href: "/docs" },
    { label: "Presentation", href: "/presentation" },
    { label: "FAQs", href: "/faqs" },
  ],
  Resources: [
    { label: "Eye Health Blog", href: "https://www.aao.org/eye-health", external: true },
    { label: "Research Papers", href: "https://scholar.google.com/scholar?q=digital+eye+strain", external: true },
    { label: "WHO Vision Report", href: "https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment", external: true },
    { label: "MediaPipe Docs", href: "https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker", external: true },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact Us", href: "mailto:gauravkumarmehta100@gmail.com" },
    { label: "GitHub", href: "https://github.com/gaurav620", external: true },
  ],
};

export function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const pwaHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", pwaHandler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstall(false);
    }
    return () => window.removeEventListener("beforeinstallprompt", pwaHandler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowInstall(false);
    setDeferredPrompt(null);
  };

  return (
    <footer className="relative z-10 border-t border-gray-200/50 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[#5B6CFF]/20">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-gray-900">EyeGuard</span>
                <span className="block text-[10px] text-gray-400">AI Eye Health Monitor</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Medical-grade AI eye health monitoring. Real-time blink detection, fatigue analysis, and personalized care using MediaPipe & deep learning.
            </p>
            <div className="mt-4 flex gap-2.5">
              <a href="https://www.linkedin.com/in/gaurav-kumar-mehta/" target="_blank" rel="noopener" className="w-9 h-9 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors text-[#0A66C2]" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
              <a href="https://github.com/gaurav620" target="_blank" rel="noopener" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700" aria-label="GitHub">
                <GithubIcon />
              </a>
              <a href="mailto:gauravkumarmehta100@gmail.com" className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="Email">
                <Mail className="h-4 w-4 text-gray-600" />
              </a>
            </div>

            {/* PWA Install App Section */}
            <div className="mt-8">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Available On</h3>
              <div className="flex items-center gap-4 text-gray-500 mb-4">
                <button onClick={handleInstall} className="flex items-center gap-1.5 hover:text-[#5B6CFF] transition-colors cursor-pointer" title="Install on Desktop">
                  <Monitor className="h-4 w-4" /><span className="text-[10px] font-medium">Desktop</span>
                </button>
                <button onClick={handleInstall} className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer" title="Install on Android">
                  <Smartphone className="h-4 w-4" /><span className="text-[10px] font-medium">Android</span>
                </button>
                <button onClick={() => alert("To install on iOS: Open this website in Safari, tap the 'Share' icon at the bottom, and select 'Add to Home Screen'.")} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer" title="Install on iOS">
                  <Smartphone className="h-4 w-4" /><span className="text-[10px] font-medium">iOS</span>
                </button>
              </div>
              
              {showInstall ? (
                <button onClick={handleInstall} className="btn-primary w-full text-xs px-4 py-2.5 inline-flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" /> Install EyeGuard App
                </button>
              ) : (
                <div className="text-[10px] text-gray-400 p-3 rounded-lg border border-gray-200/50 bg-gray-50/50">
                  <p>App is either installed or not supported by your current browser.</p>
                </div>
              )}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link: FooterLink) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#5B6CFF] transition-colors">
                        {link.label} ↗
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-gray-500 hover:text-[#5B6CFF] transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} EyeGuard. Built with <Heart className="inline h-3 w-3 text-red-400" /> by Team EyeGuard — JISCE CSE
          </p>
          <p className="text-xs text-gray-400">
            Powered by MediaPipe · PyTorch · Next.js · Groq · Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
