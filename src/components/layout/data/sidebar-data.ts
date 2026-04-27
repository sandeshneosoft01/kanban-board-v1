import {
  LayoutDashboard,
  ListTodo,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      items: [
        {
          title: 'Home',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Task Management',
          url: '/task-management',
          icon: ListTodo,
        },
      ],
    },
  ],
}
