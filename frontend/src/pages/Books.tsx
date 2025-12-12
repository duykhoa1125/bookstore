import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Search, ChevronDown, X, Star, SlidersHorizontal, Tag, DollarSign, Sparkles, User } from 'lucide-react'
import { BookCard } from '../components/BookCard'
import { BookGridSkeleton } from '../components/SkeletonLoaders'
import { QuickViewModal } from '../components/QuickViewModal'
import Pagination from '../components/Pagination'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { Book } from '../types'

// Accordion Section Component
interface AccordionSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionSection({ title, icon, children, defaultOpen = true }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-gray-100/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
          <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default function Books() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // URL Params State
  const urlSearch = searchParams.get('search') || ''
  const urlCategory = searchParams.get('categoryId') || ''
  const urlAuthor = searchParams.get('authorId') || ''
  
  // Local State for Filters
  const [searchTerm, setSearchTerm] = useState(urlSearch)
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory)
  const [selectedAuthor, setSelectedAuthor] = useState<string>(urlAuthor)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('newest') // newest, price-asc, price-desc, rating-desc
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [hoverRating, setHoverRating] = useState<number>(0)
  
  // Quick View Modal state
  const [quickViewBook, setQuickViewBook] = useState<Book | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  // Sync state with URL
  useEffect(() => {
    setSearchTerm(urlSearch)
    setSelectedCategory(urlCategory)
    setSelectedAuthor(urlAuthor)
  }, [urlSearch, urlCategory, urlAuthor])

  // Fetch Data
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['books'], // Fetch all and filter client side for better UX with small dataset
    queryFn: () => api.getBooks(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    staleTime: 1000 * 60 * 60,
  })

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => api.getAuthors(),
    staleTime: 1000 * 60 * 60,
  })

  // Add to Cart Mutation
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
    e.preventDefault()
    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }
    addToCartMutation.mutate(bookId)
  }

  // Quick View Handler
  const handleQuickView = (book: Book) => {
    setQuickViewBook(book)
    setIsQuickViewOpen(true)
  }

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false)
    setTimeout(() => setQuickViewBook(null), 300) // Clear after animation
  }

  // Filter & Sort Logic
  const filteredBooks = useMemo(() => {
    let result = booksData?.data || []

    // 1. Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      result = result.filter(book => 
        book.title.toLowerCase().includes(lowerTerm) || 
        book.description?.toLowerCase().includes(lowerTerm) ||
        book.authors?.some(a => a.author.name.toLowerCase().includes(lowerTerm))
      )
    }

    // 2. Category
    if (selectedCategory) {
      result = result.filter(book => book.categoryId === selectedCategory)
    }

    // 2.5. Author
    if (selectedAuthor) {
      result = result.filter(book => 
        book.authors?.some(a => a.author.id === selectedAuthor)
      )
    }

    // 3. Price Range (Client-side)
    result = result.filter(book => book.price >= priceRange[0] && book.price <= priceRange[1])

    // 4. Rating (Client-side)
    if (minRating > 0) {
      result = result.filter(book => (book.averageRating || 0) >= minRating)
    }

    // 5. Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        break
      case 'newest':
      default:
        // Assuming recently added books have higher IDs or createdAt if available
        // If no createdAt, we might leave as is or sort by ID
        result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        break
    }

    return result
  }, [booksData, searchTerm, selectedCategory, selectedAuthor, priceRange, minRating, sortBy])

  // Pagination Logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handlers
  const updateUrl = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value)
      else prev.delete(key)
      return prev
    })
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop & Mobile) */}
          <aside className={`
            fixed inset-0 z-40 bg-white/95 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none lg:static lg:z-10 lg:w-80 lg:min-w-[320px] lg:block overflow-y-auto lg:overflow-visible transition-all duration-500 ease-out
            ${isMobileFiltersOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100'}
          `}>
             <div className="p-6 lg:p-0 lg:sticky lg:top-24 h-full">
                
                {/* Filter Card Container - Glassmorphism */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 overflow-hidden">
                  
                  {/* Header */}
                  <div className="bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <SlidersHorizontal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">Filters</h2>
                          <p className="text-xs text-white/70">Refine your search</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsMobileFiltersOpen(false)} 
                        className="lg:hidden p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Active Filters Badges */}
                  {(searchTerm || selectedCategory || selectedAuthor || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <div className="px-5 py-3 bg-slate-50 border-b border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-100 group hover:border-red-200 transition-colors">
                            <Search className="w-3 h-3 text-blue-500" />
                            "{searchTerm.length > 10 ? searchTerm.slice(0, 10) + '...' : searchTerm}"
                            <button 
                              onClick={() => { setSearchTerm(''); updateUrl('search', '') }}
                              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {selectedCategory && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-100 group hover:border-red-200 transition-colors">
                            <Tag className="w-3 h-3 text-purple-500" />
                            {categoriesData?.data?.find(c => c.id === selectedCategory)?.name || 'Category'}
                            <button 
                              onClick={() => { setSelectedCategory(''); updateUrl('categoryId', '') }}
                              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {selectedAuthor && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-100 group hover:border-red-200 transition-colors">
                            <User className="w-3 h-3 text-emerald-500" />
                            {authorsData?.data?.find(a => a.id === selectedAuthor)?.name || 'Author'}
                            <button 
                              onClick={() => { setSelectedAuthor(''); updateUrl('authorId', '') }}
                              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {minRating > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-100 group hover:border-red-200 transition-colors">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {minRating}+ Stars
                            <button 
                              onClick={() => setMinRating(0)}
                              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-100 group hover:border-red-200 transition-colors">
                            <DollarSign className="w-3 h-3 text-green-500" />
                            ${priceRange[0]} - ${priceRange[1]}
                            <button 
                              onClick={() => setPriceRange([0, 1000])}
                              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Filter Sections Container */}
                  <div className="p-5 space-y-1">
                    
                    {/* Search Section */}
                    <AccordionSection title="Search" icon={<Search className="w-4 h-4" />}>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-slate-200 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"></div>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value)
                              updateUrl('search', e.target.value)
                            }}
                            placeholder="Title, author, keyword..."
                            className="w-full !pl-14 pr-4 py-3 bg-gray-50/80 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-sm placeholder:text-gray-400"
                          />
                          {searchTerm && (
                            <button 
                              onClick={() => { setSearchTerm(''); updateUrl('search', '') }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </AccordionSection>

                    {/* Categories Section */}
                    <AccordionSection title="Categories" icon={<Tag className="w-4 h-4" />}>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {/* All Categories Option */}
                        <label 
                          htmlFor="cat-all"
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                            selectedCategory === '' 
                              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedCategory === '' 
                              ? 'border-white bg-white' 
                              : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {selectedCategory === '' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                            )}
                          </div>
                          <input
                            type="radio"
                            id="cat-all"
                            name="category"
                            checked={selectedCategory === ''}
                            onChange={() => {
                              setSelectedCategory('')
                              updateUrl('categoryId', '')
                            }}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium ${selectedCategory === '' ? 'text-white' : 'text-gray-700'}`}>
                            All Categories
                          </span>
                          <Sparkles className={`w-4 h-4 ml-auto ${selectedCategory === '' ? 'text-white/70' : 'text-gray-300'}`} />
                        </label>

                        {categoriesData?.data?.map((cat) => (
                          <label 
                            key={cat.id}
                            htmlFor={`cat-${cat.id}`}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                              selectedCategory === cat.id 
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedCategory === cat.id 
                                ? 'border-white bg-white' 
                                : 'border-gray-300 group-hover:border-blue-400'
                            }`}>
                              {selectedCategory === cat.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              id={`cat-${cat.id}`}
                              name="category"
                              checked={selectedCategory === cat.id}
                              onChange={() => {
                                setSelectedCategory(cat.id)
                                updateUrl('categoryId', cat.id)
                              }}
                              className="sr-only"
                            />
                            <span className={`text-sm font-medium ${selectedCategory === cat.id ? 'text-white' : 'text-gray-700'}`}>
                              {cat.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </AccordionSection>

                    {/* Authors Section */}
                    <AccordionSection title="Authors" icon={<User className="w-4 h-4" />} defaultOpen={false}>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {/* All Authors Option */}
                        <label 
                          htmlFor="author-all"
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                            selectedAuthor === '' 
                              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedAuthor === '' 
                              ? 'border-white bg-white' 
                              : 'border-gray-300 group-hover:border-emerald-400'
                          }`}>
                            {selectedAuthor === '' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                            )}
                          </div>
                          <input
                            type="radio"
                            id="author-all"
                            name="author"
                            checked={selectedAuthor === ''}
                            onChange={() => {
                              setSelectedAuthor('')
                              updateUrl('authorId', '')
                            }}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium ${selectedAuthor === '' ? 'text-white' : 'text-gray-700'}`}>
                            All Authors
                          </span>
                          <Sparkles className={`w-4 h-4 ml-auto ${selectedAuthor === '' ? 'text-white/70' : 'text-gray-300'}`} />
                        </label>

                        {authorsData?.data?.map((author) => (
                          <label 
                            key={author.id}
                            htmlFor={`author-${author.id}`}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                              selectedAuthor === author.id 
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedAuthor === author.id 
                                ? 'border-white bg-white' 
                                : 'border-gray-300 group-hover:border-emerald-400'
                            }`}>
                              {selectedAuthor === author.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              id={`author-${author.id}`}
                              name="author"
                              checked={selectedAuthor === author.id}
                              onChange={() => {
                                setSelectedAuthor(author.id)
                                updateUrl('authorId', author.id)
                              }}
                              className="sr-only"
                            />
                            <span className={`text-sm font-medium ${selectedAuthor === author.id ? 'text-white' : 'text-gray-700'}`}>
                              {author.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </AccordionSection>

                    {/* Price Range Section */}
                    <AccordionSection title="Price Range" icon={<DollarSign className="w-4 h-4" />}>
                      <div className="space-y-4">
                        {/* Price Display */}
                        <div className="flex items-center justify-between">
                          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                            <span className="text-xs text-gray-500">Min</span>
                            <p className="text-lg font-bold text-gray-800">${priceRange[0]}</p>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"></div>
                          </div>
                          <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <span className="text-xs text-gray-500">Max</span>
                            <p className="text-lg font-bold text-gray-800">${priceRange[1]}</p>
                          </div>
                        </div>

                        {/* Range Sliders */}
                        <div className="relative pt-2 pb-4">
                          <div className="relative h-2 bg-gray-100 rounded-full">
                            {/* Active Range */}
                            <div 
                              className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{
                                left: `${(priceRange[0] / 1000) * 100}%`,
                                right: `${100 - (priceRange[1] / 1000) * 100}%`
                              }}
                            ></div>
                          </div>
                          
                          {/* Min Slider */}
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const value = parseInt(e.target.value)
                              if (value < priceRange[1]) {
                                setPriceRange([value, priceRange[1]])
                              }
                            }}
                            className="absolute w-full h-2 top-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer"
                          />
                          
                          {/* Max Slider */}
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const value = parseInt(e.target.value)
                              if (value > priceRange[0]) {
                                setPriceRange([priceRange[0], value])
                              }
                            }}
                            className="absolute w-full h-2 top-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-purple-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-500 [&::-moz-range-thumb]:cursor-pointer"
                          />
                        </div>

                        {/* Quick Price Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Under $20', range: [0, 20] as [number, number] },
                            { label: '$20 - $50', range: [20, 50] as [number, number] },
                            { label: '$50 - $100', range: [50, 100] as [number, number] },
                            { label: '$100+', range: [100, 1000] as [number, number] },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => setPriceRange(preset.range)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                                priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1]
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </AccordionSection>

                    {/* Rating Section */}
                    <AccordionSection title="Rating" icon={<Star className="w-4 h-4" />}>
                      <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                            onMouseEnter={() => setHoverRating(rating)}
                            onMouseLeave={() => setHoverRating(0)}
                            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group ${
                              minRating === rating 
                                ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-amber-400/25' 
                                : hoverRating === rating
                                  ? 'bg-amber-50'
                                  : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex gap-1 mr-3">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    star <= rating 
                                      ? minRating === rating
                                        ? 'text-white fill-white'
                                        : 'text-amber-400 fill-amber-400'
                                      : minRating === rating
                                        ? 'text-white/30'
                                        : 'text-gray-200'
                                  } ${hoverRating === rating && star <= rating ? 'scale-110' : ''}`} 
                                />
                              ))}
                            </div>
                            <span className={`text-sm font-medium ${
                              minRating === rating ? 'text-white' : 'text-gray-600'
                            }`}>
                              & Up
                            </span>
                            {minRating === rating && (
                              <div className="ml-auto">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </AccordionSection>
                  </div>

                  {/* Clear All Button */}
                  <div className="p-5 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                        setSelectedAuthor('')
                        setPriceRange([0, 1000])
                        setMinRating(0)
                        setSortBy('newest')
                        setSearchParams(prev => {
                          prev.delete('search')
                          prev.delete('categoryId')
                          prev.delete('authorId')
                          return prev
                        })
                        setCurrentPage(1)
                      }}
                      className="w-full py-3 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                      <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      Clear All Filters
                    </button>
                  </div>
                </div>
             </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 lg:w-3/4">
             {/* Controls Bar */}
             <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium shadow-md hover:bg-blue-600 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {(searchTerm || selectedCategory || selectedAuthor || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <span className="w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {[searchTerm, selectedCategory, selectedAuthor, minRating > 0, priceRange[0] > 0 || priceRange[1] < 1000].filter(Boolean).length}
                    </span>
                  )}
                </button>

                <div className="text-gray-600 text-sm">
                   Showing <span className="font-bold text-gray-900">{paginatedBooks.length}</span> of <span className="font-bold text-gray-900">{filteredBooks.length}</span> results
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                   <span className="hidden sm:inline text-sm font-medium text-gray-600">Sort by:</span>
                   <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 sm:p-2.5 pr-8 cursor-pointer font-medium"
                      >
                         <option value="newest">Newest Arrivals</option>
                         <option value="price-asc">Price: Low to High</option>
                         <option value="price-desc">Price: High to Low</option>
                         <option value="rating-desc">Highest Rated</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                   </div>
                </div>
             </div>

             {/* Content Grid */}
             {booksLoading ? (
                <BookGridSkeleton count={8} />
             ) : paginatedBooks.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                    {paginatedBooks.map((book) => (
                      <BookCard 
                        key={book.id} 
                        book={book} 
                        onAddToCart={handleAddToCart}
                        isAddingToCart={addToCartMutation.isPending}
                        onQuickView={handleQuickView}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      totalItems={filteredBooks.length}
                      showItemsInfo={false}
                    />
                  )}
                </>
             ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-gray-300" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">No books found</h3>
                   <p className="text-gray-500 max-w-sm text-center mb-6">
                     We couldn't find any books matching your current filters. Try adjusting your search or categories.
                   </p>
                   <button
                     onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                        setSelectedAuthor('')
                        setPriceRange([0, 1000])
                        setMinRating(0)
                        setSortBy('newest')
                        setSearchParams(prev => {
                          prev.delete('search')
                          prev.delete('categoryId')
                          prev.delete('authorId')
                          return prev
                        })
                        setCurrentPage(1)
                     }}
                     className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition"
                   >
                     Clear Filters
                   </button>
                </div>
             )}
          </main>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        book={quickViewBook}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onAddToCart={handleAddToCart}
        isAddingToCart={addToCartMutation.isPending}
      />
    </div>
  )
}

