import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | EyeGuard",
  description: "Learn how EyeGuard works — real-time blink detection, EAR formula, tech stack, and features.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
