import { useState } from 'react'
import { PlusIcon } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'

import { CreateEditTaskDialog } from './components/create-edit-task-dialog'
import { KanbanBoard } from './components/kanban-board'
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
            <Main fluid>
                <div className='flex items-center justify-between mb-4'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>Task Board</h1>
                        <p className='text-sm text-muted-foreground'>
                            Drag and drop tasks between stages to update their progress.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusIcon className="h-4 w-4" />
                        Create Task
                    </Button>
                </div>

                <KanbanBoard />

                <CreateEditTaskDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                />
            </Main>
        </>
    )
}