import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, MapPin, Brain, Cloud, Bell, Star,
  ArrowRight, RefreshCw, ChevronRight, Leaf, BarChart3, ShieldCheck
} from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data — will be replaced by API calls in production
const MOCK_PRICES = [
  { crop: 'Tomato', crop_kn: 'ಟೊಮೇಟೊ', emoji: '🍅', price: 1850, prev: 1620, change: 14.2, msp: false, market: 'Kolar APMC' },
  { crop: 'Ragi', crop_kn: 'ರಾಗಿ', emoji: '🌾', price: 3920, prev: 3710, change: 5.7, msp: true, market: 'Hassan APMC' },
  { crop: 'Onion', crop_kn: 'ಈರುಳ್ಳಿ', emoji: '🧅', price: 2200, prev: 2350, change: -6.4, msp: false, market: 'Belagavi APMC' },
  { crop: 'Tur Dal', crop_kn: 'ತೊಗರಿ', emoji: '🫘', price: 7650, prev: 7760, change: -1.4, msp: true, market: 'Kalaburagi APMC' },
]

const PRICE_HISTORY = [
  { date: 'Jun 20', tomato: 1200, ragi: 3600 },
  { date: 'Jun 21', tomato: 1350, ragi: 3680 },
  { date: 'Jun 22', tomato: 1500, ragi: 3720 },
  { date: 'Jun 23', tomato: 1420, ragi: 3690 },
  { date: 'Jun 24', tomato: 1650, ragi: 3750 },
  { date: 'Jun 25', tomato: 1780, ragi: 3820 },
  { date: 'Today', tomato: 1850, ragi: 3920 },
]

const NOTIFICATIONS = [
  { id: 1, type: 'price', icon: '📈', title: 'Tomato price up 14%', body: 'Tomato at Kolar APMC: ₹1,850/q — highest this week', time: '2h ago', unread: true },
  { id: 2, type: 'weather', icon: '🌧️', title: 'Rain alert — Hassan District', body: 'Heavy rain expected Thursday-Friday. Harvest before Wednesday.', time: '5h ago', unread: true },
  { id: 3, type: 'scheme', icon: '📋', title: 'PM-KISAN installment due', body: 'Next PM-KISAN installment disbursement in 12 days.', time: '1d ago', unread: false },
]

const NEARBY_MARKETS = [
  { name: 'Kolar APMC', distance: 8, top_crop: 'Tomato', top_price: 1850, arrivals: '42 tonnes' },
  { name: 'Bangarpet APMC', distance: 23, top_crop: 'Ragi', top_price: 3890, arrivals: '18 tonnes' },
  { name: 'Chintamani APMC', distance: 31, top_crop: 'Groundnut', top_price: 6750, arrivals: '27 tonnes' },
]

