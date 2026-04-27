import { Logo } from '@/assets/logo'
import { CheckCircle2, Layout, Moon, Search } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh lg:h-svh lg:grid-cols-2 lg:overflow-hidden'>
      <div className='relative hidden flex-col bg-muted p-10 text-primary-foreground lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-primary' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Logo className='mr-2 size-8' />
          Kanban Board
        </div>

        <div className='relative z-20 mt-auto'>
          <div className='mb-8 space-y-4'>
            <h2 className='text-3xl font-bold tracking-tight mt-4'>
              Organize your workflow with clarity.
            </h2>
            <p className='text-lg text-primary-foreground/80'>
              Streamline your project management and boost team productivity with
              our intuitive Kanban board system.
            </p>
          </div>

          <div className='grid gap-6'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15'>
                <Layout className='size-5' />
              </div>
              <div>
                <p className='font-semibold'>Interactive Kanban</p>
                <p className='text-sm text-primary-foreground/70'>
                  Organize tasks with native drag-and-drop functionality.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15'>
                <CheckCircle2 className='size-5' />
              </div>
              <div>
                <p className='font-semibold'>Task Management</p>
                <p className='text-sm text-primary-foreground/70'>
                  Create, edit, and track tasks throughout their lifecycle.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15'>
                <Search className='size-5' />
              </div>
              <div>
                <p className='font-semibold'>Global Search</p>
                <p className='text-sm text-primary-foreground/70'>
                  Locate any task instantly using the global command menu.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15'>
                <Moon className='size-5' />
              </div>
              <div>
                <p className='font-semibold'>Dark Mode Support</p>
                <p className='text-sm text-primary-foreground/70'>
                  Switch between themes for a comfortable viewing experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col items-center p-4 lg:h-svh lg:p-8 lg:overflow-y-auto'>
        <div className='mx-auto my-auto flex w-full flex-col space-y-2 sm:w-[400px]'>
          {children}
        </div>
      </div>
    </div>
  )
}
