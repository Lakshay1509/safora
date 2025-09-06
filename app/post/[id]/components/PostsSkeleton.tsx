import { Skeleton } from "@/components/ui/skeleton"

export default function PostDetailSkeleton() {
  return (
    <div className="max-w-4xl my-auto mx-10 p-6 space-y-6">
      {/* Post Title */}
      <Skeleton className="h-8 w-3/4" />
      
      {/* Author info and date */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 py-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-16 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      {/* Comments Section */}
      <div className="space-y-4 pt-6">
        {/* Comments Header */}
        <Skeleton className="h-6 w-24" />
        
        {/* Comment Input */}
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        
        {/* No comments message */}
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  )
}
