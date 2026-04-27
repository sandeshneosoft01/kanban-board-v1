import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { useScrollToError } from '@/hooks/use-scroll-to-error'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(7, 'Password must be at least 7 characters long.'),
  rememberMe: z.boolean().default(false).optional(),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuthStore()
  const recaptchaWrapperRef = useRef<HTMLDivElement>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    if (recaptchaWrapperRef.current && !recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaWrapperRef.current, {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired.
        },
      })
      recaptchaVerifierRef.current.render()
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
        recaptchaVerifierRef.current = null
      }
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  useScrollToError(form.formState.errors)

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    toast.promise(
      api.get(`/users?email=${data.email}&password=${btoa(data.password)}`).then(async (res) => {
        if (res.data.length === 0) {
          form.setError('email', {
            type: 'manual',
            message: 'Invalid email or password.',
          })
          form.setError('password', {
            type: 'manual',
            message: 'Invalid email or password.',
          })
          setTimeout(() => form.setFocus('email'), 0)
          throw new Error('Invalid email or password.')
        }
        return res.data[0]
      }),
      {
        loading: 'Signing in...',
        success: (user) => {
          setIsLoading(false)

          // Mock successful authentication with expiry computed at success time
          const mockUser = {
            accountNo: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage,
            exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
          }

          // Set user and access token
          setUser(mockUser, data.rememberMe)
          // Generate a mock JWT-like token (Base64 encoded string)
          const mockToken = btoa(JSON.stringify({ id: user.id, email: user.email, exp: mockUser.exp }))
          setAccessToken(mockToken, data.rememberMe)

          // Redirect to the stored location or default to dashboard
          const targetPath = redirectTo || '/'
          navigate({ to: targetPath, replace: true })

          return `Welcome back, ${user.email}!`
        },
        error: (err) => {
          setIsLoading(false)
          return err.message || 'Error signing in.'
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='rememberMe'
          render={({ field }) => (
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <FormControl>
                  <Checkbox
                    id='rememberMe'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <label
                  htmlFor='rememberMe'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Remember Me
                </label>
              </div>
              {/* <Link
                to='/forgot-password'
                className='text-sm font-medium text-primary hover:underline'
              >
                Forgot Your Password?
              </Link> */}
            </div>
          )}
        />

        <div className='flex justify-center py-2'>
          <div id='recaptcha-container' ref={recaptchaWrapperRef} />
        </div>

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='animate-spin' />
          ) : (
            <LogIn className='mr-2 size-4' />
          )}
          Log In
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or login with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <svg
              className='mr-2 size-4 text-red-500'
              aria-hidden='true'
              focusable='false'
              data-prefix='fab'
              data-icon='google'
              role='img'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 488 512'
            >
              <path
                fill='currentColor'
                d='M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z'
              ></path>
            </svg>
            Google
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <svg
              className='mr-2 size-4'
              aria-hidden='true'
              focusable='false'
              data-prefix='fab'
              data-icon='apple'
              role='img'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 384 512'
            >
              <path
                fill='currentColor'
                d='M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-79-115.8-77.7-124zm-64-187.4c20.9-25.9 3.5-61 3.2-61.9-31.4 1.2-46.8 24.3-46.8 24.3-21.3 23.4-3.5 61.2-3.2 61.9 31.4-1.2 46.8-24.3 46.8-24.3z'
              ></path>
            </svg>
            Apple
          </Button>
        </div>
      </form>
    </Form>
  )
}
