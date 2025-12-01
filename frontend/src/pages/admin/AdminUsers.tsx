import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { User } from '../../types'
import { useState } from 'react'

export default function AdminUsers() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<User>>({})

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Manage Users</h1>
        <p className="text-gray-600 mt-2">View, edit, and delete users</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">{u.fullName}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2"><span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">{u.role}</span></td>
                <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button onClick={() => startEdit(u)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                  <button onClick={() => deleteMutation.mutate(u.id)} className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700" disabled={deleteMutation.isPending}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Edit User</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input value={form.fullName || ''} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={form.role || 'USER'} disabled className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                <input value={form.position || ''} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={submitEdit} disabled={updateMutation.isPending} className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
