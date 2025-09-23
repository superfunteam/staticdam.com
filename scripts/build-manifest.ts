#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { glob } from 'glob'
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
  category?: string
  tags?: string[]
  subject?: string
  product?: string[]
  hierarchical?: string[]
}

async function extractMetadata(filePath: string): Promise<ManifestEntry | null> {
  try {
    const cmd = `exiftool -json -G1 -n "${filePath}"`
    const output = execSync(cmd, { encoding: 'utf-8' })
    const data: ExifData[] = JSON.parse(output)

    if (!data || !data[0]) return null

    const exif = data[0]

    const entry: ManifestEntry = {
      path: filePath.replace(/^\.\//, ''),
      w: exif['EXIF:ImageWidth'] || exif['File:ImageWidth'] || 0,
      h: exif['EXIF:ImageHeight'] || exif['File:ImageHeight'] || 0,
      bytes: exif['File:FileSize'] || 0,
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

    if (exif['XMP-photoshop:Category']) {
      entry.category = exif['XMP-photoshop:Category']
    }

    if (exif['XMP-dc:Subject']) {
      const subjects = exif['XMP-dc:Subject']
      entry.tags = Array.isArray(subjects) ? subjects : [subjects].filter(Boolean)
    } else if (exif['IPTC:Keywords']) {
      const keywords = exif['IPTC:Keywords']
      entry.tags = Array.isArray(keywords) ? keywords : [keywords].filter(Boolean)
    }

    if (exif['XMP-photoshop:Headline']) {
      entry.subject = exif['XMP-photoshop:Headline']
    } else if (exif['XMP-dc:Title']) {
      entry.subject = exif['XMP-dc:Title']
    }

    if (exif['XMP:HierarchicalSubject']) {
      const hierarchical = exif['XMP:HierarchicalSubject']
      const subjects = Array.isArray(hierarchical) ? hierarchical : [hierarchical]
      entry.hierarchical = subjects.filter(Boolean)

      entry.product = subjects
        .filter((s: string) => s && s.startsWith('product|'))
        .map((s: string) => s.replace('product|', ''))
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
  ]

  const files: string[] = []
  for (const pattern of patterns) {
    const matches = await glob(pattern)
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