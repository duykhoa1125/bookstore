import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Phone, MapPin, AtSign, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'

// Input Field Component extracted
const InputField = ({ 
  name, 
  type, 
  placeholder, 
  icon: Icon, 
  required = false,
  minLength,
  pattern,
  hint,
  autoComplete,
  value,
  onChange,
  focusedField,
  setFocusedField
}: { 
  name: string
  type: string
  placeholder: string
  icon: React.ElementType
  required?: boolean
  minLength?: number
  pattern?: string
  hint?: string
  autoComplete?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  focusedField: string | null
  setFocusedField: (name: string | null) => void
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="space-y-1.5">
      <div className="relative group">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
          focusedField === name ? 'text-slate-800' : 'text-slate-400'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          required={required}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          className={`w-full !pl-14 ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-0 transition-all duration-200 outline-none text-sm font-medium`}
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {hint && (
        <p className="text-xs text-slate-400 pl-1">{hint}</p>
      )}
    </div>
  )
}

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const cleaned = value
        .replace(/[^\d+]/g, '')
        .replace(/(?!^)[+]/g, '')
      setFormData(prev => ({ ...prev, phone: cleaned.slice(0, 16) }))
      return
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      })
      navigate('/')
    } catch {
      // Error is handled by AuthContext
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, title: 'Personal' },
    { id: 2, title: 'Account' },
  ]

  const canProceedToStep2 = formData.fullName.trim() !== ''

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>
        
        {/* Abstract shapes - Clean & Minimal */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-8">
            <Logo variant="auth" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center tracking-tight">Join Inkwell</h1>
          <p className="text-lg text-slate-400 text-center max-w-md font-light leading-relaxed">
            Create an account and start your literary journey today.
          </p>
          
          {/* Benefits */}
          <div className="mt-12 space-y-5">
            {[
              'Free shipping on your first order',
              'Exclusive access to new releases',
              'Personalized book recommendations',
              'Join our reading community',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-4 text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-purple-400" />
                </div>
                <span className="font-medium text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Logo />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Create account
            </h2>
            <p className="text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => step.id === 1 ? setCurrentStep(1) : (canProceedToStep2 && setCurrentStep(2))}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    currentStep === step.id
                      ? 'bg-slate-900 text-white'
                      : currentStep > step.id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                    currentStep > step.id ? 'bg-transparent text-current' : currentStep === step.id ? 'bg-white/20' : 'bg-transparent border border-slate-300'
                  }`}>
                    {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
                  </span>
                  {step.title}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-px mx-2 transition-colors ${
                    currentStep > 1 ? 'bg-slate-900' : 'bg-slate-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Form Container */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              <div className={`space-y-5 transition-all duration-300 ${currentStep === 1 ? 'block' : 'hidden'}`}>
                <InputField
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  icon={User}
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <InputField
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  icon={Phone}
                  pattern="^\+?\d{8,15}$"
                  hint="Digits only, optional leading +, 8-15 digits"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <InputField
                  name="address"
                  type="text"
                  placeholder="Address"
                  icon={MapPin}
                  value={formData.address}
                  onChange={handleChange}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />

                <button
                  type="button"
                  onClick={() => canProceedToStep2 && setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full py-3.5 px-6 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-4"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Step 2: Account Info */}
              <div className={`space-y-5 transition-all duration-300 ${currentStep === 2 ? 'block' : 'hidden'}`}>
                <InputField
                  name="username"
                  type="text"
                  placeholder="Username"
                  icon={AtSign}
                  required
                  minLength={3}
                  hint="At least 3 characters"
                  value={formData.username}
                  onChange={handleChange}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <InputField
                  name="email"
                  type="email"
                  placeholder="Email address"
                  icon={Mail}
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />
                <InputField
                  name="password"
                  type="password"
                  placeholder="Password"
                  icon={Lock}
                  required
                  minLength={6}
                  hint="Minimum 6 characters"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  focusedField={focusedField}
                  setFocusedField={setFocusedField}
                />

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3.5 px-6 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3.5 px-6 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-400">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-slate-900 hover:underline hover:text-blue-600 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-slate-900 hover:underline hover:text-blue-600 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
