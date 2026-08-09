import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: '100PANIK | Strètwear Modèn',
    template: '%s | 100PANIK',
  },
  description: '100PANIK - Lè mòd lan pran panik, style lan rete kalm. Dekouvri koleksyon strètwear eksklizif nou an.',
  keywords: ['strètwear', 'mòd', '100PANIK', 'rad modèn', 'e-commerce'],
  authors: [{ name: '100PANIK' }],
  openGraph: {
    type: 'website',
    locale: 'ht_HT',
    url: 'https://www.100panik.com',
    siteName: '100PANIK',
    title: '100PANIK | Strètwear Modèn',
    description: 'Lè mòd lan pran panik, style lan rete kalm.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '100PANIK',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ht" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-black text-white">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
