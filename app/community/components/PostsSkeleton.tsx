import { Skeleton } from "@/components/ui/skeleton"

export default function PostSkeleton() {
  return (
    <div className="max-w-4xl bg-white rounded-lg border p-4 space-y-4">
      {/* User info section */}
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Location tag */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Post title */}
      <Skeleton className="h-6 w-3/4" />

      {/* Post content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-4 pt-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-12 rounded-md" />
          <Skeleton className="h-4 w-4" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}
