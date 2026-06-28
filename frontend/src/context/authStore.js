import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      lang: 'en',

      login: (user, accessToken, refreshToken) => set({
        user, accessToken, refreshToken, isAuthenticated: true
      }),

      logout: () => set({
        user: null, accessToken: null, refreshToken: null, isAuthenticated: false
      }),

      setLang: (lang) => set({ lang }),

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
    }),
    {
      name: 'agriprice-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lang: state.lang,
      }),
    }
  )
)
