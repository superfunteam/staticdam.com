import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { FilterProvider } from '@/components/dam-sidebar'
import Layout from '@/components/Layout'
import LibraryPage from '@/pages/LibraryPage'

function App() {
  return (
    <FilterProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LibraryPage />} />
          <Route path="library" element={<LibraryPage />} />
        </Route>
      </Routes>
      <Toaster />
    </FilterProvider>
  )
}

export default App