import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, Phone, Mail } from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import { authApi } from '../utils/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.login({ identifier, password })
      const { user, access_token, refresh_token } = res.data
      login(user, access_token, refresh_token)
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 w-fit">
            <div className="w-10 h-10 bg-forest-900 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <div className="font-bold text-forest-900 text-xl">AgriPrice</div>
              <div className="text-xs text-gray-400 kannada">ಕೃಷಿ ಬೆಲೆ</div>
            </div>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-forest-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to your farmer account</p>
            <p className="text-xs text-gray-400 kannada mt-1">ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier */}
            <div>
              <label className="block text-sm font-semibold text-forest-800 mb-1.5">
                Phone or Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {identifier.includes('@') ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone or email"
                  className="ap-input pl-10"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-forest-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="ap-input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500">
              New farmer?{' '}
              <Link to="/register" className="text-forest-700 font-semibold hover:text-forest-900 transition-colors">
                Create free account
              </Link>
            </p>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-xl">
            <p className="text-xs text-gold-700 font-semibold mb-1">Demo Account</p>
            <p className="text-xs text-gold-600">Phone: 9999999999 • Password: farmer123</p>
          </div>
        </div>
      </div>

      {/* Right: Visual panel */}
      <div className="hidden lg:flex flex-1 bg-field-gradient items-center justify-center p-12">
        <div className="text-white text-center max-w-md">
          <div className="text-8xl mb-8">🌾</div>
          <h2 className="text-3xl font-bold mb-4">Sell at the right price.</h2>
          <p className="text-xl text-forest-200 mb-3 kannada">ಸರಿಯಾದ ಬೆಲೆಗೆ ಮಾರಿ.</p>
          <p className="text-forest-100 leading-relaxed">
            Get AI-powered recommendations for when and where to sell your crops across Karnataka's APMC markets.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['200+', 'Markets'], ['60+', 'Crops'], ['31', 'Districts']].map(([num, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-gold-400">{num}</div>
                <div className="text-xs text-forest-200 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
