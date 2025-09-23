import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ImageMetadata } from '@/types'

export default function LibraryPage() {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())

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

  const toggleSelect = (path: string) => {
    const newSelection = new Set(selectedImages)
    if (newSelection.has(path)) {
      newSelection.delete(path)
    } else {
      newSelection.add(path)
    }
    setSelectedImages(newSelection)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Library</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {images.length} images
          </span>
          {selectedImages.size > 0 && (
            <span className="text-sm font-medium">
              {selectedImages.size} selected
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.path}
            className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedImages.has(image.path)
                ? 'border-primary ring-2 ring-primary'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => toggleSelect(image.path)}
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={`/${image.path}`}
                alt={image.subject || image.path.split('/').pop()}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  )
}