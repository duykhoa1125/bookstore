import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { BookOpen, Award, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Mail, Truck, Search, Heart, Rocket, Brain, Briefcase, Cpu, Code, Palette, Baby, Layers, Activity, UtensilsCrossed, Compass } from 'lucide-react'
import { BookCard } from '../components/BookCard'
import { BookGridSkeleton } from '../components/SkeletonLoaders'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { GlowEffect } from '../components/effects/GlowEffect'
import { CustomerReviews } from '../components/CustomerReviews'
import { QuickViewModal } from '../components/QuickViewModal'
import { AuthorSpotlight } from '../components/AuthorSpotlight'

import { Book } from '../types'
import { AxiosError } from 'axios'

export default function Home() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Quick View Modal state
  const [quickViewBook, setQuickViewBook] = useState<Book | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  const { data: booksData, isLoading, error } = useQuery({
    queryKey: ['books', 'featured'],
    queryFn: () => api.getBooks(),
    retry: (failureCount, error: AxiosError) => {
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Slideshow logic
  const heroBooks = (booksData?.data || []).slice(0, 5)
  
  useEffect(() => {
    if (heroBooks.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBooks.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroBooks.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBooks.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBooks.length) % heroBooks.length)
  }

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const addToCartMutation = useMutation({
    mutationFn: (bookId: string) => api.addToCart({ bookId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Book added to cart!')
      setIsQuickViewOpen(false) // Close modal after adding to cart
    },
    onError: (error: AxiosError<{ message?: string }>) => {
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
  
  const handleQuickView = (book: Book) => {
    setQuickViewBook(book)
    setIsQuickViewOpen(true)
  }

  const featuredBooks = (booksData?.data || []).slice(0, 8)
  const categories = (categoriesData?.data || []).slice(0, 15) // Show more categories

  // Category icon mapping for realistic book categories
  const categoryIconConfig: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
    'Fiction': { icon: <BookOpen className="w-8 h-8" />, bgColor: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-600' },
    'Mystery & Thriller': { icon: <Search className="w-8 h-8" />, bgColor: 'from-red-500/20 to-red-600/10', textColor: 'text-red-600' },
    'Science Fiction & Fantasy': { icon: <Rocket className="w-8 h-8" />, bgColor: 'from-purple-500/20 to-purple-600/10', textColor: 'text-purple-600' },
    'Romance': { icon: <Heart className="w-8 h-8" />, bgColor: 'from-pink-500/20 to-pink-600/10', textColor: 'text-pink-600' },
    'Non-Fiction': { icon: <BookOpen className="w-8 h-8" />, bgColor: 'from-amber-500/20 to-amber-600/10', textColor: 'text-amber-600' },
    'Self-Help & Personal Development': { icon: <Brain className="w-8 h-8" />, bgColor: 'from-teal-500/20 to-teal-600/10', textColor: 'text-teal-600' },
    'Business & Economics': { icon: <Briefcase className="w-8 h-8" />, bgColor: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-600' },
    'Science & Technology': { icon: <Cpu className="w-8 h-8" />, bgColor: 'from-cyan-500/20 to-cyan-600/10', textColor: 'text-cyan-600' },
    'Programming & Software': { icon: <Code className="w-8 h-8" />, bgColor: 'from-indigo-500/20 to-indigo-600/10', textColor: 'text-indigo-600' },
    'Art & Design': { icon: <Palette className="w-8 h-8" />, bgColor: 'from-orange-500/20 to-orange-600/10', textColor: 'text-orange-600' },
    "Children's Books": { icon: <Baby className="w-8 h-8" />, bgColor: 'from-yellow-500/20 to-yellow-600/10', textColor: 'text-yellow-600' },
    'Comics & Graphic Novels': { icon: <Layers className="w-8 h-8" />, bgColor: 'from-violet-500/20 to-violet-600/10', textColor: 'text-violet-600' },
    'Health & Wellness': { icon: <Activity className="w-8 h-8" />, bgColor: 'from-green-500/20 to-green-600/10', textColor: 'text-green-600' },
    'Cooking & Food': { icon: <UtensilsCrossed className="w-8 h-8" />, bgColor: 'from-rose-500/20 to-rose-600/10', textColor: 'text-rose-600' },
    'Travel & Adventure': { icon: <Compass className="w-8 h-8" />, bgColor: 'from-sky-500/20 to-sky-600/10', textColor: 'text-sky-600' },
  }

  const getCategoryConfig = (name: string) => {
    return categoryIconConfig[name] || { 
      icon: <BookOpen className="w-8 h-8" />, 
      bgColor: 'from-gray-500/20 to-gray-600/10', 
      textColor: 'text-gray-600' 
    }
  }

  return (
    <GlowEffect>
      <div className="relative">
      {/* Hero Carousel - Card Style with Peek Effect */}
      <section className="relative bg-[#0a0a0a] overflow-hidden">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-3 flex-wrap">
            <span>BOOK</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">DEALS</span>
            <span>EXTRAVAGANZA</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">LITERARY TREASURES & ADVENTURES</p>
        </div>

        {/* Carousel Container */}
        <div className="relative h-[450px] md:h-[500px] lg:h-[550px] flex items-center justify-center px-4">
          {heroBooks.length > 0 ? (
            <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center">
              {heroBooks.map((book, index) => {
                const offset = index - currentSlide
                const isActive = index === currentSlide
                const isPrev = offset === -1 || (currentSlide === 0 && index === heroBooks.length - 1)
                const isNext = offset === 1 || (currentSlide === heroBooks.length - 1 && index === 0)
                
                // Calculate position for peek effect
                let translateX = '0%'
                let scale = 1
                let opacity = 1
                let zIndex = 10
                let blur = 0
                
                if (isActive) {
                  translateX = '0%'
                  scale = 1
                  opacity = 1
                  zIndex = 20
                } else if (isPrev) {
                  translateX = '-85%'
                  scale = 0.85
                  opacity = 0.6
                  zIndex = 10
                  blur = 2
                } else if (isNext) {
                  translateX = '85%'
                  scale = 0.85
                  opacity = 0.6
                  zIndex = 10
                  blur = 2
                } else {
                  opacity = 0
                  zIndex = 0
                }

                return (
                  <div
                    key={book.id}
                    className="absolute w-full max-w-4xl transition-all duration-500 ease-out"
                    style={{
                      transform: `translateX(${translateX}) scale(${scale})`,
                      opacity,
                      zIndex,
                      filter: blur > 0 ? `blur(${blur}px)` : 'none',
                    }}
                  >
                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl mx-4">
                      {/* Gradient border effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50" />
                      
                      <div className="relative flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-10">
                        {/* Book Cover */}
                        <div className="flex-shrink-0 flex justify-center md:justify-start">
                          <div className="relative w-40 md:w-52 lg:w-60">
                            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 bg-gray-800 group">
                              {book.imageUrl ? (
                                <img 
                                  src={book.imageUrl} 
                                  alt={book.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                  <BookOpen className="w-16 h-16 text-gray-500" />
                                </div>
                              )}
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            {/* Glow under book */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-500/30 blur-xl rounded-full" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center md:text-left text-white">
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight line-clamp-2">
                            {book.title}
                          </h2>
                          
                          {book.authors && (
                            <p className="text-gray-400 mb-4 font-medium">
                              {book.authors.map(a => a.author.name).join(', ')}
                            </p>
                          )}

                          {/* Features list */}
                          <ul className="space-y-2 mb-6 text-sm text-gray-300 hidden md:block">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              Premium quality hardcover edition
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                              Award-winning narrative
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                              {book.stock > 0 ? `${book.stock} copies available` : 'Currently out of stock'}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              Best reading experience guaranteed
                            </li>
                          </ul>

                          {/* Price */}
                          <div className="flex items-baseline gap-3 mb-6 justify-center md:justify-start">
                            <span className="text-3xl md:text-4xl font-bold text-white">
                              ${book.price.toFixed(2)}
                            </span>
                            {book.price > 10 && (
                              <span className="text-lg text-gray-500 line-through">
                                ${(book.price * 1.25).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* CTA Button */}
                          <Link
                            to={`/books/${book.id}`}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] hover:bg-right text-white rounded-full font-bold transition-all duration-500 shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                          >
                            Shop Now
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Fallback Hero if no books */
            <div className="text-center px-4">
              <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to Bookstore</h1>
              <p className="text-xl text-gray-400 mb-8">Discover your next favorite read</p>
              <Link to="/books" className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:scale-105 transition">
                Browse Collection
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        {heroBooks.length > 1 && (
          <div className="flex items-center justify-center gap-6 pb-8">
            <button 
              onClick={prevSlide}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Progress Bar */}
            <div className="w-32 md:w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / heroBooks.length) * 100}%` }}
              />
            </div>
            
            <button 
              onClick={nextSlide}
              className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 py-3">
          <div className="flex items-center justify-center gap-6 md:gap-10 text-xs md:text-sm text-gray-400">
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Sparkles className="w-4 h-4 text-purple-400" />
              BESTSELLERS
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Award className="w-4 h-4 text-amber-400" />
              AWARD WINNERS
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <BookOpen className="w-4 h-4 text-blue-400" />
              NEW ARRIVALS
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white/40 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                 <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Extensive Library</h3>
                <p className="text-sm text-gray-500">Over 10,000 titles available</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                 <Truck className="w-8 h-8" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Fast Shipping</h3>
                 <p className="text-sm text-gray-500">Free delivery on orders over $50</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                 <Award className="w-8 h-8" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">Best Quality</h3>
                 <p className="text-sm text-gray-500">Guaranteed authentic books</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Collection</h2>
              <p className="text-gray-500">Handpicked books that are trending right now</p>
            </div>
            <Link
              to="/books"
              className="group flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              View All Books
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {isLoading ? (
             <BookGridSkeleton count={8} />
          ) : error ? (
             <div className="text-center py-10 bg-red-50 rounded-xl text-red-600">
                Error loading books. Please try again later.
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {featuredBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addToCartMutation.isPending}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Modern Grid */}
      <section className="py-20 bg-transparent border-t border-gray-100/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => {
                const config = getCategoryConfig(category.name)
                return (
                  <Link 
                    key={category.id} 
                    to={`/books?categoryId=${category.id}`} 
                    className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.bgColor} z-0`} />
                    
                    {/* Decorative Elements */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.bgColor} rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700`}></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center">
                       <div className={`mb-3 ${config.textColor} transform group-hover:scale-110 transition-transform duration-300`}>
                         {config.icon}
                       </div>
                       <h3 className={`font-bold text-gray-900 text-sm leading-tight group-hover:${config.textColor} transition-colors`}>{category.name}</h3>
                       <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">Explore →</p>
                    </div>
                  </Link>
                )
              })}
          </div>
        </div>
      </section>

      {/* Author Spotlight Section */}
      <AuthorSpotlight />

      {/* Customer Reviews Section */}
      <CustomerReviews />

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>
        {/* Parallax floating elements in newsletter */}
        <div 
          className="absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-50"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        />
        <div 
          className="absolute bottom-20 right-20 w-3 h-3 bg-purple-400 rounded-full opacity-50"
          style={{ transform: `translateY(${scrollY * 0.03}px)` }}
        />
        <div className="container mx-auto px-4 relative z-10">
           <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-8 backdrop-blur-sm">
                 <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Stay Updated with New Releases</h2>
              <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                Subscribe to our newsletter and receive a 10% discount coupon for your first purchase. 
                Be the first to know about our latest events and book signings.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition-all"
                />
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-600/30">
                  Subscribe
                </button>
              </form>
           </div>
        </div>
      </section>
      </div>
      
      {/* Quick View Modal */}
      <QuickViewModal
        book={quickViewBook}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        isAddingToCart={addToCartMutation.isPending}
      />
    </GlowEffect>
  )
}



