import { memo, useState, useRef } from 'react'
import { format } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Calendar,
  GripVertical,
  Flame,
  AlertTriangle,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { STAGES, useTaskStore, type Task, type TaskPriority } from '@/stores/task-store'
import { CreateEditTaskDialog } from './create-edit-task-dialog'

const priorityConfig: Record<TaskPriority, {
  color: string
  bgColor: string
  borderColor: string
  icon: React.ReactNode
  label: string
}> = {
  High: {
    color: 'text-rose-700 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800/40',
    icon: <Flame className='h-3 w-3' />,
    label: 'High',
  },
  Medium: {
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    icon: <AlertTriangle className='h-3 w-3' />,
    label: 'Medium',
  },
  Low: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
    icon: <ArrowDown className='h-3 w-3' />,
    label: 'Low',
  },
}

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent, task: Task, position: 'before' | 'after') => void
}

export const TaskCard = memo(function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onDragOver,
}: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const { moveTaskForward, moveTaskBackward, deleteTask } = useTaskStore()

  const isFirstStage = task.stage === STAGES[0]
  const isLastStage = task.stage === STAGES[STAGES.length - 1]
  const priority = priorityConfig[task.priority]

  const isOverdue = new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0))

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(e, task)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    onDragEnd(e)
  }

  const handleCardDragOver = (e: React.DragEvent) => {
    if (!onDragOver || !cardRef.current) return
    e.preventDefault()
    e.stopPropagation()
    const rect = cardRef.current.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position = e.clientY < midY ? 'before' : 'after'
    onDragOver(e, task, position)
  }

  return (
    <>
      <div
        ref={cardRef}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleCardDragOver}
        className={cn(
          'group relative rounded-xl border bg-card p-3.5 transition-all duration-200',
          'hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5',
          'cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-40 scale-95 rotate-1 shadow-lg',
        )}>

        {/* Drag Handle */}
        <div className='absolute top-3 left-1.5 opacity-0 group-hover:opacity-40 transition-opacity'>
          <GripVertical className='h-4 w-4 text-muted-foreground' />
        </div>

        {/* Card Content */}
        <div className='pl-3'>
          {/* Top row: priority badge + actions */}
          <div className='flex items-start justify-between gap-2 mb-2'>
            <Badge
              variant='outline'
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider border px-1.5 py-0.5 gap-1',
                priority.color,
                priority.bgColor,
                priority.borderColor,
              )}
            >
              {priority.icon}
              {priority.label}
            </Badge>

            {/* Action buttons */}
            <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 rounded-md text-muted-foreground hover:text-foreground'
                    disabled={isFirstStage}
                    onClick={(e) => { e.stopPropagation(); moveTaskBackward(task.id) }}
                    id={`task-back-${task.id}`}
                  >
                    <ChevronLeft className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move Back</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 rounded-md text-muted-foreground hover:text-foreground'
                    disabled={isLastStage}
                    onClick={(e) => { e.stopPropagation(); moveTaskForward(task.id) }}
                    id={`task-forward-${task.id}`}
                  >
                    <ChevronRight className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move Forward</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 rounded-md text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400'
                    onClick={(e) => { e.stopPropagation(); setIsEditOpen(true) }}
                    id={`task-edit-${task.id}`}
                  >
                    <Pencil className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 rounded-md text-muted-foreground hover:text-destructive'
                    onClick={(e) => { e.stopPropagation(); setIsDeleteOpen(true) }}
                    id={`task-delete-${task.id}`}
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Task Name */}
          <h4 className='text-sm font-semibold leading-snug mb-2 text-foreground'>
            {task.name}
          </h4>

          {/* Deadline */}
          <div className={cn(
            'flex items-center gap-1.5 text-xs',
            isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
          )}>
            <Calendar className='h-3 w-3' />
            <span>
              {isOverdue && 'Overdue · '}
              {format(new Date(task.deadline), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditOpen && (
        <CreateEditTaskDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          task={task}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title='Delete Task'
        desc={
          <>
            Are you sure you want to delete <strong>{task.name}</strong>? This action cannot be undone.
          </>
        }
        confirmText='Delete'
        destructive
        handleConfirm={async () => {
          await deleteTask(task.id)
          setIsDeleteOpen(false)
        }}
      />
    </>
  )
})
