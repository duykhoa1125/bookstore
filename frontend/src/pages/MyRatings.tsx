import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Star, Edit2, Trash2, BookOpen, MessageSquare, X } from 'lucide-react'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Reviews</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your book reviews and ratings</p>
        </div>

        {/* Edit Modal */}
        {editingRating && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => {
                  setEditingRating(null)
                  setFormData({ stars: 0, content: '' })
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Review</h2>
              <p className="text-gray-500 text-sm mb-6">Update your rating and thoughts</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, stars: star })}
                        className="group focus:outline-none transition-transform active:scale-95"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors duration-200 ${
                            star <= formData.stars
                              ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                              : 'text-gray-200 group-hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Review</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-700 min-h-[120px] resize-none"
                    placeholder="Share your thoughts about this book..."
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRating(null)
                      setFormData({ stars: 0, content: '' })
                    }}
                    className="flex-1 px-5 py-2.5 font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-5 py-2.5 font-bold text-white bg-gray-900 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Update Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ratings List */}
        {ratings.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't written any reviews yet. Share your thoughts on books you've read!</p>
            <Link
              to="/books"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {ratings.map((rating) => (
              <div key={rating.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex-1">
                    <Link
                      to={`/books/${rating.bookId}`}
                      className="inline-flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-3 group/link"
                    >
                      <BookOpen className="w-5 h-5 mr-3 text-gray-400 group-hover/link:text-blue-600 transition-colors" />
                      {rating.book?.title || 'Unknown Book'}
                    </Link>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.stars
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {new Date(rating.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {rating.content && (
                      <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50">
                        <p className="text-gray-600 leading-relaxed italic">"{rating.content}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(rating)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      title="Edit review"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rating.id, rating.book?.title || 'this book')}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                      title="Delete review"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
