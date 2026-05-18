import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const FAQS = [
  { q: "Is EyeGuard a medical device?", a: "No. EyeGuard is an educational wellness tool for eye strain awareness. Always consult an ophthalmologist for medical concerns." },
  { q: "Does EyeGuard record my camera?", a: "No. All video processing happens 100% locally in your browser. No frames are ever sent to any server." },
  { q: "What is the 20-20-20 rule?", a: "Every 20 minutes, look at something 20 feet away for 20 seconds. It's the #1 recommendation from the American Academy of Ophthalmology for reducing digital eye strain." },
  { q: "What is EAR (Eye Aspect Ratio)?", a: "EAR measures eye openness from 6 face landmarks. When it drops below 0.22, a blink is detected. Lower sustained EAR values indicate fatigue." },
  { q: "How accurate is blink detection?", a: "We use MediaPipe FaceLandmarker (468 landmarks) combined with neural blendshape scores for dual-method detection. Accuracy is typically 95%+ in good lighting." },
  { q: "What happens when fatigue is high?", a: "You'll hear an alert sound, your health score will drop, and if email alerts are configured, you'll receive a notification email." },
  { q: "Can I use it on mobile?", a: "Yes! EyeGuard is a Progressive Web App (PWA). Install it from your browser for a native-like experience." },
  { q: "Where is my data stored?", a: "Session history is stored in your browser's localStorage. You can clear it anytime from the Analytics page." },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="mt-2 text-gray-500">Common questions about EyeGuard and eye health.</p>
        <div className="mt-8 space-y-4">
          {FAQS.map((faq) => (
            <details key={faq.q} className="rounded-xl border border-gray-200 bg-white group">
              <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 flex items-center justify-between">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
