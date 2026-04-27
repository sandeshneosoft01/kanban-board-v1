import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDownIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { useTaskStore } from '@/stores/task-store'
import type { Task, TaskPriority } from '@/stores/task-store'

const taskSchema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
  priority: z.string().min(1, 'Priority is required'),
  deadline: z.date({
    error: (iss) => (iss.received === 'undefined' ? 'Deadline is required' : 'Invalid date'),
  }),
  description: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface CreateEditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
}

export function CreateEditTaskDialog({
  open,
  onOpenChange,
  task,
}: CreateEditTaskDialogProps) {
  const isEdit = !!task
  const [isLoading, setIsLoading] = useState(false)

  const addTask = useTaskStore((state) => state.addTask)
  const updateTask = useTaskStore((state) => state.updateTask)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: task?.name ?? '',
      priority: task?.priority ?? 'Medium',
      deadline: task ? new Date(task.deadline) : undefined,
      description: task?.description ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        taskName: task?.name ?? '',
        priority: task?.priority ?? 'Medium',
        deadline: task ? new Date(task.deadline) : undefined,
        description: task?.description ?? '',
      })
    }
  }, [open, task, form])

  const onSubmit = async (values: TaskFormValues) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, isEdit ? 500 : 1500))

    if (isEdit && task) {
      updateTask(task.id, {
        name: values.taskName,
        priority: values.priority as TaskPriority,
        deadline: values.deadline,
        description: values.description,
      })
      toast.success('Task updated successfully!')
    } else {
      addTask({
        name: values.taskName,
        priority: values.priority as TaskPriority,
        deadline: values.deadline,
        description: values.description,
        stage: 'backlog',
      })
      toast.success('Task created successfully!')
    }

    setIsLoading(false)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-0 gap-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col sm:max-w-lg md:max-w-xl'>
        <DialogHeader className='p-6 relative shrink-0'>
          <div className='space-y-1 sm:space-y-1.5 text-left'>
            <DialogTitle className='font-bold tracking-tight'>
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the task details below.'
                : 'Add details to assign this task to your workspace.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 flex flex-col overflow-hidden'
          >
            <div className='flex-1 overflow-y-auto px-6 space-y-4 pb-2'>
              <FormField
                control={form.control}
                name='taskName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#374151] ml-0.5'>
                      Task Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Design System Documentation'
                        className={cn(
                          form.formState.errors.taskName && 'border-[#ef4444] bg-[#fef2f2] focus:border-[#ef4444] focus:ring-[#ef4444]/10'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex items-start gap-3 w-full'>
                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#374151] ml-0.5'>
                        Priority
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        key={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select priority' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-[#e5e7eb] shadow-xl'>
                          <SelectItem value='Low' className='rounded-lg focus:bg-slate-50'>Low</SelectItem>
                          <SelectItem value='Medium' className='rounded-lg focus:bg-slate-50'>Medium</SelectItem>
                          <SelectItem value='High' className='rounded-lg focus:bg-slate-50'>High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='deadline'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#374151] ml-0.5'>
                        Deadline
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              data-empty={!field.value}
                              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <ChevronDownIcon />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0 border-none shadow-2xl rounded-2xl' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isEdit ? undefined : (date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                            className='rounded-2xl p-4'
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description field — only shown in create mode */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#374151] ml-0.5'>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe the task scope...'
                        className='min-h-[100px] sm:min-h-[120px] bg-white border-[#d1d5db] px-4 py-3 text-sm sm:text-[15px] resize-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-[#9ca3af]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end sm:gap-4 p-4 bg-muted/50 border-t'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    {isEdit ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Save Changes' : 'Create Task'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
