import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { BookOpen, Search, Star, Filter, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'


export default function Books() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoryId') || '')
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || '')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  )

  // Update local state if URL changes externally (e.g. header search while on page)
  useEffect(() => {
    const paramSearch = searchParams.get('search') || ''
    const paramCategory = searchParams.get('categoryId') || ''
    const paramSortBy = searchParams.get('sortBy') || ''
    const paramOrder = (searchParams.get('order') as 'asc' | 'desc') || 'desc'
    if (paramSearch !== searchTerm) setSearchTerm(paramSearch)
    if (paramCategory !== selectedCategory) setSelectedCategory(paramCategory)
    if (paramSortBy !== sortBy) setSortBy(paramSortBy)
    if (paramOrder !== sortOrder) setSortOrder(paramOrder)
  }, [searchParams])

  const applyParams = (
    nextSearch: string,
    nextCategory: string,
    nextSortBy: string,
    nextOrder: 'asc' | 'desc'
  ) => {
    const params: Record<string, string> = {}
    const trimmed = nextSearch.trim()
    if (trimmed) params.search = trimmed
    if (nextCategory) params.categoryId = nextCategory
    if (nextSortBy) {
      params.sortBy = nextSortBy
      if (nextOrder) params.order = nextOrder
    }
    setSearchParams(params)
  }

  const { data: booksData, isLoading: booksLoading, error: booksError } = useQuery({
    queryKey: ['books', selectedCategory, searchTerm, sortBy, sortOrder],
    queryFn: () =>
      api.getBooks({
        categoryId: selectedCategory || undefined,
        search: searchTerm || undefined,
        sortBy: (sortBy as 'price' | 'rating') || undefined,
        order: (sortBy ? sortOrder : undefined) as 'asc' | 'desc' | undefined,
      }),
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
    retry: 1,
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

  const books = booksData?.data || []
  const categories = categoriesData?.data || []


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Read</h1>
            <p className="text-lg text-blue-100">Explore our collection of amazing books across all genres</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4">
            <div className="flex items-center gap-3 max-w-6xl mx-auto">
              {/* Search bar on the right */}
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search by title, author, publisher, or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    const v = e.target.value
                    setSearchTerm(v)
                    applyParams(v, selectedCategory, sortBy, sortOrder)
                  }}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm text-gray-600">Sort:</span>
                {/* Price sort button cycles asc -> desc -> none */}
                <button
                  onClick={() => {
                    if (sortBy !== 'price') {
                      setSortBy('price')
                      setSortOrder('asc')
                      applyParams(searchTerm, selectedCategory, 'price', 'asc')
                    } else if (sortOrder === 'asc') {
                      setSortOrder('desc')
                      applyParams(searchTerm, selectedCategory, 'price', 'desc')
                    } else {
                      setSortBy('')
                      applyParams(searchTerm, selectedCategory, '', sortOrder)
                    }
                  }}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                    sortBy === 'price'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={`Cycle price sort (asc → desc → none)`}
                >
                  Price {sortBy === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </button>
                {/* Rating sort button cycles asc -> desc -> none */}
                <button
                  onClick={() => {
                    if (sortBy !== 'rating') {
                      setSortBy('rating')
                      setSortOrder('asc')
                      applyParams(searchTerm, selectedCategory, 'rating', 'asc')
                    } else if (sortOrder === 'asc') {
                      setSortOrder('desc')
                      applyParams(searchTerm, selectedCategory, 'rating', 'desc')
                    } else {
                      // none
                      setSortBy('')
                      applyParams(searchTerm, selectedCategory, '', sortOrder)
                    }
                  }}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                    sortBy === 'rating'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={`Cycle rating sort (asc → desc → none)`}
                >
                  Rating {sortBy === 'rating' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-gray-600 px-2 flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('')
                applyParams(searchTerm, '', sortBy, sortOrder)
              }}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Books
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id)
                  applyParams(searchTerm, category.id, sortBy, sortOrder)
                }}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        {!booksLoading && !booksError && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              {books.length === 0 ? (
                'No books found'
              ) : (
                <>
                  Showing <span className="font-semibold text-gray-900">{books.length}</span> {books.length === 1 ? 'book' : 'books'}
                  {searchTerm && (
                    <> for "<span className="font-semibold text-gray-900">{searchTerm}</span>"</>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Error Messages */}
        {booksError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-2xl mx-auto">
            <p className="font-semibold text-lg mb-1">Error loading books</p>
            <p className="text-sm">
              {booksError instanceof Error
                ? booksError.message
                : 'Failed to connect to backend. Make sure the backend is running on http://localhost:3000'}
            </p>
            {(booksError as any)?.response?.status === 429 && (
              <p className="text-xs mt-2 text-orange-700">
                ⚠️ Rate limit exceeded. Please wait a moment and refresh the page.
              </p>
            )}
          </div>
        )}

        {/* Books Grid */}
        {booksLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading amazing books...</p>
          </div>
        ) : booksError ? (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-semibold mb-2">Failed to load books</p>
            <p className="text-gray-500">
              Please check that the backend is running and try refreshing the page
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-semibold mb-2">No books found</p>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'The database might be empty'}
            </p>
            {!searchTerm && !selectedCategory && (
              <p className="text-sm text-gray-400">
                Try running: <code className="bg-gray-100 px-2 py-1 rounded">npm run prisma:seed</code> in the backend directory
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => {
              const averageRating = book.averageRating || 0
              const hasRating = averageRating > 0
              
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
                      {hasRating && (
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
                      <div>
                        {hasRating ? (
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
                      {/* Stocks */}
                      <div className="mt-2 mb-4">
                        <div className="flex items-center min-h-[32px]">
                          {book.stock >= 20 ? (
                            <span className="text-xs text-green-600 font-medium">In Stock</span>
                          ) : book.stock > 0 ? (
                            <span className="text-xs text-orange-600 font-medium">{book.stock} left in stock</span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    
                    {/* Price and CTA */}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ${book.price.toFixed(2)}
                        </span>
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
        )}
      </div>
    </div>
  )
}

