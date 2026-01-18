import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <div className="min-h-screen border-4 border-white shadow-[inset_0_0_20px_rgba(255,255,255,0.5),inset_0_0_40px_rgba(255,255,255,0.3)]">
          {children}
        </div>
      </body>
    </html>
  );
}
