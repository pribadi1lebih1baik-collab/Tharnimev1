import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-display font-black text-bg-tertiary mb-4">404</div>
      <h1 className="text-2xl font-bold text-text-primary mb-3">Halaman Tidak Ditemukan</h1>
      <p className="text-text-muted mb-8 max-w-md">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      <div className="flex gap-3">
        <Link href="/" className="px-6 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-medium rounded-xl transition-colors">
          Ke Beranda
        </Link>
        <Link href="/anime" className="px-6 py-3 bg-bg-secondary border border-border text-text-primary rounded-xl hover:bg-bg-tertiary transition-colors">
          Cari Anime
        </Link>
      </div>
    </div>
  )
}
