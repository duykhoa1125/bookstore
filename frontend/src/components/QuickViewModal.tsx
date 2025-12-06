import { X, Star, ShoppingCart, BookOpen, ExternalLink } from 'lucide-react'
import { Book } from '../types'
import { Link } from 'react-router-dom'
import { useState } from 'react'

interface QuickViewModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (e: React.MouseEvent, bookId: string) => void
  isAddingToCart?: boolean
}

export function QuickViewModal({ 
  book, 
  isOpen, 
  onClose, 
  onAddToCart,
  isAddingToCart = false 
}: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !book) return null

  const averageRating = book.averageRating || 0
  const ratingCount = book.ratings?.length || 0

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Book Image */}
          <div className="relative w-full md:w-2/5 bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
            {/* Decorative circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 w-48 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              {book.imageUrl ? (
                <img 
                  src={book.imageUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {/* Spine effect */}
              <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/20 to-transparent" />
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 p-8 overflow-y-auto max-h-[70vh] md:max-h-none">
            {/* Category Badge */}
            {book.category && (
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-4">
                {book.category.name}
              </span>
            )}

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {book.title}
            </h2>

            {/* Authors */}
            {book.authors && book.authors.length > 0 && (
              <p className="text-gray-600 mb-4">
                by <span className="font-medium text-gray-800">{book.authors.map(a => a.author.name).join(', ')}</span>
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating) 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating > 0 ? (
                  <>
                    <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-400 ml-1">({ratingCount} reviews)</span>
                  </>
                ) : (
                  'No reviews yet'
                )}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed line-clamp-4">
                {book.description || 'No description available for this book. Click "View Full Details" to learn more.'}
              </p>
            </div>

            {/* Price & Stock */}
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-100">
              <div>
                <span className="text-3xl font-bold text-gray-900">${book.price.toFixed(2)}</span>
                {book.stock > 0 ? (
                  <p className="text-sm text-green-600 font-medium mt-1">{book.stock} in stock</p>
                ) : (
                  <p className="text-sm text-red-500 font-medium mt-1">Out of Stock</p>
                )}
              </div>
              
              {/* Quantity Selector */}
              {book.stock > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Qty:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={(e) => onAddToCart(e, book.id)}
                disabled={book.stock === 0 || isAddingToCart}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  book.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* View Full Details Link */}
            <Link 
              to={`/books/${book.id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
            >
              View Full Details
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
