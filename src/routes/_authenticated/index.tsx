import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: 'Dashboard | KanbanBoard' },
      {
        name: 'description',
        content: 'Your personal dashboard for task management and productivity tracking.',
      },
    ],
  }),
})
