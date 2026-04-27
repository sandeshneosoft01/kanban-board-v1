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

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().auth.accessToken
        const requestId = config.url || Math.random().toString()

            // Show a warning toast if the server is taking too long (useful for json-server or slow networks)
            // pendingRequests[requestId] = setTimeout(() => {
            //     toast.warning(
            //         'Server is taking a while to respond. Please wait a moment.'
            //     )
            // }, 5000)

            ; (config as any)._requestId = requestId

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// ✅ RESPONSE INTERCEPTOR
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
            // Clear the auth state
            useAuthStore.getState().auth.reset()

            // Redirect to sign-in page if not already there
            if (!window.location.pathname.startsWith('/sign-in')) {
                window.location.href = '/sign-in'
            }
        }

        return Promise.reject(error)
    }
)

export default api
