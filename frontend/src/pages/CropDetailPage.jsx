import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, TrendingUp, TrendingDown, ShieldCheck,
  MapPin, Thermometer, Droplets, Package, Clock, Leaf, Star
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'

// ── Full 60+ crop database (abbreviated here — expand with all crops) ──
const CROP_DB = {
  1: {
    id: 1, name: 'Tomato', name_kn: 'ಟೊಮೇಟೊ', scientific: 'Solanum lycopersicum',
    emoji: '🍅', category: 'Vegetables', msp: false,
    currentPrice: 1850, prevPrice: 1620, minPrice: 1400, maxPrice: 2800,
    varieties: ['Hybrid (local)', 'Arka Rakshak', 'Arka Vikas', 'Roma'],
    grade: 'Grade A / Medium / Small',
    season: ['Kharif (Jun–Oct)', 'Rabi (Nov–Feb)'],
    storage: '5–7 days at room temp, 2 weeks refrigerated',
    shelfLife: '1–2 weeks',
    bestMarkets: ['Kolar APMC', 'Bengaluru APMC', 'Mysuru APMC'],
    description: 'Tomato is the highest-volume vegetable crop in Karnataka. Kolar district alone accounts for 30% of Karnataka\'s tomato production. Prices are highly volatile — can swing ₹200 to ₹3000/quintal within a single month.',
    priceFactors: ['Monsoon rainfall in growing areas', 'Andhra Pradesh and Maharashtra arrivals', 'Fuel/transport costs', 'Demand from processing units'],
    govtSchemes: ['PM Fasal Bima Yojana', 'Karnataka Horticulture Dept subsidy on drip irrigation'],
    image: '🍅',
  },
  2: {
    id: 2, name: 'Ragi', name_kn: 'ರಾಗಿ', scientific: 'Eleusine coracana',
    emoji: '🌾', category: 'Millets', msp: true, msp_price: 3846,
    currentPrice: 3920, prevPrice: 3710, minPrice: 3500, maxPrice: 4200,
    varieties: ['MR-6', 'GPU-28', 'GPU-45', 'MR-1'],
    grade: 'FAQ (Fair Average Quality)',
    season: ['Kharif (Jun–Oct)'],
    storage: '12–18 months in dry storage',
    shelfLife: '1–2 years',
    bestMarkets: ['Hassan APMC', 'Tumakuru APMC', 'Chikkamagaluru APMC'],
    description: 'Ragi (finger millet) is Karnataka\'s signature crop — the state produces ~50% of India\'s ragi. It is a hardy drought-resistant crop grown across all 31 districts. Government MSP guarantees ₹3,846/quintal.',
    priceFactors: ['Government MSP procurement volumes', 'Nutritional food demand (health trend)', 'Rainfall in Hassan and Tumakuru', 'Exports to Maharashtra and Tamil Nadu'],
    govtSchemes: ['MSP Procurement by NAFED', 'Karnataka Millet Mission', 'Raitha Siri income support'],
    image: '🌾',
  },
  3: {
    id: 3, name: 'Onion', name_kn: 'ಈರುಳ್ಳಿ', scientific: 'Allium cepa',
    emoji: '🧅', category: 'Vegetables', msp: false,
    currentPrice: 2200, prevPrice: 2350, minPrice: 800, maxPrice: 4500,
    varieties: ['Bellary Red', 'N-2-4-1', 'Arka Niketan', 'Agrifound Light Red'],
    grade: 'Grade A / B / Export',
    season: ['Kharif (Jun–Sep)', 'Rabi (Nov–Mar)'],
    storage: '3–6 months in well-ventilated storage',
    shelfLife: '2–6 months',
    bestMarkets: ['Belagavi APMC', 'Hubballi APMC', 'Bengaluru APMC'],
    description: 'Onion prices in Karnataka are highly political and volatile. Bellary variety (grown in North Karnataka) is prized for its red color and longer shelf life. Price crashes often follow bumper harvests when storage facilities are overwhelmed.',
    priceFactors: ['Monsoon rainfall timing', 'Export policy (government can ban exports)', 'Maharashtra/Gujarat arrivals', 'Cold storage availability'],
    govtSchemes: ['PM Fasal Bima Yojana', 'NAFED price stabilization buffer'],
    image: '🧅',
  },
}

// Generate 30 days of mock price history
function generatePriceHistory(base, volatility = 0.04) {
  const data = []
  let price = base * 0.88
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    price *= 1 + (Math.random() - 0.48) * volatility
    price = Math.max(base * 0.5, Math.min(price, base * 1.8))
    data.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price: Math.round(price),
    })
  }
  return data
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-forest-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-forest-900 price-number text-lg">₹{payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-gray-400">per quintal</p>
      </div>
    )
  }
  return null
}

