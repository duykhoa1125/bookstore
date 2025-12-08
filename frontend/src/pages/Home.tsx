import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { BookOpen, Award, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Mail, Truck, Search, Heart, Rocket, Brain, Briefcase, Cpu, Code, Palette, Baby, Layers, Activity, UtensilsCrossed, Compass } from 'lucide-react'
import { BookCard } from '../components/BookCard'
import { BookGridSkeleton } from '../components/SkeletonLoaders'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { GlowEffect } from '../components/effects/GlowEffect'
import { CustomerReviews } from '../components/CustomerReviews'
import { QuickViewModal } from '../components/QuickViewModal'
import { AuthorSpotlight } from '../components/AuthorSpotlight'
import { StatsMilestones } from '../components/StatsMilestones'
import { Book } from '../types'
import { AxiosError } from 'axios'

export default function Home() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Quick View Modal state
  const [quickViewBook, setQuickViewBook] = useState<Book | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  
  // Parallax refs
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

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
  
  // Parallax scroll effect with throttle to prevent excessive re-renders
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])

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
      {/* Hero Slideshow */}
      <section className="relative h-[600px] lg:h-[700px] overflow-hidden bg-[#0a0a0a] group">
        {heroBooks.length > 0 ? (
          heroBooks.map((book, index) => (
            <div
              key={book.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                {book.imageUrl ? (
                   <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover opacity-40 blur-sm scale-110" />
                ) : (
                   <div className="w-full h-full bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center container mx-auto px-4 z-20">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-6xl mx-auto w-full">
                  {/* Book Cover */}
                  <div className={`w-48 md:w-64 lg:w-80 flex-shrink-0 transform transition-all duration-700 delay-300 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-all duration-500 bg-gray-800">
                       {book.imageUrl ? (
                         <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-gray-600" />
                         </div>
                       )}
                       {/* Spine effect */}
                       <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-white/20 to-transparent z-10"></div>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className={`flex-1 text-center md:text-left text-white transform transition-all duration-700 delay-100 ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                     <div className="inline-flex items-center px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-500/30 text-blue-300 text-sm font-medium mb-4">
                       <Sparkles className="w-4 h-4 mr-2" />
                       Featured Selection
                     </div>
                     <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                       {book.title}
                     </h2>
                     {book.authors && (
                       <p className="text-xl text-gray-300 mb-6 font-medium">
                         by {book.authors.map(a => a.author.name).join(', ')}
                       </p>
                     )}
                     <p className="text-gray-400 mb-8 line-clamp-3 max-w-2xl text-lg leading-relaxed hidden md:block">
                        {book.description || "Dive into this amazing journey. Discover characters, worlds, and stories that will stay with you forever."}
                     </p>
                     <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                       <Link
                         to={`/books/${book.id}`}
                         className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center"
                       >
                         View Details
                         <ArrowRight className="ml-2 w-5 h-5" />
                       </Link>
                       <button
                         onClick={(e) => handleAddToCart(e, book.id)}
                         disabled={book.stock === 0}
                         className="px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full font-bold transition-all flex items-center justify-center"
                       >
                         {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Fallback Hero if no books */
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center text-white">
            <div className="text-center px-4">
              <h1 className="text-5xl font-bold mb-4">Welcome to Bookstore</h1>
              <p className="text-xl text-gray-300 mb-8">Discover your next favorite read</p>
              <Link to="/books" className="px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-700 transition">
                Browse Collection
              </Link>
            </div>
          </div>
        )}

        {/* Carousel Controls */}
        {heroBooks.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 z-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100 z-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {heroBooks.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
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

      {/* Stats & Milestones Section */}
      <StatsMilestones />

      {/* Author Spotlight Section */}
      <AuthorSpotlight />

      {/* Customer Reviews Section */}
      <CustomerReviews />

      {/* Parallax Decorative Section */}
      <section 
        ref={parallaxRef}
        className="relative py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50"
      >
        {/* Floating decorative elements with parallax */}
        <div 
          className="absolute top-20 left-[10%] w-20 h-20 bg-blue-400/30 rounded-full blur-xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute top-40 right-[15%] w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.15}px)`, animationDelay: '1s' }}
        />
        <div 
          className="absolute bottom-20 left-[20%] w-16 h-16 bg-teal-400/30 rounded-full blur-xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.08}px)`, animationDelay: '2s' }}
        />
        <div 
          className="absolute bottom-40 right-[25%] w-24 h-24 bg-amber-400/20 rounded-full blur-2xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.12}px)`, animationDelay: '0.5s' }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Reading Journey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Starts Here
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Explore thousands of books, discover new authors, and find your next favorite read.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/books"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:-translate-y-1"
              >
                Browse All Books
              </Link>
              <Link
                to="/books?sortBy=rating&order=desc"
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-full border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all hover:-translate-y-1"
              >
                Top Rated Books
              </Link>
            </div>
          </div>
        </div>
      </section>

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



