import { Link, useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <div className='sticky top-0 z-20 -mx-4 bg-background/80 backdrop-blur-md px-4 py-3'>
        <div className='flex flex-col space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>Welcome Back</h1>
          <p className='text-sm text-muted-foreground'>
            Enter your email and password to access your account.
          </p>
        </div>
      </div>
      <div className='py-3'>
        <UserAuthForm redirectTo={redirect} />
      </div>
      <div className='sticky bottom-0 z-20 -mx-4 bg-background/80 backdrop-blur-md px-4 py-8 text-center text-sm text-muted-foreground'>
        Don't Have An Account?{' '}
        <Link
          to='/sign-up'
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Register Now.
        </Link>
      </div>
    </AuthLayout>
  )
}
