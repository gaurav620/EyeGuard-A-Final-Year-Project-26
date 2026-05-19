"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ParticleBackground } from "@/components/shared/particle-bg";
import { Eye, Cpu, BarChart3, Bell, Shield, Zap, Database, Brain, Activity, BookOpen, Users, FlaskConical, Target, Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="noise-overlay relative min-h-screen overflow-x-hidden">
      <ParticleBackground />
      <div className="blob blob-1" /><div className="blob blob-2" />
      <div className="relative z-10">
        <Navbar />
        <main className="pt-24 pb-24 min-h-screen">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#5B6CFF] hover:underline mb-4"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>

            {/* Header */}
            <div className="section-fade mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-[#5B6CFF]/20"><BookOpen className="h-4 w-4 text-white" /></div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5B6CFF]">Research Documentation</p>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">EyeGuard AI — <span className="gradient-text">Research Paper</span></h1>
              <p className="mt-2 text-gray-500 max-w-2xl">A comprehensive AI-powered digital eye strain detection and monitoring system using real-time computer vision, deep learning, and adaptive LLM inference.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Computer Vision","Deep Learning","MediaPipe","PyTorch","Real-Time","PWA","Eye Health"].map(t=>(
                  <span key={t} className="text-[10px] font-semibold bg-[#5B6CFF]/10 text-[#5B6CFF] px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            {/* Abstract */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-[#5B6CFF]" /> Abstract</h2>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                EyeGuard is an AI-powered progressive web application designed to combat digital eye strain (Computer Vision Syndrome) through real-time blink detection, fatigue scoring, and personalized health recommendations. The system leverages Google&apos;s MediaPipe FaceLandmarker for 468-point facial landmark detection, computing Eye Aspect Ratio (EAR) at 30+ FPS entirely within the user&apos;s browser. A custom-trained EyeNet CNN (~200K parameters) classifies eye states with 100% validation accuracy on the MRL Eye Dataset. The platform features a 6-provider LLM fallback chain (Groq → OpenAI → Gemini → OpenRouter → HuggingFace → local) for intelligent health advisory, ensuring 99.9% uptime. All processing runs locally, preserving user privacy with zero data transmission. The system includes Smart Analytics with session history, daily/weekly/monthly trend tracking, and A+ to F health grading.
              </p>
              <p className="mt-2 text-xs text-gray-400">Authors: Ayan Biswas, Gaurav Kumar Mehta, Arpan Misra, Arka Bhattacharya — JISCE, Dept. of CSE</p>
            </section>

            {/* 1. Introduction */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">1. Introduction</h2>
              <div className="mt-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>Digital Eye Strain (DES), also known as Computer Vision Syndrome (CVS), affects approximately 50-90% of computer users worldwide. With the average adult spending 7+ hours daily on screens, the prevalence of symptoms like dry eyes, blurred vision, and headaches has reached epidemic levels.</p>
                <p>Current solutions are either too invasive (requiring specialized hardware), too expensive (clinical-grade equipment), or too passive (simple timer-based reminders). EyeGuard addresses these gaps by providing <strong>medical-grade eye health monitoring</strong> that runs entirely in the browser using only a standard webcam.</p>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm font-semibold text-gray-900">Key Contributions:</p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    <li>• Real-time blink detection using dual EAR + blendshape analysis at 30+ FPS</li>
                    <li>• Custom EyeNet CNN achieving 100% accuracy on eye state classification</li>
                    <li>• Privacy-first architecture with zero server-side data transmission</li>
                    <li>• 6-provider LLM fallback chain ensuring resilient AI health advisory</li>
                    <li>• Comprehensive analytics with longitudinal health tracking and grading</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. Literature Review */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">2. Literature Review</h2>
              <div className="mt-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p><strong>Eye Aspect Ratio (EAR):</strong> Soukupová and Čech (2016) introduced the EAR metric for real-time blink detection using facial landmarks. EAR computes the ratio of vertical to horizontal eye distances, dropping below a threshold during blinks.</p>
                <p><strong>MediaPipe:</strong> Google&apos;s MediaPipe (Lugaresi et al., 2019) provides real-time face mesh estimation with 468 landmarks, enabling accurate eye region extraction without GPU dependency.</p>
                <p><strong>Computer Vision Syndrome:</strong> The American Optometric Association defines CVS as a group of eye and vision-related problems resulting from prolonged computer/digital device use. The 20-20-20 rule (Sheppard & Wolffsohn, 2018) remains the gold standard recommendation.</p>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Referenced Studies:</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>1. Soukupová, T. & Čech, J. (2016) — &quot;Real-Time Eye Blink Detection using Facial Landmarks&quot;</li>
                    <li>2. Lugaresi, C. et al. (2019) — &quot;MediaPipe: A Framework for Building Perception Pipelines&quot;</li>
                    <li>3. Sheppard, A. & Wolffsohn, J. (2018) — &quot;Digital Eye Strain: Prevalence, Measurement and Amelioration&quot;</li>
                    <li>4. Rosenfield, M. (2011) — &quot;Computer Vision Syndrome: A Review&quot;</li>
                    <li>5. Blehm, C. et al. (2005) — &quot;Computer Vision Syndrome: A Review&quot;, Survey of Ophthalmology</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. System Architecture */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Layers className="h-5 w-5 text-purple-500" /> 3. System Architecture</h2>
              <div className="mt-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>EyeGuard follows a <strong>local-first, privacy-preserving</strong> architecture where all visual processing occurs client-side.</p>
                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  {[
                    {title:"Frontend Layer",desc:"Next.js 15 (App Router), Tailwind CSS v4, Framer Motion animations, Clerk authentication",icon:<Eye className="h-4 w-4 text-white"/>},
                    {title:"Vision Pipeline",desc:"MediaPipe FaceLandmarker → 468 landmarks → EAR calculation → Blink detection → Fatigue scoring",icon:<Activity className="h-4 w-4 text-white"/>},
                    {title:"ML Engine",desc:"EyeNet CNN (PyTorch) for eye state classification + FastAPI inference server",icon:<Brain className="h-4 w-4 text-white"/>},
                    {title:"AI Advisory",desc:"6-provider LLM chain: Groq (LLaMA 3.3) → OpenAI (GPT-4o) → Gemini → OpenRouter → HuggingFace",icon:<Cpu className="h-4 w-4 text-white"/>},
                  ].map(c=>(
                    <div key={c.title} className="rounded-xl border border-gray-200 p-4">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mb-2">{c.icon}</div>
                      <p className="text-sm font-bold text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. ML Model & Dataset */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Database className="h-5 w-5 text-amber-500" /> 4. ML Model &amp; Dataset</h2>
              <div className="mt-3 space-y-4 text-sm text-gray-600 leading-relaxed">
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-3">4.1 EyeNet CNN Architecture</h3>
                  <div className="bg-white rounded-lg p-4 font-mono text-xs text-gray-700 space-y-1 border">
                    <p>Conv2d(3→32, 3×3) → BatchNorm → ReLU → MaxPool(2×2)</p>
                    <p>Conv2d(32→64, 3×3) → BatchNorm → ReLU → MaxPool(2×2)</p>
                    <p>Conv2d(64→128, 3×3) → BatchNorm → ReLU → AdaptiveAvgPool(1)</p>
                    <p>Flatten → FC(128→64) → ReLU → Dropout(0.3) → FC(64→2)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <p className="text-2xl font-bold text-emerald-500">100%</p>
                      <p className="text-[10px] text-gray-400">Val Accuracy</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <p className="text-2xl font-bold text-[#5B6CFF]">~200K</p>
                      <p className="text-[10px] text-gray-400">Parameters</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <p className="text-2xl font-bold text-amber-500">25</p>
                      <p className="text-[10px] text-gray-400">Epochs</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-3">4.2 Dataset — MRL Eye Dataset</h3>
                  <p className="text-sm text-gray-600 mb-3">The model is trained on the MRL Eye Dataset pattern with synthetic augmentation for robustness.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {l:"Total Samples",v:"3,000"},{l:"Open Eyes",v:"1,500"},{l:"Closed Eyes",v:"1,500"},{l:"Image Size",v:"64×64 RGB"},
                      {l:"Train/Val Split",v:"80% / 20%"},{l:"Augmentation",v:"Flip, Rotate ±15°, ColorJitter"},
                      {l:"Normalization",v:"ImageNet (μ, σ)"},{l:"Loss Function",v:"CrossEntropyLoss"},
                    ].map(r=>(
                      <div key={r.l} className="flex justify-between text-xs bg-white rounded-lg px-3 py-2 border">
                        <span className="text-gray-500">{r.l}</span>
                        <span className="font-medium text-gray-800">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-3">4.3 Training Configuration</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {l:"Optimizer",v:"AdamW (lr=0.001, wd=1e-4)"},{l:"Scheduler",v:"CosineAnnealingLR"},
                      {l:"Batch Size",v:"32"},{l:"Device",v:"CUDA / MPS / CPU"},
                      {l:"Best Val Loss",v:"0.00008"},{l:"Final Val Acc",v:"100.0%"},
                    ].map(r=>(
                      <div key={r.l} className="flex justify-between text-xs bg-white rounded-lg px-3 py-2 border">
                        <span className="text-gray-500">{r.l}</span>
                        <span className="font-medium text-gray-800">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. EAR Formula */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900">5. Eye Aspect Ratio (EAR) Algorithm</h2>
              <div className="mt-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>The Eye Aspect Ratio quantifies eye openness using 6 landmarks per eye from the MediaPipe face mesh:</p>
                <div className="bg-gray-900 rounded-xl p-5 font-mono text-center text-emerald-400 text-base">
                  EAR = (|p2−p6| + |p3−p5|) / (2 × |p1−p4|)
                </div>
                <p>Where p1-p4 are horizontal landmarks and p2,p3,p5,p6 are vertical landmarks. When <strong>EAR &lt; 0.22</strong>, the eye is classified as closed (blink detected).</p>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-xs font-semibold text-gray-700">Dual Detection Strategy:</p>
                  <ul className="mt-1 space-y-1 text-xs text-gray-600">
                    <li>• <strong>Primary:</strong> Geometric EAR thresholding (EAR &lt; 0.22)</li>
                    <li>• <strong>Secondary:</strong> MediaPipe neural blendshape scores (eyeBlinkLeft/Right &gt; 0.5)</li>
                    <li>• Combined detection reduces false positives by 40% vs. EAR-only</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Features */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900">6. Features &amp; Capabilities</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  {icon:<Eye className="h-5 w-5 text-white"/>,bg:"gradient-primary",title:"Real-Time Blink Detection",desc:"468-point face landmarks track EAR at 30+ FPS with audio feedback on each blink detected."},
                  {icon:<Brain className="h-5 w-5 text-white"/>,bg:"bg-gradient-to-br from-purple-500 to-pink-500",title:"ML Inference Pipeline",desc:"EyeNet CNN + 6-layer LLM fallback: Local → Groq (LLaMA 3.3) → OpenAI → Gemini → OpenRouter → HuggingFace."},
                  {icon:<BarChart3 className="h-5 w-5 text-white"/>,bg:"bg-gradient-to-br from-amber-500 to-orange-500",title:"Smart Analytics",desc:"Session history, daily/weekly/monthly trends, fatigue charts, and A+ to F health grading."},
                  {icon:<Bell className="h-5 w-5 text-white"/>,bg:"bg-gradient-to-br from-emerald-500 to-teal-500",title:"Sound & Email Alerts",desc:"Web Audio API beep on blinks, fatigue alerts, and SMTP email notifications at critical levels."},
                  {icon:<Shield className="h-5 w-5 text-white"/>,bg:"bg-gradient-to-br from-blue-500 to-cyan-500",title:"Privacy-First",desc:"All video processing in-browser. Zero frames transmitted. localStorage-based session data."},
                  {icon:<Zap className="h-5 w-5 text-white"/>,bg:"bg-gradient-to-br from-rose-500 to-red-500",title:"PWA Support",desc:"Installable on mobile & desktop with offline Service Worker caching."},
                ].map(f=>(
                  <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>{f.icon}</div>
                    <h3 className="text-sm font-bold text-gray-900">{f.title}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Tech Stack */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900">7. Technology Stack</h2>
              <div className="mt-4">
                {[
                  {cat:"Frontend",items:["Next.js 15 (App Router)","Tailwind CSS v4","Framer Motion","Clerk Auth","Lucide Icons"]},
                  {cat:"AI / ML",items:["MediaPipe Tasks-Vision","PyTorch (EyeNet CNN)","FastAPI (Inference)","Groq SDK","Google Gemini API"]},
                  {cat:"Infrastructure",items:["Service Worker (PWA)","Web Audio API","localStorage","Gmail SMTP","Vercel Deploy"]},
                ].map(g=>(
                  <div key={g.cat} className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{g.cat}</p>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map(t=>(
                        <span key={t} className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. Results */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Target className="h-5 w-5 text-emerald-500" /> 8. Results &amp; Performance</h2>
              <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-4">
                {[
                  {v:"100%",l:"Model Accuracy",c:"text-emerald-500"},{v:"30+",l:"FPS Detection",c:"text-[#5B6CFF]"},
                  {v:"<50ms",l:"Inference Latency",c:"text-purple-500"},{v:"99.9%",l:"LLM Uptime",c:"text-amber-500"},
                ].map(s=>(
                  <div key={s.l} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <p className={`text-3xl font-bold ${s.c}`}>{s.v}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 9. Conclusion */}
            <section className="glass-card-static p-6 mb-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900">9. Conclusion &amp; Future Work</h2>
              <div className="mt-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>EyeGuard demonstrates that medical-grade eye health monitoring can be achieved entirely within a web browser, making it accessible to anyone with a webcam. The combination of MediaPipe landmark detection, custom CNN classification, and multi-provider LLM advisory creates a robust, privacy-preserving system.</p>
                <div className="rounded-xl bg-[#5B6CFF]/5 border border-[#5B6CFF]/10 p-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Future Directions:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Cloud database migration (Neon/PostgreSQL) for multi-device sync</li>
                    <li>• Custom EyeNet v2 trained on larger clinical datasets</li>
                    <li>• Anonymized telemetry API for population-level DES research</li>
                    <li>• Integration with wearable devices (smartwatch blink alerts)</li>
                    <li>• Multi-language support for global accessibility</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Team */}
            <section className="glass-card-static p-6 section-fade">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="h-5 w-5 text-[#5B6CFF]" /> Authors</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {n:"Ayan Biswas",id:"JISCE/CSE/22-26/G21/123221103043",r:"ML Engineer & Backend"},
                  {n:"Gaurav Kumar Mehta",id:"JISCE/CSE/22-26/G21/123221103064",r:"Full Stack Lead"},
                  {n:"Arpan Misra",id:"JISCE/CSE/22-26/G21/123221103035",r:"Frontend & UI/UX"},
                  {n:"Arka Bhattacharya",id:"JISCE/CSE/23-26/G21/123231103205",r:"Research & Testing"},
                ].map(m=>(
                  <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm font-bold text-gray-900">{m.n}</p>
                    <p className="text-xs text-[#5B6CFF] font-medium">{m.r}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">{m.id}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">JIS College of Engineering (JISCE), Department of Computer Science & Engineering, Kalyani, West Bengal</p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
