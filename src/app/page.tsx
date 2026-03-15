import { Suspense } from 'react'
import HomeClient from './home-client'

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <HomeClient />
    </Suspense>
  )
}
