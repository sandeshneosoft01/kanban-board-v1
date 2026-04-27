import { Link, useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>Welcome Back</h1>
        <p className='text-sm text-muted-foreground'>
          Enter your email and password to access your account.
        </p>
      </div>
      <UserAuthForm redirectTo={redirect} />
      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Don't Have An Account?{' '}
        <Link
          to='/sign-up'
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Register Now.
        </Link>
      </p>
    </AuthLayout>
  )
}
