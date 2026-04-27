import { useState } from 'react'
import { PlusIcon } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'

import { CreateTaskDialog } from './components/create-task-dialog'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function TaskManagement() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

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
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Create Task
                    </Button>
                </div>

                <CreateTaskDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                />
            </Main>
        </>
    )
}