import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { BookOpen, ShoppingBag, Star, Award, Sparkles, ArrowRight, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'


export default function Home() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: booksData, isLoading, error } = useQuery({
    queryKey: ['books', 'featured'],
    queryFn: () => api.getBooks(),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const addToCartMutation = useMutation({
    mutationFn: (bookId: string) => api.addToCart({ bookId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Book added to cart!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    },
  })

  const handleAddToCart = (e: React.MouseEvent, bookId: string) => {
    e.preventDefault() // Prevent navigation to book detail
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }
    addToCartMutation.mutate(bookId)
  }

  const featuredBooks = (booksData?.data || []).slice(0, 8)
  const categories = (categoriesData?.data || []).slice(0, 6)


  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Discover Your Next Adventure</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Welcome to <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                Bookstore
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Explore thousands of books, discover new authors, and embark on literary adventures
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/books"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Browse Books
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg group-hover:shadow-2xl">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Wide Selection</h3>
              <p className="text-gray-600 leading-relaxed">
                Thousands of books across all genres and categories
              </p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg group-hover:shadow-2xl">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Easy Shopping</h3>
              <p className="text-gray-600 leading-relaxed">
                Simple and secure checkout process
              </p>
            </div>
            
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg group-hover:shadow-2xl">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Quality Books</h3>
              <p className="text-gray-600 leading-relaxed">
                Only the best books from trusted publishers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Categories</h2>
              <p className="text-gray-600 text-lg">Find your favorite genre</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/books?category=${category.id}`}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 text-center border border-gray-100 group"
                >
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Error Message */}
      {error && (
        <section className="py-8 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-2xl mx-auto">
              <p className="font-semibold text-lg mb-1">Error loading books</p>
              <p className="text-sm">
                {error instanceof Error
                  ? error.message
                  : 'Failed to connect to backend. Make sure the backend is running on http://localhost:3000'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 text-lg">Loading amazing books for you...</p>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && featuredBooks.length === 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center py-20 max-w-md mx-auto">
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No books available</h3>
              <p className="text-gray-600 mb-4">
                The database appears to be empty.
              </p>
              <p className="text-sm text-gray-500">
                Run <code className="bg-gray-100 px-3 py-1 rounded text-xs font-mono">npm run prisma:seed</code> in the backend directory to add sample data.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Featured Books Section */}
      {!isLoading && !error && featuredBooks.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Books</h2>
                <p className="text-gray-600">Handpicked selections just for you</p>
              </div>
              <Link
                to="/books"
                className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group"
              >
                View All
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => {
                const averageRating = book.averageRating || 0
                const ratingCount = book.ratings?.length || 0
                
                return (
                  <div
                    key={book.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-200 transform hover:-translate-y-2 flex flex-col"
                  >
                    <Link to={`/books/${book.id}`} className="block relative">
                      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        {book.imageUrl ? (
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-72 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                            <BookOpen className="w-20 h-20 text-blue-200" />
                          </div>
                        )}
                        
                        {/* Stock badge */}
                        {book.stock === 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            Sold Out
                          </div>
                        )}
                        {book.stock > 0 && book.stock < 5 && (
                          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            Only {book.stock} left
                          </div>
                        )}
                        
                        {/* Rating badge overlay */}
                        {ratingCount > 0 && (
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-bold text-gray-900">
                                {averageRating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <Link to={`/books/${book.id}`} className="flex-grow">
                        {/* Category badge */}
                        {book.category && (
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-bold rounded-full mb-3 border border-blue-100">
                            {book.category.name}
                          </span>
                        )}
                        
                        {/* Book title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                          {book.title}
                        </h3>
                        
                        {/* Authors */}
                        {book.authors && book.authors.length > 0 && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                            by {book.authors.map((a) => a.author.name).join(', ')}
                          </p>
                        )}
                        
                        {/* Rating display */}
                        <div className="mb-4">
                          {ratingCount > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= Math.round(averageRating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-gray-200 text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">
                                {averageRating.toFixed(1)} • {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="w-4 h-4 fill-gray-200 text-gray-200"
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-400">No reviews yet</p>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      {/* Price and CTA */}
                      <div className="mt-auto space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">
                            ${book.price.toFixed(2)}
                          </span>
                          {book.stock > 0 && book.stock < 10 && book.stock >= 5 && (
                            <span className="text-xs text-gray-500">
                              {book.stock} in stock
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => handleAddToCart(e, book.id)}
                          disabled={book.stock === 0 || addToCartMutation.isPending}
                          className={`w-full px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                            book.stock === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-md hover:shadow-lg'
                          }`}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/books"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore All Books
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Reading?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of readers and discover your next favorite book today
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

