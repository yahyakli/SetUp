import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  token: string | null
}

export default function DeleteProjectDialog({
  isOpen,
  onClose,
  projectId,
  token
}: DeleteProjectDialogProps) {
  const router = useRouter()
  const [hashCode, setHashCode] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Generate random hash code
  const generateHashCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const [verificationCode] = useState(generateHashCode())

  const handleDelete = async () => {
    if (hashCode !== verificationCode) {
      toast.error('Invalid verification code')
      return
    }

    try {
      setIsDeleting(true)
      await axios.delete(`${PROJECT_SERVICE_URL}/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      toast.success('Project deleted successfully')
      router.push('/projects')
    } catch (error) {
      toast.error('Failed to delete project')
      console.error('Error deleting project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Project</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please enter the verification code to confirm:
            <code className="block mt-2 p-2 bg-muted rounded text-center font-mono">
              {verificationCode}
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Enter verification code"
            value={hashCode}
            onChange={(e) => setHashCode(e.target.value)}
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || hashCode !== verificationCode}
            className="w-full"
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 