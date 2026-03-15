'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password minimal 6 karakter'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username, full_name: username } },
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Akun berhasil dibuat! Silakan cek email verifikasi.')
    router.push('/login')
  }

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-xl font-black text-white mx-auto mb-4">AV</div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Buat Akun Baru</h1>
          <p className="text-text-muted text-sm mt-2">Bergabung dan nikmati anime & manga favoritmu</p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-2xl">
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200 mb-6 font-medium">
            <Chrome size={18} className="text-blue-400" /> Daftar dengan Google
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" /><span className="text-text-muted text-xs">atau</span><div className="flex-1 h-px bg-border" />
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                  placeholder="username_kamu" pattern="[a-zA-Z0-9_]+" minLength={3}
                  className="w-full pl-9 pr-4 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="email@contoh.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  placeholder="Min. 6 karakter"
                  className="w-full pl-9 pr-10 py-2.5 bg-bg-primary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent-primary hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-primary/30 hover:-translate-y-0.5">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Buat Akun</>}
            </button>
          </form>
        </div>
        <p className="text-center text-text-muted text-sm mt-6">
          Sudah punya akun?{' '}<Link href="/login" className="text-accent-primary hover:text-accent-secondary font-medium transition-colors">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
