import { useState } from 'react'
import { User, Phone, Mail, MapPin, Bell, Leaf, Star, Trash2, Settings, LogOut, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const KARNATAKA_DISTRICTS = [
  'Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar',
  'Chamarajanagar','Chikkaballapura','Chikkamagaluru','Chitradurga','Dakshina Kannada',
  'Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar',
  'Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru',
  'Udupi','Uttara Kannada','Vijayapura','Yadgir','Vijayanagara',
]

const SAMPLE_SAVED_CROPS = [
  { id: 1, name: 'Tomato', emoji: '🍅', currentPrice: 1850, msp: false, change: +14.2 },
  { id: 2, name: 'Ragi', emoji: '🌾', currentPrice: 3920, msp: true, msp_price: 3846, change: +5.7 },
  { id: 7, name: 'Tur Dal', emoji: '🫘', currentPrice: 7650, msp: true, msp_price: 7550, change: -1.4 },
]

const SAMPLE_NOTIFICATIONS = [
  { id: 1, type: 'price', message: 'Tomato price crossed ₹2000 in Kolar APMC', time: '2 hours ago', read: false },
  { id: 2, type: 'scheme', message: 'New PM-KISAN installment disbursed — check your bank account', time: '1 day ago', read: false },
  { id: 3, type: 'weather', message: 'Heavy rain alert for Hassan district — delay harvest', time: '2 days ago', read: true },
  { id: 4, type: 'price', message: 'Ragi crossed MSP — good time to sell at government procurement', time: '3 days ago', read: true },
]

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'saved', label: 'Saved Crops', icon: Star },
  { id: 'alerts', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function ProfilePage() {
  const { user, logout, setLang, lang } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({
    full_name: user?.full_name || 'Ramaiah Gowda',
    phone: user?.phone || '9876543210',
    email: user?.email || '',
    district: user?.district || 'Kolar',
  })
  const [savedCrops, setSavedCrops] = useState(SAMPLE_SAVED_CROPS)
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Profile updated successfully')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const removeSaved = (id) => {
    setSavedCrops(prev => prev.filter(c => c.id !== id))
    toast.success('Crop removed from saved list')
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const displayName = form.full_name || user?.full_name || 'Farmer'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile hero */}
      <div className="ap-card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-forest-900 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-forest-900">{displayName}</h1>
            <p className="text-gray-500 text-sm">{form.phone} {form.email ? `• ${form.email}` : ''}</p>
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {form.district} District, Karnataka
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-400 mb-1">Saved Crops</div>
            <div className="text-2xl font-bold text-forest-900">{savedCrops.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-forest-700 text-forest-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'alerts' && unreadCount > 0 && (
                <span className="w-5 h-5 bg-gold-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="ap-card p-6">
          <h2 className="font-bold text-forest-900 mb-5 text-lg">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="ap-input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="ap-input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email (optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="ap-input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  className="ap-input pl-9 appearance-none"
                >
                  {KARNATAKA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-6 py-2.5 flex items-center gap-2"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Saved crops tab */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedCrops.length === 0 ? (
            <div className="ap-card p-12 text-center text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No saved crops yet</p>
              <p className="text-sm mb-4">Save crops to track their prices and get alerts</p>
              <Link to="/crops" className="btn-primary px-6 py-2.5">Browse Crops</Link>
            </div>
          ) : (
            savedCrops.map(crop => (
              <div key={crop.id} className="ap-card p-5 flex items-center gap-4">
                <div className="text-3xl">{crop.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-forest-900">{crop.name}</span>
                    {crop.msp && <span className="msp-badge"><ShieldCheck className="w-3 h-3" /> MSP</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-forest-900 price-number">₹{crop.currentPrice.toLocaleString()}</span>
                    <span className={`font-semibold text-xs ${crop.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {crop.change > 0 ? '+' : ''}{crop.change}%
                    </span>
                    {crop.msp && (
                      <span className={`text-xs ${crop.currentPrice >= crop.msp_price ? 'text-green-600' : 'text-red-500'}`}>
                        MSP: ₹{crop.msp_price?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/crops/${crop.id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-forest-700 border border-forest-200 rounded-lg hover:bg-forest-50 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => removeSaved(crop.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
          <Link to="/crops" className="block ap-card p-4 text-center text-sm text-forest-600 font-semibold hover:bg-forest-50 transition-colors border-2 border-dashed border-forest-200">
            + Add more crops to track
          </Link>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                className="text-xs text-forest-600 font-semibold hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`ap-card p-4 cursor-pointer transition-all ${!n.read ? 'border-l-4 border-forest-600' : 'opacity-70'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">
                  {n.type === 'price' ? '💰' : n.type === 'scheme' ? '🏛️' : '🌧️'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-charcoal' : 'text-gray-500'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="w-2.5 h-2.5 bg-forest-600 rounded-full mt-1 flex-shrink-0" />}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="ap-card p-12 text-center text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          <div className="ap-card p-6">
            <h2 className="font-bold text-forest-900 mb-4">App Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-semibold text-sm text-charcoal">Language</div>
                  <div className="text-xs text-gray-400">Interface language</div>
                </div>
                <div className="flex gap-2">
                  {[['en', 'English'], ['kn', 'ಕನ್ನಡ']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setLang(val)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${lang === val ? 'bg-forest-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-semibold text-sm text-charcoal">Price Alerts</div>
                  <div className="text-xs text-gray-400">Get notified when saved crop prices change ±10%</div>
                </div>
                <div className="w-11 h-6 bg-forest-600 rounded-full flex items-center px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-semibold text-sm text-charcoal">Weather Alerts</div>
                  <div className="text-xs text-gray-400">Receive crop-specific weather warnings for your district</div>
                </div>
                <div className="w-11 h-6 bg-forest-600 rounded-full flex items-center px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto shadow" />
                </div>
              </div>
            </div>
          </div>

          <div className="ap-card p-6">
            <h2 className="font-bold text-forest-900 mb-4">Account</h2>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-red-600 hover:text-red-700 font-semibold text-sm p-3 rounded-xl hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" /> Sign out of AgriPrice
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
