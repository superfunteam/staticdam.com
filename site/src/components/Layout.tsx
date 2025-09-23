import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-background">
        <nav className="flex h-full flex-col p-4">
          <h1 className="mb-8 text-xl font-bold">Static DAM</h1>
          <div className="text-sm text-muted-foreground">
            Select images to edit metadata
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}