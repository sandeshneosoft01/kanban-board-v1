import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'
import { useAuthStore } from '@/stores/auth-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: () => {
    const { user, accessToken } = useAuthStore.getState()
    if (user && accessToken) {
      throw redirect({ to: '/' })
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: 'Sign In | KanbanBoard' },
      {
        name: 'description',
        content: 'Sign in to your KanbanBoard account to manage your projects and tasks.',
      },
    ],
  }),
})
