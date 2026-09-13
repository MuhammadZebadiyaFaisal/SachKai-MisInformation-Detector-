import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sach-Kya AI | Multi-Agent Fact Checker",
  description: "Autonomous Multi-Agent Fact Verification Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
