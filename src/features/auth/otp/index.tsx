import { Link } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

export function Otp() {
  return (
    <AuthLayout>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Two-factor Authentication
        </h1>
        <p className='text-sm text-muted-foreground text-balance'>
          Please enter the authentication code. <br /> We have sent the
          authentication code to your email.
        </p>
      </div>
      <OtpForm />
      <p className='mt-4 text-center text-sm text-muted-foreground'>
        Haven't received it?{' '}
        <Link
          to='/sign-in'
          className='font-medium text-primary underline-offset-4 hover:underline'
        >
          Resend a new code.
        </Link>
      </p>
    </AuthLayout>
  )
}
