import { useState, useCallback, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { STAGES, STAGE_LABELS, useTaskStore, type Task, type TaskStage } from '@/stores/task-store'
import { KanbanColumn } from './kanban-column'

export function KanbanBoard() {
  const reorderTask = useTaskStore((state) => state.reorderTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)

  const [isDragging, setIsDragging] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [isOverTrash, setIsOverTrash] = useState(false)
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const draggedTaskRef = useRef<Task | null>(null)



  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    draggedTaskRef.current = task
    setDraggedTaskId(task.id)
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    // Small delay so the dragging state applies after the drag image is captured
    requestAnimationFrame(() => {
      setIsDragging(true)
    })
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setIsOverTrash(false)
    setDraggedTaskId(null)
    draggedTaskRef.current = null
  }, [])

  const handleColumnDrop = useCallback(
    (_e: React.DragEvent, stage: TaskStage, targetIndex: number) => {
      const task = draggedTaskRef.current
      if (task) {
        reorderTask(task.id, stage, targetIndex)
        if (task.stage !== stage) {
          toast.success(`Moved to ${STAGE_LABELS[stage]}`)
        }
      }
      setIsDragging(false)
      setIsOverTrash(false)
      setDraggedTaskId(null)
      draggedTaskRef.current = null
    },
    [reorderTask]
  )

  // Trash bin handlers
  const handleTrashDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsOverTrash(true)
  }, [])

  const handleTrashDragLeave = useCallback(() => {
    setIsOverTrash(false)
  }, [])

  const handleTrashDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const task = draggedTaskRef.current
    if (task) {
      setPendingDeleteTask(task)
      setShowDeleteConfirm(true)
    }
    setIsDragging(false)
    setIsOverTrash(false)
    setDraggedTaskId(null)
    draggedTaskRef.current = null
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (pendingDeleteTask) {
      await deleteTask(pendingDeleteTask.id)
    }
    setPendingDeleteTask(null)
    setShowDeleteConfirm(false)
  }, [pendingDeleteTask, deleteTask])

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteTask(null)
    setShowDeleteConfirm(false)
  }, [])

  return (
    <div className='relative'>
      {/* Board */}
      <div className='flex gap-4 overflow-x-auto pb-4 no-scrollbar'>
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleColumnDrop}
            draggedTaskId={draggedTaskId}
          />
        ))}
      </div>

      {/* Trash Bin — appears at bottom-right during drag */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out',
          isDragging
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
        )}
        onDragOver={handleTrashDragOver}
        onDragLeave={handleTrashDragLeave}
        onDrop={handleTrashDrop}
        id='kanban-trash-bin'
      >
        <div
          className={cn(
            'flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-dashed transition-all duration-200',
            isOverTrash
              ? 'bg-destructive text-white border-destructive scale-110 shadow-destructive/30'
              : 'bg-card text-destructive border-destructive/30 hover:border-destructive/50'
          )}
        >
          <Trash2
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              isOverTrash && 'animate-bounce'
            )}
          />
          <span className='text-sm font-semibold whitespace-nowrap'>
            {isOverTrash ? 'Release to delete' : 'Drop here to delete'}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete()
        }}
        title='Delete Task'
        desc={
          <>
            Are you sure you want to delete{' '}
            <strong>{pendingDeleteTask?.name}</strong>? This action cannot be
            undone.
          </>
        }
        confirmText='Delete'
        destructive
        handleConfirm={handleConfirmDelete}
      />
    </div>
  )
}
