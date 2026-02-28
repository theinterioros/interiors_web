import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ensureAdminSeed } from "@/lib/seedAdmin";
import { ensureDemoAccounts } from "@/lib/seedDemo";
import { getCurrentUser } from "@/lib/auth";
import AuthAwareLayout from "@/components/layout/AuthAwareLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Interior OS — Interior Design Platform for India",
    template: "%s | Interior OS",
  },
  description:
    "Plan budgets with AI cost estimates, choose verified interior designers, track projects by milestone, and pay securely with escrow. One platform for homeowners and design studios in India.",
  keywords: ["interior design", "India", "verified designers", "escrow payments", "project tracking", "AI cost estimate", "home renovation"],
  openGraph: {
    title: "Interior OS — Interior Design Platform for India",
    description: "Plan budgets, choose verified designers, track projects, and pay securely with escrow.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureAdminSeed();
  await ensureDemoAccounts();
  const user = await getCurrentUser();

  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased min-w-0 overflow-x-hidden`}
      >
        <AuthAwareLayout user={user}>{children}</AuthAwareLayout>
      </body>
    </html>
  );
}
