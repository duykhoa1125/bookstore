import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { BookOpen, Search, Star, Filter } from 'lucide-react'

export default function Books() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const { data: booksData, isLoading: booksLoading, error: booksError } = useQuery({
    queryKey: ['books', selectedCategory, searchTerm],
    queryFn: () => api.getBooks({ categoryId: selectedCategory || undefined, search: searchTerm || undefined }),
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
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Search for books by title, author, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-gray-600 px-2 flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <button
              onClick={() => setSelectedCategory('')}
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
                onClick={() => setSelectedCategory(category.id)}
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
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
              >
                {/* Book Image */}
                <div className="relative overflow-hidden bg-gray-100">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-72 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <BookOpen className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  {book.stock === 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Sold Out
                    </div>
                  )}
                  {book.stock > 0 && book.stock < 5 && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Low Stock
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="p-5">
                  {/* Category Badge */}
                  {book.category && (
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-2">
                      {book.category.name}
                    </span>
                  )}
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  
                  {/* Author */}
                  {book.authors && book.authors.length > 0 && (
                    <p className="text-sm text-gray-500 mb-3">
                      by {book.authors.map((a) => a.author.name).join(', ')}
                    </p>
                  )}
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {book.description || 'No description available'}
                  </p>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-gray-900">
                      ${book.price.toFixed(2)}
                    </span>
                    {book.ratings && book.ratings.length > 0 && book.averageRating ? (
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-600">
                          {book.averageRating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-sm font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {book.stock > 0 ? `Stock: ${book.stock}` : 'Out of Stock'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

