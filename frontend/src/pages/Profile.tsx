import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Calendar, Phone, MapPin, Briefcase, Edit2, Save, X, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { AvatarUpload } from '../components/AvatarUpload'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateProfile, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Password changed successfully')
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleAvatarUploadSuccess = (newAvatarUrl: string) => {
    if (setUser) {
      setUser((prev) => {
        if (!prev) return null
        const updatedUser = { ...prev, avatar: newAvatarUrl }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return updatedUser
      })
    }
  }

  const isOAuthAccount = !user.password && user.googleId

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-12">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12 relative">
              <div className="relative group">
                <AvatarUpload
                  currentAvatar={user.avatar}
                  onUploadSuccess={handleAvatarUploadSuccess}
                  size="lg"
                />
              </div>
              
              <div className="text-center sm:text-left pt-2 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.fullName || user.username}</h1>
                <p className="text-gray-500 font-medium mt-1">@{user.username}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {user.role}
                  </span>
                  {user.createdAt && (
                     <span className="text-xs text-gray-400">Member since {new Date(user.createdAt).getFullYear()}</span>
                  )}
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-50"
                  aria-label="Edit Profile"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 my-8"></div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm py-3 px-4 bg-gray-50 hover:bg-white transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm py-3 px-4 bg-gray-50 hover:bg-white transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm py-3 px-4 bg-gray-50 hover:bg-white transition-colors"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="flex items-start group">
                  <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-base text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-base text-gray-900 font-medium">{user.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="mt-1 text-base text-gray-900 font-medium">{user.address || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="mt-1 text-base text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {user.position && (
                  <div className="flex items-start group">
                    <div className="p-3 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Position</p>
                      <p className="mt-1 text-base text-gray-900 font-medium">{user.position}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gray-900">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
            </div>

            {isOAuthAccount ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  You signed in with Google. Password management is not available for OAuth accounts.
                </p>
              </div>
            ) : isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
                {/* Current Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="block w-full !pl-14 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-gray-900 focus:ring-0 transition-all outline-none"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="block w-full !pl-14 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-gray-900 focus:ring-0 transition-all outline-none"
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="block w-full !pl-14 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-gray-900 focus:ring-0 transition-all outline-none"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {passwordData.confirmPassword && (
                  <p className={`text-sm ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">Keep your account secure by using a strong password.</p>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="inline-flex items-center px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
