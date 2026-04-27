import { create } from 'zustand'

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
  deadline: Date
  description?: string
  stage: TaskStage
  order: number
  createdAt: Date
}

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, newStage: TaskStage) => void
  moveTaskForward: (id: string) => void
  moveTaskBackward: (id: string) => void
  /**
   * Move a task to a specific stage at a specific index within that stage's ordered list.
   * If targetIndex is -1, append to the end.
   */
  reorderTask: (taskId: string, targetStage: TaskStage, targetIndex: number) => void
}

// Sample seed data so the board isn't empty on first load
const sampleTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Design System Documentation',
    priority: 'High',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    description: 'Create comprehensive documentation for the design system components.',
    stage: 'backlog',
    order: 0,
    createdAt: new Date(),
  },
  {
    id: 'task-2',
    name: 'User Authentication Flow',
    priority: 'High',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    description: 'Implement OAuth and email/password authentication.',
    stage: 'todo',
    order: 0,
    createdAt: new Date(),
  },
  {
    id: 'task-3',
    name: 'API Rate Limiting',
    priority: 'Medium',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description: 'Add rate limiting to all public API endpoints.',
    stage: 'todo',
    order: 1,
    createdAt: new Date(),
  },
  {
    id: 'task-4',
    name: 'Dashboard Charts',
    priority: 'Medium',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    description: 'Build interactive charts for the analytics dashboard.',
    stage: 'ongoing',
    order: 0,
    createdAt: new Date(),
  },
  {
    id: 'task-5',
    name: 'Notification System',
    priority: 'Low',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    description: 'Set up push notifications for task updates.',
    stage: 'ongoing',
    order: 1,
    createdAt: new Date(),
  },
  {
    id: 'task-6',
    name: 'Landing Page Redesign',
    priority: 'Low',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    description: 'Modernize the landing page with new branding.',
    stage: 'done',
    order: 0,
    createdAt: new Date(),
  },
  {
    id: 'task-7',
    name: 'Database Migration Script',
    priority: 'High',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description: 'Write migration scripts for the new schema.',
    stage: 'backlog',
    order: 1,
    createdAt: new Date(),
  },
]

let taskCounter = 100

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

export const useTaskStore = create<TaskState>((set) => ({
  tasks: sampleTasks,

  addTask: (task) =>
    set((state) => {
      const maxOrder = state.tasks
        .filter((t) => t.stage === task.stage)
        .reduce((max, t) => Math.max(max, t.order), -1)
      return {
        tasks: [
          ...state.tasks,
          {
            ...task,
            id: `task-${++taskCounter}`,
            order: maxOrder + 1,
            createdAt: new Date(),
          },
        ],
      }
    }),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  deleteTask: (id) =>
    set((state) => {
      const target = state.tasks.find((t) => t.id === id)
      if (!target) return state
      const newTasks = state.tasks.filter((t) => t.id !== id)
      normaliseOrders(newTasks, target.stage)
      return { tasks: [...newTasks] }
    }),

  moveTask: (id, newStage) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return state
      const oldStage = task.stage
      const maxOrder = state.tasks
        .filter((t) => t.stage === newStage && t.id !== id)
        .reduce((max, t) => Math.max(max, t.order), -1)
      const newTasks = state.tasks.map((t) =>
        t.id === id ? { ...t, stage: newStage, order: maxOrder + 1 } : t
      )
      normaliseOrders(newTasks, oldStage)
      normaliseOrders(newTasks, newStage)
      return { tasks: [...newTasks] }
    }),

  moveTaskForward: (id) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return state
      const currentIndex = STAGES.indexOf(task.stage)
      if (currentIndex >= STAGES.length - 1) return state
      const oldStage = task.stage
      const newStage = STAGES[currentIndex + 1]
      const maxOrder = state.tasks
        .filter((t) => t.stage === newStage)
        .reduce((max, t) => Math.max(max, t.order), -1)
      const newTasks = state.tasks.map((t) =>
        t.id === id ? { ...t, stage: newStage, order: maxOrder + 1 } : t
      )
      normaliseOrders(newTasks, oldStage)
      normaliseOrders(newTasks, newStage)
      return { tasks: [...newTasks] }
    }),

  moveTaskBackward: (id) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id)
      if (!task) return state
      const currentIndex = STAGES.indexOf(task.stage)
      if (currentIndex <= 0) return state
      const oldStage = task.stage
      const newStage = STAGES[currentIndex - 1]
      const maxOrder = state.tasks
        .filter((t) => t.stage === newStage)
        .reduce((max, t) => Math.max(max, t.order), -1)
      const newTasks = state.tasks.map((t) =>
        t.id === id ? { ...t, stage: newStage, order: maxOrder + 1 } : t
      )
      normaliseOrders(newTasks, oldStage)
      normaliseOrders(newTasks, newStage)
      return { tasks: [...newTasks] }
    }),

  reorderTask: (taskId, targetStage, targetIndex) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId)
      if (!task) return state

      const oldStage = task.stage

      // Build the ordered list for the target stage (excluding the dragged task)
      const stageTasks = state.tasks
        .filter((t) => t.stage === targetStage && t.id !== taskId)
        .sort((a, b) => a.order - b.order)

      // Clamp target index
      const clampedIndex =
        targetIndex < 0 ? stageTasks.length : Math.min(targetIndex, stageTasks.length)

      // Insert the task at the desired position
      stageTasks.splice(clampedIndex, 0, task)

      // Re-assign orders
      const newOrderMap = new Map<string, number>()
      stageTasks.forEach((t, i) => {
        newOrderMap.set(t.id, i)
      })

      const newTasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, stage: targetStage, order: newOrderMap.get(t.id) ?? 0 }
        }
        if (newOrderMap.has(t.id)) {
          return { ...t, order: newOrderMap.get(t.id) ?? t.order }
        }
        return t
      })

      // Normalise old stage if the task moved across columns
      if (oldStage !== targetStage) {
        normaliseOrders(newTasks, oldStage)
      }

      return { tasks: [...newTasks] }
    }),
}))
