import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ensureAdminSeed } from "@/lib/seedAdmin";
import { ensureDemoAccounts } from "@/lib/seedDemo";
import { getCurrentUser } from "@/lib/auth";
import SiteHeader from "@/components/layout/SiteHeader";

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
        <SiteHeader user={user} />
        <main id="main-content" className="min-w-0 pt-[var(--header-height)]">
          {children}
        </main>
      </body>
    </html>
  );
}
