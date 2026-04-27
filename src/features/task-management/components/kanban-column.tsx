import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useShallow } from 'zustand/react/shallow'
import { useTaskStore, STAGE_LABELS, type Task, type TaskStage } from '@/stores/task-store'
import {
  Archive,
  ClipboardList,
  Loader,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TaskCard } from './task-card'

const stageIcons: Record<TaskStage, React.ReactNode> = {
  backlog: <Archive className='h-4 w-4' />,
  todo: <ClipboardList className='h-4 w-4' />,
  ongoing: <Loader className='h-4 w-4' />,
  done: <CheckCircle2 className='h-4 w-4' />,
}

const stageColors: Record<TaskStage, {
  dot: string
  headerBg: string
  headerBorder: string
  countBg: string
  countText: string
  dropHighlight: string
  lineColor: string
}> = {
  backlog: {
    dot: 'bg-slate-400',
    headerBg: 'bg-slate-50 dark:bg-slate-900/50',
    headerBorder: 'border-slate-200 dark:border-slate-800',
    countBg: 'bg-slate-100 dark:bg-slate-800',
    countText: 'text-slate-600 dark:text-slate-300',
    dropHighlight: 'border-slate-400/50 bg-slate-50/50 dark:bg-slate-900/30',
    lineColor: 'bg-slate-400 dark:bg-slate-500',
  },
  todo: {
    dot: 'bg-blue-500',
    headerBg: 'bg-blue-50 dark:bg-blue-950/30',
    headerBorder: 'border-blue-200 dark:border-blue-800/50',
    countBg: 'bg-blue-100 dark:bg-blue-900/50',
    countText: 'text-blue-600 dark:text-blue-300',
    dropHighlight: 'border-blue-400/50 bg-blue-50/50 dark:bg-blue-950/20',
    lineColor: 'bg-blue-500',
  },
  ongoing: {
    dot: 'bg-amber-500',
    headerBg: 'bg-amber-50 dark:bg-amber-950/30',
    headerBorder: 'border-amber-200 dark:border-amber-800/50',
    countBg: 'bg-amber-100 dark:bg-amber-900/50',
    countText: 'text-amber-600 dark:text-amber-300',
    dropHighlight: 'border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20',
    lineColor: 'bg-amber-500',
  },
  done: {
    dot: 'bg-emerald-500',
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    headerBorder: 'border-emerald-200 dark:border-emerald-800/50',
    countBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    countText: 'text-emerald-600 dark:text-emerald-300',
    dropHighlight: 'border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20',
    lineColor: 'bg-emerald-500',
  },
}

/** Horizontal drop-line rendered between cards. */
function DropLine({ lineColor }: { lineColor: string }) {
  return (
    <div className='relative flex items-center py-0.5 px-1 pointer-events-none'>
      {/* Left dot */}
      <div className={cn('h-2.5 w-2.5 rounded-full shrink-0 shadow-sm', lineColor)} />
      {/* Line */}
      <div className={cn('flex-1 h-0.5 rounded-full mx-1 shadow-sm', lineColor)} />
      {/* Right dot */}
      <div className={cn('h-2.5 w-2.5 rounded-full shrink-0 shadow-sm', lineColor)} />
    </div>
  )
}

interface DropTarget {
  taskId: string
  position: 'before' | 'after'
}

interface KanbanColumnProps {
  stage: TaskStage
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDragEnd: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, stage: TaskStage, targetIndex: number) => void
  draggedTaskId: string | null
}

