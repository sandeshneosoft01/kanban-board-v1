import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
