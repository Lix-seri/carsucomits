import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/styles/globals.css";
import { HydrationMarker } from "@/components/layout/hydration-marker";
import { NavigationTracker } from "@/components/layout/back-button";

// Self-hosted at build time by next/font: no request to Google from the browser.
const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "CarsuComits — CSU Main commission marketplace", template: "%s · CarsuComits" },
  description: "The commission marketplace for students of Caraga State University – Main Campus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <HydrationMarker />
        <NavigationTracker />
      </body>
    </html>
  );
}
