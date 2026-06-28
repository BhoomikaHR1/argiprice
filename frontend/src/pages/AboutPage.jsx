import { Link } from 'react-router-dom'
import { Leaf, BarChart3, Brain, Shield, Globe, Phone, Mail } from 'lucide-react'

const TEAM_VALUES = [
  { icon: '📊', title: 'Open Data', desc: 'Built on Agmarknet and eNAM — official government data portals. No proprietary data lock-in.' },
  { icon: '🤖', title: 'AI-Powered', desc: 'XGBoost model trained specifically on 5 years of Karnataka APMC data. Not a generic model.' },
  { icon: '👨‍🌾', title: 'Farmer-First', desc: 'Bilingual (English + Kannada), mobile-first, and free forever for Karnataka farmers.' },
  { icon: '🔓', title: 'Transparent', desc: 'We show our prediction confidence and data sources. No black boxes.' },
]

const STATS = [
  { num: '200+', label: 'APMC Markets' },
  { num: '60+', label: 'Crops Covered' },
  { num: '31', label: 'Districts' },
  { num: '100%', label: 'Free for Farmers' },
]

const TECH_STACK = [
  { layer: 'Frontend', tech: 'React 18 + Vite + Tailwind CSS', icon: '⚛️' },
  { layer: 'Backend', tech: 'FastAPI (Python) + PostgreSQL', icon: '⚡' },
  { layer: 'ML Model', tech: 'XGBoost + Scikit-learn + Pandas', icon: '🧮' },
  { layer: 'Data Source', tech: 'Agmarknet API + eNAM + OpenWeather', icon: '📡' },
  { layer: 'Infrastructure', tech: 'Docker + Redis caching', icon: '🐳' },
]

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-forest-900 rounded-2xl mb-6 shadow-xl">
          <Leaf className="w-10 h-10 text-gold-400" />
        </div>
        <h1 className="text-4xl font-bold text-forest-900 mb-3">About AgriPrice</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          AI-powered agricultural market intelligence for Karnataka's 50+ lakh smallholder farmers.
        </p>
        <p className="text-sm text-gray-400 kannada mt-2">
          ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ AI ಆಧಾರಿತ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {STATS.map(s => (
          <div key={s.label} className="ap-card p-5 text-center">
            <div className="text-3xl font-bold text-forest-900 price-number">{s.num}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="ap-card p-8 mb-8">
        <h2 className="text-2xl font-bold text-forest-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Karnataka's smallholder farmers face a fundamental information asymmetry — private traders and commission agents 
          have access to real-time market data, while farmers must make selling decisions based on rumour or last week's prices. 
          A farmer with a 2-tonne tomato harvest has minutes to decide whether to sell today or wait — without knowing what 
          tomorrow's market will bring.
        </p>
        <p className="text-gray-600 leading-relaxed">
          AgriPrice bridges this gap by combining Agmarknet's daily APMC data, OpenWeather forecasts, and a machine learning 
          model trained on 5 years of Karnataka price history to give every farmer the same information advantage that large 
          traders enjoy — in Kannada, on any mobile phone, for free.
        </p>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        {TEAM_VALUES.map(v => (
          <div key={v.title} className="ap-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{v.icon}</span>
              <h3 className="font-bold text-forest-900">{v.title}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div className="ap-card p-6 mb-8">
        <h2 className="text-xl font-bold text-forest-900 mb-4">How It Works</h2>
        <div className="space-y-3">
          {TECH_STACK.map(t => (
            <div key={t.layer} className="flex items-center gap-4 p-3 bg-forest-50 rounded-lg">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">{t.layer}</span>
                <p className="text-sm text-gray-700">{t.tech}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="ap-card p-6 mb-8">
        <h2 className="text-xl font-bold text-forest-900 mb-3">Data Sources & Disclaimer</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          All price data is sourced from <strong>Agmarknet</strong> (National Agricultural Market Network) and <strong>eNAM</strong> — 
          India's official government agricultural data portals. Weather data from <strong>OpenWeatherMap API</strong>.
          MSP data from CACP (Commission for Agricultural Costs and Prices) annual announcements.
        </p>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">
            <strong>Disclaimer:</strong> AgriPrice provides market intelligence for informational purposes. 
            AI price predictions carry inherent uncertainty — always verify prices at your local APMC before selling. 
            AgriPrice is not responsible for trading decisions made based on this data.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h3 className="font-bold text-forest-900 text-xl mb-3">Built for Karnataka's farmers</h3>
        <p className="text-gray-500 text-sm mb-6">Free. Bilingual. No ads. No data sold.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn-primary px-8 py-3">Join Free — ಉಚಿತ ನೋಂದಣಿ</Link>
          <Link to="/live-prices" className="btn-secondary px-8 py-3">See Live Prices</Link>
        </div>
      </div>
    </div>
  )
}
