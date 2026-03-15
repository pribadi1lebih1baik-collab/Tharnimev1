'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Menu, X, User, LogOut, BookOpen, Tv, ChevronDown, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Anime', href: '/anime', icon: Tv },
  { label: 'Donghua', href: '/donghua', icon: Tv },
  { label: 'Manga', href: '/manga', icon: BookOpen },
  { label: 'Komik', href: '/comic', icon: BookOpen },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, isAuthenticated } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-bg-primary/95 backdrop-blur-lg border-b border-border shadow-lg shadow-black/20' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-black text-white">
                AV
              </div>
              <span className="font-display font-bold text-xl text-text-primary hidden sm:block">
                Anima<span className="text-accent-primary">Verse</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname.startsWith(link.href)
                      ? 'text-accent-primary bg-accent-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  )}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari anime, manga..."
                    className="w-48 sm:w-64 px-3 py-1.5 text-sm bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="text-text-muted hover:text-text-primary">
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  <Search size={18} />
                </button>
              )}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bg-secondary transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-xs font-bold text-white">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={14} className="text-text-muted hidden sm:block" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-text-primary">{user?.username}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                        <User size={15} /> Profil Saya
                      </Link>
                      <Link href="/profile/watchlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                        <BookOpen size={15} /> Daftar Tonton
                      </Link>
                      <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    Masuk
                  </Link>
                  <Link href="/register" className="px-3 py-1.5 text-sm bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors font-medium">
                    Daftar
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-bg-secondary border-t border-border animate-slide-up">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'text-accent-primary bg-accent-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  )}>
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2 border-t border-border mt-2">
                  <Link href="/login" className="flex-1 text-center py-2 text-sm text-text-secondary border border-border rounded-lg">Masuk</Link>
                  <Link href="/register" className="flex-1 text-center py-2 text-sm bg-accent-primary text-white rounded-lg font-medium">Daftar</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
