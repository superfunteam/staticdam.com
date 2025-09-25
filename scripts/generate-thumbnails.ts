#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import * as glob from 'glob'
import { dirname, extname, basename } from 'path'

interface ThumbnailResult {
  original: string
  thumbnail: string
  skipped: boolean
  reason?: string
}


function shouldGenerateThumbnail(originalPath: string, thumbnailPath: string): boolean {
  // Simple check: if thumbnail exists, skip generation
  return !existsSync(thumbnailPath)
}

function getOutputPath(inputPath: string): string {
  // Convert assets/folder/image.jpg -> assets-thumbs/folder/image.jpg
  const relativePath = inputPath.replace(/^assets\//, '')
  const dir = dirname(relativePath)
  const nameWithoutExt = basename(relativePath, extname(relativePath))

  const outputDir = dir === '.' ? 'assets-thumbs' : `assets-thumbs/${dir}`
  return `${outputDir}/${nameWithoutExt}.jpg`
}

async function generateVideoThumbnail(inputPath: string, outputPath: string): Promise<boolean> {
  try {
    // Get video duration
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
    const durationOutput = execSync(durationCmd, { encoding: 'utf-8' })
    const duration = parseFloat(durationOutput.trim())

    if (isNaN(duration) || duration <= 0) {
      throw new Error('Could not determine video duration')
    }

    // Calculate midpoint
    const midpoint = duration / 2

    // Extract frame at midpoint and resize to 800px width
    const ffmpegCmd = `ffmpeg -ss ${midpoint} -i "${inputPath}" -vframes 1 -vf "scale=800:-1" -q:v 2 "${outputPath}" -y`
    execSync(ffmpegCmd, { stdio: 'pipe' })

    return true
  } catch (error) {
    console.error(`Error generating video thumbnail for ${inputPath}:`, error)
    return false
  }
}

async function generateThumbnail(inputPath: string): Promise<ThumbnailResult> {
  const outputPath = getOutputPath(inputPath)

  // Check if we need to generate the thumbnail
  if (!shouldGenerateThumbnail(inputPath, outputPath)) {
    return {
      original: inputPath,
      thumbnail: outputPath,
      skipped: true,
      reason: 'Thumbnail already exists'
    }
  }

  try {
    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    // Check if this is a video file
    const isVideo = /\.(mp4|mov|webm|avi)$/i.test(inputPath)

    if (isVideo) {
      // Generate video thumbnail at 50% duration
      const success = await generateVideoThumbnail(inputPath, outputPath)
      if (!success) {
        throw new Error('Failed to generate video thumbnail')
      }
    } else {
      // Generate image thumbnail
      // -resize 800x800> only resizes if image is larger than 800px
      // -quality 90 for high quality JPG compression
      const args = [
        inputPath,
        '-resize', '800x800>',
        '-quality', '90',
        outputPath
      ]

      execSync(`convert ${args.map(arg => `"${arg}"`).join(' ')}`, { stdio: 'inherit' })
    }

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

  // Find all image and video files in assets directory
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