import { useState } from 'react'
import { Brain, TrendingUp, TrendingDown, MapPin, Cloud, Truck, DollarSign, ChevronRight, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const CROPS = [
  { id: 1, name: 'Tomato', name_kn: 'ಟೊಮೇಟೊ', emoji: '🍅' },
  { id: 2, name: 'Ragi', name_kn: 'ರಾಗಿ', emoji: '🌾' },
  { id: 3, name: 'Tur Dal', name_kn: 'ತೊಗರಿ', emoji: '🫘' },
  { id: 4, name: 'Onion', name_kn: 'ಈರುಳ್ಳಿ', emoji: '🧅' },
  { id: 5, name: 'Cotton', name_kn: 'ಹತ್ತಿ', emoji: '🌿' },
  { id: 6, name: 'Groundnut', name_kn: 'ಕಡಲೆಕಾಯಿ', emoji: '🥜' },
  { id: 7, name: 'Maize', name_kn: 'ಮೆಕ್ಕೆಜೋಳ', emoji: '🌽' },
  { id: 8, name: 'Rice (Paddy)', name_kn: 'ಭತ್ತ', emoji: '🍚' },
]

const MARKETS = [
  { id: 1, name: 'Kolar APMC', district: 'Kolar', distance: 8 },
  { id: 2, name: 'Hassan APMC', district: 'Hassan', distance: 45 },
  { id: 3, name: 'Mandya APMC', district: 'Mandya', distance: 62 },
  { id: 4, name: 'Mysuru APMC', district: 'Mysuru', distance: 90 },
  { id: 5, name: 'Bengaluru APMC', district: 'Bengaluru', distance: 105 },
]

const RECOMMENDATION_CONFIG = {
  SELL_TODAY: {
    label: 'Sell Today',
    label_kn: 'ಇಂದೇ ಮಾರಿ',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '✓',
    barColor: '#16a34a',
  },
  HOLD: {
    label: 'Hold — Wait for better price',
    label_kn: 'ತಡೆ — ಒಳ್ಳೆ ಬೆಲೆಗಾಗಿ ಕಾಯಿ',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: '⏳',
    barColor: '#d97706',
  },
  WAIT_2_DAYS: {
    label: 'Wait 2 Days',
    label_kn: '2 ದಿನ ಕಾಯಿ',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '📅',
    barColor: '#2563eb',
  },
  GOVT_PROCUREMENT: {
    label: 'Government Procurement',
    label_kn: 'ಸರ್ಕಾರಿ ಖರೀದಿ',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🏛️',
    barColor: '#7c3aed',
  },
}

// Mock prediction result
const MOCK_RESULT = {
  recommendation: 'SELL_TODAY',
  confidence: 82,
  current_price: 1850,
  predicted_tomorrow: 1720,
  predicted_3day: 1580,
  reasoning_en: 'Tomato prices are at a 2-week high of ₹1,850/quintal at Kolar APMC. Weather forecast shows heavy rainfall on Thursday and Friday which will bring fresh arrivals and push prices down 7-15%. Market arrivals are currently low (42T vs 65T average), supporting high prices today. Recommended: Sell all stock today.',
  reasoning_kn: 'ಕೋಲಾರ APMC ನಲ್ಲಿ ಟೊಮೇಟೊ ಬೆಲೆ 2 ವಾರಗಳ ಗರಿಷ್ಠ ₹1,850/ಕ್ವಿಂಟಾಲ್ ತಲುಪಿದೆ. ಗುರುವಾರ ಮತ್ತು ಶುಕ್ರವಾರ ಭಾರೀ ಮಳೆ ಮುನ್ಸೂಚನೆ ಇದೆ, ಇದು ಬೆಲೆ 7-15% ಇಳಿಸಬಹುದು. ಇಂದೇ ಮಾರಾಟ ಮಾಡಿ.',
  price_history: [
    { date: 'Jun 16', price: 1100 }, { date: 'Jun 17', price: 1250 }, { date: 'Jun 18', price: 1380 },
    { date: 'Jun 19', price: 1420 }, { date: 'Jun 20', price: 1500 }, { date: 'Jun 21', price: 1620 },
    { date: 'Jun 22', price: 1780 }, { date: 'Today', price: 1850 },
    { date: 'Tomorrow*', price: 1720, predicted: true }, { date: '+2 days*', price: 1650, predicted: true },
    { date: '+3 days*', price: 1580, predicted: true },
  ],
  market_comparison: [
    { market: 'Kolar APMC', price: 1850, distance: 8, transport: 180, net: 1670 },
    { market: 'Chintamani APMC', price: 1780, distance: 32, transport: 320, net: 1460 },
    { market: 'Bengaluru APMC', price: 2100, distance: 105, transport: 780, net: 1320 },
  ],
  weather_impact: {
    condition: 'Heavy rain Thursday-Friday',
    impact: 'negative',
    price_effect: '-₹130 to -₹270',
  },
  features: {
    weather_score: 35,
    arrivals_score: 82,
    price_trend_score: 91,
    seasonal_score: 70,
  },
}

function ConfidenceMeter({ value }) {
  const color = value >= 75 ? '#16a34a' : value >= 50 ? '#d97706' : '#dc2626'
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-600 font-medium">AI Confidence</span>
        <span className="font-bold text-lg" style={{ color }}>{value}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function FeatureImportance({ features }) {
  const items = [
    { label: 'Price Trend (7 days)', score: features.price_trend_score },
    { label: 'Market Arrivals', score: features.arrivals_score },
    { label: 'Seasonal Pattern', score: features.seasonal_score },
    { label: 'Weather Forecast', score: features.weather_score },
  ]
  return (
    <div>
      <h4 className="text-sm font-bold text-forest-900 mb-3 flex items-center gap-1.5">
        <Info className="w-4 h-4" /> What influenced this prediction
      </h4>
      <div className="space-y-2.5">
        {items.map(item => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-semibold text-charcoal">{item.score}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-forest-600 rounded-full" style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AIPredictionPage() {
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0])
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0])
  const [quantity, setQuantity] = useState(10)
  const [lang, setLang] = useState('en')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = () => {
    setLoading(true)
    setTimeout(() => {
      setResult(MOCK_RESULT)
      setLoading(false)
    }, 2000)
  }

  const rec = result ? RECOMMENDATION_CONFIG[result.recommendation] : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <Brain className="w-7 h-7 text-forest-700" /> AI Price Prediction
        </h1>
        <p className="text-gray-500">XGBoost ML model trained on Karnataka mandi data — tells you when and where to sell.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input panel */}
        <div className="space-y-5">
          <div className="ap-card p-6">
            <h3 className="font-bold text-forest-900 mb-4">Select Crop & Market</h3>

            {/* Crop selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-800 mb-2">Your Crop</label>
              <div className="grid grid-cols-2 gap-2">
                {CROPS.map(c => (
                  <button key={c.id} onClick={() => setSelectedCrop(c)}
                    className={`p-2.5 rounded-lg border-2 text-sm font-medium flex items-center gap-2 transition-all ${selectedCrop.id === c.id ? 'border-forest-700 bg-forest-50 text-forest-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <span>{c.emoji}</span>
                    <div className="text-left">
                      <div>{c.name}</div>
                      <div className="text-xs kannada opacity-60">{c.name_kn}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Market selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-800 mb-2">Nearest APMC Market</label>
              <select value={selectedMarket.id} onChange={e => setSelectedMarket(MARKETS.find(m => m.id === parseInt(e.target.value)))}
                className="ap-input appearance-none">
                {MARKETS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.distance} km)</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-forest-800 mb-2">
                Quantity to Sell: <span className="text-forest-600">{quantity} quintals</span>
              </label>
              <input type="range" min="1" max="200" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-full accent-forest-700" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 quintal</span><span>200 quintals</span>
              </div>
            </div>

            {/* Lang toggle */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-forest-800 mb-2">Recommendation Language</label>
              <div className="grid grid-cols-2 gap-2">
                {[['en', '🇬🇧 English'], ['kn', '🇮🇳 ಕನ್ನಡ']].map(([val, label]) => (
                  <button key={val} onClick={() => setLang(val)}
                    className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${lang === val ? 'border-forest-700 bg-forest-50 text-forest-800' : 'border-gray-200 text-gray-500'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleAnalyze} disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                : <><Brain className="w-5 h-5" /> Get AI Recommendation</>
              }
            </button>
          </div>

          {/* How it works */}
          <div className="ap-card p-5">
            <h4 className="font-bold text-forest-900 mb-3 text-sm">How the AI works</h4>
            <div className="space-y-2 text-xs text-gray-600">
              {[
                { icon: '📊', text: 'Analyzes 90 days of price history for your crop & market' },
                { icon: '🌦️', text: 'Checks 5-day weather forecast for price impact' },
                { icon: '📦', text: 'Looks at current market arrival volumes' },
                { icon: '🚚', text: 'Calculates transport cost to nearby markets' },
                { icon: '🤖', text: 'XGBoost model outputs tomorrow\'s predicted price' },
                { icon: '💰', text: 'Recommends action maximizing your net profit' },
              ].map(item => (
                <div key={item.icon} className="flex items-start gap-2">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-5">
          {!result && !loading && (
            <div className="ap-card p-16 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="font-bold text-forest-900 text-xl mb-2">Ready to Analyze</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Select your crop, market, and quantity on the left, then click "Get AI Recommendation".</p>
            </div>
          )}

          {loading && (
            <div className="ap-card p-16 text-center">
              <div className="text-6xl mb-4 animate-bounce">🧮</div>
              <h3 className="font-bold text-forest-900 text-xl mb-2">Analyzing Market Data...</h3>
              <div className="space-y-2 text-sm text-gray-500 max-w-xs mx-auto">
                <p>⏳ Fetching price history...</p>
                <p>🌦️ Checking weather forecast...</p>
                <p>📦 Analyzing market arrivals...</p>
                <p>🤖 Running XGBoost model...</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Main recommendation */}
              <div className={`ap-card p-6 border-2 ${rec.color}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">AI Recommendation</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <span>{rec.icon}</span>
                      {rec.label}
                    </div>
                    <div className="text-sm kannada mt-1 opacity-80">{rec.label_kn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-60 mb-1">Confidence</div>
                    <div className="text-3xl font-bold">{result.confidence}%</div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed opacity-90">
                  {lang === 'kn' ? result.reasoning_kn : result.reasoning_en}
                </p>
              </div>

              {/* Price cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="ap-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Today's Price</div>
                  <div className="text-2xl font-bold text-forest-900 price-number">₹{result.current_price.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">/quintal</div>
                </div>
                <div className="ap-card p-4 text-center border-2 border-gold-300">
                  <div className="text-xs text-gold-600 mb-1 font-bold">Tomorrow (AI)</div>
                  <div className="text-2xl font-bold text-gold-600 price-number">₹{result.predicted_tomorrow.toLocaleString()}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs text-red-500 font-semibold">-₹{(result.current_price - result.predicted_tomorrow).toLocaleString()}</span>
                  </div>
                </div>
                <div className="ap-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Est. Net Profit</div>
                  <div className="text-2xl font-bold text-green-700 price-number">₹{(result.current_price * quantity * 0.9).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">for {quantity}q</div>
                </div>
              </div>

              {/* Price chart */}
              <div className="ap-card p-5">
                <h4 className="font-bold text-forest-900 mb-4">Price History + Prediction</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.price_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(v) => [`₹${v.toLocaleString()}`, 'Price']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                    <ReferenceLine x="Today" stroke="#D4A017" strokeDasharray="4 4" label={{ value: 'Today', fontSize: 11, fill: '#D4A017' }} />
                    <Line
                      type="monotone" dataKey="price" stroke="#1B4332" strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props
                        return <circle key={payload.date} cx={cx} cy={cy} r={payload.predicted ? 5 : 4}
                          fill={payload.predicted ? '#D4A017' : '#1B4332'}
                          stroke={payload.predicted ? '#D4A017' : '#1B4332'}
                          strokeDasharray={payload.predicted ? '3 3' : '0'}
                        />
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-forest-700 inline-block"></span> Actual</span>
                  <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-gold-500 inline-block border-dashed border-t-2"></span> Predicted</span>
                </div>
              </div>

              {/* Market comparison */}
              <div className="ap-card p-5">
                <h4 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Best Market Comparison
                </h4>
                <div className="space-y-3">
                  {result.market_comparison.map((m, i) => (
                    <div key={m.market} className={`flex items-center gap-4 p-4 rounded-xl ${i === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-charcoal text-sm">{m.market}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.distance} km</span>
                          <span className="flex items-center gap-1"><Truck className="w-3 h-3" />Transport: ₹{m.transport}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-forest-900 price-number">₹{m.price.toLocaleString()}</div>
                        <div className={`text-sm font-bold price-number ${i === 0 ? 'text-green-700' : 'text-gray-500'}`}>
                          Net: ₹{m.net.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">Net price = Modal price − estimated transport cost per quintal</p>
              </div>

              {/* Feature importance */}
              <div className="ap-card p-5">
                <FeatureImportance features={result.features} />
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-bold">⚠️ Disclaimer:</span> This is an AI prediction, not a guarantee.
                  Actual mandi prices depend on many factors. Always verify today's price at your local APMC before selling.
                  AgriPrice is a decision-support tool, not financial advice.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
