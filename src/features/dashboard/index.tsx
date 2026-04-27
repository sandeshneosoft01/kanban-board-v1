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

export function Dashboard() {
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
        <div className='flex items-end justify-end mb-4'>
          <Link to="/task-management" className="">
            <Button>
              <PlusIcon className="h-4 w-4" />
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
                  <span>12%</span>
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Total Tasks
                </p>
                <h3 className='mt-1 text-3xl font-bold'>124</h3>
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
                  <span>8%</span>
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Completed
                </p>
                <h3 className='mt-1 text-3xl font-bold'>86</h3>
              </div>
            </CardContent>
          </Card>
          <Card className='relative overflow-hidden'>
            <CardContent className='p-6 py-2'>
              <div className='flex items-center justify-between'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'>
                  <Clock className='h-6 w-6' />
                </div>
                <div className='flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'>
                  <Clock className='mr-1 h-3 w-3' />
                  Active
                </div>
              </div>
              <div className='mt-4'>
                <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Pending
                </p>
                <h3 className='mt-1 text-3xl font-bold'>38</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}