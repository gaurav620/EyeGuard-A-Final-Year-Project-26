#!/usr/bin/env python3
"""
EyeGuard Inference Server
=========================
FastAPI server with ML model inference + LLM fallback chain + email alerts.

Fallback Chain:
  1. Local EyeNet CNN model (fastest, ~5ms)
  2. Groq API (LLaMA Vision)
  3. OpenAI API (GPT-4o-mini)
  4. Google Gemini API
  5. OpenRouter API
  6. HuggingFace Inference API

If ML model confidence < threshold, automatically falls through the chain.

Usage:
  python ml_model/server.py
  # Server runs on http://localhost:8000
"""

import os
import sys
import json
import base64
import smtplib
import traceback
from io import BytesIO
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional

import numpy as np
from PIL import Image

import torch
import torch.nn as nn
from torchvision import transforms

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import httpx

# ─── Load env from .env.local ─────────────────────────────────
env_path = Path(__file__).parent.parent / ".env.local"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

# ─── Config ────────────────────────────────────────────────────
MODEL_PATH = Path(__file__).parent / "eyeguard_model.pth"
IMG_SIZE = 64
CONFIDENCE_THRESHOLD = 0.75  # Below this, use LLM fallback
DEVICE = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
HUGGINGFACE_TOKEN = os.environ.get("HUGGINGFACE_TOKEN", "")
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "")
SMTP_APP_PASSWORD = os.environ.get("SMTP_APP_PASSWORD", "")


# ─── EyeNet Model (same as train.py) ──────────────────────────

class EyeNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128, 64), nn.ReLU(inplace=True), nn.Dropout(0.3),
            nn.Linear(64, 2),
        )

    def forward(self, x):
        return self.classifier(self.features(x))


# ─── Load Model ───────────────────────────────────────────────

model = None
model_accuracy = 0.0

def load_model():
    global model, model_accuracy
    if not MODEL_PATH.exists():
        print("⚠️  No trained model found. LLM fallback will be used.")
        return
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
        model = EyeNet()
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        model.to(DEVICE)
        model_accuracy = checkpoint.get("accuracy", 0.0)
        print(f"✅ Model loaded: accuracy={model_accuracy:.1f}%, device={DEVICE}")
    except Exception as e:
        print(f"⚠️  Model load failed: {e}")
        model = None

load_model()

# Image transform
img_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


# ─── Email Notification ───────────────────────────────────────

last_email_sent = datetime.min

