import { useEffect, useMemo, useState } from 'react'
import { Users, Sprout, Scale, MapPin, PlusCircle, BarChart3 } from 'lucide-react'

import { useAuthStore } from '../context/authStore'
import { jointCommunityApi } from '../utils/api'
import { ALL_CROPS } from './CropsPage'

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilograms (kg)', factor: 1 },
  { value: 'quintal', label: 'Quintals (q)', factor: 100 },
  { value: 'tonne', label: 'Tonnes (t)', factor: 1000 },
]

function formatWeight(kg) {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`
  }
  if (kg >= 100) {
    return `${(kg / 100).toFixed(2)} q`
  }
  return `${kg.toFixed(0)} kg`
}

function normalizeEntry(entry) {
  return {
    id: entry.id,
    userId: entry.user_id,
    farmerName: entry.farmer_name,
    cropId: entry.crop_id,
    quantity: Number(entry.quantity),
    unit: entry.unit,
    quantityKg: entry.quantity_kg,
    villageName: entry.village_name,
    createdAt: entry.created_at,
    cropName: entry.crop_name,
    cropNameKn: entry.crop_name_kn,
  }
}

export default function JointCommunityPage() {
  const { user } = useAuthStore()
  const cropOptions = useMemo(
    () => [...ALL_CROPS].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  const [entries, setEntries] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    cropId: cropOptions[0]?.id || '',
    quantity: '',
    unit: 'kg',
    village: '',
  })

  useEffect(() => {
    let mounted = true

    async function loadEntries() {
      setLoading(true)
      try {
        const response = await jointCommunityApi.list()
        if (mounted) {
          setEntries((response.data.entries || []).map(normalizeEntry))
        }
      } catch {
        if (mounted) {
          setMessage('Unable to load community data right now.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadEntries()
    return () => {
      mounted = false
    }
  }, [])

  const communitySummary = useMemo(() => {
    const grouped = new Map()

    for (const entry of entries) {
      const crop = cropOptions.find((item) => item.id === entry.cropId)
      if (!crop) continue

      if (!grouped.has(entry.cropId)) {
        grouped.set(entry.cropId, {
          cropId: entry.cropId,
          cropName: crop.name,
          cropNameKn: crop.name_kn,
          emoji: crop.emoji,
          totalKg: 0,
          farmerIds: new Set(),
          villages: new Set(),
          members: [],
        })
      }

      const group = grouped.get(entry.cropId)
      group.totalKg += entry.quantityKg
      group.farmerIds.add(entry.userId)
      group.villages.add(entry.villageName)
      group.members.push(entry)
    }

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        totalFarmers: group.farmerIds.size,
        villages: Array.from(group.villages),
        members: [...group.members].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      }))
      .sort((a, b) => b.totalKg - a.totalKg)
  }, [entries, cropOptions])

  const totalFarmers = useMemo(
    () => new Set(entries.map((entry) => entry.userId)).size,
    [entries]
  )

  const totalWeightKg = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.quantityKg, 0),
    [entries]
  )

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const quantityValue = Number(form.quantity)

    if (!user?.id || !user?.full_name) {
      setMessage('Please log in before joining a crop community.')
      return
    }
    if (!form.cropId || !quantityValue || quantityValue <= 0 || !form.village.trim()) {
      setMessage('Please fill in crop, quantity, and village name.')
      return
    }

    setSubmitting(true)
    try {
      const response = await jointCommunityApi.create({
        crop_id: Number(form.cropId),
        quantity: quantityValue,
        unit: form.unit,
        village_name: form.village.trim(),
      })
      const crop = cropOptions.find((item) => item.id === Number(form.cropId))
      const entry = response.data.entry
      setEntries((prev) => [normalizeEntry({
        ...entry,
        crop_name: crop?.name,
        crop_name_kn: crop?.name_kn,
      }), ...prev])
      setForm((prev) => ({ ...prev, quantity: '', village: '' }))
      setMessage('You have been added to the crop community successfully.')
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Could not submit community entry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(255,209,102,0.28),_transparent_35%),linear-gradient(135deg,#173d2f_0%,#23513f_45%,#f4efe7_46%,#f7f2ea_100%)] p-6 sm:p-8 mb-8 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm mb-4">
            <Users className="w-4 h-4" /> Joint Community
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Build crop-wise farmer communities from your harvest plans
          </h1>
          <p className="text-forest-100 text-sm sm:text-base leading-relaxed max-w-xl">
            Join a crop community with your logged-in profile, share your crop quantity and village,
            and instantly see how many farmers and how much stock is available for each crop group.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="ap-card p-5 bg-gradient-to-br from-white to-forest-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Communities</span>
                <Sprout className="w-5 h-5 text-forest-600" />
              </div>
              <div className="text-3xl font-bold text-forest-900">{communitySummary.length}</div>
              <div className="text-sm text-gray-500 mt-1">Crop-based groups active</div>
            </div>

            <div className="ap-card p-5 bg-gradient-to-br from-white to-gold-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Farmers</span>
                <Users className="w-5 h-5 text-gold-600" />
              </div>
              <div className="text-3xl font-bold text-forest-900">{totalFarmers}</div>
              <div className="text-sm text-gray-500 mt-1">Registered across communities</div>
            </div>

            <div className="ap-card p-5 bg-gradient-to-br from-white to-blue-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Crop Weight</span>
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-forest-900">{formatWeight(totalWeightKg)}</div>
              <div className="text-sm text-gray-500 mt-1">Total produce available</div>
            </div>
          </div>

          <div className="ap-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-forest-600" />
              <h2 className="text-xl font-bold text-forest-900">Crop Communities</h2>
            </div>

            <div className="space-y-4">
              {!loading && communitySummary.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center bg-gray-50">
                  <div className="text-5xl mb-3">🌾</div>
                  <div className="font-semibold text-forest-900 mb-1">No communities created yet</div>
                  <p className="text-sm text-gray-500">
                    Submit your crop details to start the first crop-wise farmer community.
                  </p>
                </div>
              )}

              {loading && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center bg-gray-50 text-gray-500">
                  Loading crop communities...
                </div>
              )}

              {communitySummary.map((community) => (
                <div key={community.cropId} className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-700 text-white p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                          {community.emoji}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{community.cropName}</h3>
                          <p className="text-sm text-forest-200 kannada">{community.cropNameKn}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-white/10 px-4 py-3">
                          <div className="text-forest-200 text-xs uppercase tracking-widest">Farmers</div>
                          <div className="text-2xl font-bold">{community.totalFarmers}</div>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3">
                          <div className="text-forest-200 text-xs uppercase tracking-widest">Available</div>
                          <div className="text-2xl font-bold">{formatWeight(community.totalKg)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {community.villages.map((village) => (
                        <span key={village} className="inline-flex items-center gap-1 rounded-full bg-forest-50 text-forest-700 px-3 py-1 text-xs font-semibold">
                          <MapPin className="w-3 h-3" /> {village}
                        </span>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {community.members.map((member) => (
                        <div key={member.id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <div className="font-semibold text-charcoal">{member.farmerName}</div>
                            <div className="text-sm font-bold text-forest-700">
                              {member.quantity} {member.unit}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.villageName} • {formatWeight(member.quantityKg)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ap-card p-6 h-fit xl:sticky xl:top-24">
          <div className="flex items-center gap-2 mb-5">
            <PlusCircle className="w-5 h-5 text-gold-500" />
            <h2 className="text-xl font-bold text-forest-900">Join a Community</h2>
          </div>

          <div className="rounded-2xl bg-forest-50 border border-forest-100 p-4 mb-5">
            <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Logged-in Farmer</div>
            <div className="text-lg font-bold text-forest-900">{user?.full_name || 'Login required'}</div>
            <div className="text-sm text-gray-500">{user?.phone || user?.email || 'Use your registered account to join'}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-forest-800 mb-1.5">Farmer Name</label>
              <input
                type="text"
                value={user?.full_name || ''}
                readOnly
                className="ap-input bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-800 mb-1.5">Crop</label>
              <select
                value={form.cropId}
                onChange={(e) => handleChange('cropId', e.target.value)}
                className="ap-input"
              >
                {cropOptions.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name} ({crop.name_kn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-800 mb-1.5">Quantity</label>
              <div className="grid grid-cols-[1fr_180px] gap-3">
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="Enter amount"
                  className="ap-input"
                />
                <select
                  value={form.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="ap-input"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-800 mb-1.5">Village Name</label>
              <input
                type="text"
                value={form.village}
                onChange={(e) => handleChange('village', e.target.value)}
                placeholder="Enter your village"
                className="ap-input"
              />
            </div>

            {message && (
              <div className={`rounded-xl px-4 py-3 text-sm ${
                message.includes('successfully')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit to Joint Community'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
