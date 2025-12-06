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
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'books', label: 'Books', icon: BookOpen, path: '/admin/books' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'categories', label: 'Categories', icon: FolderTree, path: '/admin/categories' },
    { id: 'authors', label: 'Authors', icon: Users, path: '/admin/authors' },
    { id: 'publishers', label: 'Publishers', icon: Building2, path: '/admin/publishers' },
    { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard, path: '/admin/payment-methods' }
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-64 bg-white/70 backdrop-blur-2xl border-r border-white/40 flex flex-col shadow-2xl relative z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100/50">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-gray-900 to-black p-2.5 rounded-xl text-white shadow-lg shadow-gray-500/20 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
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
        <div className="p-4 border-t border-gray-100/50 bg-white/30 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-2xl shadow-sm border border-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
