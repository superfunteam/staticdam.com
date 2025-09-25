import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Download, Tag, Calendar, Camera, Hash, Folder, Loader2, User, Copy, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { ImageMetadata } from '@/types'

// StaticDAM Logo Component
const StaticDAMLogo = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g clipPath="url(#clip0_2_3032)">
      <path d="M12.7681 12.7694C14.0842 11.4534 13.0157 8.25115 10.3816 5.61706C7.74756 2.98297 4.54533 1.91451 3.22926 3.23058C1.9132 4.54664 2.98166 7.74887 5.61575 10.383C8.24983 13.017 11.4521 14.0855 12.7681 12.7694Z" stroke="currentColor" strokeWidth="1.25" strokeMiterlimit="10"/>
      <path d="M10.3816 10.3829C13.0157 7.74885 14.0842 4.54662 12.7681 3.23055C11.4521 1.91449 8.24983 2.98295 5.61575 5.61704C2.98166 8.25113 1.9132 11.4534 3.22926 12.7694C4.54533 14.0855 7.74756 13.017 10.3816 10.3829Z" stroke="currentColor" strokeWidth="1.25" strokeMiterlimit="10"/>
    </g>
    <defs>
      <clipPath id="clip0_2_3032">
        <rect width="16" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
)

interface ImageLightboxProps {
  image: ImageMetadata
  images: ImageMetadata[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  onEditMetadata?: () => void
}

export function ImageLightbox({ image, images, isOpen, onClose, onNavigate, onEditMetadata }: ImageLightboxProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const imgRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const currentIndex = images.findIndex(img => img.path === image.path)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < images.length - 1
  const isVideo = image.isVideo || /\.(mp4|mov|webm|avi)$/i.test(image.path)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (hasPrev) onNavigate('prev')
          break
        case 'ArrowRight':
          e.preventDefault()
          if (hasNext) onNavigate('next')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasPrev, hasNext, onNavigate])

  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true)
    setImageDimensions({ width: 0, height: 0 })
  }, [image.path])

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

  const fileName = image.path.split('/').pop() || 'Unknown'

  // Generate share URLs
  const damUrl = `${window.location.origin}/asset/${encodeURIComponent(image.path)}`
  const assetUrl = `${window.location.origin}/${image.path}`

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success(`${label} copied to clipboard!`)
      } catch (fallbackErr) {
        toast.error('Failed to copy to clipboard')
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="inset-0 w-full max-w-full h-full p-0 border-none sm:max-w-full bg-transparent"
        side="right"
      >
        <div className="flex h-full">
          {/* Image Area - No animation on container to prevent interference */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Navigation Buttons */}
            {hasPrev && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20 z-10"
                onClick={() => onNavigate('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {hasNext && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-white/20 z-10"
                onClick={() => onNavigate('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* Main Media (Image or Video) */}
            <div className="max-w-full max-h-full flex items-center justify-center relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <span className="text-white text-sm">Loading {isVideo ? 'video' : 'image'}...</span>
                  </div>
                </div>
              )}
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={`/${image.path}`}
                  controls
                  autoPlay
                  muted
                  className={`max-w-full max-h-full object-contain ${
                    isLoading ? 'opacity-0' : 'opacity-100 animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both'
                  }`}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget
                    setImageDimensions({
                      width: video.videoWidth,
                      height: video.videoHeight
                    })
                    setIsLoading(false)
                  }}
                  onError={() => setIsLoading(false)}
                />
              ) : (
                <img
                  ref={imgRef}
                  src={`/${image.path}`}
                  alt={image.subject || fileName}
                  className={`max-w-full max-h-full object-contain ${
                    isLoading ? 'opacity-0' : 'opacity-100 animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both'
                  }`}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    setImageDimensions({
                      width: img.naturalWidth,
                      height: img.naturalHeight
                    })
                    setIsLoading(false)
                  }}
                  onError={() => setIsLoading(false)}
                />
              )}
            </div>

            {/* Top Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} of {images.length}
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="w-80 bg-white dark:bg-black flex flex-col animate-in slide-in-from-right duration-500">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle className="text-left truncate">{fileName}</SheetTitle>
            </SheetHeader>

            <div className="flex-1 px-6 py-4 overflow-y-auto">
              <div className="space-y-6">
                {/* File Info */}
                <div>
                  <h3 className="font-semibold mb-3">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-16">Name:</span>
                      <span className="break-all">{fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground min-w-16">Folder:</span>
                      <span>{getFolder()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground min-w-16">Size:</span>
                      <span>
                        {imageDimensions.width || image.w || 0} × {imageDimensions.height || image.h || 0} px
                      </span>
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
                    {image.duration && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-16">Duration:</span>
                        <span>{Math.floor(image.duration / 60)}:{String(Math.floor(image.duration % 60)).padStart(2, '0')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Share Links */}
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Share Links</h3>
                  <div className="space-y-3 text-sm">
                    {/* DAM URL */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <StaticDAMLogo className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">DAM URL</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={damUrl}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs border rounded bg-muted/50 text-muted-foreground"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2"
                          onClick={() => copyToClipboard(damUrl, 'DAM URL')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Asset URL */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Asset URL</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={assetUrl}
                          readOnly
                          className="flex-1 px-2 py-1 text-xs border rounded bg-muted/50 text-muted-foreground"
                          onClick={(e) => e.currentTarget.select()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2"
                          onClick={() => copyToClipboard(assetUrl, 'Asset URL')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
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
                {image.category && image.category.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {image.category.map((cat, index) => (
                          <span
                            key={index}
                            className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                          >
                            {cat}
                          </span>
                        ))}
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

                {/* Person */}
                {image.person && image.person.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        People
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {image.person.map((person, index) => (
                          <span
                            key={index}
                            className="inline-block bg-primary text-primary-foreground px-2 py-1 rounded text-sm"
                          >
                            {person}
                          </span>
                        ))}
                      </div>
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

            {/* Footer with Edit Metadata button */}
            {onEditMetadata && (
              <SheetFooter className="px-6 pb-6">
                <Button onClick={onEditMetadata} className="w-full">
                  Edit Metadata
                </Button>
              </SheetFooter>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}