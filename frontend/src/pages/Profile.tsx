import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Calendar, Phone, MapPin, Briefcase, Edit2, Save, X, User as UserIcon } from 'lucide-react'
import { AvatarUpload } from '../components/AvatarUpload'

export default function Profile() {
  const { user, updateProfile, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)

  if (!user) {
    return null
  }

  const startEditing = () => {
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      address: user.address || '',
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      fullName: '',
      phone: '',
      address: '',
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch {
      // Error handled by context
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUploadSuccess = (newAvatarUrl: string) => {
    // Update user in context with new avatar
    if (setUser) {
      setUser((prev) => prev ? { ...prev, avatar: newAvatarUrl } : null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="mr-4">
                <AvatarUpload
                  currentAvatar={user.avatar}
                  onUploadSuccess={handleAvatarUploadSuccess}
                  size="lg"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{user.fullName}</h2>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{user.phone || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{user.address || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold">{user.role}</p>
                </div>
              </div>

              {user.position && (
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-semibold">{user.position}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

