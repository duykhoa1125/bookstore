import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, BookOpen, Package, Search, Star, X, Menu, Home, Info } from 'lucide-react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Book } from '../types'
import Logo from './Logo'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.getCart(),
    enabled: isAuthenticated,
    retry: false,
  })

  const cartItemCount = cartData?.data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const [headerSearch, setHeaderSearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const debouncedSearch = useDebounce(headerSearch, 300)

  // Fetch search suggestions
  const { data: suggestionsData, isLoading: isSearching } = useQuery({
    queryKey: ['search-suggestions', debouncedSearch],
    queryFn: () => api.getBooks({ search: debouncedSearch }),
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 30000,
  })

  const suggestions: Book[] = useMemo(() => 
    suggestionsData?.data?.slice(0, 6) || [], 
    [suggestionsData?.data]
  )

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [navigate])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        // Don't close mobile search on outside click if want it persistent
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Open dropdown when typing
  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      setIsDropdownOpen(true)
    } else {
      setIsDropdownOpen(false)
    }
    setSelectedIndex(-1)
  }, [debouncedSearch])

  const triggerSearch = useCallback(() => {
    const term = headerSearch.trim()
    setIsDropdownOpen(false)
    setSelectedIndex(-1)
    setIsMobileSearchOpen(false)
    setIsMobileMenuOpen(false)
    navigate(term ? `/books?search=${encodeURIComponent(term)}` : '/books')
  }, [headerSearch, navigate])

  const handleSelectBook = useCallback((book: Book) => {
    setIsDropdownOpen(false)
    setHeaderSearch('')
    setSelectedIndex(-1)
    setIsMobileSearchOpen(false)
    setIsMobileMenuOpen(false)
    navigate(`/books/${book.id}`)
  }, [navigate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        triggerSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectBook(suggestions[selectedIndex])
        } else {
          triggerSearch()
        }
        break
      case 'Escape':
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        mobileInputRef.current?.blur()
        break
    }
  }, [isDropdownOpen, suggestions, selectedIndex, triggerSearch, handleSelectBook])

  const clearSearch = () => {
    setHeaderSearch('')
    setIsDropdownOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
    mobileInputRef.current?.focus()
  }

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  // Search Results Component (shared between desktop and mobile)
  const SearchResults = () => (
    <>
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
          <span className="mt-3 text-gray-500 text-sm font-medium">Searching our library...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="max-h-[60vh] lg:max-h-[28rem] overflow-y-auto">
          <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Books</h5>
          </div>
          {suggestions.map((book, index) => (
            <button
              key={book.id}
              onClick={() => handleSelectBook(book)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-start gap-3 sm:gap-4 px-4 py-3 text-left transition-all ${
                selectedIndex === index 
                  ? 'bg-blue-50/80 pl-5 sm:pl-6' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Book image */}
              <div className="flex-shrink-0 w-10 h-14 sm:w-12 sm:h-16 rounded-md overflow-hidden shadow-sm border border-gray-100">
                {book.imageUrl ? (
                  <img 
                    src={book.imageUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                  </div>
                )}
              </div>
              
              {/* Book info */}
              <div className="flex-1 min-w-0 py-0.5">
                <h4 className={`font-semibold text-sm truncate transition-colors ${selectedIndex === index ? 'text-blue-700' : 'text-gray-900'}`}>
                  {book.title}
                </h4>
                {book.authors && book.authors.length > 0 && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    by {book.authors.map(a => a.author.name).join(', ')}
                  </p>
                )}
                <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
                  <span className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    ${book.price.toFixed(2)}
                  </span>
                  {(book.averageRating ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      {(book.averageRating ?? 0).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          
          {/* View all results link */}
          <button
            onClick={triggerSearch}
            className="w-full px-4 py-3.5 text-center text-sm font-semibold text-blue-600 bg-gray-50 hover:bg-blue-600 hover:text-white border-t border-gray-100 transition-all"
          >
            View all results for "{headerSearch}"
          </button>
        </div>
      ) : debouncedSearch.trim().length >= 2 ? (
        <div className="py-8 sm:py-10 text-center flex flex-col items-center px-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium">No results found</p>
          <p className="text-gray-500 text-sm mt-1">We couldn't find any books matching "{debouncedSearch}"</p>
          <button
            onClick={triggerSearch}
            className="mt-4 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Search everywhere
          </button>
        </div>
      ) : null}
    </>
  )

  return (
    <>
      <header className="bg-white/70 backdrop-blur-2xl shadow-sm sticky top-0 z-50 border-b border-white/40 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-10">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-full border border-white/50 backdrop-blur-sm">
              {[
                { path: '/', label: 'Home' },
                { path: '/books', label: 'Books' },
                { path: '/about', label: 'About' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-5 py-2 text-sm font-medium text-gray-600 rounded-full hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all duration-200 relative overflow-hidden"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="px-5 py-2 text-sm font-medium text-red-600 rounded-full hover:text-red-700 hover:bg-red-50 hover:shadow-sm transition-all duration-200"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Desktop Search Bar with Dropdown */}
            <div ref={searchRef} className="hidden lg:flex flex-1 max-w-lg relative group">
              <div className="relative w-full transition-all duration-300 group-focus-within:scale-[1.02]">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for books, authors..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (debouncedSearch.trim().length >= 2) {
                      setIsDropdownOpen(true)
                    }
                  }}
                  className="w-full pl-6 pr-14 py-3 bg-gray-100/50 border-2 border-transparent hover:border-blue-100 focus:border-blue-500/20 rounded-full text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                />
                
                {/* Clear button */}
                {headerSearch && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                
                {/* Search button */}
                <button
                  type="button"
                  onClick={triggerSearch}
                  aria-label="Search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black rounded-full text-white hover:bg-blue-600 hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Desktop Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-900/10 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <SearchResults />
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="lg:hidden p-2 sm:p-2.5 text-gray-600 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    title="Cart"
                    className="group relative p-2 sm:p-2.5 text-gray-600 hover:text-blue-600 transition-all rounded-full hover:bg-blue-50"
                  >
                    <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                    {cartItemCount > 0 && (
                      <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm ring-2 ring-white">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>

                  <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-2 sm:pl-4 ml-1 sm:ml-2">
                    <Link
                      to="/orders"
                      className="p-2.5 text-gray-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                      title="My Orders"
                    >
                      <Package className="w-5 h-5" />
                    </Link>

                    <div className="relative group">
                      <button
                        className="flex items-center gap-3 pl-2 py-1 pr-1 hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-100 focus:outline-none"
                      >
                        <div className="hidden md:flex flex-col items-end mr-1">
                          <span className="text-sm font-bold text-gray-800 leading-tight">
                            {user?.fullName?.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 tracking-wide uppercase">
                            {user?.role === 'ADMIN' ? 'Admin' : 'Member'}
                          </span>
                        </div>
                        
                        <div className="relative">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg group-hover:border-blue-200 transition-all">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.fullName} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                                {user?.fullName?.charAt(0).toUpperCase() || <User className="w-4 h-4 sm:w-5 sm:h-5" />}
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                      </button>
                      
                      {/* User Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                        <div className="p-2 space-y-1">
                          <Link to="/profile" className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                            <User className="w-4 h-4 mr-3" />
                            My Profile
                          </Link>
                          <Link to="/orders" className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                            <Package className="w-4 h-4 mr-3" />
                            My Orders
                          </Link>
                          <Link to="/my-ratings" className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                            <Star className="w-4 h-4 mr-3" />
                            My Ratings
                          </Link>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile user avatar (simplified) */}
                  <Link
                    to="/profile"
                    className="sm:hidden relative"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.fullName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                          {user?.fullName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    to="/login"
                    className="hidden sm:block px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white transition-all duration-300 lg:hidden ${
          isMobileSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Search Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <button
              onClick={() => {
                setIsMobileSearchOpen(false)
                setHeaderSearch('')
                setIsDropdownOpen(false)
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div ref={mobileSearchRef} className="flex-1 relative">
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search books, authors..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full pl-4 pr-10 py-3 bg-gray-100 rounded-xl text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {headerSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={triggerSearch}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Search Results */}
          <div className="flex-1 overflow-y-auto">
            {(isDropdownOpen || debouncedSearch.trim().length >= 2) && <SearchResults />}
            {!isDropdownOpen && debouncedSearch.trim().length < 2 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Start typing to search</p>
                <p className="text-gray-400 text-sm mt-1">Find books, authors, and more</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-[70] w-[280px] sm:w-[320px] bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div onClick={handleMobileNavClick}>
              <Logo variant="mobile" />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info (if authenticated) */}
          {isAuthenticated && user && (
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{user.fullName}</p>
                  <p className="text-xs text-blue-600 font-medium uppercase">{user.role === 'ADMIN' ? 'Admin' : 'Member'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={handleMobileNavClick}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link
                to="/books"
                onClick={handleMobileNavClick}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
              >
                <BookOpen className="w-5 h-5" />
                Books
              </Link>
              <Link
                to="/about"
                onClick={handleMobileNavClick}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
              >
                <Info className="w-5 h-5" />
                About
              </Link>

              {isAuthenticated && (
                <>
                  <div className="h-px bg-gray-100 my-3" />
                  
                  <Link
                    to="/profile"
                    onClick={handleMobileNavClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  <Link
                    to="/cart"
                    onClick={handleMobileNavClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                    {cartItemCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={handleMobileNavClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                  >
                    <Package className="w-5 h-5" />
                    My Orders
                  </Link>
                  <Link
                    to="/my-ratings"
                    onClick={handleMobileNavClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-medium"
                  >
                    <Star className="w-5 h-5" />
                    My Ratings
                  </Link>

                  {user?.role === 'ADMIN' && (
                    <>
                      <div className="h-px bg-gray-100 my-3" />
                      <Link
                        to="/admin"
                        onClick={handleMobileNavClick}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                      >
                        <div className="w-5 h-5 bg-red-500 rounded-md flex items-center justify-center text-white text-xs font-bold">A</div>
                        Admin Panel
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={handleMobileNavClick}
                  className="block w-full px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-medium border border-gray-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={handleMobileNavClick}
                  className="block w-full px-4 py-3 text-center text-white bg-gray-900 hover:bg-blue-600 rounded-xl transition-all font-bold"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

