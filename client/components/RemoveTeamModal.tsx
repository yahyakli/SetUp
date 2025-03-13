import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import axios from 'axios'
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updateProject } from '@/lib/features/ProjectsSlice'

interface RemoveTeamModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  teamId: number
  teamName: string
  token: string
  verificationCode: string
}

export default function RemoveTeamModal({
  isOpen,
  onClose,
  projectId,
  teamId,
  teamName,
  token,
  verificationCode
}: RemoveTeamModalProps) {
  const [code, setCode] = useState('')
  const [isPending, setIsPending] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code !== verificationCode) {
      toast.error('Invalid verification code')
      return
    }

    setIsPending(true)
    try {
      const response = await axios.post(
        `${PROJECT_SERVICE_URL}/api/remove-team`,
        {
          project_id: projectId,
          team_id: teamId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 200) {
        dispatch(updateProject(response.data))
        toast.success('Team removed successfully')
        onClose()
      }
    } catch (error) {
      toast.error('Failed to remove team')
      console.error('Error removing team:', error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {teamName} from this project? 
            Enter the verification code to confirm.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Verification Code: <span className="font-mono">{verificationCode}</span>
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Removing..." : "Remove Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 