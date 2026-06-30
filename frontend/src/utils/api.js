import axios from 'axios'
import { useAuthStore } from '../context/authStore'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { refreshToken, login } = useAuthStore.getState()
        const res = await axios.post(`${API_BASE}/auth/refresh`, null, {
          params: { refresh_token: refreshToken }
        })
        login(useAuthStore.getState().user, res.data.access_token, refreshToken)
        original.headers.Authorization = `Bearer ${res.data.access_token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(error)
  }
)

// Crop APIs
export const cropApi = {
  list: (params) => api.get('/crops', { params }),
  categories: () => api.get('/crops/categories'),
  detail: (id) => api.get(`/crops/${id}`),
  prices: (id, params) => api.get(`/crops/${id}/prices`, { params }),
}

// Price APIs
export const priceApi = {
  latest: (params) => api.get('/prices/latest', { params }),
  ticker: () => api.get('/prices/ticker'),
}

// Market APIs
export const marketApi = {
  list: (params) => api.get('/markets', { params }),
  nearest: (lat, lng, limit = 5) => api.get('/markets/nearest', { params: { lat, lng, limit } }),
  detail: (id) => api.get(`/markets/${id}`),
}

// Prediction APIs
export const predictionApi = {
  recommend: (crop_id, apmc_id, quantity) =>
    api.post('/predictions/recommend', null, { params: { crop_id, apmc_id, quantity_tonnes: quantity } }),
}

// Weather APIs
export const weatherApi = {
  district: (id) => api.get(`/weather/district/${id}`),
  location: (lat, lng) => api.get('/weather/location', { params: { lat, lng } }),
}

// Scheme APIs
export const schemeApi = {
  list: () => api.get('/schemes'),
  forCrop: (crop_id) => api.get(`/schemes/crop/${crop_id}`),
  msp: () => api.get('/schemes/msp'),
}

// User APIs
export const userApi = {
  profile: () => api.get('/users/me'),
  savedCrops: () => api.get('/users/me/saved-crops'),
  saveCrop: (id) => api.post(`/users/me/saved-crops/${id}`),
  notifications: () => api.get('/users/me/notifications'),
}

export const jointCommunityApi = {
  list: () => api.get('/users/me/joint-community'),
  create: (data) => api.post('/users/me/joint-community', data),
}

// Auth APIs
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// Chatbot APIs
export const chatApi = {
  send: (message, history = []) =>
    api.post('/chatbot/chat', { message, history }, { timeout: 60000 }),
}

export default api
