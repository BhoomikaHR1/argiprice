import { useState } from 'react'
import { Phone, Mail, MapPin, MessageSquare, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.message) return toast.error('Please fill in your name and message')
    setLoading(true)
    // Simulate send
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2">Contact Us</h1>
        <p className="text-gray-500">We're here to help Karnataka's farmers. Get in touch anytime.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact details */}
        <div className="space-y-4">
          {[
            { icon: Phone, label: 'Kisan Call Centre', value: '1800-180-1551', sub: 'Free, 24/7, Kannada & English', href: 'tel:18001801551' },
            { icon: Phone, label: 'Karnataka RSK Helpline', value: '1800-425-1353', sub: 'Karnataka state agri helpline', href: 'tel:18004251353' },
            { icon: Mail, label: 'Email', value: 'support@agriprice.in', sub: 'Response within 24 hours', href: 'mailto:support@agriprice.in' },
            { icon: MapPin, label: 'Registered Office', value: 'Karnataka Agricultural Dept', sub: 'Bengaluru, Karnataka 560001', href: null },
          ].map(item => (
            <div key={item.label} className="ap-card p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-forest-700" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>
                {item.href
                  ? <a href={item.href} className="font-bold text-forest-800 hover:text-forest-900 text-sm">{item.value}</a>
                  : <div className="font-bold text-forest-800 text-sm">{item.value}</div>
                }
                <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
              </div>
            </div>
          ))}

          <div className="ap-card p-4 bg-forest-50">
            <div className="text-xs font-bold text-forest-700 uppercase tracking-wider mb-2">Office Hours</div>
            <p className="text-sm text-forest-800">Mon – Sat: 9:00 AM – 6:00 PM IST</p>
            <p className="text-sm text-forest-800">Kisan helpline: 24/7</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="ap-card p-10 text-center h-full flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-forest-900 mb-2">Message sent!</h3>
              <p className="text-gray-500 text-sm mb-6">We'll get back to you within 24 hours. For urgent queries, call the Kisan helpline at 1800-180-1551.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', phone: '', subject: '', message: '' }) }}
                className="btn-secondary px-6 py-2.5 text-sm">
                Send another message
              </button>
            </div>
          ) : (
            <div className="ap-card p-6">
              <h2 className="font-bold text-forest-900 text-lg mb-5 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gold-500" /> Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-forest-800 mb-1.5">Your Name *</label>
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                      placeholder="e.g. Ramaiah Gowda" className="ap-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-forest-800 mb-1.5">Mobile Number</label>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="10-digit mobile" className="ap-input" maxLength={10} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-forest-800 mb-1.5">Subject</label>
                  <select value={form.subject} onChange={e => update('subject', e.target.value)}
                    className="ap-input appearance-none">
                    <option value="">Select topic</option>
                    <option>Price data issue</option>
                    <option>AI prediction query</option>
                    <option>Account / registration help</option>
                    <option>APMC market information</option>
                    <option>Government scheme query</option>
                    <option>Feature request</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-forest-800 mb-1.5">Message *</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Describe your question or issue in detail..."
                    className="ap-input resize-none"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Send Message'
                  }
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Your message goes to our support team — not published publicly.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
