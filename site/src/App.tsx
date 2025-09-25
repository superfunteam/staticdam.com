import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { FilterProvider } from '@/components/app-sidebar'
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
            <Route path="folder/:folderName" element={<LibraryPage />} />
            <Route path="category/:categoryName" element={<LibraryPage />} />
            <Route path="person/:personName" element={<LibraryPage />} />
            <Route path="tag/:tagName" element={<LibraryPage />} />
            <Route path="product/:productName" element={<LibraryPage />} />
            <Route path="asset/:encodedPath" element={<LibraryPage />} />
          </Route>
        </Routes>
        <Toaster />
      </FilterProvider>
    </DarkModeProvider>
  )
}

export default App