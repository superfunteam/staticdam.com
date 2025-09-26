#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import * as glob from 'glob'
import { resolve, dirname } from 'path'

interface ExifData {
  [key: string]: any
}

interface ManifestEntry {
  path: string
  w: number
  h: number
  bytes: number
  dateTaken?: string
  camera?: {
    make?: string
    model?: string
  }
  category?: string[]
  tags?: string[]
  person?: string[]
  product?: string[]
  hierarchical?: string[]
  duration?: number
  isVideo?: boolean
}

async function extractMetadata(filePath: string): Promise<ManifestEntry | null> {
  try {
    const cmd = `exiftool -json -G1 -n "${filePath}"`
    const output = execSync(cmd, { encoding: 'utf-8' })
    const data: ExifData[] = JSON.parse(output)

    if (!data || !data[0]) return null

    const exif = data[0]

    // Check if this is a video file
    const isVideo = /\.(mp4|mov|webm|avi)$/i.test(filePath)

    const entry: ManifestEntry = {
      path: filePath.replace(/^\.\//, ''),
      w: exif['EXIF:ImageWidth'] || exif['File:ImageWidth'] || exif['PNG:ImageWidth'] || exif['EXIF:ExifImageWidth'] ||
         exif['QuickTime:ImageWidth'] || exif['QuickTime:SourceImageWidth'] || exif['Composite:ImageWidth'] || 0,
      h: exif['EXIF:ImageHeight'] || exif['File:ImageHeight'] || exif['PNG:ImageHeight'] || exif['EXIF:ExifImageHeight'] ||
         exif['QuickTime:ImageHeight'] || exif['QuickTime:SourceImageHeight'] || exif['Composite:ImageHeight'] || 0,
      bytes: exif['File:FileSize'] || exif['System:FileSize'] || 0,
    }

    // Add video-specific fields
    if (isVideo) {
      entry.isVideo = true
      // Duration in seconds
      const duration = exif['QuickTime:Duration'] || exif['Composite:Duration'] || exif['Matroska:Duration']
      if (duration) {
        entry.duration = typeof duration === 'string' ? parseFloat(duration) : duration
      }
    }

    if (exif['EXIF:DateTimeOriginal'] || exif['EXIF:CreateDate']) {
      const dateStr = exif['EXIF:DateTimeOriginal'] || exif['EXIF:CreateDate']
      if (dateStr && typeof dateStr === 'string') {
        const [date, time] = dateStr.split(' ')
        if (date && time) {
          const isoDate = date.replace(/:/g, '-') + 'T' + time + 'Z'
          entry.dateTaken = isoDate
        }
      }
    }

    if (exif['EXIF:Make'] || exif['EXIF:Model']) {
      entry.camera = {
        make: exif['EXIF:Make'],
        model: exif['EXIF:Model'],
      }
    }

    // Extract metadata from dedicated EXIF fields (no prefixes)

    // Categories from dedicated field
    if (exif['IPTC:SupplementalCategories']) {
      const categories = exif['IPTC:SupplementalCategories']
      if (typeof categories === 'string') {
        entry.category = categories.split(',').map(c => c.trim()).filter(Boolean)
      } else if (Array.isArray(categories)) {
        // Also split any comma-separated values within the array
        entry.category = categories.flatMap(c =>
          typeof c === 'string' ? c.split(',').map(s => s.trim()) : c
        ).filter(Boolean)
      }
    }

    // Tags from keywords field
    if (exif['IPTC:Keywords']) {
      const keywords = exif['IPTC:Keywords']
      if (typeof keywords === 'string') {
        entry.tags = keywords.split(',').map(k => k.trim()).filter(Boolean)
      } else if (Array.isArray(keywords)) {
        // Also split any comma-separated values within the array
        entry.tags = keywords.flatMap(k =>
          typeof k === 'string' ? k.split(',').map(s => s.trim()) : k
        ).filter(Boolean)
      }
    } else if (exif['XMP-dc:Keywords']) {
      const keywords = exif['XMP-dc:Keywords']
      if (Array.isArray(keywords)) {
        // Split any comma-separated values within the array
        entry.tags = keywords.flatMap(k =>
          typeof k === 'string' ? k.split(',').map(s => s.trim()) : k
        ).filter(Boolean)
      } else if (typeof keywords === 'string') {
        entry.tags = keywords.split(',').map(k => k.trim()).filter(Boolean)
      }
    }

    // People from dedicated field
    if (exif['XMP-iptcExt:PersonInImage']) {
      const persons = exif['XMP-iptcExt:PersonInImage']
      if (typeof persons === 'string') {
        entry.person = persons.split(',').map(p => p.trim()).filter(Boolean)
      } else if (Array.isArray(persons)) {
        // Also split any comma-separated values within the array
        entry.person = persons.flatMap(p =>
          typeof p === 'string' ? p.split(',').map(s => s.trim()) : p
        ).filter(Boolean)
      }
    } else if (exif['IPTC:PersonInImage']) {
      const persons = exif['IPTC:PersonInImage']
      if (typeof persons === 'string') {
        entry.person = persons.split(',').map(p => p.trim()).filter(Boolean)
      } else if (Array.isArray(persons)) {
        // Also split any comma-separated values within the array
        entry.person = persons.flatMap(p =>
          typeof p === 'string' ? p.split(',').map(s => s.trim()) : p
        ).filter(Boolean)
      }
    }

    // Products from hierarchical subject (used flat)
    if (exif['XMP-lr:HierarchicalSubject']) {
      const products = exif['XMP-lr:HierarchicalSubject']
      if (Array.isArray(products)) {
        // Split any comma-separated values within the array
        entry.product = products.flatMap(p =>
          typeof p === 'string' ? p.split(',').map(s => s.trim()) : p
        ).filter(Boolean)
      } else if (typeof products === 'string') {
        // Split comma-separated values
        entry.product = products.split(',').map(p => p.trim()).filter(Boolean)
      }
    }

    // Keep hierarchical for backward compatibility if still used elsewhere
    if (exif['XMP:HierarchicalSubject']) {
      const hierarchical = exif['XMP:HierarchicalSubject']
      const subjects = Array.isArray(hierarchical) ? hierarchical : [hierarchical]
      entry.hierarchical = subjects.filter(Boolean)
    }

    return entry
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return null
  }
}

async function main() {
  console.log('Building manifest...')

  const patterns = [
    'assets/**/*.{jpg,jpeg,JPG,JPEG}',
    'assets/**/*.{tif,tiff,TIF,TIFF}',
    'assets/**/*.{png,PNG}',
    'assets/**/*.{webp,WEBP}',
    'assets/**/*.{heic,HEIC}',
    'assets/**/*.{mp4,MP4}',
    'assets/**/*.{mov,MOV}',
    'assets/**/*.{webm,WEBM}',
    'assets/**/*.{avi,AVI}',
  ]

  const files: string[] = []
  for (const pattern of patterns) {
    const matches = glob.sync(pattern)
    files.push(...matches)
  }

  console.log(`Found ${files.length} image files`)

  const manifest: ManifestEntry[] = []

  for (const file of files) {
    const metadata = await extractMetadata(file)
    if (metadata) {
      manifest.push(metadata)
    }
  }

  manifest.sort((a, b) => {
    if (a.dateTaken && b.dateTaken) {
      return b.dateTaken.localeCompare(a.dateTaken)
    }
    return a.path.localeCompare(b.path)
  })

  const outputPath = resolve('data/manifest.json')
  const outputDir = dirname(outputPath)

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  writeFileSync(outputPath, JSON.stringify(manifest, null, 2))

  console.log(`Manifest written to ${outputPath}`)
  console.log(`Total images: ${manifest.length}`)
}

main().catch(console.error)