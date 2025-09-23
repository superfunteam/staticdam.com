import * as React from "react"
import { Folder, Tag, Image, Hash } from "lucide-react"
import { useQuery } from '@tanstack/react-query'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { ImageMetadata } from "@/types"

// Create a context for filter state
const FilterContext = React.createContext<{
  selectedFilter: string | null
  setSelectedFilter: (filter: string | null) => void
  filteredImages: ImageMetadata[]
}>({
  selectedFilter: null,
  setSelectedFilter: () => {},
  filteredImages: []
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
      return images.filter(img => img.category === category)
    }

    if (selectedFilter.startsWith('tag:')) {
      const tag = selectedFilter.replace('tag:', '')
      return images.filter(img => img.tags?.includes(tag))
    }

    return images
  }, [images, selectedFilter])

  return (
    <FilterContext.Provider value={{ selectedFilter, setSelectedFilter, filteredImages }}>
      {children}
    </FilterContext.Provider>
  )
}

export function DamSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { selectedFilter, setSelectedFilter } = useFilter()

  const { data: images = [] } = useQuery<ImageMetadata[]>({
    queryKey: ['manifest'],
    queryFn: async () => {
      const res = await fetch('/data/manifest.json')
      if (!res.ok) throw new Error('Failed to load manifest')
      return res.json()
    },
  })
  // Extract unique folders from image paths
  const folders = React.useMemo(() => {
    const folderSet = new Set<string>()
    images.forEach(image => {
      const parts = image.path.split('/')
      if (parts.length > 2) { // assets/folder/file.jpg
        const folder = parts[1]
        folderSet.add(folder)
      }
    })
    return Array.from(folderSet).sort()
  }, [images])

  // Extract unique tags from image metadata
  const tags = React.useMemo(() => {
    const tagSet = new Set<string>()
    images.forEach(image => {
      if (image.tags) {
        image.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [images])

  // Extract unique categories
  const categories = React.useMemo(() => {
    const categorySet = new Set<string>()
    images.forEach(image => {
      if (image.category) {
        categorySet.add(image.category)
      }
    })
    return Array.from(categorySet).sort()
  }, [images])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          <span className="font-semibold">Static DAM</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* All Images */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSelectedFilter(null)}
                  isActive={selectedFilter === null}
                  className="w-full"
                >
                  <Image className="h-4 w-4" />
                  <span>All Images ({images.length})</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Folders */}
        {folders.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Folders</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {folders.map((folder) => {
                  const count = images.filter(img => img.path.includes(`/${folder}/`)).length
                  return (
                    <SidebarMenuItem key={folder}>
                      <SidebarMenuButton
                        onClick={() => setSelectedFilter(`folder:${folder}`)}
                        isActive={selectedFilter === `folder:${folder}`}
                        className="w-full"
                      >
                        <Folder className="h-4 w-4" />
                        <span>{folder} ({count})</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Categories</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {categories.map((category) => {
                  const count = images.filter(img => img.category === category).length
                  return (
                    <SidebarMenuItem key={category}>
                      <SidebarMenuButton
                        onClick={() => setSelectedFilter(`category:${category}`)}
                        isActive={selectedFilter === `category:${category}`}
                        className="w-full"
                      >
                        <Hash className="h-4 w-4" />
                        <span>{category} ({count})</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Tags</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tags.map((tag) => {
                  const count = images.filter(img => img.tags?.includes(tag)).length
                  return (
                    <SidebarMenuItem key={tag}>
                      <SidebarMenuButton
                        onClick={() => setSelectedFilter(`tag:${tag}`)}
                        isActive={selectedFilter === `tag:${tag}`}
                        className="w-full"
                      >
                        <Tag className="h-4 w-4" />
                        <span>{tag} ({count})</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}