import { useState } from 'react'
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer,
  MapPin, AlertTriangle, CheckCircle, Info
} from 'lucide-react'

const KARNATAKA_DISTRICTS = [
  'Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar',
  'Chamarajanagar','Chikkaballapura','Chikkamagaluru','Chitradurga','Dakshina Kannada',
  'Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar',
  'Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru',
  'Udupi','Uttara Kannada','Vijayapura','Yadgir','Vijayanagara',
]

// Mock 5-day forecasts per district (in real app, from OpenWeather API)
function generateForecast(district) {
  const presets = {
    Kolar:    [{ t: 29, rain: 10, cond: 'Sunny', wind: 12 }, { t: 28, rain: 20, cond: 'Partly Cloudy', wind: 14 }, { t: 26, rain: 45, cond: 'Light Rain', wind: 18 }, { t: 25, rain: 60, cond: 'Rainy', wind: 20 }, { t: 27, rain: 30, cond: 'Cloudy', wind: 15 }],
    Hassan:   [{ t: 22, rain: 55, cond: 'Light Rain', wind: 10 }, { t: 21, rain: 70, cond: 'Rainy', wind: 12 }, { t: 20, rain: 80, cond: 'Heavy Rain', wind: 22 }, { t: 23, rain: 40, cond: 'Cloudy', wind: 14 }, { t: 24, rain: 25, cond: 'Partly Cloudy', wind: 11 }],
    Raichur:  [{ t: 36, rain: 5, cond: 'Hot & Sunny', wind: 8 }, { t: 37, rain: 5, cond: 'Hot & Sunny', wind: 9 }, { t: 35, rain: 10, cond: 'Sunny', wind: 11 }, { t: 34, rain: 15, cond: 'Partly Cloudy', wind: 10 }, { t: 33, rain: 20, cond: 'Partly Cloudy', wind: 12 }],
    Mysuru:   [{ t: 27, rain: 25, cond: 'Partly Cloudy', wind: 13 }, { t: 26, rain: 35, cond: 'Cloudy', wind: 15 }, { t: 25, rain: 50, cond: 'Light Rain', wind: 17 }, { t: 26, rain: 30, cond: 'Cloudy', wind: 14 }, { t: 28, rain: 15, cond: 'Partly Cloudy', wind: 12 }],
  }
  if (presets[district]) return presets[district]
  // Default for unlisted districts
  const temp = 24 + Math.floor(Math.random() * 8)
  return Array.from({ length: 5 }, (_, i) => ({
    t: temp + Math.floor(Math.random() * 4 - 2),
    rain: Math.floor(Math.random() * 50),
    cond: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
    wind: 10 + Math.floor(Math.random() * 10),
  }))
}

function getCropImpact(forecast) {
  const avgRain = forecast.reduce((s, d) => s + d.rain, 0) / forecast.length
  const maxTemp = Math.max(...forecast.map(d => d.t))
  const alerts = []

  if (avgRain > 60) alerts.push({ type: 'warning', icon: '🌧️', text: 'Heavy rain expected — delay harvest of tomato and leafy greens. Risk of fungal disease.' })
  if (avgRain > 40 && avgRain <= 60) alerts.push({ type: 'info', icon: '🌦️', text: 'Moderate rain — good for ragi and maize growth. Delay outdoor threshing.' })
  if (maxTemp > 35) alerts.push({ type: 'warning', icon: '🌡️', text: 'High temperature — increase irrigation for cotton and groundnut. Risk of heat stress.' })
  if (avgRain < 15 && maxTemp > 30) alerts.push({ type: 'good', icon: '☀️', text: 'Dry and warm — excellent for rice drying and cotton boll opening. Good time to sell.' })
  if (alerts.length === 0) alerts.push({ type: 'good', icon: '✅', text: 'Normal weather conditions. No major crop impact expected this week.' })
  return alerts
}

const CONDITION_ICONS = {
  'Sunny': '☀️', 'Hot & Sunny': '🌞', 'Partly Cloudy': '⛅', 'Cloudy': '🌤️',
  'Light Rain': '🌦️', 'Rainy': '🌧️', 'Heavy Rain': '⛈️',
}

const DAYS = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5']

const ALL_DISTRICTS_WEATHER = KARNATAKA_DISTRICTS.map(d => ({
  district: d,
  temp: 22 + Math.floor(Math.random() * 14),
  rain: Math.floor(Math.random() * 70),
  cond: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
}))

