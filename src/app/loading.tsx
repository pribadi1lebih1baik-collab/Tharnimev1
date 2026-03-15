export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Memuat...</p>
      </div>
    </div>
  )
}