function WelcomeBanner({ user }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const greeting_kn = hour < 12 ? 'ಶುಭೋದಯ' : hour < 17 ? 'ಶುಭ ಮಧ್ಯಾಹ್ನ' : 'ಶುಭ ಸಂಜೆ'

  return (
    <div className="bg-field-gradient rounded-2xl p-6 text-white mb-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-forest-200 text-sm">{greeting_kn} •  {greeting}</p>
          <h1 className="text-2xl font-bold mt-1">{user?.full_name || 'Farmer'} 👋</h1>
          <p className="text-forest-100 text-sm mt-1">Today is a good day to check your crop prices.</p>
        </div>
        <div className="text-right text-sm text-forest-200">
          <div>{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</div>
          <div className="font-semibold text-white">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <Link to="/live-prices" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <TrendingUp className="w-4 h-4" /> Live Prices
        </Link>
        <Link to="/ai-prediction" className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-md">
          <Brain className="w-4 h-4" /> AI Recommendation
        </Link>
        <Link to="/apmc-markets" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <MapPin className="w-4 h-4" /> Find APMC
        </Link>
      </div>
    </div>
  )
}

function PriceCard({ item }) {
  const isUp = item.change > 0
  return (
    <div className="ap-card-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-2xl">{item.emoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal">{item.crop}</span>
              {item.msp && <span className="msp-badge">MSP</span>}
            </div>
            <div className="text-xs text-gray-400 kannada">{item.crop_kn}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {item.market}
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(item.change)}%
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-forest-900 price-number">₹{item.price.toLocaleString()}</div>
          <div className="text-xs text-gray-400">per quintal</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 line-through price-number">₹{item.prev.toLocaleString()}</div>
          <div className="text-xs text-gray-400">yesterday</div>
        </div>
      </div>
    </div>
  )
}

function AIRecommendationCard() {
  return (
    <div className="ap-card p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-forest-700" />
          <span className="font-bold text-forest-900">AI Recommendation</span>
        </div>
        <span className="text-xs text-gray-400">Updated 2h ago</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-2xl">🍅</div>
        <div>
          <div className="font-bold text-charcoal text-lg">Tomato</div>
          <div className="text-sm text-gray-500">Kolar APMC • Today's pick</div>
        </div>
        <div className="ml-auto">
          <div className="bg-green-100 text-green-800 border border-green-200 text-sm font-bold px-3 py-1 rounded-full">
            ✓ SELL TODAY
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Today</div>
          <div className="font-bold text-forest-900 price-number">₹1,850</div>
        </div>
        <div className="bg-gold-50 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">AI: Tomorrow</div>
          <div className="font-bold text-gold-600 price-number">₹1,780</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Confidence</div>
          <div className="font-bold text-green-700">82%</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Prices are at a 2-week high. Rain forecast for Thursday may increase supply and drop prices.
        Recommended: sell today at Kolar APMC for maximum net profit.
      </p>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">Net profit estimate: </span>
          <span className="font-bold text-green-700 price-number">₹4,760/quintal</span>
        </div>
        <Link to="/ai-prediction" className="flex items-center gap-1 text-forest-700 text-sm font-semibold hover:text-forest-900">
          Full Report <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

function WeatherCard() {
  return (
    <div className="ap-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-sky-600" />
          <span className="font-bold text-forest-900">Your District Weather</span>
        </div>
        <Link to="/weather" className="text-xs text-forest-600 hover:text-forest-800 flex items-center gap-1">
          Details <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">⛅</div>
        <div>
          <div className="text-3xl font-bold text-charcoal">28°C</div>
          <div className="text-gray-500 text-sm">Partly Cloudy • Kolar District</div>
          <div className="text-xs text-gray-400">Humidity: 65% • Wind: 12 km/h</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { day: 'Today', icon: '⛅', temp: '28°', rain: '10%' },
          { day: 'Tue', icon: '☀️', temp: '31°', rain: '5%' },
          { day: 'Wed', icon: '🌤️', temp: '29°', rain: '15%' },
          { day: 'Thu', icon: '🌧️', temp: '24°', rain: '80%' },
        ].map(d => (
          <div key={d.day} className="bg-sky-50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-500 font-medium">{d.day}</div>
            <div className="text-lg my-1">{d.icon}</div>
            <div className="text-sm font-bold text-charcoal">{d.temp}</div>
            <div className="text-xs text-blue-500">{d.rain}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700 font-semibold">⚠️ Rain alert Thursday — Consider harvesting Wednesday</p>
      </div>
    </div>
  )
}

function NearbyMarketsCard() {
  return (
    <div className="ap-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-forest-700" />
          <span className="font-bold text-forest-900">Nearest APMC Markets</span>
        </div>
        <Link to="/apmc-markets" className="text-xs text-forest-600 hover:text-forest-800 flex items-center gap-1">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {NEARBY_MARKETS.map((m, i) => (
          <div key={m.name} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-forest-50 border border-forest-200' : 'bg-gray-50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-forest-900 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-charcoal text-sm">{m.name}</div>
              <div className="text-xs text-gray-400">{m.distance} km • {m.arrivals} today</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-forest-900 price-number">₹{m.top_price.toLocaleString()}</div>
              <div className="text-xs text-gray-400">{m.top_crop}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceChartCard() {
  return (
    <div className="ap-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-forest-700" />
          <span className="font-bold text-forest-900">7-Day Price Trend</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-forest-600 rounded inline-block"></span> Tomato</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-gold-500 rounded inline-block"></span> Ragi</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={PRICE_HISTORY}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
            formatter={(v, name) => [`₹${v.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Line type="monotone" dataKey="tomato" stroke="#1B4332" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="ragi" stroke="#D4A017" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function NotificationsCard() {
  return (
    <div className="ap-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-forest-700" />
          <span className="font-bold text-forest-900">Notifications</span>
          <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
        </div>
        <button className="text-xs text-forest-600 hover:text-forest-800">Mark all read</button>
      </div>
      <div className="space-y-3">
        {NOTIFICATIONS.map(n => (
          <div key={n.id} className={`flex gap-3 p-3 rounded-xl transition-colors ${n.unread ? 'bg-forest-50 border border-forest-100' : 'bg-gray-50'}`}>
            <div className="text-xl flex-shrink-0">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-charcoal text-sm">{n.title}</span>
                {n.unread && <span className="w-2 h-2 bg-forest-600 rounded-full flex-shrink-0"></span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
              <span className="text-xs text-gray-400 mt-1 block">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickLinksCard() {
  const links = [
    { icon: <ShieldCheck className="w-5 h-5" />, label: 'MSP Prices', label_kn: 'MSP ಬೆಲೆ', href: '/msp', color: 'bg-amber-50 text-amber-700' },
    { icon: <Leaf className="w-5 h-5" />, label: 'Govt Schemes', label_kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆ', href: '/government-schemes', color: 'bg-purple-50 text-purple-700' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Market Trends', label_kn: 'ಮಾರ್ಕೆಟ್ ಟ್ರೆಂಡ್', href: '/market-trends', color: 'bg-blue-50 text-blue-700' },
    { icon: <Star className="w-5 h-5" />, label: 'Saved Crops', label_kn: 'ಉಳಿಸಿದ ಬೆಳೆ', href: '/profile', color: 'bg-green-50 text-green-700' },
  ]
  return (
    <div className="ap-card p-5">
      <h3 className="font-bold text-forest-900 mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 gap-3">
        {links.map(l => (
          <Link key={l.href} to={l.href} className={`${l.color} rounded-xl p-4 flex flex-col gap-2 hover:opacity-80 transition-opacity`}>
            {l.icon}
            <div className="text-sm font-semibold">{l.label}</div>
            <div className="text-xs kannada opacity-70">{l.label_kn}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome banner */}
      <WelcomeBanner user={user} />

      {/* Refresh bar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-forest-900">Dashboard</h2>
        <button onClick={handleRefresh}
          className="flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-900 font-medium transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh prices'}
        </button>
      </div>

      {/* Today's Prices */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-forest-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Today's Prices
          </h3>
          <Link to="/live-prices" className="text-sm text-forest-600 hover:text-forest-800 flex items-center gap-1 font-medium">
            All crops <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_PRICES.map(item => <PriceCard key={item.crop} item={item} />)}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          <AIRecommendationCard />
          <PriceChartCard />
          <NearbyMarketsCard />
        </div>
        {/* Right col */}
        <div className="space-y-6">
          <WeatherCard />
          <QuickLinksCard />
          <NotificationsCard />
        </div>
      </div>
    </div>
  )
}
