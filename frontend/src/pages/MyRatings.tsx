import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Star, Edit, Trash2, Book, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function MyRatings() {
  const queryClient = useQueryClient()
  const [editingRating, setEditingRating] = useState<any | null>(null)
  const [formData, setFormData] = useState({ stars: 0, content: '' })

  const { data: ratingsData, isLoading } = useQuery({
    queryKey: ['my-ratings'],
    queryFn: () => api.getMyRatings(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { stars?: number; content?: string } }) =>
      api.updateRating(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] })
      toast.success('Review updated successfully')
      setEditingRating(null)
      setFormData({ stars: 0, content: '' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update review')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRating(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ratings'] })
      toast.success('Review deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review')
    },
  })

  const ratings = ratingsData?.data || []

  const handleEdit = (rating: any) => {
    setEditingRating(rating)
    setFormData({
      stars: rating.stars,
      content: rating.content || '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.stars < 1) {
      toast.error('Please select a rating')
      return
    }

    updateMutation.mutate({
      id: editingRating.id,
      data: {
        stars: formData.stars,
        content: formData.content || undefined,
      },
    })
  }

  const handleDelete = (id: string, bookTitle: string) => {
    if (confirm(`Are you sure you want to delete your review for "${bookTitle}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Reviews</h1>
        <p className="text-gray-600">Manage your book reviews and ratings</p>
      </div>

      {/* Edit Modal */}
      {editingRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, stars: star })}
                      className="focus:outline-none transition"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.stars
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts about this book..."
                  rows={4}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRating(null)
                    setFormData({ stars: 0, content: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Update Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ratings List */}
      {ratings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-500 mb-4">Start by reviewing books you've read!</p>
          <Link
            to="/books"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    to={`/books/${rating.bookId}`}
                    className="flex items-center text-xl font-semibold text-gray-900 hover:text-blue-600 transition mb-2"
                  >
                    <Book className="w-5 h-5 mr-2 text-gray-400" />
                    {rating.book?.title || 'Unknown Book'}
                  </Link>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < rating.stars
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.content && (
                    <p className="text-gray-700 leading-relaxed">{rating.content}</p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(rating)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition"
                    title="Edit review"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rating.id, rating.book?.title || 'this book')}
                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition"
                    title="Delete review"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
