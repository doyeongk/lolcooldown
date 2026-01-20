import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewportHeight } from "@/components/ViewportHeight";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "lolcooldown - League of Legends Cooldown Guessing Game",
  description:
    "Test your League of Legends knowledge by guessing which ability has the lower cooldown.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ViewportHeight />
        <div className="fixed inset-0 overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
