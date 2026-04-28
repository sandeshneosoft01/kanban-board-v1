import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/features/auth/forgot-password'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: ForgotPassword,
  head: () => ({
    meta: [
      { title: 'Forgot Password | KanbanBoard' },
      {
        name: 'description',
        content: 'Reset your KanbanBoard account password safely and securely.',
      },
    ],
  }),
})
