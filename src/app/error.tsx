'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-text-primary mb-3">Terjadi Kesalahan</h1>
      <p className="text-text-muted mb-8 max-w-md">Maaf, ada sesuatu yang tidak berjalan dengan baik.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-xl transition-colors">
          Coba Lagi
        </button>
        <Link href="/" className="px-6 py-3 bg-bg-secondary border border-border text-text-primary rounded-xl hover:bg-bg-tertiary transition-colors">
          Ke Beranda
        </Link>
      </div>
    </div>
  )
}
