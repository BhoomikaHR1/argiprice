import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, ShieldCheck, Leaf } from 'lucide-react'

const CATEGORIES = [
  { id: 'all', label: 'All Crops', label_kn: 'ಎಲ್ಲಾ ಬೆಳೆ', icon: '🌱' },
  { id: 'cereals', label: 'Cereals & Millets', label_kn: 'ಧಾನ್ಯಗಳು', icon: '🌾' },
  { id: 'pulses', label: 'Pulses', label_kn: 'ದ್ವಿದಳ', icon: '🫘' },
  { id: 'oilseeds', label: 'Oilseeds', label_kn: 'ಎಣ್ಣೆಕಾಳು', icon: '🌻' },
  { id: 'vegetables', label: 'Vegetables', label_kn: 'ತರಕಾರಿ', icon: '🥬' },
  { id: 'fruits', label: 'Fruits', label_kn: 'ಹಣ್ಣುಗಳು', icon: '🍌' },
  { id: 'spices', label: 'Spices', label_kn: 'ಮಸಾಲೆ', icon: '🌶️' },
  { id: 'plantation', label: 'Plantation', label_kn: 'ತೋಟದ ಬೆಳೆ', icon: '☕' },
  { id: 'fibres', label: 'Fibres', label_kn: 'ನಾರು ಬೆಳೆ', icon: '🧵' },
]

