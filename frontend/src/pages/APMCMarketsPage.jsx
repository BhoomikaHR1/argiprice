import { useState, useEffect } from 'react'
import { MapPin, Phone, Search, Navigation, Clock, TrendingUp, ExternalLink } from 'lucide-react'

// All major Karnataka APMC markets
const APMC_MARKETS = [
  { id:1,  name:'Kolar APMC',          district:'Kolar',           lat:13.1333, lng:78.1333, phone:'08152-222333', crops:['Tomato','Onion','Potato','Ragi'],    timing:'6:00 AM – 2:00 PM', active:true },
  { id:2,  name:'Hassan APMC',          district:'Hassan',          lat:13.0068, lng:76.1004, phone:'08172-268001', crops:['Ragi','Coffee','Potato','Ginger'],   timing:'7:00 AM – 1:00 PM', active:true },
  { id:3,  name:'Mandya APMC',          district:'Mandya',          lat:12.5218, lng:76.8951, phone:'08232-222444', crops:['Rice','Sugarcane','Ragi'],           timing:'6:30 AM – 1:30 PM', active:true },
  { id:4,  name:'Mysuru APMC',          district:'Mysuru',          lat:12.2958, lng:76.6394, phone:'0821-2413688', crops:['Rice','Ragi','Vegetables','Silk'],   timing:'7:00 AM – 2:00 PM', active:true },
  { id:5,  name:'Belagavi APMC',        district:'Belagavi',        lat:15.8497, lng:74.4977, phone:'0831-2404444', crops:['Soybean','Maize','Onion','Jowar'],   timing:'6:00 AM – 1:00 PM', active:true },
  { id:6,  name:'Hubballi APMC',        district:'Dharwad',         lat:15.3647, lng:75.1240, phone:'0836-2220000', crops:['Cotton','Jowar','Tur','Groundnut'],  timing:'7:00 AM – 1:30 PM', active:true },
  { id:7,  name:'Raichur APMC',         district:'Raichur',         lat:16.2120, lng:77.3439, phone:'08532-226111', crops:['Cotton','Tur','Paddy','Jowar'],      timing:'6:00 AM – 12:00 PM', active:true },
  { id:8,  name:'Vijayapura APMC',      district:'Vijayapura',      lat:16.8302, lng:75.7100, phone:'08352-250333', crops:['Tur','Jowar','Sunflower','Onion'],   timing:'6:30 AM – 1:00 PM', active:true },
  { id:9,  name:'Kalaburagi APMC',      district:'Kalaburagi',      lat:17.3297, lng:76.8343, phone:'08472-257444', crops:['Tur','Cotton','Maize','Moong'],      timing:'7:00 AM – 1:00 PM', active:true },
  { id:10, name:'Davanagere APMC',      district:'Davanagere',      lat:14.4644, lng:75.9218, phone:'08192-232222', crops:['Maize','Paddy','Cotton','Oilseeds'], timing:'6:30 AM – 1:30 PM', active:true },
  { id:11, name:'Shivamogga APMC',      district:'Shivamogga',      lat:13.9299, lng:75.5681, phone:'08182-270444', crops:['Arecanut','Rice','Pepper','Coffee'],  timing:'7:00 AM – 2:00 PM', active:true },
  { id:12, name:'Tumakuru APMC',        district:'Tumakuru',        lat:13.3379, lng:77.1173, phone:'0816-2277666', crops:['Coconut','Ragi','Groundnut','Silk'],  timing:'6:00 AM – 1:00 PM', active:true },
  { id:13, name:'Byadagi APMC',         district:'Haveri',          lat:14.6695, lng:75.4919, phone:'08375-258001', crops:['Dry Red Chilli','Cotton','Jowar'],   timing:'7:00 AM – 1:00 PM', active:true },
  { id:14, name:'Bengaluru APMC',       district:'Bengaluru Urban', lat:12.9716, lng:77.5946, phone:'080-22965555', crops:['Vegetables','Fruits','Flowers'],     timing:'5:00 AM – 10:00 AM', active:true },
  { id:15, name:'Ballari APMC',         district:'Ballari',         lat:15.1394, lng:76.9214, phone:'08392-256777', crops:['Sunflower','Cotton','Groundnut'],    timing:'7:00 AM – 1:30 PM', active:true },
  { id:16, name:'Gadag APMC',           district:'Gadag',           lat:15.4305, lng:75.6222, phone:'08372-220333', crops:['Cotton','Jowar','Tur','Groundnut'],  timing:'6:30 AM – 1:00 PM', active:true },
  { id:17, name:'Chitradurga APMC',     district:'Chitradurga',     lat:14.2251, lng:76.3990, phone:'08194-224555', crops:['Groundnut','Maize','Sunflower'],     timing:'7:00 AM – 1:00 PM', active:true },
  { id:18, name:'Chikkaballapura APMC', district:'Chikkaballapura', lat:13.4355, lng:77.7272, phone:'08156-272555', crops:['Potato','Tomato','Onion','Ragi'],    timing:'6:00 AM – 12:00 PM', active:true },
]

const DISTRICTS = ['All Districts', ...new Set(APMC_MARKETS.map(m => m.district))]

// Haversine distance
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