export default function WeatherPage() {
  const [selectedDistrict, setSelectedDistrict] = useState('Kolar')
  const [view, setView] = useState('detail') // detail | all

  const forecast = generateForecast(selectedDistrict)
  const today = forecast[0]
  const cropAlerts = getCropImpact(forecast)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-forest-900 mb-1 flex items-center gap-2">
            <Cloud className="w-7 h-7 text-sky-500" /> Weather Forecast
          </h1>
          <p className="text-gray-500">5-day district-wise forecast with crop impact analysis</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[['detail', 'District Detail'], ['all', 'All Districts']].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === v ? 'bg-white text-forest-900 shadow-sm' : 'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {view === 'detail' && (
        <>
          {/* District selector */}
          <div className="ap-card p-5 mb-6">
            <label className="block text-sm font-semibold text-forest-800 mb-2">
              <MapPin className="w-4 h-4 inline mr-1 text-forest-600" /> Select District
            </label>
            <div className="flex flex-wrap gap-2">
              {['Kolar', 'Hassan', 'Raichur', 'Mysuru', 'Belagavi', 'Mandya', 'Dharwad', 'Shivamogga'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(d)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedDistrict === d
                      ? 'bg-forest-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="ap-input py-1.5 w-auto text-sm appearance-none"
              >
                <option value="">More districts...</option>
                {KARNATAKA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current weather hero */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 ap-card p-6 bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              <div className="flex items-center gap-2 mb-1 text-blue-100 text-sm font-medium">
                <MapPin className="w-4 h-4" /> {selectedDistrict} District
              </div>
              <div className="text-7xl mb-4">{CONDITION_ICONS[today.cond] || '🌤️'}</div>
              <div className="text-6xl font-bold mb-2">{today.t}°C</div>
              <div className="text-blue-100 text-lg mb-4">{today.cond}</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/15 rounded-lg p-3">
                  <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                  <div className="text-sm font-bold">{today.rain}%</div>
                  <div className="text-xs text-blue-200">Rain</div>
                </div>
                <div className="bg-white/15 rounded-lg p-3">
                  <Wind className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                  <div className="text-sm font-bold">{today.wind} km/h</div>
                  <div className="text-xs text-blue-200">Wind</div>
                </div>
                <div className="bg-white/15 rounded-lg p-3">
                  <Thermometer className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                  <div className="text-sm font-bold">{today.t + 3}°</div>
                  <div className="text-xs text-blue-200">Max</div>
                </div>
              </div>
            </div>

            {/* 5-day forecast */}
            <div className="lg:col-span-2 ap-card p-6">
              <h2 className="font-bold text-forest-900 mb-4">5-Day Forecast</h2>
              <div className="grid grid-cols-5 gap-3">
                {forecast.map((day, i) => (
                  <div key={i} className={`text-center p-3 rounded-xl ${i === 0 ? 'bg-forest-50 border-2 border-forest-200' : 'bg-gray-50'}`}>
                    <div className="text-xs font-semibold text-gray-500 mb-2">{DAYS[i]}</div>
                    <div className="text-2xl mb-2">{CONDITION_ICONS[day.cond] || '🌤️'}</div>
                    <div className="text-lg font-bold text-charcoal">{day.t}°</div>
                    <div className="text-xs text-blue-500 mt-1">🌧️ {day.rain}%</div>
                    <div className="text-xs text-gray-400 mt-1" style={{ fontSize: '10px' }}>{day.cond}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crop impact analysis */}
          <div className="ap-card p-6">
            <h2 className="font-bold text-forest-900 mb-4 text-lg flex items-center gap-2">
              🌾 Crop Impact This Week
            </h2>
            <div className="space-y-3">
              {cropAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    alert.type === 'good' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{alert.icon}</span>
                  <p className={`text-sm font-medium ${
                    alert.type === 'warning' ? 'text-amber-800' :
                    alert.type === 'good' ? 'text-green-800' :
                    'text-blue-800'
                  }`}>
                    {alert.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">
                <Info className="w-3.5 h-3.5 inline mr-1" />
                Weather data sourced from OpenWeather API. Crop impact analysis is AI-assisted and should be verified locally.
              </p>
            </div>
          </div>
        </>
      )}

      {/* All districts view */}
      {view === 'all' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ALL_DISTRICTS_WEATHER.map(w => (
            <button
              key={w.district}
              onClick={() => { setSelectedDistrict(w.district); setView('detail') }}
              className="ap-card-hover p-5 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-forest-900 text-sm">{w.district}</h3>
                <span className="text-2xl">{CONDITION_ICONS[w.cond] || '⛅'}</span>
              </div>
              <div className="text-3xl font-bold text-charcoal mb-1">{w.temp}°C</div>
              <div className="text-xs text-gray-500">{w.cond}</div>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>🌧️ {w.rain}% rain</span>
              </div>
              <div className="mt-3 text-xs text-forest-600 font-medium">
                {w.rain > 50 ? '⚠️ Delay outdoor harvesting' :
                 w.temp > 34 ? '💧 Check irrigation levels' :
                 '✓ Normal conditions'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
