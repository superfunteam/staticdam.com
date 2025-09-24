"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useFilter } from "@/components/dam-sidebar"
import type { ImageMetadata } from "@/types"

interface SearchTerm {
  value: string
  label: string
  type: 'category' | 'person' | 'tag' | 'product'
}

export function SearchCombobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const { setSelectedFilter, filteredImages } = useFilter()

  // Generate popular terms from the current images data
  const popularTerms = React.useMemo((): SearchTerm[] => {
    const termCounts: Record<string, { count: number; type: SearchTerm['type'] }> = {}

    // Count all metadata terms across all images
    filteredImages.forEach((image: ImageMetadata) => {
      // Categories
      image.category?.forEach(cat => {
        const key = `category:${cat}`
        termCounts[key] = { count: (termCounts[key]?.count || 0) + 1, type: 'category' }
      })

      // People
      image.person?.forEach(person => {
        const key = `person:${person}`
        termCounts[key] = { count: (termCounts[key]?.count || 0) + 1, type: 'person' }
      })

      // Tags
      image.tags?.forEach(tag => {
        const key = `tag:${tag}`
        termCounts[key] = { count: (termCounts[key]?.count || 0) + 1, type: 'tag' }
      })

      // Products
      image.product?.forEach(product => {
        const key = `product:${product}`
        termCounts[key] = { count: (termCounts[key]?.count || 0) + 1, type: 'product' }
      })
    })

    // Sort by count and take top 6
    const sortedTerms = Object.entries(termCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 6)
      .map(([key, { type }]) => {
        const [prefix, ...valueParts] = key.split(':')
        const rawValue = valueParts.join(':')
        return {
          value: key,
          label: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${rawValue}`,
          type
        }
      })

    return sortedTerms
  }, [filteredImages])

  const handleSelect = (currentValue: string) => {
    if (currentValue) {
      setSelectedFilter(currentValue)
      setValue("")
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-10 h-10 p-0 bg-white dark:bg-black border-gray-200 dark:border-gray-800"
        >
          <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Popular">
              {popularTerms.map((term) => (
                <CommandItem
                  key={term.value}
                  value={term.value}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  {term.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}