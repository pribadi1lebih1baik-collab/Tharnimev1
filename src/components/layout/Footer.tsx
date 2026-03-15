import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-black text-white">AV</div>
              <span className="font-display font-bold text-lg">Anima<span className="text-accent-primary">Verse</span></span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">Platform streaming anime & donghua serta baca manga/manhwa terlengkap dengan subtitle Indonesia.</p>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-3 text-sm">Konten</h4>
            <ul className="space-y-2">
              {[['Anime', '/anime'], ['Donghua', '/donghua'], ['Manga', '/manga'], ['Komik', '/comic']].map(([l, h]) => (
                <li key={h}><Link href={h} className="text-text-muted hover:text-accent-primary text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-3 text-sm">Akun</h4>
            <ul className="space-y-2">
              {[['Profil', '/profile'], ['Daftar Tonton', '/profile/watchlist'], ['Riwayat', '/profile'], ['Login', '/login']].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-text-muted hover:text-accent-primary text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-3 text-sm">Lainnya</h4>
            <ul className="space-y-2">
              {[['Pencarian', '/search'], ['Trending', '/anime?type=trending']].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-text-muted hover:text-accent-primary text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs">© 2025 AnimaVerse. Dibuat dengan ❤️ untuk komunitas anime Indonesia.</p>
          <p className="text-text-muted text-xs">Konten disediakan oleh pihak ketiga. Untuk keperluan edukasi.</p>
        </div>
      </div>
    </footer>
  )
}
