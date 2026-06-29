import { useState } from 'react'
import { Brain, CloudRain, Info, MapPin, TrendingDown, TrendingUp, Truck } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { marketApi, predictionApi } from '../utils/api'

const CROPS = [
  { id: 20, name: 'Tomato', name_kn: 'ಟೊಮೇಟೊ', emoji: '🍅', perishable: true },
  { id: 2, name: 'Ragi', name_kn: 'ರಾಗಿ', emoji: '🌾', perishable: false },
  { id: 7, name: 'Tur Dal', name_kn: 'ತೊಗರಿ', emoji: '🫘', perishable: false },
  { id: 21, name: 'Onion', name_kn: 'ಈರುಳ್ಳಿ', emoji: '🧅', perishable: true },
  { id: 59, name: 'Cotton', name_kn: 'ಹತ್ತಿ', emoji: '🌿', perishable: false },
  { id: 13, name: 'Groundnut', name_kn: 'ಕಡಲೆಕಾಯಿ', emoji: '🥜', perishable: false },
  { id: 3, name: 'Maize', name_kn: 'ಮೆಕ್ಕೆಜೋಳ', emoji: '🌽', perishable: false },
  { id: 1, name: 'Rice (Paddy)', name_kn: 'ಭತ್ತ', emoji: '🍚', perishable: false },
]

const MARKETS = [
  { id: 1, name: 'Kolar APMC', district: 'Kolar', distance: 8 },
  { id: 2, name: 'Hassan APMC', district: 'Hassan', distance: 45 },
  { id: 3, name: 'Mandya APMC', district: 'Mandya', distance: 62 },
  { id: 4, name: 'Mysuru APMC', district: 'Mysuru', distance: 90 },
  { id: 5, name: 'Bengaluru APMC', district: 'Bengaluru', distance: 105 },
]

const RECOMMENDATION_STYLES = {
  SELL_TODAY: 'bg-green-100 text-green-800 border-green-300',
  WAIT_2_DAYS: 'bg-blue-100 text-blue-800 border-blue-300',
  HOLD: 'bg-amber-100 text-amber-800 border-amber-300',
  GOVT_PROCUREMENT: 'bg-violet-100 text-violet-800 border-violet-300',
}

function findMatchingPredictionMarket(nearestMarket) {
  if (!nearestMarket) return null

  const normalizedNearestName = nearestMarket.name_en?.toLowerCase() || ''
  const normalizedNearestDistrict = nearestMarket.district_name?.toLowerCase() || ''

  return MARKETS.find((market) => {
    const marketName = market.name.toLowerCase()
    const marketDistrict = market.district.toLowerCase()

    return (
      marketName.includes(normalizedNearestDistrict) ||
      normalizedNearestName.includes(marketDistrict) ||
      marketName.includes(normalizedNearestName)
    )
  }) || null
}

