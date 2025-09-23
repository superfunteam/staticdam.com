import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-background">
        <nav className="flex h-full flex-col p-4">
          <h1 className="mb-8 text-xl font-bold">Static DAM</h1>
          <ul className="space-y-2">
            <li>
              <a href="/library" className="block px-3 py-2 rounded-md hover:bg-accent">
                Library
              </a>
            </li>
            <li>
              <a href="/admin" className="block px-3 py-2 rounded-md hover:bg-accent">
                Admin
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}