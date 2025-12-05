import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, BookOpen, Package, Search, Star, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Book } from '../types'

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
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.getCart(),
    enabled: isAuthenticated,
    retry: false,
  })

  const cartItemCount = cartData?.data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const handleLogout = () => {
    logout()
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSelectedIndex(-1)
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
    navigate(term ? `/books?search=${encodeURIComponent(term)}` : '/books')
  }, [headerSearch, navigate])

  const handleSelectBook = useCallback((book: Book) => {
    setIsDropdownOpen(false)
    setHeaderSearch('')
    setSelectedIndex(-1)
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
        break
    }
  }, [isDropdownOpen, suggestions, selectedIndex, triggerSearch, handleSelectBook])

  const clearSearch = () => {
    setHeaderSearch('')
    setIsDropdownOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              BookStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              to="/books" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
            >
              Books
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link 
                to="/admin" 
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
              >
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          {/* Search Bar with Dropdown (Hidden on mobile) */}
          <div ref={searchRef} className="hidden lg:flex flex-1 max-w-md relative">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search books..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (debouncedSearch.trim().length >= 2) {
                    setIsDropdownOpen(true)
                  }
                }}
                className="w-full pl-4 pr-16 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              
              {/* Clear button */}
              {headerSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Search button */}
              <button
                type="button"
                onClick={triggerSearch}
                aria-label="Search"
                title="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 hover:text-blue-600 hover:shadow-[0_0_8px_rgba(59,130,246,0.6)] focus:shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 text-gray-500 text-sm">Searching...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {suggestions.map((book, index) => (
                      <button
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedIndex === index 
                            ? 'bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Book image */}
                        <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-gray-100">
                          {book.imageUrl ? (
                            <img 
                              src={book.imageUrl} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        {/* Book info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {book.title}
                          </h4>
                          {book.authors && book.authors.length > 0 && (
                            <p className="text-xs text-gray-500 truncate">
                              by {book.authors.map(a => a.author.name).join(', ')}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-blue-600">
                              ${book.price.toFixed(2)}
                            </span>
                            {(book.averageRating ?? 0) > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
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
                      className="w-full px-4 py-3 text-center text-sm font-medium text-blue-600 bg-gray-50 hover:bg-blue-50 border-t border-gray-100 transition-colors"
                    >
                      View all results for "{headerSearch}"
                    </button>
                  </div>
                ) : debouncedSearch.trim().length >= 2 ? (
                  <div className="py-8 text-center">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No books found for "{debouncedSearch}"</p>
                    <button
                      onClick={triggerSearch}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Search anyway
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  title="Cart"
                  aria-label="Cart"
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/orders"
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-50"
                  title="My Orders"
                >
                  <Package className="w-5 h-5" />
                </Link>
                <Link
                  to="/my-ratings"
                  className="relative p-2 text-gray-600 hover:text-yellow-500 transition-colors rounded-full hover:bg-yellow-50"
                  title="My Ratings"
                  aria-label="My Ratings"
                >
                  <Star className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <Link
                    to="/profile"
                    title="Profile"
                    aria-label="Profile"
                    className="flex items-center space-x-2 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm group-hover:shadow-md transition-all">
                      {user?.fullName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-blue-600 transition-colors">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

