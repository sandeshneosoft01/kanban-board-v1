import { TaskManagement } from '@/features/task-management'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/task-management/')({
  component: TaskManagement,
})
