import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/styles/globals.css";

// Self-hosted at build time by next/font: no request to Google from the browser.
const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "CarsuComits — CSU Commission Marketplace", template: "%s · CarsuComits" },
  description: "Caraga State University's trusted marketplace for student commissions and services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
