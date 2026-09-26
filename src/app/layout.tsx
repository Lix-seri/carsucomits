import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Kalam } from "next/font/google";
import "@/styles/globals.css";
import { HydrationMarker } from "@/components/layout/hydration-marker";
import { NavigationTracker } from "@/components/layout/back-button";
import { Toaster } from "@/components/ui/toast";

// Self-hosted at build time by next/font: no request to Google from the browser.
const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700", "800"] });
// Chalk notes only (three words or fewer), never body copy.
const chalk = Kalam({ subsets: ["latin"], variable: "--font-chalk", display: "swap", weight: ["700"] });

export const metadata: Metadata = {
  title: { default: "CarSUComits — the CSU Main commission board", template: "%s · CarSUComits" },
  description: "A student-built commission marketplace for Caraga State University – Main Campus. Post a task, hire a classmate, get it done.",
  applicationName: "CarSUComits",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: { title: "CarSUComits", description: "Get it done by a fellow CSU Main student.", images: ["/brand/icon-512.png"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF6EA" },
    { media: "(prefers-color-scheme: dark)", color: "#131C18" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${chalk.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <HydrationMarker />
        <NavigationTracker />
        <Toaster />
      </body>
    </html>
  );
}
