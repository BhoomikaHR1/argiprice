import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'

// Layout
import Layout from './components/layout/Layout'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import LivePricesPage from './pages/LivePricesPage'
import CropsPage from './pages/CropsPage'
import CropDetailPage from './pages/CropDetailPage'
import APMCMarketsPage from './pages/APMCMarketsPage'
import MarketTrendsPage from './pages/MarketTrendsPage'
import AIPredictionPage from './pages/AIPredictionPage'
import WeatherPage from './pages/WeatherPage'
import FarmerInfoPage from './pages/FarmerInfoPage'
import JointCommunityPage from './pages/JointCommunityPage'
import GovernmentSchemesPage from './pages/GovernmentSchemesPage'
import MSPPage from './pages/MSPPage'
import HelpCenterPage from './pages/HelpCenterPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/help" element={<Layout><HelpCenterPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/live-prices" element={<Layout><LivePricesPage /></Layout>} />
      <Route path="/crops" element={<Layout><CropsPage /></Layout>} />
      <Route path="/crops/:id" element={<Layout><CropDetailPage /></Layout>} />
      <Route path="/apmc-markets" element={<Layout><APMCMarketsPage /></Layout>} />
      <Route path="/market-trends" element={<Layout><MarketTrendsPage /></Layout>} />
      <Route path="/weather" element={<Layout><WeatherPage /></Layout>} />
      <Route path="/farmer-info" element={<Layout><FarmerInfoPage /></Layout>} />
      <Route path="/joint-community" element={<ProtectedRoute><Layout><JointCommunityPage /></Layout></ProtectedRoute>} />
      <Route path="/government-schemes" element={<Layout><GovernmentSchemesPage /></Layout>} />
      <Route path="/msp" element={<Layout><MSPPage /></Layout>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/ai-prediction" element={<Layout><AIPredictionPage /></Layout>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
