import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { X, Plus, Save } from 'lucide-react'
import type { ImageMetadata } from '@/types'

// Utility function to get thumbnail path
function getThumbnailPath(imagePath: string): string {
  // Convert assets/folder/image.jpg -> assets-thumbs/folder/image.jpg
  const pathWithoutExt = imagePath.replace(/\.[^/.]+$/, '')
  const thumbnailPath = pathWithoutExt.replace(/^assets\//, 'assets-thumbs/') + '.jpg'
  return `/${thumbnailPath}`
}

interface MetadataEditorProps {
  selectedImages: string[]
  images: ImageMetadata[]
  isOpen: boolean
  onClose: () => void
  onSave: (updates: MetadataUpdate[]) => void
}

interface MetadataUpdate {
  path: string
  metadata: {
    category?: string[]
    person?: string[]
    product?: string[]
    tags?: string[]
  }
}

export function MetadataEditor({ selectedImages, images, isOpen, onClose, onSave }: MetadataEditorProps) {
  const [updates, setUpdates] = useState<Record<string, any>>({})
  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({})
  const [newCategories, setNewCategories] = useState<Record<string, string>>({})
  const [newPersons, setNewPersons] = useState<Record<string, string>>({})
  const [newProducts, setNewProducts] = useState<Record<string, string>>({})
  const { toast } = useToast()

  if (!isOpen) return null

  const selectedImageData = images.filter(img => selectedImages.includes(img.path))

  const updateField = (imagePath: string, field: string, value: string) => {
    setUpdates(prev => ({
      ...prev,
      [imagePath]: {
        ...prev[imagePath],
        [field]: value
      }
    }))
  }

  const addTag = (imagePath: string) => {
    const tag = newKeywords[imagePath]?.trim()
    if (!tag) return

    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentTags = imageUpdates.tags ?? image?.tags ?? []

    if (!currentTags.includes(tag)) {
      updateField(imagePath, 'tags', [...currentTags, tag])
      setNewKeywords(prev => ({ ...prev, [imagePath]: '' }))
    }
  }

  const removeTag = (imagePath: string, tagToRemove: string) => {
    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentTags = imageUpdates.tags ?? image?.tags ?? []
    updateField(imagePath, 'tags', currentTags.filter(t => t !== tagToRemove))
  }

  // Category functions
  const addCategory = (imagePath: string) => {
    const category = newCategories[imagePath]?.trim()
    if (!category) return

    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentCategories = imageUpdates.category ?? image?.category ?? []

    if (!currentCategories.includes(category)) {
      updateField(imagePath, 'category', [...currentCategories, category])
      setNewCategories(prev => ({ ...prev, [imagePath]: '' }))
    }
  }

  const removeCategory = (imagePath: string, categoryToRemove: string) => {
    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentCategories = imageUpdates.category ?? image?.category ?? []
    updateField(imagePath, 'category', currentCategories.filter(c => c !== categoryToRemove))
  }

  // Person functions (renamed from subject)
  const addPerson = (imagePath: string) => {
    const person = newPersons[imagePath]?.trim()
    if (!person) return

    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentPersons = imageUpdates.person ?? image?.person ?? []

    if (!currentPersons.includes(person)) {
      updateField(imagePath, 'person', [...currentPersons, person])
      setNewPersons(prev => ({ ...prev, [imagePath]: '' }))
    }
  }

  const removePerson = (imagePath: string, personToRemove: string) => {
    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentPersons = imageUpdates.person ?? image?.person ?? []
    updateField(imagePath, 'person', currentPersons.filter(p => p !== personToRemove))
  }

  // Product functions
  const addProduct = (imagePath: string) => {
    const product = newProducts[imagePath]?.trim()
    if (!product) return

    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentProducts = imageUpdates.product ?? image?.product ?? []

    if (!currentProducts.includes(product)) {
      updateField(imagePath, 'product', [...currentProducts, product])
      setNewProducts(prev => ({ ...prev, [imagePath]: '' }))
    }
  }

  const removeProduct = (imagePath: string, productToRemove: string) => {
    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentProducts = imageUpdates.product ?? image?.product ?? []
    updateField(imagePath, 'product', currentProducts.filter(p => p !== productToRemove))
  }

  const handleSave = async () => {
    const metadataUpdates: MetadataUpdate[] = selectedImages.map(path => {
      const image = selectedImageData.find(img => img.path === path)
      const imageUpdates = updates[path] || {}

      return {
        path,
        metadata: {
          category: imageUpdates.category ?? image?.category,
          person: imageUpdates.person ?? image?.person,
          product: imageUpdates.product ?? image?.product,
          tags: imageUpdates.tags ?? image?.tags
        }
      }
    })

    try {
      await onSave(metadataUpdates)
      onClose()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update metadata',
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Edit Metadata ({selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''})
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {selectedImageData.map((image) => {
              const imageName = image.path.split('/').pop()
              const imageUpdates = updates[image.path] || {}
              const currentTags = imageUpdates.tags ?? image.tags ?? []
              const currentCategories = imageUpdates.category ?? image?.category ?? []
              const currentPersons = imageUpdates.person ?? image?.person ?? []
              const currentProducts = imageUpdates.product ?? image?.product ?? []

              return (
                <div key={image.path} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={getThumbnailPath(image.path)}
                      alt={imageName}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        // Fallback to original image if thumbnail fails to load
                        e.currentTarget.src = `/${image.path}`
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-2">{imageName}</h3>

                      {/* Category */}
                      <div className="mb-4">
                        <Label className="text-xs">Category</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {currentCategories.map((category: string) => (
                            <span
                              key={category}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                            >
                              {category}
                              <button
                                onClick={() => removeCategory(image.path, category)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newCategories[image.path] || ''}
                            onChange={(e) => setNewCategories(prev => ({ ...prev, [image.path]: e.target.value }))}
                            placeholder="Add category..."
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && addCategory(image.path)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addCategory(image.path)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Person */}
                      <div className="mb-4">
                        <Label className="text-xs">People</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {currentPersons.map((person: string) => (
                            <span
                              key={person}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                            >
                              {person}
                              <button
                                onClick={() => removePerson(image.path, person)}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newPersons[image.path] || ''}
                            onChange={(e) => setNewPersons(prev => ({ ...prev, [image.path]: e.target.value }))}
                            placeholder="Add person..."
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && addPerson(image.path)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addPerson(image.path)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Product */}
                      <div className="mb-4">
                        <Label className="text-xs">Product</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {currentProducts.map((product: string) => (
                            <span
                              key={product}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                            >
                              {product}
                              <button
                                onClick={() => removeProduct(image.path, product)}
                                className="text-orange-600 hover:text-orange-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newProducts[image.path] || ''}
                            onChange={(e) => setNewProducts(prev => ({ ...prev, [image.path]: e.target.value }))}
                            placeholder="Add product..."
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && addProduct(image.path)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addProduct(image.path)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-4">
                        <Label className="text-xs">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {currentTags.map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(image.path, tag)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newKeywords[image.path] || ''}
                            onChange={(e) => setNewKeywords(prev => ({ ...prev, [image.path]: e.target.value }))}
                            placeholder="Add tag..."
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && addTag(image.path)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addTag(image.path)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}