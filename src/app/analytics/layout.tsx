import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Analytics | EyeGuard",
  description: "Track your eye health trends with session history, fatigue analysis, and personalized recommendations.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