def send_fatigue_alert(score: int, level: str, email_to: str = ""):
    """Send email notification when fatigue is critical."""
    global last_email_sent

    if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
        return

    # Rate limit: max 1 email per 10 minutes
    if datetime.now() - last_email_sent < timedelta(minutes=10):
        return

    target = email_to or SMTP_EMAIL

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚨 EyeGuard Alert: Fatigue Level {level.upper()} ({score}/100)"
        msg["From"] = SMTP_EMAIL
        msg["To"] = target

        html = f"""
        <html>
        <body style="font-family: 'Inter', Arial, sans-serif; background: #F7F8FC; padding: 30px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #5B6CFF, #8B5CF6); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px;">👁️</span>
              </div>
              <h1 style="color: #111827; font-size: 22px; margin: 0;">EyeGuard Fatigue Alert</h1>
            </div>

            <div style="background: linear-gradient(135deg, #FEE2E2, #FEF3C7); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <p style="font-size: 48px; font-weight: 800; color: #DC2626; margin: 0;">{score}/100</p>
              <p style="color: #92400E; font-weight: 600; margin: 4px 0 0;">Fatigue Level: {level.upper()}</p>
            </div>

            <h3 style="color: #111827; margin-bottom: 12px;">⚡ Recommended Actions:</h3>
            <ul style="color: #6B7280; line-height: 1.8; padding-left: 20px;">
              <li>Take an immediate 5-10 minute break</li>
              <li>Look at an object 20 feet away for 20 seconds</li>
              <li>Blink rapidly for 15 seconds</li>
              <li>Hydrate and stretch your neck/shoulders</li>
              <li>Reduce screen brightness</li>
            </ul>

            <div style="text-align: center; margin-top: 24px;">
              <a href="http://localhost:3083/dashboard" style="display: inline-block; background: linear-gradient(135deg, #5B6CFF, #8B5CF6); color: white; padding: 12px 28px; border-radius: 14px; text-decoration: none; font-weight: 600;">Open Dashboard</a>
            </div>

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 24px;">
              Sent by EyeGuard AI · {datetime.now().strftime('%Y-%m-%d %H:%M')}
            </p>
          </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.sendmail(SMTP_EMAIL, target, msg.as_string())

        last_email_sent = datetime.now()
        print(f"📧 Fatigue alert email sent to {target} (score={score})")
    except Exception as e:
        print(f"⚠️  Email failed: {e}")


# ─── LLM Fallback Chain ───────────────────────────────────────

async def llm_fallback_groq(image_b64: str) -> Optional[dict]:
    """Fallback 1: Groq API (LLaMA Vision)."""
    if not GROQ_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.2-90b-vision-preview",
                    "messages": [{"role": "user", "content": [
                        {"type": "text", "text": "Analyze this eye image. Is the eye OPEN or CLOSED? Reply with JSON only: {\"label\": \"Open\" or \"Closed\", \"confidence\": 0.0-1.0}"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
                    ]}],
                    "max_tokens": 100, "temperature": 0.1,
                },
            )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                data = json.loads(content.strip().strip("```json").strip("```"))
                label = "Open" if "open" in data.get("label", "").lower() else "Closed"
                conf = float(data.get("confidence", 0.7))
                print(f"   ✅ Groq: {label} ({conf:.0%})")
                return {"label": label, "closedProbability": 1 - conf if label == "Open" else conf,
                        "openProbability": conf if label == "Open" else 1 - conf, "source": "groq"}
    except Exception as e:
        print(f"   ❌ Groq failed: {e}")
    return None


async def llm_fallback_openai(image_b64: str) -> Optional[dict]:
    """Fallback 2: OpenAI API (GPT-4o-mini)."""
    if not OPENAI_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": [
                        {"type": "text", "text": "Is this eye OPEN or CLOSED? Reply JSON only: {\"label\": \"Open\"/\"Closed\", \"confidence\": 0.0-1.0}"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
                    ]}],
                    "max_tokens": 80, "temperature": 0,
                },
            )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                data = json.loads(content.strip().strip("```json").strip("```"))
                label = "Open" if "open" in data.get("label", "").lower() else "Closed"
                conf = float(data.get("confidence", 0.75))
                print(f"   ✅ OpenAI: {label} ({conf:.0%})")
                return {"label": label, "closedProbability": 1 - conf if label == "Open" else conf,
                        "openProbability": conf if label == "Open" else 1 - conf, "source": "openai"}
    except Exception as e:
        print(f"   ❌ OpenAI failed: {e}")
    return None


async def llm_fallback_gemini(image_b64: str) -> Optional[dict]:
    """Fallback 3: Google Gemini API."""
    if not GEMINI_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [
                        {"text": "Analyze: is this eye OPEN or CLOSED? Reply JSON only: {\"label\": \"Open\"/\"Closed\", \"confidence\": 0.0-1.0}"},
                        {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
                    ]}],
                    "generationConfig": {"temperature": 0.1, "maxOutputTokens": 80},
                },
            )
            if resp.status_code == 200:
                content = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                data = json.loads(content.strip().strip("```json").strip("```"))
                label = "Open" if "open" in data.get("label", "").lower() else "Closed"
                conf = float(data.get("confidence", 0.7))
                print(f"   ✅ Gemini: {label} ({conf:.0%})")
                return {"label": label, "closedProbability": 1 - conf if label == "Open" else conf,
                        "openProbability": conf if label == "Open" else 1 - conf, "source": "gemini"}
    except Exception as e:
        print(f"   ❌ Gemini failed: {e}")
    return None


async def llm_fallback_openrouter(image_b64: str) -> Optional[dict]:
    """Fallback 4: OpenRouter API."""
    if not OPENROUTER_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [{"role": "user", "content": [
                        {"type": "text", "text": "Is this eye OPEN or CLOSED? Reply JSON: {\"label\": \"Open\"/\"Closed\", \"confidence\": 0.0-1.0}"},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
                    ]}],
                    "max_tokens": 80,
                },
            )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                data = json.loads(content.strip().strip("```json").strip("```"))
                label = "Open" if "open" in data.get("label", "").lower() else "Closed"
                conf = float(data.get("confidence", 0.7))
                print(f"   ✅ OpenRouter: {label} ({conf:.0%})")
                return {"label": label, "closedProbability": 1 - conf if label == "Open" else conf,
                        "openProbability": conf if label == "Open" else 1 - conf, "source": "openrouter"}
    except Exception as e:
        print(f"   ❌ OpenRouter failed: {e}")
    return None


async def llm_fallback_huggingface(image_b64: str) -> Optional[dict]:
    """Fallback 5: HuggingFace Inference API."""
    if not HUGGINGFACE_TOKEN:
        return None
    try:
        image_bytes = base64.b64decode(image_b64)
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api-inference.huggingface.co/models/dima806/closed_eyes_image_detection",
                headers={"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"},
                content=image_bytes,
            )
            if resp.status_code == 200:
                results = resp.json()
                if isinstance(results, list) and len(results) > 0:
                    top = max(results, key=lambda x: x.get("score", 0))
                    is_closed = "close" in top.get("label", "").lower()
                    conf = top.get("score", 0.7)
                    label = "Closed" if is_closed else "Open"
                    print(f"   ✅ HuggingFace: {label} ({conf:.0%})")
                    return {"label": label, "closedProbability": conf if is_closed else 1 - conf,
                            "openProbability": 1 - conf if is_closed else conf, "source": "huggingface"}
    except Exception as e:
        print(f"   ❌ HuggingFace failed: {e}")
    return None


async def run_fallback_chain(image_b64: str) -> Optional[dict]:
    """Execute the full LLM fallback chain in order."""
    print("🔄 Running LLM fallback chain...")
    for name, fn in [
        ("Groq", llm_fallback_groq),
        ("OpenAI", llm_fallback_openai),
        ("Gemini", llm_fallback_gemini),
        ("OpenRouter", llm_fallback_openrouter),
        ("HuggingFace", llm_fallback_huggingface),
    ]:
        result = await fn(image_b64)
        if result:
            return result
    print("   ⚠️  All fallbacks failed. Using default.")
    return None


# ─── FastAPI App ───────────────────────────────────────────────

app = FastAPI(title="EyeGuard Inference Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3083", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    imageBase64: str
    sessionId: Optional[str] = None
    fatigueScore: Optional[int] = None


class PredictResponse(BaseModel):
    ok: bool
    data: Optional[dict] = None
    error: Optional[str] = None


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_accuracy": model_accuracy,
        "device": DEVICE,
        "fallback_providers": [
            p for p, k in [
                ("groq", GROQ_API_KEY), ("openai", OPENAI_API_KEY),
                ("gemini", GEMINI_API_KEY), ("openrouter", OPENROUTER_API_KEY),
                ("huggingface", HUGGINGFACE_TOKEN),
            ] if k
        ],
        "email_configured": bool(SMTP_EMAIL and SMTP_APP_PASSWORD),
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    """Main prediction endpoint with ML + LLM fallback."""
    try:
        # Clean base64
        image_b64 = req.imageBase64
        if "," in image_b64:
            image_b64 = image_b64.split(",", 1)[1]

        result = None
        source = "none"

        # ── Step 1: Try local ML model ──
        if model is not None:
            try:
                image_bytes = base64.b64decode(image_b64)
                img = Image.open(BytesIO(image_bytes)).convert("RGB")
                input_tensor = img_transform(img).unsqueeze(0).to(DEVICE)

                with torch.no_grad():
                    output = model(input_tensor)
                    probs = torch.softmax(output, dim=1)[0]
                    confidence = probs.max().item()
                    pred_idx = probs.argmax().item()

                if confidence >= CONFIDENCE_THRESHOLD:
                    label = "Open" if pred_idx == 1 else "Closed"
                    result = {
                        "label": label,
                        "closedProbability": probs[0].item(),
                        "openProbability": probs[1].item(),
                        "source": "eyenet_local",
                        "confidence": confidence,
                    }
                    source = "eyenet"
                    print(f"🧠 EyeNet: {label} ({confidence:.0%})")
                else:
                    print(f"⚠️  EyeNet confidence too low ({confidence:.0%}), trying fallback...")
            except Exception as e:
                print(f"⚠️  EyeNet inference error: {e}")

        # ── Step 2: LLM Fallback Chain ──
        if result is None:
            result = await run_fallback_chain(image_b64)

        # ── Step 3: Default fallback ──
        if result is None:
            result = {
                "label": "Open",
                "closedProbability": 0.3,
                "openProbability": 0.7,
                "source": "default_fallback",
            }

        # ── Step 4: Email alert for high fatigue ──
        if req.fatigueScore and req.fatigueScore >= 70:
            level = "critical" if req.fatigueScore >= 85 else "high"
            send_fatigue_alert(req.fatigueScore, level)

        return PredictResponse(ok=True, data=result)

    except Exception as e:
        traceback.print_exc()
        return PredictResponse(ok=False, error=str(e))


@app.post("/notify")
async def notify(data: dict):
    """Manual email notification endpoint."""
    score = data.get("fatigueScore", 0)
    level = data.get("level", "high")
    email = data.get("email", "")
    send_fatigue_alert(score, level, email)
    return {"ok": True, "message": "Notification sent"}


# ─── Run ───────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n🚀 EyeGuard Inference Server")
    print(f"   Model: {'✅ Loaded' if model else '❌ Not found (fallback mode)'}")
    print(f"   Accuracy: {model_accuracy:.1f}%")
    print(f"   Confidence threshold: {CONFIDENCE_THRESHOLD:.0%}")
    print(f"   Fallback chain: Groq → OpenAI → Gemini → OpenRouter → HuggingFace")
    print(f"   Email alerts: {'✅ Configured' if SMTP_EMAIL else '❌ Not configured'}")
    print(f"   Server: http://localhost:8000\n")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
