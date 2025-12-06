import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { BookImageUpload } from '../../components/BookImageUpload'

export default function CreateBook() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: '',
    publisherId: '',
    categoryId: '',
    authorIds: [] as string[],
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => api.getAuthors(),
  })

  const { data: publishersData } = useQuery({
    queryKey: ['publishers'],
    queryFn: () => api.getPublishers(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success('Book created successfully')
      navigate('/admin/books')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create book'
      const errorDetails = error.response?.data?.errors
      if (errorDetails) {
        const errorMessages = Object.values(errorDetails).flat()
        errorMessages.forEach((msg: any) => toast.error(msg))
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const categories = categoriesData?.data || []
  const authors = authorsData?.data || []
  const publishers = publishersData?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.authorIds.length === 0) {
      toast.error('Please select at least one author')
      return
    }
    createMutation.mutate({
      title: formData.title,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      publisherId: formData.publisherId,
      categoryId: formData.categoryId,
      authorIds: formData.authorIds,
    })
  }

  const toggleAuthor = (authorId: string) => {
    setFormData({
      ...formData,
      authorIds: formData.authorIds.includes(authorId)
        ? formData.authorIds.filter((id) => id !== authorId)
        : [...formData.authorIds, authorId],
    })
  }

  return (
    <div className="max-w-[1000px] mx-auto p-8">
      <Link
        to="/admin/books"
        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-8 group font-medium"
      >
        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md mr-3 transition-all border border-gray-100">
           <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Books
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Book</h1>
        <p className="text-gray-500 mt-1 font-medium">Add a new book to your inventory.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60 p-8 md:p-10">
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm"
              placeholder="Enter book title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Stock *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm resize-y"
              placeholder="Enter book description..."
            />
          </div>

          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Book Cover Image</label>
            <BookImageUpload
              currentImage={formData.imageUrl}
              onUrlChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Drag & drop an image or click to upload.
            </p>
            <div className="mt-3">
               <input
                type="url"
                placeholder="Or paste image URL here..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Publisher *</label>
              <select
                required
                value={formData.publisherId}
                onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm appearance-none"
              >
                <option value="">Select Publisher</option>
                {publishers.map((publisher) => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none shadow-sm appearance-none"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Authors * <span className="text-gray-400 font-normal lowercase">(Select at least one)</span></label>
            <div className="bg-white border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto shadow-sm custom-scrollbar">
              {authors.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No authors available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {authors.map((author) => (
                    <label key={author.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.authorIds.includes(author.id)}
                        onChange={() => toggleAuthor(author.id)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">{author.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.authorIds.length > 0 && (
              <p className="text-xs text-blue-600 mt-2 font-semibold">
                {formData.authorIds.length} author(s) selected
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              className="flex-1 px-6 py-3.5 text-sm font-bold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-6 py-3.5 text-sm font-bold rounded-xl bg-gray-900 text-white hover:bg-black transition-all duration-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Book'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

