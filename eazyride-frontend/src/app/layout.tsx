import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EazyRide",
  description: "Share your route, save together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <div className="page-shell">
          <header className="topbar" aria-label="EazyRide navigation">
            <a className="brand" href="/" aria-label="EazyRide home">
              <span className="brand-mark">ER</span>
              <span>EazyRide<small>Share your route</small></span>
            </a>
            <nav className="nav" aria-label="Primary navigation">
              <a href="/">Home</a>
              <a href="/book">Book a seat</a>
              <a href="/share">Share route</a>
              <a href="/dashboard">My trips</a>
            </nav>
            <div className="top-actions">
              <a href="/login" className="light-btn">Log in</a>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
