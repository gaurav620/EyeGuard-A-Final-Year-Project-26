import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      <main className="pt-24 pb-16 mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: May 2026</p>
        <div className="mt-8 prose prose-sm text-gray-600 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">1. Data Collection</h2>
          <p>EyeGuard processes webcam video <strong>locally in your browser</strong>. No video or images are sent to our servers. All eye tracking data stays on your device.</p>
          <h2 className="text-lg font-bold text-gray-900">2. Session Data</h2>
          <p>Session metrics (blink rate, fatigue score, duration) are stored in your browser's localStorage. You can clear this data anytime from the Analytics page.</p>
          <h2 className="text-lg font-bold text-gray-900">3. AI Chatbot</h2>
          <p>Chat messages are sent to AI providers (Groq, Google, OpenAI) for processing. We do not store conversation history on our servers.</p>
          <h2 className="text-lg font-bold text-gray-900">4. Email Notifications</h2>
          <p>If enabled, fatigue alerts are sent via Gmail SMTP. Your email address is used solely for notifications and is never shared.</p>
          <h2 className="text-lg font-bold text-gray-900">5. No Tracking</h2>
          <p>We do not use cookies, analytics trackers, or third-party advertising. Your privacy is our priority.</p>
          <h2 className="text-lg font-bold text-gray-900">6. Contact</h2>
          <p>Questions? Email <a href="mailto:gauravkumarmehta100@gmail.com" className="text-[#5B6CFF]">gauravkumarmehta100@gmail.com</a></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
