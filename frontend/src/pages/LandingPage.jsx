import { Link } from 'react-router-dom'
import { TrendingUp, MapPin, Brain, Cloud, ShieldCheck, ChevronRight, ArrowRight, Leaf, BarChart3, Users, Smartphone } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

// Simulated ticker data (will be fetched from API in production)
const TICKER_DATA = [
  { crop: 'Tomato', crop_kn: 'ಟೊಮೇಟೊ', price: 1850, change: +12.5, market: 'Kolar APMC' },
  { crop: 'Rice (Paddy)', crop_kn: 'ಭತ್ತ', price: 2380, change: -2.1, market: 'Mandya APMC' },
  { crop: 'Ragi', crop_kn: 'ರಾಗಿ', price: 3920, change: +5.8, market: 'Hassan APMC' },
  { crop: 'Onion', crop_kn: 'ಈರುಳ್ಳಿ', price: 2200, change: +8.3, market: 'Belagavi APMC' },
  { crop: 'Tur Dal', crop_kn: 'ತೊಗರಿ', price: 7650, change: -1.4, market: 'Kalaburagi APMC' },
  { crop: 'Cotton', crop_kn: 'ಹತ್ತಿ', price: 7800, change: +3.2, market: 'Raichur APMC' },
  { crop: 'Maize', crop_kn: 'ಮೆಕ್ಕೆಜೋಳ', price: 2150, change: -0.8, market: 'Davanagere APMC' },
  { crop: 'Groundnut', crop_kn: 'ಕಡಲೆಕಾಯಿ', price: 6980, change: +4.1, market: 'Vijayapura APMC' },
  { crop: 'Mango', crop_kn: 'ಮಾವು', price: 4500, change: +15.2, market: 'Bengaluru APMC' },
  { crop: 'Jowar', crop_kn: 'ಜೋಳ', price: 3480, change: +1.9, market: 'Dharwad APMC' },
]

