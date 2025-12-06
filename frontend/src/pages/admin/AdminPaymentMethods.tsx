import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'

export default function AdminPaymentMethods() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<{ id: string; name: string } | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: methodsData, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.getPaymentMethods(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; isActive?: boolean }) =>
      api.createPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success('Payment method created successfully')
      setShowCreateModal(false)
      setFormData({ name: '' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment method')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success('Payment method updated successfully')
      setEditingMethod(null)
      setFormData({ name: '' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment method')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success('Payment method deleted successfully')
      setDeleteId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete payment method')
    },
  })

  const methods = methodsData?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: formData.name,
    }

    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (method: any) => {
    setEditingMethod({ 
      id: method.id, 
      name: method.name, 
    })
    setFormData({
      name: method.name,
    })
    setShowCreateModal(true)
  }





  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payment Methods</h1>
          <p className="text-gray-500 mt-1 font-medium">Create and manage payment options.</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true)
            setEditingMethod(null)
            setFormData({ name: '' })
          }}
          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <div className="bg-white/20 p-1 rounded-lg">
             <Plus className="w-4 h-4" />
          </div>
          <span className="font-semibold">Add Method</span>
        </button>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingMethod(null)
          setFormData({ name: '' })
        }}
        title={editingMethod ? 'Edit Payment Method' : 'Create Payment Method'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="e.g., Credit Card, PayPal"
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false)
                setEditingMethod(null)
                setFormData({ name: '' })
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
              {editingMethod ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
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
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 bg-white/30">
                {methods.map((method) => (
                  <tr key={method.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                         <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mr-4 shadow-sm group-hover:scale-105 transition-transform">
                          <CreditCard className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{method.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(method)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(method.id)}
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
            {methods.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <CreditCard className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-lg font-medium text-gray-400">No payment methods found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
