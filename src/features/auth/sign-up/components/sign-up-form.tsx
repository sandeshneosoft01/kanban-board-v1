import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollToError } from '@/hooks/use-scroll-to-error'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Separator } from '@/components/ui/separator'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const formSchema = z
  .object({
    name: z.string().min(1, 'Please enter your name.'),
    username: z.string().min(1, 'Please enter a username.'),
    email: z.email({
      error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
    }),
    contactNumber: z.string().optional(),
    password: z
      .string()
      .min(1, 'Please enter your password.')
      .min(7, 'Password must be at least 7 characters long.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    profileImage: z
      .any()
      .optional()
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Only .jpg, .jpeg and .png formats are supported.'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const navigate = useNavigate()
  const { auth: authStore } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      contactNumber: '',
      password: '',
      confirmPassword: '',
      profileImage: undefined,
    },
  })

  const username = form.watch('username')

  useEffect(() => {
    if (!username) {
      if (form.formState.errors.username?.type === 'manual') {
        form.clearErrors('username')
      }
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/users?username=${username}`
        )
        if (res.data.length > 0) {
          form.setError('username', {
            type: 'manual',
            message: 'Username already taken.',
          })
        } else {
          if (form.formState.errors.username?.type === 'manual') {
            form.clearErrors('username')
          }
        }
      } catch (error) {
        console.error('Error checking username', error)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username, form])

  useScrollToError(form.formState.errors)

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    toast.promise(
      Promise.all([
        api.get(`/users?email=${data.email}`),
        api.get(`/users?username=${data.username}`)
      ]).then(([emailRes, usernameRes]) => {
        if (emailRes.data.length > 0) {
          form.setError('email', {
            type: 'manual',
            message: 'Email already in use.',
          })
          setTimeout(() => form.setFocus('email'), 0)
          throw new Error('Email already in use.')
        }
        if (usernameRes.data.length > 0) {
          form.setError('username', {
            type: 'manual',
            message: 'Username already taken.',
          })
          setTimeout(() => form.setFocus('username'), 0)
          throw new Error('Username already taken.')
        }

        // Remove confirmPassword before saving
        const { confirmPassword, profileImage, ...userData } = data

        const newUser = {
          id: crypto.randomUUID(),
          profileImage: preview || null,
          ...userData,
          password: btoa(userData.password),
        }
        return api.post('/users', newUser)
      }),
      {
        loading: 'Creating account...',
        success: (res) => {
          setIsLoading(false)
          const user = res.data

          const mockUser = {
            accountNo: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage,
            role: ['user'],
            exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
          }

          authStore.setUser(mockUser)
          const mockToken = btoa(
            JSON.stringify({ id: user.id, email: user.email, exp: mockUser.exp })
          )
          authStore.setAccessToken(mockToken)

          // Navigate to home page
          navigate({ to: '/' })

          return `Account created for ${data.email}.`
        },
        error: (err) => {
          setIsLoading(false)
          return err.message || 'Error creating account.'
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder='johndoe123' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name='contactNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder='+1 234 567 890' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
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
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='profileImage'
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Profile Image (Optional)</FormLabel>
              <FormControl>
                <div className='flex items-center space-x-4'>
                  <div className='relative'>
                    <Avatar className='size-12 border'>
                      <AvatarImage src={preview || ''} />
                      <AvatarFallback>
                        <User className='size-6 text-muted-foreground' />
                      </AvatarFallback>
                    </Avatar>
                    {preview && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        onClick={() => {
                          setPreview(null)
                          form.setValue('profileImage', undefined)
                        }}
                      >
                        <X className='size-3' />
                      </Button>
                    )}
                  </div>
                  <Input
                    type='file'
                    accept='.jpg,.jpeg,.png'
                    className='cursor-pointer'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        onChange(file)
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setPreview(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    {...fieldProps}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='animate-spin' />
          ) : (
            <UserPlus className='mr-2 size-4' />
          )}
          Create Account
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or sign up with
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
