import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, TrendingUp, TrendingDown, ShieldCheck,
  MapPin, Package, Clock, Leaf, Star
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

import { ALL_CROPS, CATEGORIES } from './CropsPage'

const MARKET_BY_CATEGORY = {
  cereals: ['Tumakuru APMC', 'Mysuru APMC', 'Hassan APMC'],
  pulses: ['Kalaburagi APMC', 'Bidar APMC', 'Vijayapura APMC'],
  oilseeds: ['Davanagere APMC', 'Hubballi APMC', 'Raichur APMC'],
  vegetables: ['Kolar APMC', 'Bengaluru APMC', 'Mysuru APMC'],
  fruits: ['Ramanagara APMC', 'Bengaluru APMC', 'Belagavi APMC'],
  spices: ['Byadagi APMC', 'Hassan APMC', 'Madikeri APMC'],
  plantation: ['Chikkamagaluru APMC', 'Madikeri APMC', 'Sakleshpur APMC'],
  fibres: ['Ballari APMC', 'Raichur APMC', 'Hubballi APMC'],
}

function labelForCategory(cat) {
  return CATEGORIES.find((item) => item.id === cat)?.label || 'Karnataka Crop'
}

function generatePriceHistory(base, cropId, volatility = 0.05) {
  const data = []
  let price = base * 0.9
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)

    const wave = Math.sin((i + cropId) / 4) * volatility * 0.8
    const drift = ((cropId % 5) - 2) * 0.002
    price *= 1 + wave + drift
    price = Math.max(base * 0.65, Math.min(price, base * 1.35))

    data.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price: Math.round(price),
    })
  }

  return data
}

function buildCropDetail(crop) {
  const currentPrice = crop.price
  const prevPrice = Math.max(Math.round(currentPrice * (0.94 + (crop.id % 6) * 0.015)), 1)
  const minPrice = Math.max(Math.round(currentPrice * 0.76), 1)
  const maxPrice = Math.round(currentPrice * 1.18)
  const categoryLabel = labelForCategory(crop.cat)

  return {
    ...crop,
    category: categoryLabel,
    msp_price: crop.msp,
    mspProtected: crop.has_msp,
    currentPrice,
    prevPrice,
    minPrice,
    maxPrice,
    seasonLabels: crop.season.split('/').map((item) => item.trim()),
    storage: crop.shelf >= 180
      ? 'Store in a cool, dry, moisture-free place with good ventilation.'
      : 'Sell quickly or keep in clean, shaded storage with airflow to reduce spoilage.',
    shelfLife: crop.shelf >= 365 ? '1+ year' : `${crop.shelf} days`,
    grade: crop.has_msp ? 'FAQ / trader-grade lots' : 'Fresh market grade',
    varieties: [crop.name, `${crop.name} Premium`, `${crop.name} Local`],
    bestMarkets: MARKET_BY_CATEGORY[crop.cat] || ['Bengaluru APMC', 'Mysuru APMC', 'Hubballi APMC'],
    description: `${crop.name} is an important ${categoryLabel.toLowerCase()} crop in Karnataka. Farmers monitor arrivals, storage life, district demand, and nearby APMC competition before deciding when to sell.`,
    priceFactors: [
      'Arrival volumes in nearby APMC markets',
      'Seasonal demand and festival consumption',
      'Weather impact on harvest quality and transport',
      'Competition from neighboring districts and states',
    ],
    govtSchemes: crop.has_msp
      ? ['Minimum Support Price procurement', 'PM Fasal Bima Yojana', 'State agriculture department assistance']
      : ['PM Fasal Bima Yojana', 'State horticulture or agriculture support schemes'],
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-forest-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-forest-900 price-number text-lg">Rs {payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-gray-400">per quintal</p>
      </div>
    )
  }
  return null
}

