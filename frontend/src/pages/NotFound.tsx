import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
           <div className="relative text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-none select-none">
             404
           </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-500 mb-8 text-lg">
          We couldn't find the page you were looking for. It might have been removed, renamed, or doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-gray-900 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <Link
            to="/books"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:border-gray-300"
          >
            <Search className="w-5 h-5 mr-2" />
            Browse Books
          </Link>
        </div>
      </div>
    </div>
  )
}
