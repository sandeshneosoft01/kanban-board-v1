import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='relative hidden flex-col bg-muted p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-primary' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Logo className='mr-2 size-8 text-white' />
          Kanban Board
        </div>
        <div className='relative z-20 my-auto'>
          <h2 className='mb-4 text-4xl font-semibold leading-tight'>
            Streamline your workflow with visual project management.
          </h2>
          <p className='text-lg text-primary-foreground/90'>
            Log in to manage your tasks, track progress, and collaborate with
            your team in real-time.
          </p>
        </div>
        <div className='relative z-20 mt-auto flex justify-between text-sm text-primary-foreground/80'>
          <span>Copyright © 2025 Kanban Board LTD.</span>
          <a href='#' className='hover:underline'>
            Privacy Policy
          </a>
        </div>
      </div>
      <div className='flex flex-col items-center justify-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[400px]'>
          {children}
        </div>
      </div>
    </div>
  )
}
