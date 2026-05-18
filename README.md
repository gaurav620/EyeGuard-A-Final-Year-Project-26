<p align="center">
  <img src="https://img.shields.io/badge/EyeGuard-AI%20Eye%20Health%20Monitor-5B6CFF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yIDEyczMtNyAxMC03IDEwIDcgMTAgNyIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48L3N2Zz4=&logoColor=white" alt="EyeGuard" height="40"/>
</p>

<h1 align="center">EyeGuard — AI-Powered Real-Time Eye Strain Detection System</h1>

<p align="center">
  <strong>Final Year Project • B.Tech CSE • 2022–2026</strong><br/>
  JIS College of Engineering (JISCE), Kalyani, West Bengal
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/MediaPipe-FaceMesh-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/NeonDB-PostgreSQL-00E599?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Model_Accuracy-100%25-22C55E?style=flat-square" />
</p>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [ML Model — EyeNet CNN](#ml-model--eyenet-cnn)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Team Members](#team-members)
- [License](#license)

---

## About The Project

**EyeGuard** is an AI-powered, real-time eye strain detection and monitoring system designed to protect users from digital eye fatigue. It uses a combination of **MediaPipe FaceLandmarker** (468 facial landmarks) and a custom-trained **EyeNet CNN** model to track blink patterns, compute Eye Aspect Ratio (EAR), and generate fatigue scores — all running locally in the browser with **zero video transmission** to any server, ensuring complete user privacy.

The system provides:
- Real-time blink detection and fatigue scoring
- AI-powered health recommendations via a 5-provider LLM fallback chain
- Smart Analytics with daily, weekly, and monthly tracking
- Research-grade telemetry logging to PostgreSQL
- PWA support for installable, offline-capable operation

> **Privacy First:** No video frames ever leave the user's device. Only computed metrics (EAR, blink rate, fatigue scores) are processed server-side.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Real-Time Eye Tracking** | MediaPipe FaceLandmarker with 468 facial landmarks, eye contour + iris tracking |
| **Blink Detection** | Dual-method: EAR threshold + FaceBlendshapes fusion for high accuracy |
| **EyeNet CNN** | Custom 3-layer CNN achieving **100% validation accuracy** on MRL Eye Dataset |
| **Fatigue Scoring** | Multi-factor algorithm combining blink rate, EAR deviation, time decay |
| **AI Health Advisor** | LLM-powered chatbot with 5-provider fallback (Groq → Gemini → OpenAI → OpenRouter → HuggingFace) |
| **Smart Analytics** | Daily activity tracking, weekly/monthly trends, session history |
| **Eye Exercises** | Built-in guided exercises (20-20-20 Rule, Palming, Figure Eight, Near-Far Focus) |
| **PWA Support** | Installable progressive web app with offline caching via Service Worker |
| **Email Alerts** | SMTP-based fatigue notifications when strain reaches critical levels |
| **Research Community** | Leaderboard, participant codes, contribution points system |
| **Telemetry Pipeline** | In-memory buffer → batch flush → NeonDB PostgreSQL persistence |
| **Authentication** | Clerk-based auth with sign-in/sign-up flows |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                                                                 │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │   Camera      │  │  MediaPipe    │  │   EAR Calculation    │  │
│  │   Feed        │──│  FaceMesh     │──│   + Blink Detection  │  │
│  │              │  │  (468 pts)    │  │   + Fatigue Score    │  │
│  └──────────────┘  └───────────────┘  └──────────┬───────────┘  │
│                                                   │              │
│  ┌──────────────┐  ┌───────────────┐              │              │
│  │  Analytics   │  │  Eye Exercise │              │              │
│  │  Dashboard   │  │  Timer        │              │              │
│  └──────────────┘  └───────────────┘              │              │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │
                            ┌───────────────────────▼──────────────┐
                            │           NEXT.JS API LAYER          │
                            │                                      │
                            │  /api/telemetry/ingest  ← Metrics    │
                            │  /api/telemetry/flush   → Database   │
                            │  /api/chat              → LLM Chain  │
                            │  /api/community/join    → Users DB   │
                            │  /api/stats             → Analytics  │
                            │  /api/health            → Status     │
                            └───────────┬──────────────────────────┘
                                        │
                     ┌──────────────────┼──────────────────┐
                     │                  │                  │
              ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
              │   NeonDB    │  │  LLM Chain    │  │  FastAPI    │
              │  PostgreSQL │  │  (5 providers)│  │  ML Server  │
              │  (5 tables) │  │  Groq/Gemini/ │  │  EyeNet CNN │
              │             │  │  OpenAI/etc   │  │  PyTorch    │
              └─────────────┘  └───────────────┘  └─────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.2.2 | React framework with App Router |
| [React](https://react.dev/) | 19.2.4 | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [Framer Motion](https://www.framer.com/motion/) | 12.38 | Animation library |
| [Recharts](https://recharts.org/) | 3.8.1 | Data visualization charts |
| [Lucide React](https://lucide.dev/) | 1.7.0 | Icon system |
| [QRCode.react](https://www.npmjs.com/package/qrcode.react) | 4.2.0 | QR code generation |

### AI / ML
| Technology | Version | Purpose |
|------------|---------|---------|
| [MediaPipe Tasks-Vision](https://developers.google.com/mediapipe) | 0.10.35 | 468-point face landmark detection |
| [PyTorch](https://pytorch.org/) | 2.0+ | EyeNet CNN training & inference |
| [TorchVision](https://pytorch.org/vision/) | 0.15+ | Image transforms & data loading |
| [FastAPI](https://fastapi.tiangolo.com/) | 0.100+ | ML inference REST API |
| [scikit-learn](https://scikit-learn.org/) | 1.2+ | Model evaluation metrics |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| [NeonDB](https://neon.tech/) | — | Serverless PostgreSQL (cloud) |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.45.2 | Type-safe SQL ORM |
| [pg](https://node-postgres.com/) | 8.20 | PostgreSQL client for Node.js |
| [Clerk](https://clerk.com/) | 7.0.11 | Authentication & user management |

### LLM Providers (5-Provider Fallback Chain)
| Priority | Provider | Model | Purpose |
|----------|----------|-------|---------|
| 1 | [Groq](https://groq.com/) | LLaMA 3.3 70B Versatile | Primary — ultra-fast inference |
| 2 | [Google Gemini](https://ai.google.dev/) | Gemini 2.0 Flash | Fallback #1 |
| 3 | [OpenAI](https://openai.com/) | GPT-4o Mini | Fallback #2 |
| 4 | [OpenRouter](https://openrouter.ai/) | LLaMA 3.3 70B Instruct | Fallback #3 |
| 5 | [HuggingFace](https://huggingface.co/) | Mistral 7B Instruct v0.3 | Fallback #4 |

### DevOps & Tooling
| Technology | Purpose |
|------------|---------|
| [ESLint](https://eslint.org/) | Code linting |
| [Drizzle Kit](https://orm.drizzle.team/) | Database migration tooling |
| Service Worker | PWA offline caching |
| Gmail SMTP | Email fatigue alerts |

---

## ML Model — EyeNet CNN

### Architecture

```
Input (3 × 64 × 64 RGB)
    │
    ▼
┌───────────────────────────┐
│  Conv2d(3→32, 3×3, pad=1) │
│  BatchNorm2d(32)           │
│  ReLU + MaxPool2d(2×2)     │
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│  Conv2d(32→64, 3×3, pad=1)│
│  BatchNorm2d(64)           │
│  ReLU + MaxPool2d(2×2)     │
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│  Conv2d(64→128, 3×3, pad=1)│
│  BatchNorm2d(128)          │
│  ReLU + MaxPool2d(2×2)     │
└───────────┬───────────────┘
            ▼
┌───────────────────────────┐
│  AdaptiveAvgPool2d(4×4)    │
│  Flatten → 2048            │
│  Dropout(0.5)              │
│  Linear(2048→256) + ReLU   │
│  Dropout(0.3)              │
│  Linear(256→2)             │
└───────────────────────────┘
            ▼
      Output: [Open, Closed]
```

### Training Configuration

| Parameter | Value |
|-----------|-------|
| **Architecture** | 3-layer CNN with Batch Normalization |
| **Parameters** | ~200,000 |
| **Input Size** | 64 × 64 RGB |
| **Optimizer** | AdamW (lr=0.001, weight_decay=0.01) |
| **Scheduler** | CosineAnnealingLR (T_max=25) |
| **Epochs** | 25 |
| **Batch Size** | 32 |
| **Loss Function** | CrossEntropyLoss |
| **Train/Val Split** | 80% / 20% |
| **Data Augmentation** | RandomHorizontalFlip, RandomRotation(10°), ColorJitter, RandomAffine |
| **Validation Accuracy** | **100.0%** |
| **Inference Latency** | < 50ms |

### Dataset — MRL Eye Dataset

| Detail | Value |
|--------|-------|
| **Total Samples** | 3,000 images |
| **Open Eyes** | 1,500 images |
| **Closed Eyes** | 1,500 images |
| **Resolution** | 64 × 64 pixels (RGB) |
| **Source** | MRL Eye Dataset (Multimedia Research Lab) |

---

## Database Schema

The system uses **NeonDB (Serverless PostgreSQL)** with 5 tables managed via Drizzle ORM:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User profiles & research participation | clerkId, email, age, gender, eyeCondition, participantCode, contributionPoints |
| `sessions` | Eye tracking session records | userId, duration, avgFatigueScore, totalBlinks, avgEAR, alertsTriggered |
| `telemetry` | Per-frame metrics (EAR, blink rate, fatigue) | sessionId, ear, blinkRate, fatigueScore, gazeX/Y, isBlinking |
| `participant_events` | Research community activity log | userId, eventType, points, payload |
| `model_evaluations` | ML model performance tracking | modelType, accuracy, precision, recall, f1Score, confusionMatrix |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |
| `GET` | `/api/stats` | Global statistics (participants, sessions, telemetry) |
| `POST` | `/api/chat` | AI health advisor (5-provider LLM chain) |
| `POST` | `/api/telemetry/ingest` | Ingest real-time eye metrics + optional ML inference fusion |
| `POST` | `/api/telemetry/flush` | Batch write buffered telemetry to PostgreSQL |
| `POST` | `/api/community/join` | Register as research participant |
| `GET` | `/api/community/leaderboard` | Top contributors leaderboard |

---

## Project Structure

```
EyeGuard-26/
├── ml_model/                     # Machine Learning Pipeline
│   ├── dataset/
│   │   ├── closed/               # 1500 closed-eye images
│   │   └── open/                 # 1500 open-eye images
│   ├── train.py                  # EyeNet CNN training script
│   ├── server.py                 # FastAPI inference server
│   ├── eyeguard_model.pth        # Trained model weights
│   ├── training_history.json     # Epoch-wise metrics
│   └── requirements.txt          # Python dependencies
│
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout (Clerk, fonts)
│   │   ├── globals.css           # Global styles + design system
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Live monitoring dashboard
│   │   ├── analytics/
│   │   │   └── page.tsx          # Smart analytics + ML model info
│   │   ├── docs/
│   │   │   └── page.tsx          # Research paper / documentation
│   │   ├── community/
│   │   │   └── page.tsx          # Research community hub
│   │   ├── privacy/              # Privacy policy
│   │   ├── terms/                # Terms of service
│   │   ├── faqs/                 # FAQ page
│   │   ├── sign-in/              # Clerk sign-in
│   │   ├── sign-up/              # Clerk sign-up
│   │   └── api/
│   │       ├── health/route.ts
│   │       ├── stats/route.ts
│   │       ├── chat/route.ts
│   │       ├── telemetry/
│   │       │   ├── ingest/route.ts
│   │       │   └── flush/route.ts
│   │       └── community/
│   │           ├── join/route.ts
│   │           └── leaderboard/route.ts
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── live-eye-check.tsx   # Core eye tracking component
│   │   │   ├── ai-chatbot.tsx       # AI health advisor chatbot
│   │   │   └── settings-panel.tsx   # User settings panel
│   │   └── shared/
│   │       ├── navbar.tsx           # Navigation + PWA install
│   │       ├── footer.tsx           # Site footer
│   │       └── particle-bg.tsx      # Animated background
│   │
│   └── lib/
│       ├── db.ts                 # NeonDB connection (Drizzle)
│       ├── schema.ts             # Database schema (5 tables)
│       ├── redis.ts              # In-memory telemetry buffer
│       ├── fatigue.ts            # Fatigue scoring algorithm
│       ├── utils.ts              # Utility helpers
│       └── server/
│           ├── api.ts            # JSON response helpers
│           └── env.ts            # Environment configuration
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   ├── icon-192.png              # PWA icon (192×192)
│   └── icon-512.png              # PWA icon (512×512)
│
├── scripts/
│   └── setup-db.js               # Database setup script
│
├── drizzle.config.ts             # Drizzle ORM configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Node.js dependencies
└── .gitignore                    # Git ignore rules
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9 (for ML model)
- **PostgreSQL** (NeonDB account or local instance)

### 1. Clone the Repository

```bash
git clone https://github.com/gaurav620/EyeGuard-A-Final-Year-Project-26.git
cd EyeGuard-A-Final-Year-Project-26
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# NeonDB PostgreSQL
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# LLM API Keys (at least one required)
GROQ_API_KEY=gsk_xxxxx
GEMINI_API_KEY=AIzaxxxxx
OPENAI_API_KEY=sk-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
HUGGINGFACE_TOKEN=hf_xxxxx

# ML Inference (optional — for CNN server)
EYE_GUARD_INFERENCE_URL=http://localhost:8000/predict

# Email Alerts (optional)
SMTP_EMAIL=your-email@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Port
PORT=3083
```

### 4. Setup Database

```bash
npm run db:push
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3083](http://localhost:3083) in your browser.

### 6. (Optional) Run ML Inference Server

```bash
cd ml_model
pip install -r requirements.txt
python server.py
```

The FastAPI server starts at `http://localhost:8000`.

### 7. (Optional) Train the Model

```bash
cd ml_model
python train.py
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk public key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `DATABASE_URL` | ✅ | NeonDB PostgreSQL connection string |
| `GROQ_API_KEY` | ⭐ | Groq API key (primary LLM) |
| `GEMINI_API_KEY` | ⭐ | Google Gemini API key |
| `OPENAI_API_KEY` | ⭐ | OpenAI API key |
| `OPENROUTER_API_KEY` | ⭐ | OpenRouter API key |
| `HUGGINGFACE_TOKEN` | ⭐ | HuggingFace API token |
| `EYE_GUARD_INFERENCE_URL` | ❌ | ML inference server URL |
| `SMTP_EMAIL` | ❌ | Gmail for fatigue alerts |
| `SMTP_APP_PASSWORD` | ❌ | Gmail app password |

> ⭐ = At least one LLM key is required for the AI chatbot to function.

---

## Team Members

<table>
  <tr>
    <th>Name</th>
    <th>Roll Number</th>
    <th>Department</th>
    <th>LinkedIn</th>
  </tr>
  <tr>
    <td><strong>Ayan Biswas</strong></td>
    <td>123221103043</td>
    <td>CSE, JISCE (2022–2026), Group G21</td>
    <td><a href="https://linkedin.com">LinkedIn</a></td>
  </tr>
  <tr>
    <td><strong>Gaurav Kumar Mehta</strong></td>
    <td>123221103064</td>
    <td>CSE, JISCE (2022–2026), Group G21</td>
    <td><a href="https://linkedin.com/in/gauravkumarmehta">LinkedIn</a></td>
  </tr>
  <tr>
    <td><strong>Arpan Misra</strong></td>
    <td>123221103035</td>
    <td>CSE, JISCE (2022–2026), Group G21</td>
    <td><a href="https://linkedin.com">LinkedIn</a></td>
  </tr>
  <tr>
    <td><strong>Arka Bhattacharya</strong></td>
    <td>123231103205</td>
    <td>CSE, JISCE (2023–2026), Group G21</td>
    <td><a href="https://linkedin.com">LinkedIn</a></td>
  </tr>
</table>

**Institution:** JIS College of Engineering (JISCE), Kalyani, West Bengal, India

---

## EAR Algorithm

The **Eye Aspect Ratio (EAR)** is the core metric for blink detection:

```
        |p2 - p6| + |p3 - p5|
EAR = ─────────────────────────
            2 × |p1 - p4|
```

Where `p1...p6` are the six landmark points around each eye. When EAR drops below **0.22**, a blink is registered. The system uses dual-method detection combining EAR thresholds with MediaPipe FaceBlendshapes for maximum accuracy.

---

## Fatigue Scoring

The fatigue score (0–100) is computed using multiple factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Blink Rate Deviation | 30% | Distance from ideal 15–20 blinks/min |
| EAR Deviation | 20% | Deviation from baseline EAR (~0.27) |
| Time Decay | 50% (max 30pts) | Progressive fatigue over session duration |

**Fatigue Levels:**
- **0–20:** Low Fatigue (Normal)
- **21–50:** Moderate
- **51–75:** High Fatigue
- **76–100:** Critical (alert triggered)

---

## Screenshots

| Landing Page | Dashboard | Analytics |
|:---:|:---:|:---:|
| Home page with features | Live eye tracking | Smart analytics |

| Research Docs | Community | PWA Install |
|:---:|:---:|:---:|
| Full research paper | Leaderboard | Install app button |

---

## License

This project was developed as part of the **Final Year Project** for B.Tech in Computer Science and Engineering at JIS College of Engineering (JISCE), Kalyani, West Bengal, India.

© 2026 EyeGuard Team. All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ by the EyeGuard Team</strong><br/>
  <em>JIS College of Engineering • Department of Computer Science and Engineering • 2022–2026</em>
</p>
