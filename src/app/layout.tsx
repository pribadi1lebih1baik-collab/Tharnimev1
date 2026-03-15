import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'AnimaVerse — Nonton Anime & Baca Manga', template: '%s | AnimaVerse' },
  description: 'Platform streaming anime, donghua, dan baca manga/manhwa/webtoon terlengkap dengan subtitle Indonesia.',
  keywords: ['anime', 'manga', 'donghua', 'manhwa', 'webtoon', 'streaming', 'subtitle indonesia'],
  authors: [{ name: 'AnimaVerse' }],
  themeColor: '#0A0A0F',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'AnimaVerse',
    title: 'AnimaVerse — Nonton Anime & Baca Manga',
    description: 'Platform streaming anime, donghua, dan baca manga/manhwa/webtoon terlengkap.',
  },
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155' },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
