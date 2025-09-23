import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/Layout'
import LibraryPage from '@/pages/LibraryPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LibraryPage />} />
          <Route path="library" element={<LibraryPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App