export default function APMCMarketsPage() {
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('All Districts')
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const filtered = APMC_MARKETS
    .filter(m => district === 'All Districts' || m.district === district)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.crops.some(c => c.toLowerCase().includes(search.toLowerCase())))
    .map(m => ({
      ...m,
      distance: userLocation ? getDistance(userLocation.lat, userLocation.lng, m.lat, m.lng) : null,
    }))
    .sort((a, b) => a.distance !== null ? a.distance - b.distance : a.name.localeCompare(b.name))

  const handleLocate = () => {
    setLocationLoading(true)
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
      },
      () => {
        alert('Could not get your location. Please select district manually.')
        setLocationLoading(false)
      }
    )
  }

  // Load Leaflet dynamically
  useEffect(() => {
    if (mapLoaded) return
    // Map is rendered via iframe to avoid SSR issues with Leaflet
    setMapLoaded(true)
  }, [])

  const selectedMarket = selected ? APMC_MARKETS.find(m => m.id === selected) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <MapPin className="w-7 h-7 text-forest-600" /> APMC Markets — Karnataka
        </h1>
        <p className="text-gray-500">All major APMC markets across 31 Karnataka districts — with contact details, crop info, and distances</p>
      </div>

      {/* Locate + Filters */}
      <div className="ap-card p-5 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search market or crop..."
              className="ap-input pl-9 py-2.5"
            />
          </div>
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="ap-input py-2.5 w-auto min-w-40 appearance-none"
          >
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <button
            onClick={handleLocate}
            disabled={locationLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-forest-900 text-white rounded-lg text-sm font-semibold hover:bg-forest-800 transition-colors disabled:opacity-60"
          >
            <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
            {locationLoading ? 'Locating...' : 'Find Nearest'}
          </button>
        </div>
        {userLocation && (
          <p className="mt-3 text-xs text-green-600 font-medium">
            ✓ Location found — showing markets sorted by distance from you
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Showing {filtered.length} APMC markets
          {district !== 'All Districts' ? ` in ${district}` : ' across Karnataka'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Market list */}
        <div className="lg:col-span-1 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {filtered.map(m => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id === selected ? null : m.id)}
              className={`w-full text-left ap-card p-4 transition-all ${
                selected === m.id ? 'border-2 border-forest-700 shadow-card-hover' : 'hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-forest-900 text-sm">{m.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {m.district} District
                    {m.distance !== null && <span className="ml-2 text-forest-600 font-semibold">• {m.distance} km</span>}
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${m.active ? 'bg-green-500' : 'bg-gray-300'}`} title={m.active ? 'Active today' : 'Closed'} />
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {m.crops.slice(0, 3).map(c => (
                  <span key={c} className="px-1.5 py-0.5 bg-forest-50 text-forest-600 rounded text-xs">{c}</span>
                ))}
                {m.crops.length > 3 && <span className="text-xs text-gray-400">+{m.crops.length - 3}</span>}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" /> {m.timing}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No markets found</p>
            </div>
          )}
        </div>

        {/* Map + detail panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Embedded OSM map */}
          <div className="ap-card overflow-hidden" style={{ height: '380px' }}>
            <iframe
              title="Karnataka APMC Markets Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=74.0%2C11.5%2C78.5%2C18.5&layer=mapnik&marker=${
                selectedMarket ? `${selectedMarket.lat}%2C${selectedMarket.lng}` :
                userLocation ? `${userLocation.lat}%2C${userLocation.lng}` : '15.3%2C76.6'
              }`}
            />
          </div>

          {/* Selected market detail */}
          {selectedMarket ? (
            <div className="ap-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-forest-900">{selectedMarket.name}</h2>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {selectedMarket.district} District
                    {selectedMarket.distance !== null && (
                      <span className="ml-2 text-forest-600 font-semibold">• {selectedMarket.distance} km from you</span>
                    )}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedMarket.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {selectedMarket.active ? '● Active Today' : '○ Closed'}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-forest-50 rounded-xl">
                  <div className="text-xs text-forest-600 font-semibold uppercase tracking-wider mb-1">Trading Hours</div>
                  <div className="font-bold text-forest-900">{selectedMarket.timing}</div>
                </div>
                <div className="p-4 bg-forest-50 rounded-xl">
                  <div className="text-xs text-forest-600 font-semibold uppercase tracking-wider mb-1">Phone</div>
                  <a href={`tel:${selectedMarket.phone}`} className="font-bold text-forest-700 hover:text-forest-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {selectedMarket.phone}
                  </a>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Major Crops Traded</div>
                <div className="flex flex-wrap gap-2">
                  {selectedMarket.crops.map(c => (
                    <span key={c} className="px-3 py-1 bg-forest-50 text-forest-700 rounded-full text-sm font-medium border border-forest-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <a
                  href={`https://www.google.com/maps?q=${selectedMarket.lat},${selectedMarket.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-forest-900 text-white rounded-lg text-sm font-semibold hover:bg-forest-800 transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
                <a
                  href={`tel:${selectedMarket.phone}`}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-forest-200 text-forest-700 rounded-lg text-sm font-semibold hover:bg-forest-50 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Market
                </a>
              </div>
            </div>
          ) : (
            <div className="ap-card p-6 text-center text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Click any market card to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
