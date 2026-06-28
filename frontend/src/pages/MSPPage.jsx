import { Link } from 'react-router-dom'
import { ShieldCheck, Info, TrendingUp, ExternalLink } from 'lucide-react'

const MSP_CROPS_2024_25 = [
  { emoji:'🌾', name:'Rice (Common)',   name_kn:'ಭತ್ತ',           msp:2300,  prev:2183, category:'Cereals' },
  { emoji:'🌾', name:'Rice (Grade A)', name_kn:'ಭತ್ತ (A ಗ್ರೇಡ್)',  msp:2320,  prev:2203, category:'Cereals' },
  { emoji:'🌾', name:'Ragi',           name_kn:'ರಾಗಿ',            msp:3846,  prev:3578, category:'Millets' },
  { emoji:'🌾', name:'Jowar (Hybrid)', name_kn:'ಜೋಳ (ಹೈಬ್ರಿಡ್)',  msp:3371,  prev:3180, category:'Millets' },
  { emoji:'🌾', name:'Bajra',          name_kn:'ಸಜ್ಜೆ',           msp:2625,  prev:2500, category:'Millets' },
  { emoji:'🌽', name:'Maize',          name_kn:'ಮೆಕ್ಕೆಜೋಳ',       msp:2090,  prev:1962, category:'Cereals' },
  { emoji:'🌾', name:'Wheat',          name_kn:'ಗೋಧಿ',            msp:2275,  prev:2150, category:'Cereals' },
  { emoji:'🫘', name:'Tur (Arhar)',    name_kn:'ತೊಗರಿ',           msp:7550,  prev:7000, category:'Pulses' },
  { emoji:'🫘', name:'Moong',          name_kn:'ಹೆಸರು',           msp:8682,  prev:8558, category:'Pulses' },
  { emoji:'🫘', name:'Urad',           name_kn:'ಉದ್ದು',           msp:7400,  prev:6950, category:'Pulses' },
  { emoji:'🫘', name:'Chana',          name_kn:'ಕಡಲೆ',            msp:5440,  prev:5335, category:'Pulses' },
  { emoji:'🫘', name:'Masur (Lentil)', name_kn:'ಮಸೂರ',            msp:6425,  prev:6000, category:'Pulses' },
  { emoji:'🥜', name:'Groundnut',      name_kn:'ಕಡಲೆಕಾಯಿ',        msp:6783,  prev:6377, category:'Oilseeds' },
  { emoji:'🌻', name:'Sunflower',      name_kn:'ಸೂರ್ಯಕಾಂತಿ',       msp:7280,  prev:6760, category:'Oilseeds' },
  { emoji:'🌱', name:'Soybean',        name_kn:'ಸೋಯಾಬೀನ್',         msp:4892,  prev:4600, category:'Oilseeds' },
  { emoji:'🌼', name:'Safflower',      name_kn:'ಕುಸುಂಬಿ',          msp:5800,  prev:5441, category:'Oilseeds' },
  { emoji:'⚪', name:'Sesamum',        name_kn:'ಎಳ್ಳು',            msp:9267,  prev:8635, category:'Oilseeds' },
  { emoji:'🌿', name:'Cotton (Medium)',name_kn:'ಹತ್ತಿ (ಮಧ್ಯಮ)',    msp:7121,  prev:6620, category:'Fibres' },
  { emoji:'🌿', name:'Cotton (Long)', name_kn:'ಹತ್ತಿ (ಉದ್ದ)',      msp:7521,  prev:7020, category:'Fibres' },
  { emoji:'🌿', name:'Jute',           name_kn:'ಸೆಣಬು',           msp:5335,  prev:4750, category:'Fibres' },
]

const CATEGORIES = ['All', 'Cereals', 'Millets', 'Pulses', 'Oilseeds', 'Fibres']

import { useState } from 'react'

