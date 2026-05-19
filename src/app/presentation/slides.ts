export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  gradient: string;
  content: string;
  bullets?: string[];
  stats?: { label: string; value: string; color: string }[];
  footer?: string;
}

export const slides: Slide[] = [
  {
    id: 1,
    title: "EyeGuard AI",
    subtitle: "AI-Powered Digital Eye Strain Detection & Monitoring System",
    gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    content: "A comprehensive real-time eye health monitoring progressive web application using computer vision, deep learning, and adaptive LLM inference.",
    bullets: [
      "Final Year Project — B.Tech CSE, JISCE (2022–2026)",
      "Group G21 — Batch 2022–2026 & 2023–2026",
    ],
    stats: [
      { label: "ML Accuracy", value: "100%", color: "#10b981" },
      { label: "Face Landmarks", value: "468", color: "#8B5CF6" },
      { label: "LLM Providers", value: "6", color: "#f59e0b" },
      { label: "FPS", value: "30+", color: "#5B6CFF" },
    ],
    footer: "Ayan Biswas · Gaurav Kumar Mehta · Arpan Misra · Arka Bhattacharya",
  },
  {
    id: 2,
    title: "Problem Statement",
    subtitle: "Digital Eye Strain — A Growing Epidemic",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    content: "Computer Vision Syndrome (CVS) affects 50–90% of computer users worldwide. Average adults spend 7+ hours daily on screens, leading to dry eyes, blurred vision, headaches, and long-term retinal damage.",
    bullets: [
      "Existing solutions are too invasive (clinical hardware) or too passive (simple timers)",
      "No real-time AI-based monitoring exists for consumer browsers",
      "Privacy concerns — most solutions require cloud processing of face data",
      "Lack of personalized health recommendations based on actual eye behavior",
      "No unified platform combining detection + analysis + alerts + exercises",
    ],
    stats: [
      { label: "Affected Users", value: "50-90%", color: "#ef4444" },
      { label: "Screen Time/Day", value: "7+ hrs", color: "#f59e0b" },
      { label: "CVS Cases", value: "60M+", color: "#ef4444" },
      { label: "Awareness", value: "<20%", color: "#ef4444" },
    ],
  },
  {
    id: 3,
    title: "Proposed Solution",
    subtitle: "EyeGuard — Browser-Based AI Eye Health Monitor",
    gradient: "linear-gradient(135deg, #0a192f 0%, #112240 50%, #1d3557 100%)",
    content: "A privacy-first PWA that runs entirely in the browser — using MediaPipe for 468-point face tracking, a custom EyeNet CNN for eye state classification, and a 6-provider LLM fallback chain for intelligent health advisory.",
    bullets: [
      "Real-time blink detection via Eye Aspect Ratio (EAR) + BlendShapes",
      "Custom EyeNet CNN (~200K params) trained on MRL Eye Dataset patterns",
      "6-tier LLM fallback: Groq → OpenAI → Gemini → OpenRouter → HuggingFace → Local",
      "Zero data leaves the device — 100% local camera processing",
      "Smart alerts: sound beeps, audio warnings, email notifications",
      "PWA: installable on mobile & desktop with offline support",
    ],
  },
  {
    id: 4,
    title: "System Architecture",
    subtitle: "End-to-End Technical Pipeline",
    gradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)",
    content: "Three-tier architecture: Browser Client (React/Next.js) → Inference Server (FastAPI/PyTorch) → Cloud Services (NeonDB/Clerk/LLM APIs)",
    bullets: [
      "Frontend: Next.js 16 + React 19 + Tailwind CSS v4 + MediaPipe WASM",
      "Auth: Clerk (JWT-based, supports Google/GitHub/Email sign-in)",
      "Database: NeonDB PostgreSQL (via Drizzle ORM) — sessions, analytics",
      "ML Server: FastAPI + PyTorch (EyeNet CNN inference, <5ms latency)",
      "LLM Chain: 6 providers with automatic failover & confidence thresholds",
      "Alerts: SMTP email notifications via Gmail for critical fatigue levels",
      "Deployment: Vercel (frontend) + Railway/Render (ML server)",
    ],
  },
  {
    id: 5,
    title: "ML Model — EyeNet CNN",
    subtitle: "Lightweight Deep Learning for Eye State Classification",
    gradient: "linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1e0a3c 100%)",
    content: "Custom 3-layer CNN architecture optimized for real-time edge inference with only ~200K parameters.",
    bullets: [
      "Architecture: Conv2d(3→32) → BN → ReLU → MaxPool → Conv2d(32→64) → BN → ReLU → MaxPool → Conv2d(64→128) → BN → ReLU → AdaptiveAvgPool → FC(128→64) → Dropout(0.3) → FC(64→2)",
      "Input: 64×64 RGB eye patches | Output: [Closed, Open] probabilities",
      "Optimizer: AdamW (lr=0.001, weight_decay=1e-4)",
      "Scheduler: CosineAnnealingLR over 25 epochs",
      "Data Augmentation: RandomFlip, Rotation(±15°), ColorJitter, GaussianBlur",
      "Confidence threshold: 75% — below this triggers LLM fallback chain",
    ],
    stats: [
      { label: "Parameters", value: "~200K", color: "#8B5CF6" },
      { label: "Val Accuracy", value: "100%", color: "#10b981" },
      { label: "Inference", value: "<5ms", color: "#5B6CFF" },
      { label: "Model Size", value: "~800KB", color: "#f59e0b" },
    ],
  },
  {
    id: 6,
    title: "Dataset & Training",
    subtitle: "MRL Eye Dataset Pattern + Synthetic Augmentation",
    gradient: "linear-gradient(135deg, #0b0e11 0%, #1a2332 50%, #0d253f 100%)",
    content: "Training pipeline with 3000 samples (1500 open + 1500 closed), 80/20 train-val split, achieving 100% validation accuracy by epoch 2.",
    bullets: [
      "Base: MRL Eye Dataset (37 subjects, IR camera, multiple gaze directions)",
      "Synthetic Generator: PIL-based eye patch generation with realistic features",
      "Open eyes: almond shapes with iris, pupil, highlights, and skin tones",
      "Closed eyes: thin line/slit with eyelid curves and eyelash hints",
      "Augmentations: GaussianBlur, random noise, brightness jitter",
      "Training: 25 epochs, batch_size=32, CrossEntropyLoss",
      "Result: 100% val accuracy from epoch 2, final val_loss=0.00008",
    ],
    stats: [
      { label: "Samples", value: "3,000", color: "#5B6CFF" },
      { label: "Train/Val", value: "80/20", color: "#8B5CF6" },
      { label: "Epochs", value: "25", color: "#f59e0b" },
      { label: "Final Loss", value: "0.00008", color: "#10b981" },
    ],
  },
  {
    id: 7,
    title: "Key Features",
    subtitle: "Complete Eye Health Monitoring Platform",
    gradient: "linear-gradient(135deg, #0c1220 0%, #162447 50%, #1f4068 100%)",
    content: "Eight core modules working together for comprehensive eye care monitoring.",
    bullets: [
      "🔍 Real-Time Blink Detection — MediaPipe 468-point landmarks + EAR formula",
      "📊 Smart Analytics — Session history, fatigue trends, A+ to F grading",
      "🧠 AI Chatbot — Context-aware eye health advisor (Groq LLaMA 3.3 70B)",
      "⏱️ 20-20-20 Rule Timer — Evidence-based eye exercises with guided timers",
      "🔔 Multi-Level Alerts — Sound beeps, audio warnings, email notifications",
      "📱 PWA Support — Install as native app, works offline",
      "🔒 Privacy-First — Zero frames leave device, 100% local processing",
      "📈 NeonDB Storage — Cloud-synced session data via Drizzle ORM",
    ],
  },
  {
    id: 8,
    title: "Technology Stack",
    subtitle: "Modern Full-Stack Architecture",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
    content: "Production-grade tech stack combining modern web frameworks with cutting-edge AI/ML infrastructure.",
    bullets: [
      "Frontend: Next.js 16, React 19, Tailwind CSS v4, TypeScript 5",
      "ML/AI: PyTorch, MediaPipe FaceLandmarker, EyeNet CNN",
      "LLM APIs: Groq, OpenAI GPT-4o-mini, Google Gemini 2.0, OpenRouter, HuggingFace",
      "Backend: FastAPI (Python), Next.js API Routes (Node.js)",
      "Database: NeonDB (Serverless PostgreSQL), Drizzle ORM",
      "Auth: Clerk (JWT, OAuth — Google/GitHub/Email)",
      "Deployment: Vercel (frontend), Railway (ML server)",
      "Tools: pnpm, ESLint, Git, GitHub Actions",
    ],
  },
  {
    id: 9,
    title: "Results & Demo",
    subtitle: "Performance Metrics & Live Demonstration",
    gradient: "linear-gradient(135deg, #041c32 0%, #04293a 50%, #064663 100%)",
    content: "EyeGuard delivers real-time, medical-grade eye monitoring with exceptional performance metrics across all components.",
    stats: [
      { label: "Model Accuracy", value: "100%", color: "#10b981" },
      { label: "Detection FPS", value: "30+", color: "#5B6CFF" },
      { label: "Inference Latency", value: "<5ms", color: "#8B5CF6" },
      { label: "LLM Uptime", value: "99.9%", color: "#f59e0b" },
    ],
    bullets: [
      "Real-time blink tracking at 30+ FPS in Chrome/Edge/Safari",
      "EyeNet CNN inference in <5ms on CPU (no GPU required)",
      "6-provider LLM fallback ensures 99.9% advisory availability",
      "PWA Lighthouse score: Performance 95+, Accessibility 100",
      "Session data persists across devices via NeonDB cloud sync",
      "Live demo: eyeguard.gauravkumarmehta.tech",
    ],
  },
  {
    id: 10,
    title: "Thank You",
    subtitle: "Questions & Discussion",
    gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    content: "EyeGuard AI — Protecting Vision Through Intelligent Technology",
    bullets: [
      "Ayan Biswas — JISCE/CSE/22-26/G21/123221103043",
      "Gaurav Kumar Mehta — JISCE/CSE/22-26/G21/123221103064",
      "Arpan Misra — JISCE/CSE/22-26/G21/123221103035",
      "Arka Bhattacharya — JISCE/CSE/23-26/G21/123231103205",
    ],
    footer: "GitHub: github.com/gaurav620/EyeGuard-A-Final-Year-Project-26 | Guide: Prof. [Faculty Name], Dept. of CSE, JISCE",
  },
];
