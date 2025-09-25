import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL routing utilities for filters
export function encodeFilterValue(value: string): string {
  return encodeURIComponent(value)
}

export function decodeFilterValue(value: string): string {
  return decodeURIComponent(value)
}

export function filterToUrl(filter: string): string {
  if (!filter) return '/'

  const [type, value] = filter.split(':')
  if (!type || !value) return '/'

  return `/${type}/${encodeFilterValue(value)}`
}

export function urlToFilter(pathname: string): string | null {
  // Remove leading slash and split path
  const pathParts = pathname.replace(/^\//, '').split('/')

  // Handle root paths
  if (pathParts.length === 1 && (pathParts[0] === '' || pathParts[0] === 'library')) {
    return null
  }

  // Handle filter paths: /folder/name, /category/name, etc.
  if (pathParts.length === 2) {
    const [type, encodedValue] = pathParts
    const validTypes = ['folder', 'category', 'person', 'tag', 'product']

    if (validTypes.includes(type) && encodedValue) {
      return `${type}:${decodeFilterValue(encodedValue)}`
    }
  }

  return null
}