import { TaskManagement } from '@/features/task-management'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const taskManagementSearchSchema = z.object({
  createTask: z.boolean().optional(),
  taskId: z.coerce.string().optional(),
})

export const Route = createFileRoute('/_authenticated/task-management/')({
  component: TaskManagement,
  validateSearch: (search) => taskManagementSearchSchema.parse(search),
})
