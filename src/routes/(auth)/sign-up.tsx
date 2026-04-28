import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignUp } from '@/features/auth/sign-up'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/(auth)/sign-up')({
  beforeLoad: () => {
    const { user, accessToken } = useAuthStore.getState()
    if (user && accessToken) {
      throw redirect({ to: '/' })
    }
  },
  component: SignUp,
  head: () => ({
    meta: [
      { title: 'Create Account | KanbanBoard' },
      {
        name: 'description',
        content: 'Join KanbanBoard today and start organizing your tasks with ease.',
      },
    ],
  }),
})
