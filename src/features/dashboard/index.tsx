import { useEffect } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  TrendingUp,
  PlusIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useTaskStore } from '@/stores/task-store'

export function Dashboard() {
  const tasks = useTaskStore((state) => state.tasks)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.stage === 'done').length
  const pendingTasks = totalTasks - completedTasks

  const completedPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const pendingPercentage = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='flex items-center justify-between w-full'>
          <Search />
          <div className='flex items-center gap-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Welcome back! Here&apos;s an overview of your productivity.
            </p>
          </div>
          <Link to="/task-management" search={{ createTask: true }}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </Link>
        </div>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Card className='relative overflow-hidden'>
            <CardContent className='p-6 py-2'>
              <div className='flex items-center justify-between'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'>
                  <ClipboardList className='h-6 w-6' />
                </div>
                <div className='flex items-center gap-1 text-sm font-medium text-emerald-600'>
                  <TrendingUp className='h-4 w-4' />
                  <span>100%</span>
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Total Tasks
                </p>
                <h3 className='mt-1 text-3xl font-bold'>{totalTasks}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className='relative overflow-hidden'>
            <CardContent className='p-6 py-2'>
              <div className='flex items-center justify-between'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
                  <CheckCircle2 className='h-6 w-6' />
                </div>
                <div className='flex items-center gap-1 text-sm font-medium text-emerald-600'>
                  <TrendingUp className='h-4 w-4' />
                  <span>{completedPercentage}%</span>
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Completed
                </p>
                <h3 className='mt-1 text-3xl font-bold'>{completedTasks}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className='relative overflow-hidden'>
            <CardContent className='p-6 py-2'>
              <div className='flex items-center justify-between'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'>
                  <Clock className='h-6 w-6' />
                </div>
                <div className='flex items-center gap-1 text-sm font-medium text-amber-600'>
                  <TrendingUp className='h-4 w-4' />
                  <span>{pendingPercentage}%</span>
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Pending
                </p>
                <h3 className='mt-1 text-3xl font-bold'>{pendingTasks}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}