import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | EyeGuard",
  description: "Terms of service for EyeGuard eye health monitoring platform.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
