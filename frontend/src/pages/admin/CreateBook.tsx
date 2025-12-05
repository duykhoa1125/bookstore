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
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/admin/books"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Books
      </Link>

      <h1 className="text-4xl font-bold mb-8">Create New Book</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Book Cover Image</label>
            <BookImageUpload
              currentImage={formData.imageUrl}
              onUrlChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />
            <p className="text-xs text-gray-500 mt-2">
              Drag & drop an image or click to upload. You can also paste an image URL below.
            </p>
            <input
              type="url"
              placeholder="Or enter image URL directly..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Publisher *</label>
            <select
              required
              value={formData.publisherId}
              onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Authors * (Select at least one)</label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {authors.length === 0 ? (
                <p className="text-gray-500 text-sm">No authors available</p>
              ) : (
                <div className="space-y-2">
                  {authors.map((author) => (
                    <label key={author.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.authorIds.includes(author.id)}
                        onChange={() => toggleAuthor(author.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{author.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.authorIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {formData.authorIds.length} author(s) selected
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Book'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

