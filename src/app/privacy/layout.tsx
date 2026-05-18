import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | EyeGuard",
  description: "EyeGuard processes all video locally. Learn about our data handling and privacy practices.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
