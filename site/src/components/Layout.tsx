import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SidebarInset className="flex-1">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}