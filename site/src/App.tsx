import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/Layout'
import LibraryPage from '@/pages/LibraryPage'
import AdminPage from '@/pages/AdminPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LibraryPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App