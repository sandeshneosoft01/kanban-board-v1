import { Link } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  return (
    <AuthLayout>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Create an account
        </h1>
        <p className='text-sm text-muted-foreground'>
          Enter your email and password to create an account.
        </p>
      </div>
      <SignUpForm />
      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <Link
          to='/sign-in'
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}
