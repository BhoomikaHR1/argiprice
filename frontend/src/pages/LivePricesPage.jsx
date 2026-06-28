import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, TrendingUp, TrendingDown, MapPin, RefreshCw, ChevronDown } from 'lucide-react'

const DISTRICTS = [
  'All Districts','Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban',
  'Bidar','Chamarajanagar','Chikkaballapura','Chikkamagaluru','Chitradurga',
  'Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri',
  'Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur',
  'Ramanagara','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir','Vijayanagara',
]

const ALL_PRICES = [
  { id:1, crop:'Tomato', crop_kn:'ಟೊಮೇಟೊ', emoji:'🍅', category:'Vegetables', modal:1850, min:1600, max:2100, prev:1620, arrivals:42.5, market:'Kolar APMC', district:'Kolar', msp:false, grade:'FAQ' },
  { id:2, crop:'Ragi', crop_kn:'ರಾಗಿ', emoji:'🌾', category:'Cereals', modal:3920, min:3700, max:4100, prev:3710, arrivals:28.0, market:'Hassan APMC', district:'Hassan', msp:true, msp_price:3846, grade:'FAQ' },
  { id:3, crop:'Onion', crop_kn:'ಈರುಳ್ಳಿ', emoji:'🧅', category:'Vegetables', modal:2200, min:1800, max:2600, prev:2350, arrivals:61.2, market:'Belagavi APMC', district:'Belagavi', msp:false, grade:'Medium' },
  { id:4, crop:'Tur Dal', crop_kn:'ತೊಗರಿ', emoji:'🫘', category:'Pulses', modal:7650, min:7200, max:8100, prev:7760, arrivals:15.3, market:'Kalaburagi APMC', district:'Kalaburagi', msp:true, msp_price:7550, grade:'FAQ' },
  { id:5, crop:'Cotton', crop_kn:'ಹತ್ತಿ', emoji:'🌿', category:'Fibres', modal:7800, min:7400, max:8200, prev:7550, arrivals:38.8, market:'Raichur APMC', district:'Raichur', msp:true, msp_price:7521, grade:'FAQ' },
  { id:6, crop:'Maize', crop_kn:'ಮೆಕ್ಕೆಜೋಳ', emoji:'🌽', category:'Cereals', modal:2150, min:1900, max:2300, prev:2170, arrivals:95.4, market:'Davanagere APMC', district:'Davanagere', msp:true, msp_price:2090, grade:'FAQ' },
  { id:7, crop:'Groundnut', crop_kn:'ಕಡಲೆಕಾಯಿ', emoji:'🥜', category:'Oilseeds', modal:6980, min:6500, max:7400, prev:6710, arrivals:22.1, market:'Vijayapura APMC', district:'Vijayapura', msp:true, msp_price:6783, grade:'FAQ' },
  { id:8, crop:'Mango', crop_kn:'ಮಾವು', emoji:'🥭', category:'Fruits', modal:4500, min:3800, max:5200, prev:3910, arrivals:14.7, market:'Bengaluru APMC', district:'Bengaluru Urban', msp:false, grade:'A' },
  { id:9, crop:'Jowar', crop_kn:'ಜೋಳ', emoji:'🌾', category:'Cereals', modal:3480, min:3200, max:3700, prev:3420, arrivals:44.5, market:'Dharwad APMC', district:'Dharwad', msp:true, msp_price:3371, grade:'FAQ' },
  { id:10, crop:'Rice (Paddy)', crop_kn:'ಭತ್ತ', emoji:'🍚', category:'Cereals', modal:2380, min:2200, max:2550, prev:2410, arrivals:120.3, market:'Mandya APMC', district:'Mandya', msp:true, msp_price:2300, grade:'FAQ' },
  { id:11, crop:'Banana', crop_kn:'ಬಾಳೆ', emoji:'🍌', category:'Fruits', modal:1200, min:900, max:1500, prev:1150, arrivals:31.2, market:'Mysuru APMC', district:'Mysuru', msp:false, grade:'A' },
  { id:12, crop:'Potato', crop_kn:'ಆಲೂಗಡ್ಡೆ', emoji:'🥔', category:'Vegetables', modal:1450, min:1200, max:1700, prev:1380, arrivals:55.8, market:'Chikkaballapura APMC', district:'Chikkaballapura', msp:false, grade:'A' },
  { id:13, crop:'Sunflower', crop_kn:'ಸೂರ್ಯಕಾಂತಿ', emoji:'🌻', category:'Oilseeds', modal:7150, min:6800, max:7500, prev:7080, arrivals:18.4, market:'Ballari APMC', district:'Ballari', msp:true, msp_price:7280, grade:'FAQ' },
  { id:14, crop:'Dry Red Chilli', crop_kn:'ಒಣ ಮೆಣಸು', emoji:'🌶️', category:'Spices', modal:18500, min:16000, max:21000, prev:17800, arrivals:8.9, market:'Byadagi APMC', district:'Haveri', msp:false, grade:'Byadagi' },
  { id:15, crop:'Arecanut', crop_kn:'ಅಡಿಕೆ', emoji:'🌴', category:'Spices', modal:45000, min:42000, max:48000, prev:44200, arrivals:6.2, market:'Shivamogga APMC', district:'Shivamogga', msp:false, grade:'Rashi' },
]