const ALL_CROPS = [
  // Cereals
  { id:1,  cat:'cereals',    emoji:'🌾', name:'Rice (Paddy)',    name_kn:'ಭತ್ತ',              scientific:'Oryza sativa',              has_msp:true,  msp:2300,  price:2380, season:'Kharif', shelf:365 },
  { id:2,  cat:'cereals',    emoji:'🌾', name:'Ragi',            name_kn:'ರಾಗಿ',              scientific:'Eleusine coracana',          has_msp:true,  msp:3846,  price:3920, season:'Kharif/Rabi', shelf:365 },
  { id:3,  cat:'cereals',    emoji:'🌽', name:'Maize',           name_kn:'ಮೆಕ್ಕೆಜೋಳ',        scientific:'Zea mays',                  has_msp:true,  msp:2090,  price:2150, season:'Kharif/Rabi', shelf:180 },
  { id:4,  cat:'cereals',    emoji:'🌾', name:'Jowar (Sorghum)', name_kn:'ಜೋಳ',               scientific:'Sorghum bicolor',           has_msp:true,  msp:3371,  price:3480, season:'Kharif/Rabi', shelf:365 },
  { id:5,  cat:'cereals',    emoji:'🌾', name:'Bajra',           name_kn:'ಸಜ್ಜೆ',             scientific:'Pennisetum glaucum',         has_msp:true,  msp:2625,  price:2680, season:'Kharif', shelf:365 },
  { id:6,  cat:'cereals',    emoji:'🌾', name:'Wheat',           name_kn:'ಗೋಧಿ',              scientific:'Triticum aestivum',          has_msp:true,  msp:2275,  price:2350, season:'Rabi', shelf:365 },
  // Pulses
  { id:7,  cat:'pulses',     emoji:'🫘', name:'Tur (Arhar)',     name_kn:'ತೊಗರಿ',             scientific:'Cajanus cajan',             has_msp:true,  msp:7550,  price:7650, season:'Kharif', shelf:365 },
  { id:8,  cat:'pulses',     emoji:'🫘', name:'Moong',           name_kn:'ಹೆಸರು',              scientific:'Vigna radiata',             has_msp:true,  msp:8682,  price:8800, season:'Kharif/Rabi', shelf:365 },
  { id:9,  cat:'pulses',     emoji:'🫘', name:'Urad',            name_kn:'ಉದ್ದು',              scientific:'Vigna mungo',               has_msp:true,  msp:7400,  price:7520, season:'Kharif/Rabi', shelf:365 },
  { id:10, cat:'pulses',     emoji:'🫘', name:'Chana',           name_kn:'ಕಡಲೆ',              scientific:'Cicer arietinum',           has_msp:true,  msp:5440,  price:5600, season:'Rabi', shelf:365 },
  { id:11, cat:'pulses',     emoji:'🫘', name:'Masur',           name_kn:'ಮಸೂರ',              scientific:'Lens culinaris',            has_msp:true,  msp:6425,  price:6550, season:'Rabi', shelf:365 },
  { id:12, cat:'pulses',     emoji:'🫘', name:'Horse Gram',      name_kn:'ಹುರುಳಿ',            scientific:'Macrotyloma uniflorum',     has_msp:false, msp:null,  price:6200, season:'Kharif', shelf:365 },
  // Oilseeds
  { id:13, cat:'oilseeds',   emoji:'🥜', name:'Groundnut',       name_kn:'ಕಡಲೆಕಾಯಿ',         scientific:'Arachis hypogaea',          has_msp:true,  msp:6783,  price:6980, season:'Kharif', shelf:180 },
  { id:14, cat:'oilseeds',   emoji:'🌻', name:'Sunflower',       name_kn:'ಸೂರ್ಯಕಾಂತಿ',        scientific:'Helianthus annuus',         has_msp:true,  msp:7280,  price:7150, season:'Rabi/Kharif', shelf:180 },
  { id:15, cat:'oilseeds',   emoji:'🌱', name:'Soybean',         name_kn:'ಸೋಯಾಬೀನ್',          scientific:'Glycine max',               has_msp:true,  msp:4892,  price:4950, season:'Kharif', shelf:180 },
  { id:16, cat:'oilseeds',   emoji:'🌼', name:'Safflower',       name_kn:'ಕುಸುಂಬಿ',           scientific:'Carthamus tinctorius',      has_msp:true,  msp:5800,  price:5950, season:'Rabi', shelf:180 },
  { id:17, cat:'oilseeds',   emoji:'⚪', name:'Sesamum',         name_kn:'ಎಳ್ಳು',             scientific:'Sesamum indicum',           has_msp:true,  msp:9267,  price:9500, season:'Kharif', shelf:180 },
  { id:18, cat:'oilseeds',   emoji:'🌿', name:'Castor',          name_kn:'ಹರಳು',              scientific:'Ricinus communis',          has_msp:false, msp:null,  price:6200, season:'Kharif/Rabi', shelf:365 },
  { id:19, cat:'oilseeds',   emoji:'🥥', name:'Coconut',         name_kn:'ತೆಂಗಿನಕಾಯಿ',        scientific:'Cocos nucifera',            has_msp:false, msp:null,  price:2800, season:'Year-round', shelf:30 },
  // Vegetables
  { id:20, cat:'vegetables', emoji:'🍅', name:'Tomato',          name_kn:'ಟೊಮೇಟೊ',            scientific:'Solanum lycopersicum',      has_msp:false, msp:null,  price:1850, season:'Year-round', shelf:7 },
  { id:21, cat:'vegetables', emoji:'🧅', name:'Onion',           name_kn:'ಈರುಳ್ಳಿ',           scientific:'Allium cepa',               has_msp:false, msp:null,  price:2200, season:'Rabi/Kharif', shelf:60 },
  { id:22, cat:'vegetables', emoji:'🥔', name:'Potato',          name_kn:'ಆಲೂಗಡ್ಡೆ',          scientific:'Solanum tuberosum',         has_msp:false, msp:null,  price:1450, season:'Rabi', shelf:90 },
  { id:23, cat:'vegetables', emoji:'🍆', name:'Brinjal',         name_kn:'ಬದನೆ',              scientific:'Solanum melongena',         has_msp:false, msp:null,  price:1200, season:'Year-round', shelf:5 },
  { id:24, cat:'vegetables', emoji:'🥦', name:'Cabbage',         name_kn:'ಎಲೆಕೋಸು',           scientific:'Brassica oleracea',         has_msp:false, msp:null,  price:850,  season:'Rabi', shelf:14 },
  { id:25, cat:'vegetables', emoji:'🥦', name:'Cauliflower',     name_kn:'ಹೂಕೋಸು',            scientific:'Brassica oleracea botrytis',has_msp:false, msp:null,  price:1100, season:'Rabi', shelf:7 },
  { id:26, cat:'vegetables', emoji:'🫘', name:'Beans',           name_kn:'ಅವರೆಕಾಯಿ',          scientific:'Phaseolus vulgaris',        has_msp:false, msp:null,  price:2800, season:'Rabi', shelf:5 },
  { id:27, cat:'vegetables', emoji:'🫑', name:'Capsicum',        name_kn:'ದೊಡ್ಡ ಮೆಣಸು',        scientific:'Capsicum annuum',           has_msp:false, msp:null,  price:3200, season:'Year-round', shelf:10 },
  { id:28, cat:'vegetables', emoji:'🥒', name:'Bitter Gourd',    name_kn:'ಹಾಗಲಕಾಯಿ',          scientific:'Momordica charantia',       has_msp:false, msp:null,  price:2100, season:'Year-round', shelf:5 },
  { id:29, cat:'vegetables', emoji:'🥒', name:'Ridge Gourd',     name_kn:'ಹೀರೇಕಾಯಿ',          scientific:'Luffa acutangula',          has_msp:false, msp:null,  price:1500, season:'Year-round', shelf:3 },
  { id:30, cat:'vegetables', emoji:'🎃', name:'Pumpkin',         name_kn:'ಕುಂಬಳಕಾಯಿ',         scientific:'Cucurbita maxima',          has_msp:false, msp:null,  price:900,  season:'Year-round', shelf:60 },
  { id:31, cat:'vegetables', emoji:'🌿', name:'Ladies Finger',   name_kn:'ಬೆಂಡೆಕಾಯಿ',         scientific:'Abelmoschus esculentus',    has_msp:false, msp:null,  price:1800, season:'Year-round', shelf:3 },
  { id:32, cat:'vegetables', emoji:'🥕', name:'Carrot',          name_kn:'ಗಾಜರ',              scientific:'Daucus carota',             has_msp:false, msp:null,  price:2200, season:'Rabi', shelf:30 },
  { id:33, cat:'vegetables', emoji:'🌶️', name:'Green Chilli',    name_kn:'ಹಸಿ ಮೆಣಸು',          scientific:'Capsicum annuum',           has_msp:false, msp:null,  price:4500, season:'Year-round', shelf:7 },
  { id:34, cat:'vegetables', emoji:'🧄', name:'Garlic',          name_kn:'ಬೆಳ್ಳುಳ್ಳಿ',         scientific:'Allium sativum',            has_msp:false, msp:null,  price:8500, season:'Rabi', shelf:90 },
  { id:35, cat:'vegetables', emoji:'🫚', name:'Ginger',          name_kn:'ಶುಂಠಿ',             scientific:'Zingiber officinale',       has_msp:false, msp:null,  price:7200, season:'Kharif', shelf:30 },
  { id:36, cat:'vegetables', emoji:'🌿', name:'Drumstick',       name_kn:'ನುಗ್ಗೇಕಾಯಿ',         scientific:'Moringa oleifera',          has_msp:false, msp:null,  price:3500, season:'Year-round', shelf:5 },
  { id:37, cat:'vegetables', emoji:'🌿', name:'Spinach',         name_kn:'ಪಾಲಕ ಸೊಪ್ಪು',        scientific:'Spinacia oleracea',         has_msp:false, msp:null,  price:1200, season:'Year-round', shelf:3 },
  { id:38, cat:'vegetables', emoji:'🌿', name:'Ash Gourd',       name_kn:'ಬೂದುಗುಂಬಳ',         scientific:'Benincasa hispida',         has_msp:false, msp:null,  price:700,  season:'Year-round', shelf:90 },
  { id:39, cat:'vegetables', emoji:'🌿', name:'Radish',          name_kn:'ಮೂಲಂಗಿ',            scientific:'Raphanus sativus',          has_msp:false, msp:null,  price:800,  season:'Rabi', shelf:14 },
  // Fruits
  { id:40, cat:'fruits',     emoji:'🥭', name:'Mango',           name_kn:'ಮಾವು',              scientific:'Mangifera indica',          has_msp:false, msp:null,  price:4500, season:'Summer', shelf:14 },
  { id:41, cat:'fruits',     emoji:'🍌', name:'Banana',          name_kn:'ಬಾಳೆ',              scientific:'Musa spp.',                 has_msp:false, msp:null,  price:1200, season:'Year-round', shelf:7 },
  { id:42, cat:'fruits',     emoji:'🍇', name:'Grapes',          name_kn:'ದ್ರಾಕ್ಷಿ',           scientific:'Vitis vinifera',            has_msp:false, msp:null,  price:6500, season:'Summer', shelf:14 },
  { id:43, cat:'fruits',     emoji:'🍎', name:'Pomegranate',     name_kn:'ದಾಳಿಂಬೆ',           scientific:'Punica granatum',           has_msp:false, msp:null,  price:8500, season:'Year-round', shelf:30 },
  { id:44, cat:'fruits',     emoji:'🍈', name:'Papaya',          name_kn:'ಪಪ್ಪಾಯಿ',            scientific:'Carica papaya',             has_msp:false, msp:null,  price:1500, season:'Year-round', shelf:7 },
  { id:45, cat:'fruits',     emoji:'🍐', name:'Guava',           name_kn:'ಸೀಬೆ',              scientific:'Psidium guajava',           has_msp:false, msp:null,  price:2200, season:'Year-round', shelf:5 },
  { id:46, cat:'fruits',     emoji:'🍊', name:'Sweet Lime',      name_kn:'ಮೋಸಂಬಿ',            scientific:'Citrus limetta',            has_msp:false, msp:null,  price:3200, season:'Year-round', shelf:21 },
  { id:47, cat:'fruits',     emoji:'🍉', name:'Watermelon',      name_kn:'ಕಲ್ಲಂಗಡಿ',          scientific:'Citrullus lanatus',         has_msp:false, msp:null,  price:800,  season:'Summer', shelf:14 },
  { id:48, cat:'fruits',     emoji:'🍑', name:'Sapota',          name_kn:'ಸಪೋಟ',              scientific:'Manilkara zapota',          has_msp:false, msp:null,  price:2800, season:'Year-round', shelf:5 },
  // Spices
  { id:49, cat:'spices',     emoji:'🌶️', name:'Dry Red Chilli',  name_kn:'ಒಣ ಮೆಣಸು',          scientific:'Capsicum annuum',           has_msp:false, msp:null,  price:18500, season:'Rabi', shelf:180 },
  { id:50, cat:'spices',     emoji:'🌿', name:'Coriander Seed',  name_kn:'ಕೊತ್ತಂಬರಿ ಬೀಜ',     scientific:'Coriandrum sativum',        has_msp:false, msp:null,  price:6500, season:'Rabi', shelf:365 },
  { id:51, cat:'spices',     emoji:'🟡', name:'Turmeric',        name_kn:'ಅರಿಷಿಣ',            scientific:'Curcuma longa',             has_msp:false, msp:null,  price:12500, season:'Kharif', shelf:365 },
  { id:52, cat:'spices',     emoji:'⚫', name:'Black Pepper',    name_kn:'ಕಾಳು ಮೆಣಸು',         scientific:'Piper nigrum',              has_msp:false, msp:null,  price:48000, season:'Year-round', shelf:365 },
  { id:53, cat:'spices',     emoji:'🟢', name:'Cardamom',        name_kn:'ಏಲಕ್ಕಿ',            scientific:'Elettaria cardamomum',      has_msp:false, msp:null,  price:120000, season:'Year-round', shelf:365 },
  { id:54, cat:'spices',     emoji:'🟤', name:'Arecanut',        name_kn:'ಅಡಿಕೆ',             scientific:'Areca catechu',             has_msp:false, msp:null,  price:45000, season:'Year-round', shelf:365 },
  { id:55, cat:'spices',     emoji:'🌿', name:'Fenugreek',       name_kn:'ಮೆಂತ್ಯ',            scientific:'Trigonella foenum-graecum', has_msp:false, msp:null,  price:5500, season:'Rabi', shelf:365 },
  // Plantation
  { id:56, cat:'plantation', emoji:'☕', name:'Coffee (Robusta)', name_kn:'ರೋಬಸ್ಟಾ ಕಾಫಿ',      scientific:'Coffea canephora',          has_msp:false, msp:null,  price:19000, season:'Year-round', shelf:365 },
  { id:57, cat:'plantation', emoji:'☕', name:'Coffee (Arabica)', name_kn:'ಅರೇಬಿಕಾ ಕಾಫಿ',      scientific:'Coffea arabica',            has_msp:false, msp:null,  price:28000, season:'Year-round', shelf:365 },
  { id:58, cat:'plantation', emoji:'🍵', name:'Tea',             name_kn:'ಚಹಾ',               scientific:'Camellia sinensis',         has_msp:false, msp:null,  price:18000, season:'Year-round', shelf:365 },
  // Fibres
  { id:59, cat:'fibres',     emoji:'🌿', name:'Cotton',          name_kn:'ಹತ್ತಿ',             scientific:'Gossypium hirsutum',        has_msp:true,  msp:7521,  price:7800, season:'Kharif', shelf:365 },
  { id:60, cat:'fibres',     emoji:'🌿', name:'Jute',            name_kn:'ಸೆಣಬು',             scientific:'Corchorus spp.',            has_msp:true,  msp:5335,  price:5500, season:'Kharif', shelf:365 },
  { id:61, cat:'fibres',     emoji:'🎋', name:'Sugarcane',       name_kn:'ಕಬ್ಬು',             scientific:'Saccharum officinarum',     has_msp:false, msp:null,  price:3500, season:'Year-round', shelf:3 },
]

