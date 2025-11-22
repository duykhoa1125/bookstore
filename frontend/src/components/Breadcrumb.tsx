import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path: string
}

export default function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Special cases for route labels
  const routeLabels: Record<string, string> = {
    books: 'Books',
    cart: 'Shopping Cart',
    orders: 'My Orders',
    profile: 'My Profile',
    'my-ratings': 'My Ratings',
    admin: 'Dashboard',
    categories: 'Categories',
    authors: 'Authors',
    publishers: 'Publishers',
    'payment-methods': 'Payment Methods',
    create: 'Create New',
    edit: 'Edit',
    register: 'Sign Up',
    login: 'Login',
  }

  // Generate breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = []
  let currentPath = ''

  pathnames.forEach((segment) => {
    currentPath += `/${segment}`
    
    // Skip numeric IDs in breadcrumb display (show as dynamic segment)
    if (/^[a-z0-9-]{20,}$/i.test(segment)) {
      // This looks like an ID, we'll show "Details"
      breadcrumbItems.push({
        label: 'Details',
        path: currentPath,
      })
    } else {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      breadcrumbItems.push({
        label,
        path: currentPath,
      })
    }
  })

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3.5">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home link */}
          <li>
            <Link
              to="/"
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors group"
              title="Home"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="ml-1.5 hidden sm:inline">Home</span>
            </Link>
          </li>

          {/* Breadcrumb items */}
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1

            return (
              <li key={item.path} className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4 text-gray-300" />
                {isLast ? (
                  <span className="font-semibold text-gray-900 px-2 py-1 bg-gray-50 rounded">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 hover:bg-blue-50 rounded"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
