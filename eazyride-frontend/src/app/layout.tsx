import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PulseFooter from '@/components/PulseFooter'
import InstallBanner from '@/components/InstallBanner'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Pulse — Community Office Commute',
  description: 'Simple and shared office carpooling for professionals.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PulseGo',
  },
  openGraph: {
    title: 'PulseGo — Community Office Commute',
    description: 'Simple and shared office carpooling for professionals.',
    url: 'https://pulsego.vercel.app',
    siteName: 'PulseGo',
    images: [
      {
        url: 'https://pulsego.vercel.app/icon-512.png',
        width: 512,
        height: 512,
        alt: 'PulseGo App Icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PulseGo — Community Office Commute',
    description: 'Simple and shared office carpooling for professionals.',
    images: ['https://pulsego.vercel.app/icon-512.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <InstallBanner />
        <PulseFooter />
        <Analytics />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
