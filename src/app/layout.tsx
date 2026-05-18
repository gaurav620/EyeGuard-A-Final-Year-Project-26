import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EyeGuard – AI Eye Health Monitor | Real-Time Blink Detection",
  description: "Medical-grade AI eye health monitoring with real-time blink tracking, fatigue analysis, MediaPipe face landmarks, and personalized eye care recommendations.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "EyeGuard" },
  keywords: ["eye health", "blink detection", "eye strain", "fatigue", "AI", "MediaPipe", "eye care"],
};

export const viewport: Viewport = {
  themeColor: "#5B6CFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} h-full antialiased`}>
        <head>
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
        </head>
        <body className="min-h-full flex flex-col bg-[#f9fafb] text-[#1f2937]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