export default function CropsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [mspOnly, setMspOnly] = useState(false)

  const filtered = useMemo(() => {
    return ALL_CROPS.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.name_kn.includes(search)
      const matchCat = activeCategory === 'all' || c.cat === activeCategory
      const matchMsp = !mspOnly || c.has_msp
      return matchSearch && matchCat && matchMsp
    })
  }, [search, activeCategory, mspOnly])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <Leaf className="w-7 h-7 text-forest-600" /> Karnataka Crops Database
        </h1>
        <p className="text-gray-500">60+ crops grown in Karnataka — prices, MSP, seasons, and storage info</p>
      </div>

      {/* Search + filters */}
      <div className="ap-card p-4 mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search in English or ಕನ್ನಡ..."
              className="ap-input pl-9 py-2.5" />
          </div>
          <button onClick={() => setMspOnly(!mspOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${mspOnly ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            <ShieldCheck className="w-4 h-4" /> MSP Crops Only
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-forest-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          Showing <span className="font-semibold text-forest-900">{filtered.length}</span> of {ALL_CROPS.length} crops
        </div>
      </div>

      {/* Crops grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(crop => (
          <Link key={crop.id} to={`/crops/${crop.id}`} className="ap-card-hover p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-forest-50 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {crop.emoji}
              </div>
              {crop.has_msp && <span className="msp-badge">MSP</span>}
            </div>

            <h3 className="font-bold text-charcoal mb-0.5">{crop.name}</h3>
            <p className="text-sm text-gray-400 kannada mb-1">{crop.name_kn}</p>
            <p className="text-xs text-gray-400 italic mb-3">{crop.scientific}</p>

            <div className="flex items-end justify-between border-t border-gray-100 pt-3">
              <div>
                <div className="text-xl font-bold text-forest-900 price-number">₹{crop.price.toLocaleString()}</div>
                <div className="text-xs text-gray-400">/quintal</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">{crop.season}</div>
                <div className="text-xs text-gray-400">Shelf: {crop.shelf >= 365 ? '1+ yr' : `${crop.shelf}d`}</div>
              </div>
            </div>

            {crop.has_msp && (
              <div className="mt-2 text-xs text-gold-600 font-medium">
                MSP: ₹{crop.msp?.toLocaleString()}/q
              </div>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-medium text-lg">No crops found</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      )}
    </div>
  )
}
