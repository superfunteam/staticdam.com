"use client"

import * as React from "react"
import { Folder, Tag, Image, Hash, User, Package, Moon, Sun } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import { useDarkMode } from "@/contexts/dark-mode-context"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { ImageMetadata } from "@/types"

// Create a context for filter state
const FilterContext = React.createContext<{
  selectedFilter: string | null
  setSelectedFilter: (filter: string | null) => void
  filteredImages: ImageMetadata[]
  images: ImageMetadata[]
}>({
  selectedFilter: null,
  setSelectedFilter: () => {},
  filteredImages: [],
  images: []
})

export const useFilter = () => React.useContext(FilterContext)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedFilter, setSelectedFilter] = React.useState<string | null>(null)

  const { data: images = [] } = useQuery<ImageMetadata[]>({
    queryKey: ['manifest'],
    queryFn: async () => {
      const res = await fetch('/data/manifest.json')
      if (!res.ok) throw new Error('Failed to load manifest')
      return res.json()
    },
  })

  // Filter images based on selected filter
  const filteredImages = React.useMemo(() => {
    if (!selectedFilter) return images

    if (selectedFilter.startsWith('folder:')) {
      const folder = selectedFilter.replace('folder:', '')
      return images.filter(img => img.path.includes(`/${folder}/`))
    }

    if (selectedFilter.startsWith('category:')) {
      const category = selectedFilter.replace('category:', '')
      return images.filter(img => img.category?.includes(category))
    }

    if (selectedFilter.startsWith('person:')) {
      const person = selectedFilter.replace('person:', '')
      return images.filter(img => img.person?.includes(person))
    }

    if (selectedFilter.startsWith('tag:')) {
      const tag = selectedFilter.replace('tag:', '')
      return images.filter(img => img.tags?.includes(tag))
    }

    if (selectedFilter.startsWith('product:')) {
      const product = selectedFilter.replace('product:', '')
      return images.filter(img => img.product?.includes(product))
    }

    return images
  }, [images, selectedFilter])

  const contextValue = React.useMemo(() => ({
    selectedFilter,
    setSelectedFilter,
    filteredImages,
    images
  }), [selectedFilter, setSelectedFilter, filteredImages, images])

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { selectedFilter, setSelectedFilter } = useFilter()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const { data: images = [] } = useQuery<ImageMetadata[]>({
    queryKey: ['manifest'],
    queryFn: async () => {
      const res = await fetch('/data/manifest.json')
      if (!res.ok) throw new Error('Failed to load manifest')
      return res.json()
    },
  })

  // Generate metadata from images
  const metadata = React.useMemo(() => {
    const folders = new Set<string>()
    const categories = new Set<string>()
    const people = new Set<string>()
    const tags = new Set<string>()
    const products = new Set<string>()

    const folderCounts = new Map<string, number>()
    const categoryCounts = new Map<string, number>()
    const personCounts = new Map<string, number>()
    const tagCounts = new Map<string, number>()
    const productCounts = new Map<string, number>()

    images.forEach(image => {
      // Extract folder from path
      const pathParts = image.path.split('/')
      if (pathParts.length > 2) {
        const folder = pathParts[1] // assets/folder/file.jpg -> folder
        folders.add(folder)
        folderCounts.set(folder, (folderCounts.get(folder) || 0) + 1)
      }

      // Process categories
      image.category?.forEach(cat => {
        categories.add(cat)
        categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
      })

      // Process people
      image.person?.forEach(person => {
        people.add(person)
        personCounts.set(person, (personCounts.get(person) || 0) + 1)
      })

      // Process tags
      image.tags?.forEach(tag => {
        tags.add(tag)
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })

      // Process products
      image.product?.forEach(product => {
        products.add(product)
        productCounts.set(product, (productCounts.get(product) || 0) + 1)
      })
    })

    return {
      folders: Array.from(folders).sort(),
      categories: Array.from(categories).sort(),
      people: Array.from(people).sort(),
      tags: Array.from(tags).sort(),
      products: Array.from(products).sort(),
      folderCounts,
      categoryCounts,
      personCounts,
      productCounts,
      tagCounts
    }
  }, [images])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center cursor-default">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2_3032)">
                      <path d="M12.7681 12.7694C14.0842 11.4534 13.0157 8.25115 10.3816 5.61706C7.74756 2.98297 4.54533 1.91451 3.22926 3.23058C1.9132 4.54664 2.98166 7.74887 5.61575 10.383C8.24983 13.017 11.4521 14.0855 12.7681 12.7694Z" stroke="currentColor" strokeWidth="1.25" strokeMiterlimit="10"/>
                      <path d="M10.3816 10.3829C13.0157 7.74885 14.0842 4.54662 12.7681 3.23055C11.4521 1.91449 8.24983 2.98295 5.61575 5.61704C2.98166 8.25113 1.9132 11.4534 3.22926 12.7694C4.54533 14.0855 7.74756 13.017 10.3816 10.3829Z" stroke="currentColor" strokeWidth="1.25" strokeMiterlimit="10"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_2_3032">
                        <rect width="16" height="16" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">StaticDAM</span>
                  <span className="truncate text-xs">Digital Assets</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* All Images */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSelectedFilter(null)}
                isActive={selectedFilter === null}
              >
                <Image className="h-4 w-4" />
                <span className="flex-1">All Images</span>
                <span className="ml-auto bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                  {images.length}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Folders */}
        {metadata.folders.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Folders</SidebarGroupLabel>
            <SidebarMenu>
              {metadata.folders.map((folder) => {
                const count = metadata.folderCounts.get(folder) || 0
                return (
                  <SidebarMenuItem key={folder}>
                    <SidebarMenuButton
                      onClick={() => setSelectedFilter(`folder:${folder}`)}
                      isActive={selectedFilter === `folder:${folder}`}
                    >
                      <Folder className="h-4 w-4" />
                      <span className="flex-1">{folder}</span>
                      <span className="ml-auto bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                        {count}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Metadata Groups */}
        <SidebarGroup>
          <SidebarGroupLabel>Metadata</SidebarGroupLabel>
          <SidebarMenu>
            {/* Categories Section */}
            {metadata.categories.length > 0 && (
              <Collapsible key="categories" asChild defaultOpen={false}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Categories">
                      <Hash className="h-4 w-4" />
                      <span className="flex-1">Categories</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                        {metadata.categories.length}
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {metadata.categories.map((category) => {
                        const count = metadata.categoryCounts.get(category) || 0
                        return (
                          <SidebarMenuSubItem key={category}>
                            <SidebarMenuSubButton
                              onClick={() => setSelectedFilter(`category:${category}`)}
                              isActive={selectedFilter === `category:${category}`}
                            >
                              <span className="flex-1">{category}</span>
                              <span className="ml-auto bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                                {count}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}

            {/* People Section */}
            {metadata.people.length > 0 && (
              <Collapsible key="people" asChild defaultOpen={false}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="People">
                      <User className="h-4 w-4" />
                      <span className="flex-1">People</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                        {metadata.people.length}
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {metadata.people.map((person) => {
                        const count = metadata.personCounts.get(person) || 0
                        return (
                          <SidebarMenuSubItem key={person}>
                            <SidebarMenuSubButton
                              onClick={() => setSelectedFilter(`person:${person}`)}
                              isActive={selectedFilter === `person:${person}`}
                            >
                              <span className="flex-1">{person}</span>
                              <span className="ml-auto bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                                {count}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}

            {/* Tags Section */}
            {metadata.tags.length > 0 && (
              <Collapsible key="tags" asChild defaultOpen={false}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Tags">
                      <Tag className="h-4 w-4" />
                      <span className="flex-1">Tags</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                        {metadata.tags.length}
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {metadata.tags.map((tag) => {
                        const count = metadata.tagCounts.get(tag) || 0
                        return (
                          <SidebarMenuSubItem key={tag}>
                            <SidebarMenuSubButton
                              onClick={() => setSelectedFilter(`tag:${tag}`)}
                              isActive={selectedFilter === `tag:${tag}`}
                            >
                              <span className="flex-1">{tag}</span>
                              <span className="ml-auto bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                                {count}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}

            {/* Products Section */}
            {metadata.products.length > 0 && (
              <Collapsible key="products" asChild defaultOpen={false}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Products">
                      <Package className="h-4 w-4" />
                      <span className="flex-1">Products</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                        {metadata.products.length}
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {metadata.products.map((product) => {
                        const count = metadata.productCounts.get(product) || 0
                        return (
                          <SidebarMenuSubItem key={product}>
                            <SidebarMenuSubButton
                              onClick={() => setSelectedFilter(`product:${product}`)}
                              isActive={selectedFilter === `product:${product}`}
                            >
                              <span className="flex-1">{product}</span>
                              <span className="ml-auto bg-muted px-1.5 py-0.5 rounded-md text-xs text-muted-foreground">
                                {count}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}