export default function MSPPage() {
  const [filterCat, setFilterCat] = useState('All')

  const filtered = filterCat === 'All' ? MSP_CROPS_2024_25 : MSP_CROPS_2024_25.filter(c => c.category === filterCat)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-gold-500" /> MSP — Minimum Support Price 2024-25
        </h1>
        <p className="text-gray-500">Government-announced minimum prices for major crops. Farmers are entitled to at least this price.</p>
      </div>

      {/* Info banner */}
      <div className="ap-card p-5 mb-6 border-l-4 border-gold-500 bg-gold-50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gold-800 mb-1">What is MSP?</h3>
            <p className="text-sm text-gold-700 leading-relaxed">
              Minimum Support Price (MSP) is the government-guaranteed price for your crop.
              If market prices fall below MSP, the government procures your crop at MSP.
              The Cabinet Committee on Economic Affairs (CCEA) announces MSP annually before the sowing season.
            </p>
            <p className="text-sm text-gold-700 mt-2">
              <strong>Note:</strong> MSP applies only to government procurement centers (NAFED, FCI, Karnataka State Govt mandis).
              Private buyers at APMC may pay above or below MSP based on market conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterCat === cat ? 'bg-forest-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* MSP Table */}
      <div className="ap-card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-forest-50 border-b border-forest-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Crop</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Category</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">MSP 2024-25 (₹/q)</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">MSP 2023-24</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Increase</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Today's Market</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(crop => {
                const increase = crop.msp - crop.prev
                const pct = ((increase / crop.prev) * 100).toFixed(1)
                const marketPrice = Math.floor(crop.msp * (0.9 + Math.random() * 0.3))
                const aboveMsp = marketPrice >= crop.msp
                return (
                  <tr key={crop.name} className="hover:bg-forest-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{crop.emoji}</span>
                        <div>
                          <div className="font-semibold text-charcoal">{crop.name}</div>
                          <div className="text-xs text-gray-400 kannada">{crop.name_kn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-forest-50 text-forest-700 rounded-full text-xs font-medium">{crop.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-forest-900 price-number text-lg">₹{crop.msp.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-gray-500 price-number">₹{crop.prev.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="text-green-600 font-semibold price-number">+₹{increase}</div>
                      <div className="text-xs text-green-500">+{pct}%</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className={`font-semibold price-number ${aboveMsp ? 'text-green-700' : 'text-red-600'}`}>
                        ₹{marketPrice.toLocaleString()}
                      </div>
                      <div className={`text-xs font-medium ${aboveMsp ? 'text-green-500' : 'text-red-400'}`}>
                        {aboveMsp ? `✓ +₹${(marketPrice - crop.msp).toLocaleString()} above MSP` : `⚠️ Below MSP`}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to claim MSP */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="ap-card p-6">
          <h3 className="font-bold text-forest-900 mb-4">How to Sell at MSP in Karnataka</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {[
              { step: '1', text: 'Register at your nearest APMC or PM-KISAN portal' },
              { step: '2', text: 'Get your farmer ID and land records (RTC / Pahani)' },
              { step: '3', text: 'Visit nearest government procurement center (NAFED / KSCMF)' },
              { step: '4', text: 'Bring crop sample for grading — must meet FAQ (Fair Average Quality) standards' },
              { step: '5', text: 'Payment via DBT (Direct Benefit Transfer) within 48-72 hours' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-forest-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{item.step}</div>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ap-card p-6">
          <h3 className="font-bold text-forest-900 mb-4">Helplines & Resources</h3>
          <div className="space-y-3">
            {[
              { name: 'Kisan Call Centre', num: '1800-180-1551', desc: 'Free helpline for all farm queries' },
              { name: 'PM-KISAN Portal', num: 'pmkisan.gov.in', desc: 'Register and check installment status' },
              { name: 'NAFED', num: 'nafed.com', desc: 'Government procurement for oilseeds & pulses' },
              { name: 'Karnataka Rythu Seva Kendra', num: '1800-425-1353', desc: 'Karnataka state agricultural helpline' },
            ].map(r => (
              <div key={r.name} className="flex items-start gap-3 p-3 bg-forest-50 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-forest-800 text-sm">{r.name}</div>
                  <div className="text-forest-600 text-sm font-mono">{r.num}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
