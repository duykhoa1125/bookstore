import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface BreadcrumbItem {
  label: string
  path: string
}

export default function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Check if we're on a book detail page
  const isBookDetailPage = pathnames.length === 2 && pathnames[0] === 'books' && /^[a-z0-9-]{20,}$/i.test(pathnames[1])
  const bookId = isBookDetailPage ? pathnames[1] : null

  // Fetch book data if on book detail page
  const { data: bookData } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => api.getBook(bookId!),
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const bookTitle = bookData?.data?.title

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

  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Check if this segment is the book ID on a book detail page
    if (isBookDetailPage && index === 1) {
      // Use book title if available, otherwise show loading or fallback
      breadcrumbItems.push({
        label: bookTitle || 'Loading...',
        path: currentPath,
      })
    } else if (/^[a-z0-9-]{20,}$/i.test(segment)) {
      // This looks like an ID, we'll show "Details" for non-book pages
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
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home link */}
          <li>
            <Link
              to="/"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all group shadow-sm hover:shadow-md"
              title="Home"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
          </li>

          {/* Breadcrumb items */}
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1

            return (
              <li key={item.path} className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4 text-gray-300" />
                {isLast ? (
                  <span className="font-bold text-gray-900 px-3 py-1.5 bg-gray-100 rounded-full text-xs uppercase tracking-wide">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-gray-500 hover:text-blue-600 transition-colors font-medium px-2 py-1 hover:bg-gray-50 rounded-lg"
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
