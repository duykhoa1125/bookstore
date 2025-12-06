import { Link } from 'react-router-dom'
import { Star, ShoppingCart, BookOpen } from 'lucide-react'
import { Book } from '../types'

interface BookCardProps {
  book: Book
  onAddToCart: (e: React.MouseEvent, bookId: string) => void
  isAddingToCart?: boolean
}

export function BookCard({ book, onAddToCart, isAddingToCart = false }: BookCardProps) {
  const averageRating = book.averageRating || 0
  const ratingCount = book.ratings?.length || 0
  // Show stars if there remains an average rating > 0, regardless of the explicit ratings array length
  const hasRating = averageRating > 0

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden border border-gray-100 hover:border-blue-100 transform hover:-translate-y-1">
      <Link to={`/books/${book.id}`} className="block relative w-full pt-[140%] overflow-hidden bg-gray-100">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
            <BookOpen className="w-16 h-16" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {book.category && (
            <span className="px-2.5 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg shadow-sm">
              {book.category.name}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {book.stock === 0 && (
           <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
             Sold Out
           </div>
        )}
        {book.stock > 0 && book.stock < 5 && (
           <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
             Low Stock
           </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
           <Link to={`/books/${book.id}`}>
            <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" title={book.title}>
              {book.title}
            </h3>
          </Link>
          {book.authors && book.authors.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {book.authors.map(a => a.author.name).join(', ')}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(averageRating) ? 'fill-current' : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-500">
            {hasRating ? (
              <>
                {averageRating.toFixed(1)} 
                {ratingCount > 0 && <span className="text-gray-400 ml-1">({ratingCount})</span>}
              </>
            ) : (
              'No ratings'
            )}
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">${book.price.toFixed(2)}</span>
            {book.stock > 0 && (
              <span className="text-[10px] text-green-600 font-medium">{book.stock} in stock</span>
            )}
          </div>
          
          <button
            onClick={(e) => onAddToCart(e, book.id)}
            disabled={book.stock === 0 || isAddingToCart}
            className={`p-2.5 rounded-xl transition-all shadow-sm flex-shrink-0 ${
              book.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-blue-600 hover:shadow-blue-200 hover:scale-105 active:scale-95'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
