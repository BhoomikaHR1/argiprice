import { useState } from 'react'
import { BookOpen, Droplets, Sun, Package, TrendingUp, Phone, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const TOPICS = [
  {
    id: 'soil',
    emoji: '🌱',
    title: 'Soil Health',
    title_kn: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
    color: 'amber',
    articles: [
      { title: 'Soil Testing in Karnataka — How & Where', body: 'Get your soil tested at the nearest RASC (Raitha Samparka Kendra). Karnataka has 800+ RSKs across all districts. Test costs ₹190 and takes 10–12 days. Results include NPK levels, pH, and micro-nutrients with fertilizer recommendations.' },
      { title: 'Understanding Your Soil Health Card', body: 'The Soil Health Card issued under the government scheme tells you exactly how much urea, DAP, and potash your specific field needs — saving 15-20% on fertilizer costs while improving yield. Carry the card to your local fertilizer depot to get the right quantities.' },
      { title: 'Organic Matter and Ragi Yield', body: 'Adding 5 tonnes of farmyard manure per acre before ragi sowing improves yield by 20-25% and soil water retention. This is especially important in Hassan and Tumakuru where soils are red laterite.' },
    ]
  },
  {
    id: 'water',
    emoji: '💧',
    title: 'Water Management',
    title_kn: 'ನೀರು ನಿರ್ವಹಣೆ',
    color: 'blue',
    articles: [
      { title: 'Drip Irrigation Subsidy for Karnataka Farmers', body: 'Karnataka provides 90% subsidy on drip irrigation for SC/ST farmers and 75% for others under PMKSY (Pradhan Mantri Krishi Sinchayee Yojana). Apply through your district horticulture officer or online at horticulture.kar.nic.in.' },
      { title: 'Borewells and Groundwater in Kolar District', body: 'Kolar is a water-stressed district. New borewells require permission from CGWB. Consider micro-irrigation for tomato — a single drip system saves 40% water and increases tomato yield by 30% vs flood irrigation.' },
      { title: 'Rainfed Farming Best Practices', body: 'For dryland farmers in Raichur and Vijayapura, tied ridges and contour bunding retain 40% more rainwater. NABARD provides funding for water conservation structures through the Watershed Development Programme.' },
    ]
  },
  {
    id: 'postharvest',
    emoji: '📦',
    title: 'Post-Harvest & Storage',
    title_kn: 'ಕೊಯ್ಲೋತ್ತರ ನಿರ್ವಹಣೆ',
    color: 'orange',
    articles: [
      { title: 'Cold Storage Locations in Karnataka', body: 'Karnataka has 300+ registered cold storage facilities. Key hubs: Kolar (potato, tomato), Hassan (potato, ginger), Hubli-Dharwad (onion). Average cost ₹80-120 per quintal per month. NCCD provides a directory at nccd.gov.in.' },
      { title: 'Grading and Sorting for Better Prices', body: 'Graded produce fetches 15-25% higher prices at APMC. Use the government-subsidized plastic crates (under NHM) for transporting tomatoes — reduces bruising by 40% and increases shelf life by 2 days.' },
      { title: 'Hermetic Storage for Pulses and Cereals', body: 'Hermetic bags (PICS bags) prevent 95% of storage losses for ragi, tur, and moong. Each bag costs ₹400-600 and can be reused for 5-7 seasons. Available at Krishi Vigyan Kendras and some RSKs.' },
    ]
  },
  {
    id: 'market',
    emoji: '🏪',
    title: 'Market & Selling',
    title_kn: 'ಮಾರಾಟ ಮಾಡುವ ವಿಧಾನ',
    color: 'green',
    articles: [
      { title: 'How to Register on eNAM (Online National Market)', body: 'eNAM connects you to buyers across India, not just local APMC. Required: Aadhaar, bank account, land records (RTC). Registration is free at enam.gov.in or at your APMC office. Once registered, you can receive bids from 1000+ buyers.' },
      { title: 'Understanding APMC Fees and Charges', body: 'Karnataka APMC commission is capped at 1% for fruits & vegetables and 1.5-2.5% for other crops. You also pay 0.5-1% cartage and hamali (loading/unloading). Total deduction: 2-4% of sale value. Always ask for a weighment slip and sale bill.' },
      { title: 'Farmer Producer Organizations (FPOs) in Karnataka', body: 'Joining an FPO lets you collectively sell, reducing per-unit transport and commission costs by 30-40%. Karnataka has 700+ active FPOs. Find your nearest FPO at sfacindia.com or contact your district agriculture office.' },
    ]
  },
]

function ArticleAccordion({ article }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-forest-900 text-sm pr-4">{article.title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{article.body}</p>
        </div>
      )}
    </div>
  )
}

