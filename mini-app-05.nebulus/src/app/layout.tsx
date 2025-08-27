import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SolanaWalletProvider } from "@/components/solana-wallet-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Nebulus",
  description: "Your decentralized AI agent for notes scraping, summaries, etc. See what is happening right now!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(inter.className, 'antialiased', 'bg-gradient-to-tr from-black via-fuchsia-950 to-black min-h-screen relative')}
        suppressHydrationWarning
        
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SolanaWalletProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </SolanaWalletProvider>
        </ThemeProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            className: "max-w-sm",
            duration: 3000,
            style: {
              fontFamily: "var(--font-geist-sans)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
