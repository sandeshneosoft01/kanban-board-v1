import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'kanban-access-token'
const AUTH_USER = 'kanban-auth-user'

interface AuthUser {
  accountNo: string
  email: string
  name: string
  username: string
  profileImage?: string | null
  exp: number
}

interface AuthState {
  user: AuthUser | null
  accessToken: string
  rememberMe: boolean
  setUser: (user: AuthUser | null, rememberMe?: boolean) => void
  setAccessToken: (accessToken: string, rememberMe?: boolean) => void
  resetAccessToken: () => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: '',
      rememberMe: false,

      setUser: (user, rememberMe) =>
        set((state) => {
          const newRememberMe = rememberMe !== undefined ? rememberMe : state.rememberMe
          if (user) {
            const maxAge = newRememberMe ? 60 * 60 * 24 * 30 : undefined
            setCookie(AUTH_USER, JSON.stringify(user), maxAge)
          } else {
            removeCookie(AUTH_USER)
          }
          return {
            user,
            rememberMe: newRememberMe
          }
        }),

      setAccessToken: (accessToken, rememberMe) =>
        set((state) => {
          const newRememberMe = rememberMe !== undefined ? rememberMe : state.rememberMe
          const maxAge = newRememberMe ? 60 * 60 * 24 * 30 : undefined
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken), maxAge)
          return {
            accessToken,
            rememberMe: newRememberMe
          }
        }),

      resetAccessToken: () =>
        set(() => {
          removeCookie(ACCESS_TOKEN)
          return { accessToken: '' }
        }),

      reset: () =>
        set(() => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(AUTH_USER)
          return {
            user: null,
            accessToken: '',
            rememberMe: false,
          }
        }),
    }),
    {
      name: 'kanban-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        rememberMe: state.rememberMe,
      }),
    }
  )
)