const HELPLINES = [
  { name: 'Kisan Call Centre', num: '1800-180-1551', desc: 'Free, 24/7, multilingual agri helpline', lang: 'Hindi, Kannada, English' },
  { name: 'Karnataka Rythu Seva Kendra', num: '1800-425-1353', desc: 'Karnataka state agriculture helpline', lang: 'Kannada, English' },
  { name: 'PM-KISAN Helpline', num: '155261', desc: 'For PM-KISAN installment queries', lang: 'All languages' },
  { name: 'Horticulture Dept Karnataka', num: '080-2341-0900', desc: 'Fruit & vegetable cultivation queries', lang: 'Kannada, English' },
]

export default function FarmerInfoPage() {
  const [activeTopic, setActiveTopic] = useState('soil')
  const topic = TOPICS.find(t => t.id === activeTopic)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-gold-500" /> Farmer Information Centre
        </h1>
        <p className="text-gray-500 mb-1">Practical resources for Karnataka farmers — soil, water, storage, and selling</p>
        <p className="text-sm text-gray-400 kannada">ಕರ್ನಾಟಕ ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಮಾಹಿತಿ</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Topic navigation */}
        <div className="lg:col-span-1 space-y-2">
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t.id)}
              className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${
                activeTopic === t.id
                  ? 'bg-forest-900 text-white shadow-md'
                  : 'ap-card hover:shadow-card-hover'
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <div className={`font-semibold text-sm ${activeTopic === t.id ? 'text-white' : 'text-forest-900'}`}>{t.title}</div>
                <div className={`text-xs kannada mt-0.5 ${activeTopic === t.id ? 'text-forest-200' : 'text-gray-400'}`}>{t.title_kn}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="lg:col-span-3">
          {topic && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-4xl">{topic.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-forest-900">{topic.title}</h2>
                  <p className="text-sm text-gray-400 kannada">{topic.title_kn}</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {topic.articles.map(article => (
                  <ArticleAccordion key={article.title} article={article} />
                ))}
              </div>
            </div>
          )}

          {/* Helplines */}
          <div className="ap-card p-6">
            <h3 className="font-bold text-forest-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gold-500" /> Free Farmer Helplines
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {HELPLINES.map(h => (
                <div key={h.name} className="p-4 bg-forest-50 rounded-xl">
                  <div className="font-bold text-forest-900 text-sm mb-0.5">{h.name}</div>
                  <a href={`tel:${h.num}`} className="text-forest-600 font-mono text-base font-bold hover:text-forest-900">
                    📞 {h.num}
                  </a>
                  <div className="text-xs text-gray-500 mt-1">{h.desc}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Lang: {h.lang}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4 mt-5">
            {[
              { label: 'MSP Prices 2024-25', href: '/msp', icon: '🛡️' },
              { label: 'Government Schemes', href: '/government-schemes', icon: '🏛️' },
              { label: 'APMC Markets', href: '/apmc-markets', icon: '🗺️' },
            ].map(l => (
              <Link key={l.href} to={l.href}
                className="ap-card-hover p-4 text-center text-sm font-semibold text-forest-700">
                <div className="text-2xl mb-2">{l.icon}</div>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
