"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { slides } from "./slides";
import {
  ChevronLeft, ChevronRight, Download, Maximize, Minimize,
  Eye, ChevronDown, Home
} from "lucide-react";
import Link from "next/link";

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [isFS, setIsFS] = useState(false);
  const [anim, setAnim] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  const slide = slides[current];

  const goTo = useCallback((idx: number, dir: "left" | "right" = "right") => {
    if (idx < 0 || idx >= slides.length) return;
    setAnim(dir === "right" ? "slide-out-left" : "slide-out-right");
    setTimeout(() => {
      setCurrent(idx);
      setAnim(dir === "right" ? "slide-in-right" : "slide-in-left");
      setTimeout(() => setAnim(""), 400);
    }, 250);
  }, []);

  const toggleFS = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  /* Keyboard navigation — uses refs to avoid stale closures */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const c = currentRef.current;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (c < slides.length - 1) goTo(c + 1, "right");
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (c > 0) goTo(c - 1, "left");
      }
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) {
        toggleFS();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, toggleFS]);

  /* Sync isFS state with actual fullscreen status */
  useEffect(() => {
    const handler = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const [isDownloading, setIsDownloading] = useState(false);

  const prev = () => current > 0 && goTo(current - 1, "left");
  const next = () => current < slides.length - 1 && goTo(current + 1, "right");

  const downloadPPTX = async () => {
    setIsDownloading(true);
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      pptx.author = "EyeGuard AI Team";
      pptx.title = "EyeGuard AI — Final Year Project Presentation";

      for (const s of slides) {
        const sl = pptx.addSlide();
        sl.background = { fill: "0F0C29" };

        /* Title */
        sl.addText(s.title, {
          x: 0.6, y: 0.4, w: 8.8, h: 0.8,
          fontSize: 32, bold: true, color: "FFFFFF",
          fontFace: "Arial",
        });

        /* Subtitle */
        if (s.subtitle) {
          sl.addText(s.subtitle, {
            x: 0.6, y: 1.15, w: 8.8, h: 0.5,
            fontSize: 16, color: "A78BFA", fontFace: "Arial",
          });
        }

        /* Content */
        sl.addText(s.content, {
          x: 0.6, y: 1.8, w: 8.8, h: 0.7,
          fontSize: 13, color: "D1D5DB", fontFace: "Arial",
          lineSpacingMultiple: 1.3,
        });

        /* Stats */
        if (s.stats) {
          s.stats.forEach((st, i) => {
            const xPos = 0.6 + i * 2.2;
            sl.addText(st.value, {
              x: xPos, y: 2.6, w: 2, h: 0.5,
              fontSize: 24, bold: true, color: st.color.replace("#", ""),
              fontFace: "Arial", align: "center",
            });
            sl.addText(st.label, {
              x: xPos, y: 3.05, w: 2, h: 0.3,
              fontSize: 10, color: "9CA3AF",
              fontFace: "Arial", align: "center",
            });
          });
        }

        /* Bullets */
        if (s.bullets) {
          const startY = s.stats ? 3.5 : 2.6;
          const bulletText = s.bullets.map(b => ({
            text: b, options: { fontSize: 11, color: "E5E7EB", bullet: { code: "25CF" } as any, lineSpacingMultiple: 1.5 }
          }));
          sl.addText(bulletText as any, {
            x: 0.6, y: startY, w: 8.8, h: 3.5,
            fontFace: "Arial", valign: "top",
          });
        }

        /* Footer */
        sl.addText(`Slide ${s.id}/10 — EyeGuard AI | JISCE CSE`, {
          x: 0.6, y: 6.8, w: 8.8, h: 0.3,
          fontSize: 8, color: "6B7280", fontFace: "Arial",
        });
      }

      await pptx.writeFile({ fileName: "EyeGuard_AI_Presentation.pptx" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div ref={containerRef} className="ppt-root">
      <style>{`
        .ppt-root {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ─ Toolbar ─ */
        .ppt-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          background: rgba(15,15,25,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          z-index: 50;
          flex-shrink: 0;
        }
        .ppt-toolbar-left { display: flex; align-items: center; gap: 12px; }
        .ppt-toolbar-right { display: flex; align-items: center; gap: 8px; }
        .ppt-logo {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, #5B6CFF, #8B5CF6);
          display: flex; align-items: center; justify-content: center;
        }
        .ppt-brand { color: #fff; font-weight: 700; font-size: 15px; }
        .ppt-brand-sub { color: #6B7280; font-size: 11px; }
        .ppt-slide-num {
          background: rgba(91,108,255,0.15); color: #A78BFA;
          font-size: 12px; font-weight: 600; padding: 4px 14px;
          border-radius: 20px; border: 1px solid rgba(91,108,255,0.2);
        }
        .ppt-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px; font-size: 12px;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #d1d5db;
        }
        .ppt-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .ppt-btn-primary {
          background: linear-gradient(135deg, #5B6CFF, #8B5CF6);
          border: none; color: #fff;
        }
        .ppt-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

        /* ─ Stage ─ */
        .ppt-stage {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* ─ Slide ─ */
        .ppt-slide {
          width: 95vw;
          max-height: 82vh;
          max-width: calc(82vh * 16 / 9);
          margin: 0 auto;
          aspect-ratio: 16/9;
          border-radius: 16px;
          position: relative; overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
          display: flex; flex-direction: column; justify-content: center;
          padding: 50px 60px;
        }
        @media (max-width: 768px) {
          .ppt-slide { padding: 24px 28px; border-radius: 12px; aspect-ratio: auto; min-height: 420px; }
        }

        .ppt-slide::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 70% 20%, rgba(91,108,255,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .ppt-slide-title {
          font-size: clamp(22px, 4vw, 52px); font-weight: 800;
          color: #ffffff; margin: 0 0 4px; line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .ppt-slide-subtitle {
          font-size: clamp(12px, 2vw, 24px); font-weight: 500;
          color: #A78BFA; margin: 0 0 16px; letter-spacing: -0.01em;
        }
        .ppt-slide-content {
          font-size: clamp(11px, 1.5vw, 18px); color: #9CA3AF;
          line-height: 1.6; margin: 0 0 18px; max-width: 90%;
        }

        /* Stats Row */
        .ppt-stats {
          display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;
        }
        .ppt-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 10px 18px;
          text-align: center; min-width: 90px; flex: 1;
        }
        .ppt-stat-val {
          font-size: clamp(18px, 2.5vw, 26px); font-weight: 800; line-height: 1.1;
        }
        .ppt-stat-lbl {
          font-size: clamp(8px, 1vw, 11px); color: #6B7280;
          font-weight: 500; margin-top: 2px;
        }

        /* Bullets */
        .ppt-bullets {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 6px;
        }
        .ppt-bullet {
          font-size: clamp(10px, 1.2vw, 13px); color: #D1D5DB;
          line-height: 1.55; display: flex; align-items: flex-start; gap: 10px;
        }
        .ppt-bullet::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: #5B6CFF; flex-shrink: 0; margin-top: 6px;
        }

        .ppt-slide-footer {
          position: absolute; bottom: 16px; left: 60px; right: 60px;
          font-size: 10px; color: #4B5563;
          display: flex; justify-content: space-between;
        }
        @media (max-width: 768px) {
          .ppt-slide-footer { left: 28px; right: 28px; bottom: 10px; font-size: 9px; }
        }

        /* ─ Nav Arrows ─ */
        .ppt-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #fff; transition: all 0.2s; z-index: 10;
        }
        .ppt-nav:hover { background: rgba(91,108,255,0.3); }
        .ppt-nav-left { left: max(10px, calc(50% - 510px)); }
        .ppt-nav-right { right: max(10px, calc(50% - 510px)); }
        .ppt-nav:disabled { opacity: 0.2; cursor: default; }
        @media (max-width: 768px) {
          .ppt-nav { width: 36px; height: 36px; }
          .ppt-nav-left { left: 4px; }
          .ppt-nav-right { right: 4px; }
        }

        /* ─ Thumbnail Strip ─ */
        .ppt-thumbs {
          display: flex; gap: 6px; padding: 10px 20px 14px;
          justify-content: center; flex-wrap: nowrap;
          overflow-x: auto; flex-shrink: 0;
          background: rgba(15,15,25,0.95);
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .ppt-thumb {
          width: 64px; height: 36px; border-radius: 6px;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
          border: 2px solid transparent; position: relative;
          overflow: hidden;
        }
        .ppt-thumb.active { border-color: #5B6CFF; box-shadow: 0 0 12px rgba(91,108,255,0.4); }
        .ppt-thumb:hover { border-color: rgba(91,108,255,0.5); }
        .ppt-thumb-num {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
        }

        /* ─ Animations ─ */
        .slide-in-right { animation: slideInR 0.35s cubic-bezier(0.16,1,0.3,1); }
        .slide-in-left { animation: slideInL 0.35s cubic-bezier(0.16,1,0.3,1); }
        .slide-out-left { animation: slideOutL 0.25s ease-in forwards; }
        .slide-out-right { animation: slideOutR 0.25s ease-in forwards; }

        @keyframes slideInR { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInL { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideOutL { to { opacity:0; transform:translateX(-30px); } }
        @keyframes slideOutR { to { opacity:0; transform:translateX(30px); } }

        .ppt-fadein { animation: fadeUp 0.6s ease-out both; }
        .ppt-fadein-d1 { animation-delay: 0.1s; }
        .ppt-fadein-d2 { animation-delay: 0.2s; }
        .ppt-fadein-d3 { animation-delay: 0.3s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Toolbar */}
      <div className="ppt-toolbar">
        <div className="ppt-toolbar-left">
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div className="ppt-logo"><Eye size={16} color="#fff" /></div>
            <div>
              <div className="ppt-brand">EyeGuard AI</div>
              <div className="ppt-brand-sub">Project Presentation</div>
            </div>
          </Link>
          <span className="ppt-slide-num">{current + 1} / {slides.length}</span>
        </div>
        <div className="ppt-toolbar-right">
          <Link href="/" className="ppt-btn" style={{ textDecoration: "none" }}>
            <Home size={14} /> Home
          </Link>
          <button className="ppt-btn" onClick={toggleFS}>
            {isFS ? <Minimize size={14} /> : <Maximize size={14} />}
            {isFS ? "Exit" : "Fullscreen"}
          </button>
          <button className="ppt-btn ppt-btn-primary" onClick={downloadPPTX} disabled={isDownloading}>
            {isDownloading ? (
              <><span className="animate-spin text-lg leading-none">⟳</span> Downloading...</>
            ) : (
              <><Download size={14} /> Download .pptx</>
            )}
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="ppt-stage">
        <button className="ppt-nav ppt-nav-left" onClick={prev} disabled={current === 0}>
          <ChevronLeft size={22} />
        </button>

        <div
          className={`ppt-slide ${anim}`}
          key={slide.id}
          style={{ background: slide.gradient }}
        >
          <div className="ppt-fadein">
            <h1 className="ppt-slide-title">{slide.title}</h1>
          </div>
          {slide.subtitle && (
            <p className="ppt-slide-subtitle ppt-fadein ppt-fadein-d1">{slide.subtitle}</p>
          )}
          <p className="ppt-slide-content ppt-fadein ppt-fadein-d1">{slide.content}</p>

          {slide.stats && (
            <div className="ppt-stats ppt-fadein ppt-fadein-d2">
              {slide.stats.map((s) => (
                <div className="ppt-stat" key={s.label}>
                  <div className="ppt-stat-val" style={{ color: s.color }}>{s.value}</div>
                  <div className="ppt-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {slide.bullets && (
            <ul className="ppt-bullets ppt-fadein ppt-fadein-d3">
              {slide.bullets.map((b, i) => (
                <li className="ppt-bullet" key={i}>{b}</li>
              ))}
            </ul>
          )}

          <div className="ppt-slide-footer">
            <span>{slide.footer || `EyeGuard AI — JISCE, Dept. of CSE`}</span>
            <span>Slide {slide.id} of {slides.length}</span>
          </div>
        </div>

        <button className="ppt-nav ppt-nav-right" onClick={next} disabled={current === slides.length - 1}>
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="ppt-thumbs">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`ppt-thumb ${i === current ? "active" : ""}`}
            style={{ background: s.gradient }}
            onClick={() => goTo(i, i > current ? "right" : "left")}
          >
            <div className="ppt-thumb-num">{s.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
