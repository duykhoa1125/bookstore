import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { User } from '../../types'
import { useState } from 'react'
import { Edit, Trash2, User as UserIcon } from 'lucide-react'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'

export default function AdminUsers() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<User>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.getUsers(),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: Partial<User> }) => api.updateUser(vars.id, vars.data),
    onSuccess: () => {
      setSelected(null)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setDeleteId(null)
    },
  })

  const startEdit = (u: User) => {
    setSelected(u)
    setForm({ fullName: u.fullName, email: u.email, phone: u.phone, address: u.address, position: u.position, role: u.role })
  }

  const submitEdit = () => {
    if (!selected) return
    updateMutation.mutate({ id: selected.id, data: form })
  }

  if (isLoading) return <div className="p-6">Loading users...</div>
  if (error) return <div className="p-6 text-red-600">Error loading users</div>

  const users = data?.data || []

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Users</h1>
        <p className="text-gray-500 mt-1 font-medium">View, edit, and manage user accounts and permissions.</p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50 bg-white/30">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                        {u.avatar ? (
                          <img 
                            src={u.avatar} 
                            alt={u.fullName || 'User'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                            {u.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{u.fullName || 'No name'}</div>
                        <div className="text-xs text-gray-400">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {u.email}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${
                      u.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => startEdit(u)} 
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteId(u.id)} 
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-500 font-medium">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Edit User"
      >
        <div className="space-y-6">
          {/* User Avatar Preview */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-gray-200 shadow-sm">
              {selected?.avatar ? (
                <img 
                  src={selected.avatar} 
                  alt={selected.fullName || 'User'} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
                  {selected?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-8 h-8" />}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{selected?.fullName || 'No name'}</p>
              <p className="text-sm text-gray-500">@{selected?.username} • {selected?.email}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">Update user details and permissions.</p>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <input 
                value={form.fullName || ''} 
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input 
                value={form.email || ''} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
              <input 
                value={form.phone || ''} 
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
              <select 
                value={form.role || 'USER'} 
                onChange={e => setForm(f => ({ ...f, role: e.target.value as 'USER' | 'ADMIN' }))}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
              <input 
                value={form.address || ''} 
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Position</label>
              <input 
                value={form.position || ''} 
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))} 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setSelected(null)} 
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={submitEdit} 
              disabled={updateMutation.isPending} 
              className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gray-900 text-white hover:bg-black transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
