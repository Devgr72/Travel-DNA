// [Accessibility] Semantic landmark, skip-to-content, lang attribute.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel DNA | AI-Powered Adaptive Travel Personality Engine",
  description:
    "Discover HOW you travel. Take the Travel DNA quiz and generate hyper-personalized, dynamically adapting travel itineraries powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col">
        {/* [Accessibility] Skip-to-content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <main id="main-content" className="flex flex-col flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