export default function CropDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const crop = useMemo(() => {
    const baseCrop = ALL_CROPS.find((item) => item.id === Number(id))
    return baseCrop ? buildCropDetail(baseCrop) : null
  }, [id])

  const priceHistory = useMemo(
    () => (crop ? generatePriceHistory(crop.currentPrice, crop.id) : []),
    [crop]
  )

  if (!crop) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/crops" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Crops
        </Link>
        <div className="ap-card p-10 text-center">
          <div className="text-5xl mb-4">🌾</div>
          <h1 className="text-2xl font-bold text-forest-900 mb-2">Crop not found</h1>
          <p className="text-gray-500 mb-6">This crop record is not available in the current catalog.</p>
          <Link to="/crops" className="btn-primary inline-block px-6 py-3">Browse all crops</Link>
        </div>
      </div>
    )
  }

  const change = crop.currentPrice - crop.prevPrice
  const changePct = ((change / crop.prevPrice) * 100).toFixed(1)
  const isUp = change >= 0
  const tabs = ['overview', 'price history', 'markets', 'storage']
  const rangePercent = ((crop.currentPrice - crop.minPrice) / (crop.maxPrice - crop.minPrice)) * 100

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/crops" className="inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Crops
      </Link>

      <div className="ap-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 bg-forest-50 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            {crop.emoji}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-forest-900">{crop.name}</h1>
              {crop.mspProtected && (
                <span className="msp-badge text-sm px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> MSP Crop
                </span>
              )}
            </div>
            <p className="text-lg text-gray-400 kannada mb-1">{crop.name_kn}</p>
            <p className="text-sm text-gray-400 italic">{crop.scientific}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-forest-50 text-forest-700 rounded-full text-xs font-medium">{crop.category}</span>
              {crop.seasonLabels.map((season) => (
                <span key={season} className="px-2.5 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-medium">{season}</span>
              ))}
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-4xl font-bold text-forest-900 price-number">
              Rs {crop.currentPrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mb-2">per quintal</div>
            <div className={`inline-flex items-center gap-1.5 text-base font-bold px-3 py-1 rounded-full ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? '+' : ''}{change} ({changePct}%)
            </div>
            <div className="text-xs text-gray-400 mt-2">vs previous reference price Rs {crop.prevPrice.toLocaleString()}</div>
            {crop.mspProtected && (
              <div className={`mt-2 text-xs font-semibold ${crop.currentPrice >= crop.msp_price ? 'text-green-600' : 'text-red-500'}`}>
                MSP: Rs {crop.msp_price?.toLocaleString()} • {crop.currentPrice >= crop.msp_price
                  ? `Rs ${(crop.currentPrice - crop.msp_price).toLocaleString()} above`
                  : 'Below MSP'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Min Rs {crop.minPrice.toLocaleString()}</span>
            <span className="font-semibold text-forest-700">Current range</span>
            <span>Max Rs {crop.maxPrice.toLocaleString()}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full relative">
            <div
              className="absolute h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full"
              style={{ width: `${rangePercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-forest-900 rounded-full border-2 border-white shadow"
              style={{ left: `calc(${rangePercent}% - 8px)` }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
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

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="ap-card p-6">
              <h2 className="font-bold text-forest-900 mb-3 text-lg flex items-center gap-2">
                <Leaf className="w-5 h-5 text-forest-600" /> About this Crop
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">{crop.description}</p>
            </div>

            <div className="ap-card p-6">
              <h2 className="font-bold text-forest-900 mb-4 text-lg">Varieties Traded</h2>
              <div className="flex flex-wrap gap-2">
                {crop.varieties.map((variety) => (
                  <span key={variety} className="px-3 py-1.5 bg-forest-50 text-forest-700 rounded-lg text-sm font-medium border border-forest-100">
                    {variety}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Grade: {crop.grade}</p>
            </div>

            <div className="ap-card p-6">
              <h2 className="font-bold text-forest-900 mb-4 text-lg">What Affects This Price</h2>
              <div className="space-y-3">
                {crop.priceFactors.map((factor, index) => (
                  <div key={factor} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-6 h-6 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
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
                    <div className="text-sm font-semibold text-charcoal">{crop.seasonLabels.join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>

            {crop.mspProtected ? (
              <div className="ap-card p-5 border-l-4 border-gold-500 bg-gold-50">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-gold-600" />
                  <h3 className="font-bold text-gold-800">MSP Protected</h3>
                </div>
                <p className="text-2xl font-bold text-gold-700 price-number mb-1">
                  Rs {crop.msp_price?.toLocaleString()}
                </p>
                <p className="text-xs text-gold-600">Minimum Support Price per quintal</p>
                <Link to="/msp" className="mt-3 block text-xs text-forest-700 font-semibold hover:underline">
                  View all MSP crops →
                </Link>
              </div>
            ) : (
              <div className="ap-card p-5 bg-gray-50">
                <h3 className="font-semibold text-gray-600 mb-1 text-sm">No MSP for this crop</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  This crop mainly depends on open market pricing, arrivals, and local demand.
                </p>
              </div>
            )}

            <div className="ap-card p-5">
              <h3 className="font-bold text-forest-900 mb-3">Applicable Schemes</h3>
              <div className="space-y-2">
                {crop.govtSchemes.map((scheme) => (
                  <div key={scheme} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-forest-500 rounded-full mt-2 flex-shrink-0" />
                    {scheme}
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

      {activeTab === 'price history' && (
        <div className="ap-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-forest-900 text-lg">30-Day Price Chart</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Rs / quintal</span>
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
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={6} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rs ${(value / 1000).toFixed(1)}k`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              {crop.mspProtected && (
                <ReferenceLine
                  y={crop.msp_price}
                  stroke="#D4A017"
                  strokeDasharray="6 3"
                  label={{ value: `MSP Rs ${crop.msp_price}`, fill: '#b45309', fontSize: 11, position: 'insideTopRight' }}
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
        </div>
      )}

      {activeTab === 'markets' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Top APMC markets for {crop.name} in Karnataka</p>
          {crop.bestMarkets.map((market, index) => {
            const variation = [0, -120, 85][index] || 0
            const marketPrice = crop.currentPrice + variation

            return (
              <div key={market} className="ap-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-forest-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">{market}</div>
                    <div className="text-xs text-gray-400">Updated today • {[120, 85, 42][index]}T arrivals</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-forest-900 price-number">Rs {marketPrice.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">per quintal</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
            </div>
          </div>
          <div className="ap-card p-6">
            <h2 className="font-bold text-forest-900 mb-4 text-lg">Selling Guidance</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p><span className="font-semibold text-green-800">Sell sooner</span> when the market price is strong and your storage window is short.</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p><span className="font-semibold text-amber-800">Hold briefly</span> if arrivals are falling and storage conditions are safe.</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p><span className="font-semibold text-blue-800">Compare MSP</span> for protected crops before deciding on a private-market sale.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
