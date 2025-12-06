import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'

export default function AdminAuthors() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<{ id: string; name: string } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [name, setName] = useState('')

  const { data: authorsData, isLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: () => api.getAuthors(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => api.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      toast.success('Author created successfully')
      setShowCreateModal(false)
      setName('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create author')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => api.updateAuthor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      toast.success('Author updated successfully')
      setShowCreateModal(false)
      setEditingAuthor(null)
      setName('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update author')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      toast.success('Author deleted successfully')
      setDeleteId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete author')
    },
  })

  const authors = authorsData?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAuthor) {
      updateMutation.mutate({ id: editingAuthor.id, data: { name } })
    } else {
      createMutation.mutate({ name })
    }
  }

  const handleEdit = (author: any) => {
    setEditingAuthor({ id: author.id, name: author.name })
    setName(author.name)
    setShowCreateModal(true)
  }



  return (

    <div className="max-w-[1600px] mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Authors</h1>
          <p className="text-gray-500 mt-1 font-medium">Create, edit, and manage book authors.</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true)
            setEditingAuthor(null)
            setName('')
          }}
          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <div className="bg-white/20 p-1 rounded-lg">
             <Plus className="w-4 h-4" />
          </div>
          <span className="font-semibold">Add Author</span>
        </button>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingAuthor(null)
          setName('')
        }}
        title={editingAuthor ? 'Edit Author' : 'Create Author'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="e.g. J.K. Rowling"
            />
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                setEditingAuthor(null)
                setName('')
              }}
              className="flex-1 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-5 py-2.5 text-sm font-bold rounded-xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50"
            >
              {editingAuthor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Author"
        message="Are you sure you want to delete this author? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20 min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100/50">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mr-4 shadow-sm group-hover:scale-105 transition-transform">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{author.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(author)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(author.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {authors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Users className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-lg font-medium text-gray-400">No authors found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

