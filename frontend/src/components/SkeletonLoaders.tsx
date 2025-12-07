/**
 * Reusable Skeleton Loading Components
 * Provides shimmer animation placeholders for various UI elements
 */

// Base skeleton component with shimmer animation
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{ 
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  )
}

// BookCard Skeleton - matches BookCard component layout
export function BookCardSkeleton() {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image placeholder */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
      </div>
      
      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-3/4" />
        
        {/* Author */}
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-1/2" />
        
        {/* Price and Rating row */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-16" />
          <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-12" />
        </div>
      </div>
    </div>
  )
}

// Grid of BookCard skeletons
export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  )
}

// BookDetail Page Skeleton
export function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            {/* Image Skeleton */}
            <div className="mb-8 lg:mb-0 max-w-md mx-auto lg:mx-0">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-100 animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="flex flex-col space-y-6">
              {/* Category & Rating badges */}
              <div className="flex gap-3">
                <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
              </div>

              {/* Title */}
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-1/2" />
              </div>

              {/* Author & Publisher */}
              <div className="flex gap-8 pb-6 border-b border-gray-100">
                <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-32" />
                <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-28" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>

              {/* Buy Box Skeleton */}
              <div className="mt-auto bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-100">
                <div className="flex items-end justify-between mb-8">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                    <div className="h-12 bg-gray-300 rounded-lg animate-pulse w-28" />
                  </div>
                  <div className="h-8 bg-green-100 rounded-full animate-pulse w-24" />
                </div>

                <div className="flex gap-4 mb-8">
                  <div className="h-14 bg-gray-200 rounded-2xl animate-pulse w-36" />
                  <div className="h-14 bg-gray-300 rounded-2xl animate-pulse flex-1" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/60">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-full animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Item Skeleton
export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex gap-6 items-start">
        {/* Image */}
        <div className="w-32 aspect-[2/3] rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-grow flex flex-col justify-between min-h-[140px]">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-3/4" />
            <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-20" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="h-10 bg-gray-100 rounded-full animate-pulse w-28" />
            <div className="text-right space-y-1">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-12 ml-auto" />
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Page Skeleton
export function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl animate-pulse" />
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-48" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>

        {/* Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-40 mb-6" />
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-16" />
              </div>
              <div className="flex justify-between pt-2 border-t">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
                <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-40" />
              <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            </div>

            <div className="h-14 bg-gray-300 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100/50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className={`h-5 bg-gray-200 rounded animate-pulse ${i === 0 ? 'w-48' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

// Admin Table Skeleton
export function AdminTableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50/50 border-b border-gray-100/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-4 text-left">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50 bg-white/30">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Dashboard Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-lg shadow-gray-200/50">
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-8 bg-gray-300 rounded-lg animate-pulse w-20" />
        </div>
        <div className="w-12 h-12 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
      <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-32" />
    </div>
  )
}

// Add shimmer animation to global styles if not already present
// Add this CSS to your index.css:
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
