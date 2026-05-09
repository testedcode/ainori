import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";

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
          <Navbar />
          <main style={{ minHeight: '70vh' }}>
            {children}
          </main>
          <footer className="panel mt-28" style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.4)' }}>
            <div className="layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
              <div>
                <div className="brand mb-20">
                  <span className="brand-mark">ER</span>
                  <span>EazyRide</span>
                </div>
                <p className="small muted">A clean, community-driven ride-sharing platform for professionals. Built for safety and sustainability.</p>
              </div>
              <div>
                <div className="side-title" style={{ marginBottom: '16px' }}>Explore</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/book" className="small muted hover:text-primary transition-colors">Find a Ride</Link>
                  <Link href="/share" className="small muted hover:text-primary transition-colors">Share a Route</Link>
                  <Link href="/exclusive-benefits" className="small muted hover:text-primary transition-colors">Premium Benefits</Link>
                </div>
              </div>
              <div>
                <div className="side-title" style={{ marginBottom: '16px' }}>Community</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/hacks" className="small muted hover:text-primary transition-colors">Ride Hacks</Link>
                  <Link href="/safety" className="small muted hover:text-primary transition-colors">Safety Protocol</Link>
                  <Link href="/protocols" className="small muted hover:text-primary transition-colors">Our Standards</Link>
                </div>
              </div>
              <div>
                <div className="side-title" style={{ marginBottom: '16px' }}>Legal</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link href="/privacy" className="small muted hover:text-primary transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="small muted hover:text-primary transition-colors">Terms of Service</Link>
                  <Link href="/support" className="small muted hover:text-primary transition-colors">Support Help</Link>
                </div>
              </div>
            </div>
            <div className="mt-28 pt-20" style={{ borderTop: '1px solid var(--line)', textAlign: 'center' }}>
              <p className="small muted">© 2026 EazyRide Community. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
