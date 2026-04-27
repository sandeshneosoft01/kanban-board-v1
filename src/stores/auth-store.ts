import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'kanban-access-token'
const AUTH_USER = 'kanban-auth-user'

interface AuthUser {
  accountNo: string
  email: string
  name: string
  username: string
  profileImage?: string | null
  role: string[]
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
}

export const useAuthStore = create<AuthState>()((set) => {
  const getInitialToken = () => {
    try {
      const cookieState = getCookie(ACCESS_TOKEN)
      return cookieState ? JSON.parse(cookieState) : ''
    } catch {
      return ''
    }
  }

  const getInitialUser = () => {
    try {
      const cookieState = getCookie(AUTH_USER)
      return cookieState ? JSON.parse(cookieState) : null
    } catch {
      return null
    }
  }

  return {
    auth: {
      user: getInitialUser(),
      setUser: (user, rememberMe) =>
        set((state) => {
          if (user) {
            const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined // 30 days if remembered, else session
            setCookie(AUTH_USER, JSON.stringify(user), maxAge)
          } else {
            removeCookie(AUTH_USER)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: getInitialToken(),
      setAccessToken: (accessToken, rememberMe) =>
        set((state) => {
          const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined // 30 days if remembered, else session
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken), maxAge)
          return { ...state, auth: { ...state.auth, accessToken } }
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
          }
        }),
    },
  }
})
