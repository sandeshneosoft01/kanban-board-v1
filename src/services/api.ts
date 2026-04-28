import { useAuthStore } from '@/stores/auth-store'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

const pendingRequests: Record<string, ReturnType<typeof setTimeout>> = {}

// Request interceptor for injecting auth headers and tracking requests
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken
        const requestId = config.url || Math.random().toString()

        ;(config as any)._requestId = requestId

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for session management and error normalization
api.interceptors.response.use(
    (response) => {
        const requestId = (response.config as any)._requestId
        if (requestId) {
            clearTimeout(pendingRequests[requestId])
            delete pendingRequests[requestId]
        }
        return response
    },
    (error) => {
        const requestId = (error.config as any)?._requestId
        if (requestId) {
            clearTimeout(pendingRequests[requestId])
            delete pendingRequests[requestId]
        }

        if (error.response?.status === 401) {
            console.warn('Unauthorized - Token expired or invalid')
            // Revoke local session state
            useAuthStore.getState().reset()

            // Enforce redirect to sign-in if session is invalidated
            if (!window.location.pathname.startsWith('/sign-in')) {
                window.location.href = '/sign-in'
            }
        }

        return Promise.reject(error)
    }
)

export default api
