import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs | EyeGuard",
  description: "Frequently asked questions about EyeGuard eye health monitoring, privacy, and accuracy.",
};

export default function FAQsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
