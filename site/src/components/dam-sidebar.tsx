import * as React from "react"
import { Folder, Tag, Image, Hash } from "lucide-react"

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

interface DamSidebarProps {
  images: ImageMetadata[]
  selectedFilter: string | null
  onFilterChange: (filter: string | null) => void
}

export function DamSidebar({ images, selectedFilter, onFilterChange, ...props }: DamSidebarProps & React.ComponentProps<typeof Sidebar>) {
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
                  onClick={() => onFilterChange(null)}
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
                        onClick={() => onFilterChange(`folder:${folder}`)}
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
                        onClick={() => onFilterChange(`category:${category}`)}
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
                        onClick={() => onFilterChange(`tag:${tag}`)}
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