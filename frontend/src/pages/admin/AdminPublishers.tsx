import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Plus, Edit, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPublishers() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPublisher, setEditingPublisher] = useState<{ id: string; name: string } | null>(null)
  const [name, setName] = useState('')

  const { data: publishersData, isLoading } = useQuery({
    queryKey: ['publishers'],
    queryFn: () => api.getPublishers(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => api.createPublisher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] })
      toast.success('Publisher created successfully')
      setShowCreateModal(false)
      setName('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create publisher')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => api.updatePublisher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] })
      toast.success('Publisher updated successfully')
      setShowCreateModal(false)
      setEditingPublisher(null)
      setName('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update publisher')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePublisher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] })
      toast.success('Publisher deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete publisher')
    },
  })

  const publishers = publishersData?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPublisher) {
      updateMutation.mutate({ id: editingPublisher.id, data: { name } })
    } else {
      createMutation.mutate({ name })
    }
  }

  const handleEdit = (publisher: any) => {
    setEditingPublisher({ id: publisher.id, name: publisher.name })
    setName(publisher.name)
    setShowCreateModal(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Manage Publishers</h1>
        <button
          onClick={() => {
            setShowCreateModal(true)
            setEditingPublisher(null)
            setName('')
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Publisher</span>
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingPublisher ? 'Edit Publisher' : 'Create Publisher'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingPublisher(null)
                    setName('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingPublisher ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {publishers.map((publisher) => (
                <tr key={publisher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{publisher.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(publisher)}
                        className="text-blue-600 hover:text-blue-900 p-2"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(publisher.id, publisher.name)}
                        className="text-red-600 hover:text-red-900 p-2"
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
          {publishers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No publishers found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

