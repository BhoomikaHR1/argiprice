import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from '../ChatWidget'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
