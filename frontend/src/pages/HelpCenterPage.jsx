import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, ChevronUp, Phone, Mail, MessageSquare } from 'lucide-react'

const FAQS = [
  {
    category: 'Prices & Data',
    items: [
      { q: 'How are prices fetched?', a: 'Prices are fetched daily at 7 AM IST from Agmarknet (the government APMC data portal) and eNAM. They reflect actual weighted-average trade prices from the previous day\'s mandi sessions. Data is updated once per day.' },
      { q: 'Why is my crop\'s price showing ₹0 or missing?', a: 'Not all crops trade at all mandis every day. If a price is missing, it means that crop had no recorded arrivals at that market that day. Try selecting a different district or market.' },
      { q: 'Are prices in ₹ per quintal or per kg?', a: 'All prices on AgriPrice are in Indian Rupees (₹) per quintal (100 kg) — the standard unit used across all Karnataka APMC mandis. To get price per kg, divide by 100.' },
      { q: 'What is "modal price"?', a: 'Modal price is the most frequently traded price in that mandi session — the price at which the largest volume of that crop changed hands. It\'s a better indicator than the average or median.' },
      { q: 'What does "arrivals (T)" mean?', a: 'Arrivals is the total quantity of the crop that reached the mandi that day, in tonnes. High arrivals often push prices down (supply exceeds demand); low arrivals usually support higher prices.' },
    ]
  },
  {
    category: 'AI Prediction',
    items: [
      { q: 'How accurate is the AI prediction?', a: 'Our XGBoost model achieves ~78–85% directional accuracy for 1-day predictions (i.e., whether price goes up or down) on Karnataka data. For exact price levels, error margins are typically ±8–12%. Accuracy drops for 3–5 day predictions. Always treat predictions as guidance, not guarantees.' },
      { q: 'What data does the AI use?', a: 'The model uses: (1) 90-day price history for the crop and market, (2) 5-day weather forecast for the district, (3) current market arrival volumes, (4) day-of-week seasonal patterns, and (5) MSP price as a floor reference.' },
      { q: 'Why does the AI say "Sell Today" when I think the price will rise?', a: 'The model may be detecting incoming rainfall, high upcoming arrivals, or a recent price peak in its training data. The "reasoning" section explains what the model found. You can disagree — the AI is one input to your decision, not a command.' },
      { q: 'Can I use AI prediction for vegetables that don\'t have MSP?', a: 'Yes — and this is where it\'s most useful. Vegetables like tomato and onion have high price volatility. The AI accounts for weather disruptions to supply chains, which particularly affect perishable vegetables.' },
    ]
  },
  {
    category: 'Account & Registration',
    items: [
      { q: 'Is AgriPrice free?', a: 'Yes. AgriPrice is completely free for all Karnataka farmers. We don\'t charge for registration, price data, AI predictions, or any other features. The platform is funded as a public-good initiative.' },
      { q: 'Do I need to register to see prices?', a: 'No — live prices, crop information, APMC markets, weather, MSP data, and government schemes are all publicly accessible without logging in. Registration is only needed for the AI prediction feature and to save your crops and set price alerts.' },
      { q: 'I forgot my password. What do I do?', a: 'Currently, you can re-register with the same phone number. We\'re adding a password reset via OTP in the next update. Contact support@agriprice.in if you need help recovering your account.' },
      { q: 'Can I use a phone number without email?', a: 'Yes — you can register with just a 10-digit mobile number. Email is completely optional.' },
    ]
  },
  {
    category: 'APMC & Markets',
    items: [
      { q: 'How do I find the nearest APMC market?', a: 'Go to APMC Markets and click "Find Nearest" — it will use your device\'s GPS to show markets sorted by distance. You can also filter by district.' },
      { q: 'What does an APMC market charge as commission?', a: 'Karnataka APMC commission is capped at 1% for fruits & vegetables and 1.5–2.5% for other commodities. You also pay hamali (loading/unloading) at ₹15–30 per quintal and a small weighment fee. Always ask for a printed weighment slip and sale bill.' },
      { q: 'What is the difference between APMC and eNAM?', a: 'APMC (Agricultural Produce Market Committee) is the physical mandi where you bring your produce. eNAM is the online auction platform layered on top — allowing buyers from across India to bid electronically, often fetching 5–15% higher prices than floor auction.' },
    ]
  },
]

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors gap-3"
      >
        <span className="font-semibold text-forest-900 text-sm leading-relaxed">{item.q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed pt-3">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpCenterPage() {
  const [search, setSearch] = useState('')

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(i =>
      !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-forest-900 mb-2">Help Centre</h1>
        <p className="text-gray-500">Answers to common questions about AgriPrice</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search help articles..."
          className="ap-input pl-12 py-4 text-base"
        />
      </div>

      {/* FAQs */}
      <div className="space-y-8">
        {filtered.map(cat => (
          <div key={cat.category}>
            <h2 className="text-sm font-bold text-forest-700 uppercase tracking-widest mb-3">{cat.category}</h2>
            <div className="space-y-2">
              {cat.items.map(item => (
                <FAQItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>No results for "{search}"</p>
            <p className="text-sm mt-1">Try different keywords or contact us below</p>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 ap-card p-6 text-center">
        <h3 className="font-bold text-forest-900 text-lg mb-2">Still have questions?</h3>
        <p className="text-gray-500 text-sm mb-5">Our support team and the Kisan helpline are here to help.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/contact" className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm">
            <MessageSquare className="w-4 h-4" /> Contact Us
          </Link>
          <a href="tel:18001801551" className="flex items-center gap-2 btn-secondary px-5 py-2.5 text-sm">
            <Phone className="w-4 h-4" /> 1800-180-1551 (Kisan Helpline)
          </a>
          <a href="mailto:support@agriprice.in" className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 transition-colors">
            <Mail className="w-4 h-4" /> Email Support
          </a>
        </div>
      </div>
    </div>
  )
}
