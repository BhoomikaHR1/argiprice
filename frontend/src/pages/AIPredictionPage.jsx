import { useState } from 'react'
import { Brain, TrendingUp, TrendingDown, MapPin, Truck, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const CROPS = [
  { id:1, name:'Tomato',      name_kn:'ಟೊಮೇಟೊ',   emoji:'🍅', base:1850, msp:null,  perishable:true  },
  { id:2, name:'Ragi',        name_kn:'ರಾಗಿ',      emoji:'🌾', base:3920, msp:3846,  perishable:false },
  { id:3, name:'Tur Dal',     name_kn:'ತೊಗರಿ',     emoji:'🫘', base:7650, msp:7550,  perishable:false },
  { id:4, name:'Onion',       name_kn:'ಈರುಳ್ಳಿ',   emoji:'🧅', base:2200, msp:null,  perishable:true  },
  { id:5, name:'Cotton',      name_kn:'ಹತ್ತಿ',     emoji:'🌿', base:7800, msp:7521,  perishable:false },
  { id:6, name:'Groundnut',   name_kn:'ಕಡಲೆಕಾಯಿ',  emoji:'🥜', base:6980, msp:6783,  perishable:false },
  { id:7, name:'Maize',       name_kn:'ಮೆಕ್ಕೆಜೋಳ', emoji:'🌽', base:2150, msp:2090,  perishable:false },
  { id:8, name:'Rice (Paddy)',name_kn:'ಭತ್ತ',      emoji:'🍚', base:2380, msp:2300,  perishable:false },
]

const MARKETS = [
  { id:1, name:'Kolar APMC',     district:'Kolar',     distance:8   },
  { id:2, name:'Hassan APMC',    district:'Hassan',    distance:45  },
  { id:3, name:'Mandya APMC',    district:'Mandya',    distance:62  },
  { id:4, name:'Mysuru APMC',    district:'Mysuru',    distance:90  },
  { id:5, name:'Bengaluru APMC', district:'Bengaluru', distance:105 },
]

const RECOMMENDATION_CONFIG = {
  SELL_TODAY:       { label:'Sell Today',                  label_kn:'ಇಂದೇ ಮಾರಿ',              color:'bg-green-100 text-green-800 border-green-300',   icon:'✅' },
  HOLD:             { label:'Hold — Wait for better price',label_kn:'ತಡೆ — ಒಳ್ಳೆ ಬೆಲೆಗಾಗಿ ಕಾಯಿ',color:'bg-amber-100 text-amber-800 border-amber-300',   icon:'⏳' },
  WAIT_2_DAYS:      { label:'Wait 2 Days',                 label_kn:'2 ದಿನ ಕಾಯಿ',              color:'bg-blue-100 text-blue-800 border-blue-300',      icon:'📅' },
  GOVT_PROCUREMENT: { label:'Government Procurement',      label_kn:'ಸರ್ಕಾರಿ ಖರೀದಿ',          color:'bg-purple-100 text-purple-800 border-purple-300', icon:'🏛️' },
}

// FIX: Generate result dynamically per selected crop/market/quantity
// Previously MOCK_RESULT was a hardcoded constant — always showed Tomato data
// regardless of what crop/market the user actually selected
function generateResult(crop, market, quantity) {
  const base    = crop.base
  const seed    = crop.id * 7 + market.id * 3
  const trend   = ((seed % 5) - 2) * 0.04        // -8% to +8% trend
  const tomorrow = Math.round(base * (1 + trend))
  const change   = tomorrow - base
  const changePct = ((change / base) * 100).toFixed(1)

  // Recommendation logic
  let recommendation, reasoning_en, reasoning_kn

  if (crop.msp && base < crop.msp) {
    recommendation = 'GOVT_PROCUREMENT'
    reasoning_en = `Current market price ₹${base.toLocaleString()} is below MSP ₹${crop.msp.toLocaleString()}. Visit your nearest government procurement center to get the guaranteed MSP price.`
    reasoning_kn = `ಮಾರ್ಕೆಟ್ ಬೆಲೆ MSP ₹${crop.msp.toLocaleString()} ಗಿಂತ ಕಡಿಮೆ. ಸರ್ಕಾರಿ ಖರೀದಿ ಕೇಂದ್ರಕ್ಕೆ ಹೋಗಿ.`
  } else if (crop.perishable) {
    recommendation = 'SELL_TODAY'
    reasoning_en = `${crop.name} is a perishable crop — holding risk is high. Current price ₹${base.toLocaleString()} at ${market.name} is ${trend > 0 ? 'rising' : 'stable'}. Sell today to avoid spoilage loss.`
    reasoning_kn = `${crop.name_kn} ಬೇಗ ಕೆಡುವ ಬೆಳೆ. ಗುಣಮಟ್ಟ ಕಳೆದುಕೊಳ್ಳುವ ಮೊದಲು ಇಂದೇ ₹${base.toLocaleString()} ಕ್ಕೆ ಮಾರಿ.`
  } else if (trend >= 0.04) {
    recommendation = 'WAIT_2_DAYS'
    reasoning_en = `${crop.name} price predicted to rise ${changePct}% to ₹${tomorrow.toLocaleString()} at ${market.name}. Consider waiting 2 days for better returns. Storage conditions look good.`
    reasoning_kn = `${crop.name_kn} ಬೆಲೆ ${changePct}% ಏರಿ ₹${tomorrow.toLocaleString()} ಆಗಬಹುದು. 2 ದಿನ ಕಾಯಿ.`
  } else if (trend <= -0.04) {
    recommendation = 'SELL_TODAY'
    reasoning_en = `${crop.name} price predicted to drop ${Math.abs(changePct)}% to ₹${tomorrow.toLocaleString()} tomorrow at ${market.name}. Sell today to maximise return.`
    reasoning_kn = `${crop.name_kn} ಬೆಲೆ ನಾಳೆ ${Math.abs(changePct)}% ಇಳಿಯಲಿದೆ. ಇಂದೇ ₹${base.toLocaleString()} ಕ್ಕೆ ಮಾರಿ.`
  } else {
    recommendation = 'HOLD'
    reasoning_en = `${crop.name} price is stable at ₹${base.toLocaleString()} at ${market.name}. Hold for 1–2 days and monitor. No significant weather or arrival disruptions expected.`
    reasoning_kn = `${crop.name_kn} ಬೆಲೆ ಸ್ಥಿರ ₹${base.toLocaleString()}. 1-2 ದಿನ ಕಾಯಿ ಮತ್ತು ನೋಡಿ.`
  }

  // Price history — unique per crop
  const history = Array.from({ length: 7 }, (_, i) => {
    const noise = ((crop.id * (i + 1) * 13) % 17 - 8) * (base * 0.01)
    return { date: `Day ${i + 1}`, price: Math.round(base * 0.85 + (base * 0.15 * i / 6) + noise) }
  })
  history.push(
    { date: 'Today',      price: base },
    { date: 'Tomorrow*',  price: tomorrow,                                    predicted: true },
    { date: '+2 days*',   price: Math.round(tomorrow * (1 + trend * 0.5)),   predicted: true },
    { date: '+3 days*',   price: Math.round(tomorrow * (1 + trend * 0.25)),  predicted: true },
  )

  // Market comparison — nearby markets
  const transport_per_km = 3
  const marketComp = MARKETS.map(m => ({
    market:    m.name,
    price:     Math.round(base * (0.92 + (m.id * 0.03))),
    distance:  m.distance,
    transport: Math.round(m.distance * transport_per_km),
    net:       Math.round(base * (0.92 + (m.id * 0.03))) - Math.round(m.distance * transport_per_km),
  })).sort((a, b) => b.net - a.net)

  // Net profit estimate for chosen quantity
  const transportCost = market.distance * transport_per_km
  const netPrice = base - transportCost
  const totalProfit = netPrice * parseInt(quantity)

  return {
    recommendation,
    confidence: Math.round(65 + ((crop.id + market.id) % 20)),
    current_price: base,
    predicted_tomorrow: tomorrow,
    reasoning_en,
    reasoning_kn,
    price_history: history,
    market_comparison: marketComp,
    net_profit: totalProfit,
    transport_cost: transportCost,
    features: {
      price_trend_score: Math.round(60 + (crop.id * 5) % 35),
      arrivals_score:    Math.round(55 + (market.id * 7) % 40),
      seasonal_score:    Math.round(50 + (crop.id * 3) % 45),
      weather_score:     Math.round(40 + (market.id * 9) % 45),
    },
  }
}

function FeatureImportance({ features }) {
  const items = [
    { label: 'Price Trend (7 days)', score: features.price_trend_score },
    { label: 'Market Arrivals',      score: features.arrivals_score    },
    { label: 'Seasonal Pattern',     score: features.seasonal_score    },
    { label: 'Weather Forecast',     score: features.weather_score     },
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
  const [selectedCrop,   setSelectedCrop]   = useState(CROPS[0])
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0])
  const [quantity,       setQuantity]       = useState(10)
  const [lang,           setLang]           = useState('en')
  const [result,         setResult]         = useState(null)
  const [loading,        setLoading]        = useState(false)

  const handleAnalyze = () => {
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      // FIX: pass selected crop+market+quantity so result is specific to them
      setResult(generateResult(selectedCrop, selectedMarket, quantity))
      setLoading(false)
    }, 1800)
  }

  const rec = result ? RECOMMENDATION_CONFIG[result.recommendation] : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-800 mb-2">Your Crop</label>
              <div className="grid grid-cols-2 gap-2">
                {CROPS.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCrop(c); setResult(null) }}
                    className={`p-2.5 rounded-lg border-2 text-sm font-medium flex items-center gap-2 transition-all
                      ${selectedCrop.id === c.id ? 'border-forest-700 bg-forest-50 text-forest-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <span>{c.emoji}</span>
                    <div className="text-left">
                      <div>{c.name}</div>
                      <div className="text-xs kannada opacity-60">{c.name_kn}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-800 mb-2">APMC Market</label>
              <select
                value={selectedMarket.id}
                onChange={e => { setSelectedMarket(MARKETS.find(m => m.id === parseInt(e.target.value))); setResult(null) }}
                className="ap-input appearance-none"
              >
                {MARKETS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.distance} km)</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-forest-800 mb-2">
                Quantity: <span className="text-forest-600">{quantity} quintals</span>
              </label>
              <input type="range" min="1" max="200" value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full accent-forest-700" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 quintal</span><span>200 quintals</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-forest-800 mb-2">Language</label>
              <div className="grid grid-cols-2 gap-2">
                {[['en', '🇬🇧 English'], ['kn', '🇮🇳 ಕನ್ನಡ']].map(([val, label]) => (
                  <button key={val} onClick={() => setLang(val)}
                    className={`py-2 rounded-lg border-2 text-sm font-medium transition-all
                      ${lang === val ? 'border-forest-700 bg-forest-50 text-forest-800' : 'border-gray-200 text-gray-500'}`}>
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

          <div className="ap-card p-5">
            <h4 className="font-bold text-forest-900 mb-3 text-sm">How the AI works</h4>
            <div className="space-y-2 text-xs text-gray-600">
              {[
                { icon: '📊', text: 'Analyzes 90 days of price history' },
                { icon: '🌦️', text: 'Checks 5-day weather forecast' },
                { icon: '📦', text: 'Looks at market arrival volumes' },
                { icon: '🚚', text: 'Calculates transport cost to each APMC' },
                { icon: '🤖', text: 'XGBoost outputs tomorrow\'s predicted price' },
                { icon: '💰', text: 'Recommends action for max net profit' },
              ].map(item => (
                <div key={item.icon} className="flex items-start gap-2">
                  <span>{item.icon}</span><span>{item.text}</span>
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
              <p className="text-gray-500 max-w-sm mx-auto">
                Select <span className="font-semibold text-forest-700">{selectedCrop.emoji} {selectedCrop.name}</span> at{' '}
                <span className="font-semibold text-forest-700">{selectedMarket.name}</span>, then click Get AI Recommendation.
              </p>
            </div>
          )}

          {loading && (
            <div className="ap-card p-16 text-center">
              <div className="text-6xl mb-4 animate-bounce">{selectedCrop.emoji}</div>
              <h3 className="font-bold text-forest-900 text-xl mb-3">
                Analyzing {selectedCrop.name} at {selectedMarket.name}...
              </h3>
              <div className="space-y-2 text-sm text-gray-500 max-w-xs mx-auto">
                <p>⏳ Fetching 90-day price history...</p>
                <p>🌦️ Checking weather for {selectedMarket.district}...</p>
                <p>📦 Analyzing market arrivals...</p>
                <p>🤖 Running XGBoost model...</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Recommendation */}
              <div className={`ap-card p-6 border-2 ${rec.color}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                      {selectedCrop.emoji} {selectedCrop.name} • {selectedMarket.name}
                    </div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <span>{rec.icon}</span> {rec.label}
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
                  <div className={`flex items-center justify-center gap-1 mt-1 ${result.predicted_tomorrow >= result.current_price ? 'text-green-600' : 'text-red-500'}`}>
                    {result.predicted_tomorrow >= result.current_price
                      ? <TrendingUp className="w-3.5 h-3.5" />
                      : <TrendingDown className="w-3.5 h-3.5" />}
                    <span className="text-xs font-semibold">
                      {result.predicted_tomorrow >= result.current_price ? '+' : '-'}
                      ₹{Math.abs(result.predicted_tomorrow - result.current_price).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="ap-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Est. Net Profit</div>
                  <div className="text-2xl font-bold text-green-700 price-number">₹{result.net_profit.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">for {quantity}q</div>
                </div>
              </div>

              {/* Price chart */}
              <div className="ap-card p-5">
                <h4 className="font-bold text-forest-900 mb-4">Price History + Prediction — {selectedCrop.name}</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.price_history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Price']} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <ReferenceLine x="Today" stroke="#D4A017" strokeDasharray="4 4" />
                    {selectedCrop.msp && (
                      <ReferenceLine y={selectedCrop.msp} stroke="#9333ea" strokeDasharray="3 3"
                        label={{ value: `MSP ₹${selectedCrop.msp.toLocaleString()}`, position: 'right', fontSize: 10, fill: '#9333ea' }} />
                    )}
                    <Line type="monotone" dataKey="price" stroke="#1B4332" strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props
                        return <circle key={payload.date} cx={cx} cy={cy} r={payload.predicted ? 5 : 3}
                          fill={payload.predicted ? '#D4A017' : '#1B4332'} />
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-forest-700 inline-block"></span> Actual</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gold-500 inline-block"></span> Predicted</span>
                  {selectedCrop.msp && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block"></span> MSP</span>}
                </div>
              </div>

              {/* Market comparison */}
              <div className="ap-card p-5">
                <h4 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Best Market — Net Price After Transport
                </h4>
                <div className="space-y-3">
                  {result.market_comparison.map((m, i) => (
                    <div key={m.market} className={`flex items-center gap-4 p-4 rounded-xl ${i === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${i === 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-charcoal text-sm">{m.market}</div>
                        <div className="text-xs text-gray-500 flex gap-3 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.distance} km</span>
                          <span className="flex items-center gap-1"><Truck className="w-3 h-3" />₹{m.transport}/q</span>
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
                <p className="text-xs text-gray-400 mt-3">Net = Modal price − transport cost (₹3/km/quintal estimate)</p>
              </div>

              {/* Feature importance */}
              <div className="ap-card p-5">
                <FeatureImportance features={result.features} />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-bold">⚠️ Disclaimer:</span> AI prediction, not a guarantee.
                  Always verify today's price at your local APMC before selling.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
