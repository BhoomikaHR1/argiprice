import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, User, Phone, Mail, MapPin, Globe } from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import { authApi } from '../utils/api'
import toast from 'react-hot-toast'

const KARNATAKA_DISTRICTS = [
  { id: 1, name: 'Bagalkot' }, { id: 2, name: 'Ballari' }, { id: 3, name: 'Belagavi' },
  { id: 4, name: 'Bengaluru Rural' }, { id: 5, name: 'Bengaluru Urban' }, { id: 6, name: 'Bidar' },
  { id: 7, name: 'Chamarajanagar' }, { id: 8, name: 'Chikkaballapura' }, { id: 9, name: 'Chikkamagaluru' },
  { id: 10, name: 'Chitradurga' }, { id: 11, name: 'Dakshina Kannada' }, { id: 12, name: 'Davanagere' },
  { id: 13, name: 'Dharwad' }, { id: 14, name: 'Gadag' }, { id: 15, name: 'Hassan' },
  { id: 16, name: 'Haveri' }, { id: 17, name: 'Kalaburagi' }, { id: 18, name: 'Kodagu' },
  { id: 19, name: 'Kolar' }, { id: 20, name: 'Koppal' }, { id: 21, name: 'Mandya' },
  { id: 22, name: 'Mysuru' }, { id: 23, name: 'Raichur' }, { id: 24, name: 'Ramanagara' },
  { id: 25, name: 'Shivamogga' }, { id: 26, name: 'Tumakuru' }, { id: 27, name: 'Udupi' },
  { id: 28, name: 'Uttara Kannada' }, { id: 29, name: 'Vijayapura' }, { id: 30, name: 'Yadgir' },
  { id: 31, name: 'Vijayanagara' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', password: '', confirm_password: '',
    district_id: '', preferred_lang: 'en',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 2-step form
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) return toast.error('Please enter your full name')
    if (!form.phone && !form.email) return toast.error('Enter phone number or email')
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Enter a valid 10-digit mobile number')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirm_password) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone || null,
        email: form.email || null,
        password: form.password,
        preferred_lang: form.preferred_lang,
        district_id: form.district_id ? parseInt(form.district_id) : null,
      }
      const res = await authApi.register(payload)
      const { user, access_token, refresh_token } = res.data
      login(user, access_token, refresh_token)
      toast.success(`Welcome to AgriPrice, ${user.full_name.split(' ')[0]}! 🌾`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left: Visual panel */}
      <div className="hidden lg:flex flex-1 bg-field-gradient items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="text-7xl mb-6">🌱</div>
          <h2 className="text-3xl font-bold mb-4">Join 10,000+ Karnataka Farmers</h2>
          <p className="text-forest-100 leading-relaxed mb-8">
            Register once. Get AI-powered price intelligence for all your crops, all year round.
          </p>
          <div className="space-y-4">
            {[
              { icon: '✓', text: 'Daily prices from 200+ APMC mandis' },
              { icon: '✓', text: 'AI recommendations in Kannada & English' },
              { icon: '✓', text: 'Government scheme alerts for your district' },
              { icon: '✓', text: 'Price alerts for your saved crops' },
              { icon: '✓', text: '100% free for all Karnataka farmers' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-forest-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
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

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-forest-900 mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Free for all Karnataka farmers</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 1 ? 'text-forest-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-forest-900 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              Personal Info
            </div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-forest-700' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 2 ? 'text-forest-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-forest-900 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              Security
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forest-800 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    placeholder="e.g. Ramaiah Gowda"
                    className="ap-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-800 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="10-digit mobile number"
                    className="ap-input pl-10"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-800 mb-1.5">Email (optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="your@email.com"
                    className="ap-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-800 mb-1.5">Your District</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.district_id}
                    onChange={e => update('district_id', e.target.value)}
                    className="ap-input pl-10 appearance-none"
                  >
                    <option value="">Select Karnataka district</option>
                    {KARNATAKA_DISTRICTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-800 mb-1.5">Preferred Language</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'en', label: 'English', flag: '🇬🇧' },
                    { value: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('preferred_lang', opt.value)}
                      className={`p-3 rounded-lg border-2 font-medium text-sm transition-all flex items-center gap-2 ${
                        form.preferred_lang === opt.value
                          ? 'border-forest-700 bg-forest-50 text-forest-800'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span>{opt.flag}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-4 text-base mt-2">
                Continue →
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-forest-700 font-semibold hover:text-forest-900">Sign in</Link>
              </p>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-forest-50 rounded-xl mb-2">
                <p className="text-sm text-forest-700 font-semibold">{form.full_name}</p>
                <p className="text-xs text-gray-500">{form.phone || form.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-800 mb-1.5">Create Password *</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="At least 6 characters"
                    className="ap-input pr-10"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-800 mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={e => update('confirm_password', e.target.value)}
                  placeholder="Re-enter password"
                  className="ap-input"
                />
                {form.confirm_password && form.password !== form.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-4">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="btn-primary flex-1 py-4 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Create Account 🌾'
                  }
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 leading-relaxed">
                By registering, you agree to use AgriPrice for legitimate farming purposes.
                Your data is kept private and never sold.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
