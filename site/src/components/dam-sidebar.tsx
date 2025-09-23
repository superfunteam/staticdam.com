import * as React from "react"
import { Folder, Tag, Image, Hash, ChevronRight, User } from "lucide-react"
import { useQuery } from '@tanstack/react-query'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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

    return images
  }, [images, selectedFilter])

  const contextValue = React.useMemo(() => ({
    selectedFilter,
    setSelectedFilter,
    filteredImages
  }), [selectedFilter, setSelectedFilter, filteredImages])

  return (
    <FilterContext.Provider value={contextValue}>
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
  // Combined metadata extraction for better performance
  const metadata = React.useMemo(() => {
    const folderSet = new Set<string>()
    const tagSet = new Set<string>()
    const categorySet = new Set<string>()
    const personSet = new Set<string>()
    const folderCounts = new Map<string, number>()
    const categoryCounts = new Map<string, number>()
    const personCounts = new Map<string, number>()
    const tagCounts = new Map<string, number>()

    images.forEach(image => {
      // Extract folder
      const parts = image.path.split('/')
      if (parts.length > 2) {
        const folder = parts[1]
        folderSet.add(folder)
        folderCounts.set(folder, (folderCounts.get(folder) || 0) + 1)
      }

      // Extract categories
      if (image.category) {
        image.category.forEach(cat => {
          categorySet.add(cat)
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
        })
      }

      // Extract persons
      if (image.person) {
        image.person.forEach(person => {
          personSet.add(person)
          personCounts.set(person, (personCounts.get(person) || 0) + 1)
        })
      }

      // Extract tags
      if (image.tags) {
        image.tags.forEach(tag => {
          tagSet.add(tag)
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      }
    })

    return {
      folders: Array.from(folderSet).sort(),
      tags: Array.from(tagSet).sort(),
      categories: Array.from(categorySet).sort(),
      persons: Array.from(personSet).sort(),
      folderCounts,
      categoryCounts,
      personCounts,
      tagCounts
    }
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
        {metadata.folders.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Folders</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {metadata.folders.map((folder) => {
                  const count = metadata.folderCounts.get(folder) || 0
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

        {/* Metadata Groups */}
        <SidebarGroup>
          <SidebarGroupLabel>Metadata</SidebarGroupLabel>
          <SidebarMenu>
            {/* Categories Section */}
            {metadata.categories.length > 0 && (
              <Collapsible
                key="categories"
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Categories">
                      <Hash className="h-4 w-4" />
                      <span>Categories ({metadata.categories.length})</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                              <span>{category} ({count})</span>
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
            {metadata.persons.length > 0 && (
              <Collapsible
                key="persons"
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="People">
                      <User className="h-4 w-4" />
                      <span>People ({metadata.persons.length})</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {metadata.persons.map((person) => {
                        const count = metadata.personCounts.get(person) || 0
                        return (
                          <SidebarMenuSubItem key={person}>
                            <SidebarMenuSubButton
                              onClick={() => setSelectedFilter(`person:${person}`)}
                              isActive={selectedFilter === `person:${person}`}
                            >
                              <span>{person} ({count})</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}

            {/* Tags Section (Keywords) */}
            {metadata.tags.length > 0 && (
              <Collapsible
                key="tags"
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Tags">
                      <Tag className="h-4 w-4" />
                      <span>Tags ({metadata.tags.length})</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                              <span>{tag} ({count})</span>
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
      <SidebarRail />
    </Sidebar>
  )
}