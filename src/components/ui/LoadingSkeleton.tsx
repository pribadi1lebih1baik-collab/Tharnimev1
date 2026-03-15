import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

export function ContentCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const w = size === 'sm' ? 'w-36' : size === 'lg' ? 'w-52' : 'w-44'
  return (
    <div className={cn('flex flex-col', w)}>
      <Skeleton className="aspect-[3/4] w-full" />
      <Skeleton className="h-4 w-full mt-2" />
      <Skeleton className="h-3 w-2/3 mt-1" />
    </div>
  )
}

export function ContentRowSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => <ContentCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Skeleton className="w-full md:w-64 aspect-[3/4] flex-shrink-0 rounded-xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}