function FeatureImportance({ features }) {
  const rows = [
    { label: 'Price trend', score: features.price_trend_score },
    { label: 'Market arrivals', score: features.arrivals_score },
    { label: 'Seasonality', score: features.seasonal_score },
    { label: 'Weather outlook', score: features.weather_score },
  ]

  return (
    <div className="ap-card p-5">
      <h4 className="text-sm font-bold text-forest-900 mb-3 flex items-center gap-1.5">
        <Info className="w-4 h-4" /> What influenced the prediction
      </h4>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-gray-600">{row.label}</span>
              <span className="font-semibold text-charcoal">{row.score}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-forest-600 rounded-full" style={{ width: `${row.score}%` }} />
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
  const [error, setError] = useState('')
  const [nearestMarket, setNearestMarket] = useState(null)
  const [nearestPredictionMarket, setNearestPredictionMarket] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    setError('')

    try {
      const response = await predictionApi.recommend(selectedCrop.id, selectedMarket.id, quantity / 10)
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFindNearestMarket = () => {
    setLocationError('')
    setLocationLoading(true)

    if (!navigator.geolocation) {
      setLocationError('Location access is not supported in this browser.')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await marketApi.nearest(position.coords.latitude, position.coords.longitude, 1)
          const nearest = response.data?.[0] || null
          const matchedMarket = findMatchingPredictionMarket(nearest)

          setNearestMarket(nearest)
          setNearestPredictionMarket(matchedMarket)

          if (matchedMarket) {
            setSelectedMarket(matchedMarket)
            setResult(null)
          }
        } catch (err) {
          setLocationError(err.response?.data?.detail || 'Could not fetch the nearest market.')
        } finally {
          setLocationLoading(false)
        }
      },
      () => {
        setLocationError('Please allow location access to find the nearest selling market.')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  const recommendation = result?.recommendation
  const recommendationMeta = result?.recommendation_meta
  const recommendationStyle = recommendation ? RECOMMENDATION_STYLES[recommendation] : ''
  const currentCropMsp = result?.crop?.msp_price
  const chartData = result?.price_history || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <Brain className="w-7 h-7 text-forest-700" /> AI Price Prediction
        </h1>
        <p className="text-gray-500">
          Forecast next 3 days of crop prices using weather, recent price trend, arrivals, and seasonal behavior.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="ap-card p-6">
            <h3 className="font-bold text-forest-900 mb-4">Select Crop & Market</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-800 mb-2">Your Crop</label>
              <div className="grid grid-cols-2 gap-2">
                {CROPS.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => { setSelectedCrop(crop); setResult(null) }}
                    className={`p-2.5 rounded-lg border-2 text-sm font-medium flex items-center gap-2 transition-all ${
                      selectedCrop.id === crop.id
                        ? 'border-forest-700 bg-forest-50 text-forest-800'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{crop.emoji}</span>
                    <div className="text-left">
                      <div>{crop.name}</div>
                      <div className="text-xs kannada opacity-60">{crop.name_kn}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-forest-800 mb-2">APMC Market</label>
              <select
                value={selectedMarket.id}
                onChange={(e) => {
                  setSelectedMarket(MARKETS.find((market) => market.id === parseInt(e.target.value, 10)))
                  setResult(null)
                }}
                className="ap-input appearance-none"
              >
                {MARKETS.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.name} ({market.distance} km)
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5 rounded-2xl border border-forest-100 bg-forest-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-forest-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Nearest selling location
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Use your current location to find the closest market for selling.
                  </p>
                </div>
                <button
                  onClick={handleFindNearestMarket}
                  disabled={locationLoading}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-forest-800 border border-forest-200 hover:border-forest-400 transition-colors disabled:opacity-60"
                >
                  {locationLoading ? 'Finding...' : 'Use My Location'}
                </button>
              </div>

              {nearestMarket && (
                <div className="mt-4 rounded-xl bg-white p-4 border border-green-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-charcoal">{nearestMarket.name_en}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {nearestMarket.district_name} • {nearestMarket.distance_km} km away
                      </div>
                    </div>
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Nearest
                    </div>
                  </div>
                  {nearestPredictionMarket && (
                    <p className="text-xs text-forest-700 mt-3">
                      Prediction market auto-selected as <span className="font-semibold">{nearestPredictionMarket.name}</span>.
                    </p>
                  )}
                </div>
              )}

              {locationError && <p className="mt-3 text-xs text-red-600">{locationError}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-forest-800 mb-2">
                Quantity: <span className="text-forest-600">{quantity} quintals</span>
              </label>
              <input
                type="range"
                min="1"
                max="200"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full accent-forest-700"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 quintal</span>
                <span>200 quintals</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-forest-800 mb-2">Language</label>
              <div className="grid grid-cols-2 gap-2">
                {[['en', 'English'], ['kn', 'ಕನ್ನಡ']].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setLang(value)}
                    className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      lang === value ? 'border-forest-700 bg-forest-50 text-forest-800' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                : <><Brain className="w-5 h-5" /> Predict Next 3 Days</>
              }
            </button>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="ap-card p-5">
            <h4 className="font-bold text-forest-900 mb-3 text-sm">Prediction criteria</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div>📊 Recent 7-day and 30-day price momentum</div>
              <div>🌦️ Weather outlook for the next 3 days</div>
              <div>📦 Expected arrivals and supply pressure</div>
              <div>🌾 Crop perishability and seasonal behavior</div>
              <div>🚚 Market transport cost and net return</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {!result && !loading && !error && (
            <div className="ap-card p-16 text-center">
              <div className="text-6xl mb-4">{selectedCrop.emoji}</div>
              <h3 className="font-bold text-forest-900 text-xl mb-2">Ready for a 3-day forecast</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Choose a crop and market, then run the prediction to see price estimates for tomorrow, +2 days, and +3 days.
              </p>
            </div>
          )}

          {loading && (
            <div className="ap-card p-16 text-center">
              <div className="text-6xl mb-4 animate-bounce">{selectedCrop.emoji}</div>
              <h3 className="font-bold text-forest-900 text-xl mb-3">
                Forecasting {selectedCrop.name} at {selectedMarket.name}...
              </h3>
              <div className="space-y-2 text-sm text-gray-500 max-w-xs mx-auto">
                <p>📈 Studying recent price movement...</p>
                <p>🌦️ Checking district weather impact...</p>
                <p>📦 Estimating arrival pressure...</p>
                <p>🤖 Generating next 3-day prediction...</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              <div className={`ap-card p-6 border-2 ${recommendationStyle}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                      {selectedCrop.emoji} {result.crop.name_en} • {result.market.name}
                    </div>
                    <div className="text-2xl font-bold">
                      {lang === 'kn' ? recommendationMeta.label_kn : recommendationMeta.label_en}
                    </div>
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

              {(nearestMarket || result.best_market) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {nearestMarket && (
                    <div className="ap-card p-5 border border-forest-200 bg-forest-50/70">
                      <div className="text-xs font-bold uppercase tracking-widest text-forest-700 mb-2">Nearest Selling Location</div>
                      <div className="text-xl font-bold text-forest-900">{nearestMarket.name_en}</div>
                      <div className="text-sm text-gray-600 mt-1">{nearestMarket.district_name}</div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-forest-800 border border-forest-200">
                        <MapPin className="w-4 h-4" /> {nearestMarket.distance_km} km from you
                      </div>
                    </div>
                  )}

                  {result.best_market && (
                    <div className="ap-card p-5 border border-gold-200 bg-gold-50/70">
                      <div className="text-xs font-bold uppercase tracking-widest text-gold-700 mb-2">Best Market To Sell</div>
                      <div className="text-xl font-bold text-forest-900">{result.best_market.market}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.best_market.district}</div>
                      <div className="mt-3 text-sm text-gray-700">
                        Net return <span className="font-bold text-green-700 price-number">â‚¹{result.best_market.net.toLocaleString()}</span> after transport
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-4 gap-4">
                <div className="ap-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Today</div>
                  <div className="text-2xl font-bold text-forest-900 price-number">₹{result.current_price.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">/quintal</div>
                </div>
                {result.next_3_days.map((day) => (
                  <div key={day.day} className="ap-card p-4 text-center border-2 border-gold-200">
                    <div className="text-xs text-gold-700 mb-1 font-bold">Day +{day.day}</div>
                    <div className="text-2xl font-bold text-gold-700 price-number">₹{day.predicted_price.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">{day.date}</div>
                  </div>
                ))}
              </div>

              <div className="ap-card p-5">
                <h4 className="font-bold text-forest-900 mb-4">
                  Next 3 Days Price Forecast
                </h4>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Price']} />
                    <ReferenceLine x="Tomorrow" stroke="#D4A017" strokeDasharray="4 4" />
                    {currentCropMsp && (
                      <ReferenceLine
                        y={currentCropMsp}
                        stroke="#7c3aed"
                        strokeDasharray="3 3"
                        label={{ value: `MSP ₹${currentCropMsp.toLocaleString()}`, position: 'right', fontSize: 10, fill: '#7c3aed' }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#1B4332"
                      strokeWidth={2.5}
                      dot={(props) => {
                        const { cx, cy, payload } = props
                        return (
                          <circle
                            key={payload.date}
                            cx={cx}
                            cy={cy}
                            r={payload.predicted ? 5 : 3}
                            fill={payload.predicted ? '#D4A017' : '#1B4332'}
                          />
                        )
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <div className="ap-card p-5">
                  <h4 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
                    <CloudRain className="w-4 h-4" /> Weather-led 3-day view
                  </h4>
                  <div className="space-y-3">
                    {result.next_3_days.map((day) => (
                      <div key={day.day} className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-charcoal">Day +{day.day}</div>
                            <div className="text-xs text-gray-500">{day.weather.condition}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-forest-900">₹{day.predicted_price.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">{day.date}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>Temp: {day.weather.temperature}°C</div>
                          <div>Humidity: {day.weather.humidity}%</div>
                          <div>Rain: {day.weather.rainfall_mm} mm</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ap-card p-5">
                  <h4 className="font-bold text-forest-900 mb-4">Criteria used for prediction</h4>
                  <div className="space-y-3">
                    {result.criteria_used.map((criterion) => (
                      <div key={criterion.label} className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-charcoal text-sm">{criterion.label}</div>
                          <div className="text-xs font-bold text-forest-700">{criterion.impact_score}%</div>
                        </div>
                        <p className="text-xs text-gray-600">{criterion.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ap-card p-5">
                <h4 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Market comparison
                </h4>
                <div className="space-y-3">
                  {result.market_comparison.map((market, index) => (
                    <div key={market.market} className={`flex items-center gap-4 p-4 rounded-xl ${index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${index === 0 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-charcoal text-sm">{market.market}</div>
                        <div className="text-xs text-gray-500 flex gap-3 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{market.distance} km</span>
                          <span className="flex items-center gap-1"><Truck className="w-3 h-3" />₹{market.transport}/q</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-forest-900 price-number">₹{market.price.toLocaleString()}</div>
                        <div className={`text-sm font-bold price-number ${index === 0 ? 'text-green-700' : 'text-gray-500'}`}>
                          Net: ₹{market.net.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="ap-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">7-day Avg</div>
                  <div className="text-2xl font-bold text-forest-900 price-number">₹{result.price_7d_avg.toLocaleString()}</div>
                </div>
                <div className="ap-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Expected Net Profit</div>
                  <div className="text-2xl font-bold text-green-700 price-number">₹{result.est_net_profit.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">for {quantity}q</div>
                </div>
                <div className="ap-card p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">3-day Direction</div>
                  <div className={`inline-flex items-center justify-center gap-1 text-lg font-bold ${result.predicted_3day >= result.current_price ? 'text-green-700' : 'text-red-600'}`}>
                    {result.predicted_3day >= result.current_price ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {result.predicted_pct_change}%
                  </div>
                </div>
              </div>

              <FeatureImportance features={result.features} />

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-bold">Disclaimer:</span> This is a decision-support forecast based on weather, arrivals, trend, and crop behavior. Verify today&apos;s mandi rate before selling.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
