#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { mkdirSync, existsSync, statSync } from 'fs'
import * as glob from 'glob'
import { resolve, dirname, extname, basename } from 'path'

interface ThumbnailResult {
  original: string
  thumbnail: string
  skipped: boolean
  reason?: string
}

function shouldGenerateThumbnail(originalPath: string, thumbnailPath: string): boolean {
  // If thumbnail doesn't exist, generate it
  if (!existsSync(thumbnailPath)) {
    return true
  }

  try {
    const originalStat = statSync(originalPath)
    const thumbnailStat = statSync(thumbnailPath)

    // If original is newer than thumbnail, regenerate
    if (originalStat.mtime > thumbnailStat.mtime) {
      return true
    }
  } catch (error) {
    // If we can't stat, err on the side of generating
    return true
  }

  return false
}

function getOutputPath(inputPath: string): string {
  // Convert assets/folder/image.jpg -> assets-thumbs/folder/image.webp
  const relativePath = inputPath.replace(/^assets\//, '')
  const dir = dirname(relativePath)
  const nameWithoutExt = basename(relativePath, extname(relativePath))

  const outputDir = dir === '.' ? 'assets-thumbs' : `assets-thumbs/${dir}`
  return `${outputDir}/${nameWithoutExt}.webp`
}

async function generateThumbnail(inputPath: string): Promise<ThumbnailResult> {
  const outputPath = getOutputPath(inputPath)

  // Check if we need to generate the thumbnail
  if (!shouldGenerateThumbnail(inputPath, outputPath)) {
    return {
      original: inputPath,
      thumbnail: outputPath,
      skipped: true,
      reason: 'Thumbnail is up to date'
    }
  }

  try {
    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    // Generate WebP thumbnail at 800px width with lossless compression
    // -resize 800x800> only resizes if image is larger than 800px
    // -define webp:lossless=true for lossless compression
    // -quality 100 for maximum quality in lossless mode
    const args = [
      inputPath,
      '-resize', '800x800>',
      '-define', 'webp:lossless=true',
      '-quality', '100',
      outputPath
    ]

    execSync(`convert ${args.map(arg => `"${arg}"`).join(' ')}`, { stdio: 'inherit' })

    return {
      original: inputPath,
      thumbnail: outputPath,
      skipped: false
    }
  } catch (error) {
    console.error(`Error generating thumbnail for ${inputPath}:`, error)
    return {
      original: inputPath,
      thumbnail: outputPath,
      skipped: true,
      reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function main() {
  console.log('Generating thumbnails...')

  // Find all image files in assets directory
  const patterns = [
    'assets/**/*.{jpg,jpeg,JPG,JPEG}',
    'assets/**/*.{tif,tiff,TIF,TIFF}',
    'assets/**/*.{png,PNG}',
    'assets/**/*.{webp,WEBP}',
    'assets/**/*.{heic,HEIC}',
  ]

  const files: string[] = []
  for (const pattern of patterns) {
    const matches = glob.sync(pattern)
    files.push(...matches)
  }

  console.log(`Found ${files.length} image files`)

  const results: ThumbnailResult[] = []
  let processed = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const result = await generateThumbnail(file)
    results.push(result)

    if (result.skipped) {
      skipped++
      if (result.reason?.startsWith('Error:')) {
        errors++
        console.error(`❌ ${file}: ${result.reason}`)
      } else {
        console.log(`⏭️  ${file}: ${result.reason || 'Skipped'}`)
      }
    } else {
      processed++
      console.log(`✅ ${file} -> ${result.thumbnail}`)
    }
  }

  console.log('\n=== Thumbnail Generation Summary ===')
  console.log(`Total files: ${files.length}`)
  console.log(`Generated: ${processed}`)
  console.log(`Skipped: ${skipped - errors}`)
  console.log(`Errors: ${errors}`)

  if (errors > 0) {
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})