export default function CropDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const crop = CROP_DB[parseInt(id)] || CROP_DB[1]
  const priceHistory = generatePriceHistory(crop.currentPrice)
  const change = crop.currentPrice - crop.prevPrice
  const changePct = ((change / crop.prevPrice) * 100).toFixed(1)
  const isUp = change >= 0

  const tabs = ['overview', 'price history', 'markets', 'storage']

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/live-prices" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Live Prices
      </Link>

      {/* Hero header */}
      <div className="ap-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Crop identity */}
          <div className="w-20 h-20 bg-forest-50 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            {crop.emoji}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-forest-900">{crop.name}</h1>
              {crop.msp && (
                <span className="msp-badge text-sm px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> MSP Crop
                </span>
              )}
            </div>
            <p className="text-lg text-gray-400 kannada mb-1">{crop.name_kn}</p>
            <p className="text-sm text-gray-400 italic">{crop.scientific}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-forest-50 text-forest-700 rounded-full text-xs font-medium">{crop.category}</span>
              {crop.season.map(s => (
                <span key={s} className="px-2.5 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>

          {/* Price card */}
          <div className="sm:text-right">
            <div className="text-4xl font-bold text-forest-900 price-number">
              ₹{crop.currentPrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mb-2">per quintal</div>
            <div className={`inline-flex items-center gap-1.5 text-base font-bold px-3 py-1 rounded-full ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? '+' : ''}{change} ({changePct}%)
            </div>
            <div className="text-xs text-gray-400 mt-2">vs yesterday ₹{crop.prevPrice.toLocaleString()}</div>
            {crop.msp && (
              <div className={`mt-2 text-xs font-semibold ${crop.currentPrice >= crop.msp_price ? 'text-green-600' : 'text-red-500'}`}>
                MSP: ₹{crop.msp_price?.toLocaleString()} •{' '}
                {crop.currentPrice >= crop.msp_price
                  ? `₹${(crop.currentPrice - crop.msp_price).toLocaleString()} above ✓`
                  : 'Below MSP ⚠️'}
              </div>
            )}
          </div>
        </div>

        {/* Price range bar */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Min ₹{crop.minPrice.toLocaleString()}</span>
            <span className="font-semibold text-forest-700">Today's Range</span>
            <span>Max ₹{crop.maxPrice.toLocaleString()}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full relative">
            <div
              className="absolute h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full"
              style={{ width: `${((crop.currentPrice - crop.minPrice) / (crop.maxPrice - crop.minPrice)) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-forest-900 rounded-full border-2 border-white shadow"
              style={{ left: `calc(${((crop.currentPrice - crop.minPrice) / (crop.maxPrice - crop.minPrice)) * 100}% - 8px)` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-forest-700 text-forest-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="ap-card p-6">
              <h2 className="font-bold text-forest-900 mb-3 text-lg flex items-center gap-2">
                <Leaf className="w-5 h-5 text-forest-600" /> About this Crop
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">{crop.description}</p>
            </div>

            {/* Varieties */}
            <div className="ap-card p-6">
              <h2 className="font-bold text-forest-900 mb-4 text-lg">Varieties Traded</h2>
              <div className="flex flex-wrap gap-2">
                {crop.varieties.map(v => (
                  <span key={v} className="px-3 py-1.5 bg-forest-50 text-forest-700 rounded-lg text-sm font-medium border border-forest-100">
                    {v}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Grade: {crop.grade}</p>
            </div>

            {/* Price factors */}
            <div className="ap-card p-6">
              <h2 className="font-bold text-forest-900 mb-4 text-lg">What Affects This Price</h2>
              <div className="space-y-3">
                {crop.priceFactors.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Quick stats */}
            <div className="ap-card p-5">
              <h3 className="font-bold text-forest-900 mb-4">Quick Facts</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-forest-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Shelf Life</div>
                    <div className="text-sm font-semibold text-charcoal">{crop.shelfLife}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-forest-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Storage</div>
                    <div className="text-sm font-semibold text-charcoal">{crop.storage}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Best Season</div>
                    <div className="text-sm font-semibold text-charcoal">{crop.season.join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MSP Box */}
            {crop.msp ? (
              <div className="ap-card p-5 border-l-4 border-gold-500 bg-gold-50">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-gold-600" />
                  <h3 className="font-bold text-gold-800">MSP Protected</h3>
                </div>
                <p className="text-2xl font-bold text-gold-700 price-number mb-1">
                  ₹{crop.msp_price?.toLocaleString()}
                </p>
                <p className="text-xs text-gold-600">Minimum Support Price 2024-25 (per quintal)</p>
                <p className="text-xs text-gray-500 mt-2">
                  Government guarantees at least this price via NAFED and FCI procurement.
                </p>
                <Link to="/msp" className="mt-3 block text-xs text-forest-700 font-semibold hover:underline">
                  View all MSP crops →
                </Link>
              </div>
            ) : (
              <div className="ap-card p-5 bg-gray-50">
                <h3 className="font-semibold text-gray-600 mb-1 text-sm">No MSP for this crop</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Market price only. Price depends entirely on supply, demand, and APMC arrivals.
                </p>
              </div>
            )}

            {/* Govt schemes */}
            <div className="ap-card p-5">
              <h3 className="font-bold text-forest-900 mb-3">Applicable Schemes</h3>
              <div className="space-y-2">
                {crop.govtSchemes.map(s => (
                  <div key={s} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-forest-500 rounded-full mt-2 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
              <Link to="/government-schemes" className="mt-3 block text-xs text-forest-700 font-semibold hover:underline">
                View all schemes →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Price History */}
      {activeTab === 'price history' && (
        <div className="ap-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-forest-900 text-lg">30-Day Price Chart</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">₹/quintal</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={priceHistory} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4332" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              {crop.msp && (
                <ReferenceLine
                  y={crop.msp_price}
                  stroke="#D4A017"
                  strokeDasharray="6 3"
                  label={{ value: `MSP ₹${crop.msp_price}`, fill: '#b45309', fontSize: 11, position: 'insideTopRight' }}
                />
              )}
              <Area
                type="monotone"
                dataKey="price"
                stroke="#1B4332"
                strokeWidth={2.5}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#1B4332' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">30-Day Low</div>
              <div className="font-bold text-red-600 price-number">₹{Math.min(...priceHistory.map(d => d.price)).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Average</div>
              <div className="font-bold text-gray-700 price-number">
                ₹{Math.round(priceHistory.reduce((s, d) => s + d.price, 0) / priceHistory.length).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">30-Day High</div>
              <div className="font-bold text-green-600 price-number">₹{Math.max(...priceHistory.map(d => d.price)).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Markets */}
      {activeTab === 'markets' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Top APMC markets for {crop.name} in Karnataka</p>
          {crop.bestMarkets.map((market, i) => {
            const variation = [0, -120, +85][i] || 0
            const mktPrice = crop.currentPrice + variation
            return (
              <div key={market} className="ap-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-forest-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">{market}</div>
                    <div className="text-xs text-gray-400">Updated today • {[120, 85, 42][i]}T arrivals</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-forest-900 price-number">₹{mktPrice.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">per quintal</div>
                </div>
              </div>
            )
          })}
          <div className="ap-card p-4 border-l-4 border-blue-400 bg-blue-50">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">AI Tip:</span> Use the AI Prediction page to get personalized sell/hold recommendations across all markets for this crop.
            </p>
            <Link to="/ai-prediction" className="mt-2 inline-block text-sm font-semibold text-forest-700 hover:underline">
              Get AI Recommendation →
            </Link>
          </div>
        </div>
      )}

      {/* Tab: Storage */}
      {activeTab === 'storage' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="ap-card p-6">
            <h2 className="font-bold text-forest-900 mb-4 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-forest-600" /> Storage Guide
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-forest-50 rounded-xl">
                <div className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-1">Shelf Life</div>
                <div className="font-bold text-forest-900">{crop.shelfLife}</div>
              </div>
              <div className="p-4 bg-forest-50 rounded-xl">
                <div className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-1">Storage Method</div>
                <div className="font-bold text-forest-900">{crop.storage}</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">⚠️ Key Advice</div>
                <div className="text-sm text-amber-800">
                  Always dry the crop to safe moisture levels before storage to prevent fungal damage and price loss.
                </div>
              </div>
            </div>
          </div>
          <div className="ap-card p-6">
            <h2 className="font-bold text-forest-900 mb-4 text-lg">When to Sell</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p><span className="font-semibold text-green-800">Sell today</span> if price is above 30-day average and storage cost is high relative to price gain.</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p><span className="font-semibold text-amber-800">Hold</span> if arrival volumes are declining — suggests price may rise in 2–5 days.</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p><span className="font-semibold text-blue-800">Use AI</span> for a personalized recommendation based on your quantity and nearest APMC.</p>
              </div>
            </div>
            <Link to="/ai-prediction" className="btn-primary w-full text-center mt-5 py-3 block">
              Get AI Recommendation →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
