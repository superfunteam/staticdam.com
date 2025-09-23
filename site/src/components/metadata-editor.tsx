import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { X, Plus, Save } from 'lucide-react'
import type { ImageMetadata } from '@/types'

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
    category?: string
    subject?: string
    product?: string
    tags?: string[]
  }
}

export function MetadataEditor({ selectedImages, images, isOpen, onClose, onSave }: MetadataEditorProps) {
  const [updates, setUpdates] = useState<Record<string, any>>({})
  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({})
  const [newCategories, setNewCategories] = useState<Record<string, string>>({})
  const [newSubjects, setNewSubjects] = useState<Record<string, string>>({})
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
    const currentCategories = imageUpdates.category ? [imageUpdates.category] : (image?.category ? [image.category] : [])

    if (!currentCategories.includes(category)) {
      updateField(imagePath, 'category', [...currentCategories, category])
      setNewCategories(prev => ({ ...prev, [imagePath]: '' }))
    }
  }

  const removeCategory = (imagePath: string, categoryToRemove: string) => {
    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentCategories = imageUpdates.category ? [imageUpdates.category] : (image?.category ? [image.category] : [])
    const filtered = currentCategories.filter(c => c !== categoryToRemove)
    updateField(imagePath, 'category', filtered.length > 0 ? filtered : [])
  }

  // Subject functions
  const addSubject = (imagePath: string) => {
    const subject = newSubjects[imagePath]?.trim()
    if (!subject) return

    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentSubjects = imageUpdates.subject ? [imageUpdates.subject] : (image?.subject ? [image.subject] : [])

    if (!currentSubjects.includes(subject)) {
      updateField(imagePath, 'subject', [...currentSubjects, subject])
      setNewSubjects(prev => ({ ...prev, [imagePath]: '' }))
    }
  }

  const removeSubject = (imagePath: string, subjectToRemove: string) => {
    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentSubjects = imageUpdates.subject ? [imageUpdates.subject] : (image?.subject ? [image.subject] : [])
    const filtered = currentSubjects.filter(s => s !== subjectToRemove)
    updateField(imagePath, 'subject', filtered.length > 0 ? filtered : [])
  }

  // Product functions
  const addProduct = (imagePath: string) => {
    const product = newProducts[imagePath]?.trim()
    if (!product) return

    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentProducts = imageUpdates.product ? (Array.isArray(imageUpdates.product) ? imageUpdates.product : [imageUpdates.product]) : (image?.product ? (Array.isArray(image.product) ? image.product : [image.product]) : [])

    if (!currentProducts.includes(product)) {
      updateField(imagePath, 'product', [...currentProducts, product])
      setNewProducts(prev => ({ ...prev, [imagePath]: '' }))
    }
  }

  const removeProduct = (imagePath: string, productToRemove: string) => {
    const image = selectedImageData.find(img => img.path === imagePath)
    const imageUpdates = updates[imagePath] || {}
    const currentProducts = imageUpdates.product ? (Array.isArray(imageUpdates.product) ? imageUpdates.product : [imageUpdates.product]) : (image?.product ? (Array.isArray(image.product) ? image.product : [image.product]) : [])
    const filtered = currentProducts.filter(p => p !== productToRemove)
    updateField(imagePath, 'product', filtered.length > 0 ? filtered : [])
  }

  const handleSave = async () => {
    const metadataUpdates: MetadataUpdate[] = selectedImages.map(path => {
      const image = selectedImageData.find(img => img.path === path)
      const imageUpdates = updates[path] || {}

      return {
        path,
        metadata: {
          category: imageUpdates.category ?? image?.category,
          subject: imageUpdates.subject ?? image?.subject,
          product: imageUpdates.product ?? image?.product,
          tags: imageUpdates.tags ?? image?.tags
        }
      }
    })

    try {
      await onSave(metadataUpdates)
      toast({
        title: 'Success',
        description: `Updated metadata for ${selectedImages.length} image(s)`,
      })
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
              const currentCategories = imageUpdates.category ? [imageUpdates.category] : (image?.category ? [image.category] : [])
              const currentSubjects = imageUpdates.subject ? [imageUpdates.subject] : (image?.subject ? [image.subject] : [])
              const currentProducts = imageUpdates.product ? (Array.isArray(imageUpdates.product) ? imageUpdates.product : [imageUpdates.product]) : (image?.product ? (Array.isArray(image.product) ? image.product : [image.product]) : [])

              return (
                <div key={image.path} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={`/${image.path}`}
                      alt={imageName}
                      className="w-16 h-16 object-cover rounded"
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

                      {/* Subject */}
                      <div className="mb-4">
                        <Label className="text-xs">Subject</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {currentSubjects.map((subject: string) => (
                            <span
                              key={subject}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                            >
                              {subject}
                              <button
                                onClick={() => removeSubject(image.path, subject)}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newSubjects[image.path] || ''}
                            onChange={(e) => setNewSubjects(prev => ({ ...prev, [image.path]: e.target.value }))}
                            placeholder="Add subject..."
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && addSubject(image.path)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addSubject(image.path)}
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