import { Outlet } from 'react-router-dom'
import { DamSidebar, useFilter } from '@/components/dam-sidebar'
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

function DynamicBreadcrumb() {
  const { selectedFilter, filteredImages, setSelectedFilter } = useFilter()

  if (!selectedFilter) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Library ({filteredImages.length})</BreadcrumbPage>
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
  } else if (selectedFilter.startsWith('subject:')) {
    filterType = 'Subject'
    filterValue = selectedFilter.replace('subject:', '')
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
          <BreadcrumbPage>{filterValue} ({count})</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function Layout() {
  return (
    <SidebarProvider>
      <DamSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}