import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export function TaskManagement() {
    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <div className='flex items-center justify-between w-full'>
                    <Search />
                    <div className='flex items-center gap-4'>
                        <ThemeSwitch />
                        <ProfileDropdown />
                    </div>
                </div>
            </Header>

            {/* ===== Main ===== */}
            <Main>
                <div className='flex items-end justify-end mb-4'>
                    <Link to="/task-management" className="">
                        <Button>
                            <PlusIcon className="h-4 w-4" />
                            Create Task
                        </Button>
                    </Link>
                </div>
            </Main>
        </>
    )
}