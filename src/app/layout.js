import localFont from "next/font/local";
import "./globals.css";
import "./themes/editor-themes.css";
import "./editor-styles.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from "@vercel/speed-insights/next"

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
