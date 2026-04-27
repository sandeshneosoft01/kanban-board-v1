import { type SVGProps } from 'react'
import { cn } from '@/lib/utils'
import { SquareKanban } from 'lucide-react'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <SquareKanban className={cn('size-6', className)} {...props} />
  )
}
