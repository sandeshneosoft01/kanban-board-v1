import { Link } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <AuthLayout>
      <div className='sticky top-0 z-20 -mx-4 bg-background/80 backdrop-blur-md px-4 py-3'>
        <div className='flex flex-col space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Create an account
          </h1>
          <p className='text-sm text-muted-foreground text-balance'>
            Let&apos;s get you started.
          </p>
        </div>
      </div>
      <SignUpForm />
      <div className='px-4 py-8 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          to='/sign-in'
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Sign In
        </Link>
      </div>
    </AuthLayout>
  )
}
