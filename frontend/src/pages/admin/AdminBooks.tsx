
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Plus, Edit, Trash2, BookOpen, Eye, Search, X, ChevronDown } from 'lucide-react'
import { AdminTableSkeleton } from '../../components/SkeletonLoaders'
import Pagination from '../../components/Pagination'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'

export default function AdminBooks() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'lowstock' | 'outofstock'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10


  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => api.getBooks(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  // Type guard for API errors
  const isApiError = (error: unknown): error is { response?: { data?: { message?: string } } } => {
    return typeof error === 'object' && error !== null && 'response' in error
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success('Book deleted successfully')
    },
    onError: (error: Error) => {
      const message = isApiError(error) ? error.response?.data?.message : undefined
      toast.error(message || 'Failed to delete book')
    },
  })

  const books = booksData?.data || []
  const categories = categoriesData?.data || []

  // Filter books based on search and filters
  const filteredBooks = useMemo(() => {
    // Reset to page 1 when filters change (handled via dependency in useEffect below)
    return books.filter((book: any) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        book.title.toLowerCase().includes(searchLower) ||
        book.authors?.some((a: any) => a.author.name.toLowerCase().includes(searchLower))

      // Category filter
      const matchesCategory = selectedCategory === 'all' || book.category?.id === selectedCategory

      // Stock filter
      let matchesStock = true
      if (stockFilter === 'instock') matchesStock = book.stock > 10
      else if (stockFilter === 'lowstock') matchesStock = book.stock > 0 && book.stock <= 10
      else if (stockFilter === 'outofstock') matchesStock = book.stock === 0

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [books, searchQuery, selectedCategory, stockFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredBooks.slice(start, start + itemsPerPage)
  }, [filteredBooks, currentPage, itemsPerPage])

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Books</h1>
          <p className="text-gray-500 mt-1">Create, edit, and organize your book inventory.</p>
        </div>
        <Link
          to="/admin/books/create"
          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <div className="bg-white/20 p-1 rounded-lg">
             <Plus className="w-4 h-4" />
          </div>
          <span className="font-semibold">Add New Book</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Side: Search & Category */}
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-4 pr-20 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:shadow-md hover:border-gray-300"
                />
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {searchQuery && <div className="h-4 w-px bg-gray-200"></div>}
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-4 pr-10 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md hover:border-gray-300"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Stock Filter (Segmented Control) */}
          <div className="flex-shrink-0">
            <div className="bg-white border border-gray-200 p-1 rounded-xl flex items-center h-11 shadow-sm">
              {[
                { id: 'all', label: 'All' },
                { id: 'instock', label: 'In Stock' },
                { id: 'lowstock', label: 'Low' },
                { id: 'outofstock', label: 'Out' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => { setStockFilter(filter.id as 'all' | 'instock' | 'lowstock' | 'outofstock'); setCurrentPage(1); }}
                  className={`px-4 h-full rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center ${
                    stockFilter === filter.id
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary (Optional but nice) */}
        {(searchQuery || selectedCategory !== 'all' || stockFilter !== 'all') && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 animate-in fade-in slide-in-from-top-1">
            <span>Filters active:</span>
            {searchQuery && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100">Search: {searchQuery}</span>}
            {selectedCategory !== 'all' && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg border border-purple-100">Category: {categories.find((c: any) => c.id === selectedCategory)?.name}</span>}
            {stockFilter !== 'all' && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg border border-gray-200">Stock: {stockFilter}</span>}
            <button 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setStockFilter('all')
              }}
              className="ml-auto text-red-600 hover:text-red-700 hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <AdminTableSkeleton rows={6} columns={5} />
      ) : (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50/50 border-b border-gray-100/50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {paginatedBooks.map((book: any) => (
                  <tr key={book.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                           {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded-lg shadow-md border border-white"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center shadow-inner">
                              <BookOpen className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-gray-900 mb-1 truncate max-w-[200px] md:max-w-[300px]" title={book.title}>
                            {book.title}
                          </div>
                          {book.authors && book.authors.length > 0 && (
                            <div className="text-xs text-gray-500 font-medium truncate max-w-[200px] md:max-w-[300px]">
                              {book.authors.map((a: any) => a.author.name).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${book.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        book.stock > 10 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : book.stock > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {book.stock}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600 font-medium hidden lg:table-cell">
                      <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold">
                         {book.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <Link
                          to={`/books/${book.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="View on Site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/admin/books/${book.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBooks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-lg font-medium text-gray-400">
                  {books.length === 0 ? 'No books found in inventory' : 'No books match your filters'}
                </p>
                {books.length === 0 ? (
                  <Link to="/admin/books/create" className="mt-4 text-blue-600 font-semibold hover:underline">
                    Create your first book
                  </Link>
                ) : (
                  <button 
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setStockFilter('all')
                      setCurrentPage(1)
                    }}
                    className="mt-4 text-blue-600 font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredBooks.length}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

