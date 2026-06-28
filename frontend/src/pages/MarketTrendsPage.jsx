import { useState } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { BarChart3, TrendingUp, TrendingDown, Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

// ── 12-month average price data ──────────────────────────────────────────
const MONTHLY_DATA = {
  Tomato: [
    { month: 'Jan', price: 1200, arrivals: 55 }, { month: 'Feb', price: 900, arrivals: 70 },
    { month: 'Mar', price: 750, arrivals: 80 },  { month: 'Apr', price: 600, arrivals: 60 },
    { month: 'May', price: 800, arrivals: 45 },  { month: 'Jun', price: 1400, arrivals: 30 },
    { month: 'Jul', price: 2200, arrivals: 25 }, { month: 'Aug', price: 2800, arrivals: 20 },
    { month: 'Sep', price: 2100, arrivals: 35 }, { month: 'Oct', price: 1600, arrivals: 50 },
    { month: 'Nov', price: 1200, arrivals: 65 }, { month: 'Dec', price: 1000, arrivals: 70 },
  ],
  Ragi: [
    { month: 'Jan', price: 3600, arrivals: 40 }, { month: 'Feb', price: 3700, arrivals: 35 },
    { month: 'Mar', price: 3800, arrivals: 30 }, { month: 'Apr', price: 3900, arrivals: 25 },
    { month: 'May', price: 4000, arrivals: 20 }, { month: 'Jun', price: 3850, arrivals: 15 },
    { month: 'Jul', price: 3600, arrivals: 10 }, { month: 'Aug', price: 3500, arrivals: 12 },
    { month: 'Sep', price: 3650, arrivals: 80 }, { month: 'Oct', price: 3750, arrivals: 100 },
    { month: 'Nov', price: 3800, arrivals: 90 }, { month: 'Dec', price: 3700, arrivals: 60 },
  ],
  Onion: [
    { month: 'Jan', price: 1800, arrivals: 60 }, { month: 'Feb', price: 1500, arrivals: 80 },
    { month: 'Mar', price: 1200, arrivals: 100 }, { month: 'Apr', price: 900, arrivals: 90 },
    { month: 'May', price: 1100, arrivals: 70 }, { month: 'Jun', price: 2000, arrivals: 40 },
    { month: 'Jul', price: 3000, arrivals: 25 }, { month: 'Aug', price: 3500, arrivals: 20 },
    { month: 'Sep', price: 2800, arrivals: 30 }, { month: 'Oct', price: 2200, arrivals: 50 },
    { month: 'Nov', price: 1800, arrivals: 70 }, { month: 'Dec', price: 1600, arrivals: 75 },
  ],
  Cotton: [
    { month: 'Jan', price: 7200, arrivals: 50 }, { month: 'Feb', price: 7400, arrivals: 40 },
    { month: 'Mar', price: 7600, arrivals: 30 }, { month: 'Apr', price: 7800, arrivals: 20 },
    { month: 'May', price: 7500, arrivals: 15 }, { month: 'Jun', price: 7200, arrivals: 10 },
    { month: 'Jul', price: 7000, arrivals: 8 },  { month: 'Aug', price: 7100, arrivals: 12 },
    { month: 'Sep', price: 7300, arrivals: 80 }, { month: 'Oct', price: 7600, arrivals: 120 },
    { month: 'Nov', price: 7800, arrivals: 100 }, { month: 'Dec', price: 7500, arrivals: 70 },
  ],
}

const CROP_LIST = Object.keys(MONTHLY_DATA)

const CROP_COLORS = { Tomato: '#ef4444', Ragi: '#1B4332', Onion: '#a855f7', Cotton: '#D4A017' }
const CROP_EMOJIS = { Tomato: '🍅', Ragi: '🌾', Onion: '🧅', Cotton: '🌿' }
const CROP_MSP = { Ragi: 3846, Cotton: 7521 }

// ── Market comparison data (which APMC had best average price this year) ──
const MARKET_COMPARISON = [
  { market: 'Kolar',       tomato: 1850, ragi: 3720, onion: 2100 },
  { market: 'Hassan',      tomato: 1720, ragi: 3920, onion: 2050 },
  { market: 'Mysuru',      tomato: 1680, ragi: 3850, onion: 2180 },
  { market: 'Belagavi',    tomato: 1600, ragi: 3780, onion: 2250 },
  { market: 'Hubballi',    tomato: 1550, ragi: 3800, onion: 2200 },
  { market: 'Kalaburagi',  tomato: 1490, ragi: 3700, onion: 2000 },
]

const INSIGHTS = [
  { crop: 'Tomato', emoji: '🍅', insight: 'Prices typically peak in Jul–Sep (monsoon disrupts supply). Best time to sell: August.', trend: 'up', color: 'red' },
  { crop: 'Ragi', emoji: '🌾', insight: 'Steady prices year-round due to MSP support. Minor peak in Apr–May (off-season). Safe to hold.', trend: 'stable', color: 'green' },
  { crop: 'Onion', emoji: '🧅', insight: 'Extreme volatility. Prices crash Mar–May (harvest) and surge Jul–Aug (lean season). Time arrivals carefully.', trend: 'volatile', color: 'purple' },
  { crop: 'Cotton', emoji: '🌿', insight: 'Prices firm in Oct–Dec (peak harvest procurement). Government MSP provides a strong floor.', trend: 'up', color: 'amber' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-forest-100 rounded-xl shadow-lg p-3">
      <p className="text-xs font-bold text-gray-500 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-800 price-number">
            {p.dataKey === 'arrivals' ? `${p.value}T` : `₹${p.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MarketTrendsPage() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato')
  const [chartType, setChartType] = useState('price') // price | arrivals | market

  const data = MONTHLY_DATA[selectedCrop]
  const msp = CROP_MSP[selectedCrop]
  const color = CROP_COLORS[selectedCrop]
  const avgPrice = Math.round(data.reduce((s, d) => s + d.price, 0) / data.length)
  const maxMonth = data.reduce((a, b) => (a.price > b.price ? a : b))
  const minMonth = data.reduce((a, b) => (a.price < b.price ? a : b))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-gold-500" /> Market Trends
        </h1>
        <p className="text-gray-500">Seasonal price patterns across Karnataka APMC markets — plan your sowing and selling</p>
      </div>

      {/* Seasonal insight cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {INSIGHTS.map(ins => (
          <div key={ins.crop} className="ap-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{ins.emoji}</span>
              <span className="font-bold text-forest-900 text-sm">{ins.crop}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{ins.insight}</p>
          </div>
        ))}
      </div>

      {/* Main chart area */}
      <div className="ap-card p-6 mb-6">
        {/* Crop selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {CROP_LIST.map(crop => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCrop === crop
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={selectedCrop === crop ? { background: CROP_COLORS[crop] } : {}}
              >
                {CROP_EMOJIS[crop]} {crop}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[['price', 'Price'], ['arrivals', 'Arrivals'], ['market', 'Market Comparison']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setChartType(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  chartType === val ? 'bg-white text-forest-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-lg font-bold text-forest-900 mb-1">
          {CROP_EMOJIS[selectedCrop]} {selectedCrop} —{' '}
          {chartType === 'price' ? 'Monthly Average Price (₹/quintal)'
            : chartType === 'arrivals' ? 'Monthly Market Arrivals (tonnes)'
            : 'Price Comparison by APMC Market'}
        </h2>
        <p className="text-xs text-gray-400 mb-5">Karnataka APMC average • 2024 data</p>

        {/* Price chart */}
        {chartType === 'price' && (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${selectedCrop}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} width={55} />
              <Tooltip content={<CustomTooltip />} />
              {msp && (
                <ReferenceLine y={msp} stroke="#D4A017" strokeDasharray="5 3"
                  label={{ value: `MSP ₹${msp}`, fill: '#b45309', fontSize: 10, position: 'insideTopRight' }} />
              )}
              <ReferenceLine y={avgPrice} stroke="#94a3b8" strokeDasharray="3 3"
                label={{ value: `Avg ₹${avgPrice}`, fill: '#64748b', fontSize: 10, position: 'insideBottomRight' }} />
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2.5}
                fill={`url(#grad-${selectedCrop})`} dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6 }} name="Price" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* Arrivals chart */}
        {chartType === 'arrivals' && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={v => `${v}T`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="arrivals" fill={color} radius={[4, 4, 0, 0]} name="Arrivals" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Market comparison */}
        {chartType === 'market' && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MARKET_COMPARISON} layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} />
              <YAxis dataKey="market" type="category" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={selectedCrop.toLowerCase()} fill={color} radius={[0, 4, 4, 0]}
                name={selectedCrop} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Stats row */}
        {chartType === 'price' && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Annual Average</div>
              <div className="font-bold text-charcoal price-number text-lg">₹{avgPrice.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Peak Month</div>
              <div className="font-bold text-green-600 price-number text-lg">{maxMonth.month} — ₹{maxMonth.price.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Trough Month</div>
              <div className="font-bold text-red-500 price-number text-lg">{minMonth.month} — ₹{minMonth.price.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-crop comparison */}
      <div className="ap-card p-6">
        <h2 className="text-lg font-bold text-forest-900 mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold-500" /> All Crops — Price Trend 2024
        </h2>
        <p className="text-xs text-gray-400 mb-5">Normalized — see relative movement across crops</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={MONTHLY_DATA['Tomato'].map((d, i) => ({
              month: d.month,
              Tomato: MONTHLY_DATA['Tomato'][i].price,
              Ragi: MONTHLY_DATA['Ragi'][i].price,
              Onion: MONTHLY_DATA['Onion'][i].price,
              Cotton: MONTHLY_DATA['Cotton'][i].price,
            }))}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {Object.entries(CROP_COLORS).map(([crop, color]) => (
              <Line key={crop} type="monotone" dataKey={crop} stroke={color} strokeWidth={2}
                dot={false} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-wrap gap-4 justify-between items-center ap-card p-5 bg-forest-50">
        <div>
          <div className="font-bold text-forest-900">Ready to act on these trends?</div>
          <div className="text-sm text-gray-500">Get a personalized AI recommendation for your crop and quantity</div>
        </div>
        <div className="flex gap-3">
          <Link to="/live-prices" className="btn-secondary px-5 py-2.5 text-sm">Live Prices</Link>
          <Link to="/ai-prediction" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            AI Prediction <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
