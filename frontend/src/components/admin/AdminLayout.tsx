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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Bookstore</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 mb-1 rounded-lg transition-colors ${
                  active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