const CATEGORIES = ['All Categories', 'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Spices', 'Fibres']

function PriceChange({ current, prev }) {
  const pct = ((current - prev) / prev * 100).toFixed(1)
  const isUp = current >= prev
  return (
    <div className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
      {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      {Math.abs(pct)}%
    </div>
  )
}

export default function LivePricesPage() {
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('All Districts')
  const [category, setCategory] = useState('All Categories')
  const [mspOnly, setMspOnly] = useState(false)
  const [sortBy, setSortBy] = useState('crop')
  const [viewMode, setViewMode] = useState('table') // table | cards
  const [refreshing, setRefreshing] = useState(false)

  const filtered = useMemo(() => {
    let data = ALL_PRICES
    if (search) data = data.filter(p => p.crop.toLowerCase().includes(search.toLowerCase()) || p.crop_kn.includes(search))
    if (district !== 'All Districts') data = data.filter(p => p.district === district)
    if (category !== 'All Categories') data = data.filter(p => p.category === category)
    if (mspOnly) data = data.filter(p => p.msp)

    data = [...data].sort((a, b) => {
      if (sortBy === 'price_desc') return b.modal - a.modal
      if (sortBy === 'price_asc') return a.modal - b.modal
      if (sortBy === 'change') return ((b.modal - b.prev) / b.prev) - ((a.modal - a.prev) / a.prev)
      return a.crop.localeCompare(b.crop)
    })
    return data
  }, [search, district, category, mspOnly, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-forest-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-gold-500" /> Live Prices
          </h1>
          <p className="text-gray-500">Today's APMC mandi prices — Karnataka • Updated daily from Agmarknet</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1500) }}
          className="flex items-center gap-2 text-sm font-medium text-forest-600 hover:text-forest-900 bg-forest-50 hover:bg-forest-100 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters row */}
      <div className="ap-card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search crop... ಬೆಳೆ ಹುಡುಕಿ"
              className="ap-input pl-9 py-2.5"
            />
          </div>

          {/* District */}
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="ap-input py-2.5 w-auto min-w-40 appearance-none">
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>

          {/* Category */}
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="ap-input py-2.5 w-auto min-w-40 appearance-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="ap-input py-2.5 w-auto appearance-none">
            <option value="crop">Sort: A-Z</option>
            <option value="price_desc">Sort: Highest Price</option>
            <option value="price_asc">Sort: Lowest Price</option>
            <option value="change">Sort: Biggest Change</option>
          </select>

          {/* MSP toggle */}
          <button
            onClick={() => setMspOnly(!mspOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${mspOnly ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            MSP Only
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-forest-900">{filtered.length}</span> crops
          </p>
          <div className="flex gap-1">
            {['table', 'cards'].map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-all ${viewMode === m ? 'bg-forest-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="ap-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-forest-50 border-b border-forest-100">
                  <th className="text-left py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Crop</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Market</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Min</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Modal</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Max</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Change</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-forest-700 uppercase tracking-wider">Arrivals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-forest-50/50 transition-colors group">
                    <td className="py-3 px-4">
                      <Link to={`/crops/${p.id}`} className="flex items-center gap-3 group-hover:text-forest-700">
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-charcoal text-sm">{p.crop}</span>
                            {p.msp && <span className="msp-badge">MSP</span>}
                          </div>
                          <div className="text-xs text-gray-400 kannada">{p.crop_kn}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-charcoal">{p.market}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {p.district}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-500 price-number">₹{p.min.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-forest-900 price-number text-base">₹{p.modal.toLocaleString()}</span>
                      <div className="text-xs text-gray-400">/quintal</div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-500 price-number">₹{p.max.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right"><PriceChange current={p.modal} prev={p.prev} /></td>
                    <td className="py-3 px-4 text-right text-sm text-gray-500">{p.arrivals}T</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">No crops found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Card view */}
      {viewMode === 'cards' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <Link key={p.id} to={`/crops/${p.id}`} className="ap-card-hover p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-2xl">{p.emoji}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-charcoal text-sm">{p.crop}</span>
                      {p.msp && <span className="msp-badge">MSP</span>}
                    </div>
                    <div className="text-xs text-gray-400 kannada">{p.crop_kn}</div>
                  </div>
                </div>
                <PriceChange current={p.modal} prev={p.prev} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-forest-900 price-number">₹{p.modal.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">per quintal • {p.grade}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" /> {p.market}
              </div>
              {p.msp && (
                <div className="mt-2 text-xs text-gold-600 font-medium">
                  MSP: ₹{p.msp_price?.toLocaleString()} • {p.modal > p.msp_price ? `₹${(p.modal - p.msp_price).toLocaleString()} above MSP ✓` : 'Below MSP ⚠️'}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Data Source:</span> Prices sourced daily from Agmarknet (National Horticultural Board) and eNAM.
          All prices in ₹ per quintal (100 kg). Modal price = most common traded price of the day.
          Last updated: Today 6:00 AM IST.
        </p>
      </div>
    </div>
  )
}
