import { SearchIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-provider'
import { Button } from './ui/button'

export function Search({
  className = '',
  placeholder = 'Search',
  ...props
}: React.ComponentProps<'button'> & { placeholder?: string }) {
  const { setOpen, searchQuery, setSearchQuery } = useSearch()
  return (
    <div className='relative flex items-center flex-1 sm:flex-none'>
      <Button
        {...props}
        variant='outline'
        className={cn(
          'group relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-accent sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64',
          className
        )}
        aria-keyshortcuts='Meta+K Control+K'
        onClick={() => setOpen(true)}
      >
        <SearchIcon
          aria-hidden='true'
          className='absolute inset-s-1.5 top-1/2 -translate-y-1/2'
          size={16}
        />
        <span className='ms-4 truncate'>
          {searchQuery || placeholder}
        </span>
        {!searchQuery && (
          <kbd className='pointer-events-none absolute inset-e-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 select-none group-hover:bg-accent sm:flex'>
            <span className='text-xs'>⌘</span>K
          </kbd>
        )}
      </Button>
      {searchQuery && (
        <Button
          variant='ghost'
          size='icon'
          className='absolute right-1 h-6 w-6 rounded-sm hover:bg-muted'
          onClick={(e) => {
            e.stopPropagation()
            setSearchQuery('')
          }}
        >
          <X className='h-3 w-3' />
          <span className='sr-only'>Clear search</span>
        </Button>
      )}
    </div>
  )
}
