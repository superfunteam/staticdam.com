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
  const { setSelectedFilter, images } = useFilter()

  // Generate ALL unique searchable terms
  const allSearchTerms = React.useMemo((): SearchTerm[] => {
    const termsMap = new Map<string, SearchTerm>()

    images.forEach((image: ImageMetadata) => {
      // Categories
      image.category?.forEach(cat => {
        const key = `category:${cat}`
        termsMap.set(key, {
          value: key,
          label: `Category: ${cat}`,
          type: 'category'
        })
      })

      // People
      image.person?.forEach(person => {
        const key = `person:${person}`
        termsMap.set(key, {
          value: key,
          label: `Person: ${person}`,
          type: 'person'
        })
      })

      // Tags
      image.tags?.forEach(tag => {
        const key = `tag:${tag}`
        termsMap.set(key, {
          value: key,
          label: `Tag: ${tag}`,
          type: 'tag'
        })
      })

      // Products
      image.product?.forEach(product => {
        const key = `product:${product}`
        termsMap.set(key, {
          value: key,
          label: `Product: ${product}`,
          type: 'product'
        })
      })
    })

    return Array.from(termsMap.values())
  }, [images])

  // Get popular terms organized by type (top 2 of each)
  const popularByType = React.useMemo(() => {
    // Count occurrences
    const counts = new Map<string, number>()
    images.forEach((image: ImageMetadata) => {
      image.category?.forEach(cat => {
        const key = `category:${cat}`
        counts.set(key, (counts.get(key) || 0) + 1)
      })
      image.person?.forEach(person => {
        const key = `person:${person}`
        counts.set(key, (counts.get(key) || 0) + 1)
      })
      image.tags?.forEach(tag => {
        const key = `tag:${tag}`
        counts.set(key, (counts.get(key) || 0) + 1)
      })
      image.product?.forEach(product => {
        const key = `product:${product}`
        counts.set(key, (counts.get(key) || 0) + 1)
      })
    })

    // Group by type
    const byType: Record<SearchTerm['type'], SearchTerm[]> = {
      category: [],
      person: [],
      tag: [],
      product: []
    }

    allSearchTerms.forEach(term => {
      const count = counts.get(term.value) || 0
      byType[term.type].push(term)
    })

    // Sort each type by count and take top 2
    Object.keys(byType).forEach(type => {
      byType[type as SearchTerm['type']].sort((a, b) => {
        const countA = counts.get(a.value) || 0
        const countB = counts.get(b.value) || 0
        return countB - countA
      })
      byType[type as SearchTerm['type']] = byType[type as SearchTerm['type']].slice(0, 2)
    })

    return byType
  }, [images, allSearchTerms])

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

            {/* Show popular terms by type */}
            {popularByType.category.length > 0 && (
              <CommandGroup heading="Popular Categories">
                {popularByType.category.map((term) => (
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
            )}

            {popularByType.person.length > 0 && (
              <CommandGroup heading="Popular People">
                {popularByType.person.map((term) => (
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
            )}

            {popularByType.tag.length > 0 && (
              <CommandGroup heading="Popular Tags">
                {popularByType.tag.map((term) => (
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
            )}

            {popularByType.product.length > 0 && (
              <CommandGroup heading="Popular Products">
                {popularByType.product.map((term) => (
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
            )}

            {/* Hidden group with ALL terms for search - this enables searching through everything */}
            <CommandGroup className="hidden">
              {allSearchTerms.map((term) => (
                <CommandItem
                  key={`all-${term.value}`}
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