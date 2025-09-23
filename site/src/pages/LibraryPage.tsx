import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useFilter } from '@/components/dam-sidebar'
import { ImageLightbox } from '@/components/image-lightbox'
import { MetadataEditor } from '@/components/metadata-editor'
import { Check } from 'lucide-react'
import type { ImageMetadata } from '@/types'

// Utility function to get thumbnail path
function getThumbnailPath(imagePath: string): string {
  // Convert assets/folder/image.jpg -> assets-thumbs/folder/image.webp
  const pathWithoutExt = imagePath.replace(/\.[^/.]+$/, '')
  const thumbnailPath = pathWithoutExt.replace(/^assets\//, 'assets-thumbs/') + '.webp'
  return `/${thumbnailPath}`
}

export default function LibraryPage() {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showMetadataEditor, setShowMetadataEditor] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<ImageMetadata | null>(null)
  const { toast } = useToast()
  const { selectedFilter, filteredImages } = useFilter()

  const { data: images = [], isLoading } = useQuery<ImageMetadata[]>({
    queryKey: ['manifest'],
    queryFn: async () => {
      const res = await fetch('/data/manifest.json')
      if (!res.ok) throw new Error('Failed to load manifest')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg">Loading images...</div>
        </div>
      </div>
    )
  }

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg mb-4">No images found</div>
          <div className="text-sm text-muted-foreground">
            Upload images to the assets folder to get started
          </div>
        </div>
      </div>
    )
  }

  const toggleSelect = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelection = new Set(selectedImages)
    if (newSelection.has(path)) {
      newSelection.delete(path)
    } else {
      newSelection.add(path)
    }
    setSelectedImages(newSelection)
  }

  const openLightbox = (image: ImageMetadata) => {
    setLightboxImage(image)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxImage) return

    const currentIndex = filteredImages.findIndex(img => img.path === lightboxImage.path)
    let newIndex = currentIndex

    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1
    } else if (direction === 'next' && currentIndex < filteredImages.length - 1) {
      newIndex = currentIndex + 1
    }

    if (newIndex !== currentIndex) {
      setLightboxImage(filteredImages[newIndex])
    }
  }

  const handleAuth = async () => {
    try {
      const res = await fetch('/api/auth-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shared-Token': password,
        },
      })

      if (res.ok) {
        setIsAuthenticated(true)
        setIsEditing(false)
        setShowMetadataEditor(true)
        toast({
          title: 'Authenticated',
          description: 'You can now edit metadata',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid password',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to authenticate',
      })
    }
  }

  const startEditing = () => {
    if (selectedImages.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No images selected',
        description: 'Please select images to edit',
      })
      return
    }

    if (!isAuthenticated) {
      setIsEditing(true)
    } else {
      setShowMetadataEditor(true)
    }
  }

  const handleMetadataSave = async (updates: any[]) => {
    try {
      const response = await fetch('/api/edit-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to update metadata')
      }

      // Refresh the manifest after successful update
      window.location.reload()
    } catch (error) {
      throw error
    }
  }

  return (
    <>
      {selectedImages.size > 0 && (
        <div className="mb-6 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedImages.size} selected
            </span>
            <Button onClick={startEditing} size="sm">
              Edit Metadata
            </Button>
          </div>
        </div>
      )}

      <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredImages.map((image) => (
          <div
            key={image.path}
            className={`group relative cursor-pointer rounded-xl overflow-hidden border-8 transition-all ${
              selectedImages.has(image.path)
                ? 'border-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => openLightbox(image)}
          >
            {/* Checkbox for selection */}
            <div
              className={`absolute top-2 left-2 z-10 transition-opacity ${
                selectedImages.has(image.path)
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => toggleSelect(image.path, e)}
            >
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                selectedImages.has(image.path)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-white/90 border-white/90 hover:bg-white'
              }`}>
                {selectedImages.has(image.path) && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </div>

            <div className="aspect-square bg-gray-100 rounded-xl">
              <img
                src={getThumbnailPath(image.path)}
                alt={image.subject || image.path.split('/').pop()}
                className="w-full h-full object-cover rounded-xl"
                loading="lazy"
                onError={(e) => {
                  // Fallback to original image if thumbnail fails to load
                  e.currentTarget.src = `/${image.path}`
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-white text-sm truncate">
                  {image.path.split('/').pop()}
                </div>
                {image.category && (
                  <div className="text-white/80 text-xs">{image.category}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Password Dialog */}
      {isEditing && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enter Password</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Authentication required to edit metadata for {selectedImages.size} image(s)
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-4"
              placeholder="Enter admin password"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setPassword('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAuth}>
                Authenticate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage}
          images={filteredImages}
          isOpen={!!lightboxImage}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}

      {/* Metadata Editor */}
      <MetadataEditor
        selectedImages={Array.from(selectedImages)}
        images={images}
        isOpen={showMetadataEditor}
        onClose={() => setShowMetadataEditor(false)}
        onSave={handleMetadataSave}
      />
    </>
  )
}