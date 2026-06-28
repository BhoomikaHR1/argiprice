import { useState } from 'react'
import { Leaf, ExternalLink, Search, CheckCircle, Phone, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

const SCHEMES = [
  {
    name: 'PM-KISAN',
    type: 'Income Support',
    level: 'Central',
    emoji: '💰',
    benefit: '₹6,000 per year in 3 equal installments of ₹2,000',
    eligibility: 'All small & marginal farmers with cultivable land (up to 2 hectares)',
    apply: 'pmkisan.gov.in',
    helpline: '155261',
    docs: ['Aadhaar card', 'Land records (RTC/Pahani)', 'Bank account (linked to Aadhaar)'],
    active: true,
  },
  {
    name: 'PM Fasal Bima Yojana (PMFBY)',
    type: 'Crop Insurance',
    level: 'Central',
    emoji: '🛡️',
    benefit: 'Crop insurance against natural calamities, pests, and diseases at subsidized premium (2% for Kharif, 1.5% for Rabi)',
    eligibility: 'All farmers — loanee farmers enrolled automatically; non-loanee can opt in',
    apply: 'pmfby.gov.in',
    helpline: '14447',
    docs: ['Land records', 'Bank account', 'Aadhaar card', 'Sowing certificate'],
    active: true,
  },
  {
    name: 'Kisan Credit Card (KCC)',
    type: 'Agricultural Credit',
    level: 'Central',
    emoji: '💳',
    benefit: 'Short-term credit up to ₹3 lakh at 7% interest (4% with timely repayment subsidy)',
    eligibility: 'Farmers, sharecroppers, oral lessees, and tenant farmers',
    apply: 'Visit nearest nationalized bank or cooperative bank',
    helpline: '1800-180-1111',
    docs: ['Land records', 'Identity proof', 'Address proof', 'Recent passport photo'],
    active: true,
  },
  {
    name: 'e-NAM (National Agriculture Market)',
    type: 'Market Access',
    level: 'Central',
    emoji: '🌐',
    benefit: 'Access to buyers across India through online auction, reducing middlemen; competitive bidding means better prices',
    eligibility: 'Any farmer registered at an e-NAM linked APMC',
    apply: 'enam.gov.in or at your APMC office',
    helpline: '1800-270-0224',
    docs: ['Aadhaar card', 'Bank account', 'Land records', 'Farmer registration at APMC'],
    active: true,
  },
  {
    name: 'Raitha Siri (Karnataka)',
    type: 'State Income Support',
    level: 'State',
    emoji: '🌾',
    benefit: 'Input subsidies, crop support, and ₹2,000 additional support for small farmers',
    eligibility: 'Small farmers in Karnataka with up to 5 acres (owned land)',
    apply: 'Visit nearest Raitha Samparka Kendra (RSK)',
    helpline: '1800-425-1353',
    docs: ['RTC (land record)', 'Aadhaar card', 'Bank account linked to Aadhaar'],
    active: true,
  },
  {
    name: 'Karnataka Drip Irrigation Subsidy',
    type: 'Input Subsidy',
    level: 'State',
    emoji: '💧',
    benefit: 'SC/ST farmers: 90% subsidy; Others: 75% subsidy on drip/sprinkler irrigation systems',
    eligibility: 'Karnataka farmers with water source (borewell, canal, or tank)',
    apply: 'horticulture.kar.nic.in or district horticulture officer',
    helpline: '080-2341-0900',
    docs: ['Land records', 'Farmer ID', 'Water source certificate', 'Caste certificate (for SC/ST)'],
    active: true,
  },
  {
    name: 'Soil Health Card Scheme',
    type: 'Advisory',
    level: 'Central',
    emoji: '🧪',
    benefit: 'Free soil testing + detailed fertilizer recommendation card — saves 15–20% on input costs',
    eligibility: 'All farmers',
    apply: 'Visit nearest RASC (Raitha Samparka Kendra)',
    helpline: '1800-180-1551',
    docs: ['Land records or farmer ID'],
    active: true,
  },
  {
    name: 'NABARD Watershed Development',
    type: 'Water Conservation',
    level: 'Central/State',
    emoji: '🏞️',
    benefit: 'Funding for contour bunds, check dams, farm ponds — up to ₹12,500/hectare for dryland farmers',
    eligibility: 'Farmers in watershed-designated villages (check with district agriculture office)',
    apply: 'Contact district agriculture officer or FPO',
    helpline: '022-2653-9895',
    docs: ['Land records', 'Farmer registration', 'Village watershed plan'],
    active: true,
  },
  {
    name: 'Karnataka Bhoomi (Land Records)',
    type: 'Digital Service',
    level: 'State',
    emoji: '📋',
    benefit: 'Online access to RTC (Record of Rights, Tenancy and Crops) — needed for most government scheme applications',
    eligibility: 'All Karnataka landowners',
    apply: 'landrecords.karnataka.gov.in',
    helpline: '080-2235-5255',
    docs: ['None needed — search by survey number or farmer name'],
    active: true,
  },
  {
    name: 'Karnataka Millet Mission',
    type: 'Crop Promotion',
    level: 'State',
    emoji: '🌾',
    benefit: 'Special procurement support and bonus for ragi, jowar, bajra farmers; linked to NAFED MSP purchase',
    eligibility: 'Karnataka farmers growing notified millets',
    apply: 'Visit APMC or district agriculture department',
    helpline: '1800-425-1353',
    docs: ['Farmer ID', 'Crop sowing certificate', 'Land records'],
    active: true,
  },
]

const TYPES = ['All', 'Income Support', 'Crop Insurance', 'Agricultural Credit', 'Market Access', 'Input Subsidy', 'Water Conservation', 'Crop Promotion', 'Digital Service', 'Advisory']
const LEVELS = ['All', 'Central', 'State', 'Central/State']

function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="ap-card p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{scheme.emoji}</span>
          <div>
            <h3 className="font-bold text-forest-900 text-base leading-tight">{scheme.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-forest-50 text-forest-700 rounded-full text-xs font-medium">{scheme.type}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scheme.level === 'Central' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                {scheme.level}
              </span>
            </div>
          </div>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 flex-shrink-0" title="Active" />
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-3">{scheme.benefit}</p>

      <div className="p-3 bg-forest-50 rounded-lg mb-3">
        <div className="text-xs font-semibold text-forest-700 uppercase tracking-wider mb-1">Eligibility</div>
        <p className="text-xs text-forest-800 leading-relaxed">{scheme.eligibility}</p>
      </div>

      {expanded && (
        <div className="space-y-3 mb-3">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documents Required</div>
            <ul className="space-y-1">
              {scheme.docs.map(doc => (
                <li key={doc} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {doc}
                </li>
              ))}
            </ul>
          </div>
          {scheme.helpline && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-forest-600" />
              <span className="text-xs text-gray-500">Helpline:</span>
              <a href={`tel:${scheme.helpline}`} className="text-sm font-bold text-forest-700 font-mono hover:text-forest-900">
                {scheme.helpline}
              </a>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-forest-600 font-semibold hover:text-forest-900 transition-colors"
        >
          {expanded ? '▲ Show less' : '▼ Documents & helpline'}
        </button>
        <a
          href={scheme.apply.startsWith('http') ? scheme.apply : `https://${scheme.apply}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-forest-700 hover:bg-forest-900 px-3 py-1.5 rounded-lg transition-colors"
        >
          Apply <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

export default function GovernmentSchemesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [levelFilter, setLevelFilter] = useState('All')

  const filtered = SCHEMES.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.benefit.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || s.type === typeFilter
    const matchLevel = levelFilter === 'All' || s.level === levelFilter
    return matchSearch && matchType && matchLevel
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2 flex items-center gap-2">
          <Leaf className="w-7 h-7 text-forest-600" /> Government Schemes for Farmers
        </h1>
        <p className="text-gray-500">Central and Karnataka state schemes — benefits, eligibility, documents, and how to apply</p>
      </div>

      {/* Tip banner */}
      <div className="ap-card p-5 mb-6 border-l-4 border-gold-500 bg-gold-50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-gold-800 mb-1">Most farmers qualify for 3–5 schemes simultaneously</p>
            <p className="text-xs text-gold-700">PM-KISAN + KCC + Soil Health Card + PMFBY is the most common combination for Karnataka farmers. Apply through your nearest Raitha Samparka Kendra (RSK) — they can help with paperwork for free.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ap-card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schemes..."
            className="ap-input pl-9 py-2.5"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Central', 'State'].map(l => (
            <button key={l} onClick={() => setLevelFilter(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${levelFilter === l ? 'bg-forest-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
          <div className="w-px bg-gray-200" />
          {['All', 'Income Support', 'Crop Insurance', 'Input Subsidy', 'Agricultural Credit', 'Market Access'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${typeFilter === t ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">Showing {filtered.length} of {SCHEMES.length} schemes</p>
      </div>

      {/* Scheme grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map(scheme => (
          <SchemeCard key={scheme.name} scheme={scheme} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>No schemes found for your search</p>
          </div>
        )}
      </div>

      {/* Help CTA */}
      <div className="mt-8 ap-card p-6 bg-forest-50 text-center">
        <h3 className="font-bold text-forest-900 mb-2">Need help applying?</h3>
        <p className="text-sm text-gray-600 mb-4">Visit your nearest Raitha Samparka Kendra (RSK) — Karnataka has 800+ RSKs across all districts. Help is free.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="tel:18004251353" className="flex items-center gap-2 btn-primary px-6 py-2.5 text-sm">
            <Phone className="w-4 h-4" /> 1800-425-1353 (Karnataka RSK)
          </a>
          <Link to="/farmer-info" className="btn-secondary px-6 py-2.5 text-sm">Farmer Info Centre</Link>
        </div>
      </div>
    </div>
  )
}
