import type { Handler } from '@netlify/functions'
import sharp from 'sharp'

interface DownloadParams {
  path: string
  format: 'jpeg' | 'webp' | 'avif' | 'png'
  width?: number
  quality?: number
}

const MAX_WIDTH = 4096
const DEFAULT_QUALITY = 85

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method not allowed',
    }
  }

  const params = event.queryStringParameters as unknown as DownloadParams

  if (!params?.path || !params?.format) {
    return {
      statusCode: 400,
      body: 'Missing required parameters',
    }
  }

  if (!params.path.startsWith('assets/')) {
    return {
      statusCode: 400,
      body: 'Invalid path',
    }
  }

  const width = params.width ? Math.min(parseInt(String(params.width)), MAX_WIDTH) : undefined
  const quality = params.quality ? Math.min(Math.max(parseInt(String(params.quality)), 1), 100) : DEFAULT_QUALITY

  try {
    const imageUrl = `${process.env.URL || process.env.PUBLIC_BASE_URL}/${params.path}`
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return {
        statusCode: 404,
        body: 'Image not found',
      }
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    let pipeline = sharp(buffer)

    if (width) {
      pipeline = pipeline.resize(width, null, {
        withoutEnlargement: true,
      })
    }

    let outputBuffer: Buffer
    let contentType: string

    switch (params.format) {
      case 'jpeg':
        outputBuffer = await pipeline.jpeg({ quality }).toBuffer()
        contentType = 'image/jpeg'
        break
      case 'webp':
        outputBuffer = await pipeline.webp({ quality }).toBuffer()
        contentType = 'image/webp'
        break
      case 'avif':
        outputBuffer = await pipeline.avif({ quality }).toBuffer()
        contentType = 'image/avif'
        break
      case 'png':
        outputBuffer = await pipeline.png().toBuffer()
        contentType = 'image/png'
        break
      default:
        return {
          statusCode: 400,
          body: 'Invalid format',
        }
    }

    const etag = `"${Buffer.from(`${params.path}-${params.format}-${width}-${quality}`).toString('base64')}"`.substring(0, 32)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etag,
        'Content-Disposition': `attachment; filename="${params.path.split('/').pop()?.split('.')[0]}.${params.format}"`,
      },
      body: outputBuffer.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error) {
    console.error('Download error:', error)
    return {
      statusCode: 500,
      body: 'Internal server error',
    }
  }
}