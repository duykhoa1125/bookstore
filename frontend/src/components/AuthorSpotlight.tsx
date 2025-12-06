import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Star, User, Sparkles } from 'lucide-react'

export function AuthorSpotlight() {
  const { data: authorsData, isLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: () => api.getAuthors(),
  })

  const { data: booksData } = useQuery({
    queryKey: ['books'],
    queryFn: () => api.getBooks(),
  })

  const authors = authorsData?.data || []
  const books = booksData?.data || []

  // Get top 3 authors with most books
  const authorBookCounts = authors.map(author => {
    const authorBooks = books.filter(book => 
      book.authors?.some(a => a.author.id === author.id)
    )
    const avgRating = authorBooks.length > 0 
      ? authorBooks.reduce((sum, b) => sum + (b.averageRating || 0), 0) / authorBooks.length 
      : 0
    return {
      ...author,
      bookCount: authorBooks.length,
      avgRating,
      featuredBooks: authorBooks.slice(0, 3)
    }
  }).sort((a, b) => b.bookCount - a.bookCount).slice(0, 3)

  if (isLoading || authorBookCounts.length === 0) return null

  // Featured author is the one with most books
  const featuredAuthor = authorBookCounts[0]
  const otherAuthors = authorBookCounts.slice(1)

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Featured Writers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Author Spotlight
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover the brilliant minds behind your favorite stories
          </p>
        </div>

        {/* Featured Author (Large Card) */}
        <div className="mb-12">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 hover:border-purple-500/30 transition-all duration-500 group">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              {/* Author Avatar */}
              <div className="relative">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    <User className="w-20 h-20 text-gray-500" />
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white text-sm font-bold shadow-lg">
                  ⭐ Featured Author
                </div>
              </div>

              {/* Author Info */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {featuredAuthor.name}
                </h3>
                <p className="text-gray-400 text-lg mb-6 max-w-xl">
                  A master storyteller who has captivated readers worldwide with compelling narratives and unforgettable characters.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
                  <div className="text-center px-4">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-white">{featuredAuthor.bookCount}</span>
                    </div>
                    <span className="text-sm text-gray-500">Published Books</span>
                  </div>
                  <div className="text-center px-4 border-l border-white/10">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-2xl font-bold text-white">{featuredAuthor.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">Avg. Rating</span>
                  </div>
                </div>

                {/* Books Preview */}
                {featuredAuthor.featuredBooks.length > 0 && (
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <span className="text-sm text-gray-500 mr-2">Top Books:</span>
                    <div className="flex -space-x-3">
                      {featuredAuthor.featuredBooks.map((book, idx) => (
                        <Link 
                          key={book.id} 
                          to={`/books/${book.id}`}
                          className="w-12 h-16 rounded-md overflow-hidden border-2 border-gray-800 hover:border-purple-500 hover:z-10 hover:scale-110 transition-all shadow-lg"
                          style={{ zIndex: 3 - idx }}
                        >
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                    <Link 
                      to={`/books?authorName=${encodeURIComponent(featuredAuthor.name)}`}
                      className="ml-3 text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Other Authors (Smaller Cards) */}
        {otherAuthors.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {otherAuthors.map((author) => (
              <div 
                key={author.id}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 p-0.5 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1">{author.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        {author.bookCount} books
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        {author.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <Link 
                    to={`/books?authorName=${encodeURIComponent(author.name)}`}
                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
