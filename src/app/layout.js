import localFont from "next/font/local";
import "./globals.css";
import "./themes/editor-themes.css";
import "./editor-styles.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

export const metadata = {
  title: "Reforkit",
  description: "Code Better, Together.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider dynamic>
      <SpeedInsights />
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            async
            strategy="afterInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3107009868155466"
            crossOrigin="anonymous"
          />
        </head>
        <body className={`antialiased flex`}>
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
    </ClerkProvider>
  );
}
