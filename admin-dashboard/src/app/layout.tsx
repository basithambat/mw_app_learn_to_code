import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhatSay Admin Dashboard",
  description: "Internal dashboard for content and moderation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background text-foreground antialiased")}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <header className="h-16 border-b bg-card px-8 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground italic">WhatSay Platform</span>
                <span>/</span>
                <span>Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold tracking-wider uppercase border border-green-500/20">
                  Stable
                </div>
                <div className="w-px h-4 bg-border" />
                <button className="text-xs font-medium hover:text-primary transition-colors">
                  Logout
                </button>
              </div>
            </header>
            <div className="p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