export function KanbanColumn({
  stage,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedTaskId,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const colors = stageColors[stage]

  const tasks = useTaskStore(
    useShallow((state) => state.tasks.filter((t) => t.stage === stage))
  )

  const parentRef = useRef<HTMLDivElement>(null)
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (parentRef.current) {
      const viewport = parentRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (viewport instanceof HTMLDivElement) {
        setScrollElement(viewport)
      }
    }
  }, [])

  // Sort tasks by their order field
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.order - b.order),
    [tasks]
  )

  const estimateSize = useCallback(() => 140, [])

  const virtualizer = useVirtualizer({
    count: sortedTasks.length,
    getScrollElement: () => scrollElement,
    estimateSize,
    overscan: 5,
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const { clientX, clientY } = e
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsDragOver(false)
      setDropTarget(null)
    }
  }, [])

  const handleCardDragOver = useCallback(
    (_e: React.DragEvent, task: Task, position: 'before' | 'after') => {
      if (task.id === draggedTaskId) return
      setDropTarget({ taskId: task.id, position })
    },
    [draggedTaskId]
  )

  const getTargetIndex = useCallback((): number => {
    if (!dropTarget) return -1

    const visibleTasks = sortedTasks.filter((t) => t.id !== draggedTaskId)
    const targetIdx = visibleTasks.findIndex((t) => t.id === dropTarget.taskId)
    if (targetIdx === -1) return -1

    return dropTarget.position === 'before' ? targetIdx : targetIdx + 1
  }, [dropTarget, sortedTasks, draggedTaskId])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const targetIndex = getTargetIndex()
    setDropTarget(null)
    onDrop(e, stage, targetIndex)
  }, [onDrop, stage, getTargetIndex])

  const handleDragEndLocal = useCallback((e: React.DragEvent) => {
    setDropTarget(null)
    setIsDragOver(false)
    onDragEnd(e)
  }, [onDragEnd])

  /**
   * Determine whether a drop-line should appear BEFORE a card at `index`
   * within the visible (non-dragged) sorted list.
   */
  const shouldShowLineBefore = useCallback(
    (task: Task): boolean => {
      if (!dropTarget || !draggedTaskId) return false
      if (dropTarget.taskId === task.id && dropTarget.position === 'before') return true
      return false
    },
    [dropTarget, draggedTaskId]
  )

  /**
   * Determine whether a drop-line should appear AFTER a card.
   */
  const shouldShowLineAfter = useCallback(
    (task: Task): boolean => {
      if (!dropTarget || !draggedTaskId) return false
      if (dropTarget.taskId === task.id && dropTarget.position === 'after') return true
      return false
    },
    [dropTarget, draggedTaskId]
  )

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-muted/30 min-w-[280px] w-[280px] shrink-0 transition-all duration-200',
        isDragOver && cn('border-dashed border-2', colors.dropHighlight),
        !isDragOver && 'border-border/60',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id={`kanban-column-${stage}`}
    >
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3 rounded-t-xl border-b',
        colors.headerBg,
        colors.headerBorder,
      )}>
        <div className='flex items-center gap-2'>
          <div className={cn('h-2 w-2 rounded-full', colors.dot)} />
          <span className='text-sm font-semibold text-foreground'>
            {STAGE_LABELS[stage]}
          </span>
        </div>
        <span className={cn(
          'text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5',
          colors.countBg,
          colors.countText,
        )}>
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <ScrollArea ref={parentRef} className='flex-1 max-h-[calc(100vh-260px)] py-2.5'>
        {sortedTasks.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-muted-foreground/60'>
            <div className='p-3 rounded-full bg-muted/50 mb-2'>
              {stageIcons[stage]}
            </div>
            <p className='text-xs font-medium'>No tasks</p>
            <p className='text-[10px] mt-0.5'>Drag tasks here</p>
          </div>
        ) : (
          <div
            className='relative w-full'
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const task = sortedTasks[virtualItem.index]
              const isFirst = virtualItem.index === 0

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  className='absolute top-0 left-0 w-full px-2 flex flex-col gap-0'
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className='flex flex-col'>
                    {/* Drop line BEFORE this card */}
                    <div className={cn(
                      'transition-all duration-150 overflow-hidden',
                      shouldShowLineBefore(task) ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
                    )}>
                      <DropLine lineColor={colors.lineColor} />
                    </div>

                    {/* Gap between cards (unless the first or a line is shown) */}
                    {!isFirst && !shouldShowLineBefore(task) && (
                      <div className='h-2.5' />
                    )}

                    <TaskCard
                      task={task}
                      onDragStart={onDragStart}
                      onDragEnd={handleDragEndLocal}
                      onDragOver={handleCardDragOver}
                    />

                    {/* Drop line AFTER this card */}
                    <div className={cn(
                      'transition-all duration-150 overflow-hidden',
                      shouldShowLineAfter(task) ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
                    )}>
                      <DropLine lineColor={colors.lineColor} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
