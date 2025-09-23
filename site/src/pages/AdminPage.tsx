import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shared-Token': password,
        },
      })

      if (res.ok) {
        setIsAuthenticated(true)
        toast({
          title: 'Success',
          description: 'Successfully authenticated',
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
    } finally {
      setIsLoading(false)
    }
  }

  const triggerReindex = async () => {
    setIsLoading(true)
    try {
      toast({
        title: 'Reindexing',
        description: 'This may take a few moments...',
      })

      // This would trigger the GitHub Action
      await fetch('/api/admin/reindex', {
        method: 'POST',
        headers: {
          'X-Shared-Token': password,
        },
      })

      toast({
        title: 'Success',
        description: 'Reindex triggered successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to trigger reindex',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Admin</h2>

      {!isAuthenticated ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter password"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">✓ Authenticated</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Admin Actions</h3>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Reindex Images</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Trigger a full reindex of all images in the assets folder.
                This will read EXIF data and rebuild the manifest.
              </p>
              <Button onClick={triggerReindex} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Trigger Reindex'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}