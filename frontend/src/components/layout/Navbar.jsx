import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Leaf, ChevronDown, LogOut, User, Bell, Globe } from 'lucide-react'
import { useAuthStore } from '../../context/authStore'
import clsx from 'clsx'

const NAV_LINKS = [
  { label: 'Live Prices', label_kn: 'ಲೈವ್ ಬೆಲೆ', href: '/live-prices' },
  { label: 'AI Prediction', label_kn: 'AI ಮುನ್ಸೂಚನೆ', href: '/ai-prediction' },
  {
    label: 'Markets', label_kn: 'ಮಾರುಕಟ್ಟೆ', href: '#',
    children: [
      { label: 'APMC Markets', href: '/apmc-markets' },
      { label: 'Market Trends', href: '/market-trends' },
    ]
  },
  {
    label: 'Information', label_kn: 'ಮಾಹಿತಿ', href: '#',
    children: [
      { label: 'Crops Database', href: '/crops' },
      { label: 'Farmer Information', href: '/farmer-info' },
      { label: 'Government Schemes', href: '/government-schemes' },
      { label: 'MSP Prices', href: '/msp' },
    ]
  },
  { label: 'Weather', label_kn: 'ಹವಾಮಾನ', href: '/weather' },
  { label: 'About', label_kn: 'ನಮ್ಮ ಬಗ್ಗೆ', href: '/about' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const { isAuthenticated, user, logout, lang, setLang } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleLang = () => setLang(lang === 'en' ? 'kn' : 'en')

  return (
    <nav className="bg-forest-900 text-white sticky top-0 z-50 shadow-lg">
      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight">AgriPrice</span>
              <span className="text-xs text-forest-200 kannada">ಕೃಷಿ ಬೆಲೆ</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <>
                    <button
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-forest-100 hover:text-white hover:bg-forest-800 transition-colors"
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {lang === 'kn' ? link.label_kn : link.label}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <div
                      className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-forest-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150"
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-4 py-2.5 text-sm text-charcoal hover:bg-forest-50 hover:text-forest-900 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={link.href}
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === link.href
                        ? "text-white bg-forest-700"
                        : "text-forest-100 hover:text-white hover:bg-forest-800"
                    )}
                  >
                    {lang === 'kn' ? link.label_kn : link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-forest-100 hover:text-white text-sm font-medium transition-colors"
              title="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link to="/dashboard" className="p-2 rounded-lg hover:bg-forest-800 transition-colors relative">
                  <Bell className="w-5 h-5 text-forest-100" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
                </Link>

                {/* Profile dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 transition-colors">
                    <div className="w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {user?.full_name?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{user?.full_name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-forest-200" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-forest-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:bg-forest-50">
                      <Leaf className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:bg-forest-50">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <hr className="my-1 border-forest-100" />
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-forest-100 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-md">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-forest-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-forest-950 border-t border-forest-800">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                {link.children ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-forest-400 uppercase tracking-wider">
                      {lang === 'kn' ? link.label_kn : link.label}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-6 py-2 text-sm text-forest-100 hover:text-white hover:bg-forest-800 rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm text-forest-100 hover:text-white hover:bg-forest-800 rounded-lg transition-colors"
                  >
                    {lang === 'kn' ? link.label_kn : link.label}
                  </Link>
                )}
              </div>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 border-t border-forest-800">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-medium text-forest-100 hover:text-white">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-gold-500 text-white text-sm font-semibold rounded-lg">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
