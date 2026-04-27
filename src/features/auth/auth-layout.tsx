import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh lg:h-svh lg:grid-cols-2 lg:overflow-hidden'>
      <div className='relative hidden flex-col bg-muted p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-primary' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Logo className='mr-2 size-8 text-white' />
          Kanban Board
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
