import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { FilterProvider } from '@/components/dam-sidebar'
import { DarkModeProvider } from '@/contexts/dark-mode-context'
import Layout from '@/components/Layout'
import LibraryPage from '@/pages/LibraryPage'

function App() {
  return (
    <DarkModeProvider>
      <FilterProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LibraryPage />} />
            <Route path="library" element={<LibraryPage />} />
          </Route>
        </Routes>
        <Toaster />
      </FilterProvider>
    </DarkModeProvider>
  )
}

export default App