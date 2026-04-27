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
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null, rememberMe?: boolean) => void
    accessToken: string
    setAccessToken: (accessToken: string, rememberMe?: boolean) => void
    resetAccessToken: () => void
    reset: () => void
  }
  rememberMe: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: {
        user: null,
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
              ...state,
              auth: { ...state.auth, user },
              rememberMe: newRememberMe
            }
          }),
        accessToken: '',
        setAccessToken: (accessToken, rememberMe) =>
          set((state) => {
            const newRememberMe = rememberMe !== undefined ? rememberMe : state.rememberMe
            const maxAge = newRememberMe ? 60 * 60 * 24 * 30 : undefined
            setCookie(ACCESS_TOKEN, JSON.stringify(accessToken), maxAge)
            return {
              ...state,
              auth: { ...state.auth, accessToken },
              rememberMe: newRememberMe
            }
          }),
        resetAccessToken: () =>
          set((state) => {
            removeCookie(ACCESS_TOKEN)
            return { ...state, auth: { ...state.auth, accessToken: '' } }
          }),
        reset: () =>
          set((state) => {
            removeCookie(ACCESS_TOKEN)
            removeCookie(AUTH_USER)
            return {
              ...state,
              auth: { ...state.auth, user: null, accessToken: '' },
              rememberMe: false,
            }
          }),
      },
      rememberMe: false,
    }),
    {
      name: 'kanban-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
