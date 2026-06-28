import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white mt-20">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">AgriPrice</div>
                <div className="text-xs text-forest-300 kannada">ಕೃಷಿ ಬೆಲೆ</div>
              </div>
            </div>
            <p className="text-forest-300 text-sm leading-relaxed">
              AI-powered agricultural market intelligence for Karnataka farmers.
              Real prices. Smart decisions. Better lives.
            </p>
            <p className="text-forest-300 text-sm mt-2 kannada">
              ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ AI-ಆಧಾರಿತ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-forest-300">
              {[
                { label: 'Live Prices', href: '/live-prices' },
                { label: 'AI Prediction', href: '/ai-prediction' },
                { label: 'APMC Markets', href: '/apmc-markets' },
                { label: 'Market Trends', href: '/market-trends' },
                { label: 'Weather', href: '/weather' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Farmer Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Farmer Resources</h3>
            <ul className="space-y-2 text-sm text-forest-300">
              {[
                { label: 'Crops Database (60+)', href: '/crops' },
                { label: 'Government Schemes', href: '/government-schemes' },
                { label: 'MSP Prices 2024-25', href: '/msp' },
                { label: 'Farmer Information', href: '/farmer-info' },
                { label: 'Help Center', href: '/help' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-forest-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 flex-shrink-0" />
                <span>Karnataka Agricultural Department,<br />Bengaluru, Karnataka 560001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400" />
                <span>1800-425-1553 (Kisan Call Centre)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400" />
                <span>support@agriprice.in</span>
              </li>
            </ul>

            {/* Data sources */}
            <div className="mt-4 pt-4 border-t border-forest-700">
              <p className="text-xs text-forest-400">Data sourced from:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Agmarknet', 'eNAM', 'OpenWeather'].map((src) => (
                  <span key={src} className="px-2 py-0.5 bg-forest-800 rounded text-xs text-forest-300">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-forest-400 text-xs">
            © 2024 AgriPrice. Built for Karnataka's farmers.
          </p>
          <div className="flex items-center gap-4 text-xs text-forest-400">
            <Link to="/about" className="hover:text-forest-200">About</Link>
            <Link to="/help" className="hover:text-forest-200">Help</Link>
            <Link to="/contact" className="hover:text-forest-200">Contact</Link>
            <span>Prices updated daily from Agmarknet</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
