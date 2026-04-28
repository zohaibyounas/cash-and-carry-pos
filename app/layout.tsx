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
  title: "Mustafa Super Store",
  description: "Welcome to Mustafa Super Store",
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use the font CSS variable (stable across server and client) to avoid hydration mismatches
  const bodyClass = `${geistSans?.variable ?? ""} ${
    geistMono?.variable ?? ""
  } antialiased`.trim();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={bodyClass}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
