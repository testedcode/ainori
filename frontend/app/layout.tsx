import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import JoolFooter from './components/JoolFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JOOL — Premium Office Carpooling',
  description: 'Corridor-based premium carpooling for office commutes. Save carbon, money, and time.',
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
        <JoolFooter />
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
