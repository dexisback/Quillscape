import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/context/ThemeContext"
import { AuthProvider } from "@/context/AuthContext"
import PublicFeedWarmup from "@/components/PublicFeedWarmup"

export const metadata: Metadata = {
  title: "Quillscape",
  description: "Write. Publish. Share.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <PublicFeedWarmup />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
