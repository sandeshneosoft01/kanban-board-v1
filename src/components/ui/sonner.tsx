import { Toaster as Sonner, ToasterProps } from 'sonner'
import { X } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      closeButton
      icons={{
        close: <X className='h-4 w-4' />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
          closeButton:
            'group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border transition-opacity group-hover:opacity-100 opacity-0',
        },
      }}
      {...props}
    />
  )
}
