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
          <span className="font-semibold">StaticDAM</span>
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