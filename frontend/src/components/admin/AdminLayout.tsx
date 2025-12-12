import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Users,
  FolderTree,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../Logo'
import { useState, useEffect } from 'react'

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'books', label: 'Books', icon: BookOpen, path: '/admin/books' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
    { id: 'categories', label: 'Categories', icon: FolderTree, path: '/admin/categories' },
    { id: 'authors', label: 'Authors', icon: Users, path: '/admin/authors' },
    { id: 'publishers', label: 'Publishers', icon: Building2, path: '/admin/publishers' },
    { id: 'payment-methods', label: 'Payments', icon: CreditCard, path: '/admin/payment-methods' }
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Logo showText={false} variant="mobile" />
          <Link to="/" className="text-lg font-bold text-gray-900">Admin</Link>
        </div>
        <Link 
          to="/" 
          className="p-2 text-gray-500 hover:text-blue-600 rounded-xl transition-all"
          title="Back to Store"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar - Desktop always visible, Mobile slide-in */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/70 backdrop-blur-2xl border-r border-white/40 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-100/50 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <Logo showText={false} />
            <Link to="/" className="text-lg lg:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 block">
              Admin
            </Link>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 lg:py-6 px-3 lg:px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-300 group ${
                  active 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 translate-x-1' 
                    : 'text-gray-600 hover:bg-white/80 hover:text-blue-600 hover:shadow-md hover:translate-x-1'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                   <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3 lg:p-4 border-t border-gray-100/50 bg-white/30 backdrop-blur-sm">
          <div className="flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3 bg-white/60 rounded-xl lg:rounded-2xl shadow-sm border border-white/50">
            <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-md ring-2 ring-white flex-shrink-0">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-[9px] lg:text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 lg:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-14 lg:pt-0">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

