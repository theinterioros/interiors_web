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
  title: "Interior OS",
  description: "Premium interior design tracking platform for India.",
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
