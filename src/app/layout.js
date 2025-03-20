import localFont from "next/font/local";
import "./globals.css";
import "./themes/editor-themes.css";
import "./editor-styles.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { SaveDefualtSettings } from "@/components/writeDefualtSettings";
import { Analytics } from "@vercel/analytics/react"
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
          <meta charSet="UTF-8" />
        </head>
        <body>
          <script async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3107009868155466"
            crossorigin="anonymous"
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <SaveDefualtSettings />
          </ThemeProvider>
        </body>
      </html>
      <Analytics />
    </ClerkProvider>
  );
}
