import { Outlet } from 'react-router-dom'
import { AppSidebar, useFilter } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { SearchCombobox } from '@/components/SearchCombobox'

function DynamicBreadcrumb() {
  const { selectedFilter, filteredImages, setSelectedFilter } = useFilter()

  if (!selectedFilter) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              Library
              <span className="bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                {filteredImages.length}
              </span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Parse filter type and value
  let filterType = 'Unknown'
  let filterValue = selectedFilter
  let count = filteredImages.length

  if (selectedFilter.startsWith('folder:')) {
    filterType = 'Folder'
    filterValue = selectedFilter.replace('folder:', '')
  } else if (selectedFilter.startsWith('category:')) {
    filterType = 'Category'
    filterValue = selectedFilter.replace('category:', '')
  } else if (selectedFilter.startsWith('person:')) {
    filterType = 'Person'
    filterValue = selectedFilter.replace('person:', '')
  } else if (selectedFilter.startsWith('product:')) {
    filterType = 'Product'
    filterValue = selectedFilter.replace('product:', '')
  } else if (selectedFilter.startsWith('tag:')) {
    filterType = 'Tag'
    filterValue = selectedFilter.replace('tag:', '')
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setSelectedFilter(null)
            }}
          >
            Library
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{filterType}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-2">
            {filterValue}
            <span className="bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
              {count}
            </span>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center justify-between gap-2 px-4 w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DynamicBreadcrumb />
            </div>
            <SearchCombobox />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-white dark:bg-black text-black dark:text-white">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}