import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, BookOpen, Package, Search, Star } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

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

  const triggerSearch = () => {
    const term = headerSearch.trim()
    navigate(term ? `/books?search=${encodeURIComponent(term)}` : '/books')
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

          {/* Search Bar (Hidden on mobile) */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search by title, author, publisher, or description..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  triggerSearch()
                }
              }}
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
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

