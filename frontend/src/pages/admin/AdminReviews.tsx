import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Rating } from '../../types'
import { useState, useMemo } from 'react'
import { Trash2, Star, Search, X, MessageSquare, ThumbsUp, ThumbsDown, Eye, AlertTriangle, Settings, Plus } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'

// Sensitive keywords list (Vietnamese + English)
const SENSITIVE_KEYWORDS = [
  // Vietnamese bad words
  'ngu', 'đần', 'dốt', 'khốn', 'đồ chó', 'mày', 'tao', 'con chó', 'địt', 'đm', 'vcl', 'vl', 'clm', 'đéo', 'lồn', 'cặc', 'buồi', 'đĩ', 'cave', 'điếm',
  // English bad words  
  'fuck', 'shit', 'damn', 'stupid', 'idiot', 'trash', 'garbage', 'suck', 'hate', 'terrible', 'worst', 'scam', 'fake', 'spam'
]

type StatusFilter = 'all' | 'suspicious' | 'sensitive'

// Load custom keywords from localStorage
const loadCustomKeywords = (): string[] => {
  try {
    const saved = localStorage.getItem('admin-sensitive-keywords')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export default function AdminReviews() {
  const qc = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewRating, setViewRating] = useState<Rating | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [starsFilter, setStarsFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-downvoted'>('newest')
  const itemsPerPage = 15

  // Custom keywords management
  const [customKeywords, setCustomKeywords] = useState<string[]>(loadCustomKeywords)
  const [showSettings, setShowSettings] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-ratings'],
    queryFn: () => api.getAllRatings(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRatingAsAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ratings'] })
      setDeleteId(null)
    },
  })

  // All keywords (default + custom)
  const allKeywords = useMemo(() => [...SENSITIVE_KEYWORDS, ...customKeywords], [customKeywords])

  // Add custom keyword
  const addKeyword = () => {
    const keyword = newKeyword.trim().toLowerCase()
    if (keyword && !allKeywords.includes(keyword)) {
      const updated = [...customKeywords, keyword]
      setCustomKeywords(updated)
      localStorage.setItem('admin-sensitive-keywords', JSON.stringify(updated))
      setNewKeyword('')
    }
  }

  // Remove custom keyword
  const removeKeyword = (keyword: string) => {
    const updated = customKeywords.filter(k => k !== keyword)
    setCustomKeywords(updated)
    localStorage.setItem('admin-sensitive-keywords', JSON.stringify(updated))
  }

  // Check if content contains sensitive keywords
  const hasSensitiveContent = (content?: string) => {
    if (!content) return false
    const contentLower = content.toLowerCase()
    return allKeywords.some(keyword => contentLower.includes(keyword))
  }

  // Check if rating is suspicious (more downvotes than upvotes)
  const isSuspicious = (rating: Rating) => {
    const downvotes = rating.downvotes || 0
    const upvotes = rating.upvotes || 0
    return downvotes > upvotes && downvotes >= 2
  }

  // Filter and sort ratings
  const filteredRatings = useMemo(() => {
    const ratingsList = data?.data || []
    let result = [...ratingsList]

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      result = result.filter((rating: Rating) =>
        rating.content?.toLowerCase().includes(searchLower) ||
        rating.user?.fullName?.toLowerCase().includes(searchLower) ||
        rating.user?.email?.toLowerCase().includes(searchLower) ||
        rating.book?.title?.toLowerCase().includes(searchLower)
      )
    }

    // Stars filter
    if (starsFilter !== 'all') {
      result = result.filter((rating: Rating) => rating.stars === starsFilter)
    }

    // Status filter (suspicious / sensitive)
    if (statusFilter === 'suspicious') {
      result = result.filter((rating: Rating) => isSuspicious(rating))
    } else if (statusFilter === 'sensitive') {
      result = result.filter((rating: Rating) => hasSensitiveContent(rating.content))
    }

    // Sort
    result.sort((a: Rating, b: Rating) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'most-downvoted') {
        const aScore = (a.downvotes || 0) - (a.upvotes || 0)
        const bScore = (b.downvotes || 0) - (b.upvotes || 0)
        return bScore - aScore
      }
      return 0
    })

    return result
  }, [data?.data, searchQuery, starsFilter, statusFilter, sortBy, allKeywords])

  // Count suspicious and sensitive reviews for badges
  const suspiciousCount = useMemo(() => {
    const ratingsList = data?.data || []
    return ratingsList.filter((r: Rating) => isSuspicious(r)).length
  }, [data?.data])

  const sensitiveCount = useMemo(() => {
    const ratingsList = data?.data || []
    return ratingsList.filter((r: Rating) => hasSensitiveContent(r.content)).length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data, allKeywords])

  // Pagination
  const totalPages = Math.ceil(filteredRatings.length / itemsPerPage)
  const paginatedRatings = filteredRatings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const renderStars = (stars: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const clearAllFilters = () => {
    setSearchQuery('')
    setStarsFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || starsFilter !== 'all' || statusFilter !== 'all'

  if (isLoading) return <div className="p-6">Loading reviews...</div>
  if (error) return <div className="p-6 text-red-600">Error loading reviews</div>

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Reviews</h1>
        <p className="text-gray-500 mt-1 text-sm">View and moderate customer reviews.</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Row 1: Search (3/4) + Sort (1/4) */}
        <div className="flex gap-3">
          <div className="relative flex-[3]">
            <input
              type="text"
              placeholder="Search by content, user, or book..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-12 h-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer shadow-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-downvoted">↓ Most Downvoted</option>
          </select>
        </div>

        {/* Row 2: Stars Filter + Status Filter + Settings */}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Stars Filter */}
          <div className="bg-white border border-gray-200 p-0.5 rounded-lg flex items-center h-9 shadow-sm">
            {[
              { id: 'all', label: 'All' },
              { id: 1, label: '1★' },
              { id: 2, label: '2★' },
              { id: 3, label: '3★' },
              { id: 4, label: '4★' },
              { id: 5, label: '5★' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setStarsFilter(filter.id as typeof starsFilter); setCurrentPage(1); }}
                className={`px-2 h-full rounded text-xs font-semibold transition-all ${
                  starsFilter === filter.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Status Filter (Suspicious / Sensitive) */}
          <div className="bg-white border border-gray-200 p-0.5 rounded-lg flex items-center h-9 shadow-sm">
            <button
              onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              className={`px-3 h-full rounded text-xs font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => { setStatusFilter('suspicious'); setCurrentPage(1); }}
              className={`px-3 h-full rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'suspicious' ? 'bg-orange-500 text-white' : 'text-orange-600 hover:bg-orange-50'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              Suspicious
              {suspiciousCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  statusFilter === 'suspicious' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                }`}>
                  {suspiciousCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter('sensitive'); setCurrentPage(1); }}
              className={`px-3 h-full rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'sensitive' ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Sensitive
              {sensitiveCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  statusFilter === 'sensitive' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                }`}>
                  {sensitiveCount}
                </span>
              )}
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-sm flex items-center gap-1.5"
            title="Configure sensitive keywords"
          >
            <Settings className="w-3.5 h-3.5" />
            Keywords
          </button>
        </div>
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <div className="mb-3 flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Found <span className="font-semibold text-gray-700">{filteredRatings.length}</span> reviews
          </p>
          <button onClick={clearAllFilters} className="text-red-600 hover:text-red-700 font-medium hover:underline">
            Clear filters
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="w-[20%] px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
              <th className="w-[18%] px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Book</th>
              <th className="w-[8%] px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stars</th>
              <th className="w-[26%] px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Content</th>
              <th className="w-[10%] px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Votes</th>
              <th className="w-[8%] px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="w-[10%] px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedRatings.map((rating: Rating) => {
              const isRatingSuspicious = isSuspicious(rating)
              const hasViolation = hasSensitiveContent(rating.content)
              
              return (
                <tr key={rating.id} className={`hover:bg-blue-50/50 transition-colors ${hasViolation ? 'bg-red-50/30' : isRatingSuspicious ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                        {rating.user?.avatar ? (
                          <img src={rating.user.avatar} alt={rating.user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs">
                            {rating.user?.fullName?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{rating.user?.fullName || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 truncate" title={rating.book?.title}>
                      {rating.book?.title || 'Unknown Book'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {renderStars(rating.stars)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 truncate" title={rating.content || ''}>
                      {rating.content || <span className="text-gray-400 italic">No content</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-0.5 text-green-600">
                        <ThumbsUp className="w-3 h-3" />
                        {rating.upvotes || 0}
                      </span>
                      <span className="flex items-center gap-0.5 text-red-500">
                        <ThumbsDown className="w-3 h-3" />
                        {rating.downvotes || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {hasViolation ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Sensitive
                      </span>
                    ) : isRatingSuspicious ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                        <ThumbsDown className="w-2.5 h-2.5" />
                        Suspicious
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setViewRating(rating)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(rating.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {paginatedRatings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No reviews found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredRatings.length}
            />
          </div>
        )}
      </div>

      {/* View Rating Modal */}
      <Modal
        isOpen={!!viewRating}
        onClose={() => setViewRating(null)}
        title="Review Details"
      >
        {viewRating && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                {viewRating.user?.avatar ? (
                  <img src={viewRating.user.avatar} alt={viewRating.user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                    {viewRating.user?.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{viewRating.user?.fullName || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{viewRating.user?.email}</p>
              </div>
              {/* Status Badge */}
              {hasSensitiveContent(viewRating.content) ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3" />
                  Sensitive Content
                </span>
              ) : isSuspicious(viewRating) ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                  <ThumbsDown className="w-3 h-3" />
                  Suspicious
                </span>
              ) : null}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Book</p>
              <p className="text-gray-900 text-sm">{viewRating.book?.title || 'Unknown'}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Rating</p>
              {renderStars(viewRating.stars)}
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Content</p>
              <p className={`text-gray-700 bg-gray-50 p-3 rounded-lg text-sm ${hasSensitiveContent(viewRating.content) ? 'border-2 border-red-200 bg-red-50' : ''}`}>
                {viewRating.content || <span className="text-gray-400 italic">No content provided</span>}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Upvotes</p>
                <p className="text-green-600 font-semibold text-sm flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {viewRating.upvotes || 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Downvotes</p>
                <p className="text-red-500 font-semibold text-sm flex items-center gap-1">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {viewRating.downvotes || 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Date</p>
                <p className="text-gray-700 text-sm">
                  {new Date(viewRating.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setViewRating(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => { setDeleteId(viewRating.id); setViewRating(null); }}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete Review
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete Review"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
            />

      {/* Settings Modal for Custom Keywords */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Sensitive Keywords Settings"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Add custom keywords to detect sensitive content in reviews.</p>
          
          {/* Add new keyword */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter new keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={addKeyword}
              disabled={!newKeyword.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Custom keywords list */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Custom Keywords ({customKeywords.length})</p>
            {customKeywords.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No custom keywords added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {customKeywords.map((keyword) => (
                  <span key={keyword} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                    {keyword}
                    <button onClick={() => removeKeyword(keyword)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Default keywords (read-only) */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Default Keywords ({SENSITIVE_KEYWORDS.length})</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {SENSITIVE_KEYWORDS.map((keyword) => (
                <span key={keyword} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-black"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
