import { Card, CardContent } from "./ui/Card";
import { Skeleton } from "./ui/skeleton";


export function StatCardSkeleton() {
  return (
    <Card className="h-full flex flex-col justify-center">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            {/* Title Skeleton */}
            <Skeleton className="h-4 w-24" />
            
            <div className="flex items-baseline gap-2">
              {/* Value (Large Number) Skeleton */}
              <Skeleton className="h-9 w-16" />
              
              {/* Trend Badge Skeleton */}
              <Skeleton className="h-4 w-10" />
            </div>
          </div>

          {/* Icon Skeleton (The rounded square on the right) */}
          <Skeleton className="w-12 h-12 rounded-lg shrink-0 ml-4" />
        </div>
      </CardContent>
    </Card>
  )
}