function PriceTicker() {
  const doubled = [...TICKER_DATA, ...TICKER_DATA]
  return (
    <div className="bg-forest-950 border-b border-forest-800 py-2 overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 bg-gold-500 text-white text-xs font-bold px-3 py-1 mr-4 z-10 uppercase tracking-wide">
          LIVE PRICES
        </div>
        {/* Ticker strip */}
        <div className="ticker-wrap flex-1">
          <div className="ticker-content">
            {doubled.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 mr-8">
                <span className="text-white text-sm font-semibold">{item.crop}</span>
                <span className="text-forest-300 text-xs kannada">{item.crop_kn}</span>
                <span className="text-gold-400 text-sm font-bold price-number">₹{item.price.toLocaleString()}/q</span>
                <span className={`text-xs font-semibold ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                </span>
                <span className="text-forest-500 text-xs">{item.market}</span>
                <span className="text-forest-700 mx-2">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="bg-field-gradient min-h-[88vh] flex items-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.8'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hero copy */}
          <div className="text-white">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-white/90 font-medium">Live prices from 200+ Karnataka APMCs</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Know before<br />
              you sell.
            </h1>
            <p className="text-2xl text-forest-200 font-medium mb-2 kannada">
              ಮಾರಾಟ ಮಾಡುವ ಮೊದಲು ತಿಳಿಯಿರಿ.
            </p>
            <p className="text-lg text-forest-100 mb-8 max-w-lg leading-relaxed">
              AI-powered price forecasts, real-time APMC data, and smart recommendations
              so Karnataka's farmers can sell at the right market, at the right time.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/live-prices" className="flex items-center gap-2 btn-gold text-base px-8 py-4 shadow-xl shadow-gold-900/30">
                <TrendingUp className="w-5 h-5" />
                Check Live Prices
              </Link>
              <Link to="/ai-prediction" className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/20 transition-all text-base">
                <Brain className="w-5 h-5" />
                AI Recommendation
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-8">
              {[
                { num: '200+', label: 'APMC Markets' },
                { num: '60+', label: 'Karnataka Crops' },
                { num: '31', label: 'Districts' },
                { num: 'Daily', label: 'Price Updates' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-gold-400">{stat.num}</div>
                  <div className="text-sm text-forest-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Feature card preview */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
              {/* Mock dashboard card */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Today's AI Pick</div>
                  <div className="text-white font-bold text-xl">Tomato • Kolar APMC</div>
                </div>
                <div className="w-12 h-12 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🍅</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">Today</div>
                  <div className="text-xl font-bold text-white price-number">₹1,850</div>
                  <div className="text-xs text-green-400">↑ ₹230</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">Tomorrow AI</div>
                  <div className="text-xl font-bold text-gold-400 price-number">₹1,940</div>
                  <div className="text-xs text-white/40">predicted</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">Confidence</div>
                  <div className="text-xl font-bold text-white">82%</div>
                  <div className="text-xs text-white/40">XGBoost</div>
                </div>
              </div>

              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400 font-bold text-sm">✓ RECOMMENDATION: SELL TODAY</span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">
                  Price at 2-week high. Rain forecast Thursday may bring new supply.
                  Net profit estimate: ₹4,760/quintal after transport.
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/50 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Nearest: Kolar APMC (14 km)</span>
                </div>
                <Link to="/ai-prediction" className="text-gold-400 text-xs font-semibold hover:text-gold-300 flex items-center gap-1">
                  View Full Report <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Weather mini card */}
            <div className="mt-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4">
              <div className="text-3xl">⛅</div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">Kolar District Weather</div>
                <div className="text-white/60 text-xs">28°C • Humidity 65% • No rain next 48h</div>
              </div>
              <div className="text-xs text-white/40">Good for harvest</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-100 text-green-700',
      title: 'Real-Time Prices',
      title_kn: 'ನೈಜ ಸಮಯ ಬೆಲೆ',
      desc: 'Daily prices from 200+ Karnataka APMC mandis, sourced directly from Agmarknet and eNAM. No delays, no guesswork.',
      href: '/live-prices'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-700',
      title: 'AI Price Prediction',
      title_kn: 'AI ಬೆಲೆ ಮುನ್ಸೂಚನೆ',
      desc: 'XGBoost ML model trained on Karnataka price history, weather, and arrivals data — predicts tomorrow\'s price today.',
      href: '/ai-prediction'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-700',
      title: 'APMC Market Finder',
      title_kn: 'APMC ಮಾರ್ಕೆಟ್ ಹುಡುಕಾಟ',
      desc: 'Find nearest APMC to your village. Compare prices across markets and choose the one giving you the highest net profit.',
      href: '/apmc-markets'
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      color: 'bg-sky-100 text-sky-700',
      title: 'Weather Intelligence',
      title_kn: 'ಹವಾಮಾನ ಮಾಹಿತಿ',
      desc: '5-day forecasts for all 31 Karnataka districts, with price impact analysis — know if rain will hurt or help your crop prices.',
      href: '/weather'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'bg-amber-100 text-amber-700',
      title: 'Government Schemes & MSP',
      title_kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆ & MSP',
      desc: 'Current MSP for 10+ crops, PM-KISAN, crop insurance, and Karnataka state schemes — all in one place, in Kannada.',
      href: '/government-schemes'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-red-100 text-red-700',
      title: 'Market Trends',
      title_kn: 'ಮಾರ್ಕೆಟ್ ಟ್ರೆಂಡ್',
      desc: 'Weekly and monthly price charts for 60+ crops. Understand seasonal patterns and plan your next sowing accordingly.',
      href: '/market-trends'
    },
  ]

  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-forest-50 text-forest-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Leaf className="w-4 h-4" /> Platform Features
          </div>
          <h2 className="text-4xl font-bold text-forest-900 mb-3">
            Everything a farmer needs
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            From real-time mandi prices to AI recommendations — AgriPrice is the only platform built specifically for Karnataka's farming ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link key={f.title} to={f.href} className="ap-card-hover p-6 group">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-forest-900 text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-forest-600 kannada mb-2">{f.title_kn}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">{f.desc}</p>
              <div className="flex items-center gap-1 text-forest-700 text-sm font-semibold group-hover:gap-2 transition-all">
                Explore <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function CropsPreviewSection() {
  const crops = [
    { emoji: '🍅', name: 'Tomato', name_kn: 'ಟೊಮೇಟೊ', price: 1850, change: +12.5, msp: false },
    { emoji: '🌾', name: 'Ragi', name_kn: 'ರಾಗಿ', price: 3920, change: +5.8, msp: true, msp_price: 3846 },
    { emoji: '🫘', name: 'Tur Dal', name_kn: 'ತೊಗರಿ', price: 7650, change: -1.4, msp: true, msp_price: 7550 },
    { emoji: '🧅', name: 'Onion', name_kn: 'ಈರುಳ್ಳಿ', price: 2200, change: +8.3, msp: false },
    { emoji: '🌿', name: 'Cotton', name_kn: 'ಹತ್ತಿ', price: 7800, change: +3.2, msp: true, msp_price: 7521 },
    { emoji: '🌽', name: 'Maize', name_kn: 'ಮೆಕ್ಕೆಜೋಳ', price: 2150, change: -0.8, msp: true, msp_price: 2090 },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-forest-900">Today's Prices</h2>
            <p className="text-gray-500 mt-1">As of today • Karnataka APMC Average</p>
          </div>
          <Link to="/live-prices" className="flex items-center gap-1.5 text-forest-700 font-semibold hover:text-forest-900 transition-colors">
            View all crops <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop) => (
            <Link key={crop.name} to="/live-prices" className="ap-card-hover p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-forest-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                {crop.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-charcoal">{crop.name}</span>
                  {crop.msp && (
                    <span className="msp-badge">MSP</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 kannada mb-1">{crop.name_kn}</div>
                <div className="flex items-center gap-2">
                  <span className="price-number text-xl font-bold text-forest-900">₹{crop.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">/quintal</span>
                </div>
              </div>
              <div className={`text-sm font-bold flex-shrink-0 ${crop.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {crop.change > 0 ? '▲' : '▼'} {Math.abs(crop.change)}%
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      icon: '📍',
      title: 'Select Your Crop & Location',
      desc: 'Choose your crop from 60+ Karnataka varieties and your district or nearest APMC market.'
    },
    {
      num: '02',
      icon: '📊',
      title: 'View Live & Predicted Prices',
      desc: 'See today\'s mandi prices, yesterday\'s trends, and tomorrow\'s AI-predicted price with confidence scores.'
    },
    {
      num: '03',
      icon: '🤖',
      title: 'Get AI Recommendation',
      desc: 'Our XGBoost model analyzes prices, weather, arrivals, and transport costs to tell you: Sell Today, Hold, or Best APMC.'
    },
    {
      num: '04',
      icon: '💰',
      title: 'Maximize Your Profit',
      desc: 'Follow the recommendation, visit the right APMC, and get the best price for your hard work.'
    },
  ]

  return (
    <section className="py-20 bg-forest-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-forest-900 mb-3">How AgriPrice Works</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Simple steps to smarter selling decisions for your farm.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-6 h-0.5 bg-forest-200 z-10" />
              )}
              <div className="ap-card p-6 text-center">
                <div className="text-xs font-bold text-forest-400 tracking-widest mb-3 uppercase">{step.num}</div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-forest-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 shadow-lg">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Ramaiah Gowda',
      name_kn: 'ರಾಮಯ್ಯ ಗೌಡ',
      district: 'Hassan District',
      crop: 'Ragi farmer',
      quote: 'AgriPrice told me to wait 2 days before selling my ragi. I did, and got ₹400 more per quintal. That\'s ₹20,000 extra for my family.',
      stars: 5,
    },
    {
      name: 'Lakshmi Devi',
      name_kn: 'ಲಕ್ಷ್ಮಿ ದೇವಿ',
      district: 'Kolar District',
      crop: 'Tomato farmer',
      quote: 'I used to just go to the nearest APMC. AgriPrice showed me a market 18 km away with ₹300 better prices. After transport cost, I saved ₹8,000.',
      stars: 5,
    },
    {
      name: 'Suresh Patil',
      name_kn: 'ಸುರೇಶ ಪಾಟೀಲ',
      district: 'Belagavi District',
      crop: 'Cotton & Jowar farmer',
      quote: 'The Kannada interface makes it easy for me to use. The MSP information especially — I now know when the government procurement is better than private buyers.',
      stars: 5,
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gold-50 text-gold-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Users className="w-4 h-4" /> Farmer Stories
          </div>
          <h2 className="text-4xl font-bold text-forest-900">Farmers who earned more</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="ap-card p-6">
              <div className="flex text-gold-400 mb-4">
                {'★'.repeat(t.stars)}
              </div>
              <blockquote className="text-charcoal text-sm leading-relaxed mb-5 italic">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center text-forest-700 font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-charcoal text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400 kannada">{t.name_kn}</div>
                  <div className="text-xs text-forest-600">{t.district} • {t.crop}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-20 bg-field-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <Smartphone className="w-4 h-4" /> Free for all Karnataka farmers
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          Start selling smarter today.
        </h2>
        <p className="text-xl text-forest-100 mb-4 kannada">ಇಂದೇ ಜಾಣತನದಿಂದ ಮಾರಾಟ ಆರಂಭಿಸಿ.</p>
        <p className="text-forest-200 mb-8 max-w-xl mx-auto">
          Join thousands of Karnataka farmers who are using AI to make better decisions at the mandi.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register" className="btn-gold text-base px-10 py-4 inline-flex items-center gap-2 shadow-xl">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/live-prices" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-10 py-4 rounded-lg hover:bg-white/20 transition-all text-base inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> View Live Prices
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PriceTicker />
      <HeroSection />
      <FeaturesSection />
      <CropsPreviewSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
