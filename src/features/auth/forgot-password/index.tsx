import { Link } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <AuthLayout>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Forgot Password
        </h1>
        <p className='text-sm text-muted-foreground text-balance'>
          Enter your registered email and we will send you a link to reset your
          password.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Don't have an account?{' '}
        <Link
          to='/sign-up'
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
