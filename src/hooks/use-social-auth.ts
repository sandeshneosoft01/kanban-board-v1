import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { signInWithPopup, AuthProvider } from 'firebase/auth'
import { toast } from 'sonner'
import { auth } from '@/lib/firebase'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth-store'
import { logger } from '@/lib/logger'

export function useSocialAuth() {
  const [isSocialLoading, setIsSocialLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuthStore()

  const handleSocialLogin = async (provider: AuthProvider) => {
    setIsSocialLoading(true)
    try {
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user

      if (!firebaseUser.email) {
        throw new Error('No email found in social account.')
      }

      // Verify if identity exists in the remote database
      const res = await api.get(`/users?email=${firebaseUser.email}`)
      let user = res.data[0]

      if (!user) {
        // Provision new user record if first-time social authentication
        const newUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Social User',
          username: firebaseUser.email.split('@')[0] + '_' + Math.random().toString(36).substring(7),
          email: firebaseUser.email,
          profileImage: firebaseUser.photoURL || null,
          password: btoa('social-login-' + Math.random().toString(36)), // Placeholder credential for system compatibility
          contactNumber: firebaseUser.phoneNumber || '',
        }
        const createRes = await api.post('/users', newUser)
        user = createRes.data
        toast.success(`Account created with ${firebaseUser.email}`)
      } else {
        toast.success(`Welcome back, ${user.name}!`)
      }

      // Synchronize application session state
      const mockUser = {
        accountNo: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        profileImage: user.profileImage,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }

      setUser(mockUser, true)
      const mockToken = btoa(JSON.stringify({ id: user.id, email: user.email, exp: mockUser.exp }))
      setAccessToken(mockToken, true)

      navigate({ to: '/', replace: true })
    } catch (error: any) {
      logger.error('Social Auth Error:', error)
      toast.error(error.message || 'Error with social authentication.')
    } finally {
      setIsSocialLoading(false)
    }
  }

  return { handleSocialLogin, isSocialLoading }
}
