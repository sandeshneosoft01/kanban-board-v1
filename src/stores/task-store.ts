import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/services/api'
import { toast } from 'sonner'
import { useAuthStore } from './auth-store'

export type TaskPriority = 'Low' | 'Medium' | 'High'

export type TaskStage = 'backlog' | 'todo' | 'ongoing' | 'done'

export const STAGES: TaskStage[] = ['backlog', 'todo', 'ongoing', 'done']

export const STAGE_LABELS: Record<TaskStage, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  ongoing: 'Ongoing',
  done: 'Done',
}

export interface Task {
  id: string
  name: string
  priority: TaskPriority
  deadline: string // ISO date string for persistence compatibility
  description?: string
  stage: TaskStage
  order: number
  createdAt: string
  userId: string 
}

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order' | 'userId'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, newStage: TaskStage) => Promise<void>
  moveTaskForward: (id: string) => Promise<void>
  moveTaskBackward: (id: string) => Promise<void>
  reorderTask: (taskId: string, targetStage: TaskStage, targetIndex: number) => Promise<void>
}

/**
 * Helper: normalise order values for all tasks in a given stage so they are
 * sequential (0, 1, 2, …).  Mutates the array items in-place and returns the
 * same array reference for convenience.
 */
function normaliseOrders(tasks: Task[], stage: TaskStage): Task[] {
  const stageTasks = tasks
    .filter((t) => t.stage === stage)
    .sort((a, b) => a.order - b.order)
  stageTasks.forEach((t, i) => {
    t.order = i
  })
  return tasks
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

      fetchTasks: async () => {
        const user = useAuthStore.getState().user
        if (!user) return

        set({ isLoading: true, error: null })
        try {
          const response = await api.get<Task[]>(`/tasks?userId=${user.accountNo}`)
          // Initial sort by order field before committing to state
          const sortedTasks = response.data.sort((a, b) => a.order - b.order)
          set({ tasks: sortedTasks, isLoading: false })
        } catch (error) {
          console.error('Failed to fetch tasks:', error)
          set({ error: 'Failed to fetch tasks', isLoading: false })
          toast.error('Failed to load tasks')
        }
      },

      addTask: async (task) => {
        const user = useAuthStore.getState().user
        if (!user) {
          toast.error('You must be logged in to add tasks')
          return
        }

        set({ isLoading: true })
        try {
          const { tasks } = get()
          const maxOrder = tasks
            .filter((t) => t.stage === task.stage)
            .reduce((max, t) => Math.max(max, t.order), -1)

          const newTask: Omit<Task, 'id'> = {
            ...task,
            userId: user.accountNo,
            order: maxOrder + 1,
            createdAt: new Date().toISOString(),
          }

          const response = await api.post<Task>('/tasks', newTask)
          set({ tasks: [...tasks, response.data], isLoading: false })
          toast.success('Task created successfully')
        } catch (error) {
          console.error('Failed to add task:', error)
          set({ isLoading: false })
          toast.error('Failed to create task')
        }
      },

      updateTask: async (id, updates) => {
        try {
          const { tasks } = get()
          const taskToUpdate = tasks.find((t) => t.id === id)
          if (!taskToUpdate) return

          const updatedTask = { ...taskToUpdate, ...updates }
          await api.patch(`/tasks/${id}`, updates)

          set({
            tasks: tasks.map((task) => (task.id === id ? updatedTask : task)),
          })
          toast.success('Task updated')
        } catch (error) {
          console.error('Failed to update task:', error)
          toast.error('Failed to update task')
        }
      },

      deleteTask: async (id) => {
        try {
          const { tasks } = get()
          const target = tasks.find((t) => t.id === id)
          if (!target) return

          await api.delete(`/tasks/${id}`)

          const newTasks = tasks.filter((t) => t.id !== id)
          normaliseOrders(newTasks, target.stage)
          
          set({ tasks: [...newTasks] })
          toast.success('Task deleted')
        } catch (error) {
          console.error('Failed to delete task:', error)
          toast.error('Failed to delete task')
        }
      },

      moveTask: async (id, newStage) => {
        try {
          const { tasks } = get()
          const task = tasks.find((t) => t.id === id)
          if (!task) return

          const oldStage = task.stage
          const maxOrder = tasks
            .filter((t) => t.stage === newStage && t.id !== id)
            .reduce((max, t) => Math.max(max, t.order), -1)

          const updatedTask = { ...task, stage: newStage, order: maxOrder + 1 }
          await api.patch(`/tasks/${id}`, { stage: newStage, order: maxOrder + 1 })

          const newTasks = tasks.map((t) => (t.id === id ? updatedTask : t))
          normaliseOrders(newTasks, oldStage)
          normaliseOrders(newTasks, newStage)

          set({ tasks: [...newTasks] })
        } catch (error) {
          console.error('Failed to move task:', error)
          toast.error('Failed to move task')
        }
      },

      moveTaskForward: async (id) => {
        const { tasks, moveTask } = get()
        const task = tasks.find((t) => t.id === id)
        if (!task) return
        const currentIndex = STAGES.indexOf(task.stage)
        if (currentIndex < STAGES.length - 1) {
          await moveTask(id, STAGES[currentIndex + 1])
        }
      },

      moveTaskBackward: async (id) => {
        const { tasks, moveTask } = get()
        const task = tasks.find((t) => t.id === id)
        if (!task) return
        const currentIndex = STAGES.indexOf(task.stage)
        if (currentIndex > 0) {
          await moveTask(id, STAGES[currentIndex - 1])
        }
      },

      reorderTask: async (taskId, targetStage, targetIndex) => {
        try {
          const { tasks } = get()
          const task = tasks.find((t) => t.id === taskId)
          if (!task) return

          const oldStage = task.stage

          // Filter out the moving task and sort siblings by sequence order
          const stageTasks = tasks
            .filter((t) => t.stage === targetStage && t.id !== taskId)
            .sort((a, b) => a.order - b.order)

          // Constrain target index within valid bounds
          const clampedIndex =
            targetIndex < 0 ? stageTasks.length : Math.min(targetIndex, stageTasks.length)

          // Splice task into new position in the sorted array
          stageTasks.splice(clampedIndex, 0, task)

          // Map new order indices for persistence
          const updates = stageTasks.map((t, i) => {
            const newOrder = i
            const newStage = targetStage
            return { id: t.id, order: newOrder, stage: newStage }
          })

          // Optimistic update for UI responsiveness
          const newTasks = tasks.map((t) => {
            const update = updates.find((u) => u.id === t.id)
            if (update) {
              return { ...t, order: update.order, stage: update.stage as TaskStage }
            }
            return t
          })

          // Re-index previous stage if cross-column movement occurred
          if (oldStage !== targetStage) {
            normaliseOrders(newTasks, oldStage)
          }

          set({ tasks: [...newTasks] })

          // Batch persist sequence updates
          await Promise.all(
            updates.map((u) => api.patch(`/tasks/${u.id}`, { order: u.order, stage: u.stage }))
          )
        } catch (error) {
          console.error('Failed to reorder task:', error)
          toast.error('Failed to reorder task')
          get().fetchTasks()
        }
      },
    }),
    {
      name: 'kanban-task-storage',
      partialize: (state) => ({ tasks: state.tasks }), // Persist task data only
    }
  )
)
