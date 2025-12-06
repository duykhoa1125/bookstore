
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Plus, Edit, Trash2, BookOpen, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AdminBooks() {
  const queryClient = useQueryClient()

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => api.getBooks(),
  })



  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success('Book deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete book')
    },
  })

  const books = booksData?.data || []

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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100/50">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                           {book.imageUrl ? (
                            <img
                              src={book.imageUrl}
                              alt={book.title}
                              className="w-14 h-20 object-cover rounded-lg shadow-md border border-white"
                            />
                          ) : (
                            <div className="w-14 h-20 bg-gray-100 rounded-lg flex items-center justify-center shadow-inner">
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">{book.title}</div>
                          {book.authors && book.authors.length > 0 && (
                            <div className="text-xs text-gray-500 font-medium">
                              {book.authors.map((a) => a.author.name).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                      ${book.price.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        book.stock > 10 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : book.stock > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {book.stock} instock
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold">
                         {book.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          to={`/books/${book.id}`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="View on Site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/books/${book.id}/edit`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {books.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-lg font-medium text-gray-400">No books found in inventory</p>
                <Link to="/admin/books/create" className="mt-4 text-blue-600 font-semibold hover:underline">
                  Create your first book
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

