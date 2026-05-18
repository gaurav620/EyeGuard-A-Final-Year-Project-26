#!/usr/bin/env python3
"""
EyeGuard ML Model Training Script
==================================
Trains a lightweight CNN for eye open/closed classification.
Uses the MRL Eye Dataset pattern. Can run in Colab or locally.

Dataset: Eye images (Open vs Closed)
Model: Lightweight EyeNet CNN (~200KB)
Output: ml_model/eyeguard_model.pth

Usage:
  python ml_model/train.py
  # or in Colab: !python train.py
"""

import os
import sys
import json
import random
import shutil
from pathlib import Path
from datetime import datetime

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms

# ─── Config ────────────────────────────────────────────────────
MODEL_DIR = Path(__file__).parent
MODEL_PATH = MODEL_DIR / "eyeguard_model.pth"
DATA_DIR = MODEL_DIR / "dataset"
IMG_SIZE = 64
BATCH_SIZE = 32
EPOCHS = 25
LR = 0.001
DEVICE = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

print(f"🧠 EyeGuard ML Training")
print(f"   Device: {DEVICE}")
print(f"   Model output: {MODEL_PATH}")


# ─── 1. Synthetic Dataset Generator ───────────────────────────
# Generates realistic-looking eye patches for training when
# Kaggle dataset is not available. Uses image processing to
# simulate open/closed eye textures.

def generate_synthetic_dataset(n_samples=2000):
    """Generate synthetic eye dataset for training."""
    print(f"\n📦 Generating {n_samples} synthetic eye samples...")

    open_dir = DATA_DIR / "open"
    closed_dir = DATA_DIR / "closed"
    open_dir.mkdir(parents=True, exist_ok=True)
    closed_dir.mkdir(parents=True, exist_ok=True)

    for i in range(n_samples):
        is_open = i < n_samples // 2

        # Create base image with skin tone
        skin_r = random.randint(180, 230)
        skin_g = random.randint(140, 190)
        skin_b = random.randint(110, 160)
        img = Image.new("RGB", (IMG_SIZE, IMG_SIZE), (skin_r, skin_g, skin_b))
        draw = ImageDraw.Draw(img)

        cx, cy = IMG_SIZE // 2, IMG_SIZE // 2
        noise_x = random.randint(-3, 3)
        noise_y = random.randint(-3, 3)

        if is_open:
            # Open eye: almond shape with iris + pupil
            ew = random.randint(20, 28)
            eh = random.randint(10, 16)
            # Eye white
            draw.ellipse([cx - ew + noise_x, cy - eh + noise_y,
                          cx + ew + noise_x, cy + eh + noise_y],
                         fill=(240, 240, 245), outline=(80, 60, 50))
            # Iris
            iris_r = random.randint(6, 10)
            iris_color = random.choice([(60, 40, 20), (80, 120, 60), (40, 80, 120), (30, 30, 30)])
            draw.ellipse([cx - iris_r + noise_x, cy - iris_r + noise_y,
                          cx + iris_r + noise_x, cy + iris_r + noise_y],
                         fill=iris_color)
            # Pupil
            pr = random.randint(2, 4)
            draw.ellipse([cx - pr + noise_x, cy - pr + noise_y,
                          cx + pr + noise_x, cy + pr + noise_y],
                         fill=(5, 5, 5))
            # Highlight
            draw.ellipse([cx - pr + 1 + noise_x, cy - pr + noise_y,
                          cx - pr + 3 + noise_x, cy - pr + 2 + noise_y],
                         fill=(255, 255, 255))
            save_dir = open_dir
        else:
            # Closed eye: thin line/slit
            ew = random.randint(18, 26)
            lw = random.randint(1, 3)
            draw.line([(cx - ew + noise_x, cy + noise_y),
                       (cx + ew + noise_x, cy + noise_y)],
                      fill=(80, 60, 50), width=lw)
            # Eyelid curve
            for dx in range(-ew, ew):
                curve_y = int(-abs(dx) * 0.15)
                if abs(dx) < ew:
                    draw.point((cx + dx + noise_x, cy + curve_y + noise_y - 1), fill=(90, 70, 60))
            # Eyelash hints
            for _ in range(random.randint(3, 6)):
                lx = random.randint(cx - ew + 3, cx + ew - 3) + noise_x
                draw.line([(lx, cy + noise_y - 1), (lx, cy + noise_y - random.randint(2, 5))],
                          fill=(40, 30, 20), width=1)
            save_dir = closed_dir

        # Add noise + blur for realism
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.3, 1.2)))
        pixels = np.array(img)
        noise = np.random.normal(0, random.randint(3, 12), pixels.shape).astype(np.int16)
        pixels = np.clip(pixels.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(pixels)

        # Random brightness adjustment
        brightness = random.uniform(0.7, 1.3)
        pixels = np.clip(np.array(img).astype(np.float32) * brightness, 0, 255).astype(np.uint8)
        img = Image.fromarray(pixels)

        img.save(save_dir / f"eye_{i:05d}.jpg", quality=85)

    print(f"   ✅ Generated {n_samples // 2} open + {n_samples // 2} closed samples")
    return True


# ─── 2. Dataset Class ─────────────────────────────────────────

class EyeDataset(Dataset):
    """Eye Open/Closed dataset."""

    def __init__(self, root_dir, transform=None):
        self.transform = transform
        self.samples = []
        self.labels = []

        open_dir = Path(root_dir) / "open"
        closed_dir = Path(root_dir) / "closed"

        if open_dir.exists():
            for f in sorted(open_dir.glob("*.jpg")) + sorted(open_dir.glob("*.png")):
                self.samples.append(str(f))
                self.labels.append(1)  # 1 = Open

        if closed_dir.exists():
            for f in sorted(closed_dir.glob("*.jpg")) + sorted(closed_dir.glob("*.png")):
                self.samples.append(str(f))
                self.labels.append(0)  # 0 = Closed

        # Shuffle
        combined = list(zip(self.samples, self.labels))
        random.shuffle(combined)
        self.samples, self.labels = zip(*combined) if combined else ([], [])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img = Image.open(self.samples[idx]).convert("RGB")
        label = self.labels[idx]
        if self.transform:
            img = self.transform(img)
        return img, label


# ─── 3. EyeNet CNN Model ──────────────────────────────────────

class EyeNet(nn.Module):
    """Lightweight CNN for eye state classification.

    Architecture:
      Conv2d(3→32) → BN → ReLU → MaxPool
      Conv2d(32→64) → BN → ReLU → MaxPool
      Conv2d(64→128) → BN → ReLU → AdaptiveAvgPool
      FC(128→64) → Dropout → FC(64→2)

    Parameters: ~200K (very lightweight for edge deployment)
    """

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


# ─── 4. Training ──────────────────────────────────────────────

def train():
    # Generate dataset if not present
    if not (DATA_DIR / "open").exists() or len(list((DATA_DIR / "open").glob("*"))) < 100:
        generate_synthetic_dataset(3000)

    # Transforms
    train_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    val_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    # Dataset
    full_dataset = EyeDataset(DATA_DIR, transform=train_transform)
    n_total = len(full_dataset)
    n_val = int(n_total * 0.2)
    n_train = n_total - n_val
    train_ds, val_ds = random_split(full_dataset, [n_train, n_val])
    val_ds.dataset.transform = val_transform

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    print(f"\n📊 Dataset: {n_train} train / {n_val} val")

    # Model
    model = EyeNet().to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    total_params = sum(p.numel() for p in model.parameters())
    print(f"🧠 Model parameters: {total_params:,}")

    best_acc = 0.0
    history = {"train_loss": [], "val_loss": [], "val_acc": []}

    print(f"\n🏋️ Training for {EPOCHS} epochs...\n")
    print(f"{'Epoch':>6} | {'Train Loss':>10} | {'Val Loss':>10} | {'Val Acc':>8} | {'LR':>10}")
    print("-" * 60)

    for epoch in range(1, EPOCHS + 1):
        # Train
        model.train()
        train_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * images.size(0)
        train_loss /= n_train

        # Validate
        model.eval()
        val_loss = 0.0
        correct = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs, 1)
                correct += (predicted == labels).sum().item()
        val_loss /= n_val
        val_acc = correct / n_val * 100

        scheduler.step()
        lr = scheduler.get_last_lr()[0]

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        marker = " ⭐" if val_acc > best_acc else ""
        print(f"{epoch:>6} | {train_loss:>10.4f} | {val_loss:>10.4f} | {val_acc:>7.2f}% | {lr:>10.6f}{marker}")

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "accuracy": best_acc,
                "epoch": epoch,
                "img_size": IMG_SIZE,
                "classes": ["Closed", "Open"],
                "timestamp": datetime.now().isoformat(),
            }, MODEL_PATH)

    print(f"\n✅ Training complete!")
    print(f"   Best accuracy: {best_acc:.2f}%")
    print(f"   Model saved: {MODEL_PATH}")
    print(f"   Model size: {MODEL_PATH.stat().st_size / 1024:.1f} KB")

    # Save training history
    with open(MODEL_DIR / "training_history.json", "w") as f:
        json.dump({"best_accuracy": best_acc, "epochs": EPOCHS, "history": history}, f, indent=2)

    return best_acc


