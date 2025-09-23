import React, { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Download, Tag, Calendar, Camera, Hash, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { ImageMetadata } from '@/types'

interface ImageLightboxProps {
  image: ImageMetadata
  images: ImageMetadata[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
}

export function ImageLightbox({ image, images, isOpen, onClose, onNavigate }: ImageLightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const currentIndex = images.findIndex(img => img.path === image.path)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (hasPrev) onNavigate('prev')
          break
        case 'ArrowRight':
          if (hasNext) onNavigate('next')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasPrev, hasNext, onClose, onNavigate])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `/${image.path}`
    link.download = image.path.split('/').pop() || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  const getFolder = () => {
    const parts = image.path.split('/')
    return parts.length > 2 ? parts[1] : 'Root'
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      {/* Image Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Navigation Buttons */}
        {hasPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
            onClick={() => onNavigate('prev')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {hasNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20"
            onClick={() => onNavigate('next')}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Main Image */}
        <div className="max-w-full max-h-full flex items-center justify-center">
          {isLoading && (
            <div className="text-white">Loading...</div>
          )}
          <img
            src={`/${image.path}`}
            alt={image.subject || image.path.split('/').pop()}
            className="max-w-full max-h-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} of {images.length}
        </div>
      </div>

      {/* Metadata Sidebar */}
      <div className="w-80 bg-white p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* File Info */}
          <div>
            <h3 className="font-semibold mb-3">File Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground min-w-16">Name:</span>
                <span className="break-all">{image.path.split('/').pop()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground min-w-16">Folder:</span>
                <span>{getFolder()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground min-w-16">Size:</span>
                <span>{image.w} × {image.h} px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground min-w-16">File Size:</span>
                <span>{formatFileSize(image.bytes)}</span>
              </div>
              {image.dateTaken && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground min-w-16">Taken:</span>
                  <span>{formatDate(image.dateTaken)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera Info */}
          {image.camera && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Camera
                </h3>
                <div className="space-y-2 text-sm">
                  {image.camera.make && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-16">Make:</span>
                      <span>{image.camera.make}</span>
                    </div>
                  )}
                  {image.camera.model && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-16">Model:</span>
                      <span>{image.camera.model}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Category */}
          {image.category && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Category
                </h3>
                <div className="text-sm">
                  <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {image.category}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {image.tags && image.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subject/Title */}
          {image.subject && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Subject</h3>
                <p className="text-sm">{image.subject}</p>
              </div>
            </>
          )}

          {/* Hierarchical */}
          {image.hierarchical && image.hierarchical.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Hierarchical Keywords</h3>
                <div className="space-y-1">
                  {image.hierarchical.map((keyword, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Products */}
          {image.product && image.product.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Products</h3>
                <div className="flex flex-wrap gap-2">
                  {image.product.map((product, index) => (
                    <span
                      key={index}
                      className="inline-block bg-primary text-primary-foreground px-2 py-1 rounded text-sm"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}