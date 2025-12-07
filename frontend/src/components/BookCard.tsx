import { Link } from 'react-router-dom'
import { Star, ShoppingCart, BookOpen, Eye } from 'lucide-react'
import { Book } from '../types'

interface BookCardProps {
  book: Book
  onAddToCart: (e: React.MouseEvent, bookId: string) => void
  isAddingToCart?: boolean
  onQuickView?: (book: Book) => void
}

export function BookCard({ book, onAddToCart, isAddingToCart = false, onQuickView }: BookCardProps) {
  const averageRating = book.averageRating || 0
  const ratingCount = book.ratings?.length || 0
  // Show stars if there remains an average rating > 0, regardless of the explicit ratings array length
  const hasRating = averageRating > 0

  return (
    <Link 
      to={`/books/${book.id}`} 
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100 hover:border-blue-100 transform hover:-translate-y-1"
    >
      <div className="block relative w-full pt-[125%] overflow-hidden bg-gray-100">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
            <BookOpen className="w-12 h-12" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onQuickView(book)
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
          >
            <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white hover:scale-105">
              <Eye className="w-3.5 h-3.5 text-gray-700" />
              <span className="text-xs font-semibold text-gray-700">Quick View</span>
            </div>
          </button>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {book.category && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-gray-900 rounded-md shadow-sm">
              {book.category.name}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {book.stock === 0 && (
           <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md">
             Sold Out
           </div>
        )}
        {book.stock > 0 && book.stock < 5 && (
           <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md">
             Low Stock
           </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <div className="mb-1.5">
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" title={book.title}>
            {book.title}
          </h3>
          {book.authors && book.authors.length > 0 && (
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              {book.authors.map(a => a.author.name).join(', ')}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-gray-500">
            {hasRating ? (
              <>
                {averageRating.toFixed(1)} 
                {ratingCount > 0 && <span className="text-gray-400 ml-0.5">({ratingCount})</span>}
              </>
            ) : (
              'No ratings'
            )}
          </span>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900">${book.price.toFixed(2)}</span>
            {book.stock > 0 && (
              <span className="text-[9px] text-green-600 font-medium">{book.stock} in stock</span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(e, book.id)
            }}
            disabled={book.stock === 0 || isAddingToCart}
            className={`p-2 rounded-lg transition-all shadow-sm flex-shrink-0 ${
              book.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-blue-600 hover:shadow-blue-200 hover:scale-105 active:scale-95'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