# ─── 5. Quick Test ─────────────────────────────────────────────

def test_model():
    """Quick inference test."""
    if not MODEL_PATH.exists():
        print("❌ No model found. Run training first.")
        return

    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
    model = EyeNet()
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    model.to(DEVICE)

    print(f"\n🔬 Model Test")
    print(f"   Accuracy: {checkpoint['accuracy']:.2f}%")
    print(f"   Trained: {checkpoint.get('timestamp', 'unknown')}")

    # Test with a random synthetic image
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    # Generate a test image
    test_img = Image.new("RGB", (IMG_SIZE, IMG_SIZE), (200, 170, 140))
    input_tensor = transform(test_img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1)[0]
        pred = torch.argmax(probs).item()

    classes = checkpoint.get("classes", ["Closed", "Open"])
    print(f"   Test prediction: {classes[pred]} ({probs[pred]:.2%})")
    print(f"   Closed: {probs[0]:.2%}, Open: {probs[1]:.2%}")


# ─── Main ──────────────────────────────────────────────────────

if __name__ == "__main__":
    accuracy = train()
    test_model()

    if accuracy < 85.0:
        print(f"\n⚠️  Model accuracy ({accuracy:.1f}%) is below 85% threshold.")
        print(f"   LLM fallback chain will be activated for production inference.")
        print(f"   Chain: ML Model → Groq → OpenAI → Gemini → OpenRouter → HuggingFace")
    else:
        print(f"\n🎯 Model accuracy ({accuracy:.1f}%) meets production threshold!")
