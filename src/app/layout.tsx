import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
      <body className={`${geistSans.variable} antialiased`}>
        <div className="fixed inset-0 overflow-hidden">
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </div>
      </body>
    </html>
  